from flask import Blueprint, request, jsonify
from models import db, Semester
from datetime import datetime

semester_bp = Blueprint('semester', __name__)

@semester_bp.route('/semester', methods=['GET'])
def get_semester():
    try:
        semester_list = Semester.query.all()
        return jsonify([{
            'id': s.id,
            'tahun_ajaran': s.tahun_ajaran,
            'semester': s.semester,
            'tanggal_mulai': s.tanggal_mulai.isoformat(),
            'tanggal_selesai': s.tanggal_selesai.isoformat(),
            'status': s.status,
            'minimal_kehadiran': s.minimal_kehadiran,
            'nilai_kkm': s.nilai_kkm
        } for s in semester_list])
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@semester_bp.route('/semester', methods=['POST'])
def create_semester():
    try:
        data = request.get_json()
        
        # If setting as active, deactivate all other semesters
        if data.get('status') == 'Aktif':
            Semester.query.update({'status': 'Nonaktif'})
        
        semester = Semester(
            tahun_ajaran=data['tahun_ajaran'],
            semester=data['semester'],
            tanggal_mulai=datetime.strptime(data['tanggal_mulai'], '%Y-%m-%d').date(),
            tanggal_selesai=datetime.strptime(data['tanggal_selesai'], '%Y-%m-%d').date(),
            status=data.get('status', 'Nonaktif'),
            minimal_kehadiran=data.get('minimal_kehadiran', 75),
            nilai_kkm=data.get('nilai_kkm', 75)
        )
        
        db.session.add(semester)
        db.session.commit()
        
        return jsonify({
            'message': 'Semester berhasil ditambahkan',
            'id': semester.id
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@semester_bp.route('/semester/<int:id>', methods=['PUT'])
def update_semester(id):
    try:
        semester = Semester.query.get_or_404(id)
        data = request.get_json()
        
        # If setting as active, deactivate all other semesters
        if data.get('status') == 'Aktif' and semester.status != 'Aktif':
            Semester.query.update({'status': 'Nonaktif'})
        
        semester.tahun_ajaran = data['tahun_ajaran']
        semester.semester = data['semester']
        semester.tanggal_mulai = datetime.strptime(data['tanggal_mulai'], '%Y-%m-%d').date()
        semester.tanggal_selesai = datetime.strptime(data['tanggal_selesai'], '%Y-%m-%d').date()
        semester.status = data.get('status', 'Nonaktif')
        semester.minimal_kehadiran = data.get('minimal_kehadiran', 75)
        semester.nilai_kkm = data.get('nilai_kkm', 75)
        
        db.session.commit()
        
        return jsonify({'message': 'Semester berhasil diupdate'})
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@semester_bp.route('/semester/<int:id>', methods=['DELETE'])
def delete_semester(id):
    try:
        semester = Semester.query.get_or_404(id)
        
        # Prevent deletion of active semester
        if semester.status == 'Aktif':
            return jsonify({'error': 'Tidak dapat menghapus semester aktif'}), 400
        
        db.session.delete(semester)
        db.session.commit()
        
        return jsonify({'message': 'Semester berhasil dihapus'})
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@semester_bp.route('/semester/<int:id>/activate', methods=['PUT'])
def activate_semester(id):
    try:
        # Deactivate all semesters
        Semester.query.update({'status': 'Nonaktif'})
        
        # Activate the selected semester
        semester = Semester.query.get_or_404(id)
        semester.status = 'Aktif'
        
        db.session.commit()
        
        return jsonify({'message': 'Semester berhasil diaktifkan'})
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500