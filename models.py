from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, date

db = SQLAlchemy()

class BaseModel(db.Model):
    __abstract__ = True
    id = db.Column(db.Integer, primary_key=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Kelas(BaseModel):
    __tablename__ = 'kelas'
    nama = db.Column(db.String(50), nullable=False)
    tingkat = db.Column(db.String(10), nullable=False)
    jurusan = db.Column(db.String(50), nullable=False)
    wali_kelas = db.Column(db.String(100))
    kapasitas = db.Column(db.Integer, default=36)
    
    # Relationships
    siswa = db.relationship('Siswa', backref='kelas_ref', lazy=True)
    materi = db.relationship('Materi', backref='kelas_ref', lazy=True)

class Siswa(BaseModel):
    __tablename__ = 'siswa'
    nisn = db.Column(db.String(20), unique=True, nullable=False)
    nama = db.Column(db.String(100), nullable=False)
    kelas = db.Column(db.String(50), nullable=False)
    kelas_id = db.Column(db.Integer, db.ForeignKey('kelas.id'))
    jenis_kelamin = db.Column(db.String(1), default='L')
    tempat_lahir = db.Column(db.String(50))
    tanggal_lahir = db.Column(db.Date)
    alamat = db.Column(db.Text)
    telepon = db.Column(db.String(15))
    email = db.Column(db.String(100))
    
    # Relationships
    absensi = db.relationship('Absensi', backref='siswa', lazy=True)
    nilai_formatif = db.relationship('NilaiFormatif', backref='siswa', lazy=True)
    nilai_sumatif = db.relationship('NilaiSumatif', backref='siswa', lazy=True)

class Materi(BaseModel):
    __tablename__ = 'materi'
    judul = db.Column(db.String(200), nullable=False)
    kelas = db.Column(db.String(50), nullable=False)
    kelas_id = db.Column(db.Integer, db.ForeignKey('kelas.id'))
    kategori = db.Column(db.String(50), nullable=False)
    deskripsi = db.Column(db.Text)
    kompetensi_dasar = db.Column(db.Text)
    tingkat_kesulitan = db.Column(db.String(20), default='Sedang')
    estimasi_waktu = db.Column(db.Integer, default=2)

class Semester(BaseModel):
    __tablename__ = 'semester'
    tahun_ajaran = db.Column(db.String(20), nullable=False)
    semester = db.Column(db.String(10), nullable=False)
    tanggal_mulai = db.Column(db.Date, nullable=False)
    tanggal_selesai = db.Column(db.Date, nullable=False)
    status = db.Column(db.String(20), default='Nonaktif')
    minimal_kehadiran = db.Column(db.Integer, default=75)
    nilai_kkm = db.Column(db.Integer, default=75)

class Absensi(BaseModel):
    __tablename__ = 'absensi'
    siswa_id = db.Column(db.Integer, db.ForeignKey('siswa.id'), nullable=False)
    tanggal = db.Column(db.Date, nullable=False)
    status = db.Column(db.String(20), nullable=False)
    semester_id = db.Column(db.Integer, db.ForeignKey('semester.id'))

class NilaiFormatif(BaseModel):
    __tablename__ = 'nilai_formatif'
    siswa_id = db.Column(db.Integer, db.ForeignKey('siswa.id'), nullable=False)
    materi = db.Column(db.String(100), nullable=False)
    materi_id = db.Column(db.Integer, db.ForeignKey('materi.id'))
    tanggal = db.Column(db.Date, nullable=False)
    nilai = db.Column(db.Integer, nullable=False)
    semester_id = db.Column(db.Integer, db.ForeignKey('semester.id'))

class NilaiSumatif(BaseModel):
    __tablename__ = 'nilai_sumatif'
    siswa_id = db.Column(db.Integer, db.ForeignKey('siswa.id'), nullable=False)
    jenis = db.Column(db.String(10), nullable=False)
    tanggal = db.Column(db.Date, nullable=False)
    nilai = db.Column(db.Integer, nullable=False)
    semester_id = db.Column(db.Integer, db.ForeignKey('semester.id'))

class Jurnal(BaseModel):
    __tablename__ = 'jurnal'
    tanggal = db.Column(db.Date, nullable=False)
    kelas = db.Column(db.String(50), nullable=False)
    kelas_id = db.Column(db.Integer, db.ForeignKey('kelas.id'))
    mata_pelajaran = db.Column(db.String(50), nullable=False)
    materi = db.Column(db.String(100), nullable=False)
    materi_id = db.Column(db.Integer, db.ForeignKey('materi.id'))
    topik = db.Column(db.String(200), nullable=False)
    jam_ke = db.Column(db.String(10))
    durasi = db.Column(db.Integer, default=2)
    tujuan_pembelajaran = db.Column(db.Text)
    aktivitas_pembelajaran = db.Column(db.Text)
    media_sumber = db.Column(db.Text)
    jenis_penilaian = db.Column(db.String(50))
    tingkat_pemahaman = db.Column(db.String(50))
    catatan_khusus = db.Column(db.Text)
    tindak_lanjut = db.Column(db.Text)
    status = db.Column(db.String(20), default='Draft')
    tanda_tangan = db.Column(db.Boolean, default=False)
    semester_id = db.Column(db.Integer, db.ForeignKey('semester.id'))

class Pengguna(BaseModel):
    __tablename__ = 'pengguna'
    nama = db.Column(db.String(100), nullable=False)
    nip = db.Column(db.String(50))
    jabatan = db.Column(db.String(100))
    mata_pelajaran = db.Column(db.String(100))

class BobotNilai(BaseModel):
    __tablename__ = 'bobot_nilai'
    formatif = db.Column(db.Integer, default=25)
    uts = db.Column(db.Integer, default=25)
    uas = db.Column(db.Integer, default=30)
    absensi = db.Column(db.Integer, default=20)

class Legger(BaseModel):
    __tablename__ = 'legger'
    siswa_id = db.Column(db.Integer, db.ForeignKey('siswa.id'), nullable=False)
    semester_id = db.Column(db.Integer, db.ForeignKey('semester.id'), nullable=False)
    presentase_kehadiran = db.Column(db.Float, default=0)
    nilai_formatif = db.Column(db.Float, default=0)
    nilai_uts = db.Column(db.Float, default=0)
    nilai_uas = db.Column(db.Float, default=0)
    nilai_akhir = db.Column(db.Float, default=0)
    predikat = db.Column(db.String(10))