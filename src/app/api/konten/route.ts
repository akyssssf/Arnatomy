/* GET /api/konten — seluruh konten label dasar & dimmed */
import { NextResponse } from "next/server";
import { wajibSesi } from "@/lib/api-util";
import { jeda, semuaKonten } from "@/lib/db";

export async function GET() {
  const auth = await wajibSesi();
  if (!auth.ok) return auth.respons;
  await jeda(500);
  return NextResponse.json(semuaKonten());
}
