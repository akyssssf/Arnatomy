/* Server Component: strip marquee biru; daftar diulang dua kali agar mulus */
export function Marquee({ daftar, label = "Sorotan" }: { daftar: string[]; label?: string }) {
  const isi = [...daftar, ...daftar];
  return (
    <div className="marquee" role="marquee" aria-label={label}>
      <div className="marquee-jalur" aria-hidden="true">
        {isi.map((t, i) => <span key={i}>{t}</span>)}
      </div>
    </div>
  );
}
