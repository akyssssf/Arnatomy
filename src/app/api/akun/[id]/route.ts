/* /api/akun/[id] — FR-13: PATCH {aktif} menonaktifkan/mengaktifkan akun,
   DELETE menghapus akun beserta data belajarnya. Admin tidak dapat
   mengubah akunnya sendiri agar sistem tidak kehilangan administrator. */
import { NextResponse } from "next/server";
import { bacaBody, galat, idDariParam, wajibSesi } from "@/lib/api-util";
import { hapusAkun, jeda, setAkunAktif } from "@/lib/db";
import { AkunPatchSchema, UserIdSchema } from "@/lib/schemas";

export async function PATCH(request: Request, ctx: RouteContext<"/api/akun/[id]">) {
  const auth = await wajibSesi(["admin"]);
  if (!auth.ok) return auth.respons;
  const idUser = idDariParam((await ctx.params).id, UserIdSchema);
  if (idUser === null) return galat("id akun tidak valid.", 400);
  if (idUser === auth.sesi.id_user) return galat("Akun sendiri tidak dapat diubah dari sini.", 400);
  const body = await bacaBody(request, AkunPatchSchema);
  if (!body.ok) return body.respons;

  await jeda(300);
  const akun = await setAkunAktif(idUser, body.data.aktif);
  if (!akun) return galat("akun tidak ditemukan.", 404);
  return NextResponse.json(akun);
}

export async function DELETE(_request: Request, ctx: RouteContext<"/api/akun/[id]">) {
  const auth = await wajibSesi(["admin"]);
  if (!auth.ok) return auth.respons;
  const idUser = idDariParam((await ctx.params).id, UserIdSchema);
  if (idUser === null) return galat("id akun tidak valid.", 400);
  if (idUser === auth.sesi.id_user) return galat("Akun sendiri tidak dapat dihapus.", 400);

  await jeda(300);
  if (!(await hapusAkun(idUser))) return galat("akun tidak ditemukan.", 404);
  return NextResponse.json({ ok: true });
}
