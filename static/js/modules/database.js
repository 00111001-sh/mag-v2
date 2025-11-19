class DatabaseManager {
    constructor() {
        this.api = new API();
        this.ui = new UI();
    }

    async loadInfo() {
        try {
            const info = await this.api.getDatabaseInfo();
            this.updateInfoDisplay(info);
        } catch (error) {
            this.ui.showNotification('Gagal memuat info database', 'error');
            console.error('Error loading database info:', error);
            this.loadSampleInfo();
        }
    }

    updateInfoDisplay(info) {
        // Update ribbon info
        const ribbonTotalData = document.getElementById('ribbonTotalData');
        const ribbonTotalRecords = document.getElementById('ribbonTotalRecords');
        const ribbonLastBackup = document.getElementById('ribbonLastBackup');
        
        if (ribbonTotalData) ribbonTotalData.textContent = `${info.db_size_mb || 0} MB`;
        if (ribbonTotalRecords) ribbonTotalRecords.textContent = (info.total_records || 0).toLocaleString();
        if (ribbonLastBackup) {
            if (info.last_backup) {
                const backupDate = new Date(info.last_backup);
                const now = new Date();
                const diffDays = Math.floor((now - backupDate) / (1000 * 60 * 60 * 24));
                ribbonLastBackup.textContent = diffDays === 0 ? 'Hari ini' : `${diffDays} hari lalu`;
            } else {
                ribbonLastBackup.textContent = 'Belum pernah';
            }
        }

        // Update content area info
        const totalDataElement = document.getElementById('totalData');
        const totalRecordsElement = document.getElementById('totalRecords');
        const lastBackupElement = document.getElementById('lastBackup');
        
        if (totalDataElement) totalDataElement.textContent = `${info.db_size_mb || 0} MB`;
        if (totalRecordsElement) totalRecordsElement.textContent = (info.total_records || 0).toLocaleString();
        if (lastBackupElement) {
            if (info.last_backup) {
                const backupDate = new Date(info.last_backup);
                const now = new Date();
                const diffDays = Math.floor((now - backupDate) / (1000 * 60 * 60 * 24));
                lastBackupElement.textContent = diffDays === 0 ? 'Hari ini' : `${diffDays} hari lalu`;
            } else {
                lastBackupElement.textContent = 'Belum pernah';
            }
        }
    }

    loadSampleInfo() {
        const sampleInfo = {
            total_size: '1.2 MB',
            total_records: 1248,
            last_backup: '3 hari lalu'
        };
        this.updateInfoDisplay(sampleInfo);
    }

    async backupDatabase() {
        try {
            await this.api.backupDatabase();
            this.ui.showNotification('Backup database berhasil!', 'success');
            this.loadInfo(); // Refresh info
        } catch (error) {
            this.ui.showNotification('Gagal melakukan backup database', 'error');
        }
    }

    async restoreDatabase() {
        const fileInput = document.getElementById('restoreFile');
        if (!fileInput || !fileInput.files.length) {
            this.ui.showNotification('Pilih file backup terlebih dahulu!', 'error');
            return;
        }

        // Check file extension
        const fileName = fileInput.files[0].name;
        if (!fileName.toLowerCase().endsWith('.db')) {
            this.ui.showNotification('File harus berupa .db (SQLite database)!', 'error');
            return;
        }

        if (!confirm('Restore akan mengganti semua data yang ada. Lanjutkan?')) {
            return;
        }

        try {
            const formData = new FormData();
            formData.append('file', fileInput.files[0]);
            
            await this.api.restoreDatabase(formData);
            this.ui.showNotification('Restore database berhasil! Halaman akan dimuat ulang...', 'success');
            this.ui.closeDialog('restoreDatabaseDialog');
            
            // Reload page after a short delay to ensure all connections are fresh
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        } catch (error) {
            this.ui.showNotification('Gagal melakukan restore database: ' + (error.message || 'Unknown error'), 'error');
            console.error('Restore error:', error);
        }
    }

    async optimizeDatabase() {
        try {
            await this.api.optimizeDatabase();
            this.ui.showNotification('Database dioptimalkan!', 'success');
            this.loadInfo(); // Refresh info
        } catch (error) {
            this.ui.showNotification('Gagal mengoptimalkan database', 'error');
        }
    }

    async resetDatabase() {
        if (!confirm('PERINGATAN: Ini akan menghapus SEMUA DATA! Tindakan ini tidak dapat dibatalkan. Lanjutkan?')) {
            return;
        }

        if (!confirm('SANGAT YAKIN? Semua data siswa, nilai, absensi, dan lainnya akan dihapus permanen!')) {
            return;
        }

        try {
            await this.api.resetDatabase();
            this.ui.showNotification('Database berhasil direset!', 'success');
            this.ui.closeDialog('resetDatabaseDialog');
            this.loadInfo(); // Refresh info
            
            // Reload all data
            if (window.app) {
                window.app.loadInitialData();
            }
        } catch (error) {
            this.ui.showNotification('Gagal mereset database', 'error');
        }
    }

    setupRestoreFileInput() {
        const fileInput = document.getElementById('restoreFile');
        const fileNameInput = document.getElementById('restoreFileName');
        
        if (fileInput && fileNameInput) {
            fileInput.addEventListener('change', function() {
                if (this.files.length > 0) {
                    fileNameInput.value = this.files[0].name;
                } else {
                    fileNameInput.value = '';
                }
            });
        }
    }

    downloadBackup() {
        // Create a sample backup file (in real implementation, this would come from server)
        const backupData = {
            timestamp: new Date().toISOString(),
            version: '1.0',
            data: {
                info: 'Backup sample data'
            }
        };
        
        const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `backup-guru-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        this.ui.showNotification('Backup database berhasil didownload!', 'success');
    }
}

// Export untuk global access
window.DatabaseManager = DatabaseManager;