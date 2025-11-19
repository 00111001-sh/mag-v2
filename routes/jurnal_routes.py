from flask import Blueprint, request, jsonify
from models import db, Jurnal, Kelas, Materi, Semester
from datetime import datetime

jurnal_bp = Blueprint('jurnal', __name__)

@jurnal_bp.route('/jurnal', methods=['GET'])
def get_jurnal():
    try:
        kelas_filter = request.args.get('kelas', 'all')
        bulan_filter = request.args.get('bulan', 'all')
        tahun_filter = request.args.get('tahun', 'all')
        
        # Build query
        query = Jurnal.query
        
        # Apply filters
        if kelas_filter != 'all':
            query = query.filter(Jurnal.kelas == kelas_filter)
        
        if bulan_filter != 'all' and tahun_filter != 'all':
            # Filter by month and year
            query = query.filter(
                db.extract('month', Jurnal.tanggal) == int(bulan_filter),
                db.extract('year', Jurnal.tanggal) == int(tahun_filter)
            )
        
        # Order by tanggal descending (newest first)
        jurnal_list = query.order_by(Jurnal.tanggal.desc()).all()
        
        jurnal_data = []
        for jurnal in jurnal_list:
            jurnal_data.append({
                'id': jurnal.id,
                'tanggal': jurnal.tanggal.isoformat(),
                'kelas': jurnal.kelas,
                'mata_pelajaran': jurnal.mata_pelajaran,
                'materi': jurnal.materi,
                'topik': jurnal.topik,
                'jam_ke': jurnal.jam_ke,
                'durasi': jurnal.durasi,
                'tujuan_pembelajaran': jurnal.tujuan_pembelajaran,
                'aktivitas_pembelajaran': jurnal.aktivitas_pembelajaran,
                'media_sumber': jurnal.media_sumber,
                'jenis_penilaian': jurnal.jenis_penilaian,
                'tingkat_pemahaman': jurnal.tingkat_pemahaman,
                'catatan_khusus': jurnal.catatan_khusus,
                'tindak_lanjut': jurnal.tindak_lanjut,
                'status': jurnal.status,
                'tanda_tangan': jurnal.tanda_tangan,
                'created_at': jurnal.created_at.isoformat()
            })
        
        return jsonify(jurnal_data)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@jurnal_bp.route('/jurnal', methods=['POST'])
def create_jurnal():
    try:
        data = request.get_json()
        
        # Get active semester
        active_semester = Semester.query.filter_by(status='Aktif').first()
        if not active_semester:
            return jsonify({'error': 'Tidak ada semester aktif'}), 400
        
        # Cari kelas dan materi berdasarkan nama
        kelas_obj = Kelas.query.filter_by(nama=data['kelas']).first()
        materi_obj = Materi.query.filter_by(judul=data['materi']).first()
        
        jurnal = Jurnal(
            tanggal=datetime.strptime(data['tanggal'], '%Y-%m-%d').date(),
            kelas=data['kelas'],
            kelas_id=kelas_obj.id if kelas_obj else None,
            mata_pelajaran=data['mata_pelajaran'],
            materi=data['materi'],
            materi_id=materi_obj.id if materi_obj else None,
            topik=data['topik'],
            jam_ke=data.get('jam_ke'),
            durasi=data.get('durasi', 2),
            tujuan_pembelajaran=data.get('tujuan_pembelajaran'),
            aktivitas_pembelajaran=data.get('aktivitas_pembelajaran'),
            media_sumber=data.get('media_sumber'),
            jenis_penilaian=data.get('jenis_penilaian'),
            tingkat_pemahaman=data.get('tingkat_pemahaman'),
            catatan_khusus=data.get('catatan_khusus'),
            tindak_lanjut=data.get('tindak_lanjut'),
            status=data.get('status', 'Draft'),
            tanda_tangan=data.get('tanda_tangan', False),
            semester_id=active_semester.id
        )
        
        db.session.add(jurnal)
        db.session.commit()
        
        return jsonify({
            'message': 'Jurnal berhasil dibuat',
            'id': jurnal.id
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@jurnal_bp.route('/jurnal/<int:id>', methods=['PUT'])
def update_jurnal(id):
    try:
        data = request.get_json()
        jurnal = Jurnal.query.get_or_404(id)
        
        # Update fields
        if 'tanggal' in data:
            jurnal.tanggal = datetime.strptime(data['tanggal'], '%Y-%m-%d').date()
        if 'kelas' in data:
            jurnal.kelas = data['kelas']
            kelas_obj = Kelas.query.filter_by(nama=data['kelas']).first()
            jurnal.kelas_id = kelas_obj.id if kelas_obj else None
        if 'mata_pelajaran' in data:
            jurnal.mata_pelajaran = data['mata_pelajaran']
        if 'materi' in data:
            jurnal.materi = data['materi']
            materi_obj = Materi.query.filter_by(judul=data['materi']).first()
            jurnal.materi_id = materi_obj.id if materi_obj else None
        if 'topik' in data:
            jurnal.topik = data['topik']
        if 'jam_ke' in data:
            jurnal.jam_ke = data['jam_ke']
        if 'durasi' in data:
            jurnal.durasi = data['durasi']
        if 'tujuan_pembelajaran' in data:
            jurnal.tujuan_pembelajaran = data['tujuan_pembelajaran']
        if 'aktivitas_pembelajaran' in data:
            jurnal.aktivitas_pembelajaran = data['aktivitas_pembelajaran']
        if 'media_sumber' in data:
            jurnal.media_sumber = data['media_sumber']
        if 'jenis_penilaian' in data:
            jurnal.jenis_penilaian = data['jenis_penilaian']
        if 'tingkat_pemahaman' in data:
            jurnal.tingkat_pemahaman = data['tingkat_pemahaman']
        if 'catatan_khusus' in data:
            jurnal.catatan_khusus = data['catatan_khusus']
        if 'tindak_lanjut' in data:
            jurnal.tindak_lanjut = data['tindak_lanjut']
        if 'status' in data:
            jurnal.status = data['status']
        if 'tanda_tangan' in data:
            jurnal.tanda_tangan = data['tanda_tangan']
        
        jurnal.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({'message': 'Jurnal berhasil diperbarui'})
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@jurnal_bp.route('/jurnal/<int:id>', methods=['DELETE'])
def delete_jurnal(id):
    try:
        jurnal = Jurnal.query.get_or_404(id)
        db.session.delete(jurnal)
        db.session.commit()
        
        return jsonify({'message': 'Jurnal berhasil dihapus'})
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500