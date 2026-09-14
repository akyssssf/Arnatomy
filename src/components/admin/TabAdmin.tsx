"use client";

/* Client: tab dashboard admin mengikuti pola WAI-ARIA Tabs:
   role=tablist/tab/tabpanel, aria-selected, roving tabindex, navigasi
   panah kiri/kanan/Home/End. Tab aktif = client UI state di Zustand. */
import { useLaporanKesalahan } from "@/hooks/useLaporanKesalahan";
import { tab as kelasTab } from "@/lib/variants";
import { useUIStore, type TabAdmin as JenisTab } from "@/store/useUIStore";
import { PanelKonten } from "./PanelKonten";
import { PanelLaporan } from "./PanelLaporan";

const TAB: { id: JenisTab; label: string }[] = [
  { id: "konten", label: "Konten Label" },
  { id: "laporan", label: "Laporan Kesalahan" },
];

export function TabAdmin() {
  const tabAktif = useUIStore((s) => s.tabAdminAktif);
  const setTabAdmin = useUIStore((s) => s.setTabAdmin);
  const { daftar: laporan } = useLaporanKesalahan({ aktif: true });
  const jumlahBaru = laporan.data?.filter((l) => l.status_tindak_lanjut === "baru").length ?? 0;

  function pilih(id: JenisTab, fokus: boolean) {
    setTabAdmin(id);
    if (fokus) document.getElementById(`tab-${id}`)?.focus();
  }

  function saatTombol(e: React.KeyboardEvent<HTMLButtonElement>, indeks: number) {
    let tujuan: number | null = null;
    if (e.key === "ArrowRight") tujuan = (indeks + 1) % TAB.length;
    else if (e.key === "ArrowLeft") tujuan = (indeks - 1 + TAB.length) % TAB.length;
    else if (e.key === "Home") tujuan = 0;
    else if (e.key === "End") tujuan = TAB.length - 1;
    const t = tujuan === null ? undefined : TAB[tujuan];
    if (!t) return;
    e.preventDefault();
    pilih(t.id, true);
  }

  return (
    <>
      <div role="tablist" aria-label="Bagian dashboard" className="mb-5 inline-flex gap-1 rounded-full bg-white p-1">
        {TAB.map((t, i) => {
          const terpilih = t.id === tabAktif;
          return (
            <button key={t.id} type="button" role="tab" id={`tab-${t.id}`} aria-selected={terpilih}
              aria-controls={`panel-${t.id}`} tabIndex={terpilih ? 0 : -1}
              onClick={() => pilih(t.id, false)} onKeyDown={(e) => saatTombol(e, i)}
              className={kelasTab({ terpilih })}>
              {t.label}{t.id === "laporan" && jumlahBaru ? ` (${jumlahBaru})` : ""}
            </button>
          );
        })}
      </div>
      {TAB.map((t) => (
        <section key={t.id} role="tabpanel" id={`panel-${t.id}`} aria-labelledby={`tab-${t.id}`} tabIndex={0} hidden={t.id !== tabAktif}>
          {t.id === "konten" ? <PanelKonten /> : <PanelLaporan />}
        </section>
      ))}
    </>
  );
}
