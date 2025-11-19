from flask import Blueprint, request, jsonify
from models import db, Materi

materi_bp = Blueprint('materi', __name__)

@materi_bp.route('/materi', methods=['GET'])
def get_materi():
    try:
        materi_list = Materi.query.all()
        return jsonify([{
            'id': m.id,
            'judul': m.judul,
            'kelas': m.kelas,
            'kategori': m.kategori,
            'deskripsi': m.deskripsi,
            'kompetensi_dasar': m.kompetensi_dasar,
            'tingkat_kesulitan': m.tingkat_kesulitan,
            'estimasi_waktu': m.estimasi_waktu
        } for m in materi_list])
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@materi_bp.route('/materi', methods=['POST'])
def create_materi():
    try:
        data = request.get_json()
        
        materi = Materi(
            judul=data['judul'],
            kelas=data['kelas'],
            kategori=data['kategori'],
            deskripsi=data.get('deskripsi', ''),
            kompetensi_dasar=data.get('kompetensi_dasar', ''),
            tingkat_kesulitan=data.get('tingkat_kesulitan', 'Sedang'),
            estimasi_waktu=data.get('estimasi_waktu', 2)
        )
        
        db.session.add(materi)
        db.session.commit()
        
        return jsonify({
            'message': 'Materi berhasil ditambahkan',
            'id': materi.id
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@materi_bp.route('/materi/<int:id>', methods=['GET'])
def get_materi_by_id(id):
    try:
        materi = Materi.query.get_or_404(id)
        return jsonify({
            'id': materi.id,
            'judul': materi.judul,
            'kelas': materi.kelas,
            'kategori': materi.kategori,
            'deskripsi': materi.deskripsi,
            'kompetensi_dasar': materi.kompetensi_dasar,
            'tingkat_kesulitan': materi.tingkat_kesulitan,
            'estimasi_waktu': materi.estimasi_waktu
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@materi_bp.route('/materi/<int:id>', methods=['PUT'])
def update_materi(id):
    try:
        materi = Materi.query.get_or_404(id)
        data = request.get_json()
        
        materi.judul = data['judul']
        materi.kelas = data['kelas']
        materi.kategori = data['kategori']
        materi.deskripsi = data.get('deskripsi', '')
        materi.kompetensi_dasar = data.get('kompetensi_dasar', '')
        materi.tingkat_kesulitan = data.get('tingkat_kesulitan', 'Sedang')
        materi.estimasi_waktu = data.get('estimasi_waktu', 2)
        
        db.session.commit()
        
        return jsonify({'message': 'Materi berhasil diupdate'})
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@materi_bp.route('/materi/<int:id>', methods=['DELETE'])
def delete_materi(id):
    try:
        materi = Materi.query.get_or_404(id)
        
        db.session.delete(materi)
        db.session.commit()
        
        return jsonify({'message': 'Materi berhasil dihapus'})
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500