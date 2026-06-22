const COL_INVOICE = ['ID Invoice', 'Bulan/Tahun', 'Nama Siswa', 'Total Durasi', 'Jumlah Pembayaran'];

async function fetchInvoice() {
    currentActiveMenu = "invoice"; switchMenu('invoice');
    const box = document.getElementById('container-invoice');
    box.innerHTML = `<span><i class="fa-solid fa-spinner animate-spin"></i> Sinkronisasi Invoice...</span>`;
    try {
        const r = await fetch(`${API_URL}?action=getInvoice`);
        renderTableModular(box, await r.json(), COL_INVOICE, 'Invoice');
    } catch(e) { box.innerHTML = "Gagal memuat."; }
}
function openCreateInvoice() { setupModalDinamis("Penerbitan Invoice", "Invoice", "create", COL_INVOICE); }
