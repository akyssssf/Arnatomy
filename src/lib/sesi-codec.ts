/* ==========================================================================
   sesi-codec.ts — Enkode/dekode isi cookie sesi.
   Dipakai proxy.ts (sebelum render) dan lib/auth.ts (Route Handler & RSC),
   jadi sengaja tanpa import "server-only" maupun API Node khusus.
   PROTOTIPE: cukup JSON yang di-base64url-kan, bukan JWT/hashing sungguhan.
   ========================================================================== */
import { SesiUserSchema, type SesiUser } from "./schemas";

export const NAMA_COOKIE = "arnatomy_sesi";
export const UMUR_COOKIE_DETIK = 60 * 60 * 8; // 8 jam

export function enkodeSesi(user: SesiUser): string {
  return Buffer.from(JSON.stringify(user), "utf8").toString("base64url");
}

/** Mengembalikan null bila cookie kosong, rusak, atau bentuknya tidak lolos skema. */
export function dekodeSesi(nilai: string | undefined): SesiUser | null {
  if (!nilai) return null;
  try {
    const teks = Buffer.from(nilai, "base64url").toString("utf8");
    const hasil = SesiUserSchema.safeParse(JSON.parse(teks));
    return hasil.success ? hasil.data : null;
  } catch {
    return null;
  }
}
