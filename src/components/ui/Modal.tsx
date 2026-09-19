"use client";

/* Modal aplikasi: pembungkus tipis di atas komponen Dialog (Radix).
   API lama dipertahankan (judul, onTutup, children) agar pemanggil tidak berubah.
   Selalu terbuka saat dipasang; onTutup dipanggil saat Escape, klik overlay,
   atau tombol tutup. */
import { Dialog, DialogBody, DialogCloseButton, DialogContent, DialogHeader, DialogTitle } from "./dialog";

export function Modal({
  judul,
  onTutup,
  lebar = "max-w-lg",
  children,
}: {
  judul: string;
  onTutup: () => void;
  lebar?: string;
  children: React.ReactNode;
}) {
  return (
    <Dialog
      open
      onOpenChange={(terbuka) => {
        if (!terbuka) onTutup();
      }}
    >
      <DialogContent className={lebar} aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>{judul}</DialogTitle>
          <DialogCloseButton />
        </DialogHeader>
        <DialogBody>{children}</DialogBody>
      </DialogContent>
    </Dialog>
  );
}
