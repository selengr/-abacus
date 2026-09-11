"use client";

type CountdownOverlayProps = {
  value: number | null;
};

export function CountdownOverlay({ value }: CountdownOverlayProps) {
  if (value === null || value <= 0) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-40 flex items-center justify-center bg-ink/55 backdrop-blur-[2px]">
      <p
        key={value}
        className="animate-countdown font-display text-[clamp(5rem,22vw,10rem)] font-semibold leading-none text-paper"
      >
        {value}
      </p>
    </div>
  );
}
