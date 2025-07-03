from flask import Blueprint, jsonify, request
from src.models.user import db
from src.models.program import Program

program_bp = Blueprint('program', __name__)

@program_bp.route('/programs', methods=['GET'])
def get_programs():
    """Get all active programs"""
    try:
        programs = Program.query.filter_by(is_active=True).all()
        return jsonify({
            'success': True,
            'programs': [program.to_dict() for program in programs]
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@program_bp.route('/programs/<int:program_id>', methods=['GET'])
def get_program(program_id):
    """Get a specific program by ID"""
    try:
        program = Program.query.get_or_404(program_id)
        return jsonify({
            'success': True,
            'program': program.to_dict()
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@program_bp.route('/programs', methods=['POST'])
def create_program():
    """Create a new program"""
    try:
        data = request.get_json()
        
        program = Program(
            name=data['name'],
            short_name=data['short_name'],
            description=data['description'],
            duration_days=data['duration_days'],
            price=data['price'],
            program_type=data['program_type'],
            max_participants=data.get('max_participants', 20)
        )
        
        db.session.add(program)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'program': program.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@program_bp.route('/programs/<int:program_id>', methods=['PUT'])
def update_program(program_id):
    """Update a program"""
    try:
        program = Program.query.get_or_404(program_id)
        data = request.get_json()
        
        program.name = data.get('name', program.name)
        program.short_name = data.get('short_name', program.short_name)
        program.description = data.get('description', program.description)
        program.duration_days = data.get('duration_days', program.duration_days)
        program.price = data.get('price', program.price)
        program.program_type = data.get('program_type', program.program_type)
        program.max_participants = data.get('max_participants', program.max_participants)
        program.is_active = data.get('is_active', program.is_active)
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'program': program.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

