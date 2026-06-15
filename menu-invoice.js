// Struktur kolom tetap: ID Invoice, Tanggal, Nama Siswa, Total Tagihan, Status Pembayaran
const HEADERS_INVOICE = ["ID Invoice", "Tanggal", "Nama Siswa", "Total Tagihan", "Status Pembayaran"];

/**
 * Memuat dan menampilkan tabel invoice dari Google Sheets via GAS
 */
async function fetchInvoice() {
    currentActiveMenu = "invoice";
    const container = document.getElementById('container-invoice');
    container.innerHTML = `<span class=\"text-xs text-slate-400\"><i class=\"fa-solid fa-spinner animate-spin mr-1\"></i> Memuat Invoice...</span>`;

    try {
        const response = await fetch(`${API_URL}?action=getInvoice`);
        const res = await response.json();
        
        // Memanggil fungsi render tabel modular bawaan SIM Admin
        renderTableModular(container, res, HEADERS_INVOICE, 'Invoice');
    } catch (err) {
        container.innerHTML = `<div class=\"text-xs text-rose-500 py-4 text-center\">Gagal memuat data tagihan.</div>`;
    }
}

/**
 * Memicu Modal Pembuatan Invoice Baru (Menggunakan Layout Rapi Sesuai invoice.js)
 */
window.openCreateInvoice = function() {
    // Tetap menggunakan helper CRUD agar terintegrasi dengan Google Sheet
    setupModalDinamis("Buat Invoice Baru", "Invoice", "create", HEADERS_INVOICE);
    
    // Opsional: Jika Anda ingin memicu fungsi selektor otomatis / kalkulasi harga 
    // seperti pada cuplikan invoice.js (onchange="updatePreviewInv"), Anda bisa menginisiasinya di sini.
};
