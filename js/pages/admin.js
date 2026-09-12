/* ==========================================================================
   pages/admin.js — Dashboard Administrator (FR-10 & FR-11)
   Tab 1: daftar konten label dengan badge status draft/tervalidasi + form edit.
   Tab 2: daftar laporan kesalahan konten dari User beserta tindak lanjutnya.
   Pola tab mengikuti WAI-ARIA: role=tablist/tab/tabpanel + navigasi panah.
   ========================================================================== */
window.App = window.App || {};
window.App.pages = window.App.pages || {};

(function (App) {
  'use strict';

  const ui = App.ui;
  const v = App.v;
  const ikon = App.ikon;

  const TAB = [
    { id: 'konten',  label: 'Konten Label' },
    { id: 'laporan', label: 'Laporan Kesalahan' }
  ];
  let tabAktif = 'konten';

  /* ---------------- Panel: daftar konten ---------------- */
  function barisKonten(konten) {
    const bagian = App.aksi.bagianById(konten.id_bagian);
    const organ = App.aksi.organById(bagian.id_organ);
    return (
      '<tr class="border-b border-black/5 last:border-0">' +
        '<th scope="row" class="px-3 py-3 text-left align-top">' +
          '<span class="block text-sm font-semibold">' + ui.esc(konten.judul_tampil) + '</span>' +
          '<span class="block text-xs text-neutral-400">' + ui.esc(bagian.nama_bagian_internal) + ' &middot; ' + ui.esc(organ.nama_organ) + '</span>' +
        '</th>' +
        '<td class="px-3 py-3 align-top">' +
          '<span class="' + v.badge({ status: konten.jenis_konten }) + '">' + ui.esc(konten.jenis_konten) + '</span>' +
        '</td>' +
        '<td class="hidden max-w-md px-3 py-3 align-top text-xs leading-relaxed text-neutral-500 lg:table-cell">' +
          ui.esc(konten.deskripsi.slice(0, 110)) + (konten.deskripsi.length > 110 ? '...' : '') +
        '</td>' +
        '<td class="px-3 py-3 align-top">' +
          '<span class="' + v.badge({ status: konten.status_validasi }) + '">' + ui.esc(konten.status_validasi) + '</span>' +
        '</td>' +
        '<td class="px-3 py-3 align-top text-right">' +
          '<button type="button" data-edit-konten="' + konten.id_konten + '" class="' + v.tombol({ variant: 'sekunder', ukuran: 'sm' }) + '">Edit</button>' +
        '</td>' +
      '</tr>'
    );
  }

  function panelKonten() {
    const daftar = App.state.part_content;
    const draft = daftar.filter(function (k) { return k.status_validasi === 'draft'; }).length;

    return (
      '<div class="mb-4 grid gap-4 sm:grid-cols-3">' +
        '<div class="' + v.kartu({ nada: 'aksen', padding: 'md' }) + '">' +
          '<p class="mikro">Total konten</p>' +
          '<p class="mt-3 text-4xl font-semibold tracking-tight">' + daftar.length + '</p></div>' +
        '<div class="' + v.kartu({ nada: 'aksen', padding: 'md' }) + '">' +
          '<p class="mikro">Masih draft</p>' +
          '<p class="mt-3 text-4xl font-semibold tracking-tight text-amber-700">' + draft + '</p></div>' +
        '<div class="' + v.kartu({ nada: 'aksen', padding: 'md' }) + '">' +
          '<p class="mikro">Tervalidasi</p>' +
          '<p class="mt-3 text-4xl font-semibold tracking-tight text-emerald-700">' + (daftar.length - draft) + '</p></div>' +
      '</div>' +

      '<div class="muncul ' + v.kartu({ padding: 'sm' }) + ' overflow-x-auto">' +
        '<table class="w-full min-w-[38rem] border-collapse text-left">' +
          '<caption class="sr-only">Daftar konten label dasar dan dimmed beserta status validasinya</caption>' +
          '<thead><tr class="border-b border-black/5 text-[11px] uppercase tracking-wide text-neutral-400">' +
            '<th scope="col" class="px-3 py-2.5 font-semibold">Judul dan bagian</th>' +
            '<th scope="col" class="px-3 py-2.5 font-semibold">Jenis</th>' +
            '<th scope="col" class="hidden px-3 py-2.5 font-semibold lg:table-cell">Cuplikan deskripsi</th>' +
            '<th scope="col" class="px-3 py-2.5 font-semibold">Status</th>' +
            '<th scope="col" class="px-3 py-2.5 text-right font-semibold">Aksi</th>' +
          '</tr></thead>' +
          '<tbody>' + daftar.map(barisKonten).join('') + '</tbody>' +
        '</table>' +
      '</div>'
    );
  }

  /* ---------------- Panel: laporan kesalahan ---------------- */
  function kartuLaporan(laporan) {
    const konten = App.aksi.kontenById(laporan.id_konten);
    const bagian = konten ? App.aksi.bagianById(konten.id_bagian) : null;
    const selesai = laporan.status_tindak_lanjut === 'ditindaklanjuti';
    return (
      '<li class="muncul ' + v.kartu({ padding: 'md' }) + '">' +
        '<div class="flex flex-wrap items-start justify-between gap-2">' +
          '<div>' +
            '<h3 class="text-sm font-bold">' + ui.esc(konten ? konten.judul_tampil : 'Konten tidak ditemukan') + '</h3>' +
            '<p class="text-xs text-neutral-400">' +
              (bagian ? ui.esc(bagian.nama_bagian_internal) + ', ' : '') +
              'Dilaporkan ' + ui.esc(ui.formatWaktu(laporan.waktu)) +
            '</p>' +
          '</div>' +
          '<span class="' + v.badge({ status: selesai ? 'ditindaklanjuti' : 'baru' }) + '">' +
            ui.esc(laporan.status_tindak_lanjut) +
          '</span>' +
        '</div>' +
        '<p class="mt-3 rounded-xl bg-[#f1f2f4] px-3.5 py-2.5 text-sm leading-relaxed text-neutral-500">' +
          ui.esc(laporan.deskripsi_laporan) +
        '</p>' +
        '<div class="mt-3 flex flex-wrap gap-2">' +
          (konten
            ? '<button type="button" data-edit-konten="' + konten.id_konten + '" class="' + v.tombol({ variant: 'sekunder', ukuran: 'sm' }) + '">Perbaiki konten</button>'
            : '') +
          (selesai
            ? ''
            : '<button type="button" data-tindak-lanjut="' + laporan.id_laporan + '" class="' + v.tombol({ variant: 'bahaya', ukuran: 'sm' }) + '">Tandai ditindaklanjuti</button>') +
        '</div>' +
      '</li>'
    );
  }

  function panelLaporan() {
    const daftar = App.state.laporan_kesalahan;
    if (!daftar.length) {
      return ui.kondisiKosong(
        'Belum ada laporan masuk',
        'Laporan muncul di sini setelah User mengirim formulir laporan kesalahan pada halaman Eksplorasi.',
        '<a href="#/eksplorasi" class="' + v.tombol({ variant: 'garis', ukuran: 'sm' }) + '">Buka halaman Eksplorasi</a>'
      );
    }
    return '<ul class="space-y-3">' + daftar.map(kartuLaporan).join('') + '</ul>';
  }

  /* ---------------- Halaman ---------------- */
  App.pages.admin = {
    judul: 'Dashboard Admin',
    peran: ['admin'],

    render: function () {
      const tombolTab = TAB.map(function (t) {
        const terpilih = t.id === tabAktif;
        const jumlah = t.id === 'laporan'
          ? App.state.laporan_kesalahan.filter(function (l) { return l.status_tindak_lanjut === 'baru'; }).length
          : 0;
        return (
          '<button type="button" role="tab" id="tab-' + t.id + '" data-tab="' + t.id + '" ' +
            'aria-selected="' + String(terpilih) + '" aria-controls="panel-' + t.id + '" ' +
            'tabindex="' + (terpilih ? '0' : '-1') + '" class="' + v.tab({ terpilih: String(terpilih) }) + '">' +
            ui.esc(t.label) +
            (jumlah ? ' (' + jumlah + ')' : '') +
          '</button>'
        );
      }).join('');

      const panel = TAB.map(function (t) {
        return (
          '<section role="tabpanel" id="panel-' + t.id + '" aria-labelledby="tab-' + t.id + '" ' +
            'tabindex="0"' + (t.id === tabAktif ? '' : ' hidden') + '>' +
            (t.id === 'konten' ? panelKonten() : panelLaporan()) +
          '</section>'
        );
      }).join('');

      return (
        '<section aria-labelledby="judul-admin">' +
          ui.judulHalaman('Dashboard Admin',
            'Kelola konten label anatomi dan tindak lanjuti laporan kesalahan dari User.',
            'judul-admin', 'Administrator') +
          '<div role="tablist" aria-label="Bagian dashboard" ' +
            'class="mb-5 inline-flex gap-1 rounded-full bg-white p-1">' +
            tombolTab +
          '</div>' +
          panel +
        '</section>'
      );
    },

    mount: function () {
      const tabs = Array.prototype.slice.call(document.querySelectorAll('[role="tab"]'));

      function pilihTab(id, fokus) {
        tabAktif = id;
        tabs.forEach(function (t) {
          const terpilih = t.getAttribute('data-tab') === id;
          t.setAttribute('aria-selected', String(terpilih));
          t.setAttribute('tabindex', terpilih ? '0' : '-1');
          t.className = v.tab({ terpilih: String(terpilih) });
          document.getElementById('panel-' + t.getAttribute('data-tab')).hidden = !terpilih;
          if (terpilih && fokus) t.focus();
        });
      }

      tabs.forEach(function (tab, indeks) {
        tab.addEventListener('click', function () { pilihTab(tab.getAttribute('data-tab'), false); });

        /* Navigasi keyboard antar tab sesuai pola WAI-ARIA */
        tab.addEventListener('keydown', function (e) {
          let tujuan = null;
          if (e.key === 'ArrowRight') tujuan = tabs[(indeks + 1) % tabs.length];
          else if (e.key === 'ArrowLeft') tujuan = tabs[(indeks - 1 + tabs.length) % tabs.length];
          else if (e.key === 'Home') tujuan = tabs[0];
          else if (e.key === 'End') tujuan = tabs[tabs.length - 1];
          if (!tujuan) return;
          e.preventDefault();
          pilihTab(tujuan.getAttribute('data-tab'), true);
        });
      });

      Array.prototype.forEach.call(document.querySelectorAll('[data-edit-konten]'), function (tombol) {
        tombol.addEventListener('click', function () {
          bukaFormEdit(Number(tombol.getAttribute('data-edit-konten')));
        });
      });

      Array.prototype.forEach.call(document.querySelectorAll('[data-tindak-lanjut]'), function (tombol) {
        tombol.addEventListener('click', function () {
          App.aksi.tindakLanjutiLaporan(Number(tombol.getAttribute('data-tindak-lanjut')));
          ui.toast('Laporan ditandai ditindaklanjuti.', 'sukses');
          App.router.muatUlang();
        });
      });
    }
  };

  /* ---------------- Form edit konten (FR-10) ---------------- */
  function bukaFormEdit(idKonten) {
    const konten = App.aksi.kontenById(idKonten);
    if (!konten) return;
    const bagian = App.aksi.bagianById(konten.id_bagian);

    App.ui.bukaModal({
      judul: 'Edit konten label',
      isi:
        '<form id="form-konten" novalidate class="space-y-3">' +
          '<p class="mikro">' + ui.esc(bagian.nama_bagian_internal) + ' &middot; ' + ui.esc(konten.jenis_konten) + '</p>' +
          '<div>' +
            '<label for="edit-judul" class="mikro mb-2 block">Judul tampil</label>' +
            '<input id="edit-judul" type="text" value="' + ui.esc(konten.judul_tampil) + '" class="' + v.input({}) + '" />' +
          '</div>' +
          '<div>' +
            '<label for="edit-deskripsi" class="mikro mb-2 block">Deskripsi</label>' +
            '<textarea id="edit-deskripsi" rows="6" aria-describedby="galat-konten" class="' + v.input({}) + '">' + ui.esc(konten.deskripsi) + '</textarea>' +
            '<p id="galat-konten" class="mt-1 text-xs text-red-700" hidden></p>' +
          '</div>' +
          '<div>' +
            '<label for="edit-status" class="mikro mb-2 block">Status validasi</label>' +
            '<select id="edit-status" class="' + v.input({}) + '">' +
              '<option value="draft"' + (konten.status_validasi === 'draft' ? ' selected' : '') + '>draft</option>' +
              '<option value="tervalidasi"' + (konten.status_validasi === 'tervalidasi' ? ' selected' : '') + '>tervalidasi</option>' +
            '</select>' +
          '</div>' +
          '<button type="submit" class="' + v.tombol({ lebar: 'penuh' }) + '">Simpan perubahan</button>' +
        '</form>',
      saatPasang: function (root, tutup) {
        const form = root.querySelector('#form-konten');
        const deskripsi = root.querySelector('#edit-deskripsi');
        const galat = root.querySelector('#galat-konten');

        form.addEventListener('submit', function (e) {
          e.preventDefault();
          const teks = deskripsi.value.trim();
          if (teks.length < 20) {
            galat.textContent = 'Deskripsi minimal 20 karakter.';
            galat.hidden = false;
            deskripsi.setAttribute('aria-invalid', 'true');
            deskripsi.focus();
            return;
          }
          App.aksi.perbaruiKonten(idKonten, {
            judul_tampil: root.querySelector('#edit-judul').value.trim() || konten.judul_tampil,
            deskripsi: teks,
            status_validasi: root.querySelector('#edit-status').value
          });
          tutup();
          ui.toast('Konten label diperbarui.', 'sukses');
          App.router.muatUlang();
        });
      }
    });
  }
})(window.App);
