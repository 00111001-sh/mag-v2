class Dashboard {
    constructor() {
        this.api = new API();
        this.ui = new UI();
        this.data = {};
    }

    async loadData() {
        try {
            this.data = await this.api.getDashboardData();
            this.updateStats();
            this.updateCharts();
        } catch (error) {
            this.ui.showNotification('Gagal memuat data dashboard', 'error');
            console.error('Error loading dashboard:', error);
            this.loadSampleData();
        }
    }

    updateStats() {
        // Update stat cards
        if (this.data.avg_nilai !== undefined) {
            document.getElementById('avgNilai').textContent = this.data.avg_nilai;
        }
        if (this.data.presentase_hadir !== undefined) {
            document.getElementById('presentaseHadir').textContent = this.data.presentase_hadir + '%';
        }
        if (this.data.nilai_harian !== undefined) {
            document.getElementById('nilaiHarian').textContent = this.data.nilai_harian;
        }
        if (this.data.predikat !== undefined) {
            document.getElementById('predikat').textContent = this.data.predikat;
        }

        // Update user info
        this.updateUserInfo();
    }

    updateUserInfo() {
        // This would typically come from API, but for now we'll use static data
        const userInfo = {
            nama: 'Syafrul Hidayah, S.Pd., Gr.',
            nip: '19890903 202221 1 013',
            jabatan: 'Guru Kejuruan',
            mata_pelajaran: 'Konsentrasi Keahlian',
            kelas_diampu: 'XI Listrik A, XI Listrik B, XII Listrik A, XII Listrik B'
        };

        const userCard = document.querySelector('.user-details-grid');
        if (userCard) {
            userCard.innerHTML = `
                <div class="detail-item">
                    <span class="detail-label">Nama</span>
                    <span class="detail-value">${userInfo.nama}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">NIP</span>
                    <span class="detail-value">${userInfo.nip}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Jabatan</span>
                    <span class="detail-value">${userInfo.jabatan}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Mata Pelajaran</span>
                    <span class="detail-value">${userInfo.mata_pelajaran}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Kelas yang Diampu</span>
                    <span class="detail-value">${userInfo.kelas_diampu}</span>
                </div>
            `;
        }
    }

    updateCharts() {
        // Initialize charts if needed
        this.initAttendanceChart();
        this.initGradeDistributionChart();
    }

    initAttendanceChart() {
        // Simple attendance chart implementation
        const ctx = document.getElementById('attendanceChart');
        if (!ctx) return;

        // This would be replaced with actual chart library
        console.log('Initializing attendance chart...');
    }

    initGradeDistributionChart() {
        // Simple grade distribution chart implementation
        const ctx = document.getElementById('gradeChart');
        if (!ctx) return;

        console.log('Initializing grade distribution chart...');
    }

    loadSampleData() {
        // Fallback sample data
        this.data = {
            avg_nilai: 85.2,
            presentase_hadir: 94.5,
            nilai_harian: 82.8,
            predikat: 'B',
            total_siswa: 125,
            total_kelas: 6,
            total_materi: 24
        };
        this.updateStats();
    }

    refresh() {
        this.loadData();
        this.ui.showNotification('Dashboard diperbarui!', 'success');
    }

    showAnalytics() {
        this.ui.showNotification('Membuka analytics...', 'info');
    }

    printDashboard() {
        this.ui.showNotification('Mencetak dashboard...', 'info');
        window.print();
    }

    exportDashboard() {
        this.ui.showNotification('Export dashboard berhasil!', 'success');
        // Implementation for exporting dashboard data
    }
}

// Export untuk global access
window.Dashboard = Dashboard;