/* Halaman Login (Server Component pembungkus). Hero, statistik, dan kartu
   dirender di server; hanya FormLogin (state + Zod) dan Hero3D yang klien.
   Pesan dari proxy (?auth_error=1) dibaca lewat searchParams. */
import type { Metadata } from "next";
import Link from "next/link";
import { KepalaTamu } from "@/components/layout/KepalaTamu";
import { FormLogin } from "@/components/login/FormLogin";
import { HeroLogin } from "@/components/login/HeroLogin";
import { Muncul } from "@/components/motion/Muncul";
import { Marquee } from "@/components/ui/Marquee";
import { body_parts, organs, part_content_awal } from "@/lib/data";
import { kartu } from "@/lib/variants";

export const metadata: Metadata = {
  title: "Masuk",
  description: "Masuk ke ARnatomy dengan akun siswa, guru, atau administrator.",
};

export default async function HalamanLogin(props: PageProps<"/login">) {
  const query = await props.searchParams;
  const pesanAuth: Record<string, string> = {
    "1": "Masuk dulu untuk membuka halaman itu.",
    nonaktif: "Akun ini dinonaktifkan oleh administrator. Hubungi pengelola untuk mengaktifkannya kembali.",
    keluar: "Sesi sudah diakhiri. Silakan masuk kembali.",
  };
  const pesanAwal = typeof query.auth_error === "string" ? (pesanAuth[query.auth_error] ?? null) : null;
  const tujuan = typeof query.next === "string" ? query.next : null;
  const organ = organs[0];
  if (!organ) throw new Error("data organ awal tidak lengkap.");

  return (
    <main id="konten-utama" tabIndex={-1} className="halaman-masuk mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6">
      <section aria-labelledby="judul-login" className="pb-6">
        <KepalaTamu tautan={{ href: "/daftar", label: "Belum punya akun? Daftar" }} />

        <HeroLogin
          organ={organ}
          jumlahOrgan={organs.length}
          jumlahBagian={body_parts.length}
          jumlahLabel={part_content_awal.length}
        />

        <Muncul kelas="mt-10">
          <Marquee
            daftar={["Sistem Peredaran Darah", "Model Organ 3D", "Label Interaktif", "Asisten AI", "Riwayat Belajar"]}
            label="Fitur"
          />
        </Muncul>

        <div id="form-login" className="mt-8 grid scroll-mt-24 gap-4 lg:grid-cols-[1fr_1.15fr]">
          <Muncul kelas={`${kartu({ nada: "aksen", padding: "lg" })} flex flex-col justify-between`}>
            <div>
              <p className="mikro">Masuk</p>
              <h2 className="titik-biru mt-3 text-3xl font-semibold">Gunakan akun terdaftar</h2>
            </div>
            <div className="mt-8 space-y-3">
              <p className="text-xs leading-relaxed text-neutral-500">
                Tekan Siswa, Guru, atau Administrator untuk mengisi form otomatis. Sesi disimpan di cookie httpOnly;
                data belajar hidup di memori server selama sesi dan dibuang saat keluar.
              </p>
              <p className="text-xs text-neutral-500">
                Belum punya akun?{" "}
                <Link href="/daftar" className="font-semibold text-neutral-900 underline underline-offset-2">
                  Daftar sebagai siswa atau guru
                </Link>
              </p>
            </div>
          </Muncul>
          <Muncul kelas={kartu({ padding: "lg" })}>
            <FormLogin pesanAwal={pesanAwal} tujuanAwal={tujuan} />
          </Muncul>
        </div>
      </section>
    </main>
  );
}
