from flask import Flask, render_template, jsonify
from models import db
from routes.kelas_routes import kelas_bp
from routes.siswa_routes import siswa_bp
from routes.materi_routes import materi_bp
from routes.semester_routes import semester_bp
from routes.absensi_routes import absensi_bp
from routes.nilai_routes import nilai_bp
from routes.jurnal_routes import jurnal_bp
from routes.pengguna_routes import pengguna_bp
from routes.dashboard_routes import dashboard_bp
from routes.legger_routes import legger_bp
from routes.database_routes import database_bp
import os

def create_app():
    app = Flask(__name__)
    # Ensure instance folder exists
    instance_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'instance')
    os.makedirs(instance_path, exist_ok=True)
    
    # Use absolute path for database (convert to forward slashes for SQLite URI)
    db_path = os.path.join(instance_path, 'database.db')
    # Convert Windows backslashes to forward slashes for SQLite URI
    db_path_uri = db_path.replace('\\', '/')
    app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{db_path_uri}'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SECRET_KEY'] = 'your-secret-key-here'

    # Initialize database
    db.init_app(app)

    # Register blueprints
    app.register_blueprint(kelas_bp, url_prefix='/api')
    app.register_blueprint(siswa_bp, url_prefix='/api')
    app.register_blueprint(materi_bp, url_prefix='/api')
    app.register_blueprint(semester_bp, url_prefix='/api')
    app.register_blueprint(absensi_bp, url_prefix='/api')
    app.register_blueprint(nilai_bp, url_prefix='/api')
    app.register_blueprint(jurnal_bp, url_prefix='/api')
    app.register_blueprint(pengguna_bp, url_prefix='/api')
    app.register_blueprint(dashboard_bp, url_prefix='/api')
    app.register_blueprint(legger_bp, url_prefix='/api')
    app.register_blueprint(database_bp, url_prefix='/api')

    @app.route('/')
    def index():
        return render_template('index.html')

    @app.route('/health')
    def health():
        return jsonify({'status': 'healthy', 'message': 'Sistem Administrasi Guru API'})

    return app

def init_database():
    """Initialize database with tables and seed data"""
    app = create_app()
    
    with app.app_context():
        try:
            # Ensure instance directory exists
            instance_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'instance')
            os.makedirs(instance_path, exist_ok=True)
            
            db_path = os.path.join(instance_path, 'database.db')
            
            # Check if database file exists and is valid
            if os.path.exists(db_path):
                try:
                    import sqlite3
                    test_conn = sqlite3.connect(db_path)
                    test_conn.execute('SELECT name FROM sqlite_master WHERE type="table" LIMIT 1')
                    test_conn.close()
                    print("Existing database file is valid")
                except (sqlite3.DatabaseError, sqlite3.OperationalError) as db_error:
                    print(f"Database file is corrupted: {db_error}")
                    print("Removing corrupted database file...")
                    try:
                        # Close all connections first
                        db.session.close()
                        db.engine.dispose()
                        import time
                        time.sleep(0.5)
                        # Remove corrupted file
                        os.remove(db_path)
                        print("Corrupted database file removed")
                    except Exception as remove_error:
                        print(f"Warning: Could not remove corrupted file: {remove_error}")
                        # Try to rename it instead
                        try:
                            corrupted_backup = db_path + '.corrupted'
                            if os.path.exists(corrupted_backup):
                                os.remove(corrupted_backup)
                            os.rename(db_path, corrupted_backup)
                            print(f"Corrupted database renamed to {corrupted_backup}")
                        except Exception as rename_error:
                            print(f"Error: Could not rename corrupted file: {rename_error}")
                            raise
            
            # Drop all tables and recreate
            try:
                db.drop_all()
            except Exception as drop_error:
                print(f"Warning: Could not drop tables (may not exist): {drop_error}")
            
            db.create_all()
            print("Database tables created successfully!")
            
            # Insert default data
            from seed import seed_database
            seed_database()
            print("Database seeded successfully!")
            
        except Exception as e:
            print(f"Error initializing database: {e}")
            import traceback
            traceback.print_exc()
            # If there's an error, try creating tables without seed data
            try:
                db.create_all()
                print("Database tables created (without seed data)")
            except Exception as e2:
                print(f"Critical error: {e2}")
                import traceback
                traceback.print_exc()
                raise

if __name__ == '__main__':
    # Initialize database first
    init_database()
    
    # Then run the app
    app = create_app()
    app.run(debug=True)