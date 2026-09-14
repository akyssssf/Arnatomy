/* ==========================================================================
   mock-api.ts — Lapisan pemanggilan REST dari sisi klien.
   Setiap fungsi: fetch + async/await + batas waktu (AbortController),
   pesan galat yang bisa dibaca pengguna, lalu respons DIVALIDASI dengan
   skema Zod sebelum dikembalikan ke TanStack Query (end-to-end type safety).
   Endpoint sesungguhnya adalah Route Handler di src/app/api/* yang
   mensimulasikan backend ARnatomy dengan jeda buatan.
   ========================================================================== */
import { z } from "zod";
import {
  AiConversationSchema, LaporanKesalahanSchema, LearningHistorySchema, PartContentSchema,
  RespGalatSchema, RespLoginSchema, RespOkSchema,
  type AiConversation, type CatatRiwayatInput, type KontenForm, type LaporanForm,
  type LaporanKesalahan, type LearningHistory, type LoginForm, type PartContent,
  type PertanyaanForm, type SesiUser,
} from "./schemas";

const BATAS_WAKTU_MS = 8000;

/** Galat API dengan kode status, supaya UI bisa membedakan 401/403/503. */
export class GalatApi extends Error {
  constructor(pesan: string, public readonly status: number) {
    super(pesan);
    this.name = "GalatApi";
  }
}

async function ambilJson<T>(skema: z.ZodType<T>, url: string, init?: RequestInit): Promise<T> {
  const pengendali = new AbortController();
  const penghitung = setTimeout(() => pengendali.abort(), BATAS_WAKTU_MS);
  try {
    const respons = await fetch(url, {
      ...init,
      signal: pengendali.signal,
      headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    });
    const mentah: unknown = await respons.json().catch(() => null);
    if (!respons.ok) {
      const galat = RespGalatSchema.safeParse(mentah);
      throw new GalatApi(galat.success ? galat.data.pesan : `server membalas status ${respons.status}.`, respons.status);
    }
    /* Validasi runtime: data yang tidak sesuai skema tidak pernah masuk cache */
    return skema.parse(mentah);
  } catch (kesalahan) {
    if (kesalahan instanceof GalatApi) throw kesalahan;
    if (kesalahan instanceof z.ZodError) throw new GalatApi("bentuk data dari server tidak sesuai skema.", 500);
    if (kesalahan instanceof DOMException && kesalahan.name === "AbortError") {
      throw new GalatApi(`permintaan melebihi batas waktu ${BATAS_WAKTU_MS / 1000} detik.`, 408);
    }
    throw new GalatApi("server tidak dapat dihubungi.", 0);
  } finally {
    clearTimeout(penghitung);
  }
}

const kirim = (metode: "POST" | "PATCH", muatan: unknown): RequestInit => ({
  method: metode, body: JSON.stringify(muatan),
});

/* ---------------- Autentikasi (FR-01) ---------------- */
export async function masuk(input: LoginForm): Promise<SesiUser> {
  const { user } = await ambilJson(RespLoginSchema, "/api/login", kirim("POST", input));
  return user;
}
export async function keluar(): Promise<void> {
  await ambilJson(RespOkSchema, "/api/logout", { method: "POST" });
}

/* ---------------- Asisten AI (FR-08) ---------------- */
export function ambilPercakapan(): Promise<AiConversation[]> {
  return ambilJson(z.array(AiConversationSchema), "/api/asisten");
}
export function kirimPertanyaan(input: PertanyaanForm & { simulasiGagal: boolean }): Promise<AiConversation> {
  return ambilJson(AiConversationSchema, "/api/asisten", kirim("POST", input));
}

/* ---------------- Laporan kesalahan (FR-09, FR-11) ---------------- */
export function ambilLaporan(): Promise<LaporanKesalahan[]> {
  return ambilJson(z.array(LaporanKesalahanSchema), "/api/laporan");
}
export function kirimLaporan(input: LaporanForm & { simulasiGagal: boolean }): Promise<LaporanKesalahan> {
  return ambilJson(LaporanKesalahanSchema, "/api/laporan", kirim("POST", input));
}
export function tindakLanjutiLaporan(idLaporan: number): Promise<LaporanKesalahan> {
  return ambilJson(LaporanKesalahanSchema, `/api/laporan/${idLaporan}`, kirim("PATCH", { status_tindak_lanjut: "ditindaklanjuti" }));
}

/* ---------------- Konten label (FR-10) ---------------- */
export function ambilKonten(): Promise<PartContent[]> {
  return ambilJson(z.array(PartContentSchema), "/api/konten");
}
export function perbaruiKonten(idKonten: number, input: KontenForm): Promise<PartContent> {
  return ambilJson(PartContentSchema, `/api/konten/${idKonten}`, kirim("PATCH", input));
}

/* ---------------- Riwayat belajar (FR-14) ---------------- */
export function ambilRiwayat(): Promise<LearningHistory[]> {
  return ambilJson(z.array(LearningHistorySchema), "/api/riwayat");
}
export function catatRiwayat(input: CatatRiwayatInput): Promise<LearningHistory> {
  return ambilJson(LearningHistorySchema, "/api/riwayat", kirim("POST", input));
}
export function tutupRiwayat(idRiwayat: number): Promise<LearningHistory> {
  return ambilJson(LearningHistorySchema, `/api/riwayat/${idRiwayat}`, { method: "PATCH" });
}
