/* PATCH /api/riwayat/:id — tutup entri riwayat; durasi dihitung server */
import { NextResponse } from "next/server";
import { galat, idDariParam, wajibSesi } from "@/lib/api-util";
import { tutupRiwayat } from "@/lib/db";

export async function PATCH(_request: Request, konteks: RouteContext<"/api/riwayat/[id]">) {
  const auth = await wajibSesi();
  if (!auth.ok) return auth.respons;
  const { id } = await konteks.params;
  const idRiwayat = idDariParam(id);
  if (!idRiwayat) return galat("id riwayat tidak valid.", 400);
  const entri = tutupRiwayat(auth.sesi.id_user, idRiwayat);
  if (!entri) return galat("entri riwayat tidak ditemukan.", 404);
  return NextResponse.json(entri);
}
