import Link from "next/link";

export default function NotFound() {
  return (
    <main className="relative z-10 flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <p className="text-[11px] uppercase tracking-[0.35em] text-ash">404</p>
      <h1 className="mt-3 text-5xl font-semibold tracking-tight">Off the beam</h1>
      <p className="mt-3 max-w-sm text-ash">
        This rod does not exist. Slide back to the arena.
      </p>
      <Link
        href="/"
        className="mt-8 rounded-full bg-lacquer px-6 py-3 text-sm uppercase tracking-[0.2em] text-white"
      >
        Home
      </Link>
    </main>
  );
}
