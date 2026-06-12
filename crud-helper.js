// SIM Admin Bimbel Ilmana - Core CRUD Helper System

// Fungsi Global Render Tabel dari File Menu Terpisah
function renderTableModular(container, res, headers, sheetName) {
    if (res.status === 'success' && res.data && res.data.length > 0) {
        let tableHTML = `<table class=\"w-full text-left text-xs text-slate-600 border border-slate-100 rounded-lg overflow-hidden\"><thead class=\"bg-slate-50 text-slate-500\"><tr>`;
        headers.forEach(h => tableHTML += `<th class=\"px-4 py-3 capitalize\">${h}</th>`);
        tableHTML += `<th class=\"px-4 py-3 text-center\">Aksi</th></tr></thead><tbody class=\"divide-y divide-slate-100\">`;

        res.data.forEach(row => {
            tableHTML += `<tr class=\"hover:bg-slate-50\">`;
            headers.forEach(h => {
                let val = row[h] !== undefined && row[h] !== null ? row[h] : "-";
                if (typeof val === 'number' && /harga|gaji|pembayaran|jumlah|tagihan/i.test(h)) val = formatIDR(val);
                tableHTML += `<td class=\"px-4 py-3\">${val}</td>`;
            });

            const idKey = headers[0];
            const idValue = row[idKey] ? row[idKey].toString().replace(/'/g, "\\'") : "";
            const rowEscaped = btoa(encodeURIComponent(JSON.stringify(row)));
            
            tableHTML += `<td class=\"px-4 py-3 text-center flex items-center justify-center gap-2\">
                <button onclick=\"openUpdateCrud('${sheetName}', '${rowEscaped}')\" class=\"p-1 text-amber-500 hover:text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg transition-all cursor-pointer\"><i class=\"fa-solid fa-pen-to-square\"></i></button>
                <button onclick=\"hapusDataCrud('${sheetName}', '${idValue}')\" class=\"p-1 text-rose-500 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-all cursor-pointer\"><i class=\"fa-solid fa-trash-can\"></i></button>
            </td></tr>`;
        });

        tableHTML += `</tbody></table>`;
        container.innerHTML = tableHTML;
    } else {
        container.innerHTML = `<div class=\"text-xs text-slate-400 py-8 text-center\"><i class=\"fa-solid fa-folder-open text-2xl mb-2 block text-slate-300\"></i> Belum ada data di sheet ${sheetName}.</div>`;
    }
}

// FUNGSI UTAMA: PEMBUAT MODAL DINAMIS DENGAN DROPDOWN LIST OTOMATIS
window.setupModalDinamis = async function(title, sheetName, actionType, headers, activeRowData = null) {
    const modal = document.getElementById('crud-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalSheetName = document.getElementById('modal-sheet-name');
    const modalActionType = document.getElementById('modal-action-type');
    const modalId = document.getElementById('modal-id');
    const container = document.getElementById('modal-fields-container');

    modalTitle.innerText = title;
    modalSheetName.value = sheetName;
    modalActionType.value = actionType;
    container.innerHTML = '';

    if (actionType === 'update' && activeRowData) {
        modalId.value = activeRowData[headers[0]] || '';
    } else {
        modalId.value = '';
    }

    // 1. Siapkan kontainer penampung opsi dari database
    let opsiSiswa = [];
    let opsiTentor = [];

    // Deteksi kebutuhan dropdown berdasarkan nama header kolom form
    const butuhSiswa = headers.some(h => h.toLowerCase().includes('siswa'));
    const butuhTentor = headers.some(h => h.toLowerCase().includes('tentor'));

    // Ambil data real-time jika form membutuhkannya (Sesuai dengan doGet Code.gs)
    if (butuhSiswa) {
        try {
            const res = await fetch(`${API_URL}?action=getDataSiswa`);
            const json = await res.json();
            if (json.status === 'success' && json.data) opsiSiswa = json.data;
        } catch (e) { console.error("Gagal memuat opsi siswa", e); }
    }

    if (butuhTentor) {
        try {
            const res = await fetch(`${API_URL}?action=getDataTentor`);
            const json = await res.json();
            if (json.status === 'success' && json.data) opsiTentor = json.data;
        } catch (e) { console.error("Gagal memuat opsi tentor", e); }
    }

    // 2. Render field input atau dropdown secara dinamis
    headers.forEach((header, index) => {
        const lowerHeader = header.toLowerCase();
        
        // Lewati kolom ID jika sedang membuat data baru (karena di-generate UUID otomatis oleh Apps Script)
        if (index === 0 && actionType === 'create') return;

        const div = document.createElement('div');
        div.className = 'flex flex-col gap-1';

        const label = document.createElement('label');
        label.className = 'font-semibold text-slate-600';
        label.innerText = header;
        div.appendChild(label);

        let inputElement;
        const currentVal = (actionType === 'update' && activeRowData) ? activeRowData[header] : '';

        // OPSI A: JIKA KOLOM ADALAH NAMA SISWA -> JADI DROPDOWN
        if (lowerHeader.includes('siswa')) {
            inputElement = document.createElement('select');
            inputElement.name = header;
            inputElement.className = 'w-full p-2 border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-indigo-500';
            
            const defaultOpt = document.createElement('option');
            defaultOpt.value = '';
            defaultOpt.innerText = '-- Pilih Nama Siswa --';
            inputElement.appendChild(defaultOpt);

            opsiSiswa.forEach(s => {
                const opt = document.createElement('option');
                const namaSiswa = s["Nama Siswa"] || s["Nama"] || Object.values(s)[1]; 
                opt.value = namaSiswa;
                opt.innerText = namaSiswa;
                if (currentVal && currentVal.toString().trim() === namaSiswa.toString().trim()) opt.selected = true;
                inputElement.appendChild(opt);
            });
        }
        // OPSI B: JIKA KOLOM ADALAH NAMA TENTOR -> JADI DROPDOWN
        else if (lowerHeader.includes('tentor')) {
            inputElement = document.createElement('select');
            inputElement.name = header;
            inputElement.className = 'w-full p-2 border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-indigo-500';

            const defaultOpt = document.createElement('option');
            defaultOpt.value = '';
            defaultOpt.innerText = '-- Pilih Nama Tentor --';
            inputElement.appendChild(defaultOpt);

            opsiTentor.forEach(t => {
                const opt = document.createElement('option');
                const namaTentor = t["Nama Tentor"] || t["Nama"] || Object.values(t)[1];
                opt.value = namaTentor;
                opt.innerText = namaTentor;
                if (currentVal && currentVal.toString().trim() === namaTentor.toString().trim()) opt.selected = true;
                inputElement.appendChild(opt);
            });
        }
        // OPSI C: INPUT STANDAR (TEKS, ANGKA, TANGGAL)
        else {
            inputElement = document.createElement('input');
            inputElement.name = header;
            inputElement.value = currentVal;
            inputElement.className = 'w-full p-2 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500';

            if (index === 0 && actionType === 'update') {
                inputElement.readOnly = true;
                inputElement.className += ' bg-slate-100 text-slate-400 cursor-not-allowed';
            } else if (lowerHeader.includes('tanggal')) {
                inputElement.type = 'date';
            } else if (/harga|gaji|pembayaran|jumlah|tagihan|durasi|pertemuan/i.test(lowerHeader)) {
                inputElement.type = 'number';
            } else {
                inputElement.type = 'text';
            }
        }

        inputElement.required = true;
        div.appendChild(inputElement);
        container.appendChild(div);
    });

    modal.classList.remove('hidden-system');
};

// Fungsi Membuka Modal Mode Edit Data
window.openUpdateCrud = function(sheetName, rowEscaped) {
    const rowData = JSON.parse(decodeURIComponent(atob(rowEscaped)));
    const headers = Object.keys(rowData);
    setupModalDinamis(`Edit Data ${sheetName}`, sheetName, "update", headers, rowData);
};

// Fungsi Menutup Modal
window.closeCrudModal = function() {
    document.getElementById('crud-modal').classList.add('hidden-system');
    document.getElementById('crud-form').reset();
};

// PROSES SUBMIT: EKSEKUSI ADD / EDIT DATA KE WEB APP GAS
document.getElementById('crud-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btnSave = document.getElementById('btn-save-crud');
    const sheetName = document.getElementById('modal-sheet-name').value;
    const actionType = document.getElementById('modal-action-type').value;
    const idValue = document.getElementById('modal-id').value;
    
    const formData = {};
    const inputs = e.target.querySelectorAll('input[name], select[name]');
    inputs.forEach(input => formData[input.name] = input.value);

    btnSave.disabled = true;
    btnSave.innerHTML = `<i class="fa-solid fa-circle-notch animate-spin mr-1"></i> Menyimpan...`;

    try {
        const payload = {
            action: actionType,
            sheetName: sheetName,
            id: idValue,
            formData: formData
        };

        const res = await fetch(API_URL, {
            method: 'POST',
            body: JSON.stringify(payload)
        });
        const json = await res.json();

        if (json.status === 'success') {
            alert(json.message);
            closeCrudModal();
            // Muat ulang menu aktif saat ini agar perubahan data langsung terlihat
            if (typeof window[`fetch${sheetName.replace(/\s+/g, '')}`] === 'function') {
                window[`fetch${sheetName.replace(/\s+/g, '')}`]();
            } else if (currentActiveMenu === 'usermanage' && typeof fetchTentor === 'function') {
                navItems[7].click();
            } else {
                location.reload();
            }
        } else {
            alert("Gagal: " + json.message);
        }
    } catch (err) {
        alert("Terjadi kesalahan jaringan.");
        console.error(err);
    } finally {
        btnSave.disabled = false;
        btnSave.innerHTML = `Simpan Data`;
    }
});

// PROSES DELETE: HAPUS DATA DARI WEB APP GAS
window.hapusDataCrud = async function(sheetName, idValue) {
    if (!confirm(`Apakah Anda yakin ingin menghapus data dengan ID: ${idValue}?`)) return;

    try {
        const payload = {
            action: 'delete',
            sheetName: sheetName,
            id: idValue
        };

        const res = await fetch(API_URL, {
            method: 'POST',
            body: JSON.stringify(payload)
        });
        const json = await res.json();

        if (json.status === 'success') {
            alert(json.message);
            if (typeof window[`fetch${sheetName.replace(/\s+/g, '')}`] === 'function') {
                window[`fetch${sheetName.replace(/\s+/g, '')}`]();
            } else {
                location.reload();
            }
        } else {
            alert("Gagal menghapus: " + json.message);
        }
    } catch (err) {
        alert("Gagal terhubung ke server.");
    }
};

// Pemicu Tombol Tambah Bawaan Masing-Masing Menu
window.openCreateSiswa = function() { setupModalDinamis("Tambah Siswa Baru", "Data Siswa", "create", ["ID", "Nama Siswa", "Kelas", "No HP Orang Tua", "Alamat", "Status Paket"]); };
window.openCreateTentor = function() { setupModalDinamis("Tambah Tentor Baru", "Data Tentor", "create", ["ID", "Nama Tentor", "Keahlian", "No HP", "Username", "Password"]); };
window.openCreateJurnal = function() { setupModalDinamis("Tambah Jurnal Mengajar", "Jurnal", "create", ["ID", "Tanggal", "Nama Tentor", "Nama Siswa", "Materi", "Durasi (Menit)"]); };
window.openCreateInvoice = function() { setupModalDinamis("Buat Invoice Baru", "Invoice", "create", ["ID Invoice", "Tanggal", "Nama Siswa", "Total Tagihan", "Status Pembayaran"]); };
window.openCreateSlipgaji = function() { setupModalDinamis("Buat Slip Gaji Tentor", "Slip Gaji", "create", ["ID Slip", "Bulan", "Nama Tentor", "Gaji Pokok", "Bonus", "Total Diterima"]); };
window.openCreateKeuangan = function() { setupModalDinamis("Catat Transaksi Keuangan Baru", "Laporan Keuangan", "create", ["ID Transaksi", "Tanggal", "Keterangan", "Tipe", "Jumlah"]); };
