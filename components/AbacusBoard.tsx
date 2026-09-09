"use client";

import type { RodState } from "@/lib/abacus";

type BeadProps = {
  active: boolean;
  heaven?: boolean;
  onClick: () => void;
  disabled?: boolean;
};

function Bead({ active, heaven = false, onClick, disabled }: BeadProps) {
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
      ].join(" ")}
    />
  );
}

type RodProps = {
  rod: RodState;
  label: string;
  onChange: (next: RodState) => void;
  disabled?: boolean;
};

export function Rod({ rod, label, onChange, disabled }: RodProps) {
  const setEarth = (count: number) => {
    if (disabled) return;
    onChange({ ...rod, earth: rod.earth === count ? count - 1 : count });
  };

  return (
    <div className="flex w-[14%] min-w-[52px] max-w-[72px] flex-col items-center">
      <div className="relative flex h-[300px] w-full flex-col items-center rounded-sm bg-gradient-to-b from-wood-light to-wood px-1 py-2 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.35)] sm:h-[280px]">
        <div className="pointer-events-none absolute inset-y-2 left-1/2 w-[3px] -translate-x-1/2 rounded-full bg-beam/80" />

        <div className="relative z-10 flex h-[72px] w-full flex-col items-center justify-start gap-1 pt-1">
          <Bead
            heaven
            active={rod.heaven}
            disabled={disabled}
            onClick={() => onChange({ ...rod, heaven: !rod.heaven })}
          />
        </div>

        <div className="relative z-20 my-1 h-[6px] w-[120%] rounded-sm bg-gradient-to-b from-beam to-[#a89068] shadow-[0_2px_4px_rgba(0,0,0,0.4)]" />

        <div className="relative z-10 flex h-[170px] w-full flex-col-reverse items-center justify-start gap-1 pb-1">
          {[1, 2, 3, 4].map((count) => (
            <Bead
              key={count}
              active={rod.earth >= count}
              disabled={disabled}
              onClick={() => setEarth(count)}
            />
          ))}
        </div>
      </div>
      <span className="mt-2 font-mono text-xs tracking-widest text-ash">{label}</span>
    </div>
  );
}

type AbacusBoardProps = {
  rods: RodState[];
  onChange: (rods: RodState[]) => void;
  disabled?: boolean;
  matched?: boolean;
};

const PLACE_LABELS = ["10000s", "1000s", "100s", "10s", "1s"];

export function AbacusBoard({
  rods,
  onChange,
  disabled,
  matched,
}: AbacusBoardProps) {
  return (
    <div
      className={[
        "w-full max-w-3xl rounded-2xl border border-smoke bg-gradient-to-b from-[#3a2818] to-[#24170f] p-4 shadow-[0_30px_80px_rgba(0,0,0,0.45)] sm:p-6",
        matched ? "match-glow" : "",
      ].join(" ")}
    >
      <div className="mb-3 flex items-center justify-between px-1">
        <p className="text-[11px] uppercase tracking-[0.28em] text-ash">
          Soroban
        </p>
        <p className="font-mono text-xs text-amber">heaven 5 · earth 1</p>
      </div>
      <div className="flex justify-center gap-1 sm:gap-2">
        {rods.map((rod, index) => (
          <Rod
            key={index}
            rod={rod}
            label={PLACE_LABELS[PLACE_LABELS.length - rods.length + index] ?? `${10 ** (rods.length - 1 - index)}`}
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
