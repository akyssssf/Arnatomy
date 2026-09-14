/* ==========================================================================
   db.ts — "Basis data" mock di memori proses server (tanpa backend asli).
   Menyimpan entitas transaksional: part_content yang bisa diedit admin,
   learning_history, ai_conversations, laporan_kesalahan.

   Disimpan di globalThis supaya tidak ter-reset setiap Hot Module Reload
   di mode dev. Data hilang saat proses `next dev`/`next start` dimatikan,
   dan data milik seorang pengguna dibersihkan saat ia keluar (logout),
   meniru perilaku versi vanilla yang hanya hidup selama sesi.

   Semua fungsi mengembalikan objek yang sudah "siap JSON" (waktu = ISO
   string) sehingga bentuknya identik antara Route Handler dan pemanggilan
   langsung dari Server Component.
   ========================================================================== */
import "server-only";
import { part_content_awal } from "./data";
import type {
  AiConversation, JenisKonten, KontenForm, LaporanKesalahan, LearningHistory, PartContent,
} from "./schemas";

interface Toko {
  part_content: PartContent[];
  learning_history: LearningHistory[];
  ai_conversations: AiConversation[];
  laporan_kesalahan: LaporanKesalahan[];
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
      urutanId: 1000,
    };
  }
  return g[kunciGlobal];
}

function idBaru(): number {
  const t = toko();
  t.urutanId += 1;
  return t.urutanId;
}

/** Jeda buatan agar loading state terlihat (meniru latensi jaringan). */
export function jeda(ms: number): Promise<void> {
  return new Promise((selesai) => setTimeout(selesai, ms));
}

/* ---------------- part_content (FR-06, FR-07, FR-10) ---------------- */
export function semuaKonten(): PartContent[] {
  return toko().part_content.map((k) => ({ ...k }));
}
export function kontenById(idKonten: number): PartContent | null {
  return toko().part_content.find((k) => k.id_konten === idKonten) ?? null;
}
export function kontenBagian(idBagian: number, jenis: JenisKonten): PartContent | null {
  return toko().part_content.find((k) => k.id_bagian === idBagian && k.jenis_konten === jenis) ?? null;
}
export function perbaruiKonten(idKonten: number, perubahan: KontenForm): PartContent | null {
  const konten = toko().part_content.find((k) => k.id_konten === idKonten);
  if (!konten) return null;
  Object.assign(konten, perubahan);
  return { ...konten };
}

/* ---------------- learning_history (FR-14) ---------------- */
export function riwayatUser(idUser: number): LearningHistory[] {
  return toko().learning_history.filter((r) => r.id_user === idUser).map((r) => ({ ...r }));
}
export function catatRiwayat(idUser: number, idBagian: number, jenis: JenisKonten): LearningHistory {
  const entri: LearningHistory = {
    id_riwayat: idBaru(),
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
export function tutupRiwayat(idUser: number, idRiwayat: number): LearningHistory | null {
  const entri = toko().learning_history.find((r) => r.id_riwayat === idRiwayat && r.id_user === idUser);
  if (!entri) return null;
  if (entri.durasi === null) {
    entri.durasi = Math.max(1, Math.round((Date.now() - new Date(entri.waktu_akses).getTime()) / 1000));
  }
  return { ...entri };
}

/** Rekap per bagian tubuh untuk halaman Riwayat & Beranda. */
export interface RekapRiwayat {
  id_bagian: number;
  jumlah: number;
  dimmedDibuka: boolean;
  terakhir: string;
  totalDurasi: number;
}
export function ringkasanRiwayat(idUser: number): RekapRiwayat[] {
  const peta = new Map<number, RekapRiwayat>();
  for (const r of riwayatUser(idUser)) {
    const baris = peta.get(r.id_bagian) ?? {
      id_bagian: r.id_bagian, jumlah: 0, dimmedDibuka: false, terakhir: r.waktu_akses, totalDurasi: 0,
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
export function percakapanUser(idUser: number): AiConversation[] {
  return toko().ai_conversations.filter((p) => p.id_user === idUser).map((p) => ({ ...p }));
}
export function tambahPercakapan(
  idUser: number, idBagian: number | null, pertanyaan: string, jawaban: string,
): AiConversation {
  const entri: AiConversation = {
    id_percakapan: idBaru(), id_user: idUser, id_bagian: idBagian, pertanyaan, jawaban,
    waktu: new Date().toISOString(),
  };
  toko().ai_conversations.push(entri);
  return { ...entri };
}

/* ---------------- laporan_kesalahan (FR-09, FR-11) ---------------- */
export function semuaLaporan(): LaporanKesalahan[] {
  return toko().laporan_kesalahan.map((l) => ({ ...l }));
}
export function tambahLaporan(idUser: number, idKonten: number, deskripsi: string): LaporanKesalahan {
  const entri: LaporanKesalahan = {
    id_laporan: idBaru(), id_user: idUser, id_konten: idKonten, deskripsi_laporan: deskripsi,
    status_tindak_lanjut: "baru", waktu: new Date().toISOString(),
  };
  toko().laporan_kesalahan.unshift(entri);
  return { ...entri };
}
export function tindakLanjutiLaporan(idLaporan: number): LaporanKesalahan | null {
  const laporan = toko().laporan_kesalahan.find((l) => l.id_laporan === idLaporan);
  if (!laporan) return null;
  laporan.status_tindak_lanjut = "ditindaklanjuti";
  return { ...laporan };
}

/* ---------------- Sesi ---------------- */
/** Saat keluar, data belajar pribadi pengguna dibuang (seperti versi lama). */
export function bersihkanDataUser(idUser: number): void {
  const t = toko();
  t.learning_history = t.learning_history.filter((r) => r.id_user !== idUser);
  t.ai_conversations = t.ai_conversations.filter((p) => p.id_user !== idUser);
}
