"use client";

import { useEffect, useState } from "react";
import {
  isMuted,
  loadMutePreference,
  playSound,
  setMuted,
} from "@/lib/sound";

export function SoundToggle() {
  const [muted, setMutedState] = useState(false);

  useEffect(() => {
    setMutedState(loadMutePreference());
  }, []);

  return (
    <button
      type="button"
      aria-pressed={!muted}
      onClick={() => {
        const next = !isMuted();
        setMuted(next);
        setMutedState(next);
        if (!next) playSound("tick");
      }}
      className="rounded-full border border-smoke bg-ink-soft/80 px-3 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-ash transition hover:border-paper hover:text-paper"
    >
      {muted ? "Sound off" : "Sound on"}
    </button>
  );
}
