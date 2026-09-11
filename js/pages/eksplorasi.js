/* ==========================================================================
   pages/eksplorasi.js — Halaman Eksplorasi (model organ 3D)
   Mencakup FR-03 (tampilan model), FR-04 (rotasi & zoom), FR-05 (toggle layer),
   FR-06 (label dasar), FR-07 (label dimmed expand in-place), FR-09 (lapor),
   dan FR-14 (pencatatan riwayat belajar otomatis).

   Tata letak tiga kolom: pustaka bagian, penampil model, panel penjelasan.
   Bila WebGL atau berkas model gagal dimuat, halaman turun ke ilustrasi SVG
   dua dimensi dengan titik interaktif yang sama.
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
  let mode3d = false;           // false berarti sedang memakai ilustrasi cadangan

  /* ---------------------------------------------------------------- *
   * Potongan markup
   * ---------------------------------------------------------------- */
  function barisPustaka(bagian, indeks) {
    const dimmed = App.aksi.kontenBagian(bagian.id_bagian, 'dimmed');
    const induk = bagian.parent_bagian_id ? App.aksi.bagianById(bagian.parent_bagian_id) : null;
    return (
      '<li>' +
        '<button type="button" tabindex="0" data-pilih-bagian="' + bagian.id_bagian + '" ' +
          'class="baris-pustaka flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left hover:bg-white">' +
          '<span class="nomor-pustaka grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white text-xs font-semibold text-neutral-700">' +
            (indeks + 1) +
          '</span>' +
          '<span class="min-w-0 flex-1">' +
            '<span class="block truncate text-sm font-semibold">' + ui.esc(bagian.nama_bagian_internal) + '</span>' +
            '<span class="block truncate text-[11px] text-neutral-400">' +
              (induk ? 'Sub-bagian ' + ui.esc(induk.nama_bagian_internal) : 'Label dasar') +
            '</span>' +
          '</span>' +
          (dimmed
            ? '<span class="h-2 w-2 shrink-0 rounded-full bg-[#1a6dff]" title="Punya label dimmed">' +
                '<span class="sr-only">Punya label dimmed</span>' +
              '</span>'
            : '') +
        '</button>' +
      '</li>'
    );
  }

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
        'class="grid h-10 w-10 place-items-center rounded-full bg-white text-neutral-700 transition ' +
        'hover:text-[#1a6dff] aria-pressed:bg-neutral-900 aria-pressed:text-white">' +
        ikon(namaIkon, 'h-4 w-4') +
      '</button>'
    );
  }

  function daftarFakta(fakta) {
    if (!fakta || !fakta.length) return '';
    return (
      '<section class="mt-6">' +
        '<h3 class="mikro">Fakta kunci</h3>' +
        '<dl class="mt-3 divide-y divide-black/5">' +
          fakta.map(function (f) {
            return (
              '<div class="grid grid-cols-[6.5rem_1fr] items-baseline gap-3 py-2.5">' +
                '<dt class="text-[11px] text-neutral-400">' + ui.esc(f.label) + '</dt>' +
                '<dd class="text-sm font-medium text-neutral-800">' + ui.esc(f.nilai) + '</dd>' +
              '</div>'
            );
          }).join('') +
        '</dl>' +
      '</section>'
    );
  }

  /* Panel kanan saat belum ada bagian yang dipilih: ringkasan organ */
  function panelOrgan() {
    const organ = App.state.organs[0];
    return (
      '<p class="mikro">Organ</p>' +
      '<h2 id="judul-panel" tabindex="-1" class="titik-biru mt-3 text-3xl font-semibold leading-tight">' +
        ui.esc(organ.nama_organ) +
      '</h2>' +
      '<p class="mt-1 text-sm italic text-neutral-400">' + ui.esc(organ.julukan) + '</p>' +
      '<p class="mt-4 text-sm leading-relaxed text-neutral-500">' + ui.esc(organ.deskripsi) + '</p>' +
      daftarFakta(organ.fakta) +
      '<p class="mt-5 rounded-xl bg-[#f1f2f4] px-3.5 py-3 text-xs leading-relaxed text-neutral-500">' +
        'Pilih titik bernomor pada model atau salah satu bagian pada daftar untuk membuka penjelasannya.' +
      '</p>'
    );
  }

  /* Panel kanan untuk satu bagian tubuh */
  function panelBagian(bagian) {
    const dasar = App.aksi.kontenBagian(bagian.id_bagian, 'dasar');
    const dimmed = App.aksi.kontenBagian(bagian.id_bagian, 'dimmed');
    const induk = bagian.parent_bagian_id ? App.aksi.bagianById(bagian.parent_bagian_id) : null;
    const idDetail = 'detail-dimmed-' + bagian.id_bagian;

    const blokDimmed = dimmed
      ? '<section class="mt-6">' +
          '<button type="button" tabindex="0" data-buka-dimmed aria-expanded="false" aria-controls="' + idDetail + '" ' +
            'class="w-full rounded-2xl bg-[#f1f2f4] px-4 py-3.5 text-left opacity-55 transition hover:opacity-100 focus-visible:opacity-100">' +
            '<span class="flex items-center justify-between gap-2">' +
              '<span class="text-sm font-semibold">' + ui.esc(dimmed.judul_tampil) + '</span>' +
              '<span class="' + v.badge({ status: 'dimmed' }) + '">dimmed</span>' +
            '</span>' +
            '<span class="mt-1 block text-[11px] text-neutral-500" data-teks-petunjuk>' +
              'Ketuk untuk membuka penjelasan lanjutan' +
            '</span>' +
          '</button>' +
          '<div id="' + idDetail + '" class="akordeon" hidden>' +
            '<p class="mt-2 rounded-2xl border border-black/5 p-4 text-sm leading-relaxed text-neutral-600">' +
              ui.esc(dimmed.deskripsi) +
            '</p>' +
          '</div>' +
        '</section>'
      : '<p class="mt-6 rounded-xl bg-[#f1f2f4] px-3.5 py-3 text-xs text-neutral-500">' +
          'Tidak ada penjelasan lanjutan untuk bagian ini.' +
        '</p>';

    return (
      '<div class="flex items-start justify-between gap-3">' +
        '<div>' +
          '<p class="mikro">Bagian tubuh</p>' +
          '<h2 id="judul-panel" tabindex="-1" class="titik-biru mt-3 text-3xl font-semibold leading-tight">' +
            ui.esc(bagian.nama_bagian_internal) +
          '</h2>' +
          (induk ? '<p class="mt-1 text-sm italic text-neutral-400">Sub-bagian ' + ui.esc(induk.nama_bagian_internal) + '</p>' : '') +
        '</div>' +
        '<span class="' + v.badge({ status: dasar.status_validasi === 'tervalidasi' ? 'tervalidasi' : 'draft' }) + ' mt-1 shrink-0">' +
          ui.esc(dasar.status_validasi) +
        '</span>' +
      '</div>' +
      '<p class="mt-4 text-sm leading-relaxed text-neutral-500">' + ui.esc(dasar.deskripsi) + '</p>' +
      daftarFakta(bagian.fakta) +
      blokDimmed +
      '<div class="mt-6 flex flex-wrap gap-2">' +
        '<button type="button" data-tanya-ai class="' + v.tombol({ ukuran: 'md' }) + '">' +
          'Tanya Asisten AI' + ikon('panah', 'h-4 w-4') +
        '</button>' +
        '<button type="button" data-lapor class="' + v.tombol({ variant: 'garis', ukuran: 'md' }) + ' bg-[#f1f2f4]">' +
          'Laporkan' +
        '</button>' +
      '</div>'
    );
  }

  App.pages.eksplorasi = {
    judul: 'Eksplorasi',

    render: function () {
      const organ = App.state.organs[0];
      const layers = App.state.layers.slice().sort(function (a, b) { return a.urutan_tampil - b.urutan_tampil; });

      return (
        '<section aria-labelledby="judul-eksplorasi">' +
          '<header class="grid gap-6 pt-6 sm:pt-8 lg:grid-cols-[1fr_auto] lg:items-end">' +
            '<div>' +
              '<p class="mikro mb-3">' + ui.esc(organ.sistem_organ) + '</p>' +
              '<h1 id="judul-eksplorasi" class="titik-biru text-4xl font-semibold leading-[0.95] sm:text-5xl lg:text-6xl">' +
                'Eksplorasi<br />' + ui.esc(organ.nama_organ) +
              '</h1>' +
            '</div>' +
            '<p class="max-w-xs text-sm leading-relaxed text-neutral-500 lg:mb-2 lg:text-right">' +
              'Seret model untuk memutar. Perbesar lewat tombol atau tahan Ctrl sambil menggulir.' +
            '</p>' +
          '</header>' +

          '<div class="mt-8 grid gap-4 lg:grid-cols-[14.5rem_minmax(0,1fr)_21rem]">' +

            /* ---------- Kolom tengah: penampil model ---------- */
            '<div class="lg:col-start-2 lg:row-start-1">' +
              '<figure class="m-0">' +
                '<div id="panggung" class="relative overflow-hidden rounded-3xl bg-[#f1f2f4]">' +

                  /* Kotak model: kanvas, titik, dan alat dibatasi di dalamnya
                     supaya bilah layer di bawahnya tidak menutupi organ. */
                  '<div class="relative aspect-[4/3] w-full lg:aspect-auto lg:h-[32rem]">' +
                    '<span class="piringan-organ" aria-hidden="true"></span>' +
                    '<div id="wadah-3d" class="absolute inset-0"></div>' +
                    '<div id="lapisan-titik" class="pointer-events-none absolute inset-0"></div>' +

                    '<div id="status-3d" role="status" aria-live="polite" ' +
                      'class="absolute inset-0 grid place-items-center bg-[#f1f2f4]/80 text-sm font-medium text-neutral-500">' +
                      'Menyiapkan penampil 3D' +
                    '</div>' +

                    '<div class="absolute left-4 top-4 flex flex-col gap-2">' +
                      tombolAlat('reset', 'Atur ulang tampilan', 'ulang', false) +
                      tombolAlat('zoom-in', 'Perbesar', 'perbesar', false) +
                      tombolAlat('zoom-out', 'Perkecil', 'perkecil', false) +
                      tombolAlat('putar', 'Putar otomatis', 'putar', true) +
                    '</div>' +

                    '<p class="mikro pointer-events-none absolute right-5 top-5 hidden sm:block">Model 3D</p>' +
                  '</div>' +

                  /* Bilah kendali layer: menumpuk di bawah model pada layar
                     sempit, melayang di dasar kartu pada layar lebar. */
                  '<section aria-labelledby="judul-layer" ' +
                    'class="relative z-10 mx-4 mb-4 mt-2 flex flex-wrap items-center gap-2 rounded-3xl bg-white/70 p-1.5 ' +
                    'lg:absolute lg:bottom-4 lg:left-4 lg:mx-0 lg:mb-0 lg:mt-0 lg:w-fit">' +
                    '<h2 id="judul-layer" class="mikro pl-3 pr-1">Layer</h2>' +
                    layers.map(tombolLayer).join('') +
                    '<p id="status-layer" class="sr-only" role="status" aria-live="polite"></p>' +
                  '</section>' +
                '</div>' +

                '<figcaption class="mt-3 px-1 text-[11px] text-neutral-400">' +
                  'Gambar 1. Model 3D ' + ui.esc(organ.nama_organ) + ' (' + ui.esc(organ.file_model_3d) + '). ' +
                  'Kamera AR perangkat tidak diaktifkan pada prototipe web.' +
                '</figcaption>' +
              '</figure>' +
            '</div>' +

            /* ---------- Kolom kanan: penjelasan ---------- */
            '<aside aria-labelledby="judul-panel" class="lg:col-start-3 lg:row-start-1">' +
              '<div id="panel-detail" class="' + v.kartu({ padding: 'lg' }) + ' lg:sticky lg:top-20">' +
                panelOrgan() +
              '</div>' +
            '</aside>' +

            /* ---------- Kolom kiri: pustaka bagian ---------- */
            '<aside aria-labelledby="judul-pustaka" class="lg:col-start-1 lg:row-start-1">' +
              '<div class="' + v.kartu({ nada: 'aksen', padding: 'sm' }) + ' lg:sticky lg:top-20">' +
                '<h2 id="judul-pustaka" class="mikro px-3 pb-2 pt-1">Pustaka bagian</h2>' +
                '<ul class="space-y-1">' + App.state.body_parts.map(barisPustaka).join('') + '</ul>' +
              '</div>' +
            '</aside>' +
          '</div>' +
        '</section>'
      );
    },

    mount: function () {
      const wadah3d = document.getElementById('wadah-3d');
      const lapisanTitik = document.getElementById('lapisan-titik');
      const status3d = document.getElementById('status-3d');
      const panel = document.getElementById('panel-detail');
      const statusLayer = document.getElementById('status-layer');

      riwayatBerjalan = null;
      bagianAktif = null;
      mode3d = false;

      /* ---------- Titik interaktif dibuat sebagai elemen agar bisa
                    diposisikan oleh penampil 3D setiap frame ---------- */
      const titik = App.state.body_parts.map(function (bagian, indeks) {
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
        el.addEventListener('click', function () { pilihBagian(bagian.id_bagian); });
        lapisanTitik.appendChild(el);
        const k = App.aksi.koordinat3d(bagian);
        return { id: bagian.id_bagian, el: el, x: k.x, y: k.y, z: k.z };
      });

      /* ---------- Penampil 3D, dengan ilustrasi SVG sebagai cadangan ---------- */
      function pakaiCadangan2d(alasan) {
        mode3d = false;
        /* Kotak berbanding 5:6 agar koordinat persen tetap sejajar dengan gambar */
        wadah3d.innerHTML =
          '<div class="flex h-full w-full items-center justify-center p-3">' +
            '<div id="kotak-2d" class="relative h-full" style="aspect-ratio: 5 / 6;"></div>' +
          '</div>';
        const kotak = wadah3d.querySelector('#kotak-2d');
        kotak.innerHTML = App.svg.ilustrasiJantung();
        kotak.appendChild(lapisanTitik);
        lapisanTitik.className = 'titik-2d pointer-events-none absolute inset-0';
        titik.forEach(function (t) {
          const posisi = App.aksi.koordinat(App.aksi.bagianById(t.id));
          t.el.style.left = posisi.x + '%';
          t.el.style.top = posisi.y + '%';
          t.el.hidden = false;
        });
        status3d.className = 'absolute inset-x-4 bottom-4 rounded-xl bg-amber-100 px-3.5 py-2.5 text-xs text-amber-800';
        status3d.textContent = 'Model 3D tidak dapat ditampilkan (' + alasan + ') Ilustrasi dua dimensi dipakai sebagai gantinya.';
        terapkanSemuaLayer();
      }

      async function siapkanPenampil() {
        try {
          status3d.textContent = 'Memuat model 3D';
          await App.viewer3d.init({
            wadah: wadah3d,
            urlModel: App.state.organs[0].file_model_3d,
            titik: titik,
            saatProgres: function (persen) { status3d.textContent = 'Memuat model 3D ' + persen + '%'; }
          });
          mode3d = true;
          status3d.hidden = true;
          terapkanSemuaLayer();
        } catch (kesalahan) {
          pakaiCadangan2d(kesalahan.message);
        }
      }

      if (App.viewer3d) {
        siapkanPenampil();
      } else {
        /* Modul penampil dimuat sebagai ES module sehingga bisa selesai
           belakangan; tunggu pengumumannya, dengan batas waktu wajar. */
        const batas = window.setTimeout(function () {
          pakaiCadangan2d('modul 3D tidak termuat.');
        }, 10000);
        document.addEventListener('viewer3d:siap', function () {
          window.clearTimeout(batas);
          siapkanPenampil();
        }, { once: true });
      }

      /* ---------- FR-05: toggle layer anatomi ---------- */
      function terapkanLayer(nama) {
        const aktif = App.state.ui.layerAktif[nama];
        if (mode3d) { App.viewer3d.setLapisan(nama, aktif); return; }
        const grup = wadah3d.querySelector('[data-layer="' + nama + '"]');
        if (grup) grup.classList.toggle('layer-mati', !aktif);
      }
      function terapkanSemuaLayer() {
        Object.keys(App.state.ui.layerAktif).forEach(terapkanLayer);
      }

      Array.prototype.forEach.call(document.querySelectorAll('[data-layer-toggle]'), function (tombol) {
        tombol.addEventListener('click', function () {
          const nama = tombol.getAttribute('data-layer-toggle');
          const layer = App.state.layers.find(function (l) { return l.nama_layer === nama; });
          const aktifBaru = !App.state.ui.layerAktif[nama];

          App.state.ui.layerAktif[nama] = aktifBaru;
          tombol.setAttribute('aria-pressed', String(aktifBaru));
          tombol.className = v.toggleLayer({ aktif: String(aktifBaru) });
          terapkanLayer(nama);
          statusLayer.textContent = 'Layer ' + layer.label + (aktifBaru ? ' ditampilkan.' : ' disembunyikan.');
        });
      });

      /* ---------- FR-04: alat rotasi dan perbesaran ---------- */
      Array.prototype.forEach.call(document.querySelectorAll('[data-alat]'), function (tombol) {
        tombol.addEventListener('click', function () {
          if (!mode3d) { ui.toast('Kendali 3D tidak tersedia pada ilustrasi cadangan.', 'info'); return; }
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

      /* ---------- FR-06, FR-07 & FR-14: memilih bagian ---------- */
      function tandaiPilihan(idBagian) {
        titik.forEach(function (t) {
          t.el.setAttribute('aria-pressed', String(t.id === idBagian));
        });
        Array.prototype.forEach.call(document.querySelectorAll('[data-pilih-bagian]'), function (b) {
          const terpilih = Number(b.getAttribute('data-pilih-bagian')) === idBagian;
          b.classList.toggle('baris-terpilih', terpilih);
          b.setAttribute('aria-current', terpilih ? 'true' : 'false');
        });
      }

      function pilihBagian(idBagian) {
        const bagian = App.aksi.bagianById(idBagian);
        const dasar = App.aksi.kontenBagian(idBagian, 'dasar');
        if (!bagian || !dasar) return;

        App.aksi.tutupRiwayat(riwayatBerjalan);
        /* FR-14: riwayat tercatat otomatis begitu label dasar dibuka */
        riwayatBerjalan = App.aksi.catatRiwayat(idBagian, 'dasar');
        bagianAktif = idBagian;
        App.state.ui.bagianAktifId = idBagian;

        panel.innerHTML = panelBagian(bagian);
        pasangAksiPanel(bagian);
        tandaiPilihan(idBagian);
        if (mode3d) App.viewer3d.hadapkanKe(idBagian);
        panel.querySelector('#judul-panel').focus();
      }

      function pasangAksiPanel(bagian) {
        const dasar = App.aksi.kontenBagian(bagian.id_bagian, 'dasar');
        const dimmed = App.aksi.kontenBagian(bagian.id_bagian, 'dimmed');

        /* FR-07: label dimmed dibuka in-place tanpa berpindah halaman */
        const tombolDimmed = panel.querySelector('[data-buka-dimmed]');
        if (tombolDimmed) {
          tombolDimmed.addEventListener('click', function () {
            const isi = document.getElementById(tombolDimmed.getAttribute('aria-controls'));
            const terbuka = tombolDimmed.getAttribute('aria-expanded') === 'true';

            tombolDimmed.setAttribute('aria-expanded', String(!terbuka));
            tombolDimmed.classList.toggle('opacity-55', terbuka);
            tombolDimmed.querySelector('[data-teks-petunjuk]').textContent =
              terbuka ? 'Ketuk untuk membuka penjelasan lanjutan' : 'Ketuk lagi untuk menutup';

            if (terbuka) {
              isi.classList.remove('akordeon-terbuka');
              window.setTimeout(function () { isi.hidden = true; }, 200);
            } else {
              isi.hidden = false;
              window.requestAnimationFrame(function () { isi.classList.add('akordeon-terbuka'); });
              App.aksi.catatRiwayat(bagian.id_bagian, 'dimmed');
            }
          });
        }

        panel.querySelector('[data-tanya-ai]').addEventListener('click', function () {
          window.location.hash = '#/asisten?bagian=' + bagian.id_bagian;
        });
        panel.querySelector('[data-lapor]').addEventListener('click', function () {
          bukaFormLaporan(bagian, dasar, dimmed);
        });
      }

      Array.prototype.forEach.call(document.querySelectorAll('[data-pilih-bagian]'), function (tombol) {
        tombol.addEventListener('click', function () {
          pilihBagian(Number(tombol.getAttribute('data-pilih-bagian')));
        });
      });

      /* Escape mengembalikan panel ke ringkasan organ */
      function saatEscape(e) {
        if (e.key !== 'Escape' || bagianAktif === null) return;
        App.aksi.tutupRiwayat(riwayatBerjalan);
        riwayatBerjalan = null;
        bagianAktif = null;
        App.state.ui.bagianAktifId = null;
        panel.innerHTML = panelOrgan();
        tandaiPilihan(null);
        panel.querySelector('#judul-panel').focus();
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
              '<p class="mikro">Bagian tubuh: ' + ui.esc(bagian.nama_bagian_internal) + '</p>' +
              '<div>' +
                '<label for="pilih-konten" class="mikro mb-2 block">Label yang dilaporkan</label>' +
                '<select id="pilih-konten" class="' + v.input({}) + '">' + opsi + '</select>' +
              '</div>' +
              '<div>' +
                '<label for="isi-laporan" class="mikro mb-2 block">Uraian kesalahan</label>' +
                '<textarea id="isi-laporan" rows="4" aria-describedby="galat-laporan" class="' + v.input({}) + '"></textarea>' +
                '<p id="galat-laporan" class="mt-1 text-xs text-red-700" hidden></p>' +
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
                await App.api.kirimLaporan({
                  id_konten: idKonten,
                  id_user: App.aksi.idUserAktif(),
                  deskripsi_laporan: teks
                });
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
