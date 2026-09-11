"use client";

import { useEffect, useState } from "react";
import { formatDuration, msUntilNextUtcDay } from "@/lib/daily";

type DailyResetClockProps = {
  label?: string;
  className?: string;
};

export function DailyResetClock({
  label = "New daily in",
  className = "",
}: DailyResetClockProps) {
  const [remaining, setRemaining] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const tick = () => {
      setRemaining(msUntilNextUtcDay());
      setReady(true);
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <p
      className={[
        "font-mono text-xs tracking-[0.08em] text-ash",
        className,
      ].join(" ")}
    >
      {label}{" "}
      <span className="text-amber">
        {ready ? formatDuration(remaining) : "--:--:--"}
      </span>
    </p>
  );
}
