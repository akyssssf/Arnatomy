/* ==========================================================================
   pages/eksplorasi.js — Halaman Eksplorasi (model organ 3D layar penuh)
   Mencakup FR-03 (tampilan model), FR-04 (rotasi & zoom), FR-05 (toggle layer),
   FR-06 (label dasar), FR-07 (label dimmed expand in-place), FR-09 (lapor),
   dan FR-14 (pencatatan riwayat belajar otomatis).

   Model mengisi seluruh lebar halaman. Penjelasan bagian muncul di panel
   samping yang meluncur masuk saat titik diketuk; daftar bagian tersedia
   di panel yang sama sebagai jalan masuk untuk pengguna keyboard.
   ========================================================================== */
window.App = window.App || {};
window.App.pages = window.App.pages || {};

(function (App) {
  'use strict';

  const ui = App.ui;
  const v = App.v;
  const ikon = App.ikon;

  /* State lokal halaman */
  let riwayatBerjalan = null;   // entri learning_history yang sedang aktif
  let bagianAktif = null;       // id bagian yang penjelasannya sedang dibuka
  let mode3d = false;           // false berarti sedang memakai gambar cadangan
  let pemicuTerakhir = null;    // elemen yang membuka panel, untuk mengembalikan fokus

  /* ---------------------------------------------------------------- *
   * Potongan markup
   * ---------------------------------------------------------------- */
  function tombolLayer(layer) {
    const aktif = App.state.ui.layerAktif[layer.nama_layer];
    return (
      '<button type="button" tabindex="0" data-layer-toggle="' + layer.nama_layer + '" ' +
        'aria-pressed="' + String(aktif) + '" class="' + v.toggleLayer({ aktif: String(aktif) }) + '">' +
        ui.esc(layer.label) +
      '</button>'
    );
  }

  function tombolAlat(aksi, label, namaIkon, tombolToggle) {
    return (
      '<button type="button" data-alat="' + aksi + '" aria-label="' + ui.esc(label) + '" title="' + ui.esc(label) + '" ' +
        (tombolToggle ? 'aria-pressed="false" ' : '') +
        'class="kaca grid h-11 w-11 place-items-center rounded-full text-neutral-700 transition ' +
        'hover:text-[#1a6dff] aria-pressed:bg-neutral-900 aria-pressed:text-white">' +
        ikon(namaIkon, 'h-[18px] w-[18px]') +
      '</button>'
    );
  }

  function pilihanOrgan(organAktif) {
    return App.state.organs.map(function (o) {
      const aktif = o.id_organ === organAktif.id_organ;
      return (
        '<a href="#/eksplorasi?organ=' + o.id_organ + '" ' + (aktif ? 'aria-current="true" ' : '') +
          'class="flex items-center gap-2 rounded-full py-1.5 pl-1.5 pr-4 text-sm font-medium transition ' +
          (aktif ? 'bg-neutral-900 text-white' : 'text-neutral-600 hover:bg-black/5') + '">' +
          '<img src="' + ui.esc(o.gambar) + '" alt="" aria-hidden="true" class="h-7 w-7 rounded-full bg-white object-contain p-0.5" />' +
          ui.esc(o.nama_organ) +
        '</a>'
      );
    }).join('');
  }

  function daftarFakta(fakta) {
    if (!fakta || !fakta.length) return '';
    return (
      '<section class="mt-5">' +
        '<h3 class="mikro">Fakta kunci</h3>' +
        '<dl class="mt-2 space-y-1">' +
          fakta.map(function (f) {
            return (
              '<div class="grid grid-cols-[6.5rem_1fr] items-baseline gap-3 rounded-lg px-2 py-1.5 odd:bg-[#f1f2f4]">' +
                '<dt class="text-[11px] text-neutral-400">' + ui.esc(f.label) + '</dt>' +
                '<dd class="text-xs font-semibold text-neutral-700">' + ui.esc(f.nilai) + '</dd>' +
              '</div>'
            );
          }).join('') +
        '</dl>' +
      '</section>'
    );
  }

  /* Isi panel: daftar bagian organ (alternatif keyboard untuk titik) */
  function panelDaftar(organ) {
    const bagianList = App.aksi.bagianOrgan(organ.id_organ);
    return (
      '<p class="mikro">' + ui.esc(organ.sistem_organ) + '</p>' +
      '<h2 id="judul-panel" tabindex="-1" class="titik-biru mt-2 text-3xl font-semibold">' + ui.esc(organ.nama_organ) + '</h2>' +
      '<p class="mt-0.5 text-sm italic text-neutral-400">' + ui.esc(organ.julukan) + '</p>' +
      '<p class="mt-3 text-sm leading-relaxed text-neutral-500">' + ui.esc(organ.deskripsi) + '</p>' +
      daftarFakta(organ.fakta) +
      '<h3 class="mikro mt-6">Bagian tubuh</h3>' +
      '<ul class="mt-2 space-y-1">' +
        bagianList.map(function (bagian, i) {
          const induk = bagian.parent_bagian_id ? App.aksi.bagianById(bagian.parent_bagian_id) : null;
          const dimmed = App.aksi.kontenBagian(bagian.id_bagian, 'dimmed');
          const sudah = App.state.learning_history.some(function (r) { return r.id_bagian === bagian.id_bagian; });
          return (
            '<li>' +
              '<button type="button" data-pilih-bagian="' + bagian.id_bagian + '" ' +
                'class="flex w-full items-center gap-3 rounded-xl px-2.5 py-2.5 text-left transition hover:bg-[#f1f2f4]">' +
                '<span class="grid h-8 w-8 shrink-0 place-items-center rounded-full ' +
                  (sudah ? 'bg-[#1a6dff] text-white' : 'bg-[#f1f2f4] text-neutral-500') + ' text-xs font-bold">' + (i + 1) + '</span>' +
                '<span class="min-w-0 flex-1">' +
                  '<span class="block truncate text-sm font-semibold">' + ui.esc(bagian.nama_bagian_internal) + '</span>' +
                  '<span class="block truncate text-[11px] text-neutral-400">' +
                    (induk ? 'Sub-bagian ' + ui.esc(induk.nama_bagian_internal) : 'Label dasar') +
                    (dimmed ? ' &middot; ada label dimmed' : '') +
                  '</span>' +
                '</span>' +
                ikon('panah', 'h-4 w-4 shrink-0 text-neutral-300') +
              '</button>' +
            '</li>'
          );
        }).join('') +
      '</ul>'
    );
  }

  /* Isi panel: penjelasan satu bagian tubuh */
  function panelBagian(bagian) {
    const dasar = App.aksi.kontenBagian(bagian.id_bagian, 'dasar');
    const dimmed = App.aksi.kontenBagian(bagian.id_bagian, 'dimmed');
    const induk = bagian.parent_bagian_id ? App.aksi.bagianById(bagian.parent_bagian_id) : null;
    const idDetail = 'detail-dimmed-' + bagian.id_bagian;

    const blokDimmed = dimmed
      ? '<section class="mt-5">' +
          '<button type="button" tabindex="0" data-buka-dimmed aria-expanded="false" aria-controls="' + idDetail + '" ' +
            'class="w-full rounded-xl border border-dashed border-neutral-300 bg-[#f1f2f4]/60 px-3.5 py-3 text-left ' +
            'opacity-60 transition hover:opacity-100 focus-visible:opacity-100">' +
            '<span class="flex items-center justify-between gap-2">' +
              '<span class="text-xs font-bold">' + ui.esc(dimmed.judul_tampil) + '</span>' +
              '<span class="' + v.badge({ status: 'dimmed' }) + '">dimmed</span>' +
            '</span>' +
            '<span class="mt-1 block text-[11px] text-neutral-400" data-teks-petunjuk>Ketuk untuk membuka penjelasan lanjutan</span>' +
          '</button>' +
          '<div id="' + idDetail + '" class="akordeon" hidden>' +
            '<p class="mt-2 rounded-xl bg-[#f1f2f4] p-3.5 text-xs leading-relaxed text-neutral-600">' + ui.esc(dimmed.deskripsi) + '</p>' +
          '</div>' +
        '</section>'
      : '<p class="mt-5 rounded-xl bg-[#f1f2f4] px-3.5 py-2.5 text-xs text-neutral-400">Tidak ada penjelasan lanjutan untuk bagian ini.</p>';

    return (
      '<button type="button" data-ke-daftar class="mikro mb-4 flex items-center gap-1.5 transition hover:text-neutral-900">' +
        ikon('panah', 'h-3.5 w-3.5 rotate-180') + 'Semua bagian' +
      '</button>' +
      '<div class="flex items-start justify-between gap-2">' +
        '<div>' +
          '<p class="mikro">Bagian tubuh</p>' +
          '<h2 id="judul-panel" tabindex="-1" class="titik-biru mt-2 text-3xl font-semibold">' + ui.esc(bagian.nama_bagian_internal) + '</h2>' +
          (induk ? '<p class="mt-0.5 text-sm italic text-neutral-400">Sub-bagian ' + ui.esc(induk.nama_bagian_internal) + '</p>' : '') +
        '</div>' +
        '<span class="' + v.badge({ status: dasar.status_validasi === 'tervalidasi' ? 'tervalidasi' : 'draft' }) + '">' + ui.esc(dasar.status_validasi) + '</span>' +
      '</div>' +
      '<p class="mt-3 text-sm leading-relaxed text-neutral-500">' + ui.esc(dasar.deskripsi) + '</p>' +
      daftarFakta(bagian.fakta) +
      blokDimmed +
      '<div class="mt-6 grid gap-2">' +
        '<button type="button" data-tanya-ai class="' + v.tombol({ lebar: 'penuh' }) + '">' + ikon('chat', 'h-4 w-4') + 'Tanya Asisten AI</button>' +
        '<button type="button" data-lapor class="' + v.tombol({ variant: 'garis', lebar: 'penuh' }) + ' bg-[#f1f2f4]">' + ikon('peringatan', 'h-4 w-4') + 'Laporkan kesalahan</button>' +
      '</div>'
    );
  }

  App.pages.eksplorasi = {
    judul: 'Eksplorasi',

    render: function (ctx) {
      const organ = App.aksi.pilihOrgan(ctx.query.organ || App.state.ui.organAktifId);
      const layers = App.aksi.layerOrgan(organ.id_organ);

      return (
        '<section aria-labelledby="judul-eksplorasi">' +
          '<div class="flex flex-wrap items-end justify-between gap-4 pt-4">' +
            '<div>' +
              '<p class="mikro mb-2">' + ui.esc(organ.sistem_organ) + '</p>' +
              '<h1 id="judul-eksplorasi" class="titik-biru text-4xl font-semibold leading-none sm:text-5xl">' + ui.esc(organ.nama_organ) + '</h1>' +
            '</div>' +
            '<div class="flex flex-wrap items-center gap-2">' +
              '<nav aria-label="Pilih organ" class="flex items-center gap-1 rounded-full bg-white p-1">' + pilihanOrgan(organ) + '</nav>' +
              '<button type="button" id="tombol-daftar" class="' + v.tombol({ variant: 'garis', ukuran: 'md' }) + '" aria-controls="panel-samping" aria-expanded="false">' +
                ikon('lapisan', 'h-4 w-4') + 'Daftar bagian' +
              '</button>' +
            '</div>' +
          '</div>' +

          /* ---------- Panggung model layar penuh ---------- */
          '<figure class="m-0 mt-5">' +
            '<div id="panggung" class="relative overflow-hidden rounded-3xl bg-[#f1f2f4]">' +
              '<div class="relative h-[min(78vh,52rem)] min-h-[26rem] w-full">' +
                '<span class="piringan-organ" aria-hidden="true" style="width:min(64%,34rem)"></span>' +
                '<div id="wadah-3d" class="absolute inset-0"></div>' +
                '<div id="lapisan-titik" class="pointer-events-none absolute inset-0"></div>' +

                '<div id="status-3d" role="status" aria-live="polite" ' +
                  'class="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#f1f2f4]/85 text-sm font-medium text-neutral-500">' +
                  ui.spinner('h-6 w-6') +
                  '<span data-teks-status>Menyiapkan penampil 3D</span>' +
                '</div>' +

                '<div class="absolute left-4 top-4 flex flex-col gap-2">' +
                  tombolAlat('reset', 'Atur ulang tampilan', 'ulang', false) +
                  tombolAlat('zoom-in', 'Perbesar', 'perbesar', false) +
                  tombolAlat('zoom-out', 'Perkecil', 'perkecil', false) +
                  tombolAlat('putar', 'Putar otomatis', 'putar', true) +
                '</div>' +

                '<p class="mikro kaca pointer-events-none absolute right-4 top-4 hidden rounded-full px-3 py-1.5 sm:block">' +
                  'Seret untuk memutar &middot; Ctrl + gulir untuk zoom' +
                '</p>' +

                '<section aria-labelledby="judul-layer" ' +
                  'class="kaca absolute bottom-4 left-1/2 z-10 flex max-w-[calc(100%-2rem)] -translate-x-1/2 flex-wrap items-center justify-center gap-1.5 rounded-full p-1.5">' +
                  '<h2 id="judul-layer" class="mikro ml-2 mr-1 flex items-center gap-1.5">' + ikon('lapisan', 'h-4 w-4') + 'Layer</h2>' +
                  layers.map(tombolLayer).join('') +
                  '<p id="status-layer" class="sr-only" role="status" aria-live="polite"></p>' +
                '</section>' +

                /* ---------- Panel penjelasan, meluncur masuk di dalam penampil ---------- */
                '<aside id="panel-samping" class="panel-samping kaca kaca-tebal flex flex-col rounded-3xl" ' +
                  'role="dialog" aria-modal="false" aria-labelledby="judul-panel" aria-hidden="true">' +
                  '<div class="flex items-center justify-between px-5 pt-4">' +
                    '<span class="h-1.5 w-10 rounded-full bg-neutral-300 md:hidden" aria-hidden="true"></span>' +
                    '<span class="mikro hidden md:inline">Penjelasan</span>' +
                    '<button type="button" data-tutup-panel aria-label="Tutup panel" ' +
                      'class="grid h-9 w-9 place-items-center rounded-full bg-white text-neutral-500 transition hover:text-neutral-900">' +
                      ikon('silang', 'h-4 w-4') +
                    '</button>' +
                  '</div>' +
                  '<div id="isi-panel" class="flex-1 overflow-y-auto px-5 pb-6 pt-3"></div>' +
                '</aside>' +
              '</div>' +
            '</div>' +
            '<figcaption class="mt-3 px-1 text-[11px] text-neutral-400">' +
              'Gambar 1. Model 3D ' + ui.esc(organ.nama_organ) + ' (' + ui.esc(organ.file_model_3d) + '). ' +
              'Ketuk titik bernomor untuk membuka label; kamera AR perangkat tidak diaktifkan pada prototipe web.' +
            '</figcaption>' +
          '</figure>' +
        '</section>'
      );
    },

    mount: function (ctx) {
      const organ = App.aksi.organAktif();
      const wadah3d = document.getElementById('wadah-3d');
      const lapisanTitik = document.getElementById('lapisan-titik');
      const status3d = document.getElementById('status-3d');
      const teksStatus = status3d.querySelector('[data-teks-status]');
      const statusLayer = document.getElementById('status-layer');
      const panel = document.getElementById('panel-samping');
      const isiPanel = document.getElementById('isi-panel');
      const tombolDaftar = document.getElementById('tombol-daftar');

      riwayatBerjalan = null;
      bagianAktif = null;
      mode3d = false;
      pemicuTerakhir = null;

      /* ---------- Titik interaktif sebagai elemen agar bisa diposisikan viewer ---------- */
      const titik = App.aksi.bagianOrgan(organ.id_organ).map(function (bagian, indeks) {
        const el = document.createElement('button');
        el.type = 'button';
        el.tabIndex = 0;
        el.className = 'titik-3d';
        el.dataset.titik = String(bagian.id_bagian);
        el.setAttribute('aria-label', 'Buka label ' + bagian.nama_bagian_internal);
        el.setAttribute('aria-pressed', 'false');
        el.innerHTML =
          '<span class="nomor-titik">' + (indeks + 1) + '</span>' +
          '<span class="nama-titik">' + ui.esc(bagian.nama_bagian_internal) + '</span>';
        el.addEventListener('click', function () { pilihBagian(bagian.id_bagian, el); });
        lapisanTitik.appendChild(el);
        const k = App.aksi.koordinat3d(bagian);
        return { id: bagian.id_bagian, el: el, x: k.x, y: k.y, z: k.z };
      });

      /* ---------- Penampil 3D, dengan gambar statis sebagai cadangan ---------- */
      function pakaiCadangan2d(alasan) {
        mode3d = false;
        wadah3d.innerHTML =
          '<div class="flex h-full w-full items-center justify-center p-6">' +
            '<div id="kotak-2d" class="relative h-full" style="aspect-ratio: 1 / 1;">' +
              '<img src="' + ui.esc(organ.gambar) + '" alt="' + ui.esc(organ.nama_organ) + '" class="h-full w-full object-contain" />' +
            '</div>' +
          '</div>';
        const kotak = wadah3d.querySelector('#kotak-2d');
        kotak.appendChild(lapisanTitik);
        lapisanTitik.className = 'titik-2d pointer-events-none absolute inset-0';
        titik.forEach(function (t) {
          const posisi = App.aksi.koordinat(App.aksi.bagianById(t.id));
          t.el.style.left = posisi.x + '%';
          t.el.style.top = posisi.y + '%';
          t.el.hidden = false;
        });
        status3d.className = 'kaca absolute inset-x-4 top-16 z-10 rounded-2xl px-4 py-3 text-xs text-neutral-700 sm:left-auto sm:right-4 sm:top-16 sm:max-w-xs';
        status3d.innerHTML = 'Model 3D tidak dapat ditampilkan (' + ui.esc(alasan) + ') Gambar dua dimensi dipakai sebagai gantinya.';
      }

      async function siapkanPenampil() {
        try {
          teksStatus.textContent = 'Memuat model 3D';
          await App.viewer3d.init({
            wadah: wadah3d,
            urlModel: organ.file_model_3d,
            titik: titik,
            saatProgres: function (persen) { teksStatus.textContent = 'Memuat model 3D ' + persen + '%'; }
          });
          mode3d = true;
          status3d.hidden = true;
          terapkanSemuaLayer();
        } catch (kesalahan) {
          pakaiCadangan2d(kesalahan.message);
        }
      }
      ui.saatViewer3dSiap(function (gagal) {
        if (gagal) { pakaiCadangan2d(gagal.message); return; }
        siapkanPenampil();
      });

      /* ---------- FR-05: toggle layer anatomi ---------- */
      function terapkanLayer(nama) {
        if (mode3d) App.viewer3d.setLapisan(nama, App.state.ui.layerAktif[nama]);
      }
      function terapkanSemuaLayer() {
        Object.keys(App.state.ui.layerAktif).forEach(terapkanLayer);
      }
      Array.prototype.forEach.call(document.querySelectorAll('[data-layer-toggle]'), function (tombol) {
        tombol.addEventListener('click', function () {
          const nama = tombol.getAttribute('data-layer-toggle');
          const layer = App.aksi.layerOrgan(organ.id_organ).find(function (l) { return l.nama_layer === nama; });
          const aktifBaru = !App.state.ui.layerAktif[nama];
          App.state.ui.layerAktif[nama] = aktifBaru;
          tombol.setAttribute('aria-pressed', String(aktifBaru));
          tombol.className = v.toggleLayer({ aktif: String(aktifBaru) });
          if (!mode3d) ui.toast('Layer hanya tersedia pada mode 3D.', 'info');
          terapkanLayer(nama);
          statusLayer.textContent = 'Layer ' + layer.label + (aktifBaru ? ' ditampilkan.' : ' disembunyikan.');
        });
      });

      /* ---------- FR-04: alat rotasi dan perbesaran ---------- */
      Array.prototype.forEach.call(document.querySelectorAll('[data-alat]'), function (tombol) {
        tombol.addEventListener('click', function () {
          if (!mode3d) { ui.toast('Kendali 3D tidak tersedia pada gambar cadangan.', 'info'); return; }
          const aksi = tombol.getAttribute('data-alat');
          if (aksi === 'reset') App.viewer3d.reset();
          if (aksi === 'zoom-in') App.viewer3d.ubahJarak(0.82);
          if (aksi === 'zoom-out') App.viewer3d.ubahJarak(1.22);
          if (aksi === 'putar') {
            const nyala = tombol.getAttribute('aria-pressed') !== 'true';
            tombol.setAttribute('aria-pressed', String(nyala));
            App.viewer3d.setAutoRotasi(nyala);
          }
        });
      });

      /* ---------- Panel penjelasan ---------- */
      /* Layar lebar: model digeser ke kiri sejauh setengah lebar panel.
         Layar sempit: panel muncul dari bawah, jadi model digeser ke atas
         sejauh setengah tinggi panel agar organ tetap terlihat. */
      function geserUntukPanel(terbuka) {
        if (!mode3d) return;
        if (!terbuka) { App.viewer3d.geserTampilan(0, 0); return; }
        const kotak = panel.getBoundingClientRect();
        if (window.innerWidth >= 768) {
          App.viewer3d.geserTampilan(Math.round(kotak.width / 2 + 8), 0);
        } else {
          App.viewer3d.geserTampilan(0, Math.round(kotak.height / 2 + 8));
        }
      }

      function bukaPanel(html, pemicu) {
        isiPanel.innerHTML = html;
        panel.classList.add('terbuka');
        panel.setAttribute('aria-hidden', 'false');
        geserUntukPanel(true);
        tombolDaftar.setAttribute('aria-expanded', 'true');
        if (pemicu) pemicuTerakhir = pemicu;
        pasangAksiPanel();
        const judul = isiPanel.querySelector('#judul-panel');
        if (judul) judul.focus({ preventScroll: true });
      }

      function tutupPanel() {
        if (!panel.classList.contains('terbuka')) return;
        panel.classList.remove('terbuka');
        panel.setAttribute('aria-hidden', 'true');
        tombolDaftar.setAttribute('aria-expanded', 'false');
        geserUntukPanel(false);
        if (mode3d) App.viewer3d.lepasFokus();
        App.aksi.tutupRiwayat(riwayatBerjalan);
        riwayatBerjalan = null;
        bagianAktif = null;
        App.state.ui.bagianAktifId = null;
        tandaiPilihan(null);
        if (pemicuTerakhir && document.contains(pemicuTerakhir)) pemicuTerakhir.focus({ preventScroll: true });
        pemicuTerakhir = null;
      }

      function tandaiPilihan(idBagian) {
        titik.forEach(function (t) { t.el.setAttribute('aria-pressed', String(t.id === idBagian)); });
      }

      /* ---------- FR-06, FR-07 & FR-14: memilih bagian ---------- */
      function pilihBagian(idBagian, pemicu) {
        const bagian = App.aksi.bagianById(idBagian);
        const dasar = App.aksi.kontenBagian(idBagian, 'dasar');
        if (!bagian || !dasar) return;

        App.aksi.tutupRiwayat(riwayatBerjalan);
        /* FR-14: riwayat tercatat otomatis begitu label dasar dibuka */
        riwayatBerjalan = App.aksi.catatRiwayat(idBagian, 'dasar');
        bagianAktif = idBagian;
        App.state.ui.bagianAktifId = idBagian;

        tandaiPilihan(idBagian);
        if (mode3d) App.viewer3d.fokusKe(idBagian, window.innerWidth >= 768 ? 0.66 : 0.88);
        bukaPanel(panelBagian(bagian), pemicu);
      }

      function pasangAksiPanel() {
        const bagian = bagianAktif ? App.aksi.bagianById(bagianAktif) : null;

        Array.prototype.forEach.call(isiPanel.querySelectorAll('[data-pilih-bagian]'), function (b) {
          b.addEventListener('click', function () { pilihBagian(Number(b.getAttribute('data-pilih-bagian')), b); });
        });

        const keDaftar = isiPanel.querySelector('[data-ke-daftar]');
        if (keDaftar) keDaftar.addEventListener('click', function () {
          App.aksi.tutupRiwayat(riwayatBerjalan);
          riwayatBerjalan = null;
          bagianAktif = null;
          tandaiPilihan(null);
          if (mode3d) App.viewer3d.lepasFokus();
          bukaPanel(panelDaftar(organ));
        });

        /* FR-07: label dimmed dibuka in-place tanpa berpindah halaman */
        const tombolDimmed = isiPanel.querySelector('[data-buka-dimmed]');
        if (tombolDimmed && bagian) {
          tombolDimmed.addEventListener('click', function () {
            const isi = document.getElementById(tombolDimmed.getAttribute('aria-controls'));
            const terbuka = tombolDimmed.getAttribute('aria-expanded') === 'true';
            tombolDimmed.setAttribute('aria-expanded', String(!terbuka));
            tombolDimmed.classList.toggle('opacity-60', terbuka);
            tombolDimmed.querySelector('[data-teks-petunjuk]').textContent =
              terbuka ? 'Ketuk untuk membuka penjelasan lanjutan' : 'Ketuk lagi untuk menutup';
            if (terbuka) {
              isi.classList.remove('akordeon-terbuka');
              window.setTimeout(function () { isi.hidden = true; }, 220);
            } else {
              isi.hidden = false;
              window.requestAnimationFrame(function () { isi.classList.add('akordeon-terbuka'); });
              App.aksi.catatRiwayat(bagian.id_bagian, 'dimmed');
            }
          });
        }

        const tanya = isiPanel.querySelector('[data-tanya-ai]');
        if (tanya && bagian) tanya.addEventListener('click', function () {
          window.location.hash = '#/asisten?bagian=' + bagian.id_bagian;
        });
        const lapor = isiPanel.querySelector('[data-lapor]');
        if (lapor && bagian) lapor.addEventListener('click', function () {
          bukaFormLaporan(bagian, App.aksi.kontenBagian(bagian.id_bagian, 'dasar'), App.aksi.kontenBagian(bagian.id_bagian, 'dimmed'));
        });
      }

      tombolDaftar.addEventListener('click', function () {
        if (panel.classList.contains('terbuka') && !bagianAktif) { tutupPanel(); return; }
        App.aksi.tutupRiwayat(riwayatBerjalan);
        riwayatBerjalan = null;
        bagianAktif = null;
        tandaiPilihan(null);
        bukaPanel(panelDaftar(organ), tombolDaftar);
      });
      panel.querySelector('[data-tutup-panel]').addEventListener('click', tutupPanel);

      /* Klik singkat pada kanvas (bukan seretan memutar) menutup panel */
      let titikTekan = null;
      wadah3d.addEventListener('pointerdown', function (e) { titikTekan = { x: e.clientX, y: e.clientY }; });
      wadah3d.addEventListener('pointerup', function (e) {
        if (!titikTekan) return;
        const geser = Math.hypot(e.clientX - titikTekan.x, e.clientY - titikTekan.y);
        titikTekan = null;
        if (geser < 6) tutupPanel();
      });

      function saatEscape(e) {
        if (e.key !== 'Escape') return;
        if (document.getElementById('lapisan-modal').children.length) return;
        tutupPanel();
      }
      document.addEventListener('keydown', saatEscape);

      /* ---------- FR-09: formulir laporan kesalahan konten ---------- */
      function bukaFormLaporan(bagian, dasar, dimmed) {
        const opsi = [dasar, dimmed].filter(Boolean).map(function (k) {
          return '<option value="' + k.id_konten + '">' + ui.esc(k.judul_tampil) + ' (' + k.jenis_konten + ')</option>';
        }).join('');

        App.ui.bukaModal({
          judul: 'Laporkan kesalahan konten',
          isi:
            '<form id="form-laporan" novalidate class="space-y-3">' +
              '<p class="text-xs text-neutral-500">Bagian tubuh: ' + ui.esc(bagian.nama_bagian_internal) + '</p>' +
              '<div>' +
                '<label for="pilih-konten" class="mikro mb-2 block">Label yang dilaporkan</label>' +
                '<select id="pilih-konten" class="' + v.input({}) + '">' + opsi + '</select>' +
              '</div>' +
              '<div>' +
                '<label for="isi-laporan" class="mikro mb-2 block">Uraian kesalahan</label>' +
                '<textarea id="isi-laporan" rows="4" aria-describedby="galat-laporan" class="' + v.input({}) + '"></textarea>' +
                '<p id="galat-laporan" class="mt-1 text-xs text-rose-600" hidden></p>' +
              '</div>' +
              '<div id="alert-laporan" role="alert" aria-live="assertive" hidden></div>' +
              '<button type="submit" id="tombol-kirim-laporan" class="' + v.tombol({ lebar: 'penuh' }) + '">Kirim laporan</button>' +
            '</form>',
          saatPasang: function (root, tutup) {
            const form = root.querySelector('#form-laporan');
            const isi = root.querySelector('#isi-laporan');
            const galat = root.querySelector('#galat-laporan');
            const alert = root.querySelector('#alert-laporan');
            const tombol = root.querySelector('#tombol-kirim-laporan');

            form.addEventListener('submit', async function (e) {
              e.preventDefault();
              alert.hidden = true;
              const teks = isi.value.trim();
              if (teks.length < 10) {
                galat.textContent = 'Uraian minimal 10 karakter.';
                galat.hidden = false;
                isi.setAttribute('aria-invalid', 'true');
                isi.focus();
                return;
              }
              galat.hidden = true;
              isi.setAttribute('aria-invalid', 'false');
              const idKonten = Number(root.querySelector('#pilih-konten').value);

              /* Loading state + error handling untuk pemanggilan async */
              tombol.disabled = true;
              tombol.innerHTML = ui.spinner() + ' Mengirim';
              try {
                await App.api.kirimLaporan({ id_konten: idKonten, id_user: App.aksi.idUserAktif(), deskripsi_laporan: teks });
                App.aksi.tambahLaporan(idKonten, teks);
                tutup();
                ui.toast('Laporan terkirim ke dashboard Administrator.', 'sukses');
              } catch (kesalahan) {
                alert.className = v.alert({ tipe: 'error' });
                alert.textContent = 'Laporan gagal dikirim: ' + kesalahan.message + ' Periksa koneksi lalu coba lagi.';
                alert.hidden = false;
              } finally {
                tombol.disabled = false;
                tombol.textContent = 'Kirim laporan';
              }
            });
          }
        });
      }

      /* Dipanggil router saat berpindah halaman */
      App.pages.eksplorasi.bersihkan = function () {
        document.removeEventListener('keydown', saatEscape);
        if (App.viewer3d) App.viewer3d.bersihkan();
        App.aksi.tutupRiwayat(riwayatBerjalan);
        riwayatBerjalan = null;
        bagianAktif = null;
        mode3d = false;
      };
    }
  };
})(window.App);
