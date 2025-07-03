import os
import stripe
import json
from flask import Blueprint, request, jsonify, current_app
from supabase import create_client, Client
from datetime import datetime, timedelta

# Initialize Stripe
stripe.api_key = os.getenv('STRIPE_SECRET_KEY')

# Initialize Supabase
supabase_url = os.getenv('SUPABASE_URL')
supabase_key = os.getenv('SUPABASE_SERVICE_KEY')
supabase: Client = create_client(supabase_url, supabase_key)

payments_bp = Blueprint('payments', __name__)

@payments_bp.route('/create-checkout-session', methods=['POST'])
def create_checkout_session():
    try:
        data = request.get_json()
        program_id = data.get('program_id')
        user_id = data.get('user_id')
        
        if not program_id or not user_id:
            return jsonify({'error': 'Missing required fields'}), 400

        # Get program details from Supabase
        program_response = supabase.table('programs').select('*').eq('id', program_id).single().execute()
        
        if not program_response.data:
            return jsonify({'error': 'Program not found'}), 404
            
        program = program_response.data

        # Create enrollment record
        enrollment_data = {
            'user_id': user_id,
            'program_id': program_id,
            'payment_amount': float(program['price']),
            'payment_status': 'pending',
            'enrolled_at': datetime.utcnow().isoformat()
        }
        
        enrollment_response = supabase.table('enrollments').insert(enrollment_data).execute()
        
        if not enrollment_response.data:
            return jsonify({'error': 'Failed to create enrollment'}), 500
            
        enrollment = enrollment_response.data[0]

        # Create Stripe checkout session
        checkout_session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[{
                'price_data': {
                    'currency': 'usd',
                    'product_data': {
                        'name': program['name'],
                        'description': program['description'],
                        'images': [program.get('featured_image_url')] if program.get('featured_image_url') else [],
                    },
                    'unit_amount': int(float(program['price']) * 100),  # Convert to cents
                },
                'quantity': 1,
            }],
            mode='payment',
            success_url=f"{request.headers.get('origin', 'http://localhost:5173')}/dashboard?session_id={{CHECKOUT_SESSION_ID}}",
            cancel_url=f"{request.headers.get('origin', 'http://localhost:5173')}/programs/{program['slug']}",
            metadata={
                'enrollment_id': enrollment['id'],
                'program_id': program_id,
                'user_id': user_id
            },
            customer_email=data.get('customer_email'),
            expires_at=int((datetime.utcnow() + timedelta(hours=24)).timestamp())
        )

        # Update enrollment with Stripe session ID
        supabase.table('enrollments').update({
            'stripe_payment_id': checkout_session.id
        }).eq('id', enrollment['id']).execute()

        return jsonify({
            'checkout_url': checkout_session.url,
            'session_id': checkout_session.id,
            'enrollment_id': enrollment['id']
        })

    except stripe.error.StripeError as e:
        return jsonify({'error': f'Stripe error: {str(e)}'}), 400
    except Exception as e:
        current_app.logger.error(f'Checkout session creation error: {str(e)}')
        return jsonify({'error': 'Internal server error'}), 500

@payments_bp.route('/webhook', methods=['POST'])
def stripe_webhook():
    payload = request.get_data(as_text=True)
    sig_header = request.headers.get('Stripe-Signature')
    endpoint_secret = os.getenv('STRIPE_WEBHOOK_SECRET')

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, endpoint_secret
        )
    except ValueError as e:
        current_app.logger.error(f'Invalid payload: {e}')
        return jsonify({'error': 'Invalid payload'}), 400
    except stripe.error.SignatureVerificationError as e:
        current_app.logger.error(f'Invalid signature: {e}')
        return jsonify({'error': 'Invalid signature'}), 400

    # Handle the event
    if event['type'] == 'checkout.session.completed':
        session = event['data']['object']
        handle_successful_payment(session)
    elif event['type'] == 'checkout.session.expired':
        session = event['data']['object']
        handle_expired_payment(session)
    elif event['type'] == 'payment_intent.payment_failed':
        payment_intent = event['data']['object']
        handle_failed_payment(payment_intent)
    else:
        current_app.logger.info(f'Unhandled event type: {event["type"]}')

    return jsonify({'status': 'success'})

def handle_successful_payment(session):
    """Handle successful payment completion"""
    try:
        enrollment_id = session['metadata'].get('enrollment_id')
        
        if not enrollment_id:
            current_app.logger.error('No enrollment_id in session metadata')
            return

        # Update enrollment status
        update_data = {
            'payment_status': 'completed',
            'stripe_payment_id': session['payment_intent'],
            'access_expires_at': (datetime.utcnow() + timedelta(days=365)).isoformat()  # 1 year access
        }
        
        supabase.table('enrollments').update(update_data).eq('id', enrollment_id).execute()

        # Create welcome notification
        enrollment_response = supabase.table('enrollments').select('user_id, program:programs(name)').eq('id', enrollment_id).single().execute()
        
        if enrollment_response.data:
            user_id = enrollment_response.data['user_id']
            program_name = enrollment_response.data['program']['name']
            
            notification_data = {
                'user_id': user_id,
                'title': 'Welcome to your program!',
                'message': f'You have successfully enrolled in {program_name}. Start your learning journey today!',
                'type': 'success',
                'category': 'course',
                'action_url': '/dashboard'
            }
            
            supabase.table('notifications').insert(notification_data).execute()

        current_app.logger.info(f'Successfully processed payment for enrollment {enrollment_id}')

    except Exception as e:
        current_app.logger.error(f'Error handling successful payment: {str(e)}')

def handle_expired_payment(session):
    """Handle expired payment session"""
    try:
        enrollment_id = session['metadata'].get('enrollment_id')
        
        if enrollment_id:
            supabase.table('enrollments').update({
                'payment_status': 'expired'
            }).eq('id', enrollment_id).execute()
            
        current_app.logger.info(f'Payment session expired for enrollment {enrollment_id}')

    except Exception as e:
        current_app.logger.error(f'Error handling expired payment: {str(e)}')

def handle_failed_payment(payment_intent):
    """Handle failed payment"""
    try:
        # Find enrollment by payment intent ID
        enrollment_response = supabase.table('enrollments').select('*').eq('stripe_payment_id', payment_intent['id']).execute()
        
        if enrollment_response.data:
            enrollment = enrollment_response.data[0]
            
            supabase.table('enrollments').update({
                'payment_status': 'failed'
            }).eq('id', enrollment['id']).execute()
            
            # Create failure notification
            notification_data = {
                'user_id': enrollment['user_id'],
                'title': 'Payment Failed',
                'message': 'Your payment could not be processed. Please try again or contact support.',
                'type': 'error',
                'category': 'payment'
            }
            
            supabase.table('notifications').insert(notification_data).execute()

        current_app.logger.info(f'Payment failed for payment intent {payment_intent["id"]}')

    except Exception as e:
        current_app.logger.error(f'Error handling failed payment: {str(e)}')

@payments_bp.route('/verify-payment/<session_id>', methods=['GET'])
def verify_payment(session_id):
    """Verify payment status for a checkout session"""
    try:
        session = stripe.checkout.Session.retrieve(session_id)
        
        enrollment_id = session.metadata.get('enrollment_id')
        
        if not enrollment_id:
            return jsonify({'error': 'Invalid session'}), 400

        # Get enrollment details
        enrollment_response = supabase.table('enrollments').select('*, program:programs(*)').eq('id', enrollment_id).single().execute()
        
        if not enrollment_response.data:
            return jsonify({'error': 'Enrollment not found'}), 404

        enrollment = enrollment_response.data

        return jsonify({
            'payment_status': session.payment_status,
            'enrollment': {
                'id': enrollment['id'],
                'program_name': enrollment['program']['name'],
                'payment_status': enrollment['payment_status'],
                'enrolled_at': enrollment['enrolled_at']
            }
        })

    except stripe.error.StripeError as e:
        return jsonify({'error': f'Stripe error: {str(e)}'}), 400
    except Exception as e:
        current_app.logger.error(f'Payment verification error: {str(e)}')
        return jsonify({'error': 'Internal server error'}), 500

@payments_bp.route('/enrollment-status/<enrollment_id>', methods=['GET'])
def get_enrollment_status(enrollment_id):
    """Get enrollment status and details"""
    try:
        enrollment_response = supabase.table('enrollments').select('*, program:programs(*)').eq('id', enrollment_id).single().execute()
        
        if not enrollment_response.data:
            return jsonify({'error': 'Enrollment not found'}), 404

        enrollment = enrollment_response.data

        return jsonify({
            'enrollment': {
                'id': enrollment['id'],
                'program': enrollment['program'],
                'payment_status': enrollment['payment_status'],
                'progress_percentage': enrollment['progress_percentage'],
                'enrolled_at': enrollment['enrolled_at'],
                'access_expires_at': enrollment['access_expires_at']
            }
        })

    except Exception as e:
        current_app.logger.error(f'Enrollment status error: {str(e)}')
        return jsonify({'error': 'Internal server error'}), 500

@payments_bp.route('/user-enrollments/<user_id>', methods=['GET'])
def get_user_enrollments(user_id):
    """Get all enrollments for a user"""
    try:
        enrollments_response = supabase.table('enrollments').select('*, program:programs(*)').eq('user_id', user_id).order('enrolled_at', desc=True).execute()

        return jsonify({
            'enrollments': enrollments_response.data or []
        })

    except Exception as e:
        current_app.logger.error(f'User enrollments error: {str(e)}')
        return jsonify({'error': 'Internal server error'}), 500

