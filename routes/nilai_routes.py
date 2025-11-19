from flask import Blueprint, request, jsonify
from models import db, NilaiFormatif, NilaiSumatif, Siswa, Materi, Semester
from datetime import datetime

nilai_bp = Blueprint('nilai', __name__)

# === NILAI FORMATIF ===

@nilai_bp.route('/nilai/formatif', methods=['GET'])
def get_nilai_formatif():
    try:
        kelas = request.args.get('kelas')
        materi = request.args.get('materi')
        tanggal_str = request.args.get('tanggal')
        
        if not kelas or not materi:
            return jsonify({'error': 'Parameter kelas dan materi diperlukan'}), 400
        
        # Get active semester
        active_semester = Semester.query.filter_by(status='Aktif').first()
        if not active_semester:
            return jsonify({'error': 'Tidak ada semester aktif'}), 400
        
        # Get siswa berdasarkan kelas
        siswa_list = Siswa.query.filter_by(kelas=kelas).all()
        
        if not siswa_list:
            return jsonify({'error': f'Tidak ada siswa di kelas {kelas}'}), 404
        
        nilai_data = []
        
        for siswa in siswa_list:
            # Cari nilai formatif yang sudah ada
            nilai = NilaiFormatif.query.filter_by(
                siswa_id=siswa.id,
                materi=materi,
                semester_id=active_semester.id
            ).first()
            
            # Jika ada tanggal filter, apply filter tanggal
            if tanggal_str:
                tanggal = datetime.strptime(tanggal_str, '%Y-%m-%d').date()
                if nilai and nilai.tanggal != tanggal:
                    nilai = None
            
            nilai_data.append({
                'siswa_id': siswa.id,
                'nama': siswa.nama,
                'nisn': siswa.nisn,
                'kelas': siswa.kelas,
                'nilai': nilai.nilai if nilai else 0,
                'materi': materi,
                'tanggal': nilai.tanggal.isoformat() if nilai else tanggal_str
            })
        
        return jsonify(nilai_data)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@nilai_bp.route('/nilai/formatif', methods=['POST'])
def save_nilai_formatif():
    try:
        data = request.get_json()
        
        # Get active semester
        active_semester = Semester.query.filter_by(status='Aktif').first()
        if not active_semester:
            return jsonify({'error': 'Tidak ada semester aktif'}), 400
        
        for item in data['nilai']:
            # Cari materi berdasarkan nama
            materi_obj = Materi.query.filter_by(judul=item['materi']).first()
            
            nilai = NilaiFormatif.query.filter_by(
                siswa_id=item['siswa_id'],
                materi=item['materi'],
                semester_id=active_semester.id
            ).first()
            
            if nilai:
                # Update nilai yang sudah ada
                nilai.nilai = item['nilai']
                nilai.tanggal = datetime.strptime(data['tanggal'], '%Y-%m-%d').date()
                nilai.materi_id = materi_obj.id if materi_obj else None
                nilai.updated_at = datetime.utcnow()
            else:
                # Buat nilai baru
                nilai = NilaiFormatif(
                    siswa_id=item['siswa_id'],
                    materi=item['materi'],
                    materi_id=materi_obj.id if materi_obj else None,
                    tanggal=datetime.strptime(data['tanggal'], '%Y-%m-%d').date(),
                    nilai=item['nilai'],
                    semester_id=active_semester.id
                )
                db.session.add(nilai)
        
        db.session.commit()
        return jsonify({'message': 'Nilai formatif berhasil disimpan'})
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# === NILAI SUMATIF ===

@nilai_bp.route('/nilai/sumatif', methods=['GET'])
def get_nilai_sumatif():
    try:
        jenis = request.args.get('jenis')  # UTS atau UAS
        kelas = request.args.get('kelas')
        tanggal_str = request.args.get('tanggal')
        
        if not jenis or not kelas:
            return jsonify({'error': 'Parameter jenis dan kelas diperlukan'}), 400
        
        # Get active semester
        active_semester = Semester.query.filter_by(status='Aktif').first()
        if not active_semester:
            return jsonify({'error': 'Tidak ada semester aktif'}), 400
        
        # Get siswa berdasarkan kelas
        siswa_list = Siswa.query.filter_by(kelas=kelas).all()
        
        if not siswa_list:
            return jsonify({'error': f'Tidak ada siswa di kelas {kelas}'}), 404
        
        nilai_data = []
        
        for siswa in siswa_list:
            # Cari nilai sumatif yang sudah ada
            nilai = NilaiSumatif.query.filter_by(
                siswa_id=siswa.id,
                jenis=jenis,
                semester_id=active_semester.id
            ).first()
            
            # Jika ada tanggal filter, apply filter tanggal
            if tanggal_str:
                tanggal = datetime.strptime(tanggal_str, '%Y-%m-%d').date()
                if nilai and nilai.tanggal != tanggal:
                    nilai = None
            
            nilai_data.append({
                'siswa_id': siswa.id,
                'nama': siswa.nama,
                'nisn': siswa.nisn,
                'kelas': siswa.kelas,
                'nilai': nilai.nilai if nilai else 0,
                'jenis': jenis,
                'tanggal': nilai.tanggal.isoformat() if nilai else tanggal_str
            })
        
        return jsonify(nilai_data)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@nilai_bp.route('/nilai/sumatif', methods=['POST'])
def save_nilai_sumatif():
    try:
        data = request.get_json()
        
        # Get active semester
        active_semester = Semester.query.filter_by(status='Aktif').first()
        if not active_semester:
            return jsonify({'error': 'Tidak ada semester aktif'}), 400
        
        for item in data['nilai']:
            nilai = NilaiSumatif.query.filter_by(
                siswa_id=item['siswa_id'],
                jenis=item['jenis'],
                semester_id=active_semester.id
            ).first()
            
            if nilai:
                # Update nilai yang sudah ada
                nilai.nilai = item['nilai']
                nilai.tanggal = datetime.strptime(data['tanggal'], '%Y-%m-%d').date()
                nilai.updated_at = datetime.utcnow()
            else:
                # Buat nilai baru
                nilai = NilaiSumatif(
                    siswa_id=item['siswa_id'],
                    jenis=item['jenis'],
                    tanggal=datetime.strptime(data['tanggal'], '%Y-%m-%d').date(),
                    nilai=item['nilai'],
                    semester_id=active_semester.id
                )
                db.session.add(nilai)
        
        db.session.commit()
        return jsonify({'message': 'Nilai sumatif berhasil disimpan'})
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500