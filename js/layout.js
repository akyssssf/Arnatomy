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
    { rute: 'beranda',    label: 'Beranda',    ikon: 'rumah',   peran: ['siswa', 'guru', 'admin'] },
    { rute: 'eksplorasi', label: 'Eksplorasi', ikon: 'jantung', peran: ['siswa', 'guru', 'admin'] },
    { rute: 'asisten',    label: 'Asisten AI', ikon: 'chat',    peran: ['siswa', 'guru', 'admin'] },
    { rute: 'riwayat',    label: 'Riwayat',    ikon: 'riwayat', peran: ['siswa', 'guru', 'admin'] },
    { rute: 'admin',      label: 'Admin',      ikon: 'perisai', peran: ['admin'] }
  ];

  function menuUntuk(peran) {
    return MENU.filter(function (m) { return m.peran.indexOf(peran) !== -1; });
  }

  function tautan(item, ruteAktif, lebarPenuh) {
    const aktif = item.rute === ruteAktif;
    const kelas = aktif
      ? 'bg-blue-600 text-white shadow-[0_6px_16px_rgba(37,99,235,0.28)]'
      : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900';
    return (
      '<li>' +
        '<a href="#/' + item.rute + '" ' + (aktif ? 'aria-current="page" ' : '') +
          'class="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ' +
          kelas + (lebarPenuh ? ' w-full' : '') + '">' +
          ikon(item.ikon, 'h-4 w-4') + ui.esc(item.label) +
        '</a>' +
      '</li>'
    );
  }

  function inisial(nama) {
    return nama.split(' ').slice(0, 2).map(function (k) { return k.charAt(0); }).join('').toUpperCase();
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
    header.className = 'sticky top-0 z-40 bg-[#e9edf7] pt-3';
    header.innerHTML =
      '<div class="mx-auto w-full max-w-6xl px-4 sm:px-6">' +
        '<nav aria-label="Navigasi utama" ' +
          'class="flex flex-wrap items-center gap-3 rounded-2xl bg-white px-3 py-2.5 shadow-[0_2px_14px_rgba(30,58,138,0.07)]">' +

          '<a href="#/beranda" class="flex items-center gap-2.5 pl-1 pr-2">' +
            '<span class="grid h-9 w-9 place-items-center rounded-xl bg-blue-600 text-white">' +
              ikon('jantung', 'h-5 w-5') +
            '</span>' +
            '<span class="text-base font-bold tracking-tight">ARnatomy</span>' +
          '</a>' +

          '<button type="button" id="tombol-menu" aria-expanded="false" aria-controls="menu-mobile" ' +
            'class="' + v.tombol({ variant: 'halus', ukuran: 'sm' }) + ' ml-auto lg:hidden">' +
            ikon('menu', 'h-5 w-5') + '<span class="sr-only">Buka menu</span>' +
          '</button>' +

          '<ul class="mx-auto hidden items-center gap-1 lg:flex">' +
            daftar.map(function (m) { return tautan(m, ruteAktif, false); }).join('') +
          '</ul>' +

          '<div class="hidden items-center gap-2 lg:flex">' +
            '<span class="flex items-center gap-2 rounded-full bg-slate-100 py-1 pl-1 pr-3">' +
              '<span class="grid h-7 w-7 place-items-center rounded-full bg-blue-600 text-[11px] font-bold text-white">' +
                ui.esc(inisial(user.nama)) +
              '</span>' +
              '<span class="text-xs font-semibold text-slate-600">' + ui.esc(user.role) + '</span>' +
            '</span>' +
            '<button type="button" data-keluar aria-label="Keluar dari sesi" ' +
              'class="grid h-9 w-9 place-items-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700">' +
              ikon('keluar', 'h-4.5 w-4.5') +
            '</button>' +
          '</div>' +

          '<ul id="menu-mobile" hidden class="w-full space-y-1 border-t border-slate-100 pt-2 lg:hidden">' +
            daftar.map(function (m) { return tautan(m, ruteAktif, true); }).join('') +
            '<li class="flex items-center justify-between gap-3 px-2 pt-1">' +
              '<span class="text-xs text-slate-500">' + ui.esc(user.nama) + ' (' + ui.esc(user.role) + ')</span>' +
              '<button type="button" data-keluar class="' + v.tombol({ variant: 'sekunder', ukuran: 'sm' }) + '">Keluar</button>' +
            '</li>' +
          '</ul>' +
        '</div>';

    footer.hidden = false;
    footer.className = '';
    footer.innerHTML =
      '<div class="mx-auto flex w-full max-w-6xl flex-col gap-1 px-4 pb-8 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between sm:px-6">' +
        '<p>ARnatomy, prototipe front-end SKPL v1.0. Mode AR disimulasikan tanpa kamera.</p>' +
        '<p>D3 Teknik Informatika</p>' +
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
