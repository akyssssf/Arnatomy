/* POST /api/login — cek kredensial akun demo, set cookie sesi httpOnly (FR-01) */
import { NextResponse } from "next/server";
import { users } from "@/lib/data";
import { bacaBody, galat } from "@/lib/api-util";
import { jeda } from "@/lib/db";
import { LoginFormSchema, SesiUserSchema } from "@/lib/schemas";
import { NAMA_COOKIE, UMUR_COOKIE_DETIK, enkodeSesi } from "@/lib/sesi-codec";

export async function POST(request: Request) {
  const body = await bacaBody(request, LoginFormSchema);
  if (!body.ok) return body.respons;

  await jeda(500); // simulasi pengecekan ke basis data akun
  const akun = users.find(
    (u) => u.email.toLowerCase() === body.data.email.toLowerCase() && u.password === body.data.password,
  );
  if (!akun) return galat("Email atau kata sandi salah.", 401);

  const user = SesiUserSchema.parse(akun); // password ikut terbuang oleh omit
  const respons = NextResponse.json({ user });
  respons.cookies.set(NAMA_COOKIE, enkodeSesi(user), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: UMUR_COOKIE_DETIK,
    secure: process.env.NODE_ENV === "production",
  });
  return respons;
}
