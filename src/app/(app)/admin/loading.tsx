/* Skeleton streaming untuk /admin (konvensi loading.tsx) */
export default function MemuatAdmin() {
  return (
    <div aria-busy="true" aria-label="Memuat dashboard admin" className="pt-6 sm:pt-8">
      <div className="tulang h-3 w-28 rounded" />
      <div className="tulang mt-3 h-12 w-80 max-w-full rounded-xl" />
      <div className="tulang mt-4 h-4 w-96 max-w-full rounded" />
      <div className="tulang mt-6 h-11 w-72 rounded-full" />
      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        {[0, 1, 2].map((i) => <div key={i} className="tulang h-28 rounded-2xl" />)}
      </div>
      <div className="tulang mt-4 h-80 rounded-2xl" />
    </div>
  );
}
