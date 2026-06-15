// Sesuaikan dengan kolom Google Sheet: ID Siswa, Nama Siswa, Alamat, No. WA, Harga Paket Bimbel
const HEADERS_SISWA = ["ID Siswa", "Nama Siswa", "Alamat", "No. WA", "Harga Paket Bimbel"];

async function fetchSiswa() {
    currentActiveMenu = "siswa";
    const container = document.getElementById('container-siswa');
    container.innerHTML = `<span class="text-xs text-slate-400"><i class="fa-solid fa-spinner animate-spin mr-1"></i> Memuat Data Siswa...</span>`;

    try {
        const response = await fetch(`${API_URL}?action=getDataSiswa`);
        const res = await response.json();
        renderTableModular(container, res, HEADERS_SISWA, 'Data Siswa');
    } catch (err) {
        container.innerHTML = `<div class="text-xs text-rose-500 py-4 text-center">Gagal memuat database siswa.</div>`;
    }
}

window.openCreateSiswa = function() {
    setupModalDinamis("Tambah Siswa Baru", "Data Siswa", "create", HEADERS_SISWA);
};
