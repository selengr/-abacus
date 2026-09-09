"use client";

import { useSyncExternalStore } from "react";

const STORAGE_KEY = "soroban-howto-seen-v1";
const CHANGE_EVENT = "soroban-howto-changed";

type HowToState = {
  forceOpen: boolean;
  step: number;
};

const state: HowToState = {
  forceOpen: false,
  step: 0,
};

function emit() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }
}

export function openHowToPlay() {
  state.forceOpen = true;
  state.step = 0;
  emit();
}

export function closeHowToPlay(markSeen = true) {
  state.forceOpen = false;
  state.step = 0;
  if (markSeen && typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, "1");
  }
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
  const open = state.forceOpen || !seen;
  return JSON.stringify({ open, step: state.step });
}

function getServerSnapshot() {
  return JSON.stringify({ open: false, step: 0 });
}

const STEPS = [
  {
    title: "Heaven bead = 5",
    body: "The single bead above the beam is worth five. Tap it toward the beam to count it.",
  },
  {
    title: "Earth beads = 1",
    body: "The four beads below the beam are worth one each. Slide them up to the beam to add.",
  },
  {
    title: "Read the rods",
    body: "Rods are place values from left to right: ten-thousands down to ones. Match the sum on the board.",
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

  if (!open) return null;

  const current = STEPS[Math.min(step, STEPS.length - 1)] ?? STEPS[0];
  const last = step >= STEPS.length - 1;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/80 p-4 backdrop-blur-sm sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="howto-title"
    >
      <div className="animate-rise w-full max-w-md rounded-3xl border border-smoke bg-ink-soft p-6 shadow-[0_30px_80px_rgba(0,0,0,0.55)]">
        <p className="text-[11px] uppercase tracking-[0.3em] text-ash">
          How to play · {Math.min(step, STEPS.length - 1) + 1}/{STEPS.length}
        </p>
        <h2
          id="howto-title"
          className="mt-3 text-3xl font-semibold tracking-tight"
        >
          {current.title}
        </h2>
        <p className="mt-3 text-ash">{current.body}</p>

        <div className="mt-6 flex h-2 gap-2">
          {STEPS.map((_, index) => (
            <span
              key={index}
              className={[
                "h-full flex-1 rounded-full transition",
                index <= step ? "bg-lacquer" : "bg-smoke",
              ].join(" ")}
            />
          ))}
        </div>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={() => closeHowToPlay(true)}
            className="rounded-full border border-smoke px-4 py-3 text-sm text-ash transition hover:border-paper hover:text-paper"
          >
            Skip
          </button>
          <button
            type="button"
            onClick={() => {
              if (last) {
                closeHowToPlay(true);
                return;
              }
              state.step += 1;
              emit();
            }}
            className="flex-1 rounded-full bg-lacquer px-4 py-3 text-sm font-medium uppercase tracking-[0.18em] text-white transition hover:bg-lacquer-deep"
          >
            {last ? "Got it" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}
