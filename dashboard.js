async function fetchDashboard() {
    currentActiveMenu = "dashboard";
    switchMenu('dashboard');
    try {
        const r = await fetch(`${API_URL}?action=getDashboardData`);
        const res = await r.json();
        if (res.status === 'success') {
            document.getElementById('dash-masuk').innerText = formatIDR(res.totalPemasukan);
            document.getElementById('dash-keluar').innerText = formatIDR(res.totalPengeluaran);
            document.getElementById('dash-saldo').innerText = formatIDR(res.saldo);
        }
    } catch(err) { console.error("Gagal sinkron dashboard stats"); }
}
window.onload = fetchDashboard;
