/* Halaman Login (Server Component pembungkus). Hero, statistik, dan kartu
   dirender di server; hanya FormLogin (state + Zod) dan Hero3D yang klien.
   Pesan dari proxy (?auth_error=1) dibaca lewat searchParams. */
import type { Metadata } from "next";
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
  const authError = query.auth_error === "1";
  const tujuan = typeof query.next === "string" ? query.next : null;
  const organ = organs[0];
  if (!organ) throw new Error("data organ awal tidak lengkap.");

  return (
    <main id="konten-utama" tabIndex={-1} className="halaman-masuk mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6">
      <section aria-labelledby="judul-login" className="pb-6">
        <div className="flex items-center justify-between py-5">
          <span className="tampilan titik-biru text-lg font-semibold">ARnatomy</span>
          <p className="mikro">SKPL v1.0</p>
        </div>

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
            <p className="mt-8 text-xs leading-relaxed text-neutral-500">
              Tekan Siswa, Guru, atau Administrator untuk mengisi form otomatis. Sesi disimpan di cookie httpOnly; data
              belajar hidup di memori server selama sesi dan dibuang saat keluar.
            </p>
          </Muncul>
          <Muncul kelas={kartu({ padding: "lg" })}>
            <FormLogin pesanAwal={authError ? "Masuk dulu untuk membuka halaman itu." : null} tujuanAwal={tujuan} />
          </Muncul>
        </div>
      </section>
    </main>
  );
}
