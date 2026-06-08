let currentSheetHeaders = [];

// Membaca Data dari Google Sheets dan Membentuk Tabel HTML Dinamis
async function fetchMenuData(target) {
    const isUserManage = (target === 'usermanage');
    let actionName = isUserManage ? 'getDataTentor' : (target === 'siswa' || target === 'tentor' ? 'getData' + target.charAt(0).toUpperCase() + target.slice(1) : 'get' + target.charAt(0).toUpperCase() + target.slice(1));
    const sheetName = isUserManage ? 'Data Tentor' : getSheetNameMap(target);
    const container = document.getElementById(`container-${target}`);
    
    container.innerHTML = `<span class="text-xs text-slate-400"><i class="fa-solid fa-spinner animate-spin mr-1"></i> Sinkronisasi database...</span>`;

    try {
        const response = await fetch(`${API_URL}?action=${actionName}`);
        const res = await response.json();

        if (res.status === 'success' && res.data.length > 0) {
            currentSheetHeaders = Object.keys(res.data[0]);
            let headers = currentSheetHeaders;

            let tableHTML = `<table class="w-full text-left text-xs text-slate-600 border border-slate-100 rounded-lg overflow-hidden"><thead class="bg-slate-50 text-slate-500"><tr>`;
            headers.forEach(h => tableHTML += `<th class="px-4 py-3 capitalize">${h}</th>`);
            tableHTML += `<th class="px-4 py-3 text-center">Aksi</th></tr></thead><tbody class="divide-y divide-slate-100">`;

            res.data.forEach(row => {
                tableHTML += `<tr class="hover:bg-slate-50">`;
                headers.forEach(h => {
                    let val = row[h] !== undefined && row[h] !== null ? row[h] : "-";
                    if (typeof val === 'number' && /harga|gaji|pembayaran|jumlah/i.test(h)) val = formatIDR(val);
                    tableHTML += `<td class="px-4 py-3">${val}</td>`;
                });

                const idKey = currentSheetHeaders[0];
                const idValue = row[idKey] ? row[idKey].toString().replace(/'/g, "\\'") : "";
                const rowEscaped = btoa(encodeURIComponent(JSON.stringify(row)));
                
                tableHTML += `<td class="px-4 py-2 text-center flex justify-center gap-2">
                    <button type="button" onclick="openEditModal('${sheetName}', '${idValue}', '${rowEscaped}', ${isUserManage})" class="text-blue-600 hover:bg-blue-50 p-1.5 rounded-md cursor-pointer" title="Ubah"><i class="fa-solid fa-pen-to-square"></i></button>
                    ${!isUserManage ? `<button type="button" onclick="executeDelete('${sheetName}', '${idValue}')" class="text-rose-600 hover:bg-rose-50 p-1.5 rounded-md cursor-pointer" title="Hapus"><i class="fa-solid fa-trash-can"></i></button>` : ''}
                </td></tr>`;
            });
            container.innerHTML = tableHTML + `</tbody></table>`;
        } else {
            container.innerHTML = `<div class="text-xs text-slate-400 py-4 text-center">Tabel kosong atau data belum dimasukkan.</div>`;
        }
    } catch (err) { 
        console.error(err);
        container.innerHTML = `<div class="text-xs text-rose-500 py-4 text-center">Gagal memuat data dari spreadsheet.</div>`; 
    }
}

function getSheetNameMap(target) {
    return { siswa: 'Data Siswa', tentor: 'Data Tentor', jurnal: 'Jurnal', invoice: 'Invoice', slipgaji: 'Slip Gaji', keuangan: 'Laporan Keuangan' }[target];
}

window.openCreateModal = function(sheetName) {
    document.getElementById('modal-title').innerText = `Tambah Data (${sheetName})`;
    document.getElementById('modal-sheet-name').value = sheetName;
    document.getElementById('modal-action-type').value = "create";
    document.getElementById('modal-id').value = "";
    generateFormFields(sheetName, null, false);
    document.getElementById('crud-modal').classList.remove('hidden-system');
};

window.openEditModal = function(sheetName, idValue, rowBase64, isUserManage = false) {
    const rowData = JSON.parse(decodeURIComponent(atob(rowBase64)));
    document.getElementById('modal-title').innerText = isUserManage ? `Ubah Akses Login Tentor` : `Ubah Data - ${idValue}`;
    document.getElementById('modal-sheet-name').value = sheetName;
    document.getElementById('modal-action-type').value = "update";
    document.getElementById('modal-id').value = idValue;
    generateFormFields(sheetName, rowData, isUserManage);
    document.getElementById('crud-modal').classList.remove('hidden-system');
};

window.closeCrudModal = function() {
    document.getElementById('crud-modal').classList.add('hidden-system');
    document.getElementById('crud-form').reset();
};

function generateFormFields(sheetName, rowData, isUserManage) {
    const container = document.getElementById('modal-fields-container');
    container.innerHTML = "";

    currentSheetHeaders.forEach((header, index) => {
        if (index === 0 && !isUserManage) return; 
        if (isUserManage && !/username|password/i.test(header)) return; 

        const value = rowData ? rowData[header] : "";
        container.innerHTML += `<div>
            <label class="block text-xs font-semibold text-slate-600 mb-1 capitalize">${header}</label>
            <input type="${/password/i.test(header) ? 'password' : 'text'}" name="${header}" value="${value}" required class="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500">
        </div>`;
    });
}

// Handler Submit Form Tambah / Update Data
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
            fetchMenuData(currentActiveMenu);
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

// Handler Hapus Data
window.executeDelete = async function(sheetName, idValue) {
    if (confirm(`Apakah Anda yakin ingin menghapus data dengan ID: ${idValue}?`)) {
        try {
            const response = await fetch(API_URL, { 
                method: 'POST', 
                body: JSON.stringify({ action: 'delete', sheetName, id: idValue }) 
            });
            const res = await response.json();
            if (res.status === 'success') {
                fetchMenuData(currentActiveMenu);
            } else {
                alert(res.message);
            }
        } catch (err) { 
            alert("Sistem gagal menghapus data."); 
        }
    }
};
