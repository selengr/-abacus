import React from "react";
import styles from "../../styles/abacus/game.module.css";
import { AbacusColumn } from "./AbacusColumn";
import { abacusValue, rodValue } from "./scoring";
import type { RodState } from "./types";

interface AbacusBoardProps {
  rods: RodState[];
  disabled?: boolean;
  onChange: (rods: RodState[]) => void;
}

export function AbacusBoard({ rods, disabled, onChange }: AbacusBoardProps) {
  const value = abacusValue(rods);

  const updateRod = (index: number, next: RodState) => {
    const copy = rods.slice();
    copy[index] = next;
    onChange(copy);
  };

  return (
    <div className={styles.boardWrap}>
      <div className={styles.board} role="group" aria-label="چرتکه سوروبان">
        {rods.map((rod, index) => (
          <AbacusColumn
            key={index}
            rod={rod}
            placeIndex={rods.length - 1 - index}
            disabled={disabled}
            onChange={(next) => updateRod(index, next)}
          />
        ))}
      </div>
      <div className={styles.readout} aria-live="polite" aria-label={`مقدار فعلی ${value}`}>
        {rods.map((rod, index) => (
          <span key={index} className={styles.readoutDigit}>
            {rodValue(rod)}
          </span>
        ))}
      </div>
    </div>
  );
}

export default AbacusBoard;
