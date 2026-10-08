import Image from "next/image";
import { Hero3D } from "@/components/hero/Hero3D";
import { MunculSegera } from "@/components/motion/MunculSegera";
import { JudulKata } from "@/components/ui/JudulKata";
import type { Organ } from "@/lib/schemas";

/* Server Component: hero halaman login (judul, ajakan, organ 3D + statistik) */
export function HeroLogin({
  organ,
  jumlahOrgan,
  jumlahBagian,
  jumlahLabel,
}: {
  organ: Organ;
  jumlahOrgan: number;
  jumlahBagian: number;
  jumlahLabel: number;
}) {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1
          id="judul-login"
          className="titik-biru denyut text-[2.5rem] font-semibold leading-[0.92] sm:text-5xl lg:text-[3.6rem]"
        >
          <JudulKata
            baris={[
              ["Belajar", "anatomi"],
              ["lewat", "model", "3D"],
            ]}
          />
        </h1>
        <MunculSegera jeda={350} kelas="mt-4">
          <p className="max-w-md text-sm leading-relaxed text-neutral-500">
            Putar model jantung, buka label tiap bagian, lalu tanyakan yang belum jelas ke asisten AI.
          </p>
        </MunculSegera>
      </div>

      <MunculSegera jeda={200} kelas="relative aspect-[16/10] overflow-hidden rounded-3xl bg-abu lg:aspect-[16/9]">
        <span className="piringan-organ" aria-hidden="true" />
        <Hero3D urlModel={organ.file_model_3d} jarak={1.85} kecepatanPutar={0.8} />
        <Image
          src={organ.gambar}
          alt="Model 3D jantung manusia"
          width={520}
          height={520}
          priority
          fetchPriority="high"
          sizes="(max-width: 640px) 90vw, 675px"
          className="hero-gambar melayang pointer-events-none absolute left-1/2 top-1/2 h-[88%] w-auto -translate-x-1/2 -translate-y-1/2 object-contain"
        />
        <p className="mikro kaca absolute right-4 top-4 rounded-full px-3 py-1.5">Model 3D</p>
        <div className="kaca melayang-lambat absolute bottom-4 left-4 rounded-2xl px-4 py-3">
          <p className="mikro">{jumlahOrgan} organ</p>
          <p className="mt-1 text-2xl font-semibold leading-none">
            {jumlahBagian} <span className="text-sm font-medium text-neutral-500">bagian</span>
          </p>
          <p className="mt-1 text-xs text-neutral-500">{jumlahLabel} label dasar dan dimmed</p>
        </div>
      </MunculSegera>
    </div>
  );
}
