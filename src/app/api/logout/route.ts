/* POST /api/logout — hapus cookie sesi dan bersihkan data belajar pengguna */
import { NextResponse } from "next/server";
import { ambilSesi } from "@/lib/auth";
import { bersihkanDataUser } from "@/lib/db";
import { NAMA_COOKIE } from "@/lib/sesi-codec";

export async function POST() {
  const sesi = await ambilSesi();
  if (sesi) bersihkanDataUser(sesi.id_user);
  const respons = NextResponse.json({ ok: true });
  respons.cookies.delete(NAMA_COOKIE);
  return respons;
}
