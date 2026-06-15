// auth.js - Handler Navigasi Menu Workspace Utama
document.addEventListener('DOMContentLoaded', () => {
    // Jalankan dashboard otomatis saat pertama kali dibuka
    if (typeof fetchDashboard === 'function') fetchDashboard();

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            const target = e.currentTarget.getAttribute('data-target');
            
            // Perbarui visual tombol navigasi aktif
            navItems.forEach(btn => {
                btn.classList.remove('bg-indigo-600', 'text-white');
                btn.classList.add('hover:bg-slate-800', 'hover:text-slate-200');
            });
            e.currentTarget.classList.add('bg-indigo-600', 'text-white');
            e.currentTarget.classList.remove('hover:bg-slate-800', 'hover:text-slate-200');

            // Tampilkan section yang dipilih
            contentSections.forEach(sec => sec.classList.add('hidden-system'));
            document.getElementById(`content-${target}`).classList.remove('hidden-system');

            // Trigger fetch data modul menu masing-masing
            if (target === 'dashboard') {
                if (typeof fetchDashboard === 'function') fetchDashboard();
            } else if (target === 'siswa') {
                if (typeof fetchSiswa === 'function') fetchSiswa();
            } else if (target === 'tentor') {
                if (typeof fetchTentor === 'function') fetchTentor();
            } else if (target === 'jurnal') {
                if (typeof fetchJurnal === 'function') fetchJurnal();
            } else if (target === 'invoice') {
                if (typeof fetchInvoice === 'function') fetchInvoice();
            } else if (target === 'slipgaji') {
                if (typeof fetchSlipgaji === 'function') fetchSlipgaji();
            } else if (target === 'keuangan') {
                if (typeof fetchKeuangan === 'function') fetchKeuangan();
            } else if (target === 'usermanage') {
                const container = document.getElementById('container-usermanage');
                if (container) {
                    container.innerHTML = `<span class="text-xs text-slate-400"><i class="fa-solid fa-spinner animate-spin mr-1"></i> Memuat Akses Login...</span>`;
                    fetch(`${API_URL}?action=getDataTentor`)
                        .then(res => res.json())
                        .then(res => renderTableModular(container, res, ["ID", "Nama Tentor", "Username", "Password"], 'Data Tentor'))
                        .catch(() => container.innerHTML = `<div class="text-xs text-rose-500 py-4 text-center">Gagal memuat data akses.</div>`);
                }
            }
        });
    });
});

function formatIDR(num) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);
}
