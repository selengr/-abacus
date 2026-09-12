"use client";

import Link from "next/link";
import { useMemo, useState, useSyncExternalStore } from "react";
import { AbacusBoard } from "@/components/AbacusBoard";
import { abacusValue, emptyRods, type RodState } from "@/lib/abacus";
import { playSound } from "@/lib/sound";

const STORAGE_KEY = "soroban-howto-seen-v1";
const CHANGE_EVENT = "soroban-howto-changed";
const TRY_TARGET = 7;

type HowToState = {
  forceOpen: boolean;
  sessionDismissed: boolean;
  step: number;
};

const state: HowToState = {
  forceOpen: false,
  sessionDismissed: false,
  step: 0,
};

function emit() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }
}

export function openHowToPlay() {
  state.forceOpen = true;
  state.sessionDismissed = false;
  state.step = 0;
  emit();
}

export function closeHowToPlay(markSeen = true) {
  state.forceOpen = false;
  state.step = 0;
  if (markSeen && typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, "1");
  } else {
    state.sessionDismissed = true;
  }
  emit();
}

function setStep(next: number) {
  state.step = Math.max(0, next);
  emit();
}

function subscribe(onStoreChange: () => void) {
  if (typeof window === "undefined") return () => {};
  const handler = () => onStoreChange();
  window.addEventListener(CHANGE_EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(CHANGE_EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}

function getSnapshot() {
  const seen =
    typeof window !== "undefined" &&
    window.localStorage.getItem(STORAGE_KEY) === "1";
  const open = state.forceOpen || (!seen && !state.sessionDismissed);
  return JSON.stringify({ open, step: state.step });
}

function getServerSnapshot() {
  return JSON.stringify({ open: false, step: 0 });
}

type Step =
  | { kind: "text"; title: string; body: string }
  | { kind: "try"; title: string; body: string }
  | { kind: "done"; title: string; body: string };

const STEPS: Step[] = [
  {
    kind: "text",
    title: "Top bead = 5",
    body: "The bead above the bar is worth 5. Tap it toward the bar to turn it on.",
  },
  {
    kind: "text",
    title: "Bottom beads = 1",
    body: "Each bead under the bar is worth 1. Slide them up to add.",
  },
  {
    kind: "try",
    title: "Try: make 7",
    body: "Turn on the top bead (5) and two bottom beads (2). When it shows 7, tap Next.",
  },
  {
    kind: "text",
    title: "Keyboard (optional)",
    body: "Arrow keys pick a rod. Numbers 0–4 set bottom beads. H or 5 flips the top bead.",
  },
  {
    kind: "done",
    title: "You’re ready!",
    body: "Pick a mode and start. You can open this guide again anytime.",
  },
];

export function HowToPlay() {
  const snapshot = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
  const { open, step } = JSON.parse(snapshot) as {
    open: boolean;
    step: number;
  };
  const [rods, setRods] = useState<RodState[]>(() => emptyRods(1));
  const value = useMemo(() => abacusValue(rods), [rods]);
  const matched = value === TRY_TARGET;

  if (!open) return null;

  const index = Math.min(step, STEPS.length - 1);
  const current = STEPS[index] ?? STEPS[0];
  const last = index >= STEPS.length - 1;
  const tryStep = current.kind === "try";
  const canAdvance = !tryStep || matched;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/80 p-4 backdrop-blur-sm sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="howto-title"
    >
      <div className="animate-rise max-h-[92dvh] w-full max-w-md overflow-y-auto rounded-3xl border border-smoke bg-ink-soft p-6 shadow-[0_30px_80px_rgba(0,0,0,0.55)]">
        <p className="text-sm text-ash">
          How to play · {index + 1}/{STEPS.length}
        </p>
        <h2
          id="howto-title"
          className="mt-3 text-3xl font-semibold tracking-tight"
        >
          {current.title}
        </h2>
        <p className="mt-3 text-ash">{current.body}</p>

        {tryStep && (
          <div className="mt-5 flex flex-col items-center gap-3">
            <AbacusBoard
              compact
              rods={rods}
              matched={matched}
              onChange={(next) => {
                const nextValue = abacusValue(next);
                setRods(next);
                if (nextValue === TRY_TARGET && value !== TRY_TARGET) {
                  playSound("success");
                } else {
                  playSound("bead");
                }
              }}
            />
            <p className="font-mono text-sm text-ash">
              reads{" "}
              <span className={matched ? "text-amber" : "text-paper"}>
                {value}
              </span>
              {matched ? " · nice" : ` · aim for ${TRY_TARGET}`}
            </p>
          </div>
        )}

        {current.kind === "done" && (
          <div className="mt-5 flex flex-wrap gap-2">
            <Link
              href="/play/daily"
              onClick={() => closeHowToPlay(true)}
              className="rounded-full bg-lacquer px-4 py-2 text-xs font-medium uppercase tracking-[0.16em] text-white transition hover:bg-lacquer-deep"
            >
              Daily
            </Link>
            <Link
              href="/play"
              onClick={() => closeHowToPlay(true)}
              className="rounded-full border border-smoke px-4 py-2 text-xs font-medium uppercase tracking-[0.16em] text-paper transition hover:border-amber hover:text-amber"
            >
              Timed
            </Link>
            <Link
              href="/play/practice"
              onClick={() => closeHowToPlay(true)}
              className="rounded-full border border-smoke px-4 py-2 text-xs font-medium uppercase tracking-[0.16em] text-ash transition hover:border-paper hover:text-paper"
            >
              Practice
            </Link>
          </div>
        )}

        <div className="mt-6 flex h-2 gap-2">
          {STEPS.map((_, i) => (
            <span
              key={i}
              className={[
                "h-full flex-1 rounded-full transition",
                i <= index ? "bg-lacquer" : "bg-smoke",
              ].join(" ")}
            />
          ))}
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => closeHowToPlay(false)}
            className="rounded-full border border-smoke px-4 py-3 text-sm text-ash transition hover:border-paper hover:text-paper"
          >
            Skip
          </button>
          {index > 0 && (
            <button
              type="button"
              onClick={() => setStep(index - 1)}
              className="rounded-full border border-smoke px-4 py-3 text-sm text-ash transition hover:border-paper hover:text-paper"
            >
              Back
            </button>
          )}
          <button
            type="button"
            disabled={!canAdvance}
            onClick={() => {
              if (last) {
                closeHowToPlay(true);
                return;
              }
              if (tryStep) setRods(emptyRods(1));
              setStep(index + 1);
              playSound("tick");
            }}
            className="flex-1 rounded-full bg-lacquer px-4 py-3 text-base font-medium text-white transition hover:bg-lacquer-deep disabled:cursor-not-allowed disabled:opacity-40"
          >
            {last ? "Got it" : tryStep && !matched ? "Make 7 first" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}
