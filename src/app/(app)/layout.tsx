/* Nested Layout kedua (Server Component) untuk area setelah login:
   navigasi kaca + footer dibagikan ke /beranda, /eksplorasi, /asisten,
   /riwayat, /admin dan TIDAK dirender ulang saat berpindah antar rute itu.
   Sesi dibaca dari cookie di server; proxy.ts sudah menjamin keberadaannya. */
import { redirect } from "next/navigation";
import { Footer } from "@/components/layout/Footer";
import { NavKaca } from "@/components/layout/NavKaca";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { ambilSesi } from "@/lib/auth";

export default async function LayoutAplikasi({ children }: LayoutProps<"/">) {
  const sesi = await ambilSesi();
  if (!sesi) redirect("/login?auth_error=1");

  /* QueryProvider hanya di segmen ini: halaman publik (landing/login) tidak
     memuat TanStack Query sama sekali (bundle klien lebih kecil). Keluar dari
     segmen (logout) melepas provider sehingga cache ikut dibuang. */
  return (
    <QueryProvider>
      <NavKaca user={sesi} />
      <main id="konten-utama" tabIndex={-1} className="mx-auto w-full max-w-6xl px-4 pb-16 pt-20 sm:px-6">
        {children}
      </main>
      <Footer />
    </QueryProvider>
  );
}
