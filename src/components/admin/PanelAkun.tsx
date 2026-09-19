"use client";

/* Client: tab Pengguna (FR-13). useAkun({aktif:true}) -> loading/error/empty
   state; "Nonaktifkan/Aktifkan" dan "Hapus" = mutasi + invalidasi cache.
   Akun admin yang sedang masuk tidak bisa diubah (dijaga juga di server).
   Setelah hapus, router.refresh() agar tab Umpan Balik (RSC) ikut segar. */
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/dialog";
import { KondisiKosong } from "@/components/ui/KondisiKosong";
import { Spinner } from "@/components/ui/Spinner";
import { useAkun } from "@/hooks/useAkun";
import type { Akun, UserId } from "@/lib/schemas";
import { alert, kartu, tombol } from "@/lib/variants";
import { useUIStore } from "@/store/useUIStore";

const LABEL_PERAN: Record<Akun["role"], string> = { siswa: "Siswa", guru: "Guru", admin: "Administrator" };

export function PanelAkun({ idAdmin }: { idAdmin: UserId }) {
  const router = useRouter();
  const { daftar, ubahStatus, hapus } = useAkun({ aktif: true });
  const tampilkanToast = useUIStore((s) => s.tampilkanToast);
  const [akanDihapus, setAkanDihapus] = useState<Akun | null>(null);

  if (daftar.isPending) {
    return (
      <div role="status" aria-busy="true" aria-label="Memuat akun" className="space-y-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="tulang h-20 rounded-2xl" />
        ))}
      </div>
    );
  }
  if (daftar.isError) {
    return (
      <div role="alert" className={`${alert({ tipe: "error" })} items-center justify-between`}>
        <span>Gagal memuat akun: {daftar.error.message}</span>
        <button
          type="button"
          onClick={() => daftar.refetch()}
          className={tombol({ variant: "sekunder", ukuran: "sm" })}
        >
          Coba lagi
        </button>
      </div>
    );
  }
  if (!daftar.data.length) {
    return <KondisiKosong judul="Belum ada akun" deskripsi="Akun muncul di sini setelah pengguna mendaftar." />;
  }

  async function ubah(akun: Akun) {
    try {
      await ubahStatus.mutateAsync({ idUser: akun.id_user, aktif: !akun.aktif });
      tampilkanToast(`Akun ${akun.nama} ${akun.aktif ? "dinonaktifkan" : "diaktifkan kembali"}.`, "sukses");
    } catch (kesalahan) {
      tampilkanToast(`Gagal: ${kesalahan instanceof Error ? kesalahan.message : "galat tidak dikenal."}`, "error");
    }
  }
  async function konfirmasiHapus() {
    if (!akanDihapus) return;
    try {
      await hapus.mutateAsync(akanDihapus.id_user);
      tampilkanToast(`Akun ${akanDihapus.nama} dihapus.`, "sukses");
      setAkanDihapus(null);
      router.refresh();
    } catch (kesalahan) {
      tampilkanToast(`Gagal: ${kesalahan instanceof Error ? kesalahan.message : "galat tidak dikenal."}`, "error");
    }
  }

  const jumlahAktif = daftar.data.filter((a) => a.aktif).length;

  return (
    <>
      <p className="mb-3 text-xs text-neutral-500">
        {daftar.data.length} akun, {jumlahAktif} aktif. Akun nonaktif ditolak saat masuk dan sesinya diputus.
      </p>
      <ul className="space-y-3">
        {daftar.data.map((a) => {
          const diriSendiri = a.id_user === idAdmin;
          const sedangUbah = ubahStatus.isPending && ubahStatus.variables?.idUser === a.id_user;
          return (
            <li key={a.id_user} className={`${kartu({ padding: "md" })} ${a.aktif ? "" : "opacity-70"}`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="truncate text-sm font-bold">
                    {a.nama}
                    {diriSendiri && <span className="ml-2 text-[11px] font-normal text-neutral-400">(kamu)</span>}
                  </h3>
                  <p className="truncate text-xs text-neutral-400">
                    {a.email}
                    {a.asal_sekolah ? ` · ${a.asal_sekolah}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge status={a.role === "admin" ? "dimmed" : "dasar"}>{LABEL_PERAN[a.role]}</Badge>
                  <Badge status={a.aktif ? "tervalidasi" : "draft"}>{a.aktif ? "aktif" : "nonaktif"}</Badge>
                </div>
              </div>
              {!diriSendiri && (
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => ubah(a)}
                    disabled={sedangUbah}
                    className={tombol({ variant: a.aktif ? "bahaya" : "sekunder", ukuran: "sm" })}
                  >
                    {sedangUbah ? (
                      <>
                        <Spinner /> Menyimpan
                      </>
                    ) : a.aktif ? (
                      "Nonaktifkan"
                    ) : (
                      "Aktifkan kembali"
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setAkanDihapus(a)}
                    className={tombol({ variant: "garis", ukuran: "sm" })}
                  >
                    Hapus
                  </button>
                </div>
              )}
            </li>
          );
        })}
      </ul>

      {akanDihapus && (
        <Modal judul="Hapus akun?" onTutup={() => setAkanDihapus(null)} lebar="max-w-md">
          <p className="text-sm text-neutral-600">
            Akun <strong>{akanDihapus.nama}</strong> ({akanDihapus.email}) beserta riwayat belajar, percakapan, dan
            kuesionernya akan dihapus. Tindakan ini tidak dapat dibatalkan.
          </p>
          <div className="mt-5 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setAkanDihapus(null)}
              className={tombol({ variant: "garis", ukuran: "sm" })}
            >
              Batal
            </button>
            <button
              type="button"
              onClick={konfirmasiHapus}
              disabled={hapus.isPending}
              className={tombol({ variant: "bahaya", ukuran: "sm" })}
            >
              {hapus.isPending ? (
                <>
                  <Spinner /> Menghapus
                </>
              ) : (
                "Hapus akun"
              )}
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
