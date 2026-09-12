"use client";

import { useSyncExternalStore } from "react";
import {
  isMuted,
  loadMutePreference,
  playSound,
  setMuted,
  subscribeMute,
} from "@/lib/sound";

function getMuteSnapshot() {
  return isMuted() ? "1" : "0";
}

function getMuteServerSnapshot() {
  return "0";
}

export function SoundToggle() {
  const mutedFlag = useSyncExternalStore(
    subscribeMute,
    getMuteSnapshot,
    getMuteServerSnapshot,
  );
  const muted = mutedFlag === "1";

  return (
    <button
      type="button"
      aria-pressed={!muted}
      onClick={() => {
        loadMutePreference();
        const next = !isMuted();
        setMuted(next);
        if (!next) playSound("tick");
      }}
      className="rounded-full border border-smoke bg-ink-soft/80 px-4 py-2 text-sm text-ash transition hover:border-paper hover:text-paper"
    >
      {muted ? "Mute" : "Sound"}
    </button>
  );
}
