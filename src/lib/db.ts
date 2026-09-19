/* ==========================================================================
   db.ts — "Basis data" mock di memori proses server (tanpa backend asli).
   Menyimpan entitas transaksional: part_content yang bisa diedit admin,
   learning_history, ai_conversations, laporan_kesalahan, umpan_balik (SUS),
   serta akun pengguna (seed + hasil registrasi) dengan kata sandi ter-hash.

   Disimpan di globalThis supaya tidak ter-reset setiap Hot Module Reload
   di mode dev. Data hilang saat proses `next dev`/`next start` dimatikan,
   dan data milik seorang pengguna dibersihkan saat ia keluar (logout),
   meniru perilaku versi vanilla yang hanya hidup selama sesi.

   Semua fungsi mengembalikan objek yang sudah "siap JSON" (waktu = ISO
   string) sehingga bentuknya identik antara Route Handler dan pemanggilan
   langsung dari Server Component.
   ========================================================================== */
import "server-only";
import { part_content_awal, users } from "./data";
import { cekSandi, hashSandi } from "./sandi";
import {
  type AiConversation,
  type Akun,
  type BagianId,
  type DaftarForm,
  type JenisKonten,
  type KontenId,
  type KontenPatch,
  type LaporanId,
  LaporanIdSchema,
  type LaporanKesalahan,
  type LearningHistory,
  type PartContent,
  PercakapanIdSchema,
  type RiwayatId,
  RiwayatIdSchema,
  type SesiUser,
  type UmpanBalik,
  UmpanBalikIdSchema,
  type UserId,
  UserIdSchema,
} from "./schemas";

/** Akun tersimpan: kolom User tanpa password asli, ditambah hash-nya. */
interface AkunTersimpan extends Akun {
  sandi_hash: string;
}

interface Toko {
  part_content: PartContent[];
  learning_history: LearningHistory[];
  ai_conversations: AiConversation[];
  laporan_kesalahan: LaporanKesalahan[];
  umpan_balik: UmpanBalik[];
  /* Diisi malas (async) karena hashing seed memakai crypto.subtle */
  akun: AkunTersimpan[] | null;
  akunSiap: Promise<AkunTersimpan[]> | null;
  urutanId: number;
}

const kunciGlobal = Symbol.for("arnatomy.db");
type GlobalDenganToko = typeof globalThis & { [kunciGlobal]?: Toko };

function toko(): Toko {
  const g = globalThis as GlobalDenganToko;
  if (!g[kunciGlobal]) {
    g[kunciGlobal] = {
      part_content: part_content_awal.map((k) => ({ ...k })),
      learning_history: [],
      ai_conversations: [],
      laporan_kesalahan: [],
      umpan_balik: [],
      akun: null,
      akunSiap: null,
      urutanId: 1000,
    };
  }
  return g[kunciGlobal];
}

/** Id berikutnya, langsung "dimerek" lewat skema yang diminta. */
function idBaru<T>(skema: { parse: (nilai: unknown) => T }): T {
  const t = toko();
  t.urutanId += 1;
  return skema.parse(t.urutanId);
}

/** Jeda buatan agar loading state terlihat (meniru latensi jaringan). */
export function jeda(ms: number): Promise<void> {
  return new Promise((selesai) => setTimeout(selesai, ms));
}

/* ---------------- part_content (FR-06, FR-07, FR-10) ---------------- */
export function semuaKonten(): PartContent[] {
  return toko().part_content.map((k) => ({ ...k }));
}
export function kontenById(idKonten: KontenId): PartContent | null {
  return toko().part_content.find((k) => k.id_konten === idKonten) ?? null;
}
export function kontenBagian(idBagian: BagianId, jenis: JenisKonten): PartContent | null {
  return toko().part_content.find((k) => k.id_bagian === idBagian && k.jenis_konten === jenis) ?? null;
}
export function perbaruiKonten(idKonten: KontenId, perubahan: KontenPatch): PartContent | null {
  const konten = toko().part_content.find((k) => k.id_konten === idKonten);
  if (!konten) return null;
  Object.assign(konten, perubahan);
  return { ...konten };
}

/* ---------------- learning_history (FR-14) ---------------- */
export function riwayatUser(idUser: UserId): LearningHistory[] {
  return toko()
    .learning_history.filter((r) => r.id_user === idUser)
    .map((r) => ({ ...r }));
}
export function catatRiwayat(idUser: UserId, idBagian: BagianId, jenis: JenisKonten): LearningHistory {
  const entri: LearningHistory = {
    id_riwayat: idBaru(RiwayatIdSchema),
    id_user: idUser,
    id_bagian: idBagian,
    jenis_konten: jenis,
    waktu_akses: new Date().toISOString(),
    durasi: null,
  };
  toko().learning_history.push(entri);
  return { ...entri };
}
/** Durasi dihitung di server dari waktu_akses sampai saat entri ditutup. */
export function tutupRiwayat(idUser: UserId, idRiwayat: RiwayatId): LearningHistory | null {
  const entri = toko().learning_history.find((r) => r.id_riwayat === idRiwayat && r.id_user === idUser);
  if (!entri) return null;
  if (entri.durasi === null) {
    entri.durasi = Math.max(1, Math.round((Date.now() - new Date(entri.waktu_akses).getTime()) / 1000));
  }
  return { ...entri };
}

/** Rekap per bagian tubuh untuk halaman Riwayat & Beranda. */
export interface RekapRiwayat {
  id_bagian: BagianId;
  jumlah: number;
  dimmedDibuka: boolean;
  terakhir: string;
  totalDurasi: number;
}
export function ringkasanRiwayat(idUser: UserId): RekapRiwayat[] {
  const peta = new Map<number, RekapRiwayat>();
  for (const r of riwayatUser(idUser)) {
    const baris = peta.get(r.id_bagian) ?? {
      id_bagian: r.id_bagian,
      jumlah: 0,
      dimmedDibuka: false,
      terakhir: r.waktu_akses,
      totalDurasi: 0,
    };
    baris.jumlah += 1;
    if (r.jenis_konten === "dimmed") baris.dimmedDibuka = true;
    if (r.waktu_akses > baris.terakhir) baris.terakhir = r.waktu_akses;
    baris.totalDurasi += r.durasi ?? 0;
    peta.set(r.id_bagian, baris);
  }
  return [...peta.values()].sort((a, b) => (a.terakhir < b.terakhir ? 1 : -1));
}

/* ---------------- ai_conversations (FR-08) ---------------- */
export function percakapanUser(idUser: UserId): AiConversation[] {
  return toko()
    .ai_conversations.filter((p) => p.id_user === idUser)
    .map((p) => ({ ...p }));
}
export function tambahPercakapan(
  idUser: UserId,
  idBagian: BagianId | null,
  pertanyaan: string,
  jawaban: string,
): AiConversation {
  const entri: AiConversation = {
    id_percakapan: idBaru(PercakapanIdSchema),
    id_user: idUser,
    id_bagian: idBagian,
    pertanyaan,
    jawaban,
    waktu: new Date().toISOString(),
  };
  toko().ai_conversations.push(entri);
  return { ...entri };
}

/* ---------------- laporan_kesalahan (FR-09, FR-11) ---------------- */
export function semuaLaporan(): LaporanKesalahan[] {
  return toko().laporan_kesalahan.map((l) => ({ ...l }));
}
export function tambahLaporan(idUser: UserId, idKonten: KontenId, deskripsi: string): LaporanKesalahan {
  const entri: LaporanKesalahan = {
    id_laporan: idBaru(LaporanIdSchema),
    id_user: idUser,
    id_konten: idKonten,
    deskripsi_laporan: deskripsi,
    status_tindak_lanjut: "baru",
    waktu: new Date().toISOString(),
  };
  toko().laporan_kesalahan.unshift(entri);
  return { ...entri };
}
export function tindakLanjutiLaporan(idLaporan: LaporanId): LaporanKesalahan | null {
  const laporan = toko().laporan_kesalahan.find((l) => l.id_laporan === idLaporan);
  if (!laporan) return null;
  laporan.status_tindak_lanjut = "ditindaklanjuti";
  return { ...laporan };
}

/* ---------------- umpan_balik: kuesioner SUS (FR-15) ----------------
   Skor SUS: butir ganjil (positif) = jawaban - 1, butir genap (negatif) =
   5 - jawaban; jumlah dikali 2,5 -> rentang 0..100. */
export function hitungSkorSus(jawaban: number[]): number {
  const total = jawaban.reduce((akum, nilai, i) => akum + (i % 2 === 0 ? nilai - 1 : 5 - nilai), 0);
  return Math.round(total * 2.5 * 10) / 10;
}
export function semuaUmpanBalik(): UmpanBalik[] {
  return toko().umpan_balik.map((u) => ({ ...u, jawaban: [...u.jawaban] }));
}
export function umpanBalikUser(idUser: UserId): UmpanBalik | null {
  const u = toko().umpan_balik.find((x) => x.id_user === idUser);
  return u ? { ...u, jawaban: [...u.jawaban] } : null;
}
export function tambahUmpanBalik(idUser: UserId, jawaban: number[], komentar: string | null): UmpanBalik {
  const entri: UmpanBalik = {
    id_umpan_balik: idBaru(UmpanBalikIdSchema),
    id_user: idUser,
    jawaban: [...jawaban],
    skor_sus: hitungSkorSus(jawaban),
    komentar: komentar?.trim() ? komentar.trim() : null,
    waktu: new Date().toISOString(),
  };
  /* Satu kuesioner per pengguna: kiriman ulang menggantikan yang lama */
  const t = toko();
  t.umpan_balik = t.umpan_balik.filter((u) => u.id_user !== idUser);
  t.umpan_balik.unshift(entri);
  return { ...entri, jawaban: [...entri.jawaban] };
}

/* ---------------- akun pengguna (FR-01, FR-02, FR-13) ----------------
   Seed dari data.ts di-hash sekali saat pertama diakses; akun hasil
   registrasi ditambahkan ke daftar yang sama. */
function daftarAkun(): Promise<AkunTersimpan[]> {
  const t = toko();
  if (t.akun) return Promise.resolve(t.akun);
  if (!t.akunSiap) {
    t.akunSiap = Promise.all(
      users.map(async ({ password, ...u }) => ({ ...u, sandi_hash: await hashSandi(password) })),
    ).then((akun) => {
      t.akun = akun;
      return akun;
    });
  }
  return t.akunSiap;
}
function keAkun(akun: AkunTersimpan): Akun {
  return {
    id_user: akun.id_user,
    nama: akun.nama,
    email: akun.email,
    role: akun.role,
    asal_sekolah: akun.asal_sekolah,
    aktif: akun.aktif,
  };
}
function keSesi(akun: AkunTersimpan): SesiUser {
  return {
    id_user: akun.id_user,
    nama: akun.nama,
    email: akun.email,
    role: akun.role,
    asal_sekolah: akun.asal_sekolah,
  };
}

export async function semuaAkun(): Promise<Akun[]> {
  return (await daftarAkun()).map(keAkun);
}
export async function akunById(idUser: UserId): Promise<Akun | null> {
  const a = (await daftarAkun()).find((x) => x.id_user === idUser);
  return a ? keAkun(a) : null;
}

export type HasilLogin = { status: "ok"; user: SesiUser } | { status: "salah" } | { status: "nonaktif" };
/** Memeriksa email + kata sandi terhadap hash; membedakan akun nonaktif. */
export async function verifikasiLogin(email: string, password: string): Promise<HasilLogin> {
  const akun = (await daftarAkun()).find((a) => a.email.toLowerCase() === email.trim().toLowerCase());
  if (!akun || !(await cekSandi(password, akun.sandi_hash))) return { status: "salah" };
  if (!akun.aktif) return { status: "nonaktif" };
  return { status: "ok", user: keSesi(akun) };
}

/** Registrasi (FR-02): null bila email sudah terpakai. */
export async function daftarkanAkun(input: DaftarForm): Promise<SesiUser | null> {
  const semua = await daftarAkun();
  if (semua.some((a) => a.email.toLowerCase() === input.email.toLowerCase())) return null;
  const akun: AkunTersimpan = {
    id_user: idBaru(UserIdSchema),
    nama: input.nama,
    email: input.email.toLowerCase(),
    role: input.role,
    asal_sekolah: input.asal_sekolah,
    aktif: true,
    sandi_hash: await hashSandi(input.password),
  };
  semua.push(akun);
  return keSesi(akun);
}

/** FR-13: nonaktifkan/aktifkan kembali akun. */
export async function setAkunAktif(idUser: UserId, aktif: boolean): Promise<Akun | null> {
  const akun = (await daftarAkun()).find((a) => a.id_user === idUser);
  if (!akun) return null;
  akun.aktif = aktif;
  return keAkun(akun);
}
/** FR-13: hapus akun beserta data belajarnya. */
export async function hapusAkun(idUser: UserId): Promise<boolean> {
  const t = toko();
  const semua = await daftarAkun();
  const indeks = semua.findIndex((a) => a.id_user === idUser);
  if (indeks < 0) return false;
  semua.splice(indeks, 1);
  bersihkanDataUser(idUser);
  t.umpan_balik = t.umpan_balik.filter((u) => u.id_user !== idUser);
  return true;
}

/* ---------------- Sesi ---------------- */
/** Saat keluar, data belajar pribadi pengguna dibuang (seperti versi lama). */
export function bersihkanDataUser(idUser: UserId): void {
  const t = toko();
  t.learning_history = t.learning_history.filter((r) => r.id_user !== idUser);
  t.ai_conversations = t.ai_conversations.filter((p) => p.id_user !== idUser);
}
