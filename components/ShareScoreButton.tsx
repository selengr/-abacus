"use client";

import { useState } from "react";

type ShareScoreButtonProps = {
  score: number;
  solved: number;
  modeLabel: string;
};

export function ShareScoreButton({
  score,
  solved,
  modeLabel,
}: ShareScoreButtonProps) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const text = `Soroban Arena · ${modeLabel}\nScore ${score} · ${solved} solved\n${typeof window !== "undefined" ? window.location.origin : "soroban-arena"}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "Soroban Arena", text });
        return;
      }
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1600);
      } catch {
        window.prompt("Copy your result", text);
      }
    }
  }

  return (
    <button
      type="button"
      onClick={() => void share()}
      className="rounded-full border border-smoke px-5 py-3 text-sm uppercase tracking-[0.18em] text-ash transition hover:border-amber hover:text-amber"
    >
      {copied ? "Copied" : "Share result"}
    </button>
  );
}
