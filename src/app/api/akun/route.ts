/* GET /api/akun — daftar akun pengguna untuk dashboard admin (FR-13). */
import { NextResponse } from "next/server";
import { wajibSesi } from "@/lib/api-util";
import { jeda, semuaAkun } from "@/lib/db";

export async function GET() {
  const auth = await wajibSesi(["admin"]);
  if (!auth.ok) return auth.respons;
  await jeda(300);
  return NextResponse.json(await semuaAkun());
}
