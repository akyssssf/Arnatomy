/* Riwayat Belajar (FR-14): Server Component async. Data dibaca langsung
   dari basis data mock di server; selama menunggu, riwayat/loading.tsx
   ditampilkan otomatis lewat Streaming SSR. */
import type { Metadata } from "next";
import Link from "next/link";
import { TabelRiwayat } from "@/components/riwayat/TabelRiwayat";
import { JudulHalaman } from "@/components/ui/JudulHalaman";
import { KartuStatistik } from "@/components/ui/KartuStatistik";
import { KondisiKosong } from "@/components/ui/KondisiKosong";
import { ambilSesi } from "@/lib/auth";
import { body_parts } from "@/lib/data";
import { jeda, ringkasanRiwayat, semuaKonten } from "@/lib/db";
import { tombol } from "@/lib/variants";

export const metadata: Metadata = {
  title: "Riwayat Belajar",
  description: "Rekam jejak bagian tubuh yang sudah dibuka pada sesi belajar ini.",
};

export default async function HalamanRiwayat() {
  const sesi = await ambilSesi();
  if (!sesi) return null;
  await jeda(600); // latensi buatan supaya loading.tsx terlihat
  const rekap = ringkasanRiwayat(sesi.id_user);

  const tombolMulai = <Link href="/eksplorasi" className={tombol({ ukuran: "sm" })}>Buka halaman Eksplorasi</Link>;

  if (!rekap.length) {
    return (
      <section aria-labelledby="judul-riwayat" className="halaman-masuk">
        <JudulHalaman judul="Riwayat Belajar" deskripsi="Bagian tubuh yang telah dibuka pada sesi ini." id="judul-riwayat" kicker="Rekam jejak" />
        <KondisiKosong judul="Belum ada riwayat" deskripsi="Riwayat terisi otomatis setiap kali label dibuka pada halaman Eksplorasi." aksi={tombolMulai} />
      </section>
    );
  }

  const totalKunjungan = rekap.reduce((jml, r) => jml + r.jumlah, 0);
  const totalDimmed = rekap.filter((r) => r.dimmedDibuka).length;
  const statistik = [
    { label: "Bagian dipelajari", nilai: `${rekap.length} / ${body_parts.length}` },
    { label: "Total kunjungan label", nilai: String(totalKunjungan) },
    { label: "Label dimmed dibuka", nilai: String(totalDimmed) },
  ];

  return (
    <section aria-labelledby="judul-riwayat" className="halaman-masuk">
      <JudulHalaman judul="Riwayat Belajar" deskripsi="Bagian tubuh yang telah dibuka pada sesi ini." id="judul-riwayat" kicker="Rekam jejak" />
      <KartuStatistik daftar={statistik} />
      <TabelRiwayat rekap={rekap} konten={semuaKonten()} />
      <p className="mt-3 px-1 text-xs text-neutral-400">
        Riwayat disimpan di memori server selama sesi berjalan dan dibuang saat kamu keluar.
      </p>
    </section>
  );
}
