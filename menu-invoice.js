// Sesuaikan dengan kolom Google Sheet: ID Invoice, Bulan/Tahun, Nama Siswa, Jumlah Pertemuan, Total Durasi, Jumlah Pembayaran, Status
const HEADERS_INVOICE = ["ID Invoice", "Bulan/Tahun", "Nama Siswa", "Jumlah Pertemuan", "Total Durasi", "Jumlah Pembayaran", "Status"];

async function fetchInvoice() {
    currentActiveMenu = "invoice";
    const container = document.getElementById('container-invoice');
    container.innerHTML = `<span class="text-xs text-slate-400"><i class="fa-solid fa-spinner animate-spin mr-1"></i> Memuat Invoice...</span>`;

    try {
        const response = await fetch(`${API_URL}?action=getInvoice`);
        const res = await response.json();
        renderTableModular(container, res, HEADERS_INVOICE, 'Invoice');
    } catch (err) {
        container.innerHTML = `<div class="text-xs text-rose-500 py-4 text-center">Gagal memuat data tagihan.</div>`;
    }
}

window.openCreateInvoice = function() {
    setupModalDinamis("Buat Invoice Baru", "Invoice", "create", HEADERS_INVOICE);
};
