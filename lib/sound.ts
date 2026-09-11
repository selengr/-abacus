const MUTE_KEY = "soroban-mute-v1";
const MUTE_EVENT = "soroban-mute-changed";

type SoundName =
  | "bead"
  | "success"
  | "clear"
  | "skip"
  | "break"
  | "tick"
  | "end"
  | "start";

let ctx: AudioContext | null = null;
let muted = false;

function getCtx() {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    ctx = new AudioCtx();
  }
  return ctx;
}

function notifyMute() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(MUTE_EVENT));
  }
}

export function loadMutePreference() {
  if (typeof window === "undefined") return false;
  muted = window.localStorage.getItem(MUTE_KEY) === "1";
  return muted;
}

export function isMuted() {
  if (typeof window !== "undefined" && !muted) {
    muted = window.localStorage.getItem(MUTE_KEY) === "1";
  }
  return muted;
}

export function setMuted(next: boolean) {
  muted = next;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(MUTE_KEY, next ? "1" : "0");
  }
  notifyMute();
  if (!next) {
    void getCtx()?.resume();
  }
}

export function subscribeMute(onStoreChange: () => void) {
  if (typeof window === "undefined") return () => {};
  loadMutePreference();
  const handler = () => onStoreChange();
  window.addEventListener(MUTE_EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(MUTE_EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}

function tone(
  frequency: number,
  duration: number,
  type: OscillatorType,
  gainValue: number,
  when = 0,
) {
  const audio = getCtx();
  if (!audio || muted) return;
  const t0 = audio.currentTime + when;
  const osc = audio.createOscillator();
  const gain = audio.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(frequency, t0);
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(gainValue, t0 + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
  osc.connect(gain);
  gain.connect(audio.destination);
  osc.start(t0);
  osc.stop(t0 + duration + 0.02);
}

export function playSound(name: SoundName) {
  if (muted) return;
  void getCtx()?.resume();

  switch (name) {
    case "bead":
      tone(420, 0.06, "triangle", 0.05);
      tone(680, 0.04, "sine", 0.03, 0.01);
      break;
    case "success":
      tone(523, 0.1, "sine", 0.07);
      tone(659, 0.1, "sine", 0.07, 0.08);
      tone(784, 0.16, "triangle", 0.08, 0.16);
      break;
    case "clear":
      tone(180, 0.1, "sawtooth", 0.03);
      break;
    case "skip":
      tone(260, 0.08, "square", 0.025);
      tone(200, 0.1, "square", 0.02, 0.06);
      break;
    case "break":
      tone(220, 0.07, "sawtooth", 0.035);
      tone(165, 0.12, "square", 0.03, 0.05);
      tone(110, 0.16, "triangle", 0.04, 0.12);
      break;
    case "tick":
      tone(880, 0.04, "sine", 0.04);
      break;
    case "end":
      tone(392, 0.14, "triangle", 0.06);
      tone(311, 0.16, "triangle", 0.06, 0.12);
      tone(247, 0.22, "sine", 0.07, 0.24);
      break;
    case "start":
      tone(330, 0.08, "sine", 0.05);
      tone(440, 0.1, "sine", 0.06, 0.08);
      break;
    default:
      break;
  }
}
