let currentActiveMenu = "dashboard";

function renderTableModular(container, res, headers, sheetName) {
    if (res.status === 'success' && res.data && res.data.length > 0) {
        let html = `<table class="w-full text-left text-xs text-slate-600 border border-slate-100 rounded-xl overflow-hidden"><thead class="bg-slate-900 text-white"><tr>`;
        headers.forEach(h => html += `<th class="px-4 py-3">${h}</th>`);
        html += `<th class="px-4 py-3 text-center">Opsi</th></tr></thead><tbody class="divide-y divide-slate-100 bg-white">`;

        res.data.forEach(row => {
            html += `<tr class="hover:bg-slate-50/80">`;
            headers.forEach(h => {
                let key = Object.keys(row).find(k => k.trim() === h.trim());
                let val = key && row[key] !== null && row[key] !== undefined ? row[key] : "-";
                if (/harga|gaji|pembayaran|jumlah|total/i.test(h)) val = formatIDR(val);
                html += `<td class="px-4 py-3 font-medium">${val}</td>`;
            });
            let primaryId = row[Object.keys(row)[0]];
            let dataEscaped = btoa(encodeURIComponent(JSON.stringify(row)));
            html += `<td class="px-4 py-2 text-center flex items-center justify-center gap-1.5">
                <button onclick="openUpdateModular('${sheetName}', '${dataEscaped}')" class="p-1.5 bg-amber-50 text-amber-600 rounded-lg text-xs"><i class="fa-solid fa-pen"></i></button>
                <button onclick="hapusRowCrud('${sheetName}', '${primaryId}')" class="p-1.5 bg-rose-50 text-rose-600 rounded-lg text-xs"><i class="fa-solid fa-trash"></i></button>
            </td></tr>`;
        });
        container.innerHTML = html + `</tbody></table>`;
    } else {
        container.innerHTML = `<div class="text-center py-8 text-slate-400 text-xs font-medium"><i class="fa-regular fa-folder-open text-xl block mb-1"></i> Data sheet ${sheetName} kosong.</div>`;
    }
}

function setupModalDinamis(title, sheetName, actionType, headers, dataObj = null) {
    document.getElementById('modal-title').innerText = title;
    document.getElementById('modal-sheet-name').value = sheetName;
    document.getElementById('modal-action-type').value = actionType;
    document.getElementById('modal-id').value = dataObj ? dataObj[headers[0]] : '';
    
    let container = document.getElementById('modal-fields-container');
    container.innerHTML = "";
    
    headers.forEach((h, idx) => {
        let val = dataObj ? dataObj[h] : '';
        if (idx === 0) {
            container.innerHTML += `<div class="flex flex-col gap-1"><label class="text-xs font-bold text-slate-600">${h}</label><input type="text" value="${val || 'OTOMATIS OLEH SYSTEM'}" disabled class="p-2 bg-slate-100 border rounded-xl text-slate-400 text-xs"></div>`;
        } else {
            let type = /tanggal/i.test(h) ? 'date' : (/harga|gaji|pembayaran|jumlah|total|durasi/i.test(h) ? 'number' : 'text');
            container.innerHTML += `<div class="flex flex-col gap-1"><label class="text-xs font-bold text-slate-600">${h}</label><input type="${type}" name="${h}" value="${val}" required class="p-2 border rounded-xl text-xs focus:ring-1 focus:ring-indigo-500 outline-none"></div>`;
        }
    });
    document.getElementById('modal-crud').classList.remove('hidden');
}

async function handleFormSubmit(e) {
    e.preventDefault();
    const sheetName = document.getElementById('modal-sheet-name').value;
    const action = document.getElementById('modal-action-type').value;
    const id = document.getElementById('modal-id').value;
    
    const formData = {};
    new FormData(document.getElementById('form-crud-dynamic')).forEach((val, key) => formData[key] = val);
    
    document.getElementById('modal-crud').classList.add('hidden');
    
    try {
        await fetch(API_URL, { method: 'POST', body: JSON.stringify({ action, sheetName, id, formData }) });
        refreshCurrentMenu();
    } catch(err) { alert("Transaksi Gagal Disimpan!"); }
}

async function hapusRowCrud(sheetName, id) {
    if (!confirm("Hapus data " + id + "?")) return;
    try {
        await fetch(API_URL, { method: 'POST', body: JSON.stringify({ action: 'delete', sheetName, id }) });
        refreshCurrentMenu();
    } catch(err) { alert("Gagal menghapus!"); }
}

function openUpdateModular(sheetName, escaped) {
    const data = JSON.parse(decodeURIComponent(atob(escaped)));
    setupModalDinamis("Perbarui Data", sheetName, "update", Object.keys(data), data);
}

function closeModalCrud() { document.getElementById('modal-crud').classList.add('hidden'); }

function refreshCurrentMenu() {
    const fnMap = { 'siswa': fetchSiswa, 'tentor': fetchTentor, 'jurnal': fetchJurnal, 'invoice': fetchInvoice, 'slipgaji': fetchSlipgaji, 'keuangan': fetchKeuangan, 'dashboard': fetchDashboard };
    if (fnMap[currentActiveMenu]) fnMap[currentActiveMenu]();
}
