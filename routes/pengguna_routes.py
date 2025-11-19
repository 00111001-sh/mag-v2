from flask import Blueprint, request, jsonify
from models import db, Pengguna, BobotNilai

pengguna_bp = Blueprint('pengguna', __name__)

@pengguna_bp.route('/pengguna', methods=['GET'])
def get_pengguna():
    try:
        pengguna = Pengguna.query.first()
        if not pengguna:
            # Create default pengguna
            pengguna = Pengguna(
                nama="Syafrul Hidayah, S.Pd., Gr.",
                nip="19890903 202221 1 013",
                jabatan="Guru Kejuruan",
                mata_pelajaran="Konsentrasi Keahlian"
            )
            db.session.add(pengguna)
            db.session.commit()
        
        return jsonify({
            'id': pengguna.id,
            'nama': pengguna.nama,
            'nip': pengguna.nip,
            'jabatan': pengguna.jabatan,
            'mata_pelajaran': pengguna.mata_pelajaran
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@pengguna_bp.route('/pengguna', methods=['PUT'])
def update_pengguna():
    try:
        pengguna = Pengguna.query.first()
        if not pengguna:
            pengguna = Pengguna()
            db.session.add(pengguna)
        
        data = request.get_json()
        pengguna.nama = data['nama']
        pengguna.nip = data['nip']
        pengguna.jabatan = data['jabatan']
        pengguna.mata_pelajaran = data['mata_pelajaran']
        
        db.session.commit()
        return jsonify({'message': 'Data pengguna berhasil diupdate'})
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@pengguna_bp.route('/bobot-nilai', methods=['GET'])
def get_bobot_nilai():
    try:
        bobot = BobotNilai.query.first()
        if not bobot:
            # Create default bobot nilai
            bobot = BobotNilai(
                formatif=25,
                uts=25,
                uas=30,
                absensi=20
            )
            db.session.add(bobot)
            db.session.commit()
        
        return jsonify({
            'id': bobot.id,
            'formatif': bobot.formatif,
            'uts': bobot.uts,
            'uas': bobot.uas,
            'absensi': bobot.absensi
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@pengguna_bp.route('/bobot-nilai', methods=['PUT'])
def update_bobot_nilai():
    try:
        bobot = BobotNilai.query.first()
        if not bobot:
            bobot = BobotNilai()
            db.session.add(bobot)
        
        data = request.get_json()
        
        # Validate total is 100
        total = data['formatif'] + data['uts'] + data['uas'] + data['absensi']
        if total != 100:
            return jsonify({'error': 'Total bobot harus 100%'}), 400
        
        bobot.formatif = data['formatif']
        bobot.uts = data['uts']
        bobot.uas = data['uas']
        bobot.absensi = data['absensi']
        
        db.session.commit()
        return jsonify({'message': 'Bobot nilai berhasil diupdate'})
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500