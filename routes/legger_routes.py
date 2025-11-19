from flask import Blueprint, request, jsonify
from models import db, Legger, Siswa, Semester, Absensi, NilaiFormatif, NilaiSumatif
from datetime import datetime
from sqlalchemy import func

legger_bp = Blueprint('legger', __name__)

@legger_bp.route('/legger', methods=['GET'])
def get_legger():
    try:
        kelas = request.args.get('kelas')
        semester_id = request.args.get('semester')
        
        if not kelas or not semester_id:
            return jsonify({'error': 'Parameter kelas dan semester diperlukan'}), 400
        
        # Get semester
        semester = Semester.query.get(semester_id)
        if not semester:
            return jsonify({'error': 'Semester tidak ditemukan'}), 404
        
        # Get siswa berdasarkan kelas
        siswa_list = Siswa.query.filter_by(kelas=kelas).all()
        
        if not siswa_list:
            return jsonify({'error': f'Tidak ada siswa di kelas {kelas}'}), 404
        
        legger_data = []
        
        for siswa in siswa_list:
            # Cari data legger yang sudah ada
            legger = Legger.query.filter_by(
                siswa_id=siswa.id,
                semester_id=semester_id
            ).first()
            
            # Jika belum ada legger, hitung dari data mentah
            if not legger:
                legger_data_item = calculate_legger_data(siswa.id, semester_id)
                legger_data.append(legger_data_item)
            else:
                legger_data.append({
                    'siswa_id': siswa.id,
                    'nama': siswa.nama,
                    'nisn': siswa.nisn,
                    'kelas': siswa.kelas,
                    'presentase_kehadiran': legger.presentase_kehadiran,
                    'nilai_formatif': legger.nilai_formatif,
                    'nilai_uts': legger.nilai_uts,
                    'nilai_uas': legger.nilai_uas,
                    'nilai_akhir': legger.nilai_akhir,
                    'predikat': legger.predikat
                })
        
        return jsonify(legger_data)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def calculate_legger_data(siswa_id, semester_id):
    """Hitung data legger dari data mentah"""
    siswa = Siswa.query.get(siswa_id)
    semester = Semester.query.get(semester_id)
    
    # Hitung presentase kehadiran
    total_pertemuan = Absensi.query.filter_by(
        semester_id=semester_id
    ).distinct(Absensi.tanggal).count()
    
    hadir_count = Absensi.query.filter_by(
        siswa_id=siswa_id,
        semester_id=semester_id,
        status='Hadir'
    ).count()
    
    presentase_kehadiran = (hadir_count / total_pertemuan * 100) if total_pertemuan > 0 else 0
    
    # Hitung nilai formatif (rata-rata semua nilai formatif)
    nilai_formatif_avg = db.session.query(
        func.avg(NilaiFormatif.nilai)
    ).filter_by(
        siswa_id=siswa_id,
        semester_id=semester_id
    ).scalar() or 0
    
    # Ambil nilai UTS
    nilai_uts = NilaiSumatif.query.filter_by(
        siswa_id=siswa_id,
        semester_id=semester_id,
        jenis='UTS'
    ).first()
    nilai_uts_value = nilai_uts.nilai if nilai_uts else 0
    
    # Ambil nilai UAS
    nilai_uas = NilaiSumatif.query.filter_by(
        siswa_id=siswa_id,
        semester_id=semester_id,
        jenis='UAS'
    ).first()
    nilai_uas_value = nilai_uas.nilai if nilai_uas else 0
    
    # Hitung nilai akhir berdasarkan bobot
    bobot = get_bobot_nilai()
    nilai_akhir = (
        (nilai_formatif_avg * bobot['formatif'] / 100) +
        (nilai_uts_value * bobot['uts'] / 100) +
        (nilai_uas_value * bobot['uas'] / 100) +
        (presentase_kehadiran * bobot['absensi'] / 100)
    )
    
    # Tentukan predikat
    predikat = calculate_predikat(nilai_akhir, semester.nilai_kkm)
    
    return {
        'siswa_id': siswa.id,
        'nama': siswa.nama,
        'nisn': siswa.nisn,
        'kelas': siswa.kelas,
        'presentase_kehadiran': round(presentase_kehadiran, 2),
        'nilai_formatif': round(nilai_formatif_avg, 2),
        'nilai_uts': nilai_uts_value,
        'nilai_uas': nilai_uas_value,
        'nilai_akhir': round(nilai_akhir, 2),
        'predikat': predikat
    }

def get_bobot_nilai():
    """Ambil bobot nilai dari database"""
    from models import BobotNilai
    bobot = BobotNilai.query.first()
    if bobot:
        return {
            'formatif': bobot.formatif,
            'uts': bobot.uts,
            'uas': bobot.uas,
            'absensi': bobot.absensi
        }
    else:
        # Default bobot
        return {
            'formatif': 25,
            'uts': 25,
            'uas': 30,
            'absensi': 20
        }

def calculate_predikat(nilai_akhir, kkm):
    """Hitung predikat berdasarkan nilai akhir dan KKM"""
    if nilai_akhir >= kkm + 15:
        return 'A'
    elif nilai_akhir >= kkm + 10:
        return 'B'
    elif nilai_akhir >= kkm + 5:
        return 'C'
    elif nilai_akhir >= kkm:
        return 'D'
    else:
        return 'E'

@legger_bp.route('/legger/generate', methods=['POST'])
def generate_legger():
    """Generate legger untuk semua siswa di kelas tertentu"""
    try:
        data = request.get_json()
        kelas = data.get('kelas')
        semester_id = data.get('semester_id')
        
        if not kelas or not semester_id:
            return jsonify({'error': 'Parameter kelas dan semester_id diperlukan'}), 400
        
        # Get semua siswa di kelas
        siswa_list = Siswa.query.filter_by(kelas=kelas).all()
        
        if not siswa_list:
            return jsonify({'error': f'Tidak ada siswa di kelas {kelas}'}), 404
        
        generated_count = 0
        
        for siswa in siswa_list:
            # Hitung data legger
            legger_data = calculate_legger_data(siswa.id, semester_id)
            
            # Cek apakah sudah ada legger
            existing_legger = Legger.query.filter_by(
                siswa_id=siswa.id,
                semester_id=semester_id
            ).first()
            
            if existing_legger:
                # Update legger yang sudah ada
                existing_legger.presentase_kehadiran = legger_data['presentase_kehadiran']
                existing_legger.nilai_formatif = legger_data['nilai_formatif']
                existing_legger.nilai_uts = legger_data['nilai_uts']
                existing_legger.nilai_uas = legger_data['nilai_uas']
                existing_legger.nilai_akhir = legger_data['nilai_akhir']
                existing_legger.predikat = legger_data['predikat']
                existing_legger.updated_at = datetime.utcnow()
            else:
                # Buat legger baru
                legger = Legger(
                    siswa_id=siswa.id,
                    semester_id=semester_id,
                    presentase_kehadiran=legger_data['presentase_kehadiran'],
                    nilai_formatif=legger_data['nilai_formatif'],
                    nilai_uts=legger_data['nilai_uts'],
                    nilai_uas=legger_data['nilai_uas'],
                    nilai_akhir=legger_data['nilai_akhir'],
                    predikat=legger_data['predikat']
                )
                db.session.add(legger)
            
            generated_count += 1
        
        db.session.commit()
        
        return jsonify({
            'message': f'Legger berhasil digenerate untuk {generated_count} siswa',
            'generated_count': generated_count
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@legger_bp.route('/legger/export', methods=['GET'])
def export_legger():
    """Export legger ke format CSV/Excel"""
    try:
        kelas = request.args.get('kelas')
        semester_id = request.args.get('semester')
        
        if not kelas or not semester_id:
            return jsonify({'error': 'Parameter kelas dan semester diperlukan'}), 400
        
        # Get data legger
        legger_data = get_legger_data_for_export(kelas, semester_id)
        
        # Untuk sekarang, return data JSON
        # Di production, bisa generate CSV/Excel file
        return jsonify({
            'message': 'Data siap untuk export',
            'data': legger_data,
            'total_records': len(legger_data)
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def get_legger_data_for_export(kelas, semester_id):
    """Ambil data legger untuk export"""
    siswa_list = Siswa.query.filter_by(kelas=kelas).all()
    semester = Semester.query.get(semester_id)
    
    export_data = []
    
    for siswa in siswa_list:
        legger_data = calculate_legger_data(siswa.id, semester_id)
        export_data.append({
            'NISN': siswa.nisn,
            'Nama Siswa': siswa.nama,
            'Kelas': siswa.kelas,
            'Presentase Kehadiran (%)': legger_data['presentase_kehadiran'],
            'Nilai Formatif': legger_data['nilai_formatif'],
            'Nilai UTS': legger_data['nilai_uts'],
            'Nilai UAS': legger_data['nilai_uas'],
            'Nilai Akhir': legger_data['nilai_akhir'],
            'Predikat': legger_data['predikat'],
            'KKM': semester.nilai_kkm if semester else 75
        })
    
    return export_data