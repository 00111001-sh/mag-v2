class JurnalManager {
    constructor() {
        this.api = new API();
        this.ui = new UI();
        this.data = [];
        this.currentKelasFilter = 'all';
        this.currentBulanFilter = 'all';
        this.currentTahunFilter = 'all';
    }

    async loadData() {
        try {
            this.currentKelasFilter = document.getElementById('filterKelasJurnal').value;
            this.currentBulanFilter = document.getElementById('filterBulanJurnal').value;
            this.currentTahunFilter = document.getElementById('filterTahunJurnal').value;
            
            console.log('Loading jurnal dengan filter:', {
                kelas: this.currentKelasFilter,
                bulan: this.currentBulanFilter,
                tahun: this.currentTahunFilter
            });

            // Show loading state
            this.showLoadingState();

            this.data = await this.api.getJurnal(
                this.currentKelasFilter,
                this.currentBulanFilter,
                this.currentTahunFilter
            );
            
            console.log('Data jurnal received:', this.data);
            
            this.showTableState();
            this.renderTable();
            
        } catch (error) {
            console.error('Error loading jurnal:', error);
            this.ui.showNotification(`Gagal memuat data jurnal: ${error.message}`, 'error');
            this.showInitialState();
        }
    }

    renderTable() {
        const table = document.getElementById('jurnalTable');
        if (!table) {
            console.error('Table element not found for jurnal');
            return;
        }

        if (!this.data || this.data.length === 0) {
            table.innerHTML = `
                <tr>
                    <td colspan="7" class="empty-state-modern">
                        <div class="empty-icon">📝</div>
                        <div class="empty-title">Tidak Ada Data Jurnal</div>
                        <div class="empty-subtitle">Tidak ada jurnal mengajar untuk filter yang dipilih</div>
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
                <td>${this.formatTanggal(item.tanggal)}</td>
                <td>${item.kelas}</td>
                <td>
                    <div class="materi-info">
                        <div class="materi-judul">${item.materi}</div>
                        <div class="materi-mapel">${item.mata_pelajaran}</div>
                    </div>
                </td>
                <td>
                    <div class="topik-truncate" title="${item.topik}">
                        ${this.truncateText(item.topik, 50)}
                    </div>
                </td>
                <td>
                    <div class="catatan-truncate" title="${item.catatan_khusus || 'Tidak ada catatan'}">
                        ${this.truncateText(item.catatan_khusus || 'Tidak ada catatan', 30)}
                    </div>
                </td>
                <td>
                    <div class="action-buttons-modern">
                        <button class="action-btn-small primary" onclick="app.modules.jurnal.editJurnal(${item.id})" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn-small danger" onclick="app.modules.jurnal.deleteJurnal(${item.id})" title="Hapus">
                            <i class="fas fa-trash"></i>
                        </button>
                        <button class="action-btn-small ${item.status === 'Selesai' ? 'success' : 'warning'}" 
                                onclick="app.modules.jurnal.toggleStatus(${item.id})" 
                                title="${item.status === 'Selesai' ? 'Draft' : 'Selesai'}">
                            <i class="fas ${item.status === 'Selesai' ? 'fa-check-circle' : 'fa-clock'}"></i>
                        </button>
                    </div>
                </td>
            `;
            table.appendChild(row);
        });
    }

    async createJurnal(formData) {
        try {
            console.log('Creating jurnal:', formData);
            
            const result = await this.api.createJurnal(formData);
            
            this.ui.showNotification('Jurnal berhasil dibuat!', 'success');
            this.ui.closeDialog('tambahJurnalDialog');
            
            // Reload data
            this.loadData();
            
            return result;
            
        } catch (error) {
            console.error('Error creating jurnal:', error);
            this.ui.showNotification(`Gagal membuat jurnal: ${error.message}`, 'error');
            throw error;
        }
    }

    async updateJurnal(id, formData) {
        try {
            console.log('Updating jurnal:', id, formData);
            
            await this.api.updateJurnal(id, formData);
            
            this.ui.showNotification('Jurnal berhasil diperbarui!', 'success');
            this.ui.closeDialog('tambahJurnalDialog');
            
            // Reload data
            this.loadData();
            
        } catch (error) {
            console.error('Error updating jurnal:', error);
            this.ui.showNotification(`Gagal memperbarui jurnal: ${error.message}`, 'error');
            throw error;
        }
    }

    async deleteJurnal(id) {
        try {
            const jurnal = this.data.find(item => item.id === id);
            if (!jurnal) {
                this.ui.showNotification('Jurnal tidak ditemukan', 'error');
                return;
            }

            if (!confirm(`Apakah Anda yakin ingin menghapus jurnal mengajar:\n"${jurnal.topik}"\nTanggal: ${this.formatTanggal(jurnal.tanggal)}?`)) {
                return;
            }

            await this.api.deleteJurnal(id);
            
            this.ui.showNotification('Jurnal berhasil dihapus!', 'success');
            
            // Reload data
            this.loadData();
            
        } catch (error) {
            console.error('Error deleting jurnal:', error);
            this.ui.showNotification(`Gagal menghapus jurnal: ${error.message}`, 'error');
        }
    }

    async toggleStatus(id) {
        try {
            const jurnal = this.data.find(item => item.id === id);
            if (!jurnal) {
                this.ui.showNotification('Jurnal tidak ditemukan', 'error');
                return;
            }

            const newStatus = jurnal.status === 'Selesai' ? 'Draft' : 'Selesai';
            
            await this.api.updateJurnal(id, {
                status: newStatus
            });
            
            this.ui.showNotification(`Status jurnal diubah menjadi: ${newStatus}`, 'success');
            
            // Reload data
            this.loadData();
            
        } catch (error) {
            console.error('Error toggling jurnal status:', error);
            this.ui.showNotification('Gagal mengubah status jurnal', 'error');
        }
    }

    editJurnal(id) {
        const jurnal = this.data.find(item => item.id === id);
        if (!jurnal) {
            this.ui.showNotification('Jurnal tidak ditemukan', 'error');
            return;
        }

        // Fill form dengan data jurnal
        this.fillJurnalForm(jurnal);
        
        // Show dialog
        this.ui.showDialog('tambahJurnalDialog');
    }

    fillJurnalForm(jurnal) {
        // Set form values
        document.getElementById('jurnalTanggal').value = jurnal.tanggal;
        document.getElementById('jurnalKelas').value = jurnal.kelas;
        document.getElementById('jurnalMapel').value = jurnal.mata_pelajaran;
        document.getElementById('jurnalMateri').value = jurnal.materi;
        document.getElementById('jurnalTopik').value = jurnal.topik;
        document.getElementById('jurnalJamKe').value = jurnal.jam_ke || '';
        document.getElementById('jurnalDurasi').value = jurnal.durasi || 2;
        document.getElementById('jurnalTujuan').value = jurnal.tujuan_pembelajaran || '';
        document.getElementById('jurnalAktivitas').value = jurnal.aktivitas_pembelajaran || '';
        document.getElementById('jurnalMedia').value = jurnal.media_sumber || '';
        document.getElementById('jurnalPenilaian').value = jurnal.jenis_penilaian || '';
        document.getElementById('jurnalPemahaman').value = jurnal.tingkat_pemahaman || '';
        document.getElementById('jurnalCatatan').value = jurnal.catatan_khusus || '';
        document.getElementById('jurnalTindakLanjut').value = jurnal.tindak_lanjut || '';
        document.getElementById('jurnalStatus').value = jurnal.status || 'Draft';
        document.getElementById('jurnalTTD').checked = jurnal.tanda_tangan || false;

        // Set form mode (edit)
        document.getElementById('tambahJurnalDialog').setAttribute('data-edit-mode', 'true');
        document.getElementById('tambahJurnalDialog').setAttribute('data-edit-id', jurnal.id);
        document.querySelector('#tambahJurnalDialog .dialog-header h3').textContent = 'Edit Jurnal Mengajar';
    }

    resetJurnalForm() {
        const form = document.getElementById('tambahJurnalDialog');
        if (!form) return;
        
        // Manually reset all form fields
        const inputs = form.querySelectorAll('input, select, textarea');
        inputs.forEach(element => {
            if (element.type === 'checkbox') {
                element.checked = false;
            } else if (element.type === 'radio') {
                element.checked = false;
            } else if (element.type === 'button' || element.type === 'submit') {
                // Skip buttons
            } else {
                element.value = '';
            }
        });
        
        // Reset to default values
        const durasiInput = document.getElementById('jurnalDurasi');
        const statusInput = document.getElementById('jurnalStatus');
        const ttdInput = document.getElementById('jurnalTTD');
        
        if (durasiInput) durasiInput.value = 2;
        if (statusInput) statusInput.value = 'Draft';
        if (ttdInput) ttdInput.checked = false;

        // Reset form mode (create)
        form.removeAttribute('data-edit-mode');
        form.removeAttribute('data-edit-id');
        const header = form.querySelector('.dialog-header h3');
        if (header) header.textContent = 'Tambah Jurnal Mengajar';
    }

    // === STATE MANAGEMENT ===

    showInitialState() {
        const initialState = document.getElementById('jurnalInitialState');
        const tableContainer = document.getElementById('jurnalTableContainer');
        
        if (initialState) initialState.style.display = 'block';
        if (tableContainer) tableContainer.style.display = 'none';
    }

    showLoadingState() {
        const initialState = document.getElementById('jurnalInitialState');
        const tableContainer = document.getElementById('jurnalTableContainer');
        
        if (initialState) {
            initialState.innerHTML = `
                <div class="initial-icon">
                    <i class="fas fa-spinner fa-spin"></i>
                </div>
                <div class="initial-title">Memuat Data Jurnal...</div>
                <div class="initial-subtitle">
                    Sedang mengambil data jurnal mengajar dari server
                </div>
            `;
            initialState.style.display = 'block';
        }
        if (tableContainer) tableContainer.style.display = 'none';
    }

    showTableState() {
        const initialState = document.getElementById('jurnalInitialState');
        const tableContainer = document.getElementById('jurnalTableContainer');
        
        if (initialState) initialState.style.display = 'none';
        if (tableContainer) tableContainer.style.display = 'block';
    }

    // === UTILITY METHODS ===

    formatTanggal(tanggalString) {
        const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
        return new Date(tanggalString).toLocaleDateString('id-ID', options);
    }

    truncateText(text, maxLength) {
        if (!text) return '-';
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    }

    isiJurnalHariIni() {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('jurnalTanggal').value = today;
    }

    gunakanTemplatePembelajaran() {
        // Template untuk aktivitas pembelajaran
        document.getElementById('jurnalAktivitas').value = 
            `1. Pembukaan dan apersepsi\n2. Penjelasan materi oleh guru\n3. Diskusi dan tanya jawab\n4. Latihan soal/praktik\n5. Penutup dan refleksi`;
        
        // Template untuk media
        document.getElementById('jurnalMedia').value = 
            `- Buku teks\n- Laptop dan proyektor\n- Lembar kerja\n- Alat peraga (jika ada)`;
        
        this.ui.showNotification('Template pembelajaran telah diisi', 'success');
    }

    // Initialize defaults
    initDefaults() {
        // Set default tahun ke tahun sekarang
        const currentYear = new Date().getFullYear();
        const tahunSelect = document.getElementById('filterTahunJurnal');
        if (tahunSelect) {
            tahunSelect.value = currentYear.toString();
            this.currentTahunFilter = currentYear.toString();
        }

        // Set default bulan ke bulan sekarang
        const currentMonth = new Date().getMonth() + 1;
        const bulanSelect = document.getElementById('filterBulanJurnal');
        if (bulanSelect) {
            bulanSelect.value = currentMonth.toString();
            this.currentBulanFilter = currentMonth.toString();
        }

        // Show initial state
        this.showInitialState();
    }
}

// Export untuk global access
window.JurnalManager = JurnalManager;