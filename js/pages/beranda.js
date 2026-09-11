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

  /* Kartu menu: ikon di kiri, judul dan keterangan di kanan */
  function kartuMenu(opsi) {
    return (
      '<article class="' + v.kartu({ interaktif: 'true', padding: 'md' }) + ' relative flex items-center gap-5">' +
        '<span class="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-[#f1f2f4] text-neutral-800">' +
          ikon(opsi.ikon, 'h-7 w-7') +
        '</span>' +
        '<div class="min-w-0 flex-1">' +
          '<h3 class="text-xl font-semibold">' +
            '<a href="#/' + opsi.rute + '" class="after:absolute after:inset-0">' + ui.esc(opsi.judul) + '</a>' +
          '</h3>' +
          '<p class="mt-1 text-sm leading-relaxed text-neutral-500">' + ui.esc(opsi.deskripsi) + '</p>' +
        '</div>' +
        '<span class="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#1a6dff] text-white">' +
          ikon('panah', 'h-4 w-4') +
        '</span>' +
      '</article>'
    );
  }

  function ubin(label, nilai, keterangan) {
    return (
      '<div class="' + v.kartu({ nada: 'aksen', padding: 'md' }) + '">' +
        '<p class="mikro">' + ui.esc(label) + '</p>' +
        '<p class="mt-3 text-4xl font-semibold tracking-tight">' + ui.esc(nilai) + '</p>' +
        '<p class="mt-1 text-xs text-neutral-500">' + ui.esc(keterangan) + '</p>' +
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
            deskripsi: 'Kelola label dasar dan dimmed, ubah status validasi, tindak lanjuti laporan kesalahan.'
          })
        : '';

      return (
        '<section aria-labelledby="judul-beranda">' +

          '<div class="grid gap-6 pt-6 sm:pt-8 lg:grid-cols-[1fr_auto] lg:items-end">' +
            '<div>' +
              '<p class="mikro mb-3">' + ui.esc(organ.sistem_organ) + '</p>' +
              '<h1 id="judul-beranda" class="titik-biru text-4xl font-semibold leading-[0.95] sm:text-5xl lg:text-6xl">' +
                ui.esc(sapaan) + ',<br />' + ui.esc(namaDepan) +
              '</h1>' +
            '</div>' +
            '<a href="#/eksplorasi" class="' + v.tombol({ ukuran: 'lg' }) + ' w-fit lg:mb-2">' +
              'Mulai eksplorasi' + ikon('panah', 'h-4 w-4') +
            '</a>' +
          '</div>' +

          '<div class="mt-8">' +
            ui.marquee(['Model Organ 3D', 'Label Dasar', 'Label Dimmed', 'Asisten AI', 'Riwayat Belajar'], 'Fitur') +
          '</div>' +

          /* Ubin angka */
          '<div class="mt-8 grid gap-4 sm:grid-cols-3">' +
            '<div class="' + v.kartu({ nada: 'brand', padding: 'md' }) + '">' +
              '<p class="text-[11px] font-medium uppercase tracking-[0.08em] text-white/70">Progres</p>' +
              '<p class="mt-3 text-4xl font-semibold tracking-tight">' + persen + '%</p>' +
              '<div class="mt-3 h-1 w-full overflow-hidden rounded-full bg-white/25" ' +
                'role="progressbar" aria-valuenow="' + persen + '" aria-valuemin="0" aria-valuemax="100" ' +
                'aria-label="Persentase bagian tubuh yang sudah dipelajari">' +
                '<div class="h-full rounded-full bg-white transition-all" style="width: ' + persen + '%"></div>' +
              '</div>' +
              '<p class="mt-2 text-xs text-white/80">' + dipelajari + ' dari ' + total + ' bagian tubuh sudah dibuka</p>' +
            '</div>' +
            ubin('Bagian terdata', String(total), organ.nama_organ) +
            ubin('Label tersedia', String(App.state.part_content.length), 'Label dasar dan dimmed') +
          '</div>' +

          /* Menu */
          '<h2 class="titik-biru mt-12 text-3xl font-semibold sm:text-4xl">Menu</h2>' +
          '<div class="mt-5 grid gap-4 lg:grid-cols-2">' +
            kartuMenu({
              rute: 'eksplorasi', ikon: 'jantung',
              judul: 'Eksplorasi Organ 3D',
              deskripsi: 'Putar model jantung, nyalakan layer anatomi, buka label dasar dan label dimmed.'
            }) +
            kartuMenu({
              rute: 'riwayat', ikon: 'riwayat',
              judul: 'Riwayat Belajar',
              deskripsi: dipelajari
                ? dipelajari + ' bagian tubuh tercatat pada sesi ini beserta waktu aksesnya.'
                : 'Belum ada catatan. Riwayat terisi otomatis saat label dibuka.'
            }) +
            kartuMenu({
              rute: 'asisten', ikon: 'chat',
              judul: 'Asisten AI',
              deskripsi: 'Tanya fungsi, letak, atau gangguan pada bagian jantung yang sedang dipilih.'
            }) +
            kartuAdmin +
          '</div>' +
        '</section>'
      );
    },

    mount: function () { /* halaman statis: navigasi ditangani tautan hash */ }
  };
})(window.App);
