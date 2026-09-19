/* GET  /api/riwayat — riwayat belajar pengguna aktif
   POST /api/riwayat — catat pembukaan label (FR-14) */
import { NextResponse } from "next/server";
import { bacaBody, galat, wajibSesi } from "@/lib/api-util";
import { bagianById } from "@/lib/data";
import { catatRiwayat, jeda, riwayatUser } from "@/lib/db";
import { CatatRiwayatSchema } from "@/lib/schemas";

export async function GET() {
  const auth = await wajibSesi();
  if (!auth.ok) return auth.respons;
  await jeda(300);
  return NextResponse.json(riwayatUser(auth.sesi.id_user));
}

export async function POST(request: Request) {
  const auth = await wajibSesi();
  if (!auth.ok) return auth.respons;
  const body = await bacaBody(request, CatatRiwayatSchema);
  if (!body.ok) return body.respons;
  if (!bagianById(body.data.id_bagian)) return galat("bagian tubuh tidak ditemukan.", 404);
  return NextResponse.json(catatRiwayat(auth.sesi.id_user, body.data.id_bagian, body.data.jenis_konten), {
    status: 201,
  });
}
