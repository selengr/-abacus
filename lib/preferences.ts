export type AccentTheme = "lacquer" | "jade" | "indigo";

export type Preferences = {
  accent: AccentTheme;
  reduceMotion: boolean;
};

const STORAGE_KEY = "soroban-prefs-v1";
const CHANGE_EVENT = "soroban-prefs-changed";

const DEFAULTS: Preferences = {
  accent: "lacquer",
  reduceMotion: false,
};

function emit() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }
}

export function loadPreferences(): Preferences {
  if (typeof window === "undefined") return { ...DEFAULTS };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {
        ...DEFAULTS,
        reduceMotion: window.matchMedia("(prefers-reduced-motion: reduce)")
          .matches,
      };
    }
    return { ...DEFAULTS, ...(JSON.parse(raw) as Partial<Preferences>) };
  } catch {
    return { ...DEFAULTS };
  }
}

export function savePreferences(next: Preferences): Preferences {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  applyPreferences(next);
  emit();
  return next;
}

export function applyPreferences(prefs: Preferences = loadPreferences()) {
  if (typeof document === "undefined") return;
  document.documentElement.dataset.accent = prefs.accent;
  document.documentElement.dataset.reduceMotion = prefs.reduceMotion
    ? "true"
    : "false";
}

export function subscribePreferences(onStoreChange: () => void) {
  if (typeof window === "undefined") return () => {};
  const handler = () => onStoreChange();
  window.addEventListener(CHANGE_EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(CHANGE_EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}

export function getPreferencesSnapshot() {
  return JSON.stringify(loadPreferences());
}

export function getPreferencesServerSnapshot() {
  return JSON.stringify(DEFAULTS);
}
