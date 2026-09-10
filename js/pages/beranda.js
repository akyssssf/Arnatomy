/* ==========================================================================
   pages/beranda.js — Halaman Utama
   Pintasan menuju eksplorasi sistem peredaran darah dan riwayat belajar
   (SKPL Bab VII, tabel antarmuka role User).
   ========================================================================== */
window.App = window.App || {};
window.App.pages = window.App.pages || {};

(function (App) {
  'use strict';

  const ui = App.ui;
  const v = App.v;
  const ikon = App.ikon;

  function kartuMenu(opsi) {
    return (
      '<article class="' + v.kartu({ interaktif: 'true', padding: 'md' }) + ' relative flex h-full flex-col">' +
        '<span class="grid h-11 w-11 place-items-center rounded-xl bg-blue-50 text-blue-600">' +
          ikon(opsi.ikon, 'h-5 w-5') +
        '</span>' +
        '<h3 class="mt-4 text-base font-bold tracking-tight">' +
          '<a href="#/' + opsi.rute + '" class="after:absolute after:inset-0">' + ui.esc(opsi.judul) + '</a>' +
        '</h3>' +
        '<p class="mt-1.5 flex-1 text-sm leading-relaxed text-slate-500">' + ui.esc(opsi.deskripsi) + '</p>' +
        '<span class="mt-4 flex items-center gap-1.5 text-xs font-semibold text-blue-600">' +
          ui.esc(opsi.aksi) + ikon('panah', 'h-4 w-4') +
        '</span>' +
      '</article>'
    );
  }

  function kartuAngka(label, nilai, keterangan) {
    return (
      '<div class="' + v.kartu({ padding: 'md' }) + '">' +
        '<p class="text-xs text-slate-400">' + ui.esc(label) + '</p>' +
        '<p class="mt-1 text-2xl font-bold tracking-tight">' + ui.esc(nilai) + '</p>' +
        '<p class="mt-0.5 text-xs text-slate-400">' + ui.esc(keterangan) + '</p>' +
      '</div>'
    );
  }

  App.pages.beranda = {
    judul: 'Beranda',

    render: function () {
      const user = App.state.sesi.user;
      const organ = App.state.organs[0];
      const total = App.state.body_parts.length;
      const dipelajari = App.aksi.jumlahBagianDipelajari();
      const persen = total ? Math.round((dipelajari / total) * 100) : 0;
      const namaDepan = user.nama.split(' ')[0];
      const jam = new Date().getHours();
      const sapaan = jam < 11 ? 'Selamat pagi' : jam < 15 ? 'Selamat siang' : jam < 19 ? 'Selamat sore' : 'Selamat malam';

      const kartuAdmin = user.role === 'admin'
        ? kartuMenu({
            rute: 'admin', ikon: 'perisai',
            judul: 'Dashboard Administrator',
            deskripsi: 'Kelola label dasar dan dimmed, ubah status validasi, tindak lanjuti laporan kesalahan.',
            aksi: 'Buka dashboard'
          })
        : '';

      return (
        '<section aria-labelledby="judul-beranda">' +

          '<header class="flex flex-wrap items-end justify-between gap-4 pt-5">' +
            '<div>' +
              '<h1 id="judul-beranda" class="text-2xl font-bold tracking-tight text-blue-600 sm:text-3xl">' +
                ui.esc(sapaan) + ', ' + ui.esc(namaDepan) + '!' +
              '</h1>' +
              '<p class="mt-1 text-sm text-slate-500">' +
                ui.esc(organ.sistem_organ) + ' &middot; masuk sebagai ' + ui.esc(user.role) +
              '</p>' +
            '</div>' +
            '<a href="#/eksplorasi" class="' + v.tombol({ ukuran: 'md' }) + '">' +
              ikon('tambah', 'h-4 w-4') + 'Mulai eksplorasi' +
            '</a>' +
          '</header>' +

          /* Ringkasan angka */
          '<div class="mt-5 grid gap-4 sm:grid-cols-3">' +
            '<article class="' + v.kartu({ nada: 'brand', padding: 'md' }) + ' sm:col-span-1">' +
              '<p class="text-xs text-blue-100">Progres eksplorasi</p>' +
              '<p class="mt-1 text-3xl font-bold tracking-tight">' + persen + '%</p>' +
              '<div class="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/25" ' +
                'role="progressbar" aria-valuenow="' + persen + '" aria-valuemin="0" aria-valuemax="100" ' +
                'aria-label="Persentase bagian tubuh yang sudah dipelajari">' +
                '<div class="h-full rounded-full bg-white transition-all" style="width: ' + persen + '%"></div>' +
              '</div>' +
              '<p class="mt-2 text-xs text-blue-100">' + dipelajari + ' dari ' + total + ' bagian tubuh sudah dibuka</p>' +
            '</article>' +
            kartuAngka('Bagian terdata', String(total), organ.nama_organ) +
            kartuAngka('Label tersedia', String(App.state.part_content.length), 'Label dasar dan dimmed') +
          '</div>' +

          /* Kartu menu */
          '<h2 class="mb-3 mt-7 text-sm font-bold tracking-tight">Menu</h2>' +
          '<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">' +
            kartuMenu({
              rute: 'eksplorasi', ikon: 'jantung',
              judul: 'Eksplorasi Organ 3D',
              deskripsi: 'Putar model jantung, nyalakan layer anatomi, buka label dasar dan label dimmed.',
              aksi: 'Buka model'
            }) +
            kartuMenu({
              rute: 'riwayat', ikon: 'riwayat',
              judul: 'Riwayat Belajar',
              deskripsi: dipelajari
                ? dipelajari + ' bagian tubuh tercatat pada sesi ini beserta waktu aksesnya.'
                : 'Belum ada catatan. Riwayat terisi otomatis saat label dibuka.',
              aksi: 'Lihat riwayat'
            }) +
            kartuMenu({
              rute: 'asisten', ikon: 'chat',
              judul: 'Asisten AI',
              deskripsi: 'Tanya fungsi, letak, atau gangguan pada bagian jantung yang sedang dipilih.',
              aksi: 'Mulai bertanya'
            }) +
            kartuAdmin +
          '</div>' +
        '</section>'
      );
    },

    mount: function () { /* halaman statis: navigasi ditangani tautan hash */ }
  };
})(window.App);
