// SIM Admin Bimbel Ilmana - Core CRUD Helper System

// Fungsi Global Render Tabel Otomatis
function renderTableModular(container, res, headers, sheetName) {
    if (res.status === 'success' && res.data && res.data.length > 0) {
        let tableHTML = `<table class="w-full text-left text-xs text-slate-600 border border-slate-100 rounded-lg overflow-hidden"><thead class="bg-slate-50 text-slate-500"><tr>`;
        headers.forEach(h => tableHTML += `<th class="px-4 py-3 capitalize">${h}</th>`);
        tableHTML += `<th class="px-4 py-3 text-center">Aksi</th></tr></thead><tbody class="divide-y divide-slate-100">`;

        res.data.forEach(row => {
            tableHTML += `<tr class="hover:bg-slate-50">`;
            headers.forEach(h => {
                let val = row[h] !== undefined && row[h] !== null ? row[h] : "-";
                if (typeof val === 'number' && /harga|gaji|pembayaran|jumlah|tagihan|terima|bonus|pokok/i.test(h)) val = formatIDR(val);
                tableHTML += `<td class="px-4 py-3">${val}</td>`;
            });

            const idKey = headers[0];
            const idValue = row[idKey] ? row[idKey].toString().replace(/'/g, "\\'") : "";
            const rowEscaped = btoa(encodeURIComponent(JSON.stringify(row)));
            
            let aksiButtons = `
                <button onclick="openUpdateCrud('${sheetName}', '${rowEscaped}')" class="p-1 text-amber-500 hover:text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg transition-all cursor-pointer" title="Edit"><i class="fa-solid fa-pen-to-square"></i></button>
                <button onclick="hapusDataCrud('${sheetName}', '${idValue}')" class="p-1 text-rose-500 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-all cursor-pointer" title="Hapus"><i class="fa-solid fa-trash-can"></i></button>
            `;

            if (sheetName === 'Invoice' || sheetName === 'Slip Gaji') {
                aksiButtons += `
                    <button onclick="exportToJPG('${sheetName}', '${rowEscaped}')" class="p-1 text-emerald-500 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-all cursor-pointer" title="Export Gambar JPG"><i class="fa-solid fa-file-image"></i></button>
                `;
            }

            tableHTML += `<td class="px-4 py-3 text-center flex items-center justify-center gap-2">${aksiButtons}</td></tr>`;
        });

        tableHTML += `</tbody></table>`;
        container.innerHTML = tableHTML;
    } else {
        container.innerHTML = `<div class="text-xs text-slate-400 py-8 text-center"><i class="fa-solid fa-folder-open text-2xl mb-2 block text-slate-300"></i> Belum ada data di sheet ${sheetName}.</div>`;
    }
}

// FUNGSI UTAMA: PEMBUAT FORM MODAL + LOGIKA DROPDOWN SELEKTIF
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

    let opsiSiswa = [];
    let opsiTentor = [];

    // ATURAN SELEKTIF: Dropdown hanya aktif pada form Invoice, Slip Gaji, dan Jurnal Mengajar saja
    const bolehDropdown = ["Jurnal", "Invoice", "Slip Gaji"].includes(sheetName);
    
    const butuhSiswa = bolehDropdown && headers.some(h => h.toLowerCase().includes('siswa'));
    const butuhTentor = bolehDropdown && headers.some(h => h.toLowerCase().includes('tentor'));

    if (butuhSiswa || butuhTentor) {
        container.innerHTML = `<div class="text-center py-4 text-slate-400 col-span-full"><i class="fa-solid fa-circle-notch animate-spin mr-2 text-indigo-500"></i>Menghubungkan ke database...</div>`;
    }

    if (butuhSiswa) {
        try {
            const res = await fetch(`${API_URL}?action=getDataSiswa`);
            const json = await res.json();
            if (json.status === 'success' && json.data) opsiSiswa = json.data;
        } catch (e) { console.error(e); }
    }

    if (butuhTentor) {
        try {
            const res = await fetch(`${API_URL}?action=getDataTentor`);
            const json = await res.json();
            if (json.status === 'success' && json.data) opsiTentor = json.data;
        } catch (e) { console.error(e); }
    }

    container.innerHTML = '';

    // Susun Field Form HTML
    headers.forEach((header, index) => {
        const lowerHeader = header.toLowerCase();
        if (index === 0 && actionType === 'create') return;

        const div = document.createElement('div');
        div.className = 'flex flex-col gap-1';

        const label = document.createElement('label');
        label.className = 'font-semibold text-slate-600 text-[11px]';
        label.innerText = header;
        div.appendChild(label);

        let inputElement;
        const currentVal = (actionType === 'update' && activeRowData) ? activeRowData[header] : '';

        // Dropdown nama siswa di menu Jurnal / Invoice
        if (lowerHeader.includes('siswa') && bolehDropdown) {
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
        // Dropdown nama tentor di menu Jurnal / Slip Gaji
        else if (lowerHeader.includes('tentor') && bolehDropdown) {
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
        // Input ketik biasa (Khusus pendaftaran Data Siswa Baru & Data Tentor Baru agar manual ketik)
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
            } else if (/harga|gaji|pembayaran|jumlah|tagihan|durasi|menit|bonus|pokok|diterima/i.test(lowerHeader)) {
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

// EXPORT JPG: Membuat Struk Kuitansi Cetak untuk Invoice & Slip Gaji
window.exportToJPG = function(sheetName, rowEscaped) {
    const row = JSON.parse(decodeURIComponent(atob(rowEscaped)));
    const nota = document.createElement('div');
    nota.style = "position:absolute; left:-9999px; width:450px; background:#fff; padding:30px; font-family:sans-serif; color:#334155; border:1px solid #e2e8f0; border-radius:12px;";
    
    let isiKonten = `
        <div style="text-align:center; border-bottom:2px dashed #cbd5e1; padding-bottom:15px; margin-bottom:15px;">
            <h2 style="margin:0; color:#4f46e5; font-size:22px; font-weight:800;">BIMBEL ILMANA</h2>
            <p style="margin:4px 0 0; font-size:11px; color:#64748b;">Boyolali, Central Java | Sistem Informasi Administrasi</p>
        </div>
        <h3 style="text-align:center; font-size:13px; margin-bottom:25px; text-transform:uppercase; letter-spacing:1px; font-weight:700; color:#1e293b;">TANDA BUKTI RESMI ${sheetName}</h3>
        <table style="width:100%; font-size:12px; border-collapse:collapse;">
    `;

    Object.keys(row).forEach(key => {
        let val = row[key];
        if (typeof val === 'number' && /tagihan|pembayaran|gaji|bonus|total/i.test(key)) val = formatIDR(val);
        isiKonten += `
            <tr>
                <td style="padding:10px 0; color:#64748b; font-weight:600; width:45%; border-bottom:1px solid #f1f5f9;">${key}</td>
                <td style="padding:10px 0; text-align:right; border-bottom:1px solid #f1f5f9; color:#1e293b; font-weight:700;">${val}</td>
            </tr>
        `;
    });

    isiKonten += `
        </table>
        <div style="text-align:center; margin-top:35px; padding-top:15px; border-top:2px dashed #cbd5e1; font-size:10px; color:#94a3b8; line-height:1.5;">
            Terima kasih telah memercayakan pendidikan putra/putri Anda bersama kami.<br><b>SIM Bimbel Ilmana Cloud System</b>
        </div>
    `;
    
    nota.innerHTML = isiKonten;
    document.body.appendChild(nota);

    html2canvas(nota, { scale: 2 }).then(canvas => {
        const link = document.createElement('a');
        link.download = `${sheetName}-${row[Object.keys(row)[0]] || 'Doc'}.jpg`;
        link.href = canvas.toDataURL('image/jpeg', 0.95);
        link.click();
        document.body.removeChild(nota);
    });
};

// EVENT FORM SUBMIT DATA
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
        const payload = { action: actionType, sheetName: sheetName, id: idValue, formData: formData };
        const res = await fetch(API_URL, { method: 'POST', body: JSON.stringify(payload) });
        const json = await res.json();

        if (json.status === 'success') {
            alert(json.message);
            closeCrudModal();
            
            if (sheetName === 'Data Siswa' && typeof fetchSiswa === 'function') fetchSiswa();
            else if (sheetName === 'Data Tentor' && typeof fetchTentor === 'function') fetchTentor();
            else if (sheetName === 'Jurnal' && typeof fetchJurnal === 'function') fetchJurnal();
            else if (sheetName === 'Invoice' && typeof fetchInvoice === 'function') fetchInvoice();
            else if (sheetName === 'Slip Gaji' && typeof fetchSlipgaji === 'function') fetchSlipgaji();
            else if (sheetName === 'Laporan Keuangan' && typeof fetchKeuangan === 'function') fetchKeuangan();
            else location.reload();
        } else {
            alert("Gagal: " + json.message);
        }
    } catch (err) {
        alert("Terjadi kesalahan jaringan.");
    } finally {
        btnSave.disabled = false;
        btnSave.innerHTML = `Simpan Data`;
    }
});

// EVENT HAPUS DATA (DELETE)
window.hapusDataCrud = async function(sheetName, idValue) {
    if (!confirm(`Apakah Anda yakin ingin menghapus data dengan ID: ${idValue}?`)) return;

    try {
        const payload = { action: 'delete', sheetName: sheetName, id: idValue };
        const res = await fetch(API_URL, { method: 'POST', body: JSON.stringify(payload) });
        const json = await res.json();

        if (json.status === 'success') {
            alert(json.message);
            if (sheetName === 'Data Siswa' && typeof fetchSiswa === 'function') fetchSiswa();
            else if (sheetName === 'Data Tentor' && typeof fetchTentor === 'function') fetchTentor();
            else if (sheetName === 'Jurnal' && typeof fetchJurnal === 'function') fetchJurnal();
            else if (sheetName === 'Invoice' && typeof fetchInvoice === 'function') fetchInvoice();
            else if (sheetName === 'Slip Gaji' && typeof fetchSlipgaji === 'function') fetchSlipgaji();
            else if (sheetName === 'Laporan Keuangan' && typeof fetchKeuangan === 'function') fetchKeuangan();
            else location.reload();
        } else {
            alert("Gagal menghapus: " + json.message);
        }
    } catch (err) {
        alert("Gagal terhubung ke server.");
    }
};

// PENYELARASAN TOMBOL ADD BERDASARKAN PARAMETER VARIABEL HEADER BAWAAN MODUL ASAL NYA
window.openCreateSiswa = function() { setupModalDinamis("Tambah Siswa Baru", "Data Siswa", "create", HEADERS_SISWA); };
window.openCreateTentor = function() { setupModalDinamis("Tambah Tentor Baru", "Data Tentor", "create", HEADERS_TENTOR); };
window.openCreateJurnal = function() { setupModalDinamis("Tambah Jurnal Mengajar", "Jurnal", "create", HEADERS_JURNAL); };
window.openCreateInvoice = function() { setupModalDinamis("Buat Invoice Baru", "Invoice", "create", HEADERS_INVOICE); };
window.openCreateSlipgaji = function() { setupModalDinamis("Buat Slip Gaji Tentor", "Slip Gaji", "create", HEADERS_SLIPGAJI); };
window.openCreateKeuangan = function() { setupModalDinamis("Catat Transaksi Keuangan Baru", "Laporan Keuangan", "create", HEADERS_KEUANGAN); };
