// ISI DENGAN URL WEB APP YANG ANDA DAPATKAN SETELAH DEPLOY GOOGLE APPS SCRIPT
const API_URL = "https://script.google.com/macros/s/AKfycbwbveg1PE9erHYL12x-Fn5vl2CMNJ4L00VBaelzZ4TTrvCEdmgRXXxzhzeJUlwGTKEV7w/exec";

let currentSheetHeaders = [];
let currentActiveMenu = "";

document.addEventListener('DOMContentLoaded', () => {
    const isLogged = localStorage.getItem('bimbel_token');
    if (isLogged) showMainPage(localStorage.getItem('bimbel_role'));
});

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btnSubmit = document.getElementById('btn-login');
    btnSubmit.disabled = true;
    btnSubmit.innerHTML = `<i class="fa-solid fa-circle-notch animate-spin"></i> Validasi...`;
    loginError.classList.add('hidden');

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            body: JSON.stringify({ action: 'login', username: document.getElementById('username').value, password: document.getElementById('password').value })
        });
        const res = await response.json();
        if (res.status === 'success') {
            localStorage.setItem('bimbel_token', res.token);
            localStorage.setItem('bimbel_username', res.username);
            localStorage.setItem('bimbel_role', res.role);
            showMainPage(res.role);
        } else {
            loginError.innerText = res.message; loginError.classList.remove('hidden');
        }
    } catch (err) {
        loginError.innerText = "Koneksi database bermasalah."; loginError.classList.remove('hidden');
    } finally {
        btnSubmit.disabled = false; btnSubmit.innerHTML = `<span>Masuk</span>`;
    }
});

btnLogout.addEventListener('click', () => {
    localStorage.clear(); window.location.reload();
});

function showMainPage(role) {
    loginPage.classList.add('hidden'); mainPage.classList.remove('hidden');
    document.getElementById('user-role-display').innerText = `Role: ${role}`;
    fetchDashboard();
}

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
            res.recentLogs.forEach(log => {
                tableBody.innerHTML += `<tr>
                    <td class="px-6 py-3 font-medium">${log.tanggal}</td>
                    <td>${log.keterangan}</td>
                    <td class="text-right ${log.tipe==='Pemasukan'?'text-emerald-600':'text-rose-600'} font-semibold">${log.tipe==='Pemasukan'?'+':'-'} ${formatIDR(log.jumlah)}</td>
                </tr>`;
            });
        }
    } catch (err) { console.log(err); }
}

// Handler Fetch Data CRUD tiap Menu Terintegrasi dengan User Management
async function fetchMenuData(target) {
    currentActiveMenu = target;
    const isUserManage = (target === 'usermanage');
    
    // Mapping internal target ke nama Sheet Google
    const actionName = isUserManage ? 'getDataTentor' : 'getData' + target.charAt(0).toUpperCase() + target.slice(1);
    const sheetName = isUserManage ? 'Data Tentor' : getSheetNameMap(target);
    const container = document.getElementById(`container-${target}`);
    container.innerHTML = `Memuat data...`;

    try {
        const response = await fetch(`${API_URL}?action=${isUserManage ? 'getDataTentor' : actionName}`);
        const res = await response.json();

        if (res.status === 'success' && res.data.length > 0) {
            // Jika menu User Management, override filter header kolom saja
            currentSheetHeaders = Object.keys(res.data[0]);
            let headers = isUserManage ? ['ID Tentor', 'Nama Tentor', 'Username', 'Password'] : currentSheetHeaders;

            let tableHTML = `<table class="w-full text-left text-xs text-slate-600"><thead class="bg-slate-50 text-slate-500"><tr>`;
            headers.forEach(h => tableHTML += `<th class="px-4 py-3 capitalize">${h}</th>`);
            tableHTML += `<th class="px-4 py-3 text-center">Aksi</th></tr></thead><tbody class="divide-y divide-slate-100">`;

            res.data.forEach(row => {
                tableHTML += `<tr class="hover:bg-slate-50">`;
                headers.forEach(h => {
                    let val = row[h] || "-";
                    if (typeof val === 'number' && /harga|gaji|pembayaran|jumlah/i.test(h)) val = formatIDR(val);
                    tableHTML += `<td class="px-4 py-3">${val}</td>`;
                });

                const idValue = row[currentSheetHeaders[0]];
                const rowEscaped = btoa(unescape(encodeURIComponent(JSON.stringify(row))));
                
                tableHTML += `<td class="px-4 py-2 text-center flex justify-center gap-2">
                    <button onclick="openEditModal('${sheetName}', '${idValue}', '${rowEscaped}', ${isUserManage})" class="text-blue-600 hover:bg-blue-50 p-1.5 rounded-md"><i class="fa-solid fa-pen-to-square"></i></button>
                    ${!isUserManage ? `<button onclick="executeDelete('${sheetName}', '${idValue}')" class="text-rose-600 hover:bg-rose-50 p-1.5 rounded-md"><i class="fa-solid fa-trash-can"></i></button>` : ''}
                </td></tr>`;
            });
            container.innerHTML = tableHTML + `</tbody></table>`;
        } else {
            container.innerHTML = `Tabel kosong.`;
        }
    } catch (err) { container.innerHTML = `Gagal memuat data.`; }
}

function getSheetNameMap(target) {
    return { siswa: 'Data Siswa', tentor: 'Data Tentor', jurnal: 'Jurnal', invoice: 'Invoice', slipgaji: 'Slip Gaji', keuangan: 'Laporan Keuangan' }[target];
}

function openCreateModal(sheetName) {
    document.getElementById('modal-title').innerText = `Tambah Data (${sheetName})`;
    document.getElementById('modal-sheet-name').value = sheetName;
    document.getElementById('modal-action-type').value = "create";
    document.getElementById('modal-id').value = "";
    generateFormFields(sheetName, null, false);
    document.getElementById('crud-modal').classList.remove('hidden');
}

function openEditModal(sheetName, idValue, rowBase64, isUserManage = false) {
    const rowData = JSON.parse(decodeURIComponent(escape(atob(rowBase64))));
    document.getElementById('modal-title').innerText = isUserManage ? `Ubah Akses Login Tentor` : `Ubah Data - ${idValue}`;
    document.getElementById('modal-sheet-name').value = sheetName;
    document.getElementById('modal-action-type').value = "update";
    document.getElementById('modal-id').value = idValue;
    generateFormFields(sheetName, rowData, isUserManage);
    document.getElementById('crud-modal').classList.remove('hidden');
}

function generateFormFields(sheetName, rowData, isUserManage) {
    const container = document.getElementById('modal-fields-container');
    container.innerHTML = "";

    currentSheetHeaders.forEach((header, index) => {
        if (index === 0) return; // Lewati ID utama
        
        // Jika mode User Management aktif, kunci kolom selain Kredensial Login
        if (isUserManage && !/username|password/i.test(header)) return;

        const value = rowData ? rowData[header] : "";
        container.innerHTML += `<div>
            <label class="block text-xs font-semibold text-slate-600 mb-1 capitalize">${header}</label>
            <input type="${/password/i.test(header)?'password':'text'}" name="${header}" value="${value}" required class="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500">
        </div>`;
    });
}

// Kirim request Form Simpan/Update ke GAS
document.getElementById('crud-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('btn-save-crud');
    btn.disabled = true; btn.innerText = "Menyimpan...";

    let formData = {};
    const elements = document.getElementById('crud-form').elements;
    for (let i = 0; i < elements.length; i++) {
        if (elements[i].name) formData[elements[i].name] = elements[i].value;
    }

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            body: JSON.stringify({
                action: document.getElementById('modal-action-type').value,
                sheetName: document.getElementById('modal-sheet-name').value,
                id: document.getElementById('modal-id').value,
                formData: formData
            })
        });
        const res = await response.json();
        if (res.status === 'success') {
            closeCrudModal(); fetchMenuData(currentActiveMenu);
        } else { alert(res.message); }
    } catch (err) { alert("Sistem error."); }
    finally { btn.disabled = false; btn.innerText = "Simpan Data"; }
});

async function executeDelete(sheetName, idValue) {
    if (confirm(`Hapus data ID: ${idValue}?`)) {
        try {
            const response = await fetch(API_URL, { method: 'POST', body: JSON.stringify({ action: 'delete', sheetName, id: idValue }) });
            const res = await response.json();
            if (res.status === 'success') fetchMenuData(currentActiveMenu);
        } catch (err) { alert("Gagal menghapus."); }
    }
}

function formatIDR(num) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);
}
