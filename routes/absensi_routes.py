from flask import Blueprint, request, jsonify
from models import db, Absensi, Siswa, Semester
from datetime import datetime

absensi_bp = Blueprint('absensi', __name__)

@absensi_bp.route('/absensi', methods=['GET'])
def get_absensi():
    try:
        kelas = request.args.get('kelas')
        tanggal_str = request.args.get('tanggal')
        
        if not kelas or not tanggal_str:
            return jsonify({'error': 'Parameter kelas dan tanggal diperlukan'}), 400
        
        tanggal = datetime.strptime(tanggal_str, '%Y-%m-%d').date()
        
        # Get active semester
        active_semester = Semester.query.filter_by(status='Aktif').first()
        if not active_semester:
            return jsonify({'error': 'Tidak ada semester aktif'}), 400
        
        # Get siswa berdasarkan kelas
        siswa_list = Siswa.query.filter_by(kelas=kelas).all()
        
        if not siswa_list:
            return jsonify({'error': f'Tidak ada siswa di kelas {kelas}'}), 404
        
        absensi_data = []
        
        for siswa in siswa_list:
            absensi = Absensi.query.filter_by(
                siswa_id=siswa.id, 
                tanggal=tanggal,
                semester_id=active_semester.id
            ).first()
            
            # Status default adalah 'Hadir' (bukan 'Belum')
            status = absensi.status if absensi else 'Hadir'
            
            absensi_data.append({
                'siswa_id': siswa.id,
                'nama': siswa.nama,
                'nisn': siswa.nisn,
                'kelas': siswa.kelas,
                'status': status
            })
        
        return jsonify(absensi_data)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@absensi_bp.route('/absensi', methods=['POST'])
def save_absensi():
    try:
        data = request.get_json()
        tanggal = datetime.strptime(data['tanggal'], '%Y-%m-%d').date()
        
        # Get active semester
        active_semester = Semester.query.filter_by(status='Aktif').first()
        if not active_semester:
            return jsonify({'error': 'Tidak ada semester aktif'}), 400
        
        for item in data['absensi']:
            absensi = Absensi.query.filter_by(
                siswa_id=item['siswa_id'],
                tanggal=tanggal,
                semester_id=active_semester.id
            ).first()
            
            if absensi:
                absensi.status = item['status']
                absensi.updated_at = datetime.utcnow()
            else:
                absensi = Absensi(
                    siswa_id=item['siswa_id'],
                    tanggal=tanggal,
                    status=item['status'],
                    semester_id=active_semester.id
                )
                db.session.add(absensi)
        
        db.session.commit()
        return jsonify({'message': 'Absensi berhasil disimpan'})
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@absensi_bp.route('/absensi/rekap', methods=['GET'])
def get_rekap_absensi():
    try:
        dari_tanggal = request.args.get('dari_tanggal')
        sampai_tanggal = request.args.get('sampai_tanggal')
        kelas = request.args.get('kelas', 'all')
        status = request.args.get('status', 'all')
        
        if not dari_tanggal or not sampai_tanggal:
            return jsonify({'error': 'Parameter periode diperlukan'}), 400
        
        # Convert to date objects
        dari = datetime.strptime(dari_tanggal, '%Y-%m-%d').date()
        sampai = datetime.strptime(sampai_tanggal, '%Y-%m-%d').date()
        
        # Get active semester
        active_semester = Semester.query.filter_by(status='Aktif').first()
        if not active_semester:
            return jsonify({'error': 'Tidak ada semester aktif'}), 400
        
        # Build query
        query = Absensi.query.filter(
            Absensi.tanggal.between(dari, sampai),
            Absensi.semester_id == active_semester.id
        ).join(Siswa)
        
        # Apply filters
        if kelas != 'all':
            query = query.filter(Siswa.kelas == kelas)
        
        if status != 'all':
            query = query.filter(Absensi.status == status)
        
        # Get data
        absensi_records = query.all()
        
        # Generate summary
        summary = {}
        for record in absensi_records:
            if record.status not in summary:
                summary[record.status] = 0
            summary[record.status] += 1
        
        # Prepare response data
        rekap_data = []
        for record in absensi_records:
            rekap_data.append({
                'tanggal': record.tanggal.isoformat(),
                'siswa_nama': record.siswa.nama,
                'siswa_nisn': record.siswa.nisn,
                'kelas': record.siswa.kelas,
                'status': record.status
            })
        
        return jsonify({
            'total_records': len(absensi_records),
            'summary': summary,
            'data': rekap_data,
            'periode': f'{dari_tanggal} s/d {sampai_tanggal}'
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500