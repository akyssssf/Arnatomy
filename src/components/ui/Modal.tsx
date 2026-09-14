"use client";

/* Client leaf: dialog modal aksesibel.
   role="dialog" + aria-modal + aria-labelledby, focus trap Tab/Shift+Tab,
   Escape untuk menutup, fokus dikembalikan ke pemicu saat ditutup. */
import { useEffect, useId, useRef } from "react";
import { Ikon } from "./Ikon";

const PEMILIH_FOKUS =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function Modal({ judul, onTutup, lebar = "max-w-lg", children }: {
  judul: string; onTutup: () => void; lebar?: string; children: React.ReactNode;
}) {
  const idJudul = useId();
  const kotak = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const pemicu = document.activeElement as HTMLElement | null;
    const akar = kotak.current;
    akar?.querySelector<HTMLElement>(PEMILIH_FOKUS)?.focus();

    function saatTombol(e: KeyboardEvent) {
      if (e.key === "Escape") { e.preventDefault(); onTutup(); return; }
      if (e.key !== "Tab" || !akar) return;
      const fokusable = [...akar.querySelectorAll<HTMLElement>(PEMILIH_FOKUS)].filter((el) => el.offsetParent !== null);
      const pertama = fokusable[0];
      const terakhir = fokusable[fokusable.length - 1];
      if (!pertama || !terakhir) return;
      if (e.shiftKey && document.activeElement === pertama) { e.preventDefault(); terakhir.focus(); }
      else if (!e.shiftKey && document.activeElement === terakhir) { e.preventDefault(); pertama.focus(); }
    }
    document.addEventListener("keydown", saatTombol, true);
    return () => {
      document.removeEventListener("keydown", saatTombol, true);
      pemicu?.focus?.();
    };
  }, [onTutup]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-neutral-900/45 p-4 sm:items-center"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onTutup(); }}>
      <section ref={kotak} role="dialog" aria-modal="true" aria-labelledby={idJudul}
        className={`w-full ${lebar} rounded-3xl bg-abu p-2`}>
        <header className="flex items-start justify-between gap-4 px-4 pb-2 pt-4">
          <h2 id={idJudul} className="titik-biru text-xl font-semibold">{judul}</h2>
          <button type="button" onClick={onTutup} aria-label="Tutup dialog"
            className="grid h-9 w-9 place-items-center rounded-full bg-white text-neutral-500 transition hover:text-neutral-900">
            <Ikon nama="silang" />
          </button>
        </header>
        <div className="rounded-2xl bg-white p-4">{children}</div>
      </section>
    </div>
  );
}
