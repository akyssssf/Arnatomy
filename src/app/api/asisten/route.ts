/* GET  /api/asisten — riwayat percakapan pengguna aktif
   POST /api/asisten — kirim pertanyaan; `simulasiGagal` memaksa 503 (FR-08, TC-07) */
import { NextResponse } from "next/server";
import { bacaBody, galat, wajibSesi } from "@/lib/api-util";
import { susunJawaban } from "@/lib/asisten";
import { bagianById } from "@/lib/data";
import { jeda, percakapanUser, tambahPercakapan } from "@/lib/db";
import { OpsiSimulasiSchema, PertanyaanFormSchema } from "@/lib/schemas";

export async function GET() {
  const auth = await wajibSesi();
  if (!auth.ok) return auth.respons;
  await jeda(400);
  return NextResponse.json(percakapanUser(auth.sesi.id_user));
}

export async function POST(request: Request) {
  const auth = await wajibSesi();
  if (!auth.ok) return auth.respons;
  const body = await bacaBody(request, PertanyaanFormSchema.extend(OpsiSimulasiSchema.shape));
  if (!body.ok) return body.respons;

  await jeda(900); // "asisten sedang mengetik"
  if (body.data.simulasiGagal) return galat("simulasi kegagalan koneksi ke layanan asisten AI.", 503);

  const bagian = bagianById(body.data.id_bagian);
  const jawaban = susunJawaban(body.data.pertanyaan, bagian);
  return NextResponse.json(
    tambahPercakapan(auth.sesi.id_user, bagian?.id_bagian ?? null, body.data.pertanyaan, jawaban),
    { status: 201 },
  );
}
