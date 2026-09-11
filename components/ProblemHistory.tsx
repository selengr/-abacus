export type HistoryEntry = {
  expression: string;
  points: number;
  skipped?: boolean;
};

type ProblemHistoryProps = {
  entries: HistoryEntry[];
};

export function ProblemHistory({ entries }: ProblemHistoryProps) {
  if (entries.length === 0) return null;

  return (
    <div className="w-full max-w-3xl">
      <p className="mb-2 text-[10px] uppercase tracking-[0.28em] text-ash">
        Recent
      </p>
      <ol className="flex flex-wrap gap-2">
        {entries
          .slice(-6)
          .reverse()
          .map((entry, index) => (
            <li
              key={`${entry.expression}-${index}`}
              className={[
                "rounded-full border px-3 py-1 font-mono text-xs",
                entry.skipped
                  ? "border-smoke/70 text-ash"
                  : "border-amber/30 text-paper",
              ].join(" ")}
            >
              {entry.expression}
              <span className="ml-2 text-ash">
                {entry.skipped ? "skip" : `+${entry.points}`}
              </span>
            </li>
          ))}
      </ol>
    </div>
  );
}
