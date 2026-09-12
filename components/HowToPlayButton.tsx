"use client";

import { openHowToPlay } from "@/components/HowToPlay";

export function HowToPlayButton({
  className,
  children = "How to play",
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <button type="button" onClick={() => openHowToPlay()} className={className}>
      {children}
    </button>
  );
}
