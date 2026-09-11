import Link from "next/link";
import { DailyResetClock } from "@/components/DailyResetClock";
import { SiteNav } from "@/components/SiteNav";

const MODES = [
  {
    href: "/play/daily",
    label: "Daily",
    detail: "One shared seeded board every UTC day.",
  },
  {
    href: "/play",
    label: "Timed",
    detail: "Ninety seconds. Easy, medium, or hard.",
  },
  {
    href: "/play/practice",
    label: "Practice",
    detail: "No clock. Warm up the beads.",
  },
  {
    href: "/play/race",
    label: "Race",
    detail: "Invite a rival. Same problems. Faster hands win.",
  },
] as const;

export default function HomePage() {
  return (
    <main className="relative z-10 flex min-h-dvh flex-col">
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col justify-between px-6 py-8 sm:px-10">
        <div className="animate-rise flex items-center justify-between gap-4">
          <p className="text-[11px] uppercase tracking-[0.4em] text-ash">
            Digital soroban
          </p>
          <SiteNav />
        </div>

        <section className="relative flex flex-1 flex-col justify-center py-12 sm:py-16">
          <div
            aria-hidden
            className="pointer-events-none absolute -left-10 top-1/4 h-64 w-64 rounded-full bg-lacquer/20 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute right-0 bottom-10 h-72 w-72 rounded-full bg-amber/10 blur-3xl"
          />

          <p className="animate-rise text-[11px] uppercase tracking-[0.45em] text-lacquer">
            Abacus arena
          </p>
          <h1 className="animate-rise-delay mt-4 max-w-3xl text-[clamp(3.5rem,12vw,8rem)] font-semibold leading-[0.9] tracking-[-0.04em]">
            SOROBAN
          </h1>
          <p className="animate-rise-late mt-6 max-w-md text-lg text-ash sm:text-xl">
            Slide lacquer beads against the beam. Match the sum. Climb the
            public board, crush the daily, or race a rival.
          </p>
          <div className="animate-rise-late mt-8">
            <DailyResetClock className="text-sm" />
          </div>

          <div className="animate-rise-late mt-10 flex flex-wrap items-center gap-4">
            <Link
              href="/play/daily"
              className="rounded-full bg-lacquer px-8 py-4 text-sm font-medium uppercase tracking-[0.22em] text-white transition hover:bg-lacquer-deep"
            >
              Daily challenge
            </Link>
            <Link
              href="/play"
              className="rounded-full border border-smoke px-8 py-4 text-sm font-medium uppercase tracking-[0.22em] text-paper transition hover:border-amber hover:text-amber"
            >
              Timed solo
            </Link>
          </div>

          <div className="animate-rise-late mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {MODES.map((mode) => (
              <Link
                key={mode.href}
                href={mode.href}
                className="rounded-2xl border border-smoke/80 bg-ink-soft/40 p-4 transition hover:border-amber/50 hover:bg-ink-soft/70"
              >
                <p className="text-[11px] uppercase tracking-[0.28em] text-amber">
                  {mode.label}
                </p>
                <p className="mt-2 text-sm text-ash">{mode.detail}</p>
              </Link>
            ))}
          </div>

          <p className="animate-rise-late mt-6 font-mono text-xs text-ash">
            open at http://localhost:3010 · port 3000 may be another app
          </p>
        </section>

        <footer className="animate-rise-late border-t border-smoke/60 pt-6 text-xs text-ash">
          Heaven beads are five. Earth beads are one. Trust your hands.
        </footer>
      </div>
    </main>
  );
}
