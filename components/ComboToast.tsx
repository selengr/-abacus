"use client";

type ComboToastProps = {
  points: number | null;
  streak: number;
};

export function ComboToast({ points, streak }: ComboToastProps) {
  if (points === null) return null;

  return (
    <div
      key={`${points}-${streak}`}
      className="pointer-events-none fixed left-1/2 top-24 z-40 -translate-x-1/2 animate-combo rounded-full border border-amber/40 bg-ink/90 px-5 py-2 font-mono text-sm text-amber shadow-[0_12px_40px_rgba(0,0,0,0.45)] backdrop-blur"
    >
      +{points}
      {streak > 1 ? ` · x${streak} streak` : ""}
    </div>
  );
}
