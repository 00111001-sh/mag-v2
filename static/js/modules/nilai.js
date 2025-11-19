class NilaiManager {
    constructor() {
        this.api = new API();
        this.ui = new UI();
        this.dataFormatif = [];
        this.dataSumatif = [];
        this.currentKelasFormatif = '';
        this.currentMateriFormatif = '';
        this.currentTanggalFormatif = '';
        this.currentJenisSumatif = 'UTS';
        this.currentKelasSumatif = '';
        this.currentTanggalSumatif = '';
    }

    // === NILAI FORMATIF ===

    async loadDataFormatif() {
        try {
            this.currentKelasFormatif = document.getElementById('filterKelasNilai').value;
            this.currentMateriFormatif = document.getElementById('filterMateriNilai').value;
            this.currentTanggalFormatif = document.getElementById('tanggalNilai').value;
            
            console.log('Loading nilai formatif:', {
                kelas: this.currentKelasFormatif,
                materi: this.currentMateriFormatif,
                tanggal: this.currentTanggalFormatif
            });
            
            if (!this.currentKelasFormatif || !this.currentMateriFormatif) {
                this.ui.showNotification('Pilih kelas dan materi terlebih dahulu', 'warning');
                return;
            }

            // Show loading state
            this.showLoadingState('formatif');

            this.dataFormatif = await this.api.getNilaiFormatif(
                this.currentKelasFormatif, 
                this.currentMateriFormatif, 
                this.currentTanggalFormatif
            );
            
            console.log('Data formatif received:', this.dataFormatif);
            
            this.showTableState('formatif');
            this.renderTableFormatif();
            this.updateSummaryFormatif();
            
        } catch (error) {
            console.error('Error loading nilai formatif:', error);
            this.ui.showNotification(`Gagal memuat data nilai formatif: ${error.message}`, 'error');
            this.showInitialState('formatif');
        }
    }

    renderTableFormatif() {
        const table = document.getElementById('nilaiTable');
        if (!table) {
            console.error('Table element not found for formatif');
            return;
        }

        if (!this.dataFormatif || this.dataFormatif.length === 0) {
            table.innerHTML = `
                <tr>
                    <td colspan="4" class="empty-state-modern">
                        <div class="empty-icon">📊</div>
                        <div class="empty-title">Tidak Ada Data Nilai</div>
                        <div class="empty-subtitle">Tidak ada data nilai untuk kelas dan materi yang dipilih</div>
                    </td>
                </tr>
            `;
            return;
        }

        table.innerHTML = '';
        this.dataFormatif.forEach((item, index) => {
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
                <td>
                    <div class="nilai-input-modern">
                        <input type="number" 
                               class="nilai-input" 
                               value="${item.nilai}" 
                               min="0" 
                               max="100"
                               onchange="app.modules.nilai.updateNilaiFormatif(${item.siswa_id}, this.value)"
                               placeholder="0-100">
                        <span class="nilai-suffix">/100</span>
                    </div>
                </td>
            `;
            table.appendChild(row);
        });
    }

    async updateNilaiFormatif(siswaId, nilai) {
        try {
            const numericNilai = parseInt(nilai);
            if (isNaN(numericNilai) || numericNilai < 0 || numericNilai > 100) {
                this.ui.showNotification('Nilai harus antara 0-100', 'warning');
                return;
            }

            // Update local data
            const item = this.dataFormatif.find(d => d.siswa_id === siswaId);
            if (item) {
                item.nilai = numericNilai;
            }

            // Save to server
            await this.api.saveNilaiFormatif({
                tanggal: this.currentTanggalFormatif || new Date().toISOString().split('T')[0],
                nilai: this.dataFormatif.map(item => ({
                    siswa_id: item.siswa_id,
                    materi: this.currentMateriFormatif,
                    nilai: item.nilai
                }))
            });

            this.updateSummaryFormatif();
            this.ui.showNotification(`Nilai ${item.nama} diperbarui: ${numericNilai}`, 'success');
            
        } catch (error) {
            console.error('Error updating nilai formatif:', error);
            this.ui.showNotification('Gagal menyimpan nilai', 'error');
        }
    }

    updateSummaryFormatif() {
        const summary = document.getElementById('summaryNilaiFormatif');
        if (!summary) return;

        const totalSiswa = this.dataFormatif.length;
        const nilaiValues = this.dataFormatif.map(item => item.nilai).filter(n => n > 0);
        const totalNilai = nilaiValues.reduce((sum, nilai) => sum + nilai, 0);
        const rataRata = nilaiValues.length > 0 ? totalNilai / nilaiValues.length : 0;
        const nilaiTertinggi = nilaiValues.length > 0 ? Math.max(...nilaiValues) : 0;
        const nilaiTerendah = nilaiValues.length > 0 ? Math.min(...nilaiValues) : 0;
        const sudahDinilai = nilaiValues.length;

        summary.innerHTML = `
            <div class="summary-item-modern">
                <div class="summary-value-modern">${totalSiswa}</div>
                <div class="summary-label-modern">Total Siswa</div>
            </div>
            <div class="summary-item-modern">
                <div class="summary-value-modern" style="color: var(--office-success);">${sudahDinilai}</div>
                <div class="summary-label-modern">Sudah Dinilai</div>
                <div class="summary-percentage">${Math.round((sudahDinilai/totalSiswa)*100)}%</div>
            </div>
            <div class="summary-item-modern">
                <div class="summary-value-modern" style="color: var(--office-blue);">${Math.round(rataRata)}</div>
                <div class="summary-label-modern">Rata-rata</div>
            </div>
            <div class="summary-item-modern">
                <div class="summary-value-modern" style="color: var(--office-success);">${nilaiTertinggi}</div>
                <div class="summary-label-modern">Tertinggi</div>
            </div>
            <div class="summary-item-modern">
                <div class="summary-value-modern" style="color: var(--office-warning);">${nilaiTerendah}</div>
                <div class="summary-label-modern">Terendah</div>
            </div>
        `;
    }

    // === NILAI SUMATIF ===

    async loadDataSumatif() {
        try {
            this.currentJenisSumatif = document.getElementById('jenisNilaiSumatif').value;
            this.currentKelasSumatif = document.getElementById('filterKelasSumatif').value;
            this.currentTanggalSumatif = document.getElementById('tanggalSumatif').value;
            
            console.log('Loading nilai sumatif:', {
                jenis: this.currentJenisSumatif,
                kelas: this.currentKelasSumatif,
                tanggal: this.currentTanggalSumatif
            });
            
            if (!this.currentJenisSumatif || !this.currentKelasSumatif) {
                this.ui.showNotification('Pilih jenis dan kelas terlebih dahulu', 'warning');
                return;
            }

            // Show loading state
            this.showLoadingState('sumatif');

            this.dataSumatif = await this.api.getNilaiSumatif(
                this.currentJenisSumatif,
                this.currentKelasSumatif, 
                this.currentTanggalSumatif
            );
            
            console.log('Data sumatif received:', this.dataSumatif);
            
            // Update header berdasarkan jenis
            const header = document.getElementById('headerNilaiSumatif');
            if (header) {
                header.textContent = `Nilai ${this.currentJenisSumatif}`;
            }
            
            this.showTableState('sumatif');
            this.renderTableSumatif();
            this.updateSummarySumatif();
            
        } catch (error) {
            console.error('Error loading nilai sumatif:', error);
            this.ui.showNotification(`Gagal memuat data nilai sumatif: ${error.message}`, 'error');
            this.showInitialState('sumatif');
        }
    }

    renderTableSumatif() {
        const table = document.getElementById('nilaiSumatifTable');
        if (!table) {
            console.error('Table element not found for sumatif');
            return;
        }

        if (!this.dataSumatif || this.dataSumatif.length === 0) {
            table.innerHTML = `
                <tr>
                    <td colspan="4" class="empty-state-modern">
                        <div class="empty-icon">📋</div>
                        <div class="empty-title">Tidak Ada Data Nilai</div>
                        <div class="empty-subtitle">Tidak ada data nilai ${this.currentJenisSumatif} untuk kelas yang dipilih</div>
                    </td>
                </tr>
            `;
            return;
        }

        table.innerHTML = '';
        this.dataSumatif.forEach((item, index) => {
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
                <td>
                    <div class="nilai-input-modern">
                        <input type="number" 
                               class="nilai-input" 
                               value="${item.nilai}" 
                               min="0" 
                               max="100"
                               onchange="app.modules.nilai.updateNilaiSumatif(${item.siswa_id}, this.value)"
                               placeholder="0-100">
                        <span class="nilai-suffix">/100</span>
                    </div>
                </td>
            `;
            table.appendChild(row);
        });
    }

    async updateNilaiSumatif(siswaId, nilai) {
        try {
            const numericNilai = parseInt(nilai);
            if (isNaN(numericNilai) || numericNilai < 0 || numericNilai > 100) {
                this.ui.showNotification('Nilai harus antara 0-100', 'warning');
                return;
            }

            // Update local data
            const item = this.dataSumatif.find(d => d.siswa_id === siswaId);
            if (item) {
                item.nilai = numericNilai;
            }

            // Save to server
            await this.api.saveNilaiSumatif({
                tanggal: this.currentTanggalSumatif || new Date().toISOString().split('T')[0],
                nilai: this.dataSumatif.map(item => ({
                    siswa_id: item.siswa_id,
                    jenis: this.currentJenisSumatif,
                    nilai: item.nilai
                }))
            });

            this.updateSummarySumatif();
            this.ui.showNotification(`Nilai ${this.currentJenisSumatif} ${item.nama} diperbarui: ${numericNilai}`, 'success');
            
        } catch (error) {
            console.error('Error updating nilai sumatif:', error);
            this.ui.showNotification('Gagal menyimpan nilai', 'error');
        }
    }

    updateSummarySumatif() {
        const summary = document.getElementById('summaryNilaiSumatif');
        if (!summary) return;

        const totalSiswa = this.dataSumatif.length;
        const nilaiValues = this.dataSumatif.map(item => item.nilai).filter(n => n > 0);
        const totalNilai = nilaiValues.reduce((sum, nilai) => sum + nilai, 0);
        const rataRata = nilaiValues.length > 0 ? totalNilai / nilaiValues.length : 0;
        const nilaiTertinggi = nilaiValues.length > 0 ? Math.max(...nilaiValues) : 0;
        const nilaiTerendah = nilaiValues.length > 0 ? Math.min(...nilaiValues) : 0;
        const sudahDinilai = nilaiValues.length;

        summary.innerHTML = `
            <div class="summary-item-modern">
                <div class="summary-value-modern">${totalSiswa}</div>
                <div class="summary-label-modern">Total Siswa</div>
            </div>
            <div class="summary-item-modern">
                <div class="summary-value-modern" style="color: var(--office-success);">${sudahDinilai}</div>
                <div class="summary-label-modern">Sudah Dinilai</div>
                <div class="summary-percentage">${Math.round((sudahDinilai/totalSiswa)*100)}%</div>
            </div>
            <div class="summary-item-modern">
                <div class="summary-value-modern" style="color: var(--office-blue);">${Math.round(rataRata)}</div>
                <div class="summary-label-modern">Rata-rata</div>
            </div>
            <div class="summary-item-modern">
                <div class="summary-value-modern" style="color: var(--office-success);">${nilaiTertinggi}</div>
                <div class="summary-label-modern">Tertinggi</div>
            </div>
            <div class="summary-item-modern">
                <div class="summary-value-modern" style="color: var(--office-warning);">${nilaiTerendah}</div>
                <div class="summary-label-modern">Terendah</div>
            </div>
        `;
    }

    // === STATE MANAGEMENT ===

    showInitialState(type) {
        const initialState = document.getElementById(`${type}InitialState`);
        const tableContainer = document.getElementById(`${type}TableContainer`);
        const summary = document.getElementById(`summaryNilai${type.charAt(0).toUpperCase() + type.slice(1)}`);
        
        if (initialState) initialState.style.display = 'block';
        if (tableContainer) tableContainer.style.display = 'none';
        if (summary) summary.style.display = 'none';
    }

    showLoadingState(type) {
        const initialState = document.getElementById(`${type}InitialState`);
        const tableContainer = document.getElementById(`${type}TableContainer`);
        const summary = document.getElementById(`summaryNilai${type.charAt(0).toUpperCase() + type.slice(1)}`);
        
        if (initialState) {
            initialState.innerHTML = `
                <div class="initial-icon">
                    <i class="fas fa-spinner fa-spin"></i>
                </div>
                <div class="initial-title">Memuat Data Nilai...</div>
                <div class="initial-subtitle">
                    Sedang mengambil data nilai dari server
                </div>
            `;
            initialState.style.display = 'block';
        }
        if (tableContainer) tableContainer.style.display = 'none';
        if (summary) summary.style.display = 'none';
    }

    showTableState(type) {
        const initialState = document.getElementById(`${type}InitialState`);
        const tableContainer = document.getElementById(`${type}TableContainer`);
        const summary = document.getElementById(`summaryNilai${type.charAt(0).toUpperCase() + type.slice(1)}`);
        
        if (initialState) initialState.style.display = 'none';
        if (tableContainer) tableContainer.style.display = 'block';
        if (summary) summary.style.display = 'flex';
    }

    // Initialize defaults
    initDefaults() {
        // Set default date to today
        const today = new Date().toISOString().split('T')[0];
        
        // Formatif defaults
        const tanggalFormatif = document.getElementById('tanggalNilai');
        const kelasFormatif = document.getElementById('filterKelasNilai');
        
        if (tanggalFormatif && !tanggalFormatif.value) {
            tanggalFormatif.value = today;
            this.currentTanggalFormatif = today;
        }
        
        if (kelasFormatif && !kelasFormatif.value && kelasFormatif.options.length > 0) {
            kelasFormatif.value = kelasFormatif.options[0].value;
            this.currentKelasFormatif = kelasFormatif.value;
        }

        // Sumatif defaults
        const tanggalSumatif = document.getElementById('tanggalSumatif');
        const kelasSumatif = document.getElementById('filterKelasSumatif');
        
        if (tanggalSumatif && !tanggalSumatif.value) {
            tanggalSumatif.value = today;
            this.currentTanggalSumatif = today;
        }
        
        if (kelasSumatif && !kelasSumatif.value && kelasSumatif.options.length > 0) {
            kelasSumatif.value = kelasSumatif.options[0].value;
            this.currentKelasSumatif = kelasSumatif.value;
        }

        // Show initial states
        this.showInitialState('formatif');
        this.showInitialState('sumatif');
    }
}

// Export untuk global access
window.NilaiManager = NilaiManager;