/* ==========================================================================
   variants.js — Pola CVA (Class Variance Authority) manual
   Semua komponen dengan variasi tampilan (button, badge, card, bubble, dsb.)
   didefinisikan sekali di sini sebagai mapping `variant -> class Tailwind`,
   sehingga tidak ada rangkaian if-else class yang berulang di file halaman.
   ========================================================================== */
window.App = window.App || {};

(function (App) {
  'use strict';

  /**
   * Membuat fungsi penyusun class dari basis + peta varian.
   * @param {string} base kelas dasar yang selalu dipakai
   * @param {{variants?:Object, defaultVariants?:Object, compoundVariants?:Array}} konfigurasi
   * @returns {(props?:Object) => string}
   */
  function cva(base, konfigurasi) {
    const cfg = konfigurasi || {};
    const variants = cfg.variants || {};
    const defaultVariants = cfg.defaultVariants || {};
    const compoundVariants = cfg.compoundVariants || [];

    return function susun(props) {
      const opsi = Object.assign({}, defaultVariants, props || {});
      const kelas = [base];

      Object.keys(variants).forEach(function (namaVarian) {
        const nilai = opsi[namaVarian];
        const peta = variants[namaVarian];
        if (nilai !== undefined && nilai !== null && peta[String(nilai)]) {
          kelas.push(peta[String(nilai)]);
        }
      });

      compoundVariants.forEach(function (aturan) {
        const cocok = Object.keys(aturan).every(function (kunci) {
          return kunci === 'class' || opsi[kunci] === aturan[kunci];
        });
        if (cocok && aturan.class) kelas.push(aturan.class);
      });

      if (opsi.class) kelas.push(opsi.class);
      return kelas.join(' ').replace(/\s+/g, ' ').trim();
    };
  }

  /* ---------------- Tombol ---------------- */
  const tombol = cva(
    'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition ' +
      'disabled:cursor-not-allowed disabled:opacity-50',
    {
      variants: {
        variant: {
          utama: 'bg-blue-600 text-white shadow-[0_6px_16px_rgba(37,99,235,0.28)] hover:bg-blue-700',
          sekunder: 'bg-blue-50 text-blue-700 hover:bg-blue-100',
          garis: 'bg-white text-slate-600 shadow-[0_1px_3px_rgba(15,23,42,0.08)] hover:text-blue-700',
          halus: 'text-slate-500 hover:bg-slate-100 hover:text-slate-900',
          bahaya: 'bg-amber-500 text-white shadow-[0_6px_16px_rgba(245,158,11,0.28)] hover:bg-amber-600'
        },
        ukuran: {
          sm: 'px-3 py-1.5 text-xs',
          md: 'px-4 py-2.5 text-sm',
          lg: 'px-5 py-3 text-sm'
        },
        lebar: { auto: '', penuh: 'w-full' }
      },
      defaultVariants: { variant: 'utama', ukuran: 'md', lebar: 'auto' }
    }
  );

  /* ---------------- Badge status ---------------- */
  const badge = cva('inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold', {
    variants: {
      status: {
        draft: 'bg-amber-50 text-amber-700',
        tervalidasi: 'bg-emerald-50 text-emerald-700',
        baru: 'bg-rose-50 text-rose-600',
        ditindaklanjuti: 'bg-blue-50 text-blue-700',
        dasar: 'bg-slate-100 text-slate-600',
        dimmed: 'bg-indigo-50 text-indigo-600',
        netral: 'bg-slate-100 text-slate-500'
      }
    },
    defaultVariants: { status: 'netral' }
  });

  /* ---------------- Kartu ---------------- */
  const kartu = cva('rounded-2xl bg-white shadow-[0_2px_14px_rgba(30,58,138,0.06)]', {
    variants: {
      nada: {
        netral: '',
        brand: 'bg-gradient-to-br from-blue-600 to-blue-500 text-white shadow-[0_10px_30px_rgba(37,99,235,0.3)]',
        aksen: 'bg-blue-50 shadow-none'
      },
      interaktif: {
        true: 'transition hover:-translate-y-0.5 hover:shadow-[0_10px_26px_rgba(30,58,138,0.12)]',
        false: ''
      },
      padding: { sm: 'p-4', md: 'p-5', lg: 'p-6' }
    },
    defaultVariants: { nada: 'netral', interaktif: 'false', padding: 'md' }
  });

  /* ---------------- Bubble percakapan AI ---------------- */
  const bubble = cva('max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed', {
    variants: {
      peran: {
        user: 'ml-auto rounded-br-md bg-blue-600 text-white shadow-[0_4px_12px_rgba(37,99,235,0.25)]',
        ai: 'mr-auto rounded-bl-md bg-slate-100 text-slate-700',
        sistem: 'mx-auto bg-blue-50 text-xs text-blue-700'
      }
    },
    defaultVariants: { peran: 'ai' }
  });

  /* ---------------- Tombol toggle layer anatomi ---------------- */
  const toggleLayer = cva('rounded-full px-3.5 py-1.5 text-xs font-semibold transition', {
    variants: {
      aktif: {
        true: 'bg-blue-600 text-white shadow-[0_4px_12px_rgba(37,99,235,0.28)]',
        false: 'bg-slate-100 text-slate-500 hover:bg-slate-200'
      }
    },
    defaultVariants: { aktif: 'false' }
  });

  /* ---------------- Kotak pesan (alert) ---------------- */
  const alert = cva('flex items-start gap-2 rounded-xl px-3.5 py-2.5 text-sm', {
    variants: {
      tipe: {
        error: 'bg-rose-50 text-rose-700',
        sukses: 'bg-emerald-50 text-emerald-700',
        info: 'bg-blue-50 text-blue-700'
      }
    },
    defaultVariants: { tipe: 'info' }
  });

  /* ---------------- Field input ---------------- */
  const input = cva(
    'w-full rounded-xl px-3.5 py-2.5 text-sm text-slate-900 transition ' +
      'placeholder:text-slate-400 focus:outline-none focus:ring-2',
    {
      variants: {
        keadaan: {
          normal: 'bg-slate-100 focus:bg-white focus:ring-blue-500',
          salah: 'bg-rose-50 ring-1 ring-rose-400 focus:ring-rose-500'
        }
      },
      defaultVariants: { keadaan: 'normal' }
    }
  );

  /* ---------------- Tab (dashboard admin) ---------------- */
  const tab = cva('rounded-full px-4 py-2 text-sm font-semibold transition', {
    variants: {
      terpilih: {
        true: 'bg-blue-600 text-white shadow-[0_6px_16px_rgba(37,99,235,0.28)]',
        false: 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
      }
    },
    defaultVariants: { terpilih: 'false' }
  });

  App.cva = cva;
  App.v = { tombol, badge, kartu, bubble, toggleLayer, alert, input, tab };
})(window.App);
