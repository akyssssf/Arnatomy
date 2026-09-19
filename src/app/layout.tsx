/* Root Layout (Server Component): fon via next/font/local (CLS aman), Metadata API
   statis dengan template judul, skip link, penyedia TanStack Query, toaster. */
import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Toaster } from "@/components/ui/Toaster";
import "./globals.css";

/* Fon variabel di-host sendiri (next/font/local): tanpa permintaan ke Google
   Fonts saat build/runtime, ukuran fallback dihitung otomatis -> CLS aman. */
const inter = localFont({
  src: "./fonts/inter-latin-wght-normal.woff2",
  variable: "--font-inter",
  weight: "100 900",
  display: "swap",
});
/* Fon judul tidak di-preload: di jaringan lambat ia tidak bersaing bandwidth
   dengan gambar LCP; judul tampil dengan fallback yang sudah disesuaikan
   metriknya (size-adjust dari next/font) lalu bertukar tanpa CLS. */
const interTight = localFont({
  src: "./fonts/inter-tight-latin-wght-normal.woff2",
  variable: "--font-inter-tight",
  weight: "100 900",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  title: { default: "ARnatomy", template: "%s | ARnatomy" },
  description: "Belajar anatomi lewat model organ 3D interaktif untuk siswa SMP dan SMA.",
  keywords: ["anatomi", "AR", "jantung", "paru-paru", "pembelajaran", "SMP", "SMA"],
  authors: [{ name: "Tim ARnatomy, D3 Teknik Informatika SV UNS" }],
};

export const viewport: Viewport = { themeColor: "#e6e8eb", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id" className={`${inter.variable} ${interTight.variable} h-full antialiased`}>
      <body className="min-h-full bg-latar text-neutral-900">
        <a href="#konten-utama" className="tautan-lewati">
          Lewati ke konten utama
        </a>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
