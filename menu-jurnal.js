// Struktur kolom tetap: ID, Tanggal, Nama Tentor, Nama Siswa, Materi, Durasi (Menit)
const HEADERS_JURNAL = ["ID", "Tanggal", "Nama Tentor", "Nama Siswa", "Materi", "Durasi (Menit)"];

async function fetchJurnal() {
    currentActiveMenu = "jurnal";
    const container = document.getElementById('container-jurnal');
    container.innerHTML = `<span class="text-xs text-slate-400"><i class="fa-solid fa-spinner animate-spin mr-1"></i> Memuat Jurnal...</span>`;

    try {
        const response = await fetch(`${API_URL}?action=getJurnal`);
        const res = await response.json();
        renderTableModular(container, res, HEADERS_JURNAL, 'Jurnal');
    } catch (err) {
        container.innerHTML = `<div class="text-xs text-rose-500 py-4 text-center">Gagal memuat jurnal mengajar.</div>`;
    }
}

window.openCreateJurnal = function() {
    setupModalDinamis("Tambah Jurnal Mengajar", "Jurnal", "create", HEADERS_JURNAL);
};
