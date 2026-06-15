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
// 2. FUNGSI UTAMA: EKSPOR DATA KE JPG (ANTI-GAGAL & AUTO-INJECT CDN)
// ==========================================
window.exportToJPG = function(sheetName, rowEscaped) {
    const row = JSON.parse(decodeURIComponent(atob(rowEscaped)));

    // Fungsi Internal Jalankan Cetak Gambar setelah html2canvas dipastikan siap
    function eksekusiCetak() {
        const nota = document.createElement('div');
        
        // Setting CSS Standard Arial/Sans-Serif agar aman & rapi
        nota.style.position = "absolute";
        nota.style.left = "-9999px";
        nota.style.top = "0";
        nota.style.width = "400px";
        nota.style.background = "#ffffff";
        nota.style.padding = "24px";
        nota.style.fontFamily = "Arial, sans-serif";
        nota.style.color = "#1e293b";
        nota.style.border = "1px solid #e2e8f0";
        nota.style.borderRadius = "8px";
        
        let isiKonten = `
            <div style="text-align:center; border-bottom:2px dashed #cbd5e1; padding-bottom:12px; margin-bottom:16px;">
                <h2 style="margin:0; color:#4f46e5; font-size:20px; font-weight:bold;">BIMBEL ILMANA</h2>
                <p style="margin:4px 0 0; font-size:11px; color:#64748b;">Boyolali, Jawa Tengah | Cloud Admin System</p>
            </div>
            <h3 style="text-align:center; font-size:12px; margin-bottom:20px; text-transform:uppercase; font-weight:bold; color:#0f172a; letter-spacing:0.5px;">BUKTI RESMI TRANSAKSI ${sheetName}</h3>
            <table style="width:100%; font-size:12px; border-collapse:collapse;">
        `;

        Object.keys(row).forEach(key => {
            let val = row[key];
            if (typeof val === 'number' && /harga|gaji|pembayaran|jumlah|tagihan|pokok|bonus|diterima/i.test(key.toLowerCase())) {
                val = formatIDR(val);
            }
            isiKonten += `
                <tr>
                    <td style="padding:8px 0; color:#475569; width:45%; border-bottom:1px solid #f1f5f9; text-transform:capitalize;">${key}</td>
                    <td style="padding:8px 0; text-align:right; border-bottom:1px solid #f1f5f9; color:#0f172a; font-weight:bold;">${val}</td>
                </tr>
            `;
        });

        isiKonten += `
            </table>
            <div style="text-align:center; margin-top:24px; padding-top:12px; border-top:2px dashed #cbd5e1; font-size:10px; color:#94a3b8; line-height:1.4;">
                Terima kasih atas dedikasi dan kepercayaan Anda bersama kami.<br><b>SIM Admin Bimbel Ilmana</b>
            </div>
        `;
        
        nota.innerHTML = isiKonten;
        document.body.appendChild(nota);

        // Kasih jeda sedikit agar layout HTML ter-render sempurna di background browser
        setTimeout(() => {
            html2canvas(nota, { scale: 2, logging: false, useCORS: true, backgroundColor: "#ffffff" }).then(canvas => {
                const link = document.createElement('a');
                let namaFileUnik = row[Object.keys(row)[0]] || 'Dokumen';
                link.download = `Kuitansi-${sheetName}-${namaFileUnik}.jpg`;
                link.href = canvas.toDataURL('image/jpeg', 0.95);
                link.click();
                document.body.removeChild(nota);
            }).catch(err => {
                alert("Sistem gagal mengekspor berkas JPG: " + err.message);
                document.body.removeChild(nota);
            });
        }, 200);
    }

    // CEK DAN AUTO-INJECT JIKA LIBRARY HTML2CANVAS BELUM ANGGREK / READY
    if (typeof html2canvas === 'undefined') {
        console.log("Library html2canvas belum siap, mencoba memuat ulang via backup CDN...");
        const script = document.createElement('script');
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
        script.onload = () => {
            console.log("Backup CDN html2canvas berhasil dimuat.");
            eksekusiCetak();
        };
        script.onerror = () => {
            alert("Gagal memuat library cetak gambar. Periksa koneksi internet Anda Bos!");
        };
        document.head.appendChild(script);
    } else {
        // Jika sudah ada langsung jalankan tanpa interupsi
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
    
    // Primary ID diletakkan pada field teratas
    const idKey = headers[0];
    let idValue = dataObj ? dataObj[idKey] : '';
    document.getElementById('modal-id').value = idValue;

    headers.forEach((h, index) => {
        // Kolom pertama (ID) dikunci otomatis (disabled) jika tipenya update/edit
        if (index === 0) {
            container.innerHTML += `
                <div class="flex flex-col gap-1">
                    <label class="font-semibold text-slate-700">${h}</label>
                    <input type="text" value="${idValue || 'ID OTOMATIS GENERATE'}" disabled class="p-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-400 font-medium">
                </div>
            `;
        } else {
            let fieldVal = dataObj && dataObj[h] !== undefined ? dataObj[h] : '';
            
            // Format isian khusus berdasarkan penamaan kolom komponen
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

// PERBAIKAN UTAMA: Fungsi Penutup Modal agar sinkron dengan file index.html Anda
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
            
            // Auto Refresh data visual tabel sesuai menu aktif saat ini tanpa reload halaman
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
            // Auto Refresh data setelah penghapusan berhasil
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
