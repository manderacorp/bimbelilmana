const API_URL = "https://script.google.com/macros/s/AKfycbw62osCNy3X1e1S2V3q4lLgVdQuBDcxWkOSQt5Cv56jcy2LYlYpPdxMSUYxpqclzDH4EQ/exec"; 

function switchMenu(menuName) {
    document.querySelectorAll('.menu-content').forEach(el => el.classList.add('hidden'));
    const target = document.getElementById(`view-${menuName}`);
    if (target) target.classList.remove('hidden');
    
    const titleMap = {
        'dashboard': 'Dashboard Ringkasan', 'siswa': 'Data Siswa Utama', 'tentor': 'Database Tentor',
        'jurnal': 'Arsip Jurnal Mengajar', 'invoice': 'Billing Invoice Siswa', 
        'slipgaji': 'Slip Gaji Payroll', 'keuangan': 'Buku Kas Laporan Keuangan'
    };
    document.getElementById('page-title').innerText = titleMap[menuName] || 'SIM Admin';
}

function formatIDR(val) {
    let num = parseInt(val) || 0;
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);
}
