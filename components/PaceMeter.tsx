type PaceMeterProps = {
  youSolved: number;
  rivalSolved: number;
  youLabel?: string;
  rivalLabel?: string;
};

export function PaceMeter({
  youSolved,
  rivalSolved,
  youLabel = "You",
  rivalLabel = "Rival",
}: PaceMeterProps) {
  const total = Math.max(youSolved + rivalSolved, 1);
  const youPct = Math.round((youSolved / total) * 100);
  const lead =
    youSolved === rivalSolved
      ? "Tied"
      : youSolved > rivalSolved
        ? `Ahead by ${youSolved - rivalSolved}`
        : `Behind by ${rivalSolved - youSolved}`;

  return (
    <div className="w-full max-w-xl rounded-2xl border border-smoke/70 bg-ink-soft/50 p-4">
      <div className="mb-2 flex items-center justify-between gap-3 font-mono text-xs uppercase tracking-[0.16em]">
        <span className="text-paper">{youLabel}</span>
        <span className="text-ash">{lead}</span>
        <span className="text-ash">{rivalLabel}</span>
      </div>
      <div className="flex h-3 overflow-hidden rounded-full bg-smoke/80">
        <div
          className="h-full bg-lacquer transition-all duration-300"
          style={{ width: `${youPct}%` }}
        />
        <div
          className="h-full bg-amber/70 transition-all duration-300"
          style={{ width: `${100 - youPct}%` }}
        />
      </div>
      <div className="mt-2 flex justify-between font-mono text-xs text-ash">
        <span>{youSolved} solved</span>
        <span>{rivalSolved} solved</span>
      </div>
    </div>
  );
}
