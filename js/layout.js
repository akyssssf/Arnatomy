/* ==========================================================================
   layout.js — Navigasi kaca mengambang (glassmorphism) dan footer.
   Saat halaman di atas, pil navigasi lebar dengan ikon dan label; begitu
   digulir ke bawah, label menyusut sehingga tersisa ikon saja.
   Dua varian: publik (landing) dan setelah login.
   ========================================================================== */
window.App = window.App || {};

(function (App) {
  'use strict';

  const ui = App.ui;
  const ikon = App.ikon;

  const MENU = [
    { rute: 'beranda',    label: 'Beranda',    ikon: 'rumah',   peran: ['siswa', 'guru', 'admin'] },
    { rute: 'eksplorasi', label: 'Eksplorasi', ikon: 'jantung', peran: ['siswa', 'guru', 'admin'] },
    { rute: 'asisten',    label: 'Asisten',    ikon: 'chat',    peran: ['siswa', 'guru', 'admin'] },
    { rute: 'riwayat',    label: 'Riwayat',    ikon: 'riwayat', peran: ['siswa', 'guru', 'admin'] },
    { rute: 'admin',      label: 'Admin',      ikon: 'perisai', peran: ['admin'] }
  ];

  const MENU_PUBLIK = [
    { gulir: 'atas',   label: 'Beranda',      ikon: 'rumah' },
    { gulir: 'sistem', label: 'Sistem organ', ikon: 'lapisan' },
    { gulir: 'cara',   label: 'Cara belajar', ikon: 'riwayat' }
  ];

  let pendengarGulir = null;

  function butir(atribut, label, namaIkon, aktif) {
    return (
      '<li>' +
        '<' + atribut.tag + ' ' + atribut.attrs + ' ' +
          'class="nav-butir flex h-10 items-center gap-2 rounded-full text-[13px] font-medium transition ' +
          (aktif ? 'bg-white text-neutral-900' : 'text-white/75 hover:bg-white/12 hover:text-white') + '" ' +
          (aktif ? 'aria-current="page" ' : '') + 'title="' + ui.esc(label) + '">' +
          ikon(namaIkon, 'h-[18px] w-[18px] shrink-0') +
          '<span class="nav-label">' + ui.esc(label) + '</span>' +
        '</' + atribut.tag + '>' +
      '</li>'
    );
  }

  function render(ruteAktif) {
    const header = document.getElementById('header-aplikasi');
    const footer = document.getElementById('footer-aplikasi');
    const user = App.state.sesi.user;

    if (ruteAktif === null) {
      header.hidden = true;
      footer.hidden = true;
      header.innerHTML = '';
      footer.innerHTML = '';
      lepasGulir();
      return;
    }

    let isiMenu;
    let kanan;
    if (user) {
      isiMenu = MENU
        .filter(function (m) { return m.peran.indexOf(user.role) !== -1; })
        .map(function (m) {
          return butir({ tag: 'a', attrs: 'href="#/' + m.rute + '"' }, m.label, m.ikon, m.rute === ruteAktif);
        }).join('');
      kanan =
        '<button type="button" data-keluar title="Keluar" aria-label="Keluar dari sesi" ' +
          'class="grid h-10 w-10 place-items-center rounded-full text-white/75 transition hover:bg-white/12 hover:text-white">' +
          ikon('keluar', 'h-[18px] w-[18px]') +
        '</button>';
    } else {
      isiMenu = MENU_PUBLIK.map(function (m, i) {
        return butir({ tag: 'button', attrs: 'type="button" data-gulir="' + m.gulir + '"' }, m.label, m.ikon, i === 0);
      }).join('');
      kanan =
        '<a href="#/login" class="nav-butir flex h-10 items-center gap-2 rounded-full bg-[#1a6dff] text-[13px] font-semibold text-white transition hover:bg-[#0d5cec]">' +
          '<span class="nav-label">Masuk</span>' + ikon('panah', 'h-[18px] w-[18px] shrink-0') +
        '</a>';
    }

    header.hidden = false;
    header.className = 'pointer-events-none fixed inset-x-0 top-4 z-40 flex justify-center px-4';
    header.innerHTML =
      '<nav id="nav-kaca" aria-label="Navigasi utama" ' +
        'class="nav-kaca kaca-gelap pointer-events-auto flex items-center gap-1 rounded-full p-1.5">' +
        '<a href="' + (user ? '#/beranda' : '#/') + '" aria-label="ARnatomy" ' +
          'class="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white text-[#1a6dff]">' +
          ikon('jantung', 'h-5 w-5') +
        '</a>' +
        '<ul class="flex items-center gap-0.5">' + isiMenu + '</ul>' +
        '<span class="mx-1 h-6 w-px bg-white/15" aria-hidden="true"></span>' +
        kanan +
      '</nav>';

    footer.hidden = false;
    footer.className = '';
    footer.innerHTML =
      '<div class="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 pb-10 pt-6 text-[11px] text-neutral-500 sm:flex-row sm:items-center sm:justify-between sm:px-6">' +
        '<p class="mikro">ARnatomy, prototipe front-end SKPL v1.0</p>' +
        '<p>Mode AR disimulasikan tanpa kamera &middot; D3 Teknik Informatika</p>' +
      '</div>';

    pasangInteraksi(header);
  }

  function pasangInteraksi(header) {
    const nav = header.querySelector('#nav-kaca');

    /* Menyusut saat digulir; dibaca lewat rAF supaya tidak membebani scroll */
    lepasGulir();
    let terjadwal = false;
    pendengarGulir = function () {
      if (terjadwal) return;
      terjadwal = true;
      window.requestAnimationFrame(function () {
        nav.classList.toggle('nav-ringkas', window.scrollY > 48);
        terjadwal = false;
      });
    };
    window.addEventListener('scroll', pendengarGulir, { passive: true });
    pendengarGulir();

    Array.prototype.forEach.call(header.querySelectorAll('[data-keluar]'), function (tombol) {
      tombol.addEventListener('click', function () {
        App.aksi.keluar();
        App.ui.toast('Sesi diakhiri.', 'info');
        window.location.hash = '#/';
      });
    });

    /* Varian publik: tombol menggulir ke bagian landing */
    Array.prototype.forEach.call(header.querySelectorAll('[data-gulir]'), function (tombol) {
      tombol.addEventListener('click', function () {
        const tujuan = tombol.getAttribute('data-gulir');
        if (tujuan === 'atas') { window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
        const el = document.getElementById('bagian-' + tujuan);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  }

  function lepasGulir() {
    if (pendengarGulir) window.removeEventListener('scroll', pendengarGulir);
    pendengarGulir = null;
  }

  App.layout = { render: render };
})(window.App);
