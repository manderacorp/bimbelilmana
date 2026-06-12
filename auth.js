// KUNCI URL WEB APP DEPLOYMENT GAS ANDA
const API_URL = "https://script.google.com/macros/s/AKfycbw62osCNy3X1e1S2V3q4lLgVdQuBDcxWkOSQt5Cv56jcy2LYlYpPdxMSUYxpqclzDH4EQ/exec"; 

// Inisialisasi Selektor Kontrol DOM
const mainPage = document.getElementById('main-page');
const navItems = document.querySelectorAll('.nav-item');
const contentSections = document.querySelectorAll('.content-section');

let currentActiveMenu = "dashboard";

// Aplikasi Otomatis Langsung Terbuka & Memuat Dashboard
document.addEventListener('DOMContentLoaded', () => {
    // Pastikan halaman utama tampil
    if (mainPage) mainPage.classList.remove('hidden-system');
    
    // Otomatis panggil data dashboard utama
    if (typeof fetchDashboard === 'function') {
        fetchDashboard();
    }
});

// Logika Perpindahan Menu Navigasi
navItems.forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        const target = item.getAttribute('data-target');
        
        // Atur style menu yang aktif
        navItems.forEach(nav => {
            nav.classList.remove('bg-indigo-700', 'text-white', 'font-medium');
            nav.classList.add('text-indigo-100', 'hover:bg-indigo-800');
        });
        
        item.classList.remove('text-indigo-100', 'hover:bg-indigo-800');
        item.classList.add('bg-indigo-700', 'text-white', 'font-medium');

        // Sembunyikan semua section
        contentSections.forEach(section => section.classList.add('hidden'));
        
        // Tampilkan section target
        const targetSection = document.getElementById(`content-${target}`);
        if (targetSection) targetSection.classList.remove('hidden');

        // Trigger Fetch Data berdasarkan menu yang dipilih
        currentActiveMenu = target;
        if (target === 'dashboard') {
            if (typeof fetchDashboard === 'function') fetchDashboard();
        } else if (target === 'siswa') {
            if (typeof fetchSiswa === 'function') fetchSiswa();
        } else if (target === 'tentor') {
            if (typeof fetchTentor === 'function') fetchTentor();
        } else if (target === 'jurnal') {
            if (typeof fetchJurnal === 'function') fetchJurnal();
        } else if (target === 'invoice') {
            if (typeof fetchInvoice === 'function') fetchInvoice();
        } else if (target === 'slipgaji') {
            if (typeof fetchSlipgaji === 'function') fetchSlipgaji();
        } else if (target === 'keuangan') {
            if (typeof fetchKeuangan === 'function') fetchKeuangan();
        } else if (target === 'usermanage') {
            if (typeof fetchTentor === 'function') {
                currentActiveMenu = "usermanage";
                const container = document.getElementById('container-usermanage');
                if (container) {
                    container.innerHTML = `<span class="text-xs text-slate-400"><i class="fa-solid fa-spinner animate-spin mr-1"></i> Memuat Akses Login...</span>`;
                    
                    fetch(`${API_URL}?action=getDataTentor`)
                        .then(res => res.json())
                        .then(res => renderTableModular(container, res, ["ID", "Nama Tentor", "Username", "Password"], 'Data Tentor'))
                        .catch(() => container.innerHTML = `<div class="text-xs text-rose-500 py-4 text-center">Gagal memuat data akses.</div>`);
                }
            }
        }
    });
});

// Utilitas Global Format Mata Uang Rupiah (Penyelamat Ekosistem Data)
function formatIDR(num) {
    if (num === null || num === undefined) return 'Rp 0';
    const number = Number(num);
    if (isNaN(number)) return num;
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(number);
}
