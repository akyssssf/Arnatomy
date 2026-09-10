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

  function barisAkun(akun) {
    return (
      '<li>' +
        '<button type="button" data-isi-akun data-email="' + ui.esc(akun.email) + '" ' +
          'data-password="' + ui.esc(akun.password) + '" ' +
          'class="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition hover:bg-slate-50">' +
          '<span class="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-blue-50 text-[11px] font-bold text-blue-700">' +
            ui.esc(akun.peran.charAt(0)) +
          '</span>' +
          '<span class="min-w-0 flex-1">' +
            '<span class="block text-xs font-semibold text-slate-700">' + ui.esc(akun.peran) + '</span>' +
            '<span class="block truncate text-[11px] text-slate-400">' +
              ui.esc(akun.email) + ' &middot; ' + ui.esc(akun.password) +
            '</span>' +
          '</span>' +
          '<span class="text-[11px] font-semibold text-blue-600">Isi</span>' +
        '</button>' +
      '</li>'
    );
  }

  App.pages.login = {
    judul: 'Masuk',
    tanpaLayout: true,

    render: function () {
      return (
        '<section aria-labelledby="judul-login" class="grid min-h-[86vh] content-center items-center gap-10 py-8 lg:grid-cols-2">' +

          /* Kolom kiri: identitas produk */
          '<div class="order-2 lg:order-1">' +
            '<span class="flex w-fit items-center gap-2.5">' +
              '<span class="grid h-10 w-10 place-items-center rounded-xl bg-blue-600 text-white">' +
                App.ikon('jantung', 'h-5 w-5') +
              '</span>' +
              '<span class="text-lg font-bold tracking-tight">ARnatomy</span>' +
            '</span>' +
            '<h1 id="judul-login" class="mt-6 text-3xl font-bold leading-tight tracking-tight sm:text-4xl">' +
              'Belajar anatomi lewat<br class="hidden sm:block" /> <span class="text-blue-600">model organ 3D</span>' +
            '</h1>' +
            '<p class="mt-3 max-w-md text-sm leading-relaxed text-slate-500">' +
              'Prototipe antarmuka untuk sistem peredaran darah. Putar model jantung, buka label tiap bagian, ' +
              'lalu tanyakan yang belum jelas ke asisten AI.' +
            '</p>' +
            '<ul class="mt-6 grid max-w-md gap-2 sm:grid-cols-3">' +
              [['jantung', 'Model 3D'], ['lapisan', 'Layer anatomi'], ['chat', 'Asisten AI']].map(function (x) {
                return '<li class="flex items-center gap-2 rounded-xl bg-white px-3 py-2.5 text-xs font-semibold text-slate-600 shadow-[0_2px_10px_rgba(30,58,138,0.05)]">' +
                  '<span class="text-blue-600">' + App.ikon(x[0], 'h-4 w-4') + '</span>' + x[1] +
                '</li>';
              }).join('') +
            '</ul>' +
          '</div>' +

          /* Kolom kanan: form */
          '<div class="order-1 mx-auto w-full max-w-md lg:order-2">' +
            '<div class="' + v.kartu({ padding: 'lg' }) + '">' +
              '<h2 class="text-lg font-bold tracking-tight">Masuk</h2>' +
              '<p class="mt-0.5 text-xs text-slate-400">Gunakan akun yang terdaftar.</p>' +

              '<div id="kotak-error" role="alert" aria-live="assertive" class="mt-4" hidden></div>' +

              '<form id="form-login" novalidate class="mt-4 space-y-3.5">' +
                '<div>' +
                  '<label for="input-email" class="mb-1.5 block text-xs font-semibold text-slate-600">Email</label>' +
                  '<input id="input-email" name="email" type="email" autocomplete="username" ' +
                    'placeholder="nama@sekolah.sch.id" aria-describedby="galat-email" class="' + v.input({}) + '" />' +
                  '<p id="galat-email" class="mt-1 text-xs text-rose-600" hidden></p>' +
                '</div>' +

                '<div>' +
                  '<label for="input-password" class="mb-1.5 block text-xs font-semibold text-slate-600">Kata sandi</label>' +
                  '<div class="relative">' +
                    '<input id="input-password" name="password" type="password" autocomplete="current-password" ' +
                      'placeholder="Kata sandi" aria-describedby="galat-password" class="' + v.input({}) + ' pr-11" />' +
                    '<button type="button" id="tombol-lihat-sandi" aria-pressed="false" aria-label="Tampilkan kata sandi" ' +
                      'class="absolute right-1.5 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full text-slate-400 transition hover:bg-white hover:text-slate-700">' +
                      App.ikon('mata', 'h-4 w-4') +
                    '</button>' +
                  '</div>' +
                  '<p id="galat-password" class="mt-1 text-xs text-rose-600" hidden></p>' +
                '</div>' +

                '<button type="submit" id="tombol-masuk" class="' + v.tombol({ ukuran: 'lg', lebar: 'penuh' }) + '">' +
                  'Masuk' + App.ikon('panah', 'h-4 w-4') +
                '</button>' +
              '</form>' +

              '<section class="mt-5 border-t border-slate-100 pt-4">' +
                '<h3 class="px-3 text-[11px] font-semibold uppercase tracking-wide text-slate-400">Akun uji coba</h3>' +
                '<ul class="mt-1 space-y-0.5">' + AKUN_DEMO.map(barisAkun).join('') + '</ul>' +
              '</section>' +
            '</div>' +
          '</div>' +
        '</section>'
      );
    },

    mount: function () {
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
    }
  };
})(window.App);
