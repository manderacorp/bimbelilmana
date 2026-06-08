// Khusus menangani data ringkasan di halaman muka Dashboard
async function fetchDashboard() {
    try {
        const response = await fetch(`${API_URL}?action=getDashboardData`);
        const res = await response.json();
        if (res.status === 'success') {
            document.getElementById('dash-pemasukan').innerText = formatIDR(res.totalPemasukan);
            document.getElementById('dash-pengeluaran').innerText = formatIDR(res.totalPengeluaran);
            document.getElementById('dash-saldo').innerText = formatIDR(res.saldo);
            
            const tableBody = document.getElementById('log-keuangan-table');
            tableBody.innerHTML = '';
            if (res.recentLogs.length === 0) {
                tableBody.innerHTML = `<tr><td colspan="3" class="px-6 py-4 text-center text-slate-400">Belum ada riwayat transaksi</td></tr>`;
            }
            res.recentLogs.forEach(log => {
                tableBody.innerHTML += `<tr>
                    <td class="px-6 py-3 font-medium text-slate-900">${log.tanggal}</td>
                    <td class="px-6 py-3">${log.keterangan}</td>
                    <td class="px-6 py-3 text-right ${log.tipe === 'Pemasukan' ? 'text-emerald-600' : 'text-rose-600'} font-semibold">${log.tipe === 'Pemasukan' ? '+' : '-'} ${formatIDR(log.jumlah)}</td>
                </tr>`;
            });
        }
    } catch (err) { 
        console.error("Gagal memuat statistik dashboard:", err); 
    }
}
