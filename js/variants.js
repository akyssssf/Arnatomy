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
    'inline-flex items-center justify-center gap-2 rounded-full font-medium transition ' +
      'disabled:cursor-not-allowed disabled:opacity-50',
    {
      variants: {
        variant: {
          utama: 'bg-[#1a6dff] text-white hover:bg-[#0d5cec]',
          sekunder: 'bg-neutral-900 text-white hover:bg-neutral-700',
          garis: 'bg-white text-neutral-900 hover:bg-neutral-100',
          halus: 'text-neutral-600 hover:bg-black/5 hover:text-neutral-900',
          bahaya: 'bg-amber-500 text-white hover:bg-amber-600'
        },
        ukuran: {
          sm: 'px-3.5 py-1.5 text-xs',
          md: 'px-5 py-2.5 text-sm',
          lg: 'px-6 py-3 text-sm'
        },
        lebar: { auto: '', penuh: 'w-full' }
      },
      defaultVariants: { variant: 'utama', ukuran: 'md', lebar: 'auto' }
    }
  );

  /* ---------------- Badge status ---------------- */
  const badge = cva(
    'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.08em]',
    {
      variants: {
        status: {
          draft: 'bg-amber-100 text-amber-800',
          tervalidasi: 'bg-emerald-100 text-emerald-800',
          baru: 'bg-[#1a6dff] text-white',
          ditindaklanjuti: 'bg-neutral-900 text-white',
          dasar: 'bg-black/5 text-neutral-600',
          dimmed: 'bg-neutral-900 text-white',
          netral: 'bg-black/5 text-neutral-500'
        }
      },
      defaultVariants: { status: 'netral' }
    }
  );

  /* ---------------- Kartu ---------------- */
  const kartu = cva('rounded-2xl', {
    variants: {
      nada: {
        netral: 'bg-white',
        brand: 'bg-[#1a6dff] text-white',
        aksen: 'bg-[#f1f2f4]'
      },
      interaktif: {
        true: 'transition hover:bg-[#fafafa]',
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
        user: 'ml-auto rounded-br-md bg-[#1a6dff] text-white',
        ai: 'mr-auto rounded-bl-md bg-[#f1f2f4] text-neutral-800',
        sistem: 'mx-auto bg-black/5 text-xs text-neutral-600'
      }
    },
    defaultVariants: { peran: 'ai' }
  });

  /* ---------------- Tombol toggle layer anatomi ---------------- */
  const toggleLayer = cva('whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium transition sm:px-3.5', {
    variants: {
      aktif: {
        true: 'bg-neutral-900 text-white',
        false: 'bg-white text-neutral-500 hover:text-neutral-900'
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
        info: 'bg-black/5 text-neutral-700'
      }
    },
    defaultVariants: { tipe: 'info' }
  });

  /* ---------------- Field input ---------------- */
  const input = cva(
    'w-full rounded-xl px-3.5 py-2.5 text-sm text-neutral-900 transition ' +
      'placeholder:text-neutral-400 focus:outline-none focus:ring-2',
    {
      variants: {
        keadaan: {
          normal: 'bg-[#f1f2f4] focus:bg-white focus:ring-[#1a6dff]',
          salah: 'bg-rose-50 ring-1 ring-rose-400 focus:ring-rose-500'
        }
      },
      defaultVariants: { keadaan: 'normal' }
    }
  );

  /* ---------------- Tab (dashboard admin) ---------------- */
  const tab = cva('rounded-full px-4 py-2 text-sm font-medium transition', {
    variants: {
      terpilih: {
        true: 'bg-neutral-900 text-white',
        false: 'text-neutral-500 hover:text-neutral-900'
      }
    },
    defaultVariants: { terpilih: 'false' }
  });

  App.cva = cva;
  App.v = { tombol, badge, kartu, bubble, toggleLayer, alert, input, tab };
})(window.App);
