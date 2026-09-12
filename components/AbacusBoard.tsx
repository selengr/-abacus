"use client";

import { useEffect, useState } from "react";
import type { RodState } from "@/lib/abacus";

type BeadProps = {
  active: boolean;
  heaven?: boolean;
  onClick: () => void;
  disabled?: boolean;
  hint?: boolean;
};

function Bead({
  active,
  heaven = false,
  onClick,
  disabled,
  hint = false,
}: BeadProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-pressed={active}
      className={[
        "bead relative z-10 h-9 w-[90%] max-w-[56px] touch-manipulation rounded-full border transition-all duration-200 sm:h-8 sm:max-w-[52px]",
        "shadow-[inset_0_2px_4px_rgba(255,255,255,0.28),0_4px_10px_rgba(0,0,0,0.35)]",
        "disabled:cursor-not-allowed disabled:opacity-60",
        "active:bead-press focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber",
        heaven
          ? active
            ? "border-lacquer/40 bg-gradient-to-b from-lacquer to-lacquer-deep"
            : "border-wood-light/50 bg-gradient-to-b from-[#7a3a2a] to-[#4a1f16]"
          : active
            ? "border-amber-hot/50 bg-gradient-to-b from-amber-hot to-amber"
            : "border-wood-light/40 bg-gradient-to-b from-[#8a6238] to-[#5a3a20]",
        hint && !active
          ? "ring-2 ring-amber/80 ring-offset-1 ring-offset-[#24170f] animate-pulse"
          : "",
      ].join(" ")}
    />
  );
}

type RodProps = {
  rod: RodState;
  hint?: RodState | null;
  label: string;
  selected?: boolean;
  onSelect?: () => void;
  onChange: (next: RodState) => void;
  disabled?: boolean;
  compact?: boolean;
};

export function Rod({
  rod,
  hint,
  label,
  selected,
  onSelect,
  onChange,
  disabled,
  compact,
}: RodProps) {
  const setEarth = (count: number) => {
    if (disabled) return;
    onChange({ ...rod, earth: rod.earth === count ? count - 1 : count });
  };

  return (
    <div
      className={[
        "flex w-[14%] flex-col items-center rounded-lg transition",
        compact ? "min-w-[44px] max-w-[56px]" : "min-w-[52px] max-w-[72px]",
        selected ? "ring-2 ring-amber/70 ring-offset-2 ring-offset-[#24170f]" : "",
      ].join(" ")}
    >
      <button
        type="button"
        disabled={disabled}
        onClick={onSelect}
        className="mb-1 text-xs text-ash hover:text-amber"
      >
        {label}
      </button>
      <div
        className={[
          "relative flex w-full flex-col items-center rounded-sm bg-gradient-to-b from-wood-light to-wood px-1 py-2 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.35)]",
          compact ? "h-[220px]" : "h-[300px] sm:h-[280px]",
        ].join(" ")}
      >
        <div className="pointer-events-none absolute inset-y-2 left-1/2 w-[3px] -translate-x-1/2 rounded-full bg-beam/80" />

        <div
          className={[
            "relative z-10 flex w-full flex-col items-center justify-start gap-1 pt-1",
            compact ? "h-[56px]" : "h-[72px]",
          ].join(" ")}
        >
          <Bead
            heaven
            active={rod.heaven}
            hint={Boolean(hint?.heaven)}
            disabled={disabled}
            onClick={() => onChange({ ...rod, heaven: !rod.heaven })}
          />
        </div>

        <div className="relative z-20 my-1 h-[6px] w-[120%] rounded-sm bg-gradient-to-b from-beam to-[#a89068] shadow-[0_2px_4px_rgba(0,0,0,0.4)]" />

        <div
          className={[
            "relative z-10 flex w-full flex-col-reverse items-center justify-start gap-1 pb-1",
            compact ? "h-[130px]" : "h-[170px]",
          ].join(" ")}
        >
          {[1, 2, 3, 4].map((count) => (
            <Bead
              key={count}
              active={rod.earth >= count}
              hint={Boolean(hint && hint.earth >= count)}
              disabled={disabled}
              onClick={() => setEarth(count)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

type AbacusBoardProps = {
  rods: RodState[];
  onChange: (rods: RodState[]) => void;
  disabled?: boolean;
  matched?: boolean;
  compact?: boolean;
  /** Ghost the target bead layout without moving beads. */
  hintRods?: RodState[] | null;
};

const PLACE_LABELS = ["Ten-thousands", "Thousands", "Hundreds", "Tens", "Ones"];

export function AbacusBoard({
  rods,
  onChange,
  disabled,
  matched,
  compact,
  hintRods = null,
}: AbacusBoardProps) {
  const [selected, setSelected] = useState(0);
  const activeRod = Math.min(selected, Math.max(rods.length - 1, 0));

  useEffect(() => {
    if (disabled) return;

    function onKeyDown(event: KeyboardEvent) {
      const tag = (event.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        setSelected((s) => Math.max(0, Math.min(s, rods.length - 1) - 1));
        return;
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        setSelected((s) =>
          Math.min(rods.length - 1, Math.min(s, rods.length - 1) + 1),
        );
        return;
      }
      if (event.key.toLowerCase() === "h" || event.key === "5") {
        event.preventDefault();
        const copy = [...rods];
        const rod = copy[activeRod];
        if (!rod) return;
        copy[activeRod] = { ...rod, heaven: !rod.heaven };
        onChange(copy);
        return;
      }
      if (/^[0-4]$/.test(event.key)) {
        event.preventDefault();
        const earth = Number(event.key);
        const copy = [...rods];
        const rod = copy[activeRod];
        if (!rod) return;
        copy[activeRod] = { ...rod, earth };
        onChange(copy);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeRod, disabled, onChange, rods]);

  return (
    <div
      className={[
        "w-full rounded-2xl border border-smoke bg-gradient-to-b from-[#3a2818] to-[#24170f] shadow-[0_30px_80px_rgba(0,0,0,0.45)]",
        compact
          ? "max-w-xs p-3"
          : rods.length <= 3
            ? "max-w-xl p-4 sm:p-6"
            : "max-w-3xl p-4 sm:p-6",
        matched ? "match-glow" : "",
      ].join(" ")}
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 px-1">
        <p className="text-sm text-ash">Your board</p>
        {!compact && (
          <p className="text-xs text-amber">
            arrows · 0-4 bottom · H/5 top
          </p>
        )}
      </div>
      <div className="flex justify-center gap-2 sm:gap-3">
        {rods.map((rod, index) => (
          <Rod
            key={index}
            rod={rod}
            hint={hintRods?.[index] ?? null}
            compact={compact}
            selected={activeRod === index}
            onSelect={() => setSelected(index)}
            label={
              PLACE_LABELS[PLACE_LABELS.length - rods.length + index] ??
              `${10 ** (rods.length - 1 - index)}`
            }
            disabled={disabled}
            onChange={(next) => {
              const copy = [...rods];
              copy[index] = next;
              onChange(copy);
            }}
          />
        ))}
      </div>
    </div>
  );
}
