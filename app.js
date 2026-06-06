// ISI DENGAN URL WEB APP YANG ANDA DAPATKAN SETELAH DEPLOY GOOGLE APPS SCRIPT
const API_URL = "https://script.google.com/macros/s/AKfycbwbveg1PE9erHYL12x-Fn5vl2CMNJ4L00VBaelzZ4TTrvCEdmgRXXxzhzeJUlwGTKEV7w/exec";

// Global DOM Selector
const loginPage = document.getElementById('login-page');
const mainPage = document.getElementById('main-page');
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');
const btnLogout = document.getElementById('btn-logout');
const navItems = document.querySelectorAll('.nav-item');
const contentSections = document.querySelectorAll('.content-section');

// Cek Memori Sesi Validasi Login Saat Awal Muat Web
document.addEventListener('DOMContentLoaded', () => {
    const isLogged = localStorage.getItem('bimbel_token');
    if (isLogged) {
        showMainPage(localStorage.getItem('bimbel_role'));
    }
});

// Aksi Kirim Form Login (POST Request ke GAS)
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btnSubmit = document.getElementById('btn-login');
    btnSubmit.disabled = true;
    btnSubmit.innerHTML = `<i class="fa-solid fa-circle-notch animate-spin"></i> Memvalidasi...`;
    loginError.classList.add('hidden');

    const usernameInput = document.getElementById('username').value;
    const passwordInput = document.getElementById('password').value;

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            body: JSON.stringify({ action: 'login', username: usernameInput, password: passwordInput })
        });
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
        loginError.innerText = "Koneksi ke database Sheets bermasalah.";
        loginError.classList.remove('hidden');
    } finally {
        btnSubmit.disabled = false;
        btnSubmit.innerHTML = `<span>Masuk</span> <i class="fa-solid fa-right-to-bracket text-xs"></i>`;
    }
});

// Aksi Keluar Sistem
btnLogout.addEventListener('click', () => {
    localStorage.clear();
    mainPage.classList.add('hidden');
    loginPage.classList.remove('hidden');
    loginForm.reset();
});

function showMainPage(role) {
    loginPage.classList.add('hidden');
    mainPage.classList.remove('hidden');
    document.getElementById('user-role-display').innerText = `Role: ${role}`;
    fetchDashboard();
}

// Router Navigasi Tampilan Menu (SPA)
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

// Ambil Ringkasan Dashboard Utama
async function fetchDashboard() {
    const tableBody = document.getElementById('log-keuangan-table');
    tableBody.innerHTML = `<tr><td colspan="3" class="p-4 text-center text-slate-400">Memuat rekap...</td></tr>`;
    
    try {
        const response = await fetch(`${API_URL}?action=getDashboardData`);
        const res = await response.json();

        if (res.status === 'success') {
            document.getElementById('dash-pemasukan').innerText = formatIDR(res.totalPemasukan);
            document.getElementById('dash-pengeluaran').innerText = formatIDR(res.totalPengeluaran);
            document.getElementById('dash-saldo').innerText = formatIDR(res.saldo);

            tableBody.innerHTML = '';
            if(res.recentLogs.length === 0) {
                tableBody.innerHTML = `<tr><td colspan="3" class="p-4 text-center text-slate-400">Belum ada riwayat keuangan.</td></tr>`;
            }
            res.recentLogs.forEach(log => {
                const color = log.tipe === 'Pemasukan' ? 'text-emerald-600' : 'text-rose-600';
                const sign = log.tipe === 'Pemasukan' ? '+' : '-';
                tableBody.innerHTML += `
                    <tr class="hover:bg-slate-50">
                        <td class="px-6 py-3 font-medium text-slate-900">${log.tanggal}</td>
                        <td class="px-6 py-3">${log.keterangan}</td>
                        <td class="px-6 py-3 text-right ${color} font-semibold">${sign} ${formatIDR(log.jumlah)}</td>
                    </tr>`;
            });
        }
    } catch (err) {
        tableBody.innerHTML = `<tr><td colspan="3" class="p-4 text-center text-rose-500">Gagal memuat rekap kas.</td></tr>`;
    }
}

// Ambil Data Berdasarkan Menu Secara Dinamis
async function fetchMenuData(target) {
    // Pemetaan nama target menu ke fungsi action GAS
    const actionMap = {
        siswa: 'getDataSiswa',
        tentor: 'getDataTentor',
        jurnal: 'getJurnal',
        invoice: 'getInvoice',
        slipgaji: 'getSlipGaji',
        keuangan: 'getKeuangan'
    };
    
    const container = document.getElementById(`container-${target}`);
    container.innerHTML = `<div class="text-slate-400 text-xs py-2"><i class="fa-solid fa-spinner animate-spin mr-2"></i>Menghubungkan ke Google Sheet...</div>`;

    try {
        const response = await fetch(`${API_URL}?action=${actionMap[target]}`);
        const res = await response.json();

        if (res.status === 'success' && res.data.length > 0) {
            let headers = Object.keys(res.data[0]);
            let tableHTML = `<table class="w-full text-left text-xs text-slate-600 border border-slate-100 rounded-lg overflow-hidden">
                <thead class="bg-slate-50 text-slate-500 border-b border-slate-100"><tr>`;
            
            headers.forEach(h => tableHTML += `<th class="px-4 py-3 capitalize">${h}</th>`);
            tableHTML += `</tr></thead><tbody class="divide-y divide-slate-100">`;

            res.data.forEach(row => {
                tableHTML += `<tr class="hover:bg-slate-50">`;
                headers.forEach(h => {
                    let cellVal = row[h];
                    // Auto-format jika mendeteksi nominal angka keuangan
                    if (typeof cellVal === 'number' && (h.toLowerCase().includes('harga') || h.toLowerCase().includes('gaji') || h.toLowerCase().includes('pembayaran') || h.toLowerCase().includes('jumlah'))) {
                        cellVal = formatIDR(cellVal);
                    }
                    tableHTML += `<td class="px-4 py-3">${cellVal}</td>`;
                });
                tableHTML += `</tr>`;
            });

            tableHTML += `</tbody></table>`;
            container.innerHTML = tableHTML;
        } else {
            container.innerHTML = `<div class="text-slate-400 text-xs py-4 text-center">Tidak ada data atau tabel kosong.</div>`;
        }
    } catch (err) {
        container.innerHTML = `<div class="text-rose-500 text-xs py-4 text-center">Gagal memuat data dari spreadsheet.</div>`;
    }
}

// Helper: Format Rupiah IDR
function formatIDR(num) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);
}
