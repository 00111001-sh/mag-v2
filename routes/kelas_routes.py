from flask import Blueprint, request, jsonify
from models import db, Kelas

kelas_bp = Blueprint('kelas', __name__)

@kelas_bp.route('/kelas', methods=['GET'])
def get_kelas():
    try:
        kelas_list = Kelas.query.all()
        return jsonify([{
            'id': k.id,
            'nama': k.nama,
            'tingkat': k.tingkat,
            'jurusan': k.jurusan,
            'wali_kelas': k.wali_kelas,
            'kapasitas': k.kapasitas,
            'total_siswa': len(k.siswa)
        } for k in kelas_list])
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@kelas_bp.route('/kelas', methods=['POST'])
def create_kelas():
    try:
        data = request.get_json()
        
        kelas = Kelas(
            nama=data['nama'],
            tingkat=data['tingkat'],
            jurusan=data['jurusan'],
            wali_kelas=data.get('wali_kelas', ''),
            kapasitas=data.get('kapasitas', 36)
        )
        
        db.session.add(kelas)
        db.session.commit()
        
        return jsonify({
            'message': 'Kelas berhasil ditambahkan',
            'id': kelas.id
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@kelas_bp.route('/kelas/<int:id>', methods=['GET'])
def get_kelas_by_id(id):
    try:
        kelas = Kelas.query.get_or_404(id)
        return jsonify({
            'id': kelas.id,
            'nama': kelas.nama,
            'tingkat': kelas.tingkat,
            'jurusan': kelas.jurusan,
            'wali_kelas': kelas.wali_kelas,
            'kapasitas': kelas.kapasitas
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@kelas_bp.route('/kelas/<int:id>', methods=['PUT'])
def update_kelas(id):
    try:
        kelas = Kelas.query.get_or_404(id)
        data = request.get_json()
        
        kelas.nama = data['nama']
        kelas.tingkat = data['tingkat']
        kelas.jurusan = data['jurusan']
        kelas.wali_kelas = data.get('wali_kelas', '')
        kelas.kapasitas = data.get('kapasitas', 36)
        
        db.session.commit()
        
        return jsonify({'message': 'Kelas berhasil diupdate'})
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@kelas_bp.route('/kelas/<int:id>', methods=['DELETE'])
def delete_kelas(id):
    try:
        kelas = Kelas.query.get_or_404(id)
        
        # Cek apakah kelas memiliki siswa
        if len(kelas.siswa) > 0:
            return jsonify({
                'error': 'Tidak dapat menghapus kelas yang masih memiliki siswa'
            }), 400
        
        db.session.delete(kelas)
        db.session.commit()
        
        return jsonify({'message': 'Kelas berhasil dihapus'})
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500