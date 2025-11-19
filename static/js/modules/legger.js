class LeggerManager {
    constructor() {
        this.api = new API();
        this.ui = new UI();
        this.data = [];
        this.currentKelas = '';
        this.currentSemester = '';
        this.semesterList = [];
    }

    async loadData() {
        try {
            this.currentKelas = document.getElementById('filterKelasLegger').value;
            this.currentSemester = document.getElementById('filterSemesterLegger').value;
            
            console.log('Loading legger:', {
                kelas: this.currentKelas,
                semester: this.currentSemester
            });
            
            if (!this.currentKelas || !this.currentSemester) {
                this.ui.showNotification('Pilih kelas dan semester terlebih dahulu', 'warning');
                return;
            }

            // Show loading state
            this.showLoadingState();

            this.data = await this.api.getLegger(this.currentKelas, this.currentSemester);
            
            console.log('Data legger received:', this.data);
            
            this.showTableState();
            this.renderTable();
            this.updateSummary();
            
        } catch (error) {
            console.error('Error loading legger:', error);
            this.ui.showNotification(`Gagal memuat data legger: ${error.message}`, 'error');
            this.showInitialState();
        }
    }

    async generateLegger() {
        try {
            if (!this.currentKelas || !this.currentSemester) {
                this.ui.showNotification('Pilih kelas dan semester terlebih dahulu', 'warning');
                return;
            }

            if (!confirm(`Generate legger untuk kelas ${this.currentKelas}?`)) {
                return;
            }

            this.ui.showNotification('Sedang generate legger...', 'info');

            const result = await this.api.request('/api/legger/generate', {
                method: 'POST',
                body: JSON.stringify({
                    kelas: this.currentKelas,
                    semester_id: parseInt(this.currentSemester)
                })
            });

            this.ui.showNotification(
                `Legger berhasil digenerate untuk ${result.generated_count} siswa`, 
                'success'
            );

            // Reload data
            this.loadData();
            
        } catch (error) {
            console.error('Error generating legger:', error);
            this.ui.showNotification(`Gagal generate legger: ${error.message}`, 'error');
        }
    }

    async exportLegger() {
        try {
            if (!this.currentKelas || !this.currentSemester) {
                this.ui.showNotification('Pilih kelas dan semester terlebih dahulu', 'warning');
                return;
            }

            this.ui.showNotification('Mempersiapkan export legger...', 'info');

            const result = await this.api.request(
                `/api/legger/export?kelas=${this.currentKelas}&semester=${this.currentSemester}`
            );

            // Simulate export functionality
            // In production, this would download a CSV/Excel file
            this.downloadLeggerAsCSV(result.data);
            
            this.ui.showNotification(
                `Legger berhasil diexport (${result.total_records} records)`, 
                'success'
            );
            
        } catch (error) {
            console.error('Error exporting legger:', error);
            this.ui.showNotification(`Gagal export legger: ${error.message}`, 'error');
        }
    }

    downloadLeggerAsCSV(data) {
        if (!data || data.length === 0) {
            this.ui.showNotification('Tidak ada data untuk diexport', 'warning');
            return;
        }

        // Create CSV content
        const headers = Object.keys(data[0]).join(',');
        const rows = data.map(item => 
            Object.values(item).map(value => 
                typeof value === 'string' && value.includes(',') ? `"${value}"` : value
            ).join(',')
        );
        
        const csvContent = [headers, ...rows].join('\n');
        
        // Create download link
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', `legger_${this.currentKelas}_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    renderTable() {
        const table = document.getElementById('leggerTable');
        if (!table) {
            console.error('Table element not found for legger');
            return;
        }

        if (!this.data || this.data.length === 0) {
            table.innerHTML = `
                <tr>
                    <td colspan="9" class="empty-state-modern">
                        <div class="empty-icon">📊</div>
                        <div class="empty-title">Tidak Ada Data Legger</div>
                        <div class="empty-subtitle">
                            ${this.currentKelas && this.currentSemester ? 
                                'Klik "Generate Legger" untuk membuat data legger' : 
                                'Pilih kelas dan semester terlebih dahulu'
                            }
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        table.innerHTML = '';
        this.data.forEach((item, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>
                    <div class="student-info">
                        <div class="student-name">${item.nama}</div>
                        <div class="student-nisn">${item.nisn}</div>
                    </div>
                </td>
                <td>${item.kelas}</td>
                <td class="text-center">
                    <span class="percentage-badge ${this.getKehadiranClass(item.presentase_kehadiran)}">
                        ${item.presentase_kehadiran}%
                    </span>
                </td>
                <td class="text-center">
                    <span class="nilai-badge ${this.getNilaiClass(item.nilai_formatif)}">
                        ${item.nilai_formatif}
                    </span>
                </td>
                <td class="text-center">
                    <span class="nilai-badge ${this.getNilaiClass(item.nilai_uts)}">
                        ${item.nilai_uts}
                    </span>
                </td>
                <td class="text-center">
                    <span class="nilai-badge ${this.getNilaiClass(item.nilai_uas)}">
                        ${item.nilai_uas}
                    </span>
                </td>
                <td class="text-center">
                    <span class="nilai-akhir-badge ${this.getNilaiClass(item.nilai_akhir)}">
                        ${item.nilai_akhir}
                    </span>
                </td>
                <td class="text-center">
                    <span class="predikat-badge ${this.getPredikatClass(item.predikat)}">
                        ${item.predikat}
                    </span>
                </td>
            `;
            table.appendChild(row);
        });
    }

    getKehadiranClass(percentage) {
        if (percentage >= 90) return 'excellent';
        if (percentage >= 80) return 'good';
        if (percentage >= 70) return 'fair';
        return 'poor';
    }

    getNilaiClass(nilai) {
        if (nilai >= 85) return 'excellent';
        if (nilai >= 75) return 'good';
        if (nilai >= 65) return 'fair';
        return 'poor';
    }

    getPredikatClass(predikat) {
        switch(predikat) {
            case 'A': return 'excellent';
            case 'B': return 'good';
            case 'C': return 'fair';
            case 'D': return 'poor';
            default: return 'poor';
        }
    }

    updateSummary() {
        const totalSiswa = document.getElementById('totalSiswa');
        const avgNilaiLegger = document.getElementById('avgNilaiLegger');
        const nilaiTertinggi = document.getElementById('nilaiTertinggi');
        const nilaiTerendah = document.getElementById('nilaiTerendah');

        if (this.data && this.data.length > 0) {
            const nilaiAkhirList = this.data.map(item => item.nilai_akhir);
            const totalNilai = nilaiAkhirList.reduce((sum, nilai) => sum + nilai, 0);
            const rataRata = totalNilai / nilaiAkhirList.length;
            const maxNilai = Math.max(...nilaiAkhirList);
            const minNilai = Math.min(...nilaiAkhirList);

            if (totalSiswa) totalSiswa.textContent = this.data.length;
            if (avgNilaiLegger) avgNilaiLegger.textContent = rataRata.toFixed(2);
            if (nilaiTertinggi) nilaiTertinggi.textContent = maxNilai.toFixed(2);
            if (nilaiTerendah) nilaiTerendah.textContent = minNilai.toFixed(2);
        } else {
            if (totalSiswa) totalSiswa.textContent = '0';
            if (avgNilaiLegger) avgNilaiLegger.textContent = '0';
            if (nilaiTertinggi) nilaiTertinggi.textContent = '0';
            if (nilaiTerendah) nilaiTerendah.textContent = '0';
        }
    }

    async loadSemesterList() {
        try {
            this.semesterList = await this.api.getSemester();
            this.populateSemesterFilter();
        } catch (error) {
            console.error('Error loading semester list:', error);
        }
    }

    populateSemesterFilter() {
        const semesterSelect = document.getElementById('filterSemesterLegger');
        if (!semesterSelect || !this.semesterList) return;

        // Clear existing options
        semesterSelect.innerHTML = '';

        // Add options
        this.semesterList.forEach(semester => {
            const option = document.createElement('option');
            option.value = semester.id;
            option.textContent = `${semester.tahun_ajaran} - Semester ${semester.semester}`;
            if (semester.status === 'Aktif') {
                option.selected = true;
                this.currentSemester = semester.id;
            }
            semesterSelect.appendChild(option);
        });
    }

    // === STATE MANAGEMENT ===

    showInitialState() {
        const initialState = document.getElementById('leggerInitialState');
        const tableContainer = document.getElementById('leggerTableContainer');
        const summary = document.getElementById('leggerSummary');
        
        if (initialState) initialState.style.display = 'block';
        if (tableContainer) tableContainer.style.display = 'none';
        if (summary) summary.style.display = 'none';
    }

    showLoadingState() {
        const initialState = document.getElementById('leggerInitialState');
        const tableContainer = document.getElementById('leggerTableContainer');
        const summary = document.getElementById('leggerSummary');
        
        if (initialState) {
            initialState.innerHTML = `
                <div class="initial-icon">
                    <i class="fas fa-spinner fa-spin"></i>
                </div>
                <div class="initial-title">Memuat Data Legger...</div>
                <div class="initial-subtitle">
                    Sedang menghitung dan memuat data legger nilai
                </div>
            `;
            initialState.style.display = 'block';
        }
        if (tableContainer) tableContainer.style.display = 'none';
        if (summary) summary.style.display = 'none';
    }

    showTableState() {
        const initialState = document.getElementById('leggerInitialState');
        const tableContainer = document.getElementById('leggerTableContainer');
        const summary = document.getElementById('leggerSummary');
        
        if (initialState) initialState.style.display = 'none';
        if (tableContainer) tableContainer.style.display = 'block';
        if (summary) summary.style.display = 'flex';
    }

    // Initialize defaults
    initDefaults() {
        // Set default class if not set
        const kelasSelect = document.getElementById('filterKelasLegger');
        if (kelasSelect && !kelasSelect.value && kelasSelect.options.length > 0) {
            kelasSelect.value = kelasSelect.options[0].value;
            this.currentKelas = kelasSelect.value;
        }

        // Load semester list
        this.loadSemesterList();

        // Show initial state
        this.showInitialState();
    }
}

// Export untuk global access
window.LeggerManager = LeggerManager;