/* ==========================================================================
   pages/beranda.js — Dashboard belajar siswa
   Ringkasan progres per sistem organ, kartu lanjutkan belajar, aktivitas
   terakhir, dan pintasan (SKPL Bab VII, tabel antarmuka role User).
   ========================================================================== */
window.App = window.App || {};
window.App.pages = window.App.pages || {};

(function (App) {
  'use strict';

  const ui = App.ui;
  const v = App.v;
  const ikon = App.ikon;

  function pesanMaskot(persenTotal, namaDepan) {
    if (persenTotal === 0) return 'Halo ' + namaDepan + '! Belum ada bagian yang dibuka. Mulai dari jantung, yuk.';
    if (persenTotal < 50) return 'Bagus, ' + namaDepan + '. Sudah ' + persenTotal + '% bagian dibuka. Lanjutkan!';
    if (persenTotal < 100) return 'Tinggal sedikit lagi, ' + namaDepan + '. ' + persenTotal + '% sudah dipelajari.';
    return 'Semua bagian sudah dibuka, ' + namaDepan + '. Coba tanya asisten untuk memperdalam.';
  }

  /* Kartu sistem organ dengan progres; yang belum tersedia ditandai segera */
  function kartuSistem(sistem) {
    const tersedia = sistem.status === 'tersedia';
    const progres = tersedia ? App.aksi.progresOrgan(sistem.id_organ) : null;
    const isiDalam =
      '<div class="grid h-20 w-20 shrink-0 place-items-center rounded-2xl bg-[#f1f2f4]">' +
        '<img src="' + ui.esc(sistem.gambar) + '" alt="" aria-hidden="true" ' +
          'class="' + (tersedia ? 'organ-abu' : 'grayscale opacity-60') + ' h-16 w-16 object-contain" />' +
      '</div>' +
      '<div class="min-w-0 flex-1">' +
        '<p class="mikro">' + ui.esc(sistem.organ) + '</p>' +
        '<h3 class="mt-0.5 truncate text-lg font-semibold leading-tight">' + ui.esc(sistem.nama) + '</h3>' +
        (tersedia
          ? '<div class="mt-2.5 flex items-center gap-3">' +
              '<div class="h-1.5 flex-1 overflow-hidden rounded-full bg-black/8" role="progressbar" ' +
                'aria-valuenow="' + progres.persen + '" aria-valuemin="0" aria-valuemax="100" ' +
                'aria-label="Progres ' + ui.esc(sistem.nama) + '">' +
                '<div class="h-full rounded-full bg-[#1a6dff]" style="width:' + progres.persen + '%"></div>' +
              '</div>' +
              '<span class="text-xs font-semibold tabular-nums">' + progres.persen + '%</span>' +
            '</div>'
          : '<span class="' + v.badge({ status: 'netral' }) + ' mt-2.5">Segera hadir</span>') +
      '</div>';

    if (!tersedia) {
      return '<article class="muncul flex items-center gap-4 rounded-2xl bg-white p-4 opacity-75">' + isiDalam + '</article>';
    }
    return (
      '<article class="muncul kartu-angkat group relative flex items-center gap-4 rounded-2xl bg-white p-4">' +
        isiDalam +
        '<a href="#/eksplorasi?organ=' + sistem.id_organ + '" aria-label="Buka ' + ui.esc(sistem.nama) + '" ' +
          'class="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#1a6dff] text-white after:absolute after:inset-0">' +
          ikon('panah', 'h-4 w-4') +
        '</a>' +
      '</article>'
    );
  }

  function barisAktivitas(r) {
    const bagian = App.aksi.bagianById(r.id_bagian);
    const organ = bagian ? App.aksi.organById(bagian.id_organ) : null;
    return (
      '<li class="flex items-center gap-3 py-2.5">' +
        '<span class="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#f1f2f4] text-neutral-700">' +
          ikon(r.jenis_konten === 'dimmed' ? 'lapisan' : 'jantung', 'h-4 w-4') +
        '</span>' +
        '<span class="min-w-0 flex-1">' +
          '<span class="block truncate text-sm font-medium">' + ui.esc(bagian ? bagian.nama_bagian_internal : '-') + '</span>' +
          '<span class="block text-[11px] text-neutral-400">' +
            ui.esc(organ ? organ.nama_organ : '') + ' &middot; label ' + ui.esc(r.jenis_konten) +
          '</span>' +
        '</span>' +
        '<span class="text-[11px] text-neutral-400">' + ui.esc(ui.formatWaktu(r.waktu_akses)) + '</span>' +
      '</li>'
    );
  }

  function pintasan(rute, namaIkon, judul, teks) {
    return (
      '<a href="#/' + rute + '" class="kartu-angkat flex items-center gap-3 rounded-2xl bg-white p-4">' +
        '<span class="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#f1f2f4] text-neutral-800">' + ikon(namaIkon, 'h-5 w-5') + '</span>' +
        '<span class="min-w-0 flex-1">' +
          '<span class="block text-sm font-semibold">' + ui.esc(judul) + '</span>' +
          '<span class="block truncate text-[11px] text-neutral-400">' + ui.esc(teks) + '</span>' +
        '</span>' +
        ikon('panah', 'h-4 w-4 text-neutral-400') +
      '</a>'
    );
  }

  App.pages.beranda = {
    judul: 'Beranda',

    render: function () {
      const user = App.state.sesi.user;
      const namaDepan = user.nama.split(' ')[0];
      const jam = new Date().getHours();
      const sapaan = jam < 11 ? 'Selamat pagi' : jam < 15 ? 'Selamat siang' : jam < 19 ? 'Selamat sore' : 'Selamat malam';

      const totalBagian = App.state.body_parts.length;
      const dipelajari = App.aksi.jumlahBagianDipelajari();
      const persenTotal = totalBagian ? Math.round((dipelajari / totalBagian) * 100) : 0;
      const terakhir = App.aksi.riwayatTerakhir();
      const bagianTerakhir = terakhir ? App.aksi.bagianById(terakhir.id_bagian) : null;
      const organLanjut = bagianTerakhir ? App.aksi.organById(bagianTerakhir.id_organ) : App.state.organs[0];
      const progresLanjut = App.aksi.progresOrgan(organLanjut.id_organ);
      const aktivitas = App.state.learning_history.slice(-5).reverse();
      const dimmedDibuka = App.state.learning_history.filter(function (r) { return r.jenis_konten === 'dimmed'; }).length;

      return (
        '<section aria-labelledby="judul-beranda">' +

          '<div class="flex flex-wrap items-end justify-between gap-4 pt-4">' +
            '<div>' +
              '<p class="mikro mb-3">Dashboard belajar</p>' +
              '<h1 id="judul-beranda" class="titik-biru text-4xl font-semibold leading-[0.95] sm:text-5xl">' +
                ui.judulKata([[sapaan + ','], [namaDepan]]) +
              '</h1>' +
            '</div>' +
            '<p class="mikro">' + ui.esc(user.role) + (user.asal_sekolah ? ' &middot; ' + ui.esc(user.asal_sekolah) : '') + '</p>' +
          '</div>' +

          /* Baris utama: lanjutkan belajar + maskot */
          '<div class="mt-8 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">' +
            '<article class="muncul group relative flex flex-col justify-between overflow-hidden rounded-3xl bg-white p-6 sm:p-7">' +
              '<div class="relative z-10 max-w-sm">' +
                '<p class="mikro">' + (terakhir ? 'Lanjutkan belajar' : 'Mulai belajar') + '</p>' +
                '<h2 class="titik-biru mt-3 text-3xl font-semibold">' + ui.esc(organLanjut.nama_organ) + '</h2>' +
                '<p class="mt-2 text-sm leading-relaxed text-neutral-500">' +
                  ui.esc(organLanjut.sistem_organ) + ' &middot; ' + progresLanjut.dipelajari + ' dari ' + progresLanjut.total + ' bagian dibuka' +
                  (bagianTerakhir ? '. Terakhir: ' + ui.esc(bagianTerakhir.nama_bagian_internal) + '.' : '.') +
                '</p>' +
              '</div>' +
              '<div class="relative z-10 mt-8 flex flex-wrap items-center gap-4">' +
                '<a href="#/eksplorasi?organ=' + organLanjut.id_organ + '" class="' + v.tombol({ ukuran: 'md' }) + '">' +
                  (terakhir ? 'Lanjutkan' : 'Buka model') + ikon('panah', 'h-4 w-4') +
                '</a>' +
                '<div class="flex items-center gap-2 text-xs text-neutral-500">' +
                  '<div class="h-1.5 w-28 overflow-hidden rounded-full bg-black/8" role="progressbar" aria-valuenow="' + progresLanjut.persen + '" aria-valuemin="0" aria-valuemax="100" aria-label="Progres ' + ui.esc(organLanjut.nama_organ) + '">' +
                    '<div class="h-full rounded-full bg-[#1a6dff]" style="width:' + progresLanjut.persen + '%"></div>' +
                  '</div>' +
                  '<span class="font-semibold tabular-nums">' + progresLanjut.persen + '%</span>' +
                '</div>' +
              '</div>' +
              '<img src="' + ui.esc(organLanjut.gambar) + '" alt="" aria-hidden="true" ' +
                'class="organ-abu pointer-events-none absolute -bottom-10 -right-10 w-44 opacity-25 sm:-right-4 sm:w-60 sm:opacity-100 lg:-right-2 lg:w-64" />' +
            '</article>' +

            '<article class="muncul flex flex-col justify-between rounded-3xl bg-[#1a6dff] p-6 text-white sm:p-7">' +
              '<div class="flex items-start gap-4">' +
                ui.maskot('maskot-goyang h-20 w-20 shrink-0') +
                '<div>' +
                  '<p class="mikro text-white/60">Arno</p>' +
                  '<p class="mt-2 text-lg font-medium leading-snug">' + ui.esc(pesanMaskot(persenTotal, namaDepan)) + '</p>' +
                '</div>' +
              '</div>' +
              '<dl class="mt-8 grid grid-cols-3 gap-3 border-t border-white/15 pt-5">' +
                '<div><dt class="text-[11px] uppercase tracking-[0.08em] text-white/60">Dibuka</dt><dd class="mt-1 text-2xl font-semibold">' + dipelajari + '<span class="text-sm text-white/60">/' + totalBagian + '</span></dd></div>' +
                '<div><dt class="text-[11px] uppercase tracking-[0.08em] text-white/60">Dimmed</dt><dd class="mt-1 text-2xl font-semibold">' + dimmedDibuka + '</dd></div>' +
                '<div><dt class="text-[11px] uppercase tracking-[0.08em] text-white/60">Tanya AI</dt><dd class="mt-1 text-2xl font-semibold">' + App.state.ai_conversations.length + '</dd></div>' +
              '</dl>' +
            '</article>' +
          '</div>' +

          /* Sistem organ */
          '<div class="mt-12 flex flex-wrap items-end justify-between gap-4">' +
            '<h2 class="titik-biru text-3xl font-semibold sm:text-4xl">Sistem organ</h2>' +
            '<p class="text-sm text-neutral-500">Progres tiap sistem tercatat otomatis.</p>' +
          '</div>' +
          '<div class="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">' +
            App.state.sistem_organ.map(kartuSistem).join('') +
          '</div>' +

          /* Aktivitas & pintasan */
          '<div class="mt-12 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">' +
            '<section aria-labelledby="judul-aktivitas" class="muncul rounded-3xl bg-white p-6">' +
              '<h2 id="judul-aktivitas" class="titik-biru text-2xl font-semibold">Aktivitas terakhir</h2>' +
              (aktivitas.length
                ? '<ul class="mt-3 divide-y divide-black/5">' + aktivitas.map(barisAktivitas).join('') + '</ul>'
                : '<p class="mt-3 text-sm text-neutral-500">Belum ada aktivitas. Buka salah satu bagian organ untuk mulai mencatat.</p>') +
              '<a href="#/riwayat" class="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[#1a6dff]">Lihat semua riwayat' + ikon('panah', 'h-4 w-4') + '</a>' +
            '</section>' +
            '<section aria-labelledby="judul-pintasan" class="muncul">' +
              '<h2 id="judul-pintasan" class="titik-biru text-2xl font-semibold">Pintasan</h2>' +
              '<div class="mt-3 grid gap-3">' +
                pintasan('asisten', 'chat', 'Asisten AI', 'Tanya fungsi, letak, atau gangguan') +
                pintasan('riwayat', 'riwayat', 'Riwayat belajar', 'Rekam bagian yang sudah dibuka') +
                (user.role === 'admin' ? pintasan('admin', 'perisai', 'Dashboard Admin', 'Kelola konten dan laporan') : '') +
              '</div>' +
            '</section>' +
          '</div>' +
        '</section>'
      );
    },

    mount: function () { /* halaman statis: navigasi ditangani tautan hash */ }
  };
})(window.App);
