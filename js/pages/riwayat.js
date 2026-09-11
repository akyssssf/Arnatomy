/* ==========================================================================
   pages/riwayat.js — Halaman Riwayat Belajar (FR-14)
   Menampilkan rekam bagian tubuh yang sudah dipelajari beserta waktu akses.
   Data berasal dari state.learning_history yang terisi otomatis di
   Halaman Eksplorasi AR.
   ========================================================================== */
window.App = window.App || {};
window.App.pages = window.App.pages || {};

(function (App) {
  'use strict';

  const ui = App.ui;
  const v = App.v;

  function baris(rekap) {
    const bagian = App.aksi.bagianById(rekap.id_bagian);
    const dasar = App.aksi.kontenBagian(rekap.id_bagian, 'dasar');
    const organ = App.aksi.organById(bagian.id_organ);
    return (
      '<tr class="border-b border-black/5 last:border-0">' +
        '<th scope="row" class="px-3 py-3 text-left align-top">' +
          '<span class="block text-sm font-semibold">' + ui.esc(bagian.nama_bagian_internal) + '</span>' +
          '<span class="block text-xs text-neutral-500">' +
            ui.esc(dasar ? dasar.deskripsi.slice(0, 48) + '...' : '-') + '</span>' +
        '</th>' +
        '<td class="hidden px-3 py-3 align-top text-sm text-neutral-500 sm:table-cell">' + ui.esc(organ.sistem_organ) + '</td>' +
        '<td class="px-3 py-3 align-top">' +
          '<span class="' + v.badge({ status: rekap.dimmedDibuka ? 'dimmed' : 'dasar' }) + '">' +
            (rekap.dimmedDibuka ? 'dasar + dimmed' : 'dasar') +
          '</span>' +
        '</td>' +
        '<td class="px-3 py-3 align-top text-sm text-neutral-500">' + rekap.jumlah + '</td>' +
        '<td class="hidden px-3 py-3 align-top text-sm text-neutral-500 md:table-cell">' + ui.esc(ui.formatDurasi(rekap.totalDurasi)) + '</td>' +
        '<td class="px-3 py-3 align-top text-sm text-neutral-500">' + ui.esc(ui.formatWaktu(rekap.terakhir)) + '</td>' +
      '</tr>'
    );
  }

  App.pages.riwayat = {
    judul: 'Riwayat Belajar',

    render: function () {
      const rekap = App.aksi.ringkasanRiwayat();
      const total = App.state.body_parts.length;

      const tombolMulai = '<a href="#/eksplorasi" class="' + v.tombol({ ukuran: 'sm' }) + '">Buka halaman Eksplorasi</a>';

      if (!rekap.length) {
        return (
          '<section aria-labelledby="judul-riwayat">' +
            ui.judulHalaman('Riwayat Belajar', 'Bagian tubuh yang telah dibuka pada sesi ini.', 'judul-riwayat', 'Rekam jejak') +
            ui.kondisiKosong(
              'Belum ada riwayat',
              'Riwayat terisi otomatis setiap kali label dibuka pada halaman Eksplorasi.',
              tombolMulai
            ) +
          '</section>'
        );
      }

      const totalKunjungan = rekap.reduce(function (jml, r) { return jml + r.jumlah; }, 0);
      const totalDimmed = rekap.filter(function (r) { return r.dimmedDibuka; }).length;

      return (
        '<section aria-labelledby="judul-riwayat">' +
          ui.judulHalaman('Riwayat Belajar', 'Bagian tubuh yang telah dibuka pada sesi ini.', 'judul-riwayat', 'Rekam jejak') +

          '<dl class="mb-4 grid gap-4 sm:grid-cols-3">' +
            '<div class="' + v.kartu({ nada: 'aksen', padding: 'md' }) + '">' +
              '<dt class="mikro">Bagian dipelajari</dt>' +
              '<dd class="mt-3 text-4xl font-semibold tracking-tight">' + rekap.length + ' / ' + total + '</dd></div>' +
            '<div class="' + v.kartu({ nada: 'aksen', padding: 'md' }) + '">' +
              '<dt class="mikro">Total kunjungan label</dt>' +
              '<dd class="mt-3 text-4xl font-semibold tracking-tight">' + totalKunjungan + '</dd></div>' +
            '<div class="' + v.kartu({ nada: 'aksen', padding: 'md' }) + '">' +
              '<dt class="mikro">Label dimmed dibuka</dt>' +
              '<dd class="mt-3 text-4xl font-semibold tracking-tight">' + totalDimmed + '</dd></div>' +
          '</dl>' +

          '<div class="' + v.kartu({ padding: 'sm' }) + ' overflow-x-auto">' +
            '<table class="w-full min-w-[34rem] border-collapse text-left">' +
              '<caption class="sr-only">Daftar bagian tubuh yang telah dipelajari beserta waktu akses terakhir</caption>' +
              '<thead>' +
                '<tr class="border-b border-black/5 text-[11px] uppercase tracking-wide text-neutral-400">' +
                  '<th scope="col" class="px-3 py-2.5 font-semibold">Bagian tubuh</th>' +
                  '<th scope="col" class="hidden px-3 py-2.5 font-semibold sm:table-cell">Sistem organ</th>' +
                  '<th scope="col" class="px-3 py-2.5 font-semibold">Label dibuka</th>' +
                  '<th scope="col" class="px-3 py-2.5 font-semibold">Kunjungan</th>' +
                  '<th scope="col" class="hidden px-3 py-2.5 font-semibold md:table-cell">Durasi</th>' +
                  '<th scope="col" class="px-3 py-2.5 font-semibold">Waktu akses</th>' +
                '</tr>' +
              '</thead>' +
              '<tbody>' + rekap.map(baris).join('') + '</tbody>' +
            '</table>' +
          '</div>' +

          '<p class="mt-3 px-1 text-xs text-neutral-400">' +
            'Data riwayat hanya disimpan di memori selama sesi berjalan dan hilang bila halaman dimuat ulang.' +
          '</p>' +
        '</section>'
      );
    },

    mount: function () { /* halaman baca-saja */ }
  };
})(window.App);
