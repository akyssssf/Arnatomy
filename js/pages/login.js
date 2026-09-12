/* ==========================================================================
   pages/login.js — Halaman Login (FR-01, TC-01 & TC-02)
   Validasi input kosong/format, simulasi cek kredensial akun dummy,
   dan pesan error dengan role="alert".
   ========================================================================== */
window.App = window.App || {};
window.App.pages = window.App.pages || {};

(function (App) {
  'use strict';

  const ui = App.ui;
  const v = App.v;

  const AKUN_DEMO = [
    { email: 'siswa@arnatomy.id', password: 'siswa123', peran: 'Siswa' },
    { email: 'guru@arnatomy.id',  password: 'guru123',  peran: 'Guru' },
    { email: 'admin@arnatomy.id', password: 'admin123', peran: 'Administrator' }
  ];

  /* Akun demo ditampilkan seperti pemilih bahasa "EN / ID / GR" pada referensi */
  function tautanAkun(akun) {
    return (
      '<li>' +
        '<button type="button" data-isi-akun data-email="' + ui.esc(akun.email) + '" ' +
          'data-password="' + ui.esc(akun.password) + '" ' +
          'class="text-[11px] font-medium uppercase tracking-[0.08em] text-neutral-500 transition hover:text-[#1a6dff]">' +
          ui.esc(akun.peran) +
        '</button>' +
      '</li>'
    );
  }

  App.pages.login = {
    judul: 'Masuk',
    tanpaLayout: true,

    render: function () {
      const total = App.state.body_parts.length;
      const jumlahLabel = App.state.part_content.length;

      return (
        '<section aria-labelledby="judul-login" class="pb-6">' +

          /* Baris atas: wordmark dan penanda versi */
          '<div class="flex items-center justify-between py-5">' +
            '<span class="tampilan titik-biru text-lg font-semibold">ARnatomy</span>' +
            '<p class="mikro">SKPL v1.0</p>' +
          '</div>' +

          /* Hero: teks di kiri, organ 3D di kanan */
          '<div class="mt-4 grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">' +
            '<div>' +
              '<h1 id="judul-login" class="titik-biru denyut text-[2.75rem] font-semibold leading-[0.92] sm:text-6xl lg:text-[5.25rem]">' +
                ui.judulKata([['Belajar', 'anatomi'], ['lewat', 'model', '3D']]) +
              '</h1>' +
              '<div class="muncul mt-8 flex flex-wrap items-center gap-5" style="transition-delay:350ms">' +
                '<a href="#form-login" class="' + v.tombol({ ukuran: 'lg' }) + '">' +
                  'Mulai belajar' + App.ikon('panah', 'h-4 w-4') +
                '</a>' +
                '<p class="max-w-xs text-sm leading-relaxed text-neutral-500">' +
                  'Putar model jantung, buka label tiap bagian, lalu tanyakan yang belum jelas ke asisten AI.' +
                '</p>' +
              '</div>' +
              '<ul class="nav-miring muncul mt-8 flex items-center" aria-label="Isi cepat akun uji coba" style="transition-delay:480ms">' +
                AKUN_DEMO.map(tautanAkun).join('') +
              '</ul>' +
            '</div>' +

            '<div class="muncul relative aspect-square overflow-hidden rounded-3xl bg-[#f1f2f4]" style="transition-delay:200ms">' +
              '<span class="piringan-organ" aria-hidden="true"></span>' +
              '<div id="hero-3d" class="absolute inset-0"></div>' +
              '<img src="assets/img/jantung.webp" alt="Model 3D jantung manusia" ' +
                'class="hero-gambar melayang pointer-events-none absolute left-1/2 top-1/2 w-[78%] -translate-x-1/2 -translate-y-1/2" />' +
              '<p class="mikro kaca absolute right-4 top-4 rounded-full px-3 py-1.5">Model 3D</p>' +
              '<div class="kaca melayang-lambat absolute bottom-4 left-4 rounded-2xl px-4 py-3">' +
                '<p class="mikro">' + App.state.organs.length + ' organ</p>' +
                '<p class="mt-1 text-2xl font-semibold leading-none">' + total + ' <span class="text-sm font-medium text-neutral-500">bagian</span></p>' +
                '<p class="mt-1 text-xs text-neutral-500">' + jumlahLabel + ' label dasar dan dimmed</p>' +
              '</div>' +
            '</div>' +
          '</div>' +

          '<div class="muncul mt-10">' +
            ui.marquee(['Sistem Peredaran Darah', 'Model Organ 3D', 'Label Interaktif', 'Asisten AI', 'Riwayat Belajar'], 'Fitur') +
          '</div>' +

          /* Formulir */
          '<div class="mt-8 grid gap-4 lg:grid-cols-[1fr_1.15fr]">' +
            '<div class="muncul ' + v.kartu({ nada: 'aksen', padding: 'lg' }) + ' flex flex-col justify-between">' +
              '<div>' +
                '<p class="mikro">Masuk</p>' +
                '<h2 class="titik-biru mt-3 text-3xl font-semibold">Gunakan akun terdaftar</h2>' +
              '</div>' +
              '<p class="mt-8 text-xs leading-relaxed text-neutral-500">' +
                'Tekan Siswa, Guru, atau Administrator di atas untuk mengisi form otomatis. ' +
                'Data sesi hanya disimpan di memori dan hilang saat halaman dimuat ulang.' +
              '</p>' +
            '</div>' +

            '<div class="muncul ' + v.kartu({ padding: 'lg' }) + '">' +
              '<div id="kotak-error" role="alert" aria-live="assertive" class="mb-4" hidden></div>' +
              '<form id="form-login" novalidate class="space-y-4">' +
                '<div>' +
                  '<label for="input-email" class="mikro mb-2 block">Email</label>' +
                  '<input id="input-email" name="email" type="email" autocomplete="username" ' +
                    'placeholder="nama@sekolah.sch.id" aria-describedby="galat-email" class="' + v.input({}) + '" />' +
                  '<p id="galat-email" class="mt-1 text-xs text-rose-600" hidden></p>' +
                '</div>' +
                '<div>' +
                  '<label for="input-password" class="mikro mb-2 block">Kata sandi</label>' +
                  '<div class="relative">' +
                    '<input id="input-password" name="password" type="password" autocomplete="current-password" ' +
                      'placeholder="Kata sandi" aria-describedby="galat-password" class="' + v.input({}) + ' pr-11" />' +
                    '<button type="button" id="tombol-lihat-sandi" aria-pressed="false" aria-label="Tampilkan kata sandi" ' +
                      'class="absolute right-1.5 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full text-neutral-400 transition hover:bg-white hover:text-neutral-900">' +
                      App.ikon('mata', 'h-4 w-4') +
                    '</button>' +
                  '</div>' +
                  '<p id="galat-password" class="mt-1 text-xs text-rose-600" hidden></p>' +
                '</div>' +
                '<div class="flex items-center justify-between gap-3 pt-1">' +
                  '<p class="text-[11px] text-neutral-400">Prototipe: kata sandi tidak dienkripsi.</p>' +
                  '<button type="submit" id="tombol-masuk" class="' + v.tombol({ ukuran: 'md' }) + '">' +
                    'Masuk' + App.ikon('panah', 'h-4 w-4') +
                  '</button>' +
                '</div>' +
              '</form>' +
            '</div>' +
          '</div>' +
        '</section>'
      );
    },

    mount: function () {
      ui.pasangHero3d('hero-3d', { jarak: 1.55, kecepatanPutar: 0.8 });

      const form = document.getElementById('form-login');
      const inputEmail = document.getElementById('input-email');
      const inputPassword = document.getElementById('input-password');
      const galatEmail = document.getElementById('galat-email');
      const galatPassword = document.getElementById('galat-password');
      const kotakError = document.getElementById('kotak-error');
      const tombolLihat = document.getElementById('tombol-lihat-sandi');

      function tandaiGalat(input, elemenPesan, pesan) {
        const adaGalat = Boolean(pesan);
        input.className = v.input({ keadaan: adaGalat ? 'salah' : 'normal' }) + (input.id === 'input-password' ? ' pr-11' : '');
        input.setAttribute('aria-invalid', String(adaGalat));
        elemenPesan.textContent = pesan || '';
        elemenPesan.hidden = !adaGalat;
      }

      function tampilkanErrorUmum(pesan) {
        kotakError.className = v.alert({ tipe: 'error' }) + ' mt-3';
        kotakError.textContent = pesan;
        kotakError.hidden = false;
      }

      tombolLihat.addEventListener('click', function () {
        const terlihat = tombolLihat.getAttribute('aria-pressed') === 'true';
        tombolLihat.setAttribute('aria-pressed', String(!terlihat));
        tombolLihat.setAttribute('aria-label', terlihat ? 'Tampilkan kata sandi' : 'Sembunyikan kata sandi');
        tombolLihat.innerHTML = App.ikon(terlihat ? 'mata' : 'silang', 'h-4 w-4');
        inputPassword.type = terlihat ? 'password' : 'text';
      });

      Array.prototype.forEach.call(document.querySelectorAll('[data-isi-akun]'), function (tombol) {
        tombol.addEventListener('click', function () {
          inputEmail.value = tombol.getAttribute('data-email');
          inputPassword.value = tombol.getAttribute('data-password');
          tandaiGalat(inputEmail, galatEmail, '');
          tandaiGalat(inputPassword, galatPassword, '');
          kotakError.hidden = true;
          inputPassword.focus();
        });
      });

      form.addEventListener('submit', function (e) {
        e.preventDefault();
        kotakError.hidden = true;

        const email = inputEmail.value.trim();
        const password = inputPassword.value;
        let valid = true;

        /* Validasi input kosong & format email */
        if (!email) { tandaiGalat(inputEmail, galatEmail, 'Email wajib diisi.'); valid = false; }
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { tandaiGalat(inputEmail, galatEmail, 'Format email tidak valid.'); valid = false; }
        else { tandaiGalat(inputEmail, galatEmail, ''); }

        if (!password) { tandaiGalat(inputPassword, galatPassword, 'Kata sandi wajib diisi.'); valid = false; }
        else { tandaiGalat(inputPassword, galatPassword, ''); }

        if (!valid) {
          tampilkanErrorUmum('Periksa kembali isian yang ditandai.');
          (email ? inputPassword : inputEmail).focus();
          return;
        }

        /* Simulasi pengecekan kredensial ke basis data akun */
        const user = App.aksi.masuk(email, password);
        if (!user) {
          tampilkanErrorUmum('Email atau kata sandi salah.');
          inputPassword.value = '';
          inputPassword.focus();
          return;
        }

        window.location.hash = user.role === 'admin' ? '#/admin' : '#/beranda';
      });

      App.pages.login.bersihkan = function () {
        if (App.viewer3d) App.viewer3d.bersihkan();
      };
    }
  };
})(window.App);
