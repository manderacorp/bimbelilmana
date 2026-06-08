// Struktur kolom tetap: ID Transaksi, Tanggal, Keterangan, Tipe, Jumlah
const HEADERS_KEUANGAN = ["ID Transaksi", "Tanggal", "Keterangan", "Tipe", "Jumlah"];

async function fetchKeuangan() {
    currentActiveMenu = "keuangan";
    const container = document.getElementById('container-keuangan');
    container.innerHTML = `<span class="text-xs text-slate-400"><i class="fa-solid fa-spinner animate-spin mr-1"></i> Memuat Buku Kas...</span>`;

    try {
        const response = await fetch(`${API_URL}?action=getKeuangan`);
        const res = await response.json();
        renderTableModular(container, res, HEADERS_KEUANGAN, 'Laporan Keuangan');
    } catch (err) {
        container.innerHTML = `<div class="text-xs text-rose-500 py-4 text-center">Gagal memuat laporan kas keuangan.</div>`;
    }
}

window.openCreateKeuangan = function() {
    setupModalDinamis("Catat Transaksi Keuangan Baru", "Laporan Keuangan", "create", HEADERS_KEUANGAN);
};
