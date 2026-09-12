/* ==========================================================================
   pages/landing.js — Halaman depan publik (sebelum login)
   Hero dengan organ 3D, katalog sistem organ (tersedia / segera), cara
   belajar, dan ajakan masuk bersama maskot.
   ========================================================================== */
window.App = window.App || {};
window.App.pages = window.App.pages || {};

(function (App) {
  'use strict';

  const ui = App.ui;
  const v = App.v;
  const ikon = App.ikon;

  const LANGKAH = [
    { nomor: '01', judul: 'Pilih sistem organ', teks: 'Mulai dari peredaran darah atau pernapasan. Sistem lain menyusul.' },
    { nomor: '02', judul: 'Putar dan ketuk titik', teks: 'Model 3D bisa diputar bebas. Titik bernomor membuka label dasar, label redup membuka detail lanjutan.' },
    { nomor: '03', judul: 'Tanya asisten', teks: 'Yang belum jelas ditanyakan ke asisten AI dengan konteks bagian yang sedang dilihat.' }
  ];

  /* Kartu sistem organ: gambar di kiri, nama di kanan; yang belum tersedia abu-abu */
  function kartuSistem(sistem) {
    const tersedia = sistem.status === 'tersedia';
    return (
      '<article class="muncul kartu-angkat group relative flex items-center gap-4 overflow-hidden rounded-2xl bg-white p-4 sm:p-5' +
        (tersedia ? '' : ' opacity-80') + '">' +
        '<div class="grid h-24 w-24 shrink-0 place-items-center rounded-2xl bg-[#f1f2f4] sm:h-28 sm:w-28">' +
          '<img src="' + ui.esc(sistem.gambar) + '" alt="" aria-hidden="true" ' +
            'class="' + (tersedia ? 'organ-abu' : 'grayscale opacity-70') + ' h-20 w-20 object-contain sm:h-24 sm:w-24" />' +
        '</div>' +
        '<div class="min-w-0 flex-1">' +
          '<p class="mikro">' + ui.esc(sistem.organ) + '</p>' +
          '<h3 class="mt-1 text-xl font-semibold leading-tight">' + ui.esc(sistem.nama) + '</h3>' +
          '<span class="' + v.badge({ status: tersedia ? 'tervalidasi' : 'netral' }) + ' mt-3">' +
            (tersedia ? 'Tersedia' : 'Segera hadir') +
          '</span>' +
        '</div>' +
      '</article>'
    );
  }

  App.pages.landing = {
    judul: 'ARnatomy',

    render: function () {
      const organ = App.state.organs[0];
      const sistem = App.state.sistem_organ;
      const jumlahTersedia = sistem.filter(function (x) { return x.status === 'tersedia'; }).length;

      return (
        '<section id="bagian-atas" aria-labelledby="judul-landing" class="pt-6 sm:pt-10">' +

          /* Hero */
          '<div class="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">' +
            '<h1 id="judul-landing" class="titik-biru denyut text-[2.9rem] font-semibold leading-[0.92] sm:text-6xl lg:text-[5.75rem]">' +
              ui.judulKata([['Belajar', 'anatomi'], ['lewat', 'model', '3D']]) +
            '</h1>' +
            '<div class="muncul flex items-end justify-between gap-6 lg:mb-3" style="transition-delay:300ms">' +
              '<p class="max-w-xs text-sm leading-relaxed text-neutral-500">' +
                'Putar organ, ketuk bagiannya, baca labelnya, lalu tanyakan yang belum jelas ke asisten AI. ' +
                'Dibuat untuk siswa SMP dan SMA.' +
              '</p>' +
              '<a href="#/login" class="' + v.tombol({ ukuran: 'lg' }) + ' shrink-0">' +
                'Masuk' + ikon('panah', 'h-4 w-4') +
              '</a>' +
            '</div>' +
          '</div>' +

          /* Panggung organ 3D dengan maskot menyapa */
          '<div class="muncul relative mt-10 overflow-hidden rounded-3xl bg-[#f1f2f4]" style="transition-delay:200ms">' +
            '<div class="relative aspect-[4/3] w-full sm:aspect-[16/9] lg:aspect-[21/9]">' +
              '<span class="piringan-organ" aria-hidden="true"></span>' +
              '<div id="hero-3d" class="absolute inset-0"></div>' +
              '<img src="' + ui.esc(organ.gambar) + '" alt="Model 3D jantung manusia" ' +
                'class="hero-gambar melayang pointer-events-none absolute left-1/2 top-1/2 h-[82%] w-auto -translate-x-1/2 -translate-y-1/2" />' +
              '<p class="mikro kaca absolute left-4 top-4 rounded-full px-3 py-1.5">Model 3D &middot; ' + ui.esc(organ.nama_organ) + '</p>' +
              '<p class="mikro kaca absolute right-4 top-4 hidden rounded-full px-3 py-1.5 sm:block">SKPL v1.0</p>' +

              '<div class="kaca melayang-lambat absolute bottom-4 left-4 flex max-w-[min(20rem,80%)] items-center gap-3 rounded-2xl p-3 pr-4">' +
                ui.maskot('maskot-goyang h-14 w-14 shrink-0') +
                '<div class="min-w-0">' +
                  '<p class="mikro">Arno, asisten belajar</p>' +
                  '<p class="mt-1 text-sm font-medium leading-snug">Halo! Mau mulai dari jantung atau paru-paru?</p>' +
                '</div>' +
              '</div>' +

              '<div class="kaca absolute bottom-4 right-4 hidden rounded-2xl px-4 py-3 sm:block">' +
                '<p class="mikro">Sistem organ</p>' +
                '<p class="mt-1 text-2xl font-semibold leading-none">' + jumlahTersedia +
                  ' <span class="text-sm font-medium text-neutral-500">dari ' + sistem.length + '</span></p>' +
              '</div>' +
            '</div>' +
          '</div>' +

          '<div class="muncul mt-8">' +
            ui.marquee(['Sistem Peredaran Darah', 'Sistem Pernapasan', 'Model Organ 3D', 'Label Interaktif', 'Asisten AI'], 'Fitur') +
          '</div>' +
        '</section>' +

        /* Katalog sistem organ */
        '<section id="bagian-sistem" aria-labelledby="judul-sistem" class="scroll-mt-24 pt-16">' +
          '<div class="flex flex-wrap items-end justify-between gap-4">' +
            '<div>' +
              '<p class="mikro mb-3">Katalog</p>' +
              '<h2 id="judul-sistem" class="titik-biru text-4xl font-semibold sm:text-5xl">Sistem organ</h2>' +
            '</div>' +
            '<p class="max-w-sm text-sm text-neutral-500">' +
              'Dua sistem sudah bisa dijelajah dengan model 3D. Sistem lain sedang disiapkan.' +
            '</p>' +
          '</div>' +
          '<div class="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">' + sistem.map(kartuSistem).join('') + '</div>' +
        '</section>' +

        /* Cara belajar */
        '<section id="bagian-cara" aria-labelledby="judul-cara" class="scroll-mt-24 pt-16">' +
          '<p class="mikro mb-3">Alur</p>' +
          '<h2 id="judul-cara" class="titik-biru text-4xl font-semibold sm:text-5xl">Cara belajar</h2>' +
          '<div class="mt-6 grid gap-4 md:grid-cols-3">' +
            LANGKAH.map(function (l) {
              return (
                '<article class="muncul ' + v.kartu({ nada: 'aksen', padding: 'lg' }) + '">' +
                  '<p class="text-5xl font-semibold tracking-tight text-[#1a6dff]">' + l.nomor + '</p>' +
                  '<h3 class="mt-6 text-xl font-semibold">' + ui.esc(l.judul) + '</h3>' +
                  '<p class="mt-2 text-sm leading-relaxed text-neutral-500">' + ui.esc(l.teks) + '</p>' +
                '</article>'
              );
            }).join('') +
          '</div>' +
        '</section>' +

        /* Ajakan masuk bersama maskot */
        '<section aria-labelledby="judul-ajak" class="pt-16">' +
          '<div class="muncul relative overflow-hidden rounded-3xl bg-neutral-900 px-6 py-10 text-white sm:px-10 sm:py-14">' +
            '<div class="grid gap-8 md:grid-cols-[1fr_auto] md:items-center">' +
              '<div>' +
                '<p class="mikro text-white/60">Siap mulai?</p>' +
                '<h2 id="judul-ajak" class="titik-biru mt-3 text-4xl font-semibold sm:text-5xl">Masuk dan buka modelnya</h2>' +
                '<p class="mt-3 max-w-md text-sm leading-relaxed text-white/70">' +
                  'Tersedia akun uji coba untuk siswa, guru, dan administrator. Riwayat belajar tercatat otomatis selama sesi.' +
                '</p>' +
                '<a href="#/login" class="' + v.tombol({ ukuran: 'lg' }) + ' mt-6">Masuk sekarang' + ikon('panah', 'h-4 w-4') + '</a>' +
              '</div>' +
              ui.maskot('melayang h-40 w-40 md:h-52 md:w-52') +
            '</div>' +
          '</div>' +
        '</section>'
      );
    },

    mount: function () {
      ui.pasangHero3d('hero-3d', { jarak: 1.5, kecepatanPutar: 0.7 });
      App.pages.landing.bersihkan = function () {
        if (App.viewer3d) App.viewer3d.bersihkan();
      };
    }
  };
})(window.App);
