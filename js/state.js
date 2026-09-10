/* ==========================================================================
   state.js — Penyimpanan state aplikasi di memori + aksi & selector
   Tidak menggunakan localStorage/sessionStorage: seluruh data hilang saat
   halaman di-reload (sesuai batasan tugas).
   ========================================================================== */
window.App = window.App || {};

(function (App) {
  'use strict';

  const seed = App.seed;

  const state = {
    /* Sesi login (FR-01) */
    sesi: { user: null },

    /* Salinan data master */
    organs: seed.organs.map(function (o) { return Object.assign({}, o); }),
    layers: seed.layers.map(function (l) { return Object.assign({}, l); }),
    body_parts: seed.body_parts.map(function (b) { return Object.assign({}, b); }),
    part_content: seed.part_content.map(function (k) { return Object.assign({}, k); }),

    /* Data transaksional yang tumbuh selama sesi */
    learning_history: [],   // { id_riwayat, id_user, id_bagian, jenis_konten, waktu_akses, durasi }
    ai_conversations: [],   // { id_percakapan, id_user, id_bagian, pertanyaan, jawaban, waktu }
    laporan_kesalahan: [],  // { id_laporan, id_user, id_konten, deskripsi_laporan, status_tindak_lanjut, waktu }

    /* State khusus tampilan halaman Eksplorasi AR */
    ui: {
      layerAktif: { kulit: false, otot: false, tulang: false, organ_dalam: true },
      bagianAktifId: null,
      zoom: 1,
      rotasi: 0
    }
  };

  let urutanId = 1000;
  function idBaru() { urutanId += 1; return urutanId; }

  /* ------------------------------------------------------------------ *
   * Autentikasi
   * ------------------------------------------------------------------ */
  function masuk(email, password) {
    const akun = seed.users.find(function (u) {
      return u.email.toLowerCase() === String(email).trim().toLowerCase() && u.password === password;
    });
    if (!akun) return null;
    state.sesi.user = { id_user: akun.id_user, nama: akun.nama, email: akun.email, role: akun.role, asal_sekolah: akun.asal_sekolah };
    return state.sesi.user;
  }

  function keluar() {
    state.sesi.user = null;
    state.learning_history = [];
    state.ai_conversations = [];
    state.ui.bagianAktifId = null;
  }

  function sedangLogin() { return state.sesi.user !== null; }
  function idUserAktif() { return state.sesi.user ? state.sesi.user.id_user : 0; }

  /* ------------------------------------------------------------------ *
   * Selector data anatomi
   * ------------------------------------------------------------------ */
  function bagianById(id) {
    return state.body_parts.find(function (b) { return b.id_bagian === Number(id); }) || null;
  }

  function organById(id) {
    return state.organs.find(function (o) { return o.id_organ === Number(id); }) || null;
  }

  function kontenBagian(idBagian, jenis) {
    return state.part_content.find(function (k) {
      return k.id_bagian === Number(idBagian) && k.jenis_konten === jenis;
    }) || null;
  }

  function kontenById(idKonten) {
    return state.part_content.find(function (k) { return k.id_konten === Number(idKonten); }) || null;
  }

  /** Koordinat persen untuk ilustrasi SVG cadangan. */
  function koordinat(bagian) {
    const nilai = String(bagian.posisi_2d || '50,50').split(',');
    return { x: Number(nilai[0]) || 50, y: Number(nilai[1]) || 50 };
  }

  /** Koordinat "x,y,z" pada model 3D, dinyatakan sebagai pecahan kotak batas. */
  function koordinat3d(bagian) {
    const nilai = String(bagian.posisi_koordinat_3d || '0,0,0').split(',');
    return { x: Number(nilai[0]) || 0, y: Number(nilai[1]) || 0, z: Number(nilai[2]) || 0 };
  }

  /* ------------------------------------------------------------------ *
   * Riwayat belajar (FR-14) — tercatat otomatis saat label dibuka
   * ------------------------------------------------------------------ */
  function catatRiwayat(idBagian, jenisKonten) {
    const entri = {
      id_riwayat: idBaru(),
      id_user: idUserAktif(),
      id_bagian: Number(idBagian),
      jenis_konten: jenisKonten,
      waktu_akses: new Date(),
      durasi: null
    };
    state.learning_history.push(entri);
    return entri;
  }

  function tutupRiwayat(entri) {
    if (!entri || entri.durasi !== null) return;
    entri.durasi = Math.max(1, Math.round((Date.now() - entri.waktu_akses.getTime()) / 1000));
  }

  /** Rekap per bagian tubuh untuk Halaman Riwayat Belajar & Beranda. */
  function ringkasanRiwayat() {
    const peta = new Map();
    state.learning_history.forEach(function (r) {
      const kunci = r.id_bagian;
      if (!peta.has(kunci)) {
        peta.set(kunci, { id_bagian: kunci, jumlah: 0, dimmedDibuka: false, terakhir: r.waktu_akses, totalDurasi: 0 });
      }
      const baris = peta.get(kunci);
      baris.jumlah += 1;
      if (r.jenis_konten === 'dimmed') baris.dimmedDibuka = true;
      if (r.waktu_akses > baris.terakhir) baris.terakhir = r.waktu_akses;
      baris.totalDurasi += r.durasi || 0;
    });
    return Array.from(peta.values()).sort(function (a, b) { return b.terakhir - a.terakhir; });
  }

  function jumlahBagianDipelajari() { return ringkasanRiwayat().length; }

  /* ------------------------------------------------------------------ *
   * Percakapan AI (FR-08)
   * ------------------------------------------------------------------ */
  function tambahPercakapan(idBagian, pertanyaan, jawaban) {
    const entri = {
      id_percakapan: idBaru(),
      id_user: idUserAktif(),
      id_bagian: idBagian ? Number(idBagian) : null,
      pertanyaan: pertanyaan,
      jawaban: jawaban,
      waktu: new Date()
    };
    state.ai_conversations.push(entri);
    return entri;
  }

  /* ------------------------------------------------------------------ *
   * Laporan kesalahan konten (FR-09 & FR-11)
   * ------------------------------------------------------------------ */
  function tambahLaporan(idKonten, deskripsi) {
    const entri = {
      id_laporan: idBaru(),
      id_user: idUserAktif(),
      id_konten: Number(idKonten),
      deskripsi_laporan: deskripsi,
      status_tindak_lanjut: 'baru',
      waktu: new Date()
    };
    state.laporan_kesalahan.unshift(entri);
    return entri;
  }

  function tindakLanjutiLaporan(idLaporan) {
    const laporan = state.laporan_kesalahan.find(function (l) { return l.id_laporan === Number(idLaporan); });
    if (laporan) laporan.status_tindak_lanjut = 'ditindaklanjuti';
    return laporan;
  }

  /* ------------------------------------------------------------------ *
   * Kelola konten oleh Administrator (FR-10)
   * ------------------------------------------------------------------ */
  function perbaruiKonten(idKonten, perubahan) {
    const konten = kontenById(idKonten);
    if (!konten) return null;
    Object.assign(konten, perubahan);
    return konten;
  }

  App.state = state;
  App.aksi = {
    masuk: masuk,
    keluar: keluar,
    sedangLogin: sedangLogin,
    idUserAktif: idUserAktif,
    bagianById: bagianById,
    organById: organById,
    kontenBagian: kontenBagian,
    kontenById: kontenById,
    koordinat: koordinat,
    koordinat3d: koordinat3d,
    catatRiwayat: catatRiwayat,
    tutupRiwayat: tutupRiwayat,
    ringkasanRiwayat: ringkasanRiwayat,
    jumlahBagianDipelajari: jumlahBagianDipelajari,
    tambahPercakapan: tambahPercakapan,
    tambahLaporan: tambahLaporan,
    tindakLanjutiLaporan: tindakLanjutiLaporan,
    perbaruiKonten: perbaruiKonten
  };
})(window.App);
