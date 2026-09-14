/* Dashboard Administrator (FR-10 & FR-11). Server Component: memeriksa
   peran (lapisan kedua setelah proxy.ts), lalu MEM-PREFETCH query
   ['konten'] dan ['laporan'] di server dan mengirimnya lewat
   HydrationBoundary sehingga useQuery di klien langsung terisi tanpa
   loading tambahan. loading.tsx tampil selama prefetch berjalan. */
import { HydrationBoundary, QueryClient, dehydrate } from "@tanstack/react-query";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { TabAdmin } from "@/components/admin/TabAdmin";
import { JudulHalaman } from "@/components/ui/JudulHalaman";
import { KUNCI } from "@/hooks/kunci-query";
import { ambilSesi } from "@/lib/auth";
import { jeda, semuaKonten, semuaLaporan } from "@/lib/db";

export const metadata: Metadata = {
  title: "Dashboard Admin",
  description: "Kelola konten label anatomi dan tindak lanjuti laporan kesalahan dari pengguna.",
};

export default async function HalamanAdmin() {
  const sesi = await ambilSesi();
  if (!sesi || sesi.role !== "admin") redirect("/beranda?pesan=khusus-admin");

  const queryClient = new QueryClient();
  await jeda(500);
  await Promise.all([
    queryClient.prefetchQuery({ queryKey: KUNCI.konten, queryFn: () => semuaKonten() }),
    queryClient.prefetchQuery({ queryKey: KUNCI.laporan, queryFn: () => semuaLaporan() }),
  ]);

  return (
    <section aria-labelledby="judul-admin" className="halaman-masuk">
      <JudulHalaman judul="Dashboard Admin" deskripsi="Kelola konten label anatomi dan tindak lanjuti laporan kesalahan dari User."
        id="judul-admin" kicker="Administrator" />
      <HydrationBoundary state={dehydrate(queryClient)}>
        <TabAdmin />
      </HydrationBoundary>
    </section>
  );
}
