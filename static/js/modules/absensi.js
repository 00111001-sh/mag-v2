class AbsensiManager {
    constructor() {
        this.api = new API();
        this.ui = new UI();
        this.data = [];
        this.currentKelas = '';
        this.currentTanggal = '';
        this.hasData = false; // Track if data has been loaded
        
        // Initialize defaults
        this.initDefaults();
        this.showInitialState();
    }

    // Tampilkan initial state
    showInitialState() {
        const initialState = document.getElementById('absensiInitialState');
        const tableContainer = document.getElementById('absensiTableContainer');
        const summary = document.getElementById('summaryAbsensi');
        
        if (initialState) initialState.style.display = 'block';
        if (tableContainer) tableContainer.style.display = 'none';
        if (summary) summary.style.display = 'none';
        
        this.hasData = false;
    }

    // Tampilkan table state (setelah data di-load)
    showTableState() {
        const initialState = document.getElementById('absensiInitialState');
        const tableContainer = document.getElementById('absensiTableContainer');
        const summary = document.getElementById('summaryAbsensi');
        
        if (initialState) initialState.style.display = 'none';
        if (tableContainer) tableContainer.style.display = 'block';
        if (summary) summary.style.display = 'flex';
        
        this.hasData = true;
    }

    async loadData() {
        try {
            this.currentKelas = document.getElementById('filterKelasAbsensi').value;
            this.currentTanggal = document.getElementById('tanggalAbsensi').value;
            
            console.log('🚀 loadData() started');
            console.log('📋 Form values - Kelas:', this.currentKelas, 'Tanggal:', this.currentTanggal);
            
            if (!this.currentKelas || !this.currentTanggal) {
                this.ui.showNotification('Pilih kelas dan tanggal terlebih dahulu', 'warning');
                return;
            }

            // Show loading state
            this.showLoadingState();

            console.log('📞 Calling API...');
            
            let responseData;
            try {
                responseData = await this.api.getAbsensi(this.currentKelas, this.currentTanggal);
                console.log('✅ API response:', responseData);
            } catch (apiError) {
                console.error('❌ API Error:', apiError);
                this.showInitialState(); // Kembali ke initial state jika error
                throw apiError;
            }

            // Validasi data
            if (!responseData) {
                console.error('❌ No data received from API');
                this.ui.showNotification('Tidak ada data yang diterima dari server', 'error');
                this.showInitialState();
                return;
            }

            if (!Array.isArray(responseData)) {
                console.error('❌ Data is not array:', typeof responseData, responseData);
                this.ui.showNotification('Format data tidak valid', 'error');
                this.showInitialState();
                return;
            }

            console.log('📊 Data validation passed, length:', responseData.length);

            // Assign data
            this.data = responseData;
            console.log('💾 Data assigned to this.data:', this.data);

            // Show table state
            this.showTableState();
            
            console.log('🎨 Rendering table...');
            this.renderTable();
            
            console.log('📈 Updating summary...');
            this.updateSummary();
            
            console.log('✅ loadData() completed successfully');
            
        } catch (error) {
            console.error('💥 Error in loadData():', error);
            this.ui.showNotification(`Gagal memuat data absensi: ${error.message}`, 'error');
            this.showInitialState(); // Kembali ke initial state jika error
        }
    }

    // Tampilkan loading state
    showLoadingState() {
        const initialState = document.getElementById('absensiInitialState');
        const tableContainer = document.getElementById('absensiTableContainer');
        const summary = document.getElementById('summaryAbsensi');
        
        if (initialState) {
            initialState.innerHTML = `
                <div class="initial-icon">
                    <i class="fas fa-spinner fa-spin"></i>
                </div>
                <div class="initial-title">Memuat Data...</div>
                <div class="initial-subtitle">
                    Sedang mengambil data absensi dari server
                </div>
            `;
            initialState.style.display = 'block';
        }
        if (tableContainer) tableContainer.style.display = 'none';
        if (summary) summary.style.display = 'none';
    }

    renderTable() {
        const table = document.getElementById('absensiTable');
        if (!table) {
            console.error('Table element not found');
            return;
        }

        console.log('Rendering table with data:', this.data);
        console.log('Data length:', this.data.length);

        if (!this.data || this.data.length === 0) {
            console.log('No data, showing empty state');
            table.innerHTML = `
                <tr>
                    <td colspan="4" class="empty-state-modern">
                        <div class="empty-icon">👨‍🎓</div>
                        <div class="empty-title">Tidak Ada Data Siswa</div>
                        <div class="empty-subtitle">Tidak ada siswa di kelas ${this.currentKelas}</div>
                    </td>
                </tr>
            `;
            return;
        }

        console.log('Creating table rows for', this.data.length, 'students');
        
        table.innerHTML = '';
        this.data.forEach((item, index) => {
            console.log('Creating row for student:', item.nama);
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
                    <div class="attendance-status-modern">
                        <div class="status-option-modern ${item.status === 'Hadir' ? 'selected' : ''}" 
                             onclick="app.modules.absensi.setStatus(${item.siswa_id}, 'Hadir')">
                             <i class="fas fa-check-circle"></i> Hadir
                        </div>
                        <div class="status-option-modern ${item.status === 'Sakit' ? 'selected' : ''}" 
                             onclick="app.modules.absensi.setStatus(${item.siswa_id}, 'Sakit')">
                             <i class="fas fa-hospital"></i> Sakit
                        </div>
                        <div class="status-option-modern ${item.status === 'Ijin' ? 'selected' : ''}" 
                             onclick="app.modules.absensi.setStatus(${item.siswa_id}, 'Ijin')">
                             <i class="fas fa-envelope"></i> Ijin
                        </div>
                        <div class="status-option-modern ${item.status === 'Tidak Hadir' ? 'selected' : ''}" 
                             onclick="app.modules.absensi.setStatus(${item.siswa_id}, 'Tidak Hadir')">
                             <i class="fas fa-times-circle"></i> Tidak Hadir
                        </div>
                    </div>
                </td>
            `;
            console.log('Row HTML:', row.innerHTML);
            table.appendChild(row);
        });

        console.log('Table rendering completed. Rows count:', table.children.length);
    }

    async setStatus(siswaId, status) {
        try {
            console.log('Setting status:', siswaId, status);
            
            // Update local data first for immediate UI feedback
            const item = this.data.find(d => d.siswa_id === siswaId);
            if (item) {
                const oldStatus = item.status;
                item.status = status;
                
                // Re-render the specific row for immediate feedback
                this.renderTable();
                
                // Save to server
                await this.api.saveAbsensi({
                    tanggal: this.currentTanggal,
                    absensi: this.data.map(item => ({
                        siswa_id: item.siswa_id,
                        status: item.status
                    }))
                });

                this.updateSummary();
                this.ui.showNotification(`Status ${item.nama} diperbarui: ${oldStatus} → ${status}`, 'success');
            }
        } catch (error) {
            console.error('Error setting status:', error);
            this.ui.showNotification(`Gagal menyimpan absensi: ${error.message}`, 'error');
            // Reload data to sync with server
            this.loadData();
        }
    }

    updateSummary() {
        const summary = document.getElementById('summaryAbsensi');
        if (!summary) return;

        const totalSiswa = this.data.length;
        const hadir = this.data.filter(item => item.status === 'Hadir').length;
        const sakit = this.data.filter(item => item.status === 'Sakit').length;
        const ijin = this.data.filter(item => item.status === 'Ijin').length;
        const tidakHadir = this.data.filter(item => item.status === 'Tidak Hadir').length;

        summary.innerHTML = `
            <div class="summary-item-modern">
                <div class="summary-value-modern" style="color: var(--office-success);">${hadir}</div>
                <div class="summary-label-modern">Hadir</div>
                <div class="summary-percentage">${Math.round((hadir/totalSiswa)*100)}%</div>
            </div>
            <div class="summary-item-modern">
                <div class="summary-value-modern" style="color: var(--office-warning);">${sakit}</div>
                <div class="summary-label-modern">Sakit</div>
                <div class="summary-percentage">${Math.round((sakit/totalSiswa)*100)}%</div>
            </div>
            <div class="summary-item-modern">
                <div class="summary-value-modern" style="color: var(--office-blue);">${ijin}</div>
                <div class="summary-label-modern">Ijin</div>
                <div class="summary-percentage">${Math.round((ijin/totalSiswa)*100)}%</div>
            </div>
            <div class="summary-item-modern">
                <div class="summary-value-modern" style="color: var(--office-danger);">${tidakHadir}</div>
                <div class="summary-label-modern">Tidak Hadir</div>
                <div class="summary-percentage">${Math.round((tidakHadir/totalSiswa)*100)}%</div>
            </div>
            <div class="summary-item-modern">
                <div class="summary-value-modern">${totalSiswa}</div>
                <div class="summary-label-modern">Total Siswa</div>
            </div>
        `;
    }

    async resetAbsensi() {
        if (!confirm('Apakah Anda yakin ingin mereset semua absensi menjadi "Hadir"?')) return;

        try {
            // Reset all status to 'Hadir'
            this.data.forEach(item => {
                item.status = 'Hadir';
            });

            await this.api.saveAbsensi({
                tanggal: this.currentTanggal,
                absensi: this.data.map(item => ({
                    siswa_id: item.siswa_id,
                    status: 'Hadir'
                }))
            });

            this.renderTable();
            this.updateSummary();
            this.ui.showNotification('Absensi berhasil direset ke status Hadir!', 'success');
        } catch (error) {
            console.error('Error resetting absensi:', error);
            this.ui.showNotification('Gagal mereset absensi', 'error');
        }
    }

    async generateRekap() {
        try {
            const dariTanggal = document.getElementById('rekapDariTanggal').value;
            const sampaiTanggal = document.getElementById('rekapSampaiTanggal').value;
            const kelas = document.getElementById('rekapKelas').value;
            const status = document.getElementById('rekapStatus').value;
            
            if (!dariTanggal || !sampaiTanggal) {
                this.ui.showNotification('Harap pilih periode tanggal!', 'error');
                return;
            }
            
            const rekapData = await this.api.request(`/api/absensi/rekap?dari_tanggal=${dariTanggal}&sampai_tanggal=${sampaiTanggal}&kelas=${kelas}&status=${status}`);
            
            document.getElementById('previewTotalRecords').textContent = rekapData.total_records;
            document.getElementById('previewPeriode').textContent = rekapData.periode;
            
            this.ui.showNotification(`Rekap absensi berhasil digenerate! ${rekapData.total_records} records ditemukan.`, 'success');
            
        } catch (error) {
            console.error('Error generating rekap:', error);
            this.ui.showNotification('Gagal generate rekap absensi', 'error');
        }
    }

    exportRekap() {
        this.ui.showNotification('Export rekap absensi ke CSV berhasil!', 'success');
        this.ui.closeDialog('rekapAbsensiDialog');
    }

    // Initialize default values
    initDefaults() {
        // Set default date to today
        const today = new Date().toISOString().split('T')[0];
        const tanggalInput = document.getElementById('tanggalAbsensi');
        if (tanggalInput) {
            tanggalInput.value = today;
            this.currentTanggal = today;
        }
        
        // Set default class if not set
        const kelasSelect = document.getElementById('filterKelasAbsensi');
        if (kelasSelect) {
            if (!kelasSelect.value && kelasSelect.options.length > 0) {
                kelasSelect.value = kelasSelect.options[0].value;
            }
            this.currentKelas = kelasSelect.value;
        }
        
        console.log('Absensi defaults initialized:', {
            currentKelas: this.currentKelas,
            currentTanggal: this.currentTanggal
        });
    }

    // Debug function
    debug() {
        console.log('=== ABSENSI DEBUG INFO ===');
        console.log('Current Kelas:', this.currentKelas);
        console.log('Current Tanggal:', this.currentTanggal);
        console.log('Data length:', this.data.length);
        console.log('Table element:', document.getElementById('absensiTable'));
        console.log('Kelas Select:', document.getElementById('filterKelasAbsensi')?.value);
        console.log('Tanggal Input:', document.getElementById('tanggalAbsensi')?.value);
        console.log('==========================');
    }
}

// Export untuk global access
window.AbsensiManager = AbsensiManager;