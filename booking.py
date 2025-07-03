from flask import Blueprint, jsonify, request
from src.models.user import db, User
from src.models.program import Program
from src.models.trainer import Trainer
from src.models.booking import Booking
from src.models.session import Session
from datetime import datetime, date, time, timedelta
from werkzeug.security import generate_password_hash
import json

booking_bp = Blueprint('booking', __name__)

@booking_bp.route('/bookings', methods=['GET'])
def get_bookings():
    """Get all bookings with optional filtering"""
    try:
        user_id = request.args.get('user_id')
        status = request.args.get('status')
        
        query = Booking.query
        
        if user_id:
            query = query.filter_by(user_id=user_id)
        if status:
            query = query.filter_by(booking_status=status)
            
        bookings = query.all()
        
        # Include related data
        booking_data = []
        for booking in bookings:
            booking_dict = booking.to_dict()
            booking_dict['user'] = booking.user.to_dict() if booking.user else None
            booking_dict['program'] = booking.program.to_dict() if booking.program else None
            booking_dict['trainer'] = booking.trainer.to_dict() if booking.trainer else None
            booking_dict['sessions'] = [session.to_dict() for session in booking.sessions]
            booking_data.append(booking_dict)
        
        return jsonify({
            'success': True,
            'bookings': booking_data
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@booking_bp.route('/bookings/<int:booking_id>', methods=['GET'])
def get_booking(booking_id):
    """Get a specific booking by ID"""
    try:
        booking = Booking.query.get_or_404(booking_id)
        
        booking_dict = booking.to_dict()
        booking_dict['user'] = booking.user.to_dict() if booking.user else None
        booking_dict['program'] = booking.program.to_dict() if booking.program else None
        booking_dict['trainer'] = booking.trainer.to_dict() if booking.trainer else None
        booking_dict['sessions'] = [session.to_dict() for session in booking.sessions]
        
        return jsonify({
            'success': True,
            'booking': booking_dict
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@booking_bp.route('/bookings', methods=['POST'])
def create_booking():
    """Create a new booking"""
    try:
        data = request.get_json()
        
        # Check if this is a client booking (with client info) or user booking (with user_id)
        if 'client_name' in data and 'client_email' in data:
            # Handle client booking - create or find user
            client_email = data['client_email']
            client_name = data['client_name']
            client_phone = data.get('client_phone', '')
            
            # Check if user already exists with this email
            user = User.query.filter_by(email=client_email).first()
            
            if not user:
                # Split client name into first and last name
                name_parts = client_name.strip().split(' ', 1)
                first_name = name_parts[0]
                last_name = name_parts[1] if len(name_parts) > 1 else ''
                
                # Generate a username from email
                username = client_email.split('@')[0]
                
                # Check if username already exists, if so, add a number
                base_username = username
                counter = 1
                while User.query.filter_by(username=username).first():
                    username = f"{base_username}{counter}"
                    counter += 1
                
                # Create new user from client information
                user = User(
                    username=username,
                    first_name=first_name,
                    last_name=last_name,
                    email=client_email,
                    phone=client_phone,
                    company=data.get('company', ''),
                    position=data.get('position', ''),
                    password_hash=generate_password_hash('temp_password_123')  # Temporary password
                )
                db.session.add(user)
                db.session.flush()  # Get the user ID
            
            user_id = user.id
            
        elif 'user_id' in data:
            # Handle existing user booking
            user_id = data['user_id']
            user = User.query.get(user_id)
            if not user:
                return jsonify({
                    'success': False,
                    'error': 'User not found'
                }), 404
        else:
            return jsonify({
                'success': False,
                'error': 'Either user_id or client information (client_name, client_email) is required'
            }), 400
        
        # Validate required fields
        required_fields = ['program_id', 'start_date', 'end_date']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'success': False,
                    'error': f'Missing required field: {field}'
                }), 400
            
        # Validate program exists
        program = Program.query.get(data['program_id'])
        if not program:
            return jsonify({
                'success': False,
                'error': 'Program not found'
            }), 404
        
        # Validate trainer if provided
        trainer_id = data.get('trainer_id')
        if trainer_id:
            trainer = Trainer.query.get(trainer_id)
            if not trainer:
                return jsonify({
                    'success': False,
                    'error': 'Trainer not found'
                }), 404
        
        # Parse dates
        start_date = datetime.strptime(data['start_date'], '%Y-%m-%d').date()
        end_date = datetime.strptime(data['end_date'], '%Y-%m-%d').date()
        
        # Create booking
        booking = Booking(
            user_id=user_id,
            program_id=data['program_id'],
            trainer_id=trainer_id,
            start_date=start_date,
            end_date=end_date,
            total_amount=data.get('total_amount', program.price),
            special_requirements=data.get('special_requirements'),
            payment_method=data.get('payment_method')
        )
        
        db.session.add(booking)
        db.session.flush()  # Get the booking ID
        
        # Create sessions based on program type
        if program.program_type == 'intensive':
            # For intensive programs, create daily sessions
            current_date = start_date
            while current_date <= end_date:
                session = Session(
                    booking_id=booking.id,
                    session_date=current_date,
                    start_time=time(9, 0),  # 9:00 AM
                    end_time=time(17, 0),   # 5:00 PM
                    session_type='group',
                    location=data.get('location', 'TBD')
                )
                db.session.add(session)
                current_date += timedelta(days=1)
        
        elif program.program_type == 'ongoing':
            # For ongoing programs like RLAB, create weekly sessions
            current_date = start_date
            session_count = 0
            max_sessions = 12  # 90 days / 7 days per week ≈ 12 sessions
            
            while current_date <= end_date and session_count < max_sessions:
                session = Session(
                    booking_id=booking.id,
                    session_date=current_date,
                    start_time=time(14, 0),  # 2:00 PM
                    end_time=time(16, 0),    # 4:00 PM
                    session_type='group',
                    location=data.get('location', 'TBD')
                )
                db.session.add(session)
                current_date += timedelta(days=7)  # Weekly sessions
                session_count += 1
        
        db.session.commit()
        
        # Return booking with related data
        booking_dict = booking.to_dict()
        booking_dict['user'] = user.to_dict()
        booking_dict['program'] = booking.program.to_dict()
        booking_dict['trainer'] = booking.trainer.to_dict() if booking.trainer else None
        booking_dict['sessions'] = [session.to_dict() for session in booking.sessions]
        
        return jsonify({
            'success': True,
            'booking': booking_dict,
            'message': 'Booking created successfully'
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@booking_bp.route('/bookings/<int:booking_id>', methods=['PUT'])
def update_booking(booking_id):
    """Update a booking"""
    try:
        booking = Booking.query.get_or_404(booking_id)
        data = request.get_json()
        
        # Update booking fields
        if 'payment_status' in data:
            booking.payment_status = data['payment_status']
        if 'booking_status' in data:
            booking.booking_status = data['booking_status']
        if 'special_requirements' in data:
            booking.special_requirements = data['special_requirements']
        if 'payment_reference' in data:
            booking.payment_reference = data['payment_reference']
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'booking': booking.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@booking_bp.route('/bookings/<int:booking_id>/cancel', methods=['POST'])
def cancel_booking(booking_id):
    """Cancel a booking"""
    try:
        booking = Booking.query.get_or_404(booking_id)
        
        booking.booking_status = 'cancelled'
        
        # Cancel all associated sessions
        for session in booking.sessions:
            session.status = 'cancelled'
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Booking cancelled successfully'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@booking_bp.route('/availability', methods=['GET'])
def check_availability():
    """Check availability for a program on specific dates"""
    try:
        program_id = request.args.get('program_id')
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        
        if not all([program_id, start_date, end_date]):
            return jsonify({
                'success': False,
                'error': 'Missing required parameters: program_id, start_date, end_date'
            }), 400
        
        program = Program.query.get_or_404(program_id)
        
        # Parse dates
        start_date = datetime.strptime(start_date, '%Y-%m-%d').date()
        end_date = datetime.strptime(end_date, '%Y-%m-%d').date()
        
        # Check for conflicting bookings
        conflicting_bookings = Booking.query.filter(
            Booking.program_id == program_id,
            Booking.booking_status.in_(['confirmed', 'paid']),
            Booking.start_date <= end_date,
            Booking.end_date >= start_date
        ).count()
        
        available_spots = program.max_participants - conflicting_bookings
        is_available = available_spots > 0
        
        return jsonify({
            'success': True,
            'available': is_available,
            'available_spots': max(0, available_spots),
            'max_participants': program.max_participants
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

