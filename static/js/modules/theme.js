class Theme {
    constructor() {
        this.selectedTheme = 'blue';
        this.themeChangeTime = null;
        this.init();
    }

    init() {
        this.loadSavedTheme();
        this.setupThemeSelector();
    }

    loadSavedTheme() {
        const savedTheme = localStorage.getItem('selectedTheme') || 'blue';
        this.changeTheme(savedTheme);
    }

    changeTheme(themeName) {
        const body = document.body;
        const allThemes = [
            'blue', 'green', 'purple', 'red', 'dark',
            'pastel-blue', 'pastel-green', 'pastel-purple', 'pastel-pink', 'pastel-orange',
            'pastel-teal', 'pastel-lavender', 'pastel-mint', 'pastel-coral', 'pastel-sky'
        ];
        
        body.classList.remove(...allThemes.map(theme => `theme-${theme}`));
        body.classList.add(`theme-${themeName}`);
        
        localStorage.setItem('selectedTheme', themeName);
        this.themeChangeTime = new Date();
        localStorage.setItem('themeChangeTime', this.themeChangeTime.toISOString());
        this.selectedTheme = themeName;
    }

    setupThemeSelector() {
        // Setup akan dilakukan ketika dialog dibuka
    }

    selectTheme(themeName) {
        this.selectedTheme = themeName;
        
        // Update UI selection
        document.querySelectorAll('.theme-card').forEach(card => {
            card.classList.remove('selected');
        });
        
        const selectedCard = document.querySelector(`[data-theme="${themeName}"]`);
        if (selectedCard) {
            selectedCard.classList.add('selected');
        }
        
        this.updateCurrentThemePreview(themeName);
        this.applyThemePreview(themeName);
    }

    applyThemePreview(themeName) {
        const body = document.body;
        const allThemes = [
            'blue', 'green', 'purple', 'red', 'dark',
            'pastel-blue', 'pastel-green', 'pastel-purple', 'pastel-pink', 'pastel-orange',
            'pastel-teal', 'pastel-lavender', 'pastel-mint', 'pastel-coral', 'pastel-sky'
        ];
        
        body.classList.remove(...allThemes.map(theme => `theme-${theme}`));
        body.classList.add(`theme-${themeName}`);
    }

    applySelectedTheme() {
        this.changeTheme(this.selectedTheme);
        this.updateCurrentThemeInfo();
        
        // PERBAIKAN: Gunakan window.showNotification daripada this.ui.showNotification
        if (window.showNotification) {
            window.showNotification(`Tema "${this.getThemeDisplayName(this.selectedTheme)}" berhasil diterapkan!`, 'success');
        }
        
        if (window.app && window.app.modules.ui) {
            window.app.modules.ui.closeDialog('themeSelectorDialog');
        }
    }

    resetToDefaultTheme() {
        this.selectTheme('blue');
        if (window.showNotification) {
            window.showNotification('Tema direset ke default Blue Classic!', 'info');
        }
    }

    randomTheme() {
        const themes = [
            'blue', 'green', 'purple', 'red', 'dark',
            'pastel-blue', 'pastel-green', 'pastel-purple', 'pastel-pink', 'pastel-orange',
            'pastel-teal', 'pastel-lavender', 'pastel-mint', 'pastel-coral', 'pastel-sky'
        ];
        
        const randomTheme = themes[Math.floor(Math.random() * themes.length)];
        this.selectTheme(randomTheme);
        if (window.showNotification) {
            window.showNotification(`Tema acak: ${this.getThemeDisplayName(randomTheme)}`, 'info');
        }
    }

    updateCurrentThemePreview(themeName) {
        const themeSample = document.getElementById('currentThemeSample');
        const themeNameElement = document.getElementById('currentThemeName');
        const themeDescElement = document.getElementById('currentThemeDesc');
        
        if (themeSample) {
            themeSample.className = 'theme-sample';
            themeSample.style.color = this.getThemeColor(themeName);
        }
        
        if (themeNameElement) {
            themeNameElement.textContent = this.getThemeDisplayName(themeName);
        }
        
        if (themeDescElement) {
            themeDescElement.textContent = this.getThemeDescription(themeName);
        }
    }

    updateCurrentThemeInfo() {
        const appliedTime = document.getElementById('themeAppliedTime');
        const savedStatus = document.getElementById('themeSavedStatus');
        
        if (appliedTime && this.themeChangeTime) {
            appliedTime.textContent = this.getTimeAgo(this.themeChangeTime);
        }
        
        if (savedStatus) {
            savedStatus.textContent = 'Auto-saved';
            savedStatus.style.color = 'var(--office-success)';
        }
    }

    getThemeDisplayName(themeName) {
        const themeNames = {
            'blue': 'Blue Classic',
            'green': 'Green Classic', 
            'purple': 'Purple Classic',
            'red': 'Red Classic',
            'dark': 'Dark Mode',
            'pastel-blue': 'Pastel Blue',
            'pastel-green': 'Pastel Green',
            'pastel-purple': 'Pastel Purple',
            'pastel-pink': 'Pastel Pink',
            'pastel-orange': 'Pastel Orange',
            'pastel-teal': 'Pastel Teal',
            'pastel-lavender': 'Pastel Lavender',
            'pastel-mint': 'Pastel Mint',
            'pastel-coral': 'Pastel Coral',
            'pastel-sky': 'Pastel Sky'
        };
        
        return themeNames[themeName] || themeName;
    }

    getThemeDescription(themeName) {
        const descriptions = {
            'blue': 'Tema Office standar yang familiar',
            'green': 'Hijau profesional dan menenangkan',
            'purple': 'Ungu kreatif dan inspiratif', 
            'red': 'Merah energik dan penuh semangat',
            'dark': 'Mode gelap untuk kenyamanan mata',
            'pastel-blue': 'Biru lembut dan calming',
            'pastel-green': 'Hijau segar dan natural',
            'pastel-purple': 'Ungu lembut dan elegan',
            'pastel-pink': 'Pink menyenangkan dan friendly',
            'pastel-orange': 'Oranye cerah dan optimis',
            'pastel-teal': 'Teal elegan dan sophisticated',
            'pastel-lavender': 'Lavender calming dan peaceful',
            'pastel-mint': 'Mint menyegarkan dan clean',
            'pastel-coral': 'Coral hangat dan inviting',
            'pastel-sky': 'Biru langit yang cerah'
        };
        
        return descriptions[themeName] || 'Tema personalisasi';
    }

    getThemeColor(themeName) {
        const colors = {
            'blue': '#2B579A',
            'green': '#107C10',
            'purple': '#5C2D91',
            'red': '#D83B01', 
            'dark': '#323130',
            'pastel-blue': '#6A8DE8',
            'pastel-green': '#5DBE7E',
            'pastel-purple': '#9D7AD6',
            'pastel-pink': '#E87CA7',
            'pastel-orange': '#FF9E6D',
            'pastel-teal': '#4ECDC4',
            'pastel-lavender': '#B19CD9',
            'pastel-mint': '#77DD77',
            'pastel-coral': '#FF6B6B',
            'pastel-sky': '#87CEEB'
        };
        
        return colors[themeName] || '#2B579A';
    }

    getTimeAgo(date) {
        if (!date) return 'Never';
        
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        
        if (diffMins < 1) return 'Baru saja';
        if (diffMins === 1) return '1 menit lalu';
        if (diffMins < 60) return `${diffMins} menit lalu`;
        
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours === 1) return '1 jam lalu';
        if (diffHours < 24) return `${diffHours} jam lalu`;
        
        return date.toLocaleDateString('id-ID');
    }
}

// Export untuk global access
window.Theme = Theme;