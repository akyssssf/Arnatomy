import { describe, expect, it, vi } from "vitest";
import { SesiUserSchema } from "@/lib/schemas";
import { enkodeSesi, NAMA_COOKIE } from "@/lib/sesi-codec";

const toko = vi.hoisted(() => ({ nilai: undefined as string | undefined }));
vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (nama: string) => (nama === NAMA_COOKIE && toko.nilai ? { value: toko.nilai } : undefined),
  }),
}));

describe("ambilSesi", () => {
  it("null tanpa cookie, pengguna bila cookie sah", async () => {
    const { ambilSesi } = await import("@/lib/auth");
    toko.nilai = undefined;
    expect(await ambilSesi()).toBeNull();
    const user = SesiUserSchema.parse({
      id_user: 2,
      nama: "Bu Ratna",
      email: "guru@arnatomy.id",
      role: "guru",
      asal_sekolah: "SMAN 2",
    });
    toko.nilai = await enkodeSesi(user);
    expect(await ambilSesi()).toEqual(user);
  });
});
