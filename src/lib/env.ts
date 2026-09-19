/* ==========================================================================
   env.ts — Isolasi variabel lingkungan.
   - Rahasia server (SESSION_SECRET) dibaca hanya di sini, divalidasi Zod,
     dan tidak pernah dikirim ke klien (tanpa awalan NEXT_PUBLIC_).
   - Variabel publik (NEXT_PUBLIC_*) boleh terbundel ke klien; hanya nilai
     tidak sensitif yang ditaruh di sana.
   Sengaja tanpa "server-only" agar bisa dipakai proxy.ts (berjalan di server
   sebelum render) — modul ini tetap tidak boleh diimpor komponen klien.
   ========================================================================== */
import { z } from "zod";

const EnvServerSchema = z.object({
  SESSION_SECRET: z
    .string()
    .min(32, "SESSION_SECRET minimal 32 karakter (lihat .env.example).")
    .default("arnatomy-dev-secret-jangan-dipakai-di-produksi-0123456789"),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
});

const EnvPublicSchema = z.object({
  NEXT_PUBLIC_APP_NAME: z.string().min(1).default("ARnatomy"),
  /* Asal situs untuk metadataBase, sitemap, robots, dan gambar Open Graph */
  NEXT_PUBLIC_SITE_URL: z.url().default("http://localhost:3000"),
});

/* Nilai NEXT_PUBLIC_* harus dirujuk secara literal supaya diganti saat build.
   String kosong diperlakukan seperti tidak diatur agar nilai bawaan berlaku. */
export const envPublic = EnvPublicSchema.parse({
  NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || undefined,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || undefined,
});

let cacheServer: z.infer<typeof EnvServerSchema> | null = null;

/** Variabel server, divalidasi sekali. Di produksi SESSION_SECRET wajib diisi. */
export function envServer(): z.infer<typeof EnvServerSchema> {
  if (cacheServer) return cacheServer;
  /* String kosong diperlakukan seperti tidak diatur agar nilai bawaan berlaku */
  const rahasia = process.env.SESSION_SECRET || undefined;
  if (process.env.NODE_ENV === "production" && !rahasia) {
    throw new Error("SESSION_SECRET wajib diatur di lingkungan produksi.");
  }
  const hasil = EnvServerSchema.parse({ SESSION_SECRET: rahasia, NODE_ENV: process.env.NODE_ENV || undefined });
  cacheServer = hasil;
  return hasil;
}
