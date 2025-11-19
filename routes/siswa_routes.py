from flask import Blueprint, request, jsonify
from models import db, Siswa, Kelas
from datetime import datetime

siswa_bp = Blueprint('siswa', __name__)

@siswa_bp.route('/siswa', methods=['GET'])
def get_siswa():
    try:
        kelas_filter = request.args.get('kelas', 'all')
        query = Siswa.query
        
        if kelas_filter != 'all':
            query = query.filter_by(kelas=kelas_filter)
            
        siswa_list = query.all()
        
        return jsonify([{
            'id': s.id,
            'nisn': s.nisn,
            'nama': s.nama,
            'kelas': s.kelas,
            'jenis_kelamin': s.jenis_kelamin,
            'tempat_lahir': s.tempat_lahir,
            'tanggal_lahir': s.tanggal_lahir.isoformat() if s.tanggal_lahir else None,
            'alamat': s.alamat,
            'telepon': s.telepon,
            'email': s.email
        } for s in siswa_list])
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@siswa_bp.route('/siswa', methods=['POST'])
def create_siswa():
    try:
        data = request.get_json()
        
        # Cek duplikasi NISN
        existing_siswa = Siswa.query.filter_by(nisn=data['nisn']).first()
        if existing_siswa:
            return jsonify({'error': 'NISN sudah terdaftar'}), 400
        
        # Convert tanggal_lahir string to date object if provided
        tanggal_lahir = None
        if data.get('tanggal_lahir'):
            try:
                if isinstance(data['tanggal_lahir'], str):
                    tanggal_lahir = datetime.strptime(data['tanggal_lahir'], '%Y-%m-%d').date()
                else:
                    tanggal_lahir = data['tanggal_lahir']
            except ValueError:
                return jsonify({'error': 'Format tanggal lahir tidak valid. Gunakan format YYYY-MM-DD'}), 400
        
        # Get kelas_id if kelas name is provided
        kelas_id = None
        if data.get('kelas'):
            kelas_obj = Kelas.query.filter_by(nama=data['kelas']).first()
            kelas_id = kelas_obj.id if kelas_obj else None
        
        siswa = Siswa(
            nisn=data['nisn'],
            nama=data['nama'],
            kelas=data['kelas'],
            kelas_id=kelas_id,
            jenis_kelamin=data.get('jenis_kelamin', 'L'),
            tempat_lahir=data.get('tempat_lahir', ''),
            tanggal_lahir=tanggal_lahir,
            alamat=data.get('alamat', ''),
            telepon=data.get('telepon', ''),
            email=data.get('email', '')
        )
        
        db.session.add(siswa)
        db.session.commit()
        
        return jsonify({
            'message': 'Siswa berhasil ditambahkan',
            'id': siswa.id
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@siswa_bp.route('/siswa/<int:id>', methods=['GET'])
def get_siswa_by_id(id):
    try:
        siswa = Siswa.query.get_or_404(id)
        return jsonify({
            'id': siswa.id,
            'nisn': siswa.nisn,
            'nama': siswa.nama,
            'kelas': siswa.kelas,
            'jenis_kelamin': siswa.jenis_kelamin,
            'tempat_lahir': siswa.tempat_lahir,
            'tanggal_lahir': siswa.tanggal_lahir.isoformat() if siswa.tanggal_lahir else None,
            'alamat': siswa.alamat,
            'telepon': siswa.telepon,
            'email': siswa.email
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@siswa_bp.route('/siswa/<int:id>', methods=['PUT'])
def update_siswa(id):
    try:
        siswa = Siswa.query.get_or_404(id)
        data = request.get_json()
        
        # Cek duplikasi NISN (kecuali untuk siswa yang sama)
        if data['nisn'] != siswa.nisn:
            existing_siswa = Siswa.query.filter_by(nisn=data['nisn']).first()
            if existing_siswa:
                return jsonify({'error': 'NISN sudah terdaftar'}), 400
        
        # Convert tanggal_lahir string to date object if provided
        tanggal_lahir = None
        if data.get('tanggal_lahir'):
            try:
                if isinstance(data['tanggal_lahir'], str):
                    tanggal_lahir = datetime.strptime(data['tanggal_lahir'], '%Y-%m-%d').date()
                else:
                    tanggal_lahir = data['tanggal_lahir']
            except ValueError:
                return jsonify({'error': 'Format tanggal lahir tidak valid. Gunakan format YYYY-MM-DD'}), 400
        
        # Get kelas_id if kelas name is provided
        kelas_id = None
        if data.get('kelas'):
            kelas_obj = Kelas.query.filter_by(nama=data['kelas']).first()
            kelas_id = kelas_obj.id if kelas_obj else None
        
        siswa.nisn = data['nisn']
        siswa.nama = data['nama']
        siswa.kelas = data['kelas']
        siswa.kelas_id = kelas_id
        siswa.jenis_kelamin = data.get('jenis_kelamin', 'L')
        siswa.tempat_lahir = data.get('tempat_lahir', '')
        siswa.tanggal_lahir = tanggal_lahir
        siswa.alamat = data.get('alamat', '')
        siswa.telepon = data.get('telepon', '')
        siswa.email = data.get('email', '')
        
        db.session.commit()
        
        return jsonify({'message': 'Siswa berhasil diupdate'})
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@siswa_bp.route('/siswa/<int:id>', methods=['DELETE'])
def delete_siswa(id):
    try:
        siswa = Siswa.query.get_or_404(id)
        
        db.session.delete(siswa)
        db.session.commit()
        
        return jsonify({'message': 'Siswa berhasil dihapus'})
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500