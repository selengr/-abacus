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
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    const id = window.setInterval(() => {
      setRemaining(msUntilNextUtcDay());
    }, 1000);
    const boot = window.setTimeout(() => {
      setRemaining(msUntilNextUtcDay());
    }, 0);
    return () => {
      window.clearInterval(id);
      window.clearTimeout(boot);
    };
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
        {remaining === null ? "--:--:--" : formatDuration(remaining)}
      </span>
    </p>
  );
}
