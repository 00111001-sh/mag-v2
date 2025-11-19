class SemesterManager {
    constructor() {
        this.api = new API();
        this.ui = new UI();
        this.data = [];
    }

    async loadData() {
        try {
            this.data = await this.api.getSemester();
            this.renderTable();
        } catch (error) {
            this.ui.showNotification('Gagal memuat data semester', 'error');
            console.error('Error loading semester:', error);
        }
    }

    renderTable() {
        const table = document.getElementById('semesterTable');
        if (!table) return;

        if (this.data.length === 0) {
            table.innerHTML = this.ui.createEmptyState('semester');
            return;
        }

        table.innerHTML = '';
        this.data.forEach((semester, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${semester.tahun_ajaran}</td>
                <td>${semester.semester === '1' ? 'Ganjil' : 'Genap'}</td>
                <td>${semester.tanggal_mulai}</td>
                <td>${semester.tanggal_selesai}</td>
                <td>
                    <span style="color: ${semester.status === 'Aktif' ? 'green' : 'gray'}; font-weight: bold;">
                        ${semester.status}
                    </span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="action-icon-btn ${semester.status === 'Aktif' ? 'active' : ''}" 
                                onclick="app.modules.semester.activate(${semester.id})" 
                                title="${semester.status === 'Aktif' ? 'Aktif' : 'Aktifkan'}">
                            <i class="fas fa-check"></i>
                        </button>
                        <button class="action-icon-btn" onclick="app.modules.semester.edit(${semester.id})" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-icon-btn" onclick="app.modules.semester.delete(${semester.id})" title="Hapus">
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
            await this.api.createSemester(data);
            await this.loadData();
            this.ui.showNotification('Semester berhasil ditambahkan', 'success');
            this.ui.closeDialog('tambahSemesterDialog');
            this.resetForm();
        } catch (error) {
            this.ui.showNotification('Gagal menambah semester', 'error');
        }
    }

    async update(id, data) {
        try {
            await this.api.updateSemester(id, data);
            await this.loadData();
            this.ui.showNotification('Semester berhasil diupdate', 'success');
        } catch (error) {
            this.ui.showNotification('Gagal mengupdate semester', 'error');
        }
    }

    async delete(id) {
        if (!confirm('Apakah Anda yakin ingin menghapus semester ini?')) return;

        try {
            await this.api.deleteSemester(id);
            await this.loadData();
            this.ui.showNotification('Semester berhasil dihapus', 'success');
        } catch (error) {
            this.ui.showNotification('Gagal menghapus semester', 'error');
        }
    }

    async activate(id) {
        try {
            await this.api.activateSemester(id);
            await this.loadData();
            this.ui.showNotification('Semester berhasil diaktifkan', 'success');
        } catch (error) {
            this.ui.showNotification('Gagal mengaktifkan semester', 'error');
        }
    }

    edit(id) {
        const semester = this.data.find(s => s.id === id);
        if (!semester) return;

        // Fill form with semester data
        document.getElementById('editTahunAjaran').value = semester.tahun_ajaran;
        document.getElementById('editSemester').value = semester.semester;
        document.getElementById('editTanggalMulai').value = semester.tanggal_mulai;
        document.getElementById('editTanggalSelesai').value = semester.tanggal_selesai;
        document.getElementById('editStatusSemester').value = semester.status;
        document.getElementById('editMinimalKehadiran').value = semester.minimal_kehadiran;
        document.getElementById('editNilaiKKM').value = semester.nilai_kkm;

        // Show edit dialog
        this.ui.showDialog('editSemesterDialog');
        
        // Set up save handler
        const saveBtn = document.getElementById('saveEditSemester');
        saveBtn.onclick = () => this.saveEdit(id);
    }

    async saveEdit(id) {
        const data = {
            tahun_ajaran: document.getElementById('editTahunAjaran').value,
            semester: document.getElementById('editSemester').value,
            tanggal_mulai: document.getElementById('editTanggalMulai').value,
            tanggal_selesai: document.getElementById('editTanggalSelesai').value,
            status: document.getElementById('editStatusSemester').value,
            minimal_kehadiran: parseInt(document.getElementById('editMinimalKehadiran').value),
            nilai_kkm: parseInt(document.getElementById('editNilaiKKM').value)
        };

        await this.update(id, data);
        this.ui.closeDialog('editSemesterDialog');
    }

    resetForm() {
        const form = document.getElementById('tambahSemesterDialog');
        if (form) {
            form.querySelectorAll('input, select, textarea').forEach(element => {
                if (element.type !== 'button' && element.type !== 'submit') {
                    element.value = '';
                }
            });
        }
    }

    generateTahunAjaran() {
        const currentYear = new Date().getFullYear();
        const tahunAjaran = `${currentYear}/${currentYear + 1}`;
        document.getElementById('tahunAjaran').value = tahunAjaran;
        this.ui.showNotification('Tahun ajaran otomatis diisi!', 'success');
    }

    calculateDuration() {
        const tanggalMulai = document.getElementById('tanggalMulai').value;
        const tanggalSelesai = document.getElementById('tanggalSelesai').value;
        
        if (tanggalMulai && tanggalSelesai) {
            const start = new Date(tanggalMulai);
            const end = new Date(tanggalSelesai);
            const diffTime = Math.abs(end - start);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            document.getElementById('durasiSemester').value = `${diffDays} hari`;
        }
    }
}

// Export untuk global access
window.SemesterManager = SemesterManager;