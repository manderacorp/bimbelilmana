// Struktur kolom tetap: ID, Nama Siswa, Kelas, No HP Orang Tua, Alamat, Status Paket
const HEADERS_SISWA = ["ID", "Nama Siswa", "Kelas", "No HP Orang Tua", "Alamat", "Status Paket"];

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

// Override tombol tambah khusus siswa
window.openCreateSiswa = function() {
    setupModalDinamis("Tambah Siswa Baru", "Data Siswa", "create", HEADERS_SISWA);
};
