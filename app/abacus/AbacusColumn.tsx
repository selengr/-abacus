import React from "react";
import styles from "../../styles/abacus/game.module.css";
import type { RodState } from "./types";

interface AbacusColumnProps {
  rod: RodState;
  placeIndex: number;
  disabled?: boolean;
  onChange: (next: RodState) => void;
}

/**
 * One soroban rod: 1 heaven bead (5) + 4 earth beads (1 each).
 * Click beads to slide them toward/away from the reckoning bar.
 */
export function AbacusColumn({ rod, placeIndex, disabled, onChange }: AbacusColumnProps) {
  const setHeaven = () => {
    if (disabled) return;
    onChange({ ...rod, heaven: !rod.heaven });
  };

  const setEarth = (count: number) => {
    if (disabled) return;
    // Toggle: clicking the same active height clears to count-1; else set to count
    const nextEarth = rod.earth === count ? count - 1 : count;
    onChange({ ...rod, earth: Math.max(0, Math.min(4, nextEarth)) });
  };

  return (
    <div className={styles.column} data-place={placeIndex} aria-label={`میله ارزش ${Math.pow(10, placeIndex)}`}>
      <div className={styles.rail} aria-hidden />
      <div className={styles.bar} aria-hidden />

      <button
        type="button"
        className={`${styles.bead} ${styles.heaven} ${rod.heaven ? styles.active : ""}`}
        onClick={setHeaven}
        disabled={disabled}
        aria-pressed={rod.heaven}
        aria-label="مهره آسمانی (۵)"
      />

      {[1, 2, 3, 4].map((n) => {
        const active = rod.earth >= n;
        return (
          <button
            type="button"
            key={n}
            className={`${styles.bead} ${styles.earth} ${styles[`earth${n}`]} ${active ? styles.active : ""}`}
            onClick={() => setEarth(n)}
            disabled={disabled}
            aria-pressed={active}
            aria-label={`مهره زمینی ${n}`}
          />
        );
      })}
    </div>
  );
}

export default AbacusColumn;
