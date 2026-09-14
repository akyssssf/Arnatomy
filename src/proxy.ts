/* ==========================================================================
   proxy.ts — Proteksi rute di sisi server SEBELUM halaman dirender.
   (Next.js 16 mengganti nama konvensi `middleware.ts` menjadi `proxy.ts`;
   isinya sama persis: baca cookie, cocokkan matcher, lalu redirect.)

   Aturan:
   - Rute terproteksi tanpa cookie sesi  -> /login?auth_error=1&next=<rute>
   - /admin oleh peran selain admin      -> /beranda?pesan=khusus-admin
   - /login saat sudah masuk             -> /beranda
   ========================================================================== */
import { NextResponse, type NextRequest } from "next/server";
import { NAMA_COOKIE, dekodeSesi } from "@/lib/sesi-codec";

const RUTE_TERPROTEKSI = ["/beranda", "/eksplorasi", "/asisten", "/riwayat", "/admin"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sesi = dekodeSesi(request.cookies.get(NAMA_COOKIE)?.value);
  const terproteksi = RUTE_TERPROTEKSI.some((r) => pathname === r || pathname.startsWith(`${r}/`));

  if (terproteksi && !sesi) {
    const tujuan = new URL("/login", request.url);
    tujuan.searchParams.set("auth_error", "1");
    tujuan.searchParams.set("next", pathname);
    const respons = NextResponse.redirect(tujuan);
    /* Cookie rusak/kedaluwarsa ikut dibersihkan */
    respons.cookies.delete(NAMA_COOKIE);
    return respons;
  }

  if (pathname.startsWith("/admin") && sesi && sesi.role !== "admin") {
    const tujuan = new URL("/beranda", request.url);
    tujuan.searchParams.set("pesan", "khusus-admin");
    return NextResponse.redirect(tujuan);
  }

  if (pathname === "/login" && sesi) {
    return NextResponse.redirect(new URL(sesi.role === "admin" ? "/admin" : "/beranda", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/beranda/:path*", "/eksplorasi/:path*", "/asisten/:path*", "/riwayat/:path*", "/admin/:path*", "/login"],
};
