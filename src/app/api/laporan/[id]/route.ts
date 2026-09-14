/* PATCH /api/laporan/:id — tandai laporan ditindaklanjuti (admin, FR-11) */
import { NextResponse } from "next/server";
import { galat, idDariParam, wajibSesi } from "@/lib/api-util";
import { jeda, tindakLanjutiLaporan } from "@/lib/db";

export async function PATCH(_request: Request, konteks: RouteContext<"/api/laporan/[id]">) {
  const auth = await wajibSesi(["admin"]);
  if (!auth.ok) return auth.respons;
  const { id } = await konteks.params;
  const idLaporan = idDariParam(id);
  if (!idLaporan) return galat("id laporan tidak valid.", 400);

  await jeda(400);
  const laporan = tindakLanjutiLaporan(idLaporan);
  if (!laporan) return galat("laporan tidak ditemukan.", 404);
  return NextResponse.json(laporan);
}
