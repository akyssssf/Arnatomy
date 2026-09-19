import { beforeEach, describe, expect, it, vi } from "vitest";
import type { SesiUser } from "@/lib/schemas";

const ambilSesi = vi.hoisted(() => vi.fn<() => Promise<SesiUser | null>>());
vi.mock("@/lib/auth", () => ({ ambilSesi }));
/* Jeda buatan dilewati agar uji cepat */
vi.mock("@/lib/db", async (asli) => ({ ...(await asli<typeof import("@/lib/db")>()), jeda: () => Promise.resolve() }));

const siswa = { id_user: 1, nama: "Nehan", email: "siswa@arnatomy.id", role: "siswa", asal_sekolah: null } as SesiUser;
const admin = { id_user: 3, nama: "Admin", email: "admin@arnatomy.id", role: "admin", asal_sekolah: null } as SesiUser;

const post = (url: string, body: unknown) =>
  new Request(`http://localhost${url}`, {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
const patch = (url: string, body?: unknown) =>
  new Request(`http://localhost${url}`, { method: "PATCH", body: body === undefined ? null : JSON.stringify(body) });
const konteks = (id: string) => ({ params: Promise.resolve({ id }) });

describe("Route Handlers", () => {
  beforeEach(() => {
    ambilSesi.mockReset();
    delete (globalThis as Record<symbol, unknown>)[Symbol.for("arnatomy.db")];
  });

  it("POST /api/login: 400 body kosong, 401 sandi salah, 200 + cookie httpOnly bila benar", async () => {
    const { POST } = await import("@/app/api/login/route");
    expect((await POST(post("/api/login", { email: "", password: "" }))).status).toBe(400);
    expect((await POST(post("/api/login", { email: "siswa@arnatomy.id", password: "salah" }))).status).toBe(401);
    const ok = await POST(post("/api/login", { email: "SISWA@arnatomy.id", password: "siswa123" }));
    expect(ok.status).toBe(200);
    const { user } = await ok.json();
    expect(user).toMatchObject({ id_user: 1, role: "siswa" });
    expect(user).not.toHaveProperty("password");
    const cookie = ok.headers.get("set-cookie") ?? "";
    expect(cookie).toMatch(/arnatomy_sesi=/);
    expect(cookie).toMatch(/HttpOnly/i);
    expect(cookie).toMatch(/SameSite=lax/i);
  });

  it("POST /api/logout menghapus cookie dan membersihkan data pengguna", async () => {
    const db = await import("@/lib/db");
    db.catatRiwayat(siswa.id_user, 4 as never, "dasar");
    ambilSesi.mockResolvedValue(siswa);
    const { POST } = await import("@/app/api/logout/route");
    const r = await POST();
    expect(await r.json()).toEqual({ ok: true });
    expect(r.headers.get("set-cookie")).toMatch(/arnatomy_sesi=;/);
    expect(db.riwayatUser(siswa.id_user)).toEqual([]);
  });

  it("/api/asisten: 401 tanpa sesi, 503 saat simulasiGagal, 201 jawaban kontekstual, GET daftar", async () => {
    const { GET, POST } = await import("@/app/api/asisten/route");
    ambilSesi.mockResolvedValueOnce(null);
    expect((await GET()).status).toBe(401);

    ambilSesi.mockResolvedValue(siswa);
    expect((await POST(post("/api/asisten", { pertanyaan: "x", id_bagian: 5, simulasiGagal: true }))).status).toBe(503);
    const dibuat = await POST(post("/api/asisten", { pertanyaan: "apa fungsinya?", id_bagian: 5 }));
    expect(dibuat.status).toBe(201);
    expect((await dibuat.json()).jawaban).toMatch(/^Tentang Aorta/);
    expect(await (await GET()).json()).toHaveLength(1);
    expect((await POST(post("/api/asisten", { pertanyaan: "", id_bagian: null }))).status).toBe(400);
  });

  it("/api/laporan: siswa boleh kirim, hanya admin boleh membaca dan menindaklanjuti", async () => {
    const { GET, POST } = await import("@/app/api/laporan/route");
    const { PATCH } = await import("@/app/api/laporan/[id]/route");
    ambilSesi.mockResolvedValue(siswa);
    expect(
      (await POST(post("/api/laporan", { id_konten: 8, deskripsi_laporan: "x".repeat(12), simulasiGagal: true })))
        .status,
    ).toBe(503);
    expect((await POST(post("/api/laporan", { id_konten: 999, deskripsi_laporan: "x".repeat(12) }))).status).toBe(404);
    const dibuat = await POST(post("/api/laporan", { id_konten: 8, deskripsi_laporan: "Diameter aorta salah tulis." }));
    expect(dibuat.status).toBe(201);
    const laporan = await dibuat.json();
    expect((await GET()).status).toBe(403);
    expect((await PATCH(patch(`/api/laporan/${laporan.id_laporan}`), konteks(String(laporan.id_laporan)))).status).toBe(
      403,
    );

    ambilSesi.mockResolvedValue(admin);
    expect(await (await GET()).json()).toHaveLength(1);
    expect((await PATCH(patch("/api/laporan/abc"), konteks("abc"))).status).toBe(400);
    expect((await PATCH(patch("/api/laporan/999"), konteks("999"))).status).toBe(404);
    const selesai = await PATCH(patch(`/api/laporan/${laporan.id_laporan}`), konteks(String(laporan.id_laporan)));
    expect((await selesai.json()).status_tindak_lanjut).toBe("ditindaklanjuti");
  });

  it("/api/konten: GET untuk semua peran, PATCH hanya admin dan tervalidasi Zod", async () => {
    const { GET } = await import("@/app/api/konten/route");
    const { PATCH } = await import("@/app/api/konten/[id]/route");
    ambilSesi.mockResolvedValue(siswa);
    expect(await (await GET()).json()).toHaveLength(20);
    const input = { judul_tampil: "Aorta", deskripsi: "x".repeat(25), status_validasi: "tervalidasi" };
    expect((await PATCH(patch("/api/konten/8", input), konteks("8"))).status).toBe(403);

    ambilSesi.mockResolvedValue(admin);
    expect((await PATCH(patch("/api/konten/8", { ...input, deskripsi: "pendek" }), konteks("8"))).status).toBe(400);
    expect((await PATCH(patch("/api/konten/x", input), konteks("x"))).status).toBe(400);
    expect((await PATCH(patch("/api/konten/999", input), konteks("999"))).status).toBe(404);
    const ok = await PATCH(patch("/api/konten/8", input), konteks("8"));
    expect((await ok.json()).status_validasi).toBe("tervalidasi");
  });

  it("/api/riwayat: catat lalu tutup; durasi dihitung server", async () => {
    const { GET, POST } = await import("@/app/api/riwayat/route");
    const { PATCH } = await import("@/app/api/riwayat/[id]/route");
    ambilSesi.mockResolvedValue(siswa);
    expect((await POST(post("/api/riwayat", { id_bagian: 999, jenis_konten: "dasar" }))).status).toBe(404);
    const dibuat = await POST(post("/api/riwayat", { id_bagian: 4, jenis_konten: "dasar" }));
    expect(dibuat.status).toBe(201);
    const entri = await dibuat.json();
    expect(entri.durasi).toBeNull();
    const ditutup = await PATCH(patch(`/api/riwayat/${entri.id_riwayat}`), konteks(String(entri.id_riwayat)));
    expect((await ditutup.json()).durasi).toBeGreaterThanOrEqual(1);
    expect((await PATCH(patch("/api/riwayat/999"), konteks("999"))).status).toBe(404);
    expect((await PATCH(patch("/api/riwayat/x"), konteks("x"))).status).toBe(400);
    expect(await (await GET()).json()).toHaveLength(1);
  });
});
