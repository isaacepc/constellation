export default function ProgressBar({ lit, total }: { lit: number; total: number }) {
  const pct = total ? Math.round((lit / total) * 100) : 0;
  return (
    <div className="w-full max-w-sm">
      <div className="mb-1.5 flex justify-between text-sm">
        <span className="font-medium">
          {lit} / {total} stars lit
        </span>
        <span className="text-muted">{pct}%</span>
      </div>
      <div
        className="h-2 overflow-hidden rounded-full bg-white/10"
        role="progressbar"
        aria-valuenow={lit}
        aria-valuemin={0}
        aria-valuemax={total}
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-amber-300 to-star transition-[width] duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
