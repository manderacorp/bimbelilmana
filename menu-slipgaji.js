// Sesuaikan dengan kolom Google Sheet: ID Slip, Bulan/Tahun, Nama Tentor, Total Durasi, Gaji Pokok, Status
const HEADERS_SLIPGAJI = ["ID Slip", "Bulan/Tahun", "Nama Tentor", "Total Durasi", "Gaji Pokok", "Status"];

async function fetchSlipgaji() {
    currentActiveMenu = "slipgaji";
    const container = document.getElementById('container-slipgaji');
    container.innerHTML = `<span class="text-xs text-slate-400"><i class="fa-solid fa-spinner animate-spin mr-1"></i> Memuat Slip Gaji...</span>`;

    try {
        const response = await fetch(`${API_URL}?action=getSlipgaji`);
        const res = await response.json();
        renderTableModular(container, res, HEADERS_SLIPGAJI, 'Slip Gaji');
    } catch (err) {
        container.innerHTML = `<div class="text-xs text-rose-500 py-4 text-center">Gagal memuat log penggajian.</div>`;
    }
}

window.openCreateSlipgaji = function() {
    setupModalDinamis("Buat Slip Gaji Tentor", "Slip Gaji", "create", HEADERS_SLIPGAJI);
};
