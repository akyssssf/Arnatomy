/* ==========================================================================
   useAkun — server state akun pengguna untuk dashboard admin (FR-13).
   Daftar hanya diambil bila `aktif` (tab Pengguna terbuka). Mutasi
   nonaktifkan/aktifkan dan hapus menginvalidasi cache ['akun'].
   ========================================================================== */
"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ambilAkun, hapusAkun, ubahStatusAkun } from "@/lib/mock-api";
import type { UserId } from "@/lib/schemas";
import { KUNCI } from "./kunci-query";

export function useAkun(opsi: { aktif?: boolean } = {}) {
  const queryClient = useQueryClient();
  const segarkan = () => void queryClient.invalidateQueries({ queryKey: KUNCI.akun });

  const daftar = useQuery({
    queryKey: KUNCI.akun,
    queryFn: ambilAkun,
    enabled: opsi.aktif ?? false,
    staleTime: 1000 * 30,
    gcTime: 1000 * 60 * 10,
  });

  const ubahStatus = useMutation({
    mutationFn: ({ idUser, aktif }: { idUser: UserId; aktif: boolean }) => ubahStatusAkun(idUser, { aktif }),
    onSuccess: segarkan,
  });

  const hapus = useMutation({
    mutationFn: (idUser: UserId) => hapusAkun(idUser),
    onSuccess: segarkan,
  });

  return { daftar, ubahStatus, hapus };
}
