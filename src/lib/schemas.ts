/* ==========================================================================
   schemas.ts — Skema Zod untuk seluruh entitas (kamus data SKPL Bab VI)
   dan skema formulir. Tipe TypeScript diturunkan lewat z.infer sehingga
   satu sumber kebenaran untuk validasi runtime maupun pengecekan tipe.
   Dipakai di tiga tempat: seed data, Route Handler (validasi body),
   dan klien (validasi respons API sebelum masuk cache TanStack Query).
   ========================================================================== */
import { z } from "zod";

/* ---------------- Entitas master ---------------- */
export const PeranSchema = z.enum(["siswa", "guru", "admin"]);
export type Peran = z.infer<typeof PeranSchema>;

export const UserSchema = z.object({
  id_user: z.number().int().positive(),
  nama: z.string().min(1),
  email: z.email(),
  password: z.string().min(1),
  role: PeranSchema,
  asal_sekolah: z.string().nullable(),
});
export type User = z.infer<typeof UserSchema>;

/** Data sesi yang disimpan di cookie: tanpa password. */
export const SesiUserSchema = UserSchema.omit({ password: true });
export type SesiUser = z.infer<typeof SesiUserSchema>;

export const StatusSistemSchema = z.enum(["tersedia", "segera"]);
export const SistemOrganSchema = z.object({
  id_sistem: z.number().int().positive(),
  nama: z.string().min(1),
  id_organ: z.number().int().positive().nullable(),
  status: StatusSistemSchema,
  organ: z.string().min(1),
  gambar: z.string().startsWith("/"),
});
export type SistemOrgan = z.infer<typeof SistemOrganSchema>;

export const FaktaSchema = z.object({ label: z.string().min(1), nilai: z.string().min(1) });
export type Fakta = z.infer<typeof FaktaSchema>;

export const OrganSchema = z.object({
  id_organ: z.number().int().positive(),
  nama_organ: z.string().min(1),
  sistem_organ: z.string().min(1),
  julukan: z.string().min(1),
  file_model_3d: z.string().endsWith(".glb"),
  gambar: z.string().startsWith("/"),
  deskripsi: z.string().min(20),
  fakta: z.array(FaktaSchema),
});
export type Organ = z.infer<typeof OrganSchema>;

export const NamaLayerSchema = z.enum(["kulit", "otot", "tulang", "organ_dalam"]);
export type NamaLayer = z.infer<typeof NamaLayerSchema>;

export const LayerSchema = z.object({
  id_layer: z.number().int().positive(),
  id_organ: z.number().int().positive(),
  nama_layer: NamaLayerSchema,
  label: z.string().min(1),
  urutan_tampil: z.number().int().min(1),
});
export type Layer = z.infer<typeof LayerSchema>;

/* posisi_koordinat_3d tetap berformat "x,y,z" sesuai SKPL */
const POLA_KOORDINAT_3D = /^-?\d+(\.\d+)?,-?\d+(\.\d+)?,-?\d+(\.\d+)?$/;
const POLA_KOORDINAT_2D = /^\d+(\.\d+)?,\d+(\.\d+)?$/;

export const BodyPartSchema = z.object({
  id_bagian: z.number().int().positive(),
  id_organ: z.number().int().positive(),
  nama_bagian_internal: z.string().min(1),
  parent_bagian_id: z.number().int().positive().nullable(),
  posisi_koordinat_3d: z.string().regex(POLA_KOORDINAT_3D, "format harus x,y,z"),
  posisi_2d: z.string().regex(POLA_KOORDINAT_2D, "format harus x,y (persen)"),
  fakta: z.array(FaktaSchema),
});
export type BodyPart = z.infer<typeof BodyPartSchema>;

export const JenisKontenSchema = z.enum(["dasar", "dimmed"]);
export type JenisKonten = z.infer<typeof JenisKontenSchema>;
export const StatusValidasiSchema = z.enum(["draft", "tervalidasi"]);
export type StatusValidasi = z.infer<typeof StatusValidasiSchema>;

export const PartContentSchema = z.object({
  id_konten: z.number().int().positive(),
  id_bagian: z.number().int().positive(),
  jenis_konten: JenisKontenSchema,
  judul_tampil: z.string().min(3),
  deskripsi: z.string().min(20),
  status_tampilan: z.enum(["aktif", "dimmed"]),
  status_validasi: StatusValidasiSchema,
});
export type PartContent = z.infer<typeof PartContentSchema>;

/* ---------------- Entitas transaksional (server state) ----------------
   Waktu dikirim sebagai string ISO 8601 karena melewati JSON. */
export const LearningHistorySchema = z.object({
  id_riwayat: z.number().int().positive(),
  id_user: z.number().int().positive(),
  id_bagian: z.number().int().positive(),
  jenis_konten: JenisKontenSchema,
  waktu_akses: z.iso.datetime(),
  durasi: z.number().int().min(0).nullable(),
});
export type LearningHistory = z.infer<typeof LearningHistorySchema>;

export const AiConversationSchema = z.object({
  id_percakapan: z.number().int().positive(),
  id_user: z.number().int().positive(),
  id_bagian: z.number().int().positive().nullable(),
  pertanyaan: z.string().min(1),
  jawaban: z.string().min(1),
  waktu: z.iso.datetime(),
});
export type AiConversation = z.infer<typeof AiConversationSchema>;

export const StatusTindakLanjutSchema = z.enum(["baru", "ditindaklanjuti"]);
export const LaporanKesalahanSchema = z.object({
  id_laporan: z.number().int().positive(),
  id_user: z.number().int().positive(),
  id_konten: z.number().int().positive(),
  deskripsi_laporan: z.string().min(10),
  status_tindak_lanjut: StatusTindakLanjutSchema,
  waktu: z.iso.datetime(),
});
export type LaporanKesalahan = z.infer<typeof LaporanKesalahanSchema>;

/* ---------------- Skema formulir (input pengguna) ---------------- */
export const LoginFormSchema = z.object({
  email: z.string().trim().min(1, "Email wajib diisi.").pipe(z.email("Format email tidak valid.")),
  password: z.string().min(1, "Kata sandi wajib diisi."),
});
export type LoginForm = z.infer<typeof LoginFormSchema>;

export const LaporanFormSchema = z.object({
  id_konten: z.coerce.number().int().positive("Pilih label yang dilaporkan."),
  deskripsi_laporan: z.string().trim().min(10, "Uraian minimal 10 karakter."),
});
export type LaporanForm = z.infer<typeof LaporanFormSchema>;

export const KontenFormSchema = z.object({
  judul_tampil: z.string().trim().min(3, "Judul minimal 3 karakter."),
  deskripsi: z.string().trim().min(20, "Deskripsi minimal 20 karakter."),
  status_validasi: StatusValidasiSchema,
});
export type KontenForm = z.infer<typeof KontenFormSchema>;

export const PertanyaanFormSchema = z.object({
  pertanyaan: z.string().trim().min(1, "Tulis pertanyaan terlebih dahulu.").max(500, "Pertanyaan terlalu panjang."),
  id_bagian: z.number().int().positive().nullable(),
});
export type PertanyaanForm = z.infer<typeof PertanyaanFormSchema>;

export const CatatRiwayatSchema = z.object({
  id_bagian: z.number().int().positive(),
  jenis_konten: JenisKontenSchema,
});
export type CatatRiwayatInput = z.infer<typeof CatatRiwayatSchema>;

/* Bendera "simulasikan gagal" ikut dikirim ke endpoint supaya jalur error
   dapat diperagakan tanpa memutus koneksi sungguhan. */
export const OpsiSimulasiSchema = z.object({ simulasiGagal: z.boolean().optional() });

/* ---------------- Amplop respons API ---------------- */
export const RespGalatSchema = z.object({ pesan: z.string() });
export const RespLoginSchema = z.object({ user: SesiUserSchema });
export const RespOkSchema = z.object({ ok: z.literal(true) });
