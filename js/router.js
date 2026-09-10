/* ==========================================================================
   router.js — Routing SPA sederhana berbasis hash (#/rute?param=nilai)
   Termasuk penjagaan akses (guard) berdasarkan status login dan peran,
   serta pembersihan listener halaman sebelumnya.
   ========================================================================== */
window.App = window.App || {};

(function (App) {
  'use strict';

  const RUTE_DEFAULT = 'beranda';
  let rutePrev = null;

  /** Memecah hash menjadi { rute, query }. */
  function baca() {
    const mentah = window.location.hash.replace(/^#\/?/, '') || '';
    const bagian = mentah.split('?');
    const rute = bagian[0] || '';
    const query = {};
    if (bagian[1]) {
      bagian[1].split('&').forEach(function (pasangan) {
        const kv = pasangan.split('=');
        if (kv[0]) query[decodeURIComponent(kv[0])] = decodeURIComponent(kv[1] || '');
      });
    }
    return { rute: rute, query: query };
  }

  function halamanTidakDitemukan(rute) {
    return {
      judul: 'Halaman tidak ditemukan',
      render: function () {
        return (
          '<section class="py-16 text-center">' +
            '<span class="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-blue-50 text-blue-600">' +
              App.ikon('info', 'h-6 w-6') +
            '</span>' +
            '<h1 class="mt-4 text-2xl font-bold tracking-tight">Halaman tidak ditemukan</h1>' +
            '<p class="mt-1 text-sm text-slate-500">Rute <code class="rounded-md bg-slate-100 px-1.5 py-0.5">#/' +
              App.ui.esc(rute) + '</code> tidak tersedia.</p>' +
            '<a href="#/' + RUTE_DEFAULT + '" class="' + App.v.tombol({ ukuran: 'md', class: 'mt-5' }) + '">Kembali ke Beranda</a>' +
          '</section>'
        );
      },
      mount: function () {}
    };
  }

  function gantiRute(rute) {
    window.location.hash = '#/' + rute;
  }

  function render() {
    const ctx = baca();
    const user = App.state.sesi.user;
    let namaRute = ctx.rute;

    /* --- Guard 1: rute kosong --- */
    if (!namaRute) {
      gantiRute(user ? RUTE_DEFAULT : 'login');
      return;
    }

    /* --- Guard 2: wajib login --- */
    if (!user && namaRute !== 'login') {
      App.ui.toast('Silakan masuk terlebih dahulu.', 'info');
      gantiRute('login');
      return;
    }

    /* --- Guard 3: sudah login tidak perlu ke halaman login --- */
    if (user && namaRute === 'login') {
      gantiRute(user.role === 'admin' ? 'admin' : RUTE_DEFAULT);
      return;
    }

    let halaman = App.pages[namaRute];

    /* --- Guard 4: pembatasan peran (RBAC) --- */
    if (halaman && halaman.peran && user && halaman.peran.indexOf(user.role) === -1) {
      App.ui.toast('Halaman tersebut khusus Administrator.', 'error');
      gantiRute(RUTE_DEFAULT);
      return;
    }

    if (!halaman) halaman = halamanTidakDitemukan(namaRute);

    /* Bersihkan halaman sebelumnya bila menyediakan fungsi pembersih */
    if (rutePrev && App.pages[rutePrev] && typeof App.pages[rutePrev].bersihkan === 'function') {
      App.pages[rutePrev].bersihkan();
    }

    /* Tutup sisa overlay dari halaman sebelumnya */
    document.getElementById('lapisan-modal').innerHTML = '';

    document.title = halaman.judul + ' · ARnatomy';
    App.layout.render(halaman.tanpaLayout ? null : namaRute);

    const utama = document.getElementById('konten-utama');
    utama.innerHTML = halaman.render(ctx);
    if (typeof halaman.mount === 'function') halaman.mount(ctx);

    window.scrollTo(0, 0);
    utama.focus();
    rutePrev = App.pages[namaRute] ? namaRute : null;
  }

  /** Merender ulang rute aktif (dipakai setelah data berubah). */
  function muatUlang() { render(); }

  function mulai() {
    window.addEventListener('hashchange', render);
    render();
  }

  App.router = { mulai: mulai, render: render, muatUlang: muatUlang, baca: baca };
})(window.App);
