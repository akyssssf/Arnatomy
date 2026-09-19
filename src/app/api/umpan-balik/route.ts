/* /api/umpan-balik — kuesioner SUS (FR-15).
   GET: admin melihat semua kiriman; pengguna biasa melihat kirimannya sendiri.
   POST: pengguna mengirim 10 jawaban Likert (+ komentar), skor dihitung server. */
import { NextResponse } from "next/server";
import { bacaBody, wajibSesi } from "@/lib/api-util";
import { jeda, semuaUmpanBalik, tambahUmpanBalik, umpanBalikUser } from "@/lib/db";
import { UmpanBalikFormSchema } from "@/lib/schemas";

export async function GET() {
  const auth = await wajibSesi();
  if (!auth.ok) return auth.respons;
  await jeda(300);
  if (auth.sesi.role === "admin") return NextResponse.json(semuaUmpanBalik());
  const milik = umpanBalikUser(auth.sesi.id_user);
  return NextResponse.json(milik ? [milik] : []);
}

export async function POST(request: Request) {
  const auth = await wajibSesi();
  if (!auth.ok) return auth.respons;
  const body = await bacaBody(request, UmpanBalikFormSchema);
  if (!body.ok) return body.respons;

  await jeda(500);
  const entri = tambahUmpanBalik(auth.sesi.id_user, body.data.jawaban, body.data.komentar ?? null);
  return NextResponse.json(entri, { status: 201 });
}
