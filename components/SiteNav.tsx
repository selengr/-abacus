import Link from "next/link";

const LINKS = [
  { href: "/play", label: "Play" },
  { href: "/play/race", label: "Race" },
  { href: "/settings", label: "Settings" },
] as const;

export function SiteNav({ active }: { active?: string }) {
  return (
    <nav className="flex flex-wrap items-center gap-4 text-base text-paper/80">
      {LINKS.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={[
            "transition hover:text-amber",
            active === link.href ? "text-amber" : "",
          ].join(" ")}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
