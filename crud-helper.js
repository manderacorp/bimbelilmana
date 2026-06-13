// SIM Admin Bimbel Ilmana - Core CRUD Helper System

// Fungsi Global Render Tabel dari File Menu Terpisah
function renderTableModular(container, res, headers, sheetName) {
    if (res.status === 'success' && res.data && res.data.length > 0) {
        let tableHTML = `<table class="w-full text-left text-xs text-slate-600 border border-slate-100 rounded-lg overflow-hidden"><thead class="bg-slate-50 text-slate-500"><tr>`;
        headers.forEach(h => tableHTML += `<th class="px-4 py-3 capitalize">${h}</th>`);
        tableHTML += `<th class="px-4 py-3 text-center">Aksi</th></tr></thead><tbody class="divide-y divide-slate-100">`;

        res.data.forEach(row => {
            tableHTML += `<tr class="hover:bg-slate-50">`;
            headers.forEach(h => {
                let val = row[h] !== undefined && row[h] !== null ? row[h] : "-";
                if (typeof val === 'number' && /harga|gaji|pembayaran|jumlah|tagihan|total/i.test(h)) val = formatIDR(val);
                tableHTML += `<td class="px-4 py-3">${val}</td>`;
            });

            const idKey = headers[0];
            const idValue = row[idKey] ? row[idKey].toString().replace(/'/g, "\\'") : "";
            const rowEscaped = btoa(encodeURIComponent(JSON.stringify(row)));
            
            tableHTML += `<td class="px-4 py-3 text-center flex items-center justify-center gap-2">
                <button onclick="openUpdateCrud('${sheetName}', '${rowEscaped}')" class="p-1 text-amber-500 hover:text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg transition-all cursor-pointer"><i class="fa-solid fa-pen-to-square"></i></button>
                <button onclick="hapusDataCrud('${sheetName}', '${idValue}')" class="p-1 text-rose-500 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-all cursor-pointer"><i class="fa-solid fa-trash-can"></i></button>
            </td></tr>`;
        });

        tableHTML += `</tbody></table>`;
        container.innerHTML = tableHTML;
    } else {
        container.innerHTML = `<div class="text-xs text-slate-400 py-8 text-center"><i class="fa-solid fa-folder-open text-2xl mb-2 block text-slate-300"></i> Belum ada data di sheet ${sheetName}.</div>`;
    }
}

// FUNGSI UTAMA: PEMBUAT MODAL DINAMIS DENGAN KONTROL DROPDOWN SELEKTIF
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

    // KUNCI ATURAN: Dropdown hanya boleh aktif di sheet Jurnal, Invoice, dan Slip Gaji
    const bolehDropdown = ["Jurnal", "Invoice", "Slip Gaji"].includes(sheetName);
    
    const butuhSiswa = bolehDropdown && headers.some(h => h.toLowerCase().includes('siswa'));
    const butuhTentor = bolehDropdown && headers.some(h => h.toLowerCase().includes('tentor'));

    // Tampilkan loading jika sistem sedang memuat opsi database
    if (butuhSiswa || butuhTentor) {
        container.innerHTML = `<div class="text-center py-4 text-slate-400 col-span-full"><i class="fa-solid fa-circle-notch animate-spin mr-2 text-indigo-500"></i>Menghubungkan ke database...</div>`;
    }

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

    container.innerHTML = '';

    // Render Field Secara Dinamis
    headers.forEach((header, index) => {
        const lowerHeader = header.toLowerCase();
        
        // Lewati ID Utama pada mode create karena otomatis di sisi Apps Script
        if (index === 0 && actionType === 'create') return;

        const div = document.createElement('div');
        div.className = 'flex flex-col gap-1';

        const label = document.createElement('label');
        label.className = 'font-semibold text-slate-600 text-xs';
        label.innerText = header;
        div.appendChild(label);

        let inputElement;
        const currentVal = (actionType === 'update' && activeRowData) ? activeRowData[header] : '';

        // KONDISI 1: DROPDOWN NAMA SISWA (HANYA UNTUK MENU JURNAL / INVOICE)
        if (lowerHeader.includes('siswa') && bolehDropdown) {
            inputElement = document.createElement('select');
            inputElement.name = header;
            inputElement.className = 'w-full p-2 border border-slate-200 rounded-xl bg-white text-xs focus:outline-none focus:border-indigo-500';
            
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
        // KONDISI 2: DROPDOWN NAMA TENTOR (HANYA UNTUK MENU JURNAL / SLIP GAJI)
        else if (lowerHeader.includes('tentor') && bolehDropdown) {
            inputElement = document.createElement('select');
            inputElement.name = header;
            inputElement.className = 'w-full p-2 border border-slate-200 rounded-xl bg-white text-xs focus:outline-none focus:border-indigo-500';

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
        // KONDISI 3: INPUT BIASA (JIKA BUKAN MENU DI
