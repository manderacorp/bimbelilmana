// ISI DENGAN URL WEB APP DEPLOYMENT GAS ANDA
const API_URL = "https://script.google.com/macros/s/AKfycbw_zlUNVWdZxGkFxXEcLnuZXPNZfsg6ICKr9I3LUUbhia3SSUeiwGkP7-wLOEnLsw_cPw/exec";

// Inisialisasi DOM Selektor Global
const loginPage = document.getElementById('login-page');
const mainPage = document.getElementById('main-page');
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');
const btnLogout = document.getElementById('btn-logout');
const navItems = document.querySelectorAll('.nav-item');
const contentSections = document.querySelectorAll('.content-section');

let currentSheetHeaders = [];
let currentActiveMenu = "dashboard";

// Manajemen Sesi Saat Aplikasi Pertama Kali Dimuat
document.addEventListener('DOMContentLoaded', () => {
    const isLogged = localStorage.getItem('bimbel_token');
    if (isLogged) {
        showMainPage(localStorage.getItem('bimbel_role'));
    } else {
        mainPage.classList.add('hidden-system');
        loginPage.classList.remove('hidden-system');
    }
});

// Aksi Pengiriman Form Login Murni (Menghubungkan langsung ke GAS)
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btnSubmit = document.getElementById('btn-login');
    btnSubmit.disabled = true;
    btnSubmit.innerHTML = `<i class="fa-solid fa-circle-notch animate-spin"></i> Validasi...`;
    loginError.classList.add('hidden');

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            body: JSON.stringify({ 
                action: 'login', 
                username: document.getElementById('username').value, 
                password: document.getElementById('password').value 
            })
        });
        
        if (!response.ok) {
            throw new Error(`Server merespon dengan status: ${response.status}`);
        }

        const res = await response.json();
        
        if (res.status === 'success') {
            localStorage.setItem('bimbel_token', res.token);
            localStorage.setItem('bimbel_username', res.username);
            localStorage.setItem('bimbel_role', res.role);
            showMainPage(res.role);
        } else {
            loginError.innerText = res.message; 
            loginError.classList.remove('hidden');
        }
    } catch (err) {
        console.error(err);
        loginError.innerText = "Koneksi database bermasalah / Akses ditolak."; 
        loginError.classList.remove('hidden');
    } finally {
        btnSubmit.disabled = false; 
        btnSubmit.
