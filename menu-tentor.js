const COL_TENTOR = ['ID Tentor', 'Nama Tentor', 'Alamat', 'No. WA', 'Gaji Per Jam'];

async function fetchTentor() {
    currentActiveMenu = "tentor"; switchMenu('tentor');
    const box = document.getElementById('container-tentor');
    box.innerHTML = `<span class="text-xs text-slate-400 animate-pulse"><i class="fa-solid fa-spinner animate-spin"></i> Sinkronisasi Tentor...</span>`;
    try {
        const r = await fetch(`${API_URL}?action=getDataTentor`);
        renderTableModular(box, await r.json(), COL_TENTOR, 'Data Tentor');
    } catch(e) { box.innerHTML = "Gagal memuat."; }
}
function openCreateTentor() { setupModalDinamis("Tambah Tentor Baru", "Data Tentor", "create", COL_TENTOR); }
