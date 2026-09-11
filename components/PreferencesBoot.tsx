"use client";

import { useEffect } from "react";
import { applyPreferences, loadPreferences } from "@/lib/preferences";

/** Applies saved theme prefs on the client after hydration. */
export function PreferencesBoot() {
  useEffect(() => {
    applyPreferences(loadPreferences());
  }, []);
  return null;
}
