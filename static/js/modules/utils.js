// Utility functions
class Utils {
    static formatDate(date) {
        return new Date(date).toLocaleDateString('id-ID');
    }

    static formatTime(date) {
        return new Date(date).toLocaleTimeString('id-ID');
    }

    static formatNumber(number) {
        return new Intl.NumberFormat('id-ID').format(number);
    }

    static validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    static validateNISN(nisn) {
        return /^\d{10}$/.test(nisn);
    }

    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    static calculateNilaiAkhir(nilaiFormatif, nilaiUTS, nilaiUAS, bobot) {
        const { formatif, uts, uas, absensi } = bobot;
        return (
            (nilaiFormatif * formatif / 100) +
            (nilaiUTS * uts / 100) + 
            (nilaiUAS * uas / 100)
        );
    }

    static getPredikat(nilai) {
        if (nilai >= 85) return { predikat: 'A', warna: 'success' };
        if (nilai >= 75) return { predikat: 'B', warna: 'info' };
        if (nilai >= 65) return { predikat: 'C', warna: 'warning' };
        return { predikat: 'D', warna: 'danger' };
    }
}

// Export untuk global access
window.Utils = Utils;