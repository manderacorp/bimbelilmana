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
// 2. FUNGSI UTAMA: CETAK KUITANSI LANDSCAPE (ANTI-CRASH)
// ==========================================
window.exportToJPG = function(sheetName, rowEscaped) {
    const row = JSON.parse(decodeURIComponent(atob(rowEscaped)));

    // Ambil data primary ID untuk penamaan berkas / pencarian data
    let primaryId = row[Object.keys(row)[0]] || 'INV-000';
    
    // Extrak variabel fleksibel (mengatasi variasi penamaan kolom di Google Sheet)
    let namaSubjek = row["Nama Siswa"] || row["Nama Tentor"] || row["Nama"] || "-";
    let bulanTahun = row["Bulan/Tahun"] || row["Tanggal"] || row["Bulan"] || "-";
    let jumlahPertemuan = row["Jumlah Pertemuan"] || row["Total Durasi"] || "-";
    
    // Deteksi Nominal Keuangan
    let nominalUtama = row["Jumlah Pembayaran"] || row["Total Tagihan"] || row["Total Diterima"] || row["Gaji Pokok"] || 0;
    let hargaPaket = typeof nominalUtama === 'number' ? nominalUtama : parseInt(nominalUtama.toString().replace(/[^0-9]/g, '')) || 0;

    // 1. Buat elemen kontainer khusus area cetak
    const printContainer = document.createElement('div');
    printContainer.id = "area-cetak-sim-bimbel";
    
    // Struktur HTML Faktur Resmi Berorientasi Landscape (A5 / Kuarto Landscape Style)
    let isiKonten = `
        <div style="width: 790px; margin: 0 auto; padding: 25px; background: #ffffff; color: #334155; box-sizing: border-box; font-family: 'Segoe UI', Arial, sans-serif; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 12px; line-height: 1.5;">
            
            <table style="width: 100%; border-bottom: 3px double #64748b; padding-bottom: 12px; margin-bottom: 15px;">
                <tr>
                    <td style="width: 80px; vertical-align: middle;">
                        <img src="logo.png" alt="Logo" style="max-height: 65px; max-width: 75px; object-fit: contain;" onerror="this.style.display='none';">
                    </td>
                    <td style="vertical-align: middle; padding-left: 10px;">
                        <h1 style="margin: 0; padding: 0; color: #4f46e5; font-size: 22px; font-weight: 800; letter-spacing: 0.5px;">BIMBEL ILMANA</h1>
                        <p style="margin: 3px 0 0 0; padding: 0; font-size: 11px; color: #475569; font-weight: 500;">
                            <i class="fa-solid fa-location-dot"></i> Gondang No. 46 RT 03/RW 04, Candi, Ampel, Boyolali<br>
                            <i class="fa-brands fa-whatsapp"></i> WhatsApp Admin: 083866682376 
                        </p>
                    </td>
                    <td style="text-align: right; vertical-align: bottom; width: 250px;">
                        <h2 style="margin: 0; padding: 0; color: #0f172a; font-size: 15px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">BUKTI ${sheetName.toUpperCase()}</h2>
                        <p style="margin: 2px 0 0 0; font-family: monospace; font-size: 11px; color: #64748b;">No: ${primaryId}</p>
                    </td>
                </tr>
            </table>

            <table style="width: 100%; margin-bottom: 20px; background: #f8fafc; padding: 12px; border-radius: 6px; border: 1px solid #f1f5f9;">
                <tr>
                    <td style="width: 50%; vertical-align: top;">
                        <span style="color: #94a3b8; font-weight: bold; text-transform: uppercase; font-size: 10px; block; margin-bottom: 3px;">Ditujukan Kepada:</span>
                        <table style="font-size: 12px;">
                            <tr><td style="color: #64748b; width: 50px;">Nama</td><td style="font-weight: 700; color: #0f172a;">: ${namaSubjek}</td></tr>
                            <tr><td style="color: #64748b;">Alamat</td><td style="color: #334155;">: Boyolali, Jawa Tengah</td></tr>
                        </table>
                    </td>
                    <td style="width: 50%; vertical-align: top; text-align: right;">
                        <span style="color: #94a3b8; font-weight: bold; text-transform: uppercase; font-size: 10px; block; margin-bottom: 3px;">Tanggal Dokumen:</span>
                        <table style="font-size: 12px; margin-left: auto;">
                            <tr><td style="color: #64748b; text-align: right;">Periode / Bulan</td><td style="font-weight: 600; color: #0f172a; padding-left: 5px;">: ${bulanTahun}</td></tr>
                            <tr><td style="color: #64748b; text-align: right;">Tgl Dibuat</td><td style="color: #334155; padding-left: 5px;">: ${new Date().toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'})}</td></tr>
                        </table>
                    </td>
                </tr>
            </table>

            <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px; font-size: 12px;">
                <thead>
                    <tr style="background: #4f46e5; color: #ffffff;">
                        <th style="padding: 10px; text-align: left; border-top-left-radius: 4px; border-bottom-left-radius: 4px; width: 40%;">Deskripsi Komponen</th>
                        <th style="padding: 10px; text-align: center; width: 20%;">Jumlah Pertemuan</th>
                        <th style="padding: 10px; text-align: right; width: 20%;">Harga Paket</th>
                        <th style="padding: 10px; text-align: right; border-top-right-radius: 4px; border-bottom-right-radius: 4px; width: 20%;">Total</th>
                    </tr>
                </thead>
                <tbody>
                    <tr style="background: #ffffff;">
                        <td style="padding: 12px 10px; border-bottom: 1px solid #e2e8f0; font-weight: 600; color: #1e293b;">
                            Layanan Jasa Pengajaran Bimbel Ilmana (${sheetName})
                        </td>
                        <td style="padding: 12px 10px; border-bottom: 1px solid #e2e8f0; text-align: center; color: #334155;">
                            ${jumlahPertemuan} Pertemuan
                        </td>
                        <td style="padding: 12px 10px; border-bottom: 1px solid #e2e8f0; text-align: right; color: #334155;">
                            ${formatIDR(hargaPaket)}
                        </td>
                        <td style="padding: 12px 10px; border-bottom: 1px solid #e2e8f0; text-align: right; font-weight: bold; color: #0f172a;">
                            ${formatIDR(hargaPaket)}
                        </td>
                    </tr>
                    <tr style="background: #f8fafc;">
                        <td colspan="2" style="padding: 10px;"></td>
                        <td style="padding: 10px; text-align: right; font-weight: 700; color: #475569;">TOTAL TAGIHAN:</td>
                        <td style="padding: 10px; text-align: right; font-weight: 800; color: #4f46e5; font-size: 13px; background: #e0e7ff;">
                            ${formatIDR(hargaPaket)}
                        </td>
                    </tr>
                </tbody>
            </table>

            <table style="width: 100%; margin-top: 15px;">
                <tr>
                    <td style="vertical-align: top; color: #94a3b8; font-size: 11px; font-style: italic; width: 60%;">
                        * Bukti ini sah dikeluarkan secara sistem awan (cloud) SIM Admin Bimbel Ilmana.<br>
                        Terima kasih atas kepercayaan Anda bersama kami.
                    </td>
                    <td style="width: 40%; text-align: right; vertical-align: top;">
                        <div style="display: inline-block; text-align: center; width: 160px;">
                            <span style="color: #64748b; font-size: 11px; display: block; margin-bottom: 5px;">Hormat Kami,</span>
                            
                            <div style="margin: 5px auto; padding: 4px; background: #ffffff; border: 1px solid #e2e8f0; inline-block; width: 75px; height: 75px; border-radius: 4px;">
                                <img src="https://chart.googleapis.com/chart?chs=75x75&cht=qr&chl=BIMBEL_ILMANA_${primaryId}_VALID&choe=UTF-8" style="width:100%; height:100%;" alt="QR Code Sign">
                            </div>
                            
                            <strong style="color: #0f172a; font-size: 12px; display: block; margin-top: 5px; border-top: 1px solid #cbd5e1; padding-top: 3px;">Admin Bimbel Ilmana</strong>
                        </div>
                    </td>
                </tr>
            </table>

        </div>
    `;
    
    printContainer.innerHTML = isiKonten;

    // 2. Suntikkan CSS khusus Cetak Kertas LANDSCAPE & Sembunyikan Dashboard Utama
    const stylePrint = document.createElement('style');
    stylePrint.innerHTML = `
        @media print {
            @page { 
                size: A4 landscape; 
                margin: 15mm; 
            }
            body * { display: none !important; }
            #area-cetak-sim-bimbel, #area-cetak-sim-bimbel * { display: block !important; }
            #area-cetak-sim-bimbel { position: absolute; left: 0; top: 0; width: 100%; background: #ffffff; }
            table { page-break-inside: avoid; }
        }
    `;

    // 3. Pasang ke dokumen dan eksekusi cetak browser
    document.head.appendChild(stylePrint);
    document.body.appendChild(printContainer);
    
    setTimeout(() => {
        window.print();
        
        // 4. Bersihkan elemen bayangan setelah selesai / batal cetak agar dashboard normal kembali
        document.body.removeChild(printContainer);
        document.head.removeChild(stylePrint);
    }, 200);
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
