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
      '<article class="muncul kartu-angkat ' + v.kartu({ padding: 'md' }) + ' relative flex items-center gap-5">' +
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

  /* Kartu utama eksplorasi: gambar organ abu-abu yang berwarna saat disorot */
  function kartuEksplorasi() {
    return (
      '<article class="group muncul kartu-angkat relative flex min-h-[15rem] overflow-hidden rounded-2xl bg-white p-5 lg:col-span-2 lg:p-7">' +
        '<div class="relative z-10 flex max-w-sm flex-col justify-between">' +
          '<div>' +
            '<p class="mikro">Sistem peredaran darah</p>' +
            '<h3 class="titik-biru mt-3 text-3xl font-semibold">' +
              '<a href="#/eksplorasi" class="after:absolute after:inset-0">Eksplorasi Organ 3D</a>' +
            '</h3>' +
            '<p class="mt-2 text-sm leading-relaxed text-neutral-500">' +
              'Putar model jantung, nyalakan layer anatomi, buka label dasar dan label dimmed.' +
            '</p>' +
          '</div>' +
          '<span class="mt-6 inline-flex w-fit items-center gap-2 rounded-full bg-[#1a6dff] px-4 py-2 text-sm font-medium text-white">' +
            'Buka model' + ikon('panah', 'h-4 w-4') +
          '</span>' +
        '</div>' +
        '<img src="assets/img/jantung.webp" alt="" aria-hidden="true" ' +
          'class="organ-abu pointer-events-none absolute -bottom-10 -right-6 w-56 sm:w-64 lg:-right-2 lg:w-72" />' +
      '</article>'
    );
  }

  function ubin(label, nilai, keterangan) {
    return (
      '<div class="muncul ' + v.kartu({ nada: 'aksen', padding: 'md' }) + '">' +
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

          /* Hero: sapaan di kiri, organ 3D di kanan */
          '<div class="grid gap-6 pt-6 sm:pt-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">' +
            '<div>' +
              '<p class="mikro mb-3">' + ui.esc(organ.sistem_organ) + '</p>' +
              '<h1 id="judul-beranda" class="titik-biru denyut text-4xl font-semibold leading-[0.95] sm:text-5xl lg:text-6xl">' +
                ui.judulKata([[sapaan + ','], [namaDepan]]) +
              '</h1>' +
              '<div class="muncul mt-7 flex flex-wrap items-center gap-5" style="transition-delay:300ms">' +
                '<a href="#/eksplorasi" class="' + v.tombol({ ukuran: 'lg' }) + '">' +
                  'Mulai eksplorasi' + ikon('panah', 'h-4 w-4') +
                '</a>' +
                '<p class="max-w-xs text-sm leading-relaxed text-neutral-500">' +
                  'Lanjutkan belajar dari bagian yang belum dibuka, atau ulangi yang sudah.' +
                '</p>' +
              '</div>' +
            '</div>' +

            '<div class="muncul relative aspect-[4/3] overflow-hidden rounded-3xl bg-[#f1f2f4] lg:aspect-[5/4]" style="transition-delay:150ms">' +
              '<span class="piringan-organ" aria-hidden="true"></span>' +
              '<div id="hero-3d" class="absolute inset-0"></div>' +
              '<img src="assets/img/jantung.webp" alt="Model 3D jantung manusia" ' +
                'class="hero-gambar melayang pointer-events-none absolute left-1/2 top-1/2 w-[64%] -translate-x-1/2 -translate-y-1/2" />' +
              '<p class="mikro kaca absolute right-4 top-4 rounded-full px-3 py-1.5">' + ui.esc(organ.nama_organ) + '</p>' +
              '<div class="kaca melayang-lambat absolute bottom-4 left-4 w-[min(15rem,70%)] rounded-2xl px-4 py-3">' +
                '<p class="mikro">Progres</p>' +
                '<div class="mt-2 flex items-end justify-between gap-3">' +
                  '<p class="text-3xl font-semibold leading-none">' + persen + '%</p>' +
                  '<p class="text-xs text-neutral-500">' + dipelajari + ' dari ' + total + ' bagian</p>' +
                '</div>' +
                '<div class="mt-2.5 h-1 w-full overflow-hidden rounded-full bg-black/10" ' +
                  'role="progressbar" aria-valuenow="' + persen + '" aria-valuemin="0" aria-valuemax="100" ' +
                  'aria-label="Persentase bagian tubuh yang sudah dipelajari">' +
                  '<div class="h-full rounded-full bg-[#1a6dff] transition-all" style="width: ' + persen + '%"></div>' +
                '</div>' +
              '</div>' +
            '</div>' +
          '</div>' +

          '<div class="muncul mt-10">' +
            ui.marquee(['Model Organ 3D', 'Label Dasar', 'Label Dimmed', 'Asisten AI', 'Riwayat Belajar'], 'Fitur') +
          '</div>' +

          /* Ubin angka */
          '<div class="mt-8 grid gap-4 sm:grid-cols-3">' +
            ubin('Bagian terdata', String(total), organ.nama_organ) +
            ubin('Label tersedia', String(App.state.part_content.length), 'Label dasar dan dimmed') +
            ubin('Sudah dibuka', String(dipelajari), 'Tercatat pada sesi ini') +
          '</div>' +

          /* Menu */
          '<h2 class="titik-biru muncul mt-12 text-3xl font-semibold sm:text-4xl">Menu</h2>' +
          '<div class="mt-5 grid gap-4 lg:grid-cols-3">' +
            kartuEksplorasi() +
            '<div class="grid gap-4">' +
              kartuMenu({
                rute: 'asisten', ikon: 'chat',
                judul: 'Asisten AI',
                deskripsi: 'Tanya fungsi, letak, atau gangguan pada bagian jantung.'
              }) +
              kartuMenu({
                rute: 'riwayat', ikon: 'riwayat',
                judul: 'Riwayat Belajar',
                deskripsi: dipelajari
                  ? dipelajari + ' bagian tubuh tercatat pada sesi ini.'
                  : 'Terisi otomatis saat label dibuka.'
              }) +
            '</div>' +
            (kartuAdmin ? '<div class="lg:col-span-3">' + kartuAdmin + '</div>' : '') +
          '</div>' +
        '</section>'
      );
    },

    mount: function () {
      ui.pasangHero3d('hero-3d', { jarak: 1.6, kecepatanPutar: 0.7 });
      App.pages.beranda.bersihkan = function () {
        if (App.viewer3d) App.viewer3d.bersihkan();
      };
    }
  };
})(window.App);
