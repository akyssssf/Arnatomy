/* Skeleton streaming untuk /riwayat (konvensi loading.tsx) */
export default function MemuatRiwayat() {
  return (
    <div role="status" aria-busy="true" aria-label="Memuat riwayat belajar" className="pt-6 sm:pt-8">
      <div className="tulang h-3 w-24 rounded" />
      <div className="tulang mt-3 h-12 w-72 rounded-xl" />
      <div className="tulang mt-4 h-4 w-80 max-w-full rounded" />
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="tulang h-28 rounded-2xl" />
        ))}
      </div>
      <div className="tulang mt-4 h-72 rounded-2xl" />
    </div>
  );
}
