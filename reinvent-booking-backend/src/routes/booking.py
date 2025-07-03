from flask import Blueprint, request, jsonify
from src.models.user import db, User
from src.models.booking import Booking
from src.models.program import Program
from src.models.trainer import Trainer
from src.models.session import Session
from datetime import datetime, date, time
import json

booking_bp = Blueprint('booking', __name__)

@booking_bp.route('/bookings', methods=['GET'])
def get_bookings():
    """Get all bookings with optional filtering"""
    try:
        # Get query parameters for filtering
        status = request.args.get('status')
        user_id = request.args.get('user_id')
        program_id = request.args.get('program_id')
        
        query = Booking.query
        
        if status:
            query = query.filter_by(status=status)
        if user_id:
            query = query.filter_by(user_id=user_id)
        if program_id:
            query = query.filter_by(program_id=program_id)
            
        bookings = query.all()
        
        # Include related data
        result = []
        for booking in bookings:
            booking_dict = booking.to_dict()
            booking_dict['program'] = booking.program.to_dict() if booking.program else None
            booking_dict['trainer'] = booking.trainer.to_dict() if booking.trainer else None
            booking_dict['user'] = booking.user.to_dict() if booking.user else None
            result.append(booking_dict)
        
        return jsonify(result), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@booking_bp.route('/bookings/<int:booking_id>', methods=['GET'])
def get_booking(booking_id):
    """Get a specific booking by ID"""
    try:
        booking = Booking.query.get_or_404(booking_id)
        booking_dict = booking.to_dict()
        
        # Include related data
        booking_dict['program'] = booking.program.to_dict() if booking.program else None
        booking_dict['trainer'] = booking.trainer.to_dict() if booking.trainer else None
        booking_dict['user'] = booking.user.to_dict() if booking.user else None
        booking_dict['sessions'] = [session.to_dict() for session in booking.sessions]
        
        return jsonify(booking_dict), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@booking_bp.route('/bookings', methods=['POST'])
def create_booking():
    """Create a new booking"""
    try:
        data = request.get_json()
        
        # Check if user exists, create if not
        user = User.query.filter_by(email=data['client_email']).first()
        if not user:
            user = User(
                username=data['client_email'],
                email=data['client_email']
            )
            db.session.add(user)
            db.session.flush()  # Get the user ID
        
        # Parse dates
        start_date = datetime.strptime(data['start_date'], '%Y-%m-%d').date()
        end_date = datetime.strptime(data['end_date'], '%Y-%m-%d').date()
        start_time_obj = None
        if data.get('start_time'):
            start_time_obj = datetime.strptime(data['start_time'], '%H:%M').time()
        
        booking = Booking(
            user_id=user.id,
            program_id=data['program_id'],
            trainer_id=data.get('trainer_id'),
            start_date=start_date,
            end_date=end_date,
            start_time=start_time_obj,
            client_name=data['client_name'],
            client_email=data['client_email'],
            client_phone=data['client_phone'],
            company=data.get('company', ''),
            position=data.get('position', ''),
            special_requirements=data.get('special_requirements', ''),
            total_amount=data['total_amount']
        )
        
        db.session.add(booking)
        db.session.commit()
        
        return jsonify(booking.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@booking_bp.route('/bookings/<int:booking_id>', methods=['PUT'])
def update_booking(booking_id):
    """Update a booking"""
    try:
        booking = Booking.query.get_or_404(booking_id)
        data = request.get_json()
        
        # Update fields if provided
        if 'start_date' in data:
            booking.start_date = datetime.strptime(data['start_date'], '%Y-%m-%d').date()
        if 'end_date' in data:
            booking.end_date = datetime.strptime(data['end_date'], '%Y-%m-%d').date()
        if 'start_time' in data and data['start_time']:
            booking.start_time = datetime.strptime(data['start_time'], '%H:%M').time()
        
        booking.trainer_id = data.get('trainer_id', booking.trainer_id)
        booking.client_name = data.get('client_name', booking.client_name)
        booking.client_phone = data.get('client_phone', booking.client_phone)
        booking.company = data.get('company', booking.company)
        booking.position = data.get('position', booking.position)
        booking.special_requirements = data.get('special_requirements', booking.special_requirements)
        booking.status = data.get('status', booking.status)
        booking.payment_status = data.get('payment_status', booking.payment_status)
        booking.total_amount = data.get('total_amount', booking.total_amount)
        
        db.session.commit()
        
        return jsonify(booking.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@booking_bp.route('/bookings/<int:booking_id>/cancel', methods=['POST'])
def cancel_booking(booking_id):
    """Cancel a booking"""
    try:
        booking = Booking.query.get_or_404(booking_id)
        booking.status = 'cancelled'
        db.session.commit()
        
        return jsonify({'message': 'Booking cancelled successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@booking_bp.route('/bookings/<int:booking_id>/confirm', methods=['POST'])
def confirm_booking(booking_id):
    """Confirm a booking"""
    try:
        booking = Booking.query.get_or_404(booking_id)
        booking.status = 'confirmed'
        db.session.commit()
        
        return jsonify({'message': 'Booking confirmed successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@booking_bp.route('/availability', methods=['GET'])
def check_availability():
    """Check availability for a specific date range and program"""
    try:
        program_id = request.args.get('program_id')
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        
        if not all([program_id, start_date, end_date]):
            return jsonify({'error': 'Missing required parameters'}), 400
        
        # Parse dates
        start_date_obj = datetime.strptime(start_date, '%Y-%m-%d').date()
        end_date_obj = datetime.strptime(end_date, '%Y-%m-%d').date()
        
        # Check for conflicting bookings
        conflicting_bookings = Booking.query.filter(
            Booking.program_id == program_id,
            Booking.status.in_(['pending', 'confirmed']),
            Booking.start_date <= end_date_obj,
            Booking.end_date >= start_date_obj
        ).all()
        
        # Get program details
        program = Program.query.get(program_id)
        if not program:
            return jsonify({'error': 'Program not found'}), 404
        
        # Calculate current participants
        current_participants = len(conflicting_bookings)
        available_spots = program.max_participants - current_participants
        
        return jsonify({
            'available': available_spots > 0,
            'available_spots': available_spots,
            'max_participants': program.max_participants,
            'current_participants': current_participants
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

