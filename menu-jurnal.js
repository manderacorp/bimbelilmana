const COL_JURNAL = ['ID Jurnal', 'Tanggal', 'Nama Siswa', 'Nama Tentor', 'Mata Pelajaran', 'Materi', 'Durasi', 'Catatan'];

async function fetchJurnal() {
    currentActiveMenu = "jurnal"; switchMenu('jurnal');
    const box = document.getElementById('container-jurnal');
    box.innerHTML = `<span><i class="fa-solid fa-spinner animate-spin"></i> Sinkronisasi Jurnal...</span>`;
    try {
        const r = await fetch(`${API_URL}?action=getJurnal`);
        renderTableModular(box, await r.json(), COL_JURNAL, 'Jurnal');
    } catch(e) { box.innerHTML = "Gagal memuat."; }
}
function openCreateJurnal() { setupModalDinamis("Buat Catatan Jurnal", "Jurnal", "create", COL_JURNAL); }
