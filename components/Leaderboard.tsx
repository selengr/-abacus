import type { ScoreEntry } from "@/lib/types";

export function Leaderboard({
  entries,
  title = "Public leaderboard",
}: {
  entries: ScoreEntry[];
  title?: string;
}) {
  if (entries.length === 0) {
    return (
      <section className="animate-rise-late mt-auto border-t border-smoke/80 pt-6">
        <h3 className="text-[11px] uppercase tracking-[0.3em] text-ash">
          {title}
        </h3>
        <p className="mt-3 text-sm text-ash">No scores yet. Be the first.</p>
      </section>
    );
  }

  return (
    <section className="animate-rise-late mt-auto border-t border-smoke/80 pt-6">
      <h3 className="text-[11px] uppercase tracking-[0.3em] text-ash">{title}</h3>
      <ol className="mt-3 space-y-2">
        {entries.map((entry, index) => (
          <li
            key={entry.id}
            className="flex items-center justify-between gap-3 rounded-xl border border-smoke/70 bg-ink-soft/50 px-3 py-2 font-mono text-sm"
          >
            <span className="text-ash">{index + 1}</span>
            <span className="flex-1 truncate text-paper">{entry.name}</span>
            <span className="text-ash">{entry.difficulty}</span>
            <span className="text-amber">{entry.score}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
