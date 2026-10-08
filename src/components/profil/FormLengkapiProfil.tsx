"use client";

/* Client leaf: akun Google baru melengkapi peran (siswa/guru) dan asal sekolah
   (FR-02) sebelum memakai fitur belajar. PATCH /api/profil memperbarui cookie sesi. */
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Spinner } from "@/components/ui/Spinner";
import { GalatApi, lengkapiProfil } from "@/lib/mock-api";
import { alert, input, tombol } from "@/lib/variants";

export function FormLengkapiProfil({ nama }: { nama: string }) {
  const router = useRouter();
  const [role, setRole] = useState<"siswa" | "guru">("siswa");
  const [sekolah, setSekolah] = useState("");
  const [galat, setGalat] = useState<string | null>(null);
  const [kirim, setKirim] = useState(false);

  async function saatSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (sekolah.trim().length < 3) {
      setGalat("Nama sekolah minimal 3 karakter.");
      return;
    }
    setKirim(true);
    setGalat(null);
    try {
      await lengkapiProfil({ role, asal_sekolah: sekolah.trim() });
      router.push("/beranda" as Route);
      router.refresh();
    } catch (kesalahan) {
      setGalat(kesalahan instanceof GalatApi ? kesalahan.message : "Tidak dapat menghubungi server.");
      setKirim(false);
    }
  }

  return (
    <form onSubmit={saatSubmit} noValidate className="space-y-5">
      <p className="text-sm text-neutral-600">
        Halo, <strong>{nama}</strong>. Satu langkah lagi sebelum mulai belajar.
      </p>
      {galat && (
        <div role="alert" className={alert({ tipe: "error" })}>
          {galat}
        </div>
      )}
      <fieldset>
        <legend className="mikro mb-2">Saya adalah</legend>
        <div className="flex gap-3">
          {(["siswa", "guru"] as const).map((p) => (
            <label key={p} className="flex cursor-pointer items-center gap-2 text-sm">
              <input type="radio" name="role" value={p} checked={role === p} onChange={() => setRole(p)} />
              {p === "siswa" ? "Siswa" : "Guru Biologi"}
            </label>
          ))}
        </div>
      </fieldset>
      <div>
        <label htmlFor="lp-sekolah" className="mikro mb-2 block">
          Asal sekolah
        </label>
        <input
          id="lp-sekolah"
          value={sekolah}
          onChange={(e) => setSekolah(e.target.value)}
          placeholder="Mis. SMPN 1 Madiun"
          className={input({ keadaan: galat ? "salah" : "normal" })}
        />
      </div>
      <button type="submit" disabled={kirim} className={tombol({ ukuran: "md" })}>
        {kirim ? (
          <>
            <Spinner /> Menyimpan
          </>
        ) : (
          "Simpan dan mulai"
        )}
      </button>
    </form>
  );
}
