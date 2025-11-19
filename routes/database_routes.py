from flask import Blueprint, request, jsonify, send_file
from models import db, Kelas, Siswa, Materi, Semester, Absensi, NilaiFormatif, NilaiSumatif, Jurnal, Pengguna, BobotNilai, Legger
from sqlalchemy import text
import os
import shutil
from datetime import datetime

database_bp = Blueprint('database', __name__)

@database_bp.route('/database/info', methods=['GET'])
def get_database_info():
    try:
        # Count records
        total_kelas = Kelas.query.count()
        total_siswa = Siswa.query.count()
        total_materi = Materi.query.count()
        total_semester = Semester.query.count()
        total_absensi = Absensi.query.count()
        total_nilai_formatif = NilaiFormatif.query.count()
        total_nilai_sumatif = NilaiSumatif.query.count()
        total_jurnal = Jurnal.query.count()
        
        total_records = (
            total_kelas + total_siswa + total_materi + total_semester +
            total_absensi + total_nilai_formatif + total_nilai_sumatif + total_jurnal
        )
        
        # Get database file size (use absolute path)
        base_dir = os.path.dirname(os.path.abspath(__file__))
        instance_path = os.path.join(base_dir, '..', 'instance')
        instance_path = os.path.abspath(instance_path)
        db_path = os.path.join(instance_path, 'database.db')
        if os.path.exists(db_path):
            db_size = os.path.getsize(db_path)
            db_size_mb = round(db_size / (1024 * 1024), 2)
        else:
            db_size_mb = 0
        
        # Get last backup time (if backup folder exists)
        backup_folder = os.path.join(instance_path, 'backups')
        last_backup = None
        if os.path.exists(backup_folder):
            backups = [f for f in os.listdir(backup_folder) if f.endswith('.db')]
            if backups:
                latest_backup = max(backups, key=lambda f: os.path.getmtime(os.path.join(backup_folder, f)))
                last_backup_time = os.path.getmtime(os.path.join(backup_folder, latest_backup))
                last_backup = datetime.fromtimestamp(last_backup_time).isoformat()
        
        return jsonify({
            'total_records': total_records,
            'db_size_mb': db_size_mb,
            'last_backup': last_backup,
            'breakdown': {
                'kelas': total_kelas,
                'siswa': total_siswa,
                'materi': total_materi,
                'semester': total_semester,
                'absensi': total_absensi,
                'nilai_formatif': total_nilai_formatif,
                'nilai_sumatif': total_nilai_sumatif,
                'jurnal': total_jurnal
            }
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@database_bp.route('/database/backup', methods=['POST'])
def backup_database():
    try:
        # Use absolute paths
        base_dir = os.path.dirname(os.path.abspath(__file__))
        instance_path = os.path.join(base_dir, '..', 'instance')
        instance_path = os.path.abspath(instance_path)
        
        # Create backups directory if it doesn't exist
        backup_folder = os.path.join(instance_path, 'backups')
        os.makedirs(backup_folder, exist_ok=True)
        
        # Source database path
        db_path = os.path.join(instance_path, 'database.db')
        if not os.path.exists(db_path):
            return jsonify({'error': 'Database file not found'}), 404
        
        # Create backup filename with timestamp
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        backup_filename = f'database_backup_{timestamp}.db'
        backup_path = os.path.join(backup_folder, backup_filename)
        
        # Copy database file
        shutil.copy2(db_path, backup_path)
        
        # Return the backup file for download
        return send_file(
            backup_path,
            as_attachment=True,
            download_name=backup_filename,
            mimetype='application/x-sqlite3'
        )
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@database_bp.route('/database/restore', methods=['POST'])
def restore_database():
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        # Check file extension
        if not file.filename.lower().endswith('.db'):
            return jsonify({'error': 'File must be a .db (SQLite database) file'}), 400
        
        # Use absolute paths
        base_dir = os.path.dirname(os.path.abspath(__file__))
        instance_path = os.path.join(base_dir, '..', 'instance')
        instance_path = os.path.abspath(instance_path)
        os.makedirs(instance_path, exist_ok=True)
        
        # Save uploaded file temporarily
        temp_path = os.path.join(instance_path, 'temp_restore.db')
        file.save(temp_path)
        
        # Verify it's a valid SQLite database
        if not os.path.exists(temp_path) or os.path.getsize(temp_path) == 0:
            if os.path.exists(temp_path):
                os.remove(temp_path)
            return jsonify({'error': 'Invalid database file'}), 400
        
        # Try to verify it's a valid SQLite database by attempting to open it
        import sqlite3
        try:
            test_conn = sqlite3.connect(temp_path)
            test_conn.execute('SELECT name FROM sqlite_master WHERE type="table" LIMIT 1')
            test_conn.close()
        except sqlite3.DatabaseError:
            os.remove(temp_path)
            return jsonify({'error': 'File is not a valid SQLite database'}), 400
        
        # Close all database connections before replacing the file
        db.session.close()
        db.engine.dispose()
        
        # Backup current database first
        db_path = os.path.join(instance_path, 'database.db')
        pre_restore_backup = None
        if os.path.exists(db_path):
            backup_folder = os.path.join(instance_path, 'backups')
            os.makedirs(backup_folder, exist_ok=True)
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            pre_restore_backup = os.path.join(backup_folder, f'pre_restore_{timestamp}.db')
            shutil.copy2(db_path, pre_restore_backup)
        
        # Replace database file
        # First, ensure all connections are closed
        db.session.remove()
        db.engine.dispose()
        
        # Wait a moment to ensure all file handles are released
        import time
        time.sleep(0.5)
        
        # Replace database file
        if os.path.exists(db_path):
            try:
                os.remove(db_path)
            except PermissionError:
                # If file is locked, try to rename it first
                old_db_path = db_path + '.old'
                if os.path.exists(old_db_path):
                    os.remove(old_db_path)
                os.rename(db_path, old_db_path)
                os.remove(old_db_path)
        
        shutil.copy2(temp_path, db_path)
        
        # Remove temp file
        if os.path.exists(temp_path):
            os.remove(temp_path)
        
        # Force SQLAlchemy to reconnect by clearing the connection pool
        db.engine.dispose()
        
        # Verify the restored database is accessible
        try:
            # Test connection to new database
            with db.engine.connect() as test_conn:
                test_conn.execute(text('SELECT 1'))
        except Exception as verify_error:
            return jsonify({
                'error': f'Database restored but verification failed: {str(verify_error)}'
            }), 500
        
        return jsonify({
            'message': 'Database berhasil di-restore',
            'pre_restore_backup': os.path.basename(pre_restore_backup) if pre_restore_backup else None
        })
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@database_bp.route('/database/optimize', methods=['POST'])
def optimize_database():
    try:
        # SQLite VACUUM command to optimize database
        # Use absolute path
        instance_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'instance')
        instance_path = os.path.abspath(instance_path)
        db_path = os.path.join(instance_path, 'database.db')
        
        if not os.path.exists(db_path):
            return jsonify({'error': 'Database file not found'}), 404
        
        # Execute VACUUM using SQLAlchemy
        # VACUUM is a special SQLite command that doesn't need commit
        with db.engine.begin() as conn:
            conn.execute(text('VACUUM'))
        
        return jsonify({'message': 'Database berhasil dioptimalkan'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@database_bp.route('/database/reset', methods=['POST'])
def reset_database():
    try:
        # Backup current database first
        db_path = os.path.join('instance', 'database.db')
        if os.path.exists(db_path):
            backup_folder = os.path.join('instance', 'backups')
            os.makedirs(backup_folder, exist_ok=True)
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            pre_reset_backup = os.path.join(backup_folder, f'pre_reset_{timestamp}.db')
            shutil.copy2(db_path, pre_reset_backup)
        
        # Drop all tables and recreate
        db.drop_all()
        db.create_all()
        
        # Seed with default data
        from seed import seed_database
        seed_database()
        
        return jsonify({
            'message': 'Database berhasil di-reset dan di-seed dengan data default',
            'pre_reset_backup': pre_reset_backup if os.path.exists(db_path) else None
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

