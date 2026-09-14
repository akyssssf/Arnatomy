"use client";

/* Client leaf: organ 3D berputar pelan sebagai hero dekoratif.
   Three.js dimuat dinamis (import()) hanya di klien saat komponen dipasang,
   sehingga tidak masuk bundle awal halaman. Gambar statis di induk tetap
   tampil sampai model siap (kelas .hero-3d-siap), dan tetap tampil bila
   WebGL/model gagal. */
import { useEffect, useRef } from "react";

export function Hero3D({ urlModel, jarak = 1.5, kecepatanPutar = 0.7 }: {
  urlModel: string; jarak?: number; kecepatanPutar?: number;
}) {
  const wadah = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = wadah.current;
    if (!el) return;
    let dibatalkan = false;
    let hancurkan: (() => void) | null = null;

    (async () => {
      try {
        const { buatPenampil } = await import("@/three/viewer3d");
        if (dibatalkan) return;
        const penampil = await buatPenampil({ wadah: el, urlModel, titik: [], dekoratif: true, jarak, kecepatanPutar });
        if (dibatalkan) { penampil.bersihkan(); return; }
        hancurkan = penampil.bersihkan;
        el.parentElement?.classList.add("hero-3d-siap");
      } catch {
        /* Gambar statis tetap tampil sebagai pengganti */
      }
    })();

    return () => {
      dibatalkan = true;
      hancurkan?.();
      el.parentElement?.classList.remove("hero-3d-siap");
    };
  }, [urlModel, jarak, kecepatanPutar]);

  return <div ref={wadah} className="absolute inset-0" aria-hidden="true" />;
}
