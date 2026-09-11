/* ==========================================================================
   pages/asisten.js — Halaman Asisten AI (FR-08, TC-07)
   Percakapan sederhana dengan pemanggilan async/await ke endpoint mock,
   lengkap dengan loading state dan penanganan error.
   ========================================================================== */
window.App = window.App || {};
window.App.pages = window.App.pages || {};

(function (App) {
  'use strict';

  const ui = App.ui;
  const v = App.v;
  const ikon = App.ikon;

  const SARAN = [
    'Apa fungsi bagian ini?',
    'Di mana letaknya?',
    'Gangguan apa yang bisa terjadi?',
    'Apa bedanya dengan sisi jantung yang lain?'
  ];

  function bubble(peran, isi, waktu) {
    return (
      '<li class="flex">' +
        '<div class="' + v.bubble({ peran: peran }) + '">' +
          '<p>' + ui.esc(isi) + '</p>' +
          (waktu ? '<p class="mt-1 text-[10px] opacity-70">' + ui.esc(ui.formatWaktu(waktu)) + '</p>' : '') +
        '</div>' +
      '</li>'
    );
  }

  App.pages.asisten = {
    judul: 'Asisten AI',

    render: function (ctx) {
      const idBagian = ctx.query.bagian ? Number(ctx.query.bagian) : null;
      const opsiBagian = App.state.body_parts.map(function (b) {
        const terpilih = b.id_bagian === idBagian ? ' selected' : '';
        return '<option value="' + b.id_bagian + '"' + terpilih + '>' + ui.esc(b.nama_bagian_internal) + '</option>';
      }).join('');

      return (
        '<section aria-labelledby="judul-asisten" class="mx-auto max-w-4xl">' +
          ui.judulHalaman(
            'Asisten AI',
            'Jawaban disusun menurut bagian tubuh yang dipilih sebagai konteks, dengan bahasa untuk jenjang SMP dan SMA.',
            'judul-asisten',
            'Tanya jawab'
          ) +

          '<div class="' + v.kartu({ padding: 'md' }) + ' mb-3">' +
            '<div class="flex flex-wrap items-end gap-3">' +
              '<div class="min-w-[12rem] flex-1">' +
                '<label for="pilih-konteks" class="mikro mb-2 block">Konteks bagian tubuh</label>' +
                '<select id="pilih-konteks" class="' + v.input({}) + '">' +
                  '<option value="">Tanpa konteks</option>' + opsiBagian +
                '</select>' +
              '</div>' +
              '<a href="#/eksplorasi" class="' + v.tombol({ variant: 'sekunder', ukuran: 'sm' }) + '">' +
                ikon('jantung', 'h-4 w-4') + 'Kembali ke model' +
              '</a>' +
            '</div>' +
            '<label class="mt-3 flex items-center gap-2 rounded-xl bg-[#f1f2f4] px-3 py-2 text-xs text-neutral-500">' +
              '<input type="checkbox" id="simulasi-gagal" class="h-4 w-4 accent-[#1a6dff]" />' +
              'Simulasikan koneksi gagal untuk menguji penanganan error' +
            '</label>' +
          '</div>' +

          '<div class="' + v.kartu({ padding: 'md' }) + ' mt-4 flex h-[26rem] flex-col sm:h-[30rem]">' +
            '<ul id="riwayat-chat" class="flex-1 space-y-2 overflow-y-auto pr-1" ' +
              'aria-live="polite" aria-atomic="false" aria-label="Riwayat percakapan dengan asisten AI"></ul>' +
            '<div id="galat-chat" role="alert" aria-live="assertive" class="mt-3" hidden></div>' +

            '<ul class="mt-3 flex flex-wrap gap-2">' +
              SARAN.map(function (s) {
                return '<li><button type="button" data-saran class="rounded-full bg-[#f1f2f4] px-3 py-1.5 text-xs ' +
                  'font-medium text-neutral-500 transition hover:bg-neutral-900 hover:text-white">' + ui.esc(s) + '</button></li>';
              }).join('') +
            '</ul>' +

            '<form id="form-chat" class="mt-3 flex items-end gap-2 border-t border-black/5 pt-3">' +
              '<div class="flex-1">' +
                '<label for="input-pertanyaan" class="sr-only">Tulis pertanyaan untuk asisten AI</label>' +
                '<textarea id="input-pertanyaan" rows="2" placeholder="Tulis pertanyaan, tekan Enter untuk mengirim" ' +
                  'class="' + v.input({}) + ' resize-none"></textarea>' +
              '</div>' +
              '<button type="submit" id="tombol-kirim" class="' + v.tombol({ ukuran: 'md' }) + '">' +
                ikon('kirim', 'h-4 w-4') + 'Kirim' +
              '</button>' +
            '</form>' +
          '</div>' +
        '</section>'
      );
    },

    mount: function (ctx) {
      const daftar = document.getElementById('riwayat-chat');
      const form = document.getElementById('form-chat');
      const input = document.getElementById('input-pertanyaan');
      const tombolKirim = document.getElementById('tombol-kirim');
      const galat = document.getElementById('galat-chat');
      const pilihKonteks = document.getElementById('pilih-konteks');
      const cekGagal = document.getElementById('simulasi-gagal');

      cekGagal.checked = App.api.konfigurasi.simulasiGagal;
      cekGagal.addEventListener('change', function () {
        App.api.konfigurasi.simulasiGagal = cekGagal.checked;
      });

      function bagianTerpilih() {
        const nilai = pilihKonteks.value;
        return nilai ? App.aksi.bagianById(Number(nilai)) : null;
      }

      function gulirKeBawah() { daftar.scrollTop = daftar.scrollHeight; }

      function gambarPercakapan() {
        const bagian = bagianTerpilih();
        const sapaan = bagian
          ? 'Konteks saat ini: ' + bagian.nama_bagian_internal + '. Silakan ajukan pertanyaan.'
          : 'Belum ada konteks bagian tubuh yang dipilih. Pilih pada daftar di atas terlebih dahulu.';

        let isi = bubble('ai', sapaan, null);
        App.state.ai_conversations.forEach(function (p) {
          isi += bubble('user', p.pertanyaan, p.waktu);
          isi += bubble('ai', p.jawaban, p.waktu);
        });
        daftar.innerHTML = isi;
        gulirKeBawah();
      }

      function tampilkanMengetik() {
        const li = document.createElement('li');
        li.id = 'indikator-mengetik';
        li.className = 'flex';
        li.innerHTML =
          '<div class="' + v.bubble({ peran: 'ai' }) + '">' +
            '<span class="text-xs text-neutral-400">Asisten sedang mengetik...</span>' +
          '</div>';
        daftar.appendChild(li);
        gulirKeBawah();
      }

      function sembunyikanMengetik() {
        const el = document.getElementById('indikator-mengetik');
        if (el) el.remove();
      }

      /* Pemanggilan async dengan loading state + try/catch (FR-08) */
      async function kirimPertanyaan(pertanyaan) {
        galat.hidden = true;
        const bagian = bagianTerpilih();

        daftar.insertAdjacentHTML('beforeend', bubble('user', pertanyaan, new Date()));
        gulirKeBawah();

        input.value = '';
        input.disabled = true;
        tombolKirim.disabled = true;
        tombolKirim.innerHTML = ui.spinner() + ' Kirim';
        tampilkanMengetik();

        try {
          const jawaban = await App.api.tanyaAsisten(pertanyaan, bagian);
          App.aksi.tambahPercakapan(bagian ? bagian.id_bagian : null, pertanyaan, jawaban);
          sembunyikanMengetik();
          daftar.insertAdjacentHTML('beforeend', bubble('ai', jawaban, new Date()));
        } catch (kesalahan) {
          sembunyikanMengetik();
          galat.className = v.alert({ tipe: 'error' }) + ' items-center justify-between';
          galat.innerHTML =
            '<span>Gagal memuat jawaban: ' + ui.esc(kesalahan.message) + '</span>' +
            '<button type="button" data-ulangi class="' + v.tombol({ variant: 'sekunder', ukuran: 'sm' }) + '">Coba lagi</button>';
          galat.hidden = false;
          galat.querySelector('[data-ulangi]').addEventListener('click', function () {
            kirimPertanyaan(pertanyaan);
          });
        } finally {
          input.disabled = false;
          tombolKirim.disabled = false;
          tombolKirim.innerHTML = ikon('kirim', 'h-4 w-4') + 'Kirim';
          gulirKeBawah();
        }
      }

      form.addEventListener('submit', function (e) {
        e.preventDefault();
        const teks = input.value.trim();
        if (!teks) {
          galat.className = v.alert({ tipe: 'info' });
          galat.textContent = 'Tulis pertanyaan terlebih dahulu.';
          galat.hidden = false;
          input.focus();
          return;
        }
        kirimPertanyaan(teks);
      });

      /* Enter untuk kirim, Shift+Enter untuk baris baru */
      input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          form.requestSubmit ? form.requestSubmit() : form.dispatchEvent(new Event('submit', { cancelable: true }));
        }
      });

      Array.prototype.forEach.call(document.querySelectorAll('[data-saran]'), function (tombol) {
        tombol.addEventListener('click', function () {
          input.value = tombol.textContent;
          input.focus();
        });
      });

      pilihKonteks.addEventListener('change', gambarPercakapan);
      gambarPercakapan();

      if (ctx.query.bagian) input.focus();
    }
  };
})(window.App);
