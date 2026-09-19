/* /api/logout — hapus cookie sesi dan bersihkan data belajar pengguna.
   POST: dipanggil tombol Keluar (balasan JSON).
   GET ?alasan=nonaktif: dipakai layout saat akun dinonaktifkan admin di
   tengah sesi; cookie dibuang lalu dialihkan ke /login dengan pesan. */
import { NextResponse } from "next/server";
import { ambilSesi } from "@/lib/auth";
import { bersihkanDataUser } from "@/lib/db";
import { NAMA_COOKIE } from "@/lib/sesi-codec";

async function bersihkan(): Promise<void> {
  const sesi = await ambilSesi();
  if (sesi) bersihkanDataUser(sesi.id_user);
}

export async function POST() {
  await bersihkan();
  const respons = NextResponse.json({ ok: true });
  respons.cookies.delete(NAMA_COOKIE);
  return respons;
}

export async function GET(request: Request) {
  await bersihkan();
  const alasan = new URL(request.url).searchParams.get("alasan") === "nonaktif" ? "nonaktif" : "keluar";
  const tujuan = new URL("/login", request.url);
  tujuan.searchParams.set("auth_error", alasan);
  const respons = NextResponse.redirect(tujuan, 303);
  respons.cookies.delete(NAMA_COOKIE);
  return respons;
}
