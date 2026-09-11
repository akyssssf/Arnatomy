/* ==========================================================================
   layout.js — Header, navigasi utama (responsif), dan footer aplikasi.
   Ditampilkan hanya ketika pengguna sudah login.
   ========================================================================== */
window.App = window.App || {};

(function (App) {
  'use strict';

  const ui = App.ui;
  const v = App.v;
  const ikon = App.ikon;

  const MENU = [
    { rute: 'beranda',    label: 'Beranda',    peran: ['siswa', 'guru', 'admin'] },
    { rute: 'eksplorasi', label: 'Eksplorasi', peran: ['siswa', 'guru', 'admin'] },
    { rute: 'asisten',    label: 'Asisten',    peran: ['siswa', 'guru', 'admin'] },
    { rute: 'riwayat',    label: 'Riwayat',    peran: ['siswa', 'guru', 'admin'] },
    { rute: 'admin',      label: 'Admin',      peran: ['admin'] }
  ];

  function menuUntuk(peran) {
    return MENU.filter(function (m) { return m.peran.indexOf(peran) !== -1; });
  }

  /** Tautan navigasi desktop: teks polos dipisah garis miring, aktif = hitam tebal */
  function tautanDesktop(item, ruteAktif) {
    const aktif = item.rute === ruteAktif;
    return (
      '<li>' +
        '<a href="#/' + item.rute + '" ' + (aktif ? 'aria-current="page" ' : '') +
          'class="text-[13px] transition ' +
          (aktif ? 'font-semibold text-neutral-900' : 'font-medium text-neutral-500 hover:text-neutral-900') + '">' +
          ui.esc(item.label) +
        '</a>' +
      '</li>'
    );
  }

  function tautanMobile(item, ruteAktif) {
    const aktif = item.rute === ruteAktif;
    return (
      '<li>' +
        '<a href="#/' + item.rute + '" ' + (aktif ? 'aria-current="page" ' : '') +
          'class="block rounded-full px-4 py-2.5 text-sm font-medium ' +
          (aktif ? 'bg-neutral-900 text-white' : 'text-neutral-600 hover:bg-black/5') + '">' +
          ui.esc(item.label) +
        '</a>' +
      '</li>'
    );
  }

  function render(ruteAktif) {
    const header = document.getElementById('header-aplikasi');
    const footer = document.getElementById('footer-aplikasi');
    const user = App.state.sesi.user;

    if (!user) {
      header.hidden = true;
      footer.hidden = true;
      header.innerHTML = '';
      footer.innerHTML = '';
      return;
    }

    const daftar = menuUntuk(user.role);

    header.hidden = false;
    header.className = 'sticky top-0 z-40 bg-[#e6e8eb]';
    header.innerHTML =
      '<div class="mx-auto w-full max-w-6xl px-4 sm:px-6">' +
        '<nav aria-label="Navigasi utama" class="flex flex-wrap items-center gap-4 py-4">' +

          '<a href="#/beranda" class="tampilan titik-biru text-lg font-semibold tracking-tight">ARnatomy</a>' +

          '<button type="button" id="tombol-menu" aria-expanded="false" aria-controls="menu-mobile" ' +
            'class="' + v.tombol({ variant: 'halus', ukuran: 'sm' }) + ' ml-auto lg:hidden">' +
            ikon('menu', 'h-5 w-5') + '<span class="sr-only">Buka menu</span>' +
          '</button>' +

          '<ul class="nav-miring mx-auto hidden items-center lg:flex">' +
            daftar.map(function (m) { return tautanDesktop(m, ruteAktif); }).join('') +
          '</ul>' +

          '<div class="hidden items-center gap-3 lg:flex">' +
            '<span class="mikro">' + ui.esc(user.role) + '</span>' +
            '<button type="button" data-keluar class="' + v.tombol({ variant: 'garis', ukuran: 'sm' }) + '">' +
              'Keluar' + ikon('keluar', 'h-3.5 w-3.5') +
            '</button>' +
          '</div>' +

          '<ul id="menu-mobile" hidden class="w-full space-y-1 rounded-2xl bg-white p-2 lg:hidden">' +
            daftar.map(function (m) { return tautanMobile(m, ruteAktif); }).join('') +
            '<li class="flex items-center justify-between gap-3 px-4 pb-1 pt-2">' +
              '<span class="text-xs text-neutral-500">' + ui.esc(user.nama) + '</span>' +
              '<button type="button" data-keluar class="' + v.tombol({ variant: 'sekunder', ukuran: 'sm' }) + '">Keluar</button>' +
            '</li>' +
          '</ul>' +
        '</nav>' +
      '</div>';

    footer.hidden = false;
    footer.className = '';
    footer.innerHTML =
      '<div class="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 pb-10 pt-4 text-[11px] text-neutral-500 sm:flex-row sm:items-center sm:justify-between sm:px-6">' +
        '<p class="mikro">ARnatomy, prototipe front-end SKPL v1.0</p>' +
        '<p>Mode AR disimulasikan tanpa kamera &middot; D3 Teknik Informatika</p>' +
      '</div>';

    pasangInteraksi(header);
  }

  function pasangInteraksi(header) {
    const tombolMenu = header.querySelector('#tombol-menu');
    const panel = header.querySelector('#menu-mobile');

    tombolMenu.addEventListener('click', function () {
      const terbuka = tombolMenu.getAttribute('aria-expanded') === 'true';
      tombolMenu.setAttribute('aria-expanded', String(!terbuka));
      panel.hidden = terbuka;
    });

    /* Escape menutup menu mobile */
    header.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !panel.hidden) {
        panel.hidden = true;
        tombolMenu.setAttribute('aria-expanded', 'false');
        tombolMenu.focus();
      }
    });

    Array.prototype.forEach.call(header.querySelectorAll('[data-keluar]'), function (tombol) {
      tombol.addEventListener('click', function () {
        App.aksi.keluar();
        App.ui.toast('Sesi diakhiri.', 'info');
        window.location.hash = '#/login';
      });
    });
  }

  App.layout = { render: render };
})(window.App);
