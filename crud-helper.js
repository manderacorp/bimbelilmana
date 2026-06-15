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
            const rowEscaped = btoa(encodeURIComponent(JSON.stringify(row)));
            
            // Tombol Aksi Default (Ubah dan Hapus)
            let aksiButtons = `
                <button type="button" onclick="setupModalDinamis('Perbarui Data ${sheetName}', '${sheetName}', 'update', ${JSON.stringify(headers)}, JSON.parse(decodeURIComponent(atob('${rowEscaped}'))))" class="p-1.5 text-amber-500 hover:text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg transition-all cursor-pointer" title="Ubah Data"><i class="fa-solid fa-pen-to-square"></i></button>
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

// ==========================================
// 2. FUNGSI UTAMA: EKSPOR DATA KE JPG (STRUK KUITANSI)
// ==========================================
window.exportToJPG = function(sheetName, rowEscaped) {
    const row = JSON.parse(decodeURIComponent(atob(rowEscaped)));
    const nota = document.createElement('div');
    
    // Setting CSS Layout Bukti Struk Fisik Bayangan Sebelum Dirender ke JPG
    nota.style.position = "absolute";
    nota.style.left = "-9999px";
    nota.style.width = "420px";
    nota.style.background = "#ffffff";
    nota.style.padding = "28px";
    nota.style.fontFamily = "'Courier New', Courier, monospace";
    nota.style.color = "#1e293b";
    nota.style.border = "1px solid #cbd5e1";
    
    let isiKonten = `
        <div style="text-align:center; border-bottom:2px dashed #94a3b8; padding-bottom:12px; margin-bottom:16px;">
            <h2 style="margin:0; color:#4f46e5; font-size:22px; font-weight:bold; letter-spacing:1px;">BIMBEL ILMANA</h2>
            <p style="margin:4px 0 0; font-size:11px; color:#64748b;">Boyolali, Jawa Tengah | Cloud Admin System</p>
        </div>
        <h3 style="text-align:center; font-size:13px; margin-bottom:20px; text-transform:uppercase; font-weight:bold; color:#0f172a; letter-spacing:1px;">BUKTI RESMI TRANSAKSI ${sheetName}</h3>
        <table style="width:100%; font-size:12px; border-collapse:collapse;">
    `;

    Object.keys(row).forEach(key => {
        let val = row[key];
        // Deteksi nilai finansial angka agar rapi dalam format mata uang rupiah
