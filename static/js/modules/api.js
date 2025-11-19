// API Module - Complete version
class API {
    constructor() {
        this.baseURL = '';
    }

    async request(endpoint, options = {}) {
        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            });
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    // Kelas endpoints
    async getKelas() {
        return await this.request('/api/kelas');
    }

    async createKelas(data) {
        return await this.request('/api/kelas', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async updateKelas(id, data) {
        return await this.request(`/api/kelas/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    async deleteKelas(id) {
        return await this.request(`/api/kelas/${id}`, {
            method: 'DELETE'
        });
    }

    // Siswa endpoints
    async getSiswa(kelasFilter = 'all') {
        return await this.request(`/api/siswa?kelas=${kelasFilter}`);
    }

    async createSiswa(data) {
        return await this.request('/api/siswa', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async updateSiswa(id, data) {
        return await this.request(`/api/siswa/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    async deleteSiswa(id) {
        return await this.request(`/api/siswa/${id}`, {
            method: 'DELETE'
        });
    }

    // Materi endpoints
    async getMateri() {
        return await this.request('/api/materi');
    }

    async createMateri(data) {
        return await this.request('/api/materi', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async updateMateri(id, data) {
        return await this.request(`/api/materi/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    async deleteMateri(id) {
        return await this.request(`/api/materi/${id}`, {
            method: 'DELETE'
        });
    }

    // Semester endpoints
    async getSemester() {
        return await this.request('/api/semester');
    }

    async createSemester(data) {
        return await this.request('/api/semester', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async updateSemester(id, data) {
        return await this.request(`/api/semester/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    async deleteSemester(id) {
        return await this.request(`/api/semester/${id}`, {
            method: 'DELETE'
        });
    }

    async activateSemester(id) {
        return await this.request(`/api/semester/${id}/activate`, {
            method: 'PUT'
        });
    }

// Absensi endpoints
async getAbsensi(kelas, tanggal) {
    try {
        console.log('🔗 API.getAbsensi called with:', { kelas, tanggal });
        
        const endpoint = `/api/absensi?kelas=${encodeURIComponent(kelas)}&tanggal=${tanggal}`;
        console.log('🌐 API URL:', endpoint);
        
        const data = await this.request(endpoint);
        console.log('📨 API.getAbsensi returned:', data);
        
        return data;
    } catch (error) {
        console.error('❌ API.getAbsensi error:', error);
        throw error;
    }
}

    async saveAbsensi(data) {
        return await this.request('/api/absensi', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    // Nilai endpoints
    async getNilaiFormatif(kelas, materi, tanggal) {
        return await this.request(`/api/nilai/formatif?kelas=${kelas}&materi=${materi}&tanggal=${tanggal}`);
    }

    async getNilaiSumatif(jenis, kelas, tanggal) {
        return await this.request(`/api/nilai/sumatif?jenis=${jenis}&kelas=${kelas}&tanggal=${tanggal}`);
    }

    async saveNilaiFormatif(data) {
        return await this.request('/api/nilai/formatif', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async saveNilaiSumatif(data) {
        return await this.request('/api/nilai/sumatif', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async updateNilaiFormatif(data) {
        // For individual updates, you might need a different endpoint
        return await this.saveNilaiFormatif(data);
    }

    async updateNilaiSumatif(data) {
        // For individual updates, you might need a different endpoint
        return await this.saveNilaiSumatif(data);
    }

    // Jurnal endpoints
    async getJurnal() {
        return await this.request('/api/jurnal');
    }

    async createJurnal(data) {
        return await this.request('/api/jurnal', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async updateJurnal(id, data) {
        return await this.request(`/api/jurnal/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    async deleteJurnal(id) {
        return await this.request(`/api/jurnal/${id}`, {
            method: 'DELETE'
        });
    }

    // Dashboard endpoints
    async getDashboardData() {
        return await this.request('/api/dashboard');
    }

    // Pengguna endpoints
    async getPengguna() {
        return await this.request('/api/pengguna');
    }

    async updatePengguna(data) {
        return await this.request('/api/pengguna', {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    async getBobotNilai() {
        return await this.request('/api/bobot-nilai');
    }

    async updateBobotNilai(data) {
        return await this.request('/api/bobot-nilai', {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    // Legger endpoints
    async getLegger(kelas, semester) {
        return await this.request(`/api/legger?kelas=${kelas}&semester=${semester}`);
    }
    
    // Database endpoints
    async getDatabaseInfo() {
        return await this.request('/api/database/info');
    }

    async backupDatabase() {
        // Backup returns a file, so we need to handle it differently
        const response = await fetch('/api/database/backup', {
            method: 'POST'
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }
        
        // Get filename from Content-Disposition header or use default
        const contentDisposition = response.headers.get('Content-Disposition');
        let filename = 'database_backup.db';
        if (contentDisposition) {
            const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
            if (filenameMatch && filenameMatch[1]) {
                filename = filenameMatch[1].replace(/['"]/g, '');
            }
        }
        
        // Download the file
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        return { message: 'Backup downloaded successfully', filename: filename };
    }

    async restoreDatabase(formData) {
        // For file upload, use FormData
        const response = await fetch('/api/database/restore', {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    }

    async optimizeDatabase() {
        return await this.request('/api/database/optimize', {
            method: 'POST'
        });
    }

    async resetDatabase() {
        return await this.request('/api/database/reset', {
            method: 'POST'
        });
    }
}

// Export untuk global access
window.API = API;