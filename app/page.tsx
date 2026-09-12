import Link from "next/link";
import { HowToPlay } from "@/components/HowToPlay";
import { HowToPlayButton } from "@/components/HowToPlayButton";
import { SiteNav } from "@/components/SiteNav";

const MODES = [
  {
    href: "/play",
    label: "Play",
    detail: "90 seconds. Slide beads. Get points.",
  },
  {
    href: "/play/daily",
    label: "Today’s puzzle",
    detail: "Same puzzle for everyone today.",
  },
  {
    href: "/play/race",
    label: "Race a friend",
    detail: "Share a code. Who is faster?",
  },
] as const;

export default function HomePage() {
  return (
    <main className="relative z-10 flex min-h-dvh flex-col">
      <HowToPlay />
      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-6 py-8 sm:px-10">
        <div className="animate-rise flex items-center justify-between gap-4">
          <p className="text-sm font-medium tracking-wide text-ash">Soroban</p>
          <SiteNav />
        </div>

        <section className="relative flex flex-1 flex-col justify-center py-14 sm:py-20">
          <div
            aria-hidden
            className="pointer-events-none absolute -left-10 top-1/4 h-64 w-64 rounded-full bg-lacquer/20 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute right-0 bottom-10 h-72 w-72 rounded-full bg-amber/10 blur-3xl"
          />

          <h1 className="animate-rise max-w-3xl text-[clamp(3.25rem,11vw,7rem)] font-semibold leading-[0.92] tracking-[-0.04em]">
            SOROBAN
          </h1>
          <p className="animate-rise-delay mt-5 max-w-md text-xl text-ash sm:text-2xl">
            Move the beads. Make the number. Have fun.
          </p>

          <div className="animate-rise-late mt-10 flex flex-wrap items-center gap-3">
            <Link
              href="/play"
              className="rounded-full bg-lacquer px-9 py-4 text-base font-medium text-white transition hover:bg-lacquer-deep"
            >
              Start playing
            </Link>
            <HowToPlayButton className="rounded-full border border-smoke px-7 py-4 text-base text-paper transition hover:border-amber hover:text-amber" />
          </div>

          <div className="animate-rise-late mt-14 grid gap-4 sm:grid-cols-3">
            {MODES.map((mode) => (
              <Link
                key={mode.href}
                href={mode.href}
                className="rounded-3xl border border-smoke/80 bg-ink-soft/50 p-5 transition hover:border-amber/50 hover:bg-ink-soft/80"
              >
                <p className="text-lg font-semibold text-paper">{mode.label}</p>
                <p className="mt-2 text-sm leading-relaxed text-ash">
                  {mode.detail}
                </p>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
