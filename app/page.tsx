import Link from "next/link";

export default function HomePage() {
  return (
    <main className="relative z-10 flex min-h-dvh flex-col">
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col justify-between px-6 py-8 sm:px-10">
        <nav className="animate-rise flex items-center justify-between">
          <p className="text-[11px] uppercase tracking-[0.4em] text-ash">
            Digital soroban
          </p>
          <div className="flex gap-4 text-sm text-paper/80">
            <Link href="/play" className="transition hover:text-amber">
              Solo
            </Link>
            <Link href="/play/race" className="transition hover:text-amber">
              Race
            </Link>
          </div>
        </nav>

        <section className="relative flex flex-1 flex-col justify-center py-16">
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
            public board — or race a rival on the same seeded problems.
          </p>
          <div className="animate-rise-late mt-10 flex flex-wrap items-center gap-4">
            <Link
              href="/play"
              className="rounded-full bg-lacquer px-8 py-4 text-sm font-medium uppercase tracking-[0.22em] text-white transition hover:bg-lacquer-deep"
            >
              Play solo
            </Link>
            <Link
              href="/play/race"
              className="rounded-full border border-smoke px-8 py-4 text-sm font-medium uppercase tracking-[0.22em] text-paper transition hover:border-amber hover:text-amber"
            >
              Race a rival
            </Link>
          </div>
          <p className="animate-rise-late mt-6 font-mono text-xs text-ash">
            public scores · sound · 1v1 race rooms
          </p>
        </section>

        <footer className="animate-rise-late border-t border-smoke/60 pt-6 text-xs text-ash">
          Heaven beads are five. Earth beads are one. Trust your hands.
        </footer>
      </div>
    </main>
  );
}
