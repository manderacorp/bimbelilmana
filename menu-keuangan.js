const COL_KAS = ['ID Transaksi', 'Tanggal', 'Keterangan', 'Tipe', 'Jumlah'];

async function fetchKeuangan() {
    currentActiveMenu = "keuangan"; switchMenu('keuangan');
    const box = document.getElementById('container-keuangan');
    box.innerHTML = `<span><i class="fa-solid fa-spinner animate-spin"></i> Sinkronisasi Kas Keuangan...</span>`;
    try {
        const r = await fetch(`${API_URL}?action=getKeuangan`);
        renderTableModular(box, await r.json(), COL_KAS, 'Laporan Keuangan');
    } catch(e) { box.innerHTML = "Gagal memuat."; }
}
function openCreateKeuangan() { setupModalDinamis("Tambah Transaksi Buku Kas", "Laporan Keuangan", "create", COL_KAS); }
