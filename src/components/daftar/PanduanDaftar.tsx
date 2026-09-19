import { DaftarFakta } from "@/components/ui/DaftarFakta";

/* Server Component: kartu penjelasan di samping formulir registrasi */
export function PanduanDaftar() {
  return (
    <>
      <div>
        <p className="mikro">Registrasi</p>
        <h1 id="judul-daftar" className="titik-biru mt-3 text-4xl font-semibold leading-[0.95] sm:text-5xl">
          Buat akun baru
        </h1>
        <p className="mt-4 max-w-md text-sm leading-relaxed text-neutral-500">
          Akun siswa untuk belajar dan mencatat progres; akun guru untuk memantau materi yang sama. Akun administrator
          dibuat oleh pengelola sistem.
        </p>
      </div>
      <div className="mt-6">
        <DaftarFakta
          fakta={[
            { label: "Kata sandi", nilai: "Disimpan sebagai hash PBKDF2, bukan teks asli" },
            { label: "Sesi", nilai: "Cookie httpOnly bertanda tangan, 8 jam" },
            { label: "Data belajar", nilai: "Hidup di memori server selama sesi" },
          ]}
        />
      </div>
    </>
  );
}
