// SIM Admin Bimbel Ilmana - Core CRUD Helper System

// ==========================================
// 1. FUNGSI UTAMA: RENDER TABEL MODULAR
// ==========================================
function renderTableModular(container, res, headers, sheetName) {
    if (res.status === 'success' && res.data && res.data.length > 0) {
        let tableHTML = `<table class="w-full text-left text-xs text-slate-600 border border-slate-100 rounded-lg overflow-hidden"><thead class="bg-slate-50 text-slate-500"><tr>`;
        headers.forEach(h => tableHTML += `<th class="px-4 py-3 capitalize">${h}</th>`);
        tableHTML += `<th class="px-4 py-3 text-center">Aksi</th></tr></thead><tbody class="divide-y divide-slate-100">`;

        res.data.forEach(row => {
            tableHTML += `<tr class="hover:bg-slate-50">`;
            headers.forEach(h => {
                // Mengambil isi data berdasarkan nama kolom yang cocok secara presisi dengan Google Sheet
                let rowKey = Object.keys(row).find(k => k.toLowerCase().trim() === h.toLowerCase().trim());
                let val = rowKey && row[rowKey] !== undefined && row[rowKey] !== null ? row[rowKey] : "-";
                
                // Format IDR otomatis jika kolom berhubungan dengan nominal keuangan/uang
                if (typeof val === 'number' && /harga|gaji|pembayaran|jumlah|tagihan|pokok|bonus|diterima/i.test(h)) {
                    val = formatIDR(val);
                }
                tableHTML += `<td class="px-4 py-3">${val}</td>`;
            });

            // Mendapatkan Primary ID Unik (selalu kolom pertama di sheet data)
            let actualIdKey = Object.keys(row)[0];
            let idValue = actualIdKey && row[actualIdKey] ? row[actualIdKey].toString().replace(/'/g, "\\'") : "";
            
            // Encode data baris secara aman agar tidak merusak elemen parameter onclick HTML
            const rowEscaped = btoa(encodeURIComponent(JSON.stringify(row)));
            
            // Perbaikan Pemanggilan Fungsi Edit & Hapus agar parameternya tereksekusi dengan benar
            let aksiButtons = `
                <button type="button" onclick="openUpdateModular('${sheetName}', '${rowEscaped}')" class="p-1.5 text-amber-500 hover:text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg transition-all cursor-pointer" title="Ubah Data"><i class="fa-solid fa-pen-to-square"></i></button>
                <button type="button" onclick="hapusDataCrud('${sheetName}', '${idValue}')" class="p-1.5 text-rose-500 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-all cursor-pointer" title="Hapus Data"><i class="fa-solid fa-trash-can"></i></button>
            `;

            // Khusus menu Invoice dan Slip Gaji, tambahkan tombol Cetak / Ekspor Gambar JPG Struk Bukti Resmi
            if (sheetName === 'Invoice' || sheetName === 'Slip Gaji') {
                aksiButtons += `
                    <button type="button" onclick="exportToJPG('${sheetName}', '${rowEscaped}')" class="p-1.5 text-emerald-500 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-all cursor-pointer" title="Ekspor JPG Bukti"><i class="fa-solid fa-file-image"></i></button>
                `;
            }

            tableHTML += `<td class="px-4 py-2 text-center flex items-center justify-center gap-2">${aksiButtons}</td></tr>`;
        });

        tableHTML += `</tbody></table>`;
        container.innerHTML = tableHTML;
    } else {
        container.innerHTML = `<div class="text-xs text-slate-400 py-8 text-center"><i class="fa-solid fa-folder-open text-2xl mb-2 block text-slate-300"></i> Belum ada rekaman data di sheet ${sheetName}.</div>`;
    }
}

// Helper penembatan data khusus untuk aksi edit / update data
window.openUpdateModular = function(sheetName, rowEscaped) {
    const rowData = JSON.parse(decodeURIComponent(atob(rowEscaped)));
    const headers = Object.keys(rowData);
    setupModalDinamis(`Perbarui Data ${sheetName}`, sheetName, 'update', headers, rowData);
};

// ==========================================
// 2. FUNGSI UTAMA: EKSPOR DATA KE JPG (ANTI-OKLCH PATCH)
// ==========================================
window.exportToJPG = function(sheetName, rowEscaped) {
    const row = JSON.parse(decodeURIComponent(atob(rowEscaped)));

    function eksekusiCetak() {
        // MEMBUAT CONTAINER UTAMA YANG TERISOLASI
        const notaContainer = document.createElement('div');
        notaContainer.style.position = "absolute";
        notaContainer.style.left = "-9999px";
        notaContainer.style.top = "0";
        notaContainer.style.width = "450px";
        notaContainer.style.padding = "30px";
        notaContainer.style.background = "#ffffff"; 
        notaContainer.style.color = "#334155";      
        notaContainer.style.boxSizing = "border-box";
        
        let isiKonten = `
            <div style="text-align: center; border-bottom: 2px dashed #cbd5e1; padding-bottom: 15px; margin-bottom: 20px;">
                <h2 style="margin: 0; padding: 0; color: #4f46e5; font-family: Arial, sans-serif; font-size: 24px; font-weight: bold;">BIMBEL ILMANA</h2>
                <p style="margin: 5px 0 0 0; padding: 0; font-family: Arial, sans-serif; font-size: 11px; color: #64748b;">Boyolali, Jawa Tengah | Cloud Admin System</p>
            </div>
            
            <h3 style="text-align: center; font-family: Arial, sans-serif; font-size: 13px; margin: 0 0 25px 0; padding: 0; text-transform: uppercase; font-weight: bold; color: #0f172a; letter-spacing: 1px;">
                BUKTI RESMI TRANSAKSI ${sheetName.toUpperCase()}
            </h3>
            
            <table style="width: 100%; border-collapse: collapse; font-family: Arial, sans-serif; font-size: 13px;">
        `;

        Object.keys(row).forEach(key => {
            let val = row[key];
            if (typeof val === 'number' && /harga|gaji|pembayaran|jumlah|tagihan|pokok|bonus|diterima/i.test(key.toLowerCase())) {
                val = formatIDR(val);
            }
            isiKonten += `
                <tr>
                    <td style="padding: 10px 0; color: #475569; width: 45%; border-bottom: 1px solid #f1f5f9; text-transform: capitalize; font-family: Arial, sans-serif;">${key}</td>
                    <td style="padding: 10px 0; text-align: right; border-bottom: 1px solid #f1f5f9; color: #0f172a; font-weight: bold; font-family: Arial, sans-serif;">${val}</td>
                </tr>
            `;
        });

        isiKonten += `
            </table>
            
            <div style="text-align: center; margin-top: 35px; padding-top: 15px; border-top: 2px dashed #cbd5e1; font-family: Arial, sans-serif; font-size: 11px; color: #94a3b8; line-height: 1.5;">
                Terima kasih atas dedikasi dan kepercayaan Anda bersama kami.<br>
                <strong style="color: #64748b;">SIM Admin Bimbel Ilmana</strong>
            </div>
        `;
        
        notaContainer.innerHTML = isiKonten;
        document.body.appendChild(notaContainer);

        // --- INJEKSI AMAN (PATCH OKLCH FOR HTML2CANVAS) ---
        // Simpan fungsi asli window.getComputedStyle bawaan browser
        const fungsiStyleAsli = window.getComputedStyle;
        
        // Manipulasi fungsi agar jika html2canvas membaca format oklch, diganti string kosong agar tidak crash
        window.getComputedStyle = function(el, pseudoElt) {
            const styles = fungsiStyleAsli(el, pseudoElt);
            const propertiProxy = new Proxy(styles, {
                get(target, prop) {
                    const nilaiAsli = target[prop];
                    if (typeof nilaiAsli === 'string' && nilaiAsli.includes('oklch')) {
                        return ''; // Jinakkan warna oklch penyebab error
                    }
                    return nilaiAsli;
                }
            });
            return propertiProxy;
        };

        // Eksekusi Render Gambar Kuitansi
        setTimeout(() => {
            html2canvas(notaContainer, {
                scale: 2,
                logging: false,
                useCORS: true,
                backgroundColor: "#ffffff"
            }).then(canvas => {
                // Kembalikan fungsi getComputedStyle asli browser agar komponen dashboard Tailwind v4 normal lagi
                window.getComputedStyle = fungsiStyleAsli;

                const link = document.createElement('a');
                let namaFileUnik = row[Object.keys(row)[0]] || 'Dokumen';
                link.download = `Kuitansi-${sheetName}-${namaFileUnik}.jpg`;
                link.href = canvas.toDataURL('image/jpeg', 0.95);
                link.click();
                document.body.removeChild(notaContainer);
            }).catch(err => {
                // Kembalikan fungsi asli jika error melanda
                window.getComputedStyle = fungsiStyleAsli;
                alert("Sistem gagal mengekspor berkas JPG: " + err.message);
                document.body.removeChild(notaContainer);
            });
        }, 200);
    }

    if (typeof html2canvas === 'undefined') {
        const script = document.createElement('script');
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
        script.onload = eksekusiCetak;
        script.onerror = () => alert("Gagal memuat sistem cetak kuitansi.");
        document.head.appendChild(script);
    } else {
        eksekusiCetak();
    }
};

// ==========================================
// 3. FUNGSI OTOMATISASI FORM MODAL INPUT / EDIT
// ==========================================
window.setupModalDinamis = function(title, sheetName, actionType, headers, dataObj = null) {
    document.getElementById('modal-title').innerText = title;
    document.getElementById('modal-sheet-name').value = sheetName;
    document.getElementById('modal-action-type').value = actionType;
    
    const container = document.getElementById('modal-fields-container');
    container.innerHTML = '';
    
    const idKey = headers[0];
    let idValue = dataObj ? dataObj[idKey] : '';
    document.getElementById('modal-id').value = idValue;

    headers.forEach((h, index) => {
        if (index === 0) {
            container.innerHTML += `
                <div class="flex flex-col gap-1">
                    <label class="font-semibold text-slate-700">${h}</label>
                    <input type="text" value="${idValue || 'ID OTOMATIS GENERATE'}" disabled class="p-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-400 font-medium">
                </div>
            `;
        } else {
            let fieldVal = dataObj && dataObj[h] !== undefined ? dataObj[h] : '';
            
            if (h.toLowerCase().trim() === 'status' || h.toLowerCase().trim() === 'status pembayaran') {
                container.innerHTML += `
                    <div class="flex flex-col gap-1">
                        <label class="font-semibold text-slate-700">${h}</label>
                        <select name="${h}" required class="p-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500">
                            <option value="Lunas" ${fieldVal === 'Lunas' ? 'selected' : ''}>Lunas</option>
                            <option value="Belum Lunas" ${fieldVal === 'Belum Lunas' ? 'selected' : ''}>Belum Lunas</option>
                            <option value="Proses" ${fieldVal === 'Proses' ? 'selected' : ''}>Proses</option>
                        </select>
                    </div>
                `;
            } else if (h.toLowerCase().trim() === 'tipe') {
                container.innerHTML += `
                    <div class="flex flex-col gap-1">
                        <label class="font-semibold text-slate-700">${h}</label>
                        <select name="${h}" required class="p-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500">
                            <option value="Pemasukan" ${fieldVal === 'Pemasukan' ? 'selected' : ''}>Pemasukan</option>
                            <option value="Pengeluaran" ${fieldVal === 'Pengeluaran' ? 'selected' : ''}>Pengeluaran</option>
                        </select>
                    </div>
                `;
            } else {
                let inputType = "text";
                if (/harga|gaji|pembayaran|jumlah|tagihan|pokok|bonus|durasi|pertemuan/i.test(h)) inputType = "number";
                if (/tanggal/i.test(h)) inputType = "date";

                container.innerHTML += `
                    <div class="flex flex-col gap-1">
                        <label class="font-semibold text-slate-700">${h}</label>
                        <input type="${inputType}" name="${h}" value="${fieldVal}" required class="p-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500">
                    </div>
                `;
            }
        }
    });

    document.getElementById('crud-modal').classList.remove('hidden-system');
};

window.closeCrudModal = function() {
    document.getElementById('crud-modal').classList.add('hidden-system');
    document.getElementById('crud-form').reset();
};

// ==========================================
// 4. HANDLER EVENT SUBMIT FORM (CREATE & UPDATE)
// ==========================================
document.getElementById('crud-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btnSave = document.getElementById('btn-save-crud');
    btnSave.disabled = true;
    btnSave.innerHTML = `<i class="fa-solid fa-spinner animate-spin mr-1"></i> Menyimpan...`;

    const sheetName = document.getElementById('modal-sheet-name').value;
    const actionType = document.getElementById('modal-action-type').value;
    const idValue = document.getElementById('modal-id').value;
    
    const formData = {};
    const elements = e.target.querySelectorAll('input[name], select[name]');
    elements.forEach(el => {
        formData[el.name] = el.value;
    });

    try {
        const payload = {
            action: actionType,
            sheetName: sheetName,
            id: idValue,
            formData: formData
        };

        const response = await fetch(API_URL, {
            method: 'POST',
            body: JSON.stringify(payload)
        });
        
        const json = await response.json();

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
            alert("Gagal memproses data: " + json.message);
        }
    } catch (err) {
        alert("Terjadi gangguan jaringan atau URL GAS salah.");
    } finally {
        btnSave.disabled = false;
        btnSave.innerHTML = `Simpan Data`;
    }
});

// ==========================================
// 5. HANDLER EVENT HAPUS DATA (DELETE)
// ==========================================
window.hapusDataCrud = async function(sheetName, idValue) {
    if (!confirm(`Apakah Anda yakin ingin menghapus permanen data dengan ID: ${idValue}?`)) return;

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
        alert("Gagal memproses hapus data karena kendala jaringan.");
    }
};
