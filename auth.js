// KUNCI URL WEB APP DEPLOYMENT GAS ANDA
const API_URL = "https://script.google.com/macros/s/AKfycbw62osCNy3X1e1S2V3q4lLgVdQuBDcxWkOSQt5Cv56jcy2LYlYpPdxMSUYxpqclzDH4EQ/exec"; 

// Inisialisasi Selektor Kontrol DOM Autentikasi
const loginPage = document.getElementById('login-page');
const mainPage = document.getElementById('main-page');
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');
const btnLogout = document.getElementById('btn-logout');
const navItems = document.querySelectorAll('.nav-item');
const contentSections = document.querySelectorAll('.content-section');

let currentActiveMenu = "dashboard";

// Manajemen Sesi Saat Aplikasi Pertama Kali Dimuat
document.addEventListener('DOMContentLoaded', () => {
    const isLogged = localStorage.getItem('bimbel_token');
    if (isLogged) {
        showMainPage(localStorage.getItem('bimbel_role'));
    } else {
        mainPage.classList.add('hidden-system');
        loginPage.classList.remove('hidden-system');
    }
});

// Jalur Proses Form Login (Terisolasi Aman)
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btnSubmit = document.getElementById('btn-login');
    btnSubmit.disabled = true;
    btnSubmit.innerHTML = `<i class="fa-solid fa-circle-notch animate-spin"></i> Validasi...`;
    loginError.classList.add('hidden');

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            body: JSON.stringify({ 
                action: 'login', 
                username: document.getElementById('username').value, 
                password: document.getElementById('password').value 
            })
        });
        
        if (!response.ok) throw new Error(`Server bermasalah: ${response.status}`);
        const res = await response.json();
        
        if (res.status === 'success') {
            localStorage.setItem('bimbel_token', res.token);
            localStorage.setItem('bimbel_username', res.username);
            localStorage.setItem('bimbel_role', res.role);
            showMainPage(res.role);
        } else {
            loginError.innerText = res.message; 
            loginError.classList.remove('hidden');
        }
    } catch (err) {
        console.error(err);
        loginError.innerText = "Koneksi database bermasalah / Akses ditolak."; 
        loginError.classList.remove('hidden');
    } finally {
        btnSubmit.disabled = false; 
        btnSubmit.innerHTML = `<span>Masuk</span> <i class="fa-solid fa-right-to-bracket text-xs"></i>`;
    }
});

// Aksi Keluar Sistem (Logout)
btnLogout.addEventListener('click', () => {
    localStorage.clear();
    window.location.reload();
});

function showMainPage(role) {
    loginPage.classList.add('hidden-system');
    mainPage.classList.remove('hidden-system');
    document.getElementById('user-role-display').innerText = `Role: ${role}`;
    
    // Panggil fungsi dashboard jika fungsi tersebut sudah dimuat
    if (typeof fetchDashboard === 'function') {
        fetchDashboard();
    }
}

// Router SPA Ganti Menu Halaman Sidebar (STRUKTUR SINKRON & AMAN)
navItems.forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        const target = item.getAttribute('data-target');
        currentActiveMenu = target;
        
        // Atur efek aktif warna background menu di sidebar
        navItems.forEach(nav => nav.classList.remove('bg-indigo-600', 'text-white'));
        item.classList.add('bg-indigo-600', 'text-white');
        
        // Sembunyikan semua halaman, lalu munculkan halaman yang dituju
        contentSections.forEach(sec => sec.classList.add('hidden'));
        const targetSection = document.getElementById(`content-${target}`);
        if (targetSection) targetSection.classList.remove('hidden');
        
        // Eksekusi fungsi penarik data sesuai target menu secara presisi
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
            // Logika integrasi Manajemen Akses User (Menginduk ke data Sheet Tentor)
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

// Utilitas Global Format Mata Uang Rupiah (SUDAH BERSIH)
function formatIDR(num) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);
}
