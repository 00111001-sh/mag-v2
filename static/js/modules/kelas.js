class KelasManager {
    constructor() {
        this.api = new API();
        this.ui = new UI();
        this.data = [];
    }

    async loadData() {
        try {
            this.data = await this.api.getKelas();
            this.renderTable();
        } catch (error) {
            this.ui.showNotification('Gagal memuat data kelas', 'error');
            console.error('Error loading kelas:', error);
        }
    }

    renderTable() {
        const table = document.getElementById('kelasTable');
        if (!table) return;

        if (this.data.length === 0) {
            table.innerHTML = this.ui.createEmptyState('kelas');
            return;
        }

        table.innerHTML = '';
        this.data.forEach((kelas, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${kelas.nama}</td>
                <td>${kelas.tingkat}</td>
                <td>${kelas.jurusan}</td>
                <td>${kelas.wali_kelas || '-'}</td>
                <td>${kelas.total_siswa || 0}</td>
                <td>
                    <div class="action-buttons">
                        <button class="action-icon-btn" onclick="app.modules.kelas.edit(${kelas.id})" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-icon-btn" onclick="app.modules.kelas.delete(${kelas.id})" title="Hapus">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            table.appendChild(row);
        });
    }

    async create(data) {
        try {
            await this.api.createKelas(data);
            await this.loadData();
            this.ui.showNotification('Kelas berhasil ditambahkan', 'success');
            this.ui.closeDialog('tambahKelasDialog');
        } catch (error) {
            this.ui.showNotification('Gagal menambah kelas', 'error');
        }
    }

    async update(id, data) {
        try {
            await this.api.updateKelas(id, data);
            await this.loadData();
            this.ui.showNotification('Kelas berhasil diupdate', 'success');
        } catch (error) {
            this.ui.showNotification('Gagal mengupdate kelas', 'error');
        }
    }

    async delete(id) {
        if (!confirm('Apakah Anda yakin ingin menghapus kelas ini?')) return;

        try {
            await this.api.deleteKelas(id);
            await this.loadData();
            this.ui.showNotification('Kelas berhasil dihapus', 'success');
        } catch (error) {
            this.ui.showNotification('Gagal menghapus kelas', 'error');
        }
    }

    async edit(id) {
        try {
            // Fetch kelas data from API
            const kelas = await this.api.request(`/api/kelas/${id}`);
            
            // Fill form with kelas data
            document.getElementById('namaKelas').value = kelas.nama;
            document.getElementById('tingkatKelas').value = kelas.tingkat;
            document.getElementById('jurusanKelas').value = kelas.jurusan;
            document.getElementById('waliKelas').value = kelas.wali_kelas || '';
            document.getElementById('kapasitasKelas').value = kelas.kapasitas || 36;

            // Set dialog to edit mode
            const dialog = document.getElementById('tambahKelasDialog');
            if (dialog) {
                dialog.setAttribute('data-edit-mode', 'true');
                dialog.setAttribute('data-edit-id', id);
                const header = dialog.querySelector('.dialog-header h3');
                if (header) header.textContent = 'Edit Kelas';
            }

            // Show dialog
            this.ui.showDialog('tambahKelasDialog');
            
            // Update save button handler
            const saveBtn = dialog?.querySelector('button[onclick*="tambahKelas"]');
            if (saveBtn) {
                saveBtn.onclick = () => this.saveEdit(id);
            }
        } catch (error) {
            this.ui.showNotification('Gagal memuat data kelas', 'error');
            console.error('Error loading kelas:', error);
        }
    }

    async saveEdit(id) {
        const data = {
            nama: document.getElementById('namaKelas').value,
            tingkat: document.getElementById('tingkatKelas').value,
            jurusan: document.getElementById('jurusanKelas').value,
            wali_kelas: document.getElementById('waliKelas').value,
            kapasitas: parseInt(document.getElementById('kapasitasKelas').value) || 36
        };

        await this.update(id, data);
        
        // Reset dialog mode
        const dialog = document.getElementById('tambahKelasDialog');
        if (dialog) {
            dialog.removeAttribute('data-edit-mode');
            dialog.removeAttribute('data-edit-id');
            const header = dialog.querySelector('.dialog-header h3');
            if (header) header.textContent = 'Tambah Kelas';
        }
        
        this.ui.closeDialog('tambahKelasDialog');
        this.resetForm();
    }

    resetForm() {
        const form = document.getElementById('tambahKelasDialog');
        if (form) {
            form.querySelectorAll('input, select').forEach(element => {
                if (element.type !== 'button' && element.type !== 'submit') {
                    element.value = '';
                }
            });
        }
    }
}

// Export untuk global access
window.KelasManager = KelasManager;