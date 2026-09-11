"use client";

type CelebrationProps = {
  active: boolean;
};

export function Celebration({ active }: CelebrationProps) {
  if (!active) return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-30 overflow-hidden"
    >
      {Array.from({ length: 18 }, (_, index) => (
        <span
          key={index}
          className="absolute top-[-10%] h-2 w-2 animate-confetti rounded-sm"
          style={{
            left: `${6 + ((index * 17) % 88)}%`,
            animationDelay: `${(index % 6) * 0.08}s`,
            background:
              index % 3 === 0
                ? "var(--color-lacquer)"
                : index % 3 === 1
                  ? "var(--color-amber)"
                  : "var(--color-paper)",
          }}
        />
      ))}
    </div>
  );
}
