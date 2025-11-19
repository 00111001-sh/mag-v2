from flask import Blueprint, jsonify
from models import db, Siswa, Kelas, Materi, Absensi, NilaiFormatif, Semester
from datetime import datetime, date
from sqlalchemy import func, case

dashboard_bp = Blueprint('dashboard', __name__)

@dashboard_bp.route('/dashboard')
def get_dashboard_data():
    try:
        # Get active semester
        active_semester = Semester.query.filter_by(status='Aktif').first()
        if not active_semester:
            return jsonify({'error': 'Tidak ada semester aktif'}), 400

        # Basic counts
        total_siswa = Siswa.query.count()
        total_kelas = Kelas.query.count()
        total_materi = Materi.query.count()

        # Calculate average attendance for current month - FIXED VERSION
        current_month = date.today().replace(day=1)
        
        # Cara yang lebih sederhana untuk menghitung presentase kehadiran
        total_absensi = Absensi.query.filter(
            Absensi.tanggal >= current_month,
            Absensi.semester_id == active_semester.id
        ).count()
        
        total_hadir = Absensi.query.filter(
            Absensi.tanggal >= current_month,
            Absensi.semester_id == active_semester.id,
            Absensi.status == 'Hadir'
        ).count()
        
        avg_attendance = (total_hadir / total_absensi * 100) if total_absensi > 0 else 0

        # Calculate average grades
        avg_nilai_query = db.session.query(
            func.avg(NilaiFormatif.nilai)
        ).filter(
            NilaiFormatif.semester_id == active_semester.id
        )
        
        avg_nilai = avg_nilai_query.scalar() or 0

        return jsonify({
            'total_siswa': total_siswa,
            'total_kelas': total_kelas,
            'total_materi': total_materi,
            'presentase_hadir': round(avg_attendance, 1),
            'avg_nilai': round(avg_nilai, 1),
            'nilai_harian': round(avg_nilai * 0.8 + 10, 1) if avg_nilai > 0 else 0,
            'predikat': get_predikat(avg_nilai)
        })
        
    except Exception as e:
        print(f"Dashboard error: {e}")  # Debug logging
        return jsonify({'error': str(e)}), 500

def get_predikat(nilai):
    if nilai >= 85:
        return 'A'
    elif nilai >= 75:
        return 'B'
    elif nilai >= 65:
        return 'C'
    else:
        return 'D'