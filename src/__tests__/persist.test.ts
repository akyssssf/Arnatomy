import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { BagianIdSchema, OrganIdSchema, UserIdSchema } from "@/lib/schemas";

function resetToko() {
  delete (globalThis as Record<symbol, unknown>)[Symbol.for("arnatomy.db")];
}

describe("persist (snapshot basis data mock)", () => {
  let dir = "";
  beforeEach(() => {
    vi.resetModules();
    resetToko();
    dir = mkdtempSync(join(tmpdir(), "arnatomy-"));
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    rmSync(dir, { recursive: true, force: true });
  });

  it("tanpa adapter: memori saja, simpan/muat tidak melakukan apa pun", async () => {
    vi.stubEnv("DATA_DIR", "");
    vi.stubEnv("KV_REST_API_URL", "");
    const persist = await import("@/lib/persist");
    await import("@/lib/db");
    expect(persist.adapterAktif()).toBe("memori");
    await persist.simpanSekarang();
    expect(await persist.muatSnapshot()).toBe(false);
  });

  it("adapter berkas: mutasi -> snapshot JSON (termasuk byte model) -> dipulihkan di proses baru", async () => {
    vi.stubEnv("DATA_DIR", dir);
    vi.stubEnv("KV_REST_API_URL", "");
    const persist = await import("@/lib/persist");
    const db = await import("@/lib/db");
    expect(persist.adapterAktif()).toBe("berkas");
    const idUser = UserIdSchema.parse(1);
    db.catatRiwayat(idUser, BagianIdSchema.parse(4), "dasar");
    const glb = new Uint8Array([0x67, 0x6c, 0x54, 0x46, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    db.simpanAset(OrganIdSchema.parse(1), "jantung-baru.glb", glb);
    await db.daftarkanAkun({
      nama: "Dina",
      email: "dina@s.id",
      password: "rahasia123",
      konfirmasi: "rahasia123",
      role: "siswa",
      asal_sekolah: "SMP",
    });
    await persist.simpanSekarang();
    const teks = readFileSync(join(dir, "arnatomy-db.json"), "utf8");
    expect(teks).toContain("jantung-baru.glb");
    expect(teks).not.toContain("rahasia123"); // hanya hash yang disimpan

    /* "proses baru": modul & toko kosong, lalu snapshot dimuat */
    vi.resetModules();
    resetToko();
    const persist2 = await import("@/lib/persist");
    const db2 = await import("@/lib/db");
    expect(db2.riwayatUser(idUser)).toHaveLength(0);
    expect(await persist2.muatSnapshot()).toBe(true);
    expect(db2.riwayatUser(idUser)).toHaveLength(1);
    expect(db2.asetOrgan(OrganIdSchema.parse(1))).toMatchObject({
      sumber: "unggahan",
      nama_berkas: "jantung-baru.glb",
    });
    expect(db2.bytesAset(OrganIdSchema.parse(1), 1)?.byteLength).toBe(13);
    expect(await db2.verifikasiLogin("dina@s.id", "rahasia123")).toMatchObject({ status: "ok" });
    /* id baru tidak menabrak id lama */
    const baru = db2.catatRiwayat(idUser, BagianIdSchema.parse(5), "dimmed");
    expect(baru.id_riwayat).toBeGreaterThan(1002);
  });

  it("adapter KV: SET lewat REST tanpa byte model; GET memulihkan; snapshot rusak diabaikan", async () => {
    vi.stubEnv("DATA_DIR", "");
    vi.stubEnv("KV_REST_API_URL", "https://kv.uji.io");
    vi.stubEnv("KV_REST_API_TOKEN", "token-uji");
    const fetchMock = vi.fn<typeof fetch>();
    vi.stubGlobal("fetch", fetchMock);
    const persist = await import("@/lib/persist");
    const db = await import("@/lib/db");
    expect(persist.adapterAktif()).toBe("kv");
    db.simpanAset(
      OrganIdSchema.parse(2),
      "paru.glb",
      new Uint8Array([0x67, 0x6c, 0x54, 0x46, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
    );
    fetchMock.mockResolvedValueOnce(new Response('{"result":"OK"}'));
    await persist.simpanSekarang();
    const [url, init] = fetchMock.mock.calls[0] ?? [];
    expect(url).toBe("https://kv.uji.io");
    expect((init?.headers as Record<string, string>).Authorization).toBe("Bearer token-uji");
    const [cmd, kunci, nilai] = JSON.parse(String(init?.body)) as [string, string, string];
    expect([cmd, kunci]).toEqual(["SET", "arnatomy:db"]);
    expect(JSON.parse(nilai).aset_model[0][1].bytes_b64).toBeNull();

    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({ result: nilai })));
    expect(await persist.muatSnapshot()).toBe(true);
    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({ result: "{bukan json" })));
    expect(await persist.muatSnapshot()).toBe(false);
    fetchMock.mockResolvedValueOnce(new Response("", { status: 500 }));
    expect(await persist.muatSnapshot()).toBe(false);
  });
});
