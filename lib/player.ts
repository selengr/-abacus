const NAME_KEY = "soroban-player-name-v1";
const CHANGE_EVENT = "soroban-player-name-changed";

function emit() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }
}

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
    emit();
  }
  return trimmed;
}

export function subscribePlayerName(onStoreChange: () => void) {
  if (typeof window === "undefined") return () => {};
  const handler = () => onStoreChange();
  window.addEventListener(CHANGE_EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(CHANGE_EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}

export function getPlayerNameSnapshot() {
  return loadPlayerName();
}

export function getPlayerNameServerSnapshot() {
  return "";
}
