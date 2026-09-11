const NAME_KEY = "soroban-player-name-v1";

export function loadPlayerName(): string {
  if (typeof window === "undefined") return "";
  try {
    return window.localStorage.getItem(NAME_KEY)?.slice(0, 16) ?? "";
  } catch {
    return "";
  }
}

export function savePlayerName(name: string): string {
  const trimmed = name.trim().slice(0, 16);
  if (typeof window !== "undefined") {
    window.localStorage.setItem(NAME_KEY, trimmed);
  }
  return trimmed;
}
