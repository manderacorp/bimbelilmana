const COL_SLIP = ['ID Slip', 'Bulan/Tahun', 'Nama Tentor', 'Total Durasi', 'Gaji Per Jam', 'Total'];

async function fetchSlipgaji() {
    currentActiveMenu = "slipgaji"; switchMenu('slipgaji');
    const box = document.getElementById('container-slipgaji');
    box.innerHTML = `<span><i class="fa-solid fa-spinner animate-spin"></i> Sinkronisasi Payroll...</span>`;
    try {
        const r = await fetch(`${API_URL}?action=getSlipgaji`);
        renderTableModular(box, await r.json(), COL_SLIP, 'Slip Gaji');
    } catch(e) { box.innerHTML = "Gagal memuat."; }
}
function openCreateSlipgaji() { setupModalDinamis("Penerbitan Slip Gaji", "Slip Gaji", "create", COL_SLIP); }
