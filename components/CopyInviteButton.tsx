"use client";

import { useState } from "react";

type CopyInviteProps = {
  code: string;
};

export function CopyInviteButton({ code }: CopyInviteProps) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    const url = `${window.location.origin}/play/race?code=${encodeURIComponent(code)}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      // fallback for older browsers
      window.prompt("Copy invite link", url);
    }
  }

  return (
    <button
      type="button"
      onClick={() => void copy()}
      className="rounded-full border border-smoke px-4 py-2 text-xs uppercase tracking-[0.18em] text-ash transition hover:border-amber hover:text-amber"
    >
      {copied ? "Link copied" : "Copy invite link"}
    </button>
  );
}
