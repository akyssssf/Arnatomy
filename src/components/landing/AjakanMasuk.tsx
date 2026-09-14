import Image from "next/image";
import Link from "next/link";
import { Muncul } from "@/components/motion/Muncul";
import { Ikon } from "@/components/ui/Ikon";
import { tombol } from "@/lib/variants";

/* Server Component: blok ajakan masuk di bagian bawah landing */
export function AjakanMasuk({ gambar }: { gambar: string }) {
  return (
    <section aria-labelledby="judul-ajak" className="pt-16">
      <Muncul kelas="relative overflow-hidden rounded-3xl bg-neutral-900 px-6 py-10 text-white sm:px-10 sm:py-14">
        <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <p className="mikro text-white/60">Siap mulai?</p>
            <h2 id="judul-ajak" className="titik-biru mt-3 text-4xl font-semibold sm:text-5xl">Masuk dan buka modelnya</h2>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-white/70">
              Tersedia akun uji coba untuk siswa, guru, dan administrator. Riwayat belajar tercatat otomatis selama sesi.
            </p>
            <Link href="/login" className={`${tombol({ ukuran: "lg" })} mt-6`}>Masuk sekarang<Ikon nama="panah" /></Link>
          </div>
          <Image src={gambar} alt="" width={224} height={224} className="melayang h-40 w-40 object-contain md:h-56 md:w-56" />
        </div>
      </Muncul>
    </section>
  );
}
