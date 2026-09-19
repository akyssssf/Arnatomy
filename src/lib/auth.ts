/* ==========================================================================
   auth.ts — Membaca sesi dari cookie httpOnly di sisi server.
   "server-only" memastikan modul ini tidak pernah terbundel ke klien.
   ========================================================================== */
import "server-only";
import { cookies } from "next/headers";
import type { SesiUser } from "./schemas";
import { dekodeSesi, NAMA_COOKIE } from "./sesi-codec";

/** Sesi pengguna aktif, atau null bila belum masuk. */
export async function ambilSesi(): Promise<SesiUser | null> {
  const toko = await cookies();
  return await dekodeSesi(toko.get(NAMA_COOKIE)?.value);
}
