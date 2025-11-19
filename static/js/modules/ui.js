class UI {
    constructor() {
        this.setupDialogSystem();
    }

    setupDialogSystem() {
        // Dialog event listeners
        document.getElementById('overlay').addEventListener('click', () => {
            this.closeAllDialogs();
        });

        // Close buttons
        document.querySelectorAll('.dialog-close').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const dialog = e.target.closest('.modern-dialog');
                this.closeDialog(dialog.id);
            });
        });
    }

    showDialog(dialogId) {
        const dialog = document.getElementById(dialogId);
        const overlay = document.getElementById('overlay');
        
        if (!dialog) return;

        dialog.classList.remove('hiding');
        overlay.classList.remove('hiding');
        
        dialog.style.display = 'block';
        overlay.style.display = 'block';
        
        setTimeout(() => {
            dialog.classList.add('show');
            overlay.classList.add('show');
        }, 10);
        
        this.updateDialogFooter(dialogId);
    }

    closeDialog(dialogId) {
        const dialog = document.getElementById(dialogId);
        const overlay = document.getElementById('overlay');
        
        if (!dialog) return;

        dialog.classList.add('hiding');
        overlay.classList.add('hiding');
        dialog.classList.remove('show');
        overlay.classList.remove('show');
        
        setTimeout(() => {
            dialog.style.display = 'none';
            overlay.style.display = 'none';
            dialog.classList.remove('hiding');
            overlay.classList.remove('hiding');
        }, 400);
    }

    closeAllDialogs() {
        document.querySelectorAll('.modern-dialog').forEach(dialog => {
            if (dialog.style.display === 'block') {
                this.closeDialog(dialog.id);
            }
        });
    }

showContent(contentId) {
    console.log('Showing content:', contentId);
    
    // 1. Update ribbon tabs active state
    const ribbonTabs = document.querySelectorAll('.ribbon-tab');
    ribbonTabs.forEach(tab => {
        tab.classList.remove('active');
        if (tab.getAttribute('data-tab') === contentId) {
            tab.classList.add('active');
        }
    });
    
    // 2. Update ribbon panels active state
    const ribbonPanels = document.querySelectorAll('.ribbon-panel');
    ribbonPanels.forEach(panel => {
        panel.classList.remove('active');
        if (panel.getAttribute('data-tab') === contentId) {
            panel.classList.add('active');
        }
    });
    
    // 3. Update content areas active state
    const contentAreas = document.querySelectorAll('.content-area');
    contentAreas.forEach(content => {
        content.classList.remove('active');
    });
    
    // Show selected content
    const targetContent = document.getElementById(contentId);
    if (targetContent) {
        targetContent.classList.add('active');
        console.log('Content activated:', contentId);
        
        // Load data for specific content areas
        if (contentId === 'pengguna' && typeof window.loadPenggunaData === 'function') {
            window.loadPenggunaData();
        } else if (contentId === 'settings' && typeof window.loadBobotNilaiData === 'function') {
            window.loadBobotNilaiData();
        }
    } else {
        console.error('Content not found:', contentId);
    }
}

    toggleRibbon() {
        const ribbon = document.querySelector('.ribbon-menu');
        const button = document.getElementById('showRibbonBtn');
        
        if (ribbon.classList.contains('hidden')) {
            ribbon.classList.remove('hidden');
            button.innerHTML = '<i class="fas fa-chevron-down"></i>';
            button.title = 'Hide Ribbon';
        } else {
            ribbon.classList.add('hidden');
            button.innerHTML = '<i class="fas fa-chevron-up"></i>';
            button.title = 'Show Ribbon';
        }
    }

    showNotification(message, type = 'info') {
        // Remove existing notifications
        document.querySelectorAll('.notification').forEach(notification => {
            notification.remove();
        });
        
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    getNotificationIcon(type) {
        const icons = {
            'success': 'check-circle',
            'error': 'exclamation-circle',
            'warning': 'exclamation-triangle',
            'info': 'info-circle'
        };
        return icons[type] || 'info-circle';
    }

    createEmptyState(module) {
        const config = {
            'kelas': { icon: '🏫', title: 'Belum Ada Data Kelas', subtitle: 'Klik "Tambah Kelas" untuk menambahkan data' },
            'siswa': { icon: '👨‍🎓', title: 'Belum Ada Data Siswa', subtitle: 'Klik "Tambah Siswa" untuk menambahkan data' },
            'materi': { icon: '📚', title: 'Belum Ada Data Materi', subtitle: 'Klik "Tambah Materi" untuk menambahkan data' },
            'default': { icon: '📁', title: 'Belum Ada Data', subtitle: 'Tambahkan data untuk memulai' }
        };

        const { icon, title, subtitle } = config[module] || config.default;

        return `
            <tr>
                <td colspan="100" class="empty-state-modern">
                    <div class="empty-icon">${icon}</div>
                    <div class="empty-title">${title}</div>
                    <div class="empty-subtitle">${subtitle}</div>
                </td>
            </tr>
        `;
    }

    updateDialogFooter(dialogId) {
        const dialog = document.getElementById(dialogId);
        const dateElements = dialog?.querySelectorAll('[id$="DialogDate"]');
        const today = new Date().toLocaleDateString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        dateElements?.forEach(element => {
            element.textContent = today;
        });
    }
}

// Export untuk global access
window.UI = UI;