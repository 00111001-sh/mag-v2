class SiswaManager {
    constructor() {
        this.api = new API();
        this.ui = new UI();
        this.data = [];
    }

    async loadData() {
        try {
            const kelasFilter = document.getElementById('filterKelasSiswa')?.value || 'all';
            this.data = await this.api.getSiswa(kelasFilter);
            this.renderTable();
        } catch (error) {
            this.ui.showNotification('Gagal memuat data siswa', 'error');
            console.error('Error loading siswa:', error);
        }
    }

    renderTable() {
        const table = document.getElementById('siswaTable');
        if (!table) return;

        if (this.data.length === 0) {
            table.innerHTML = this.ui.createEmptyState('siswa');
            return;
        }

        table.innerHTML = '';
        this.data.forEach((siswa, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${siswa.nisn}</td>
                <td>${siswa.nama}</td>
                <td>${siswa.kelas}</td>
                <td>${siswa.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'}</td>
                <td>
                    <div class="action-buttons">
                        <button class="action-icon-btn" onclick="app.modules.siswa.edit(${siswa.id})" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-icon-btn" onclick="app.modules.siswa.delete(${siswa.id})" title="Hapus">
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
            await this.api.createSiswa(data);
            await this.loadData();
            this.ui.showNotification('Siswa berhasil ditambahkan', 'success');
            this.ui.closeDialog('tambahSiswaDialog');
            this.resetForm();
        } catch (error) {
            this.ui.showNotification('Gagal menambah siswa: ' + (error.message || 'NISN mungkin sudah terdaftar'), 'error');
        }
    }

    async update(id, data) {
        try {
            await this.api.updateSiswa(id, data);
            await this.loadData();
            this.ui.showNotification('Siswa berhasil diupdate', 'success');
        } catch (error) {
            this.ui.showNotification('Gagal mengupdate siswa', 'error');
        }
    }

    async delete(id) {
        if (!confirm('Apakah Anda yakin ingin menghapus siswa ini?')) return;

        try {
            await this.api.deleteSiswa(id);
            await this.loadData();
            this.ui.showNotification('Siswa berhasil dihapus', 'success');
        } catch (error) {
            this.ui.showNotification('Gagal menghapus siswa', 'error');
        }
    }

    edit(id) {
        const siswa = this.data.find(s => s.id === id);
        if (!siswa) return;

        // Fill form with student data
        document.getElementById('editNisnSiswa').value = siswa.nisn;
        document.getElementById('editNamaSiswa').value = siswa.nama;
        document.getElementById('editKelasSiswa').value = siswa.kelas;
        document.getElementById('editJenisKelaminSiswa').value = siswa.jenis_kelamin;
        document.getElementById('editTempatLahirSiswa').value = siswa.tempat_lahir || '';
        document.getElementById('editTanggalLahirSiswa').value = siswa.tanggal_lahir || '';
        document.getElementById('editAlamatSiswa').value = siswa.alamat || '';
        document.getElementById('editTeleponSiswa').value = siswa.telepon || '';
        document.getElementById('editEmailSiswa').value = siswa.email || '';

        // Show edit dialog
        this.ui.showDialog('editSiswaDialog');
        
        // Set up save handler
        const saveBtn = document.getElementById('saveEditSiswa');
        saveBtn.onclick = () => this.saveEdit(id);
    }

    async saveEdit(id) {
        const data = {
            nisn: document.getElementById('editNisnSiswa').value,
            nama: document.getElementById('editNamaSiswa').value,
            kelas: document.getElementById('editKelasSiswa').value,
            jenis_kelamin: document.getElementById('editJenisKelaminSiswa').value,
            tempat_lahir: document.getElementById('editTempatLahirSiswa').value,
            tanggal_lahir: document.getElementById('editTanggalLahirSiswa').value,
            alamat: document.getElementById('editAlamatSiswa').value,
            telepon: document.getElementById('editTeleponSiswa').value,
            email: document.getElementById('editEmailSiswa').value
        };

        await this.update(id, data);
        this.ui.closeDialog('editSiswaDialog');
    }

    resetForm() {
        const form = document.getElementById('tambahSiswaDialog');
        if (form) {
            form.querySelectorAll('input, select, textarea').forEach(element => {
                if (element.type !== 'button' && element.type !== 'submit') {
                    element.value = '';
                }
            });
        }
    }

    generateNISN() {
        const randomNISN = Math.floor(1000000000 + Math.random() * 9000000000);
        document.getElementById('nisnSiswa').value = randomNISN.toString();
        this.ui.showNotification('NISN berhasil digenerate!', 'success');
    }
}

// Export untuk global access
window.SiswaManager = SiswaManager;