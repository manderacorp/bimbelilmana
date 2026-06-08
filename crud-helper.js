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
                if (typeof val === 'number' && /harga|gaji|pembayaran|jumlah|tagihan/i.test(h)) val = formatIDR(val);
                tableHTML += `<td class="px-4 py-3">${val}</td>`;
            });

            const idKey = headers[0];
            const idValue = row[idKey] ? row[idKey].toString().replace(/'/g, "\\'") : "";
            const rowEscaped = btoa(encodeURIComponent(JSON.stringify(row)));
            const isUserManage = (currentActiveMenu === 'usermanage');

            tableHTML += `<td class="px-4 py-2 text-center flex justify-center gap-2">
                <button type="button" onclick="openEditModular('${sheetName}', '${idValue}', '${rowEscaped}')" class="text-blue-600 hover:bg-blue-50 p-1.5 rounded-md cursor-md" title="Ubah"><i class="fa-solid fa-pen-to-square"></i></button>
                ${!isUserManage ? `<button type="button" onclick="executeDeleteModular('${sheetName}', '${idValue}')" class="text-rose-600 hover:bg-rose-50 p-1.5 rounded-md cursor-md" title="Hapus"><i class="fa-solid fa-trash-can"></i></button>` : ''}
            </td></tr>`;
        });
        container.innerHTML = tableHTML + `</tbody></table>`;
    } else {
        container.innerHTML = `<div class="text-xs text-slate-400 py-4 text-center">Tabel kosong atau data belum dimasukkan di Google Sheet.</div>`;
    }
}

// Logic Pembentukan Struktur Form Pop Up Dinamis Beserta Isinya
function setupModalDinamis(title, sheetName, actionType, headers, rowData = null) {
    document.getElementById('modal-title').innerText = title;
    document.getElementById('modal-sheet-name').value = sheetName;
    document.getElementById('modal-action-type').value = actionType;
    document.getElementById('modal-id').value = rowData ? rowData[headers[0]] : "";

    const container = document.getElementById('modal-fields-container');
    container.innerHTML = "";

    headers.forEach((header, index) => {
        if (index === 0 && actionType === "create") return; // Sembunyikan kolom ID jika tambah data baru (karena ID auto-generate di GAS)
        
        const value = rowData ? (rowData[header] !== undefined ? rowData[header] : "") : "";
        const isReadOnly = (index === 0 && actionType === "update") ? "readonly class='w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-400 outline-none'" : "class='w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500'";
        const inputType = /password/i.test(header) ? 'password' : (/tanggal|bulan/i.test(header) ? 'date' : 'text');

        container.innerHTML += `<div>
            <label class="block text-xs font-semibold text-slate-600 mb-1 capitalize">${header}</label>
            <input type="${inputType}" name="${header}" value="${value}" ${isReadOnly} required>`;
        container.innerHTML += `</div>`;
    });

    document.getElementById('crud-modal').classList.remove('hidden-system');
}

window.openEditModular = function(sheetName, idValue, rowBase64) {
    const rowData = JSON.parse(decodeURIComponent(atob(rowBase64)));
    const headers = Object.keys(rowData);
    setupModalDinamis(`Ubah Data - ${idValue}`, sheetName, "update", headers, rowData);
};

window.closeCrudModal = function() {
    document.getElementById('crud-modal').classList.add('hidden-system');
    document.getElementById('crud-form').reset();
};

// Pengiriman Data Tambah & Edit ke GAS
document.getElementById('crud-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('btn-save-crud');
    btn.disabled = true;
    btn.innerText = "Menyimpan...";

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
            closeCrudModal();
            refreshCurrentActiveMenu();
        } else {
            alert(res.message);
        }
    } catch (err) {
        alert("Gagal memproses data ke server spreadsheet.");
    } finally {
        btn.disabled = false;
        btn.innerText = "Simpan Data";
    }
});

// Eksekutor Hapus Data
window.executeDeleteModular = async function(sheetName, idValue) {
    if (confirm(`Apakah Anda yakin ingin menghapus data dengan ID: ${idValue}?`)) {
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                body: JSON.stringify({ action: 'delete', sheetName, id: idValue })
            });
            const res = await response.json();
            if (res.status === 'success') refreshCurrentActiveMenu();
            else alert(res.message);
        } catch (err) {
            alert("Sistem gagal menghapus data.");
        }
    }
};

// Helper Refresh Otomatis Setelah Aksi CRUD
function refreshCurrentActiveMenu() {
    if (currentActiveMenu === 'siswa') fetchSiswa();
    else if (currentActiveMenu === 'tentor') fetchTentor();
    else if (currentActiveMenu === 'jurnal') fetchJurnal();
    else if (currentActiveMenu === 'invoice') fetchInvoice();
    else if (currentActiveMenu === 'slipgaji') fetchSlipgaji();
    else if (currentActiveMenu === 'keuangan') fetchKeuangan();
    else if (currentActiveMenu === 'dashboard' && typeof fetchDashboard === 'function') fetchDashboard();
}
