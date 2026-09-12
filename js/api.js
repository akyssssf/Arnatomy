/* ==========================================================================
   api.js — Simulasi pemanggilan layanan backend.
   Semua fungsi memakai async/await (bukan .then), dilengkapi timeout via
   AbortController; pemanggil wajib membungkus dengan try/catch dan
   menampilkan loading state.
   Endpoint mock: jsonplaceholder.typicode.com (mewakili API ARnatomy).
   ========================================================================== */
window.App = window.App || {};

(function (App) {
  'use strict';

  const BASIS_URL = 'https://jsonplaceholder.typicode.com';
  const BATAS_WAKTU_MS = 8000;

  /* Diaktifkan dari UI untuk mendemokan jalur error (TC pengujian). */
  const konfigurasi = { simulasiGagal: false };

  function jeda(ms) {
    return new Promise(function (resolve) { window.setTimeout(resolve, ms); });
  }

  /** Pembungkus fetch dengan timeout supaya request tidak menggantung. */
  async function ambilDenganTimeout(url, opsi) {
    const pengendali = new AbortController();
    const penghitung = window.setTimeout(function () { pengendali.abort(); }, BATAS_WAKTU_MS);
    try {
      const respons = await fetch(url, Object.assign({ signal: pengendali.signal }, opsi || {}));
      if (!respons.ok) throw new Error('server membalas status ' + respons.status + '.');
      return await respons.json();
    } catch (kesalahan) {
      /* Pesan bawaan AbortError/TypeError kurang informatif bagi pengguna */
      if (kesalahan.name === 'AbortError') {
        throw new Error('permintaan melebihi batas waktu ' + (BATAS_WAKTU_MS / 1000) + ' detik.');
      }
      if (kesalahan.name === 'TypeError') throw new Error('server tidak dapat dihubungi.');
      throw kesalahan;
    } finally {
      window.clearTimeout(penghitung);
    }
  }

  /* ------------------------------------------------------------------ *
   * Menyusun jawaban kontekstual asisten (FR-08)
   * ------------------------------------------------------------------ */
  function susunJawaban(pertanyaan, bagian) {
    const teks = pertanyaan.toLowerCase();
    const basis = bagian ? App.seed.pengetahuan_ai[bagian.id_bagian] : null;

    if (!basis) {
      return 'Untuk saat ini aku baru menguasai materi jantung (sistem peredaran darah) dan paru-paru (sistem pernapasan). ' +
             'Pilih salah satu bagiannya pada daftar konteks, lalu ajukan pertanyaannya lagi.';
    }

    const nama = bagian.nama_bagian_internal;
    const potongan = [];

    if (/fungsi|guna|tugas|kerja|peran|untuk apa/.test(teks)) potongan.push(basis.fungsi);
    if (/letak|dimana|di mana|posisi|lokasi/.test(teks)) potongan.push(basis.letak);
    if (/gangguan|penyakit|kelainan|masalah|sakit/.test(teks)) potongan.push(basis.gangguan);
    if (/beda|perbedaan|banding|dibanding/.test(teks)) {
      potongan.push(bagian.id_organ === 2
        ? 'Bedanya, paru kanan punya tiga lobus dan lebih besar, sedangkan paru kiri hanya dua lobus karena berbagi ruang dengan jantung.'
        : 'Bedanya terletak pada tujuan aliran darah: sisi kanan jantung mengurus perjalanan ke paru-paru, ' +
          'sedangkan sisi kiri mengurus perjalanan ke seluruh tubuh.');
    }

    if (!potongan.length) potongan.push(basis.fungsi, basis.ringkas);

    const kontenDimmed = App.aksi.kontenBagian(bagian.id_bagian, 'dimmed');
    const catatan = kontenDimmed
      ? ' Untuk penjelasan lanjutan, buka label redup "' + kontenDimmed.judul_tampil + '" pada bagian ini di halaman Eksplorasi.'
      : ' Bagian lain pada model bisa dibuka untuk perbandingan.';

    return 'Tentang ' + nama + ': ' + potongan.join(' ') + catatan;
  }

  /* ------------------------------------------------------------------ *
   * FR-08 — Bertanya ke asisten AI
   * ------------------------------------------------------------------ */
  async function tanyaAsisten(pertanyaan, bagian) {
    if (konfigurasi.simulasiGagal) {
      await jeda(600);
      throw new Error('simulasi kegagalan koneksi ke layanan asisten AI.');
    }
    /* Panggilan mock: mewakili POST /api/ai/ask pada arsitektur three-tier SKPL */
    const idMock = bagian ? bagian.id_bagian : 1;
    await ambilDenganTimeout(BASIS_URL + '/posts/' + idMock);
    await jeda(500); // jeda kecil supaya loading state terlihat wajar
    return susunJawaban(pertanyaan, bagian);
  }

  /* ------------------------------------------------------------------ *
   * FR-09 — Mengirim laporan kesalahan konten
   * ------------------------------------------------------------------ */
  async function kirimLaporan(muatan) {
    if (konfigurasi.simulasiGagal) {
      await jeda(600);
      throw new Error('simulasi kegagalan pengiriman laporan ke server.');
    }
    const hasil = await ambilDenganTimeout(BASIS_URL + '/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(muatan)
    });
    return hasil;
  }

  App.api = {
    konfigurasi: konfigurasi,
    tanyaAsisten: tanyaAsisten,
    kirimLaporan: kirimLaporan,
    susunJawaban: susunJawaban
  };
})(window.App);
