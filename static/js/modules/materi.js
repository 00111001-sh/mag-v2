class MateriManager {
    constructor() {
        this.api = new API();
        this.ui = new UI();
        this.data = [];
    }

    async loadData() {
        try {
            this.data = await this.api.getMateri();
            this.renderTable();
        } catch (error) {
            this.ui.showNotification('Gagal memuat data materi', 'error');
            console.error('Error loading materi:', error);
        }
    }

    renderTable() {
        const table = document.getElementById('materiTable');
        if (!table) return;

        if (this.data.length === 0) {
            table.innerHTML = this.ui.createEmptyState('materi');
            return;
        }

        table.innerHTML = '';
        this.data.forEach((materi, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${materi.judul}</td>
                <td>${materi.kelas}</td>
                <td>${materi.kategori}</td>
                <td>${materi.deskripsi || '-'}</td>
                <td>${materi.tingkat_kesulitan || 'Sedang'}</td>
                <td>
                    <div class="action-buttons">
                        <button class="action-icon-btn" onclick="app.modules.materi.edit(${materi.id})" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-icon-btn" onclick="app.modules.materi.delete(${materi.id})" title="Hapus">
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
            await this.api.createMateri(data);
            await this.loadData();
            this.ui.showNotification('Materi berhasil ditambahkan', 'success');
            this.ui.closeDialog('tambahMateriDialog');
            this.resetForm();
        } catch (error) {
            this.ui.showNotification('Gagal menambah materi', 'error');
        }
    }

    async update(id, data) {
        try {
            await this.api.updateMateri(id, data);
            await this.loadData();
            this.ui.showNotification('Materi berhasil diupdate', 'success');
        } catch (error) {
            this.ui.showNotification('Gagal mengupdate materi', 'error');
        }
    }

    async delete(id) {
        if (!confirm('Apakah Anda yakin ingin menghapus materi ini?')) return;

        try {
            await this.api.deleteMateri(id);
            await this.loadData();
            this.ui.showNotification('Materi berhasil dihapus', 'success');
        } catch (error) {
            this.ui.showNotification('Gagal menghapus materi', 'error');
        }
    }

    edit(id) {
        const materi = this.data.find(m => m.id === id);
        if (!materi) return;

        // Fill form with materi data
        document.getElementById('editJudulMateri').value = materi.judul;
        document.getElementById('editKelasMateri').value = materi.kelas;
        document.getElementById('editKategoriMateri').value = materi.kategori;
        document.getElementById('editDeskripsiMateri').value = materi.deskripsi || '';
        document.getElementById('editKompetensiMateri').value = materi.kompetensi_dasar || '';
        document.getElementById('editKesulitanMateri').value = materi.tingkat_kesulitan || 'Sedang';
        document.getElementById('editWaktuMateri').value = materi.estimasi_waktu || '';

        // Show edit dialog
        this.ui.showDialog('editMateriDialog');
        
        // Set up save handler
        const saveBtn = document.getElementById('saveEditMateri');
        saveBtn.onclick = () => this.saveEdit(id);
    }

    async saveEdit(id) {
        const data = {
            judul: document.getElementById('editJudulMateri').value,
            kelas: document.getElementById('editKelasMateri').value,
            kategori: document.getElementById('editKategoriMateri').value,
            deskripsi: document.getElementById('editDeskripsiMateri').value,
            kompetensi_dasar: document.getElementById('editKompetensiMateri').value,
            tingkat_kesulitan: document.getElementById('editKesulitanMateri').value,
            estimasi_waktu: parseInt(document.getElementById('editWaktuMateri').value) || 2
        };

        await this.update(id, data);
        this.ui.closeDialog('editMateriDialog');
    }

    resetForm() {
        const form = document.getElementById('tambahMateriDialog');
        if (form) {
            form.querySelectorAll('input, select, textarea').forEach(element => {
                if (element.type !== 'button' && element.type !== 'submit') {
                    element.value = '';
                }
            });
        }
    }

    previewMateri() {
        const judul = document.getElementById('judulMateri').value || '[Judul Materi]';
        this.ui.showNotification(`Preview materi: ${judul}`, 'info');
    }
}

// Export untuk global access
window.MateriManager = MateriManager;