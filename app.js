// ISI DENGAN URL WEB APP DEPLOYMENT GAS ANDA
const API_URL = "https://script.google.com/macros/s/AKfycbw_zlUNVWdZxGkFxXEcLnuZXPNZfsg6ICKr9I3LUUbhia3SSUeiwGkP7-wLOEnLsw_cPw/exec";

// Inisialisasi DOM Selektor Global
const loginPage = document.getElementById('login-page');
const mainPage = document.getElementById('main-page');
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');
const btnLogout = document.getElementById('btn-logout');
const navItems = document.querySelectorAll('.nav-item');
const contentSections = document.querySelectorAll('.content-section');

let currentSheetHeaders = [];
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

// Aksi Pengiriman Form Login Murni (Menghubungkan langsung ke GAS)
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
        
        if (!response.ok) {
            throw new Error(`Server merespon dengan status: ${response.status}`);
        }

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
    fetchDashboard();
}

// Router SPA Menu Navigasi Sidebar
navItems.forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        const target = item.getAttribute('data-target');
        
        navItems.forEach(nav => nav.classList.remove('bg-indigo-600', 'text-white'));
        item.classList.add('bg-indigo-600', 'text-white');
        
        contentSections.forEach(sec => sec.classList.add('hidden'));
        document.getElementById(`content-${target}`).classList.remove('hidden');
        
        if (target === 'dashboard') fetchDashboard();
        else fetchMenuData(target);
    });
});

// Memuat Data Ringkasan Informasi Finansial Dashboard
async function fetchDashboard() {
    try {
        const response = await fetch(`${API_URL}?action=getDashboardData`);
        const res = await response.json();
        if (res.status === 'success') {
            document.getElementById('dash-pemasukan').innerText = formatIDR(res.totalPemasukan);
            document.getElementById('dash-pengeluaran').innerText = formatIDR(res.totalPengeluaran);
            document.getElementById('dash-saldo').innerText = formatIDR(res.saldo);
            
            const tableBody = document.getElementById('log-keuangan-table');
            tableBody.innerHTML = '';
            if (res.recentLogs.length === 0) {
                tableBody.innerHTML = `<tr><td colspan="3" class="px-6 py-4 text-center text-slate-400">Belum ada riwayat transaksi</td></tr>`;
            }
            res.recentLogs.forEach(log => {
                tableBody.innerHTML += `<tr>
                    <td class="px-6 py-3 font-medium text-slate-900">${log.tanggal}</td>
                    <td class="px-6 py-3">${log.keterangan}</td>
                    <td class="px-6 py-3 text-right ${log.tipe === 'Pemasukan' ? 'text-emerald-600' : 'text-rose-600'} font-semibold">${log.tipe === 'Pemasukan' ? '+' : '-'} ${formatIDR(log.jumlah)}</td>
                </tr>`;
            });
        }
    } catch (err) { console.error(err); }
}

// Rendering Tabel Data Dinamis & Manajemen Aksi CRUD
async function fetchMenuData(target) {
    currentActiveMenu = target;
    const isUserManage = (target === 'usermanage');
    
    let actionName = "";
    if (isUserManage) {
        actionName = 'getDataTentor';
    } else if (target === 'siswa' || target === 'tentor') {
        actionName = 'getData' + target.charAt(0).toUpperCase() + target.slice(1);
    } else
