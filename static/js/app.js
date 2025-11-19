// Main Application File - Non-module version
class GuruApp {
    constructor() {
        this.modules = {};
    }

    init() {
        console.log('Initializing GuruApp...');
        
        // Initialize all modules
        this.modules.api = new API();
        this.modules.ui = new UI();
        this.modules.theme = new Theme();
        this.modules.dashboard = new Dashboard();
        this.modules.kelas = new KelasManager();
        this.modules.siswa = new SiswaManager();
        this.modules.materi = new MateriManager();
        this.modules.semester = new SemesterManager();
        this.modules.absensi = new AbsensiManager();
        this.modules.nilai = new NilaiManager();
        this.modules.jurnal = new JurnalManager();
        this.modules.legger = new LeggerManager();
        this.modules.database = new DatabaseManager();

        // Setup event listeners
        this.setupEventListeners();
        
        // Load initial data
        this.loadInitialData();
        
        console.log('Sistem Administrasi Guru initialized');
    }

    setupEventListeners() {
        console.log('Setting up event listeners...');
        
        // Ribbon tab switching
        const ribbonTabs = document.querySelectorAll('.ribbon-tab');
        console.log('Found ribbon tabs:', ribbonTabs.length);
        
        ribbonTabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                e.preventDefault();
                const targetTab = e.currentTarget.getAttribute('data-tab');
                console.log('Tab clicked:', targetTab);
                this.showContent(targetTab);
            });
        });

        // Theme button
        const themeBtn = document.getElementById('themeBtn');
        if (themeBtn) {
            themeBtn.addEventListener('click', () => {
                console.log('Theme button clicked');
                this.showDialog('themeSelectorDialog');
            });
        } else {
            console.error('Theme button not found!');
        }

        // Ribbon show/hide
        const ribbonBtn = document.getElementById('showRibbonBtn');
        if (ribbonBtn) {
            ribbonBtn.addEventListener('click', () => {
                console.log('Ribbon toggle clicked');
                this.modules.ui.toggleRibbon();
            });
        } else {
            console.error('Ribbon button not found!');
        }

        console.log('Event listeners setup completed');
    }

    showContent(contentId) {
        if (this.modules.ui) {
            this.modules.ui.showContent(contentId);
        }
    }

    // TAMBAHKAN METHOD INI
    showDialog(dialogId) {
        if (this.modules.ui) {
            this.modules.ui.showDialog(dialogId);
        }
    }

    // TAMBAHKAN METHOD INI JUGA
    closeDialog(dialogId) {
        if (this.modules.ui) {
            this.modules.ui.closeDialog(dialogId);
        }
    }

    loadInitialData() {
        // Load essential data
        if (this.modules.kelas) this.modules.kelas.loadData();
        if (this.modules.siswa) this.modules.siswa.loadData();
        if (this.modules.materi) this.modules.materi.loadData();
        if (this.modules.semester) this.modules.semester.loadData();
        if (this.modules.dashboard) this.modules.dashboard.loadData();
        if (this.modules.absensi) {
            this.modules.absensi.initDefaults();
        }
        if (this.modules.nilai) {
            this.modules.nilai.initDefaults();
        }
        if (this.modules.jurnal) {
            this.modules.jurnal.initDefaults();
        }
        if (this.modules.legger) {
            this.modules.legger.initDefaults();
        }
    }

    // Helper method for notifications
    showNotification(message, type = 'info') {
        if (this.modules && this.modules.ui) {
            this.modules.ui.showNotification(message, type);
        }
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded, creating app instance...');
    window.app = new GuruApp();
    window.app.init();
});

// Global functions for HTML onclick handlers
window.showDialog = (dialogId) => window.app?.showDialog(dialogId);
window.closeDialog = (dialogId) => window.app?.closeDialog(dialogId);
window.showNotification = (message, type) => window.app?.showNotification(message, type);

// Theme functions
window.selectTheme = (themeName) => {
    if (window.app && window.app.modules.theme) {
        window.app.modules.theme.selectTheme(themeName);
    }
};

window.applySelectedTheme = () => {
    if (window.app && window.app.modules.theme) {
        window.app.modules.theme.applySelectedTheme();
    }
};

window.resetToDefaultTheme = () => {
    if (window.app && window.app.modules.theme) {
        window.app.modules.theme.resetToDefaultTheme();
    }
};

window.randomTheme = () => {
    if (window.app && window.app.modules.theme) {
        window.app.modules.theme.randomTheme();
    }
};

// Tambahkan fungsi global untuk form handlers
window.tambahKelas = function() {
    const dialog = document.getElementById('tambahKelasDialog');
    const isEditMode = dialog?.getAttribute('data-edit-mode') === 'true';
    const editId = dialog?.getAttribute('data-edit-id');
    
    const nama = document.getElementById('namaKelas').value;
    const tingkat = document.getElementById('tingkatKelas').value;
    const jurusan = document.getElementById('jurusanKelas').value;
    const waliKelas = document.getElementById('waliKelas').value;
    const kapasitas = document.getElementById('kapasitasKelas').value;

    if (nama && tingkat && jurusan) {
        const data = {
            nama: nama,
            tingkat: tingkat,
            jurusan: jurusan,
            wali_kelas: waliKelas,
            kapasitas: parseInt(kapasitas) || 36
        };
        
        if (isEditMode && editId) {
            window.app.modules.kelas.update(parseInt(editId), data).then(() => {
                // Reset dialog mode
                if (dialog) {
                    dialog.removeAttribute('data-edit-mode');
                    dialog.removeAttribute('data-edit-id');
                    const header = dialog.querySelector('.dialog-header h3');
                    if (header) header.textContent = 'Tambah Kelas';
                }
                window.app.modules.kelas.resetForm();
                window.app.modules.ui.closeDialog('tambahKelasDialog');
            });
        } else {
            window.app.modules.kelas.create(data);
        }
    } else {
        if (window.app && window.app.modules && window.app.modules.ui) {
            window.app.modules.ui.showNotification('Harap isi semua field!', 'error');
        } else {
            alert('Harap isi semua field!');
        }
    }
};

window.tambahSiswa = function() {
    const nisn = document.getElementById('nisnSiswa').value;
    const nama = document.getElementById('namaSiswa').value;
    const kelas = document.getElementById('kelasSiswa').value;
    const jenisKelamin = document.getElementById('jenisKelaminSiswa').value;
    const tempatLahir = document.getElementById('tempatLahirSiswa').value;
    const tanggalLahir = document.getElementById('tanggalLahirSiswa').value;
    const alamat = document.getElementById('alamatSiswa').value;
    const telepon = document.getElementById('teleponSiswa').value;
    const email = document.getElementById('emailSiswa').value;

    if (nisn && nama && kelas) {
        window.app.modules.siswa.create({
            nisn: nisn,
            nama: nama,
            kelas: kelas,
            jenis_kelamin: jenisKelamin,
            tempat_lahir: tempatLahir,
            tanggal_lahir: tanggalLahir,
            alamat: alamat,
            telepon: telepon,
            email: email
        });
    } else {
        if (window.app && window.app.modules && window.app.modules.ui) {
            window.app.modules.ui.showNotification('Harap isi semua field yang diperlukan!', 'error');
        }
    }
};

window.tambahMateri = function() {
    const judul = document.getElementById('judulMateri').value;
    const kelas = document.getElementById('kelasMateri').value;
    const kategori = document.getElementById('kategoriMateri').value;
    const deskripsi = document.getElementById('deskripsiMateri').value;
    const kompetensi = document.getElementById('kompetensiMateri').value;
    const kesulitan = document.getElementById('kesulitanMateri').value;
    const waktu = document.getElementById('waktuMateri').value;

    if (judul && kelas && kategori) {
        window.app.modules.materi.create({
            judul: judul,
            kelas: kelas,
            kategori: kategori,
            deskripsi: deskripsi,
            kompetensi_dasar: kompetensi,
            tingkat_kesulitan: kesulitan,
            estimasi_waktu: parseInt(waktu) || 2
        });
    } else {
        if (window.app && window.app.modules && window.app.modules.ui) {
            window.app.modules.ui.showNotification('Harap isi semua field yang diperlukan!', 'error');
        }
    }
};

window.tambahSemester = function() {
    const tahunAjaran = document.getElementById('tahunAjaran').value;
    const semester = document.getElementById('semester').value;
    const tanggalMulai = document.getElementById('tanggalMulai').value;
    const tanggalSelesai = document.getElementById('tanggalSelesai').value;
    const status = document.getElementById('statusSemester').value;
    const minimalKehadiran = document.getElementById('minimalKehadiran').value;
    const nilaiKKM = document.getElementById('nilaiKKM').value;

    if (tahunAjaran && semester && tanggalMulai && tanggalSelesai) {
        window.app.modules.semester.create({
            tahun_ajaran: tahunAjaran,
            semester: semester,
            tanggal_mulai: tanggalMulai,
            tanggal_selesai: tanggalSelesai,
            status: status,
            minimal_kehadiran: parseInt(minimalKehadiran),
            nilai_kkm: parseInt(nilaiKKM)
        });
    } else {
        if (window.app && window.app.modules && window.app.modules.ui) {
            window.app.modules.ui.showNotification('Harap isi semua field!', 'error');
        }
    }
};

// Absensi functions - GLOBAL FUNCTIONS FOR HTML ONCLICK
window.loadAbsensi = function() {
    if (window.app && window.app.modules.absensi) {
        window.app.modules.absensi.loadData();
    } else {
        console.error('Absensi module not available');
    }
};

window.resetAbsensi = function() {
    if (window.app && window.app.modules.absensi) {
        window.app.modules.absensi.resetAbsensi();
    }
};

window.exportRekapAbsensi = function() {
    if (window.app && window.app.modules.absensi) {
        window.app.modules.absensi.exportRekap();
    }
};

window.generateRekapAbsensi = function() {
    if (window.app && window.app.modules.absensi) {
        window.app.modules.absensi.generateRekap();
    }
};

window.resetFilterRekap = function() {
    // Reset filter form
    const dariTanggal = document.getElementById('rekapDariTanggal');
    const sampaiTanggal = document.getElementById('rekapSampaiTanggal');
    const kelas = document.getElementById('rekapKelas');
    const status = document.getElementById('rekapStatus');
    
    if (dariTanggal) dariTanggal.value = '';
    if (sampaiTanggal) sampaiTanggal.value = '';
    if (kelas) kelas.value = 'all';
    if (status) status.value = 'all';
    
    if (window.app && window.app.modules && window.app.modules.ui) {
        window.app.modules.ui.showNotification('Filter rekap berhasil direset', 'success');
    }
};

// Fungsi utility global
window.generateNISN = function() {
    const randomNISN = Math.floor(1000000000 + Math.random() * 9000000000);
    const nisnInput = document.getElementById('nisnSiswa');
    if (nisnInput) {
        nisnInput.value = randomNISN.toString();
        if (window.app && window.app.modules && window.app.modules.ui) {
            window.app.modules.ui.showNotification('NISN berhasil digenerate!', 'success');
        }
    }
};

window.generateTahunAjaran = function() {
    const currentYear = new Date().getFullYear();
    const tahunAjaran = `${currentYear}/${currentYear + 1}`;
    const tahunAjaranInput = document.getElementById('tahunAjaran');
    if (tahunAjaranInput) {
        tahunAjaranInput.value = tahunAjaran;
        if (window.app && window.app.modules && window.app.modules.ui) {
            window.app.modules.ui.showNotification('Tahun ajaran otomatis diisi!', 'success');
        }
    }
};

window.resetFormSiswa = function() {
    if (window.app && window.app.modules && window.app.modules.siswa) {
        window.app.modules.siswa.resetForm();
    } else {
        // Fallback: manually reset form
        const form = document.getElementById('tambahSiswaDialog');
        if (form) {
            form.querySelectorAll('input, select, textarea').forEach(element => {
                if (element.type !== 'button' && element.type !== 'submit') {
                    element.value = '';
                }
            });
        }
    }
};

window.resetFormKelas = function() {
    if (window.app && window.app.modules && window.app.modules.kelas) {
        window.app.modules.kelas.resetForm();
    } else {
        // Fallback: manually reset form
        const form = document.getElementById('tambahKelasDialog');
        if (form) {
            form.querySelectorAll('input, select, textarea').forEach(element => {
                if (element.type !== 'button' && element.type !== 'submit') {
                    element.value = '';
                }
            });
            // Reset dialog mode if in edit mode
            form.removeAttribute('data-edit-mode');
            form.removeAttribute('data-edit-id');
            const header = form.querySelector('.dialog-header h3');
            if (header) header.textContent = 'Tambah Kelas';
        }
    }
};

window.resetFormMateri = function() {
    if (window.app && window.app.modules && window.app.modules.materi) {
        window.app.modules.materi.resetForm();
    } else {
        // Fallback: manually reset form
        const form = document.getElementById('tambahMateriDialog');
        if (form) {
            form.querySelectorAll('input, select, textarea').forEach(element => {
                if (element.type !== 'button' && element.type !== 'submit') {
                    element.value = '';
                }
            });
        }
    }
};

window.resetFormSemester = function() {
    if (window.app && window.app.modules && window.app.modules.semester) {
        window.app.modules.semester.resetForm();
    } else {
        // Fallback: manually reset form
        const form = document.getElementById('tambahSemesterDialog');
        if (form) {
            form.querySelectorAll('input, select, textarea').forEach(element => {
                if (element.type !== 'button' && element.type !== 'submit') {
                    element.value = '';
                }
            });
        }
    }
};

// Nilai functions - GLOBAL FUNCTIONS FOR HTML ONCLICK
window.loadDataNilaiFormatif = function() {
    if (window.app && window.app.modules.nilai) {
        window.app.modules.nilai.loadDataFormatif();
    } else {
        console.error('Nilai module not available');
    }
};

window.loadDataNilaiSumatif = function() {
    if (window.app && window.app.modules.nilai) {
        window.app.modules.nilai.loadDataSumatif();
    } else {
        console.error('Nilai module not available');
    }
};

window.simpanNilaiFormatif = function() {
    if (window.app && window.app.modules.nilai) {
        // Force save all nilai formatif
        const manager = window.app.modules.nilai;
        if (manager.dataFormatif && manager.dataFormatif.length > 0) {
            manager.api.saveNilaiFormatif({
                tanggal: manager.currentTanggalFormatif || new Date().toISOString().split('T')[0],
                nilai: manager.dataFormatif.map(item => ({
                    siswa_id: item.siswa_id,
                    materi: manager.currentMateriFormatif,
                    nilai: item.nilai
                }))
            }).then(() => {
                if (window.app && window.app.modules && window.app.modules.ui) {
                    window.app.modules.ui.showNotification('Semua nilai formatif berhasil disimpan!', 'success');
                }
            }).catch(error => {
                if (window.app && window.app.modules && window.app.modules.ui) {
                    window.app.modules.ui.showNotification('Gagal menyimpan nilai formatif', 'error');
                }
            });
        } else {
            if (window.app && window.app.modules && window.app.modules.ui) {
                window.app.modules.ui.showNotification('Tidak ada data nilai untuk disimpan', 'warning');
            }
        }
    }
};

window.simpanNilaiSumatif = function() {
    if (window.app && window.app.modules.nilai) {
        // Force save all nilai sumatif
        const manager = window.app.modules.nilai;
        if (manager.dataSumatif && manager.dataSumatif.length > 0) {
            manager.api.saveNilaiSumatif({
                tanggal: manager.currentTanggalSumatif || new Date().toISOString().split('T')[0],
                nilai: manager.dataSumatif.map(item => ({
                    siswa_id: item.siswa_id,
                    jenis: manager.currentJenisSumatif,
                    nilai: item.nilai
                }))
            }).then(() => {
                if (window.app && window.app.modules && window.app.modules.ui) {
                    window.app.modules.ui.showNotification(`Semua nilai ${manager.currentJenisSumatif} berhasil disimpan!`, 'success');
                }
            }).catch(error => {
                if (window.app && window.app.modules && window.app.modules.ui) {
                    window.app.modules.ui.showNotification('Gagal menyimpan nilai sumatif', 'error');
                }
            });
        } else {
            if (window.app && window.app.modules && window.app.modules.ui) {
                window.app.modules.ui.showNotification('Tidak ada data nilai untuk disimpan', 'warning');
            }
        }
    }
};

// Jurnal functions - GLOBAL FUNCTIONS FOR HTML ONCLICK
window.loadJurnal = function() {
    if (window.app && window.app.modules.jurnal) {
        window.app.modules.jurnal.loadData();
    } else {
        console.error('Jurnal module not available');
    }
};

window.exportJurnal = function() {
    if (window.app && window.app.modules.jurnal) {
        // Simulate export functionality
        if (window.app.modules.ui) {
            window.app.modules.ui.showNotification('Export jurnal ke PDF berhasil!', 'success');
        }
    }
};

// Jurnal Form Functions
window.simpanJurnal = function() {
    if (window.app && window.app.modules.jurnal) {
        const dialog = document.getElementById('tambahJurnalDialog');
        const isEditMode = dialog.getAttribute('data-edit-mode') === 'true';
        const editId = dialog.getAttribute('data-edit-id');

        // Collect form data
        const formData = {
            tanggal: document.getElementById('jurnalTanggal').value,
            kelas: document.getElementById('jurnalKelas').value,
            mata_pelajaran: document.getElementById('jurnalMapel').value,
            materi: document.getElementById('jurnalMateri').value,
            topik: document.getElementById('jurnalTopik').value,
            jam_ke: document.getElementById('jurnalJamKe').value,
            durasi: parseInt(document.getElementById('jurnalDurasi').value) || 2,
            tujuan_pembelajaran: document.getElementById('jurnalTujuan').value,
            aktivitas_pembelajaran: document.getElementById('jurnalAktivitas').value,
            media_sumber: document.getElementById('jurnalMedia').value,
            jenis_penilaian: document.getElementById('jurnalPenilaian').value,
            tingkat_pemahaman: document.getElementById('jurnalPemahaman').value,
            catatan_khusus: document.getElementById('jurnalCatatan').value,
            tindak_lanjut: document.getElementById('jurnalTindakLanjut').value,
            status: document.getElementById('jurnalStatus').value,
            tanda_tangan: document.getElementById('jurnalTTD').checked
        };

        // Validate required fields
        if (!formData.tanggal || !formData.kelas || !formData.mata_pelajaran || 
            !formData.materi || !formData.topik) {
            if (window.app && window.app.modules && window.app.modules.ui) {
                window.app.modules.ui.showNotification('Harap isi semua field yang wajib!', 'error');
            }
            return;
        }

        if (isEditMode && editId) {
            // Update existing jurnal
            window.app.modules.jurnal.updateJurnal(parseInt(editId), formData);
        } else {
            // Create new jurnal
            window.app.modules.jurnal.createJurnal(formData);
        }
    }
};

window.resetFormJurnal = function() {
    if (window.app && window.app.modules.jurnal) {
        window.app.modules.jurnal.resetJurnalForm();
    }
};

window.isiJurnalHariIni = function() {
    if (window.app && window.app.modules.jurnal) {
        window.app.modules.jurnal.isiJurnalHariIni();
    }
};

window.gunakanTemplatePembelajaran = function() {
    if (window.app && window.app.modules.jurnal) {
        window.app.modules.jurnal.gunakanTemplatePembelajaran();
    }
};

// Legger functions - GLOBAL FUNCTIONS FOR HTML ONCLICK
window.loadLegger = function() {
    if (window.app && window.app.modules.legger) {
        window.app.modules.legger.loadData();
    } else {
        console.error('Legger module not available');
    }
};

window.generateLegger = function() {
    if (window.app && window.app.modules.legger) {
        window.app.modules.legger.generateLegger();
    } else {
        console.error('Legger module not available');
    }
};

window.exportLegger = function() {
    if (window.app && window.app.modules.legger) {
        window.app.modules.legger.exportLegger();
    } else {
        console.error('Legger module not available');
    }
};

// Database functions - GLOBAL FUNCTIONS FOR HTML ONCLICK
window.backupDatabase = function() {
    if (window.app && window.app.modules.database) {
        window.app.modules.database.backupDatabase();
    } else {
        console.error('Database module not available');
    }
};

window.restoreDatabase = function() {
    if (window.app && window.app.modules.database) {
        window.app.modules.database.restoreDatabase();
    } else {
        console.error('Database module not available');
    }
};

window.optimizeDatabase = function() {
    if (window.app && window.app.modules.database) {
        window.app.modules.database.optimizeDatabase();
    } else {
        console.error('Database module not available');
    }
};

window.resetDatabase = function() {
    if (window.app && window.app.modules.database) {
        if (confirm('Apakah Anda yakin ingin mereset database? Semua data akan dihapus dan diganti dengan data default.')) {
            window.app.modules.database.resetDatabase();
        }
    } else {
        console.error('Database module not available');
    }
};

window.closeAllDialogs = function() {
    if (window.app && window.app.modules.ui) {
        window.app.modules.ui.closeAllDialogs();
    }
};

// Load pengguna data when pengguna tab is shown
window.loadPenggunaData = async function() {
    if (!window.app || !window.app.modules || !window.app.modules.api) {
        return;
    }

    try {
        const pengguna = await window.app.modules.api.getPengguna();
        if (pengguna) {
            const namaInput = document.getElementById('namaPengguna');
            const nipInput = document.getElementById('nipPengguna');
            const jabatanInput = document.getElementById('jabatanPengguna');
            const mapelInput = document.getElementById('mapelPengguna');

            if (namaInput) namaInput.value = pengguna.nama || '';
            if (nipInput) nipInput.value = pengguna.nip || '';
            if (jabatanInput) jabatanInput.value = pengguna.jabatan || '';
            if (mapelInput) mapelInput.value = pengguna.mata_pelajaran || '';
        }
    } catch (error) {
        console.error('Error loading pengguna data:', error);
    }
};

// Load bobot nilai data when settings tab is shown
window.loadBobotNilaiData = async function() {
    if (!window.app || !window.app.modules || !window.app.modules.api) {
        return;
    }

    try {
        const bobot = await window.app.modules.api.getBobotNilai();
        if (bobot) {
            const formatifInput = document.getElementById('bobotFormatif');
            const utsInput = document.getElementById('bobotUTS');
            const uasInput = document.getElementById('bobotUAS');
            const absensiInput = document.getElementById('bobotAbsensi');
            const totalInput = document.getElementById('totalBobot');

            if (formatifInput) formatifInput.value = bobot.formatif || 25;
            if (utsInput) utsInput.value = bobot.uts || 25;
            if (uasInput) uasInput.value = bobot.uas || 30;
            if (absensiInput) absensiInput.value = bobot.absensi || 20;
            if (totalInput) {
                const total = (bobot.formatif || 25) + (bobot.uts || 25) + (bobot.uas || 30) + (bobot.absensi || 20);
                totalInput.value = `${total}%`;
            }

            // Add event listeners to update total automatically
            [formatifInput, utsInput, uasInput, absensiInput].forEach(input => {
                if (input) {
                    input.removeEventListener('input', window.updateTotalBobot);
                    input.addEventListener('input', window.updateTotalBobot);
                }
            });
            
            // Update total initially
            window.updateTotalBobot();
        }
    } catch (error) {
        console.error('Error loading bobot nilai data:', error);
    }
};

// Update total bobot when any field changes
window.updateTotalBobot = function() {
    const formatif = parseInt(document.getElementById('bobotFormatif')?.value) || 0;
    const uts = parseInt(document.getElementById('bobotUTS')?.value) || 0;
    const uas = parseInt(document.getElementById('bobotUAS')?.value) || 0;
    const absensi = parseInt(document.getElementById('bobotAbsensi')?.value) || 0;
    const total = formatif + uts + uas + absensi;
    
    const totalInput = document.getElementById('totalBobot');
    if (totalInput) {
        totalInput.value = `${total}%`;
        // Change color based on total
        if (total === 100) {
            totalInput.style.color = 'var(--office-success, #28a745)';
        } else {
            totalInput.style.color = 'var(--office-error, #dc3545)';
        }
    }
};

// Pengguna functions - GLOBAL FUNCTIONS FOR HTML ONCLICK
window.simpanPengguna = function() {
    if (!window.app || !window.app.modules || !window.app.modules.api) {
        alert('Aplikasi belum siap. Silakan refresh halaman.');
        return;
    }

    const nama = document.getElementById('namaPengguna')?.value;
    const nip = document.getElementById('nipPengguna')?.value;
    const jabatan = document.getElementById('jabatanPengguna')?.value;
    const mapel = document.getElementById('mapelPengguna')?.value;

    if (!nama || !nip) {
        if (window.app.modules.ui) {
            window.app.modules.ui.showNotification('Nama dan NIP wajib diisi!', 'error');
        }
        return;
    }

    const data = {
        nama: nama,
        nip: nip,
        jabatan: jabatan || '',
        mata_pelajaran: mapel || ''
    };

    window.app.modules.api.updatePengguna(data)
        .then(() => {
            if (window.app.modules.ui) {
                window.app.modules.ui.showNotification('Data pengguna berhasil disimpan!', 'success');
            }
        })
        .catch(error => {
            if (window.app.modules.ui) {
                window.app.modules.ui.showNotification('Gagal menyimpan data pengguna: ' + (error.message || 'Unknown error'), 'error');
            }
            console.error('Error saving pengguna:', error);
        });
};

// Bobot Nilai functions - GLOBAL FUNCTIONS FOR HTML ONCLICK
window.simpanBobotNilai = function() {
    if (!window.app || !window.app.modules || !window.app.modules.api) {
        alert('Aplikasi belum siap. Silakan refresh halaman.');
        return;
    }

    const formatif = parseInt(document.getElementById('bobotFormatif')?.value) || 0;
    const uts = parseInt(document.getElementById('bobotUTS')?.value) || 0;
    const uas = parseInt(document.getElementById('bobotUAS')?.value) || 0;
    const absensi = parseInt(document.getElementById('bobotAbsensi')?.value) || 0;

    const total = formatif + uts + uas + absensi;

    if (total !== 100) {
        if (window.app.modules.ui) {
            window.app.modules.ui.showNotification(`Total bobot harus 100%! Saat ini: ${total}%`, 'error');
        }
        return;
    }

    const data = {
        formatif: formatif,
        uts: uts,
        uas: uas,
        absensi: absensi
    };

    window.app.modules.api.updateBobotNilai(data)
        .then(() => {
            if (window.app.modules.ui) {
                window.app.modules.ui.showNotification('Bobot nilai berhasil disimpan!', 'success');
            }
        })
        .catch(error => {
            if (window.app.modules.ui) {
                window.app.modules.ui.showNotification('Gagal menyimpan bobot nilai: ' + (error.message || 'Unknown error'), 'error');
            }
            console.error('Error saving bobot nilai:', error);
        });
};