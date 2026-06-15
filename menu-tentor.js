// Sesuaikan dengan kolom Google Sheet: ID Tentor, Nama Tentor, Alamat, No. WA, Gaji Per Jam, Username, Password
const HEADERS_TENTOR = ["ID Tentor", "Nama Tentor", "Alamat", "No. WA", "Gaji Per Jam", "Username", "Password"];

async function fetchTentor() {
    currentActiveMenu = "tentor";
    const container = document.getElementById('container-tentor');
    container.innerHTML = `<span class="text-xs text-slate-400"><i class="fa-solid fa-spinner animate-spin mr-1"></i> Memuat Data Tentor...</span>`;

    try {
        const response = await fetch(`${API_URL}?action=getDataTentor`);
        const res = await response.json();
        renderTableModular(container, res, HEADERS_TENTOR, 'Data Tentor');
    } catch (err) {
        container.innerHTML = `<div class="text-xs text-rose-500 py-4 text-center">Gagal memuat database tentor.</div>`;
    }
}

window.openCreateTentor = function() {
    setupModalDinamis("Tambah Tentor Baru", "Data Tentor", "create", HEADERS_TENTOR);
};
