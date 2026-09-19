/* /api/akun — FR-13. GET daftar akun; POST tambah akun (peran apa pun). Khusus admin. */
import { NextResponse } from "next/server";
import { bacaBody, galat, wajibSesi } from "@/lib/api-util";
import { jeda, semuaAkun, tambahAkunAdmin } from "@/lib/db";
import { AkunBuatSchema } from "@/lib/schemas";

export async function GET() {
  const auth = await wajibSesi(["admin"]);
  if (!auth.ok) return auth.respons;
  await jeda(300);
  return NextResponse.json(await semuaAkun());
}

export async function POST(request: Request) {
  const auth = await wajibSesi(["admin"]);
  if (!auth.ok) return auth.respons;
  const body = await bacaBody(request, AkunBuatSchema);
  if (!body.ok) return body.respons;

  await jeda(400);
  const akun = await tambahAkunAdmin(body.data);
  if (!akun) return galat("Email sudah terdaftar.", 409);
  return NextResponse.json(akun, { status: 201 });
}
