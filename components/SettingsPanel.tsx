"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { clearAchievements } from "@/lib/achievements";
import {
  getPlayerNameServerSnapshot,
  getPlayerNameSnapshot,
  savePlayerName,
  subscribePlayerName,
} from "@/lib/player";
import {
  type AccentTheme,
  type Preferences,
  getPreferencesServerSnapshot,
  getPreferencesSnapshot,
  loadPreferences,
  savePreferences,
  subscribePreferences,
} from "@/lib/preferences";
import { clearRuns } from "@/lib/runs";
import {
  isMuted,
  playSound,
  setMuted,
  subscribeMute,
} from "@/lib/sound";
import { clearStats } from "@/lib/stats";

const ACCENTS: { id: AccentTheme; label: string; swatch: string }[] = [
  { id: "lacquer", label: "Red", swatch: "#e23a28" },
  { id: "jade", label: "Green", swatch: "#2f9e6e" },
  { id: "indigo", label: "Blue", swatch: "#4f6fd8" },
];

function getMuteSnapshot() {
  return isMuted() ? "1" : "0";
}

function getMuteServerSnapshot() {
  return "0";
}

export function SettingsPanel() {
  const prefsJson = useSyncExternalStore(
    subscribePreferences,
    getPreferencesSnapshot,
    getPreferencesServerSnapshot,
  );
  const prefs = useMemo(
    () => JSON.parse(prefsJson) as Preferences,
    [prefsJson],
  );
  const mutedFlag = useSyncExternalStore(
    subscribeMute,
    getMuteSnapshot,
    getMuteServerSnapshot,
  );
  const muted = mutedFlag === "1";
  const storedName = useSyncExternalStore(
    subscribePlayerName,
    getPlayerNameSnapshot,
    getPlayerNameServerSnapshot,
  );
  const [nameDraft, setNameDraft] = useState<string | null>(null);
  const name = nameDraft ?? storedName;
  const [savedFlash, setSavedFlash] = useState(false);
  const [resetFlash, setResetFlash] = useState(false);

  function patchPrefs(partial: Partial<Preferences>) {
    savePreferences({ ...loadPreferences(), ...partial });
  }

  function saveName() {
    savePlayerName(name);
    setNameDraft(null);
    setSavedFlash(true);
    window.setTimeout(() => setSavedFlash(false), 1400);
    playSound("tick");
  }

  function resetLocal() {
    if (
      !window.confirm(
        "Clear your scores and badges on this device? Your name and colors stay.",
      )
    ) {
      return;
    }
    clearStats();
    clearRuns();
    clearAchievements();
    setResetFlash(true);
    window.setTimeout(() => setResetFlash(false), 1600);
    playSound("clear");
  }

  return (
    <section className="space-y-8">
      <div className="rounded-2xl border border-smoke/70 bg-ink-soft/40 p-5">
        <h2 className="text-base font-medium text-paper">Your name</h2>
        <p className="mt-2 text-sm text-ash">
          Shown when you save a score or race a friend.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <input
            value={name}
            maxLength={16}
            onChange={(e) => setNameDraft(e.target.value)}
            placeholder="Your name"
            className="min-w-[12rem] flex-1 rounded-xl border border-smoke bg-ink/60 px-4 py-3 font-mono text-sm text-paper outline-none transition focus:border-amber"
          />
          <button
            type="button"
            onClick={saveName}
            className="rounded-full bg-lacquer px-5 py-3 text-xs font-medium uppercase tracking-[0.2em] text-white transition hover:bg-lacquer-deep"
          >
            Save
          </button>
        </div>
        {savedFlash && (
          <p className="mt-2 font-mono text-xs text-amber">Name saved.</p>
        )}
      </div>

      <div className="rounded-2xl border border-smoke/70 bg-ink-soft/40 p-5">
        <h2 className="text-base font-medium text-paper">Colors</h2>
        <p className="mt-2 text-sm text-ash">Pick a look you like.</p>
        <div className="mt-4 flex flex-wrap gap-3">
          {ACCENTS.map((accent) => {
            const active = prefs.accent === accent.id;
            return (
              <button
                key={accent.id}
                type="button"
                onClick={() => {
                  patchPrefs({ accent: accent.id });
                  playSound("bead");
                }}
                className={[
                  "flex items-center gap-3 rounded-full border px-4 py-2.5 text-sm transition",
                  active
                    ? "border-amber text-amber"
                    : "border-smoke text-ash hover:border-paper hover:text-paper",
                ].join(" ")}
              >
                <span
                  aria-hidden
                  className="h-3 w-3 rounded-full"
                  style={{ background: accent.swatch }}
                />
                {accent.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-2xl border border-smoke/70 bg-ink-soft/40 p-5">
        <h2 className="text-base font-medium text-paper">Sound & motion</h2>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <button
            type="button"
            aria-pressed={!muted}
            onClick={() => {
              const next = !isMuted();
              setMuted(next);
              if (!next) playSound("tick");
            }}
            className="rounded-full border border-smoke bg-ink/50 px-4 py-2.5 text-sm text-ash transition hover:border-paper hover:text-paper"
          >
            {muted ? "Mute" : "Sound"}
          </button>
          <button
            type="button"
            aria-pressed={prefs.reduceMotion}
            onClick={() => {
              patchPrefs({ reduceMotion: !prefs.reduceMotion });
              playSound("tick");
            }}
            className={[
              "rounded-full border px-4 py-2.5 text-sm transition",
              prefs.reduceMotion
                ? "border-amber text-amber"
                : "border-smoke text-ash hover:border-paper hover:text-paper",
            ].join(" ")}
          >
            {prefs.reduceMotion ? "Less motion" : "Motion on"}
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-smoke/70 bg-ink-soft/40 p-5">
        <h2 className="text-base font-medium text-paper">Reset</h2>
        <p className="mt-2 text-sm text-ash">
          Clear scores and badges saved on this device.
        </p>
        <button
          type="button"
          onClick={resetLocal}
          className="mt-4 rounded-full border border-lacquer/50 px-5 py-2.5 text-sm text-lacquer transition hover:bg-lacquer/10"
        >
          Clear my progress
        </button>
        {resetFlash && (
          <p className="mt-2 text-sm text-amber">Cleared.</p>
        )}
      </div>
    </section>
  );
}
