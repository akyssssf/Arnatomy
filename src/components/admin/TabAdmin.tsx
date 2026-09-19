"use client";

/* Client: tab dashboard admin di atas komponen Tabs (Radix) — pola WAI-ARIA
   Tabs (tablist/tab/tabpanel, roving tabindex, panah/Home/End) datang dari
   primitifnya. Tab aktif = client UI state di Zustand; jumlah laporan baru
   dari server state (TanStack Query). */
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLaporanKesalahan } from "@/hooks/useLaporanKesalahan";
import { type TabAdmin as JenisTab, useUIStore } from "@/store/useUIStore";
import { PanelKonten } from "./PanelKonten";
import { PanelLaporan } from "./PanelLaporan";

const TAB: { id: JenisTab; label: string }[] = [
  { id: "konten", label: "Konten Label" },
  { id: "laporan", label: "Laporan Kesalahan" },
];

function adalahTab(nilai: string): nilai is JenisTab {
  return TAB.some((t) => t.id === nilai);
}

export function TabAdmin() {
  const tabAktif = useUIStore((s) => s.tabAdminAktif);
  const setTabAdmin = useUIStore((s) => s.setTabAdmin);
  const { daftar: laporan } = useLaporanKesalahan({ aktif: true });
  const jumlahBaru = laporan.data?.filter((l) => l.status_tindak_lanjut === "baru").length ?? 0;

  return (
    <Tabs
      value={tabAktif}
      onValueChange={(nilai) => {
        if (adalahTab(nilai)) setTabAdmin(nilai);
      }}
    >
      <TabsList aria-label="Bagian dashboard">
        {TAB.map((t) => (
          <TabsTrigger key={t.id} value={t.id} id={`tab-${t.id}`}>
            {t.label}
            {t.id === "laporan" && jumlahBaru ? ` (${jumlahBaru})` : ""}
          </TabsTrigger>
        ))}
      </TabsList>
      <TabsContent value="konten" id="panel-konten">
        <PanelKonten />
      </TabsContent>
      <TabsContent value="laporan" id="panel-laporan">
        <PanelLaporan />
      </TabsContent>
    </Tabs>
  );
}
