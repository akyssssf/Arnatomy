/* ==========================================================================
   ui.js — Helper tampilan bersama: escaping, format waktu, ikon,
   toast (aria-live), dan modal dialog (role="dialog" + focus trap + Escape).
   ========================================================================== */
window.App = window.App || {};

(function (App) {
  'use strict';

  const v = App.v;

  /** Escaping teks agar aman dimasukkan ke innerHTML (proteksi XSS dasar). */
  function esc(teks) {
    return String(teks === undefined || teks === null ? '' : teks)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  const formatterWaktu = new Intl.DateTimeFormat('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });
  function formatWaktu(tanggal) { return formatterWaktu.format(tanggal); }

  function formatDurasi(detik) {
    if (!detik) return '-';
    if (detik < 60) return detik + ' detik';
    const menit = Math.floor(detik / 60);
    return menit + ' menit ' + (detik % 60) + ' detik';
  }

  /* ---------------- Toast ---------------- */
  function toast(pesan, tipe) {
    const wadah = document.getElementById('wadah-toast');
    const kotak = document.createElement('div');
    kotak.className =
      v.alert({ tipe: tipe || 'sukses' }) +
      ' pointer-events-auto max-w-md rounded-full bg-neutral-900 px-5 text-white shadow-[0_10px_30px_rgba(0,0,0,0.18)]';
    kotak.textContent = pesan;
    wadah.appendChild(kotak);
    window.setTimeout(function () { kotak.remove(); }, 3800);
  }

  /* ---------------- Modal dialog ---------------- */
  const PEMILIH_FOKUS =
    'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

  /**
   * Membuka modal aksesibel.
   * @param {{judul:string, isi:string, lebar?:string, saatPasang?:Function}} opsi
   * @returns {{tutup:Function, root:HTMLElement}}
   */
  function bukaModal(opsi) {
    const lapisan = document.getElementById('lapisan-modal');
    const pemicuSebelumnya = document.activeElement;
    const idJudul = 'judul-modal-' + Date.now();

    const backdrop = document.createElement('div');
    backdrop.className =
      'fixed inset-0 z-50 flex items-end justify-center bg-neutral-900/45 p-4 sm:items-center';
    backdrop.innerHTML =
      '<section role="dialog" aria-modal="true" aria-labelledby="' + idJudul + '" ' +
        'class="w-full ' + (opsi.lebar || 'max-w-lg') + ' rounded-3xl bg-[#f1f2f4] p-2">' +
        '<header class="flex items-start justify-between gap-4 px-4 pb-2 pt-4">' +
          '<h2 id="' + idJudul + '" class="titik-biru text-xl font-semibold">' + esc(opsi.judul) + '</h2>' +
          '<button type="button" data-tutup-modal aria-label="Tutup dialog" ' +
            'class="grid h-9 w-9 place-items-center rounded-full bg-white text-neutral-500 transition hover:text-neutral-900">' +
            App.ikon('silang', 'h-4 w-4') +
          '</button>' +
        '</header>' +
        '<div class="rounded-2xl bg-white p-4" data-isi-modal>' + opsi.isi + '</div>' +
      '</section>';

    lapisan.appendChild(backdrop);

    function tutup() {
      document.removeEventListener('keydown', saatTombolDitekan, true);
      backdrop.remove();
      if (pemicuSebelumnya && typeof pemicuSebelumnya.focus === 'function') pemicuSebelumnya.focus();
    }

    /* Escape untuk menutup + focus trap Tab/Shift+Tab */
    function saatTombolDitekan(e) {
      if (e.key === 'Escape') { e.preventDefault(); tutup(); return; }
      if (e.key !== 'Tab') return;
      const fokusable = Array.prototype.filter.call(
        backdrop.querySelectorAll(PEMILIH_FOKUS),
        function (el) { return el.offsetParent !== null; }
      );
      if (!fokusable.length) return;
      const pertama = fokusable[0];
      const terakhir = fokusable[fokusable.length - 1];
      if (e.shiftKey && document.activeElement === pertama) { e.preventDefault(); terakhir.focus(); }
      else if (!e.shiftKey && document.activeElement === terakhir) { e.preventDefault(); pertama.focus(); }
    }

    document.addEventListener('keydown', saatTombolDitekan, true);
    backdrop.addEventListener('mousedown', function (e) { if (e.target === backdrop) tutup(); });
    backdrop.querySelector('[data-tutup-modal]').addEventListener('click', tutup);

    const fokusPertama = backdrop.querySelector(PEMILIH_FOKUS);
    if (fokusPertama) fokusPertama.focus();

    if (typeof opsi.saatPasang === 'function') opsi.saatPasang(backdrop, tutup);
    return { tutup: tutup, root: backdrop };
  }

  /* ---------------- Potongan markup yang sering dipakai ---------------- */
  function spinner(ukuran) {
    const s = ukuran || 'h-4 w-4';
    return '<span class="inline-block ' + s + ' animate-spin rounded-full border-2 border-current border-t-transparent opacity-70" aria-hidden="true"></span>';
  }

  /**
   * Kepala halaman bergaya editorial: label mikro, judul besar bertitik biru,
   * dan keterangan pendek.
   */
  function judulHalaman(judul, deskripsi, id, kicker) {
    return (
      '<header class="mb-6 pt-6 sm:pt-8">' +
        (kicker ? '<p class="mikro mb-3">' + esc(kicker) + '</p>' : '') +
        '<h1' + (id ? ' id="' + id + '"' : '') + ' class="titik-biru text-4xl font-semibold leading-[0.95] sm:text-5xl lg:text-6xl">' +
          esc(judul) +
        '</h1>' +
        (deskripsi ? '<p class="mt-4 max-w-xl text-sm leading-relaxed text-neutral-500">' + esc(deskripsi) + '</p>' : '') +
      '</header>'
    );
  }

  /** Strip marquee biru; daftar teks diulang dua kali agar animasinya mulus. */
  function marquee(daftar, label) {
    const isi = daftar.map(function (t) { return '<span>' + esc(t) + '</span>'; }).join('');
    return (
      '<div class="marquee" role="marquee" aria-label="' + esc(label || 'Sorotan') + '">' +
        '<div class="marquee-jalur" aria-hidden="true">' + isi + isi + '</div>' +
      '</div>'
    );
  }

  function kondisiKosong(judul, deskripsi, tombolHtml) {
    return (
      '<div class="' + App.v.kartu({ padding: 'lg' }) + ' flex flex-col items-start gap-4 sm:flex-row sm:items-center">' +
        '<span class="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#f1f2f4] text-neutral-700">' +
          App.ikon('info', 'h-5 w-5') +
        '</span>' +
        '<div class="flex-1">' +
          '<h2 class="text-base font-semibold">' + esc(judul) + '</h2>' +
          '<p class="mt-0.5 max-w-lg text-sm text-neutral-500">' + esc(deskripsi) + '</p>' +
        '</div>' +
        (tombolHtml || '') +
      '</div>'
    );
  }

  App.ui = {
    esc: esc,
    formatWaktu: formatWaktu,
    formatDurasi: formatDurasi,
    toast: toast,
    bukaModal: bukaModal,
    spinner: spinner,
    judulHalaman: judulHalaman,
    marquee: marquee,
    kondisiKosong: kondisiKosong
  };
})(window.App);
