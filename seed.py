from models import db, Kelas, Siswa, Materi, Semester, Pengguna, BobotNilai
from datetime import date

def seed_database():
    try:
        print("Starting database seeding...")
        
        # Create default kelas
        kelas_data = [
            {'nama': 'X IPA 1', 'tingkat': 'X', 'jurusan': 'IPA', 'wali_kelas': 'Dr. Surya Adi Putra, M.Pd', 'kapasitas': 36},
            {'nama': 'X IPA 2', 'tingkat': 'X', 'jurusan': 'IPA', 'wali_kelas': 'Drs. Ahmad Fauzi', 'kapasitas': 36},
            {'nama': 'XI IPA 1', 'tingkat': 'XI', 'jurusan': 'IPA', 'wali_kelas': 'Syafrul Hidayah, S.Pd., Gr.', 'kapasitas': 36},
        ]
        
        for data in kelas_data:
            if not Kelas.query.filter_by(nama=data['nama']).first():
                kelas = Kelas(**data)
                db.session.add(kelas)
                print(f"Created kelas: {data['nama']}")
        
        db.session.commit()
        
        # Get kelas objects for linking
        kelas_x_ipa_1 = Kelas.query.filter_by(nama='X IPA 1').first()
        kelas_x_ipa_2 = Kelas.query.filter_by(nama='X IPA 2').first()
        kelas_xi_ipa_1 = Kelas.query.filter_by(nama='XI IPA 1').first()
        
        # Create default siswa
        siswa_data = [
            {'nisn': '1234567890', 'nama': 'Ahmad Rizki', 'kelas': 'X IPA 1', 'kelas_id': kelas_x_ipa_1.id if kelas_x_ipa_1 else None, 'jenis_kelamin': 'L'},
            {'nisn': '1234567891', 'nama': 'Siti Nurhaliza', 'kelas': 'X IPA 1', 'kelas_id': kelas_x_ipa_1.id if kelas_x_ipa_1 else None, 'jenis_kelamin': 'P'},
            {'nisn': '1234567892', 'nama': 'Budi Santoso', 'kelas': 'X IPA 1', 'kelas_id': kelas_x_ipa_1.id if kelas_x_ipa_1 else None, 'jenis_kelamin': 'L'},
            {'nisn': '1234567893', 'nama': 'Dewi Lestari', 'kelas': 'X IPA 2', 'kelas_id': kelas_x_ipa_2.id if kelas_x_ipa_2 else None, 'jenis_kelamin': 'P'},
            {'nisn': '1234567894', 'nama': 'Rina Melati', 'kelas': 'X IPA 2', 'kelas_id': kelas_x_ipa_2.id if kelas_x_ipa_2 else None, 'jenis_kelamin': 'P'},
        ]
        
        for data in siswa_data:
            if not Siswa.query.filter_by(nisn=data['nisn']).first():
                siswa = Siswa(**data)
                db.session.add(siswa)
                print(f"Created siswa: {data['nama']}")
        
        db.session.commit()
        
        # Create default materi
        materi_data = [
            {'judul': 'Aljabar Dasar', 'kelas': 'X IPA 1', 'kelas_id': kelas_x_ipa_1.id if kelas_x_ipa_1 else None, 'kategori': 'Matematika', 'deskripsi': 'Dasar-dasar aljabar dan persamaan linear'},
            {'judul': 'Geometri Bangun Ruang', 'kelas': 'X IPA 1', 'kelas_id': kelas_x_ipa_1.id if kelas_x_ipa_1 else None, 'kategori': 'Matematika', 'deskripsi': 'Konsep bangun ruang dan volume'},
            {'judul': 'Listrik Statis', 'kelas': 'XI IPA 1', 'kelas_id': kelas_xi_ipa_1.id if kelas_xi_ipa_1 else None, 'kategori': 'Fisika', 'deskripsi': 'Konsep dasar listrik statis'},
        ]
        
        for data in materi_data:
            if not Materi.query.filter_by(judul=data['judul'], kelas=data['kelas']).first():
                materi = Materi(**data)
                db.session.add(materi)
                print(f"Created materi: {data['judul']}")
        
        db.session.commit()
        
        # Create active semester
        if not Semester.query.filter_by(status='Aktif').first():
            semester = Semester(
                tahun_ajaran='2023/2024',
                semester='2',
                tanggal_mulai=date(2024, 1, 8),
                tanggal_selesai=date(2024, 6, 15),
                status='Aktif',
                minimal_kehadiran=75,
                nilai_kkm=75
            )
            db.session.add(semester)
            print("Created active semester")
        
        db.session.commit()
        
        # Create default pengguna
        if not Pengguna.query.first():
            pengguna = Pengguna(
                nama='Syafrul Hidayah, S.Pd., Gr.',
                nip='19890903 202221 1 013',
                jabatan='Guru Kejuruan',
                mata_pelajaran='Konsentrasi Keahlian'
            )
            db.session.add(pengguna)
            print("Created default pengguna")
        
        # Create default bobot nilai
        if not BobotNilai.query.first():
            bobot = BobotNilai(
                formatif=25,
                uts=25,
                uas=30,
                absensi=20
            )
            db.session.add(bobot)
            print("Created default bobot nilai")
        
        db.session.commit()
        print("Database seeded successfully!")
        
    except Exception as e:
        db.session.rollback()
        print(f"Error seeding database: {e}")
        raise