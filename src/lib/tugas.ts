/* ==========================================================================
   tugas.ts — Bentuk data tugas belajar (kuis dan simulasi alur) yang dikirim
   backend. Dipakai server (halaman) dan klien (validasi respons percobaan).
   ========================================================================== */
import { z } from "zod";

export const JenisTugasSchema = z.enum(["kuis", "simulasi", "rakit"]);
export type JenisTugas = z.infer<typeof JenisTugasSchema>;

export const TugasRingkasSchema = z.object({
  id_tugas: z.number().int().positive(),
  jenis: JenisTugasSchema,
  id_organ: z.number().int().nullable(),
  nama_organ: z.string().nullable().optional(),
  judul: z.string(),
  deskripsi: z.string(),
  ambang: z.number().int(),
  jumlah_item: z.number().int().optional(),
  percobaan: z.number().int(),
  skor_terbaik: z.number().int().nullable(),
  selesai: z.boolean(),
});
export type TugasRingkas = z.infer<typeof TugasRingkasSchema>;

export const SoalSchema = z.object({
  id_soal: z.number().int(),
  urutan: z.number().int(),
  pertanyaan: z.string(),
  pilihan: z.array(z.string()),
});
export type Soal = z.infer<typeof SoalSchema>;

export const LangkahSchema = z.object({
  id_langkah: z.number().int(),
  urutan: z.number().int(),
  kode: z.string(),
  judul: z.string(),
  deskripsi: z.string(),
  id_bagian: z.number().int().nullable(),
});
export type Langkah = z.infer<typeof LangkahSchema>;

export type IsiTugas = TugasRingkas & { soal?: Soal[]; langkah?: Langkah[] };

export interface ProgresTugas {
  tugas_total: number;
  tugas_selesai: number;
  persen_selesai: number;
  rata_skor_terbaik: number | null;
  percobaan_terbaru: {
    id_percobaan: number;
    id_tugas: number;
    judul: string;
    jenis: JenisTugas;
    skor: number;
    benar: number;
    total: number;
    waktu: string;
  }[];
}

export const RincianKuisSchema = z.object({
  id_soal: z.number().int(),
  benar: z.boolean(),
  jawaban_anda: z.number().int().nullable(),
  jawaban_benar: z.number().int(),
  penjelasan: z.string(),
});
export const RincianSimulasiSchema = z.object({
  posisi: z.number().int(),
  id_langkah_anda: z.number().int(),
  id_langkah_benar: z.number().int(),
  benar: z.boolean(),
  judul_benar: z.string(),
});
export const RincianRakitSchema = z.object({
  id_langkah: z.number().int(),
  judul: z.string(),
  terpasang: z.boolean(),
  percobaan: z.number().int(),
});
export const HasilPercobaanSchema = z.object({
  id_percobaan: z.number().int().optional(),
  skor: z.number().int(),
  benar: z.number().int(),
  total: z.number().int(),
  ambang: z.number().int(),
  selesai: z.boolean(),
  rincian: z.array(z.union([RincianKuisSchema, RincianSimulasiSchema, RincianRakitSchema])),
});
export type HasilPercobaan = z.infer<typeof HasilPercobaanSchema>;
export type RincianKuis = z.infer<typeof RincianKuisSchema>;
export type RincianSimulasi = z.infer<typeof RincianSimulasiSchema>;
