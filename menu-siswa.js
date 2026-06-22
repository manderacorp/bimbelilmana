const COL_SISWA = ['ID Siswa', 'Nama Siswa', 'Alamat', 'No. WA', 'Harga Paket Bimbel'];

async function fetchSiswa() {
    currentActiveMenu = "siswa"; switchMenu('siswa');
    const box = document.getElementById('container-siswa');
    box.innerHTML = `<span class="text-xs text-slate-400 animate-pulse"><i class="fa-solid fa-spinner animate-spin"></i> Sinkronisasi Siswa...</span>`;
    try {
        const r = await fetch(`${API_URL}?action=getDataSiswa`);
        renderTableModular(box, await r.json(), COL_SISWA, 'Data Siswa');
    } catch(e) { box.innerHTML = "Gagal memuat."; }
}
function openCreateSiswa() { setupModalDinamis("Tambah Siswa Baru", "Data Siswa", "create", COL_SISWA); }
