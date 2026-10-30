import { ATOMS_PER_ZKA } from "./config";

const grouping = new Intl.NumberFormat("en-US");

export const formatInteger = (value: number) => grouping.format(value);

// ZKA with up to six decimals, without trailing zeros: 12, 0.0002, 5,000,000.
export function formatZka(atoms: number): string {
  const whole = Math.floor(atoms / ATOMS_PER_ZKA);
  const fraction = atoms % ATOMS_PER_ZKA;
  const decimals = fraction ? `.${String(fraction).padStart(6, "0").replace(/0+$/, "")}` : "";
  return `${grouping.format(whole)}${decimals}`;
}

export function shortHash(hash: string, size = 8): string {
  return hash.length <= size * 2 + 1 ? hash : `${hash.slice(0, size)}…${hash.slice(-size)}`;
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function formatHashrate(hps: number): string {
  const units = ["H/s", "kH/s", "MH/s", "GH/s", "TH/s"];
  let value = hps;
  let unit = 0;
  while (value >= 1000 && unit < units.length - 1) {
    value /= 1000;
    unit++;
  }
  return `${value >= 100 || unit === 0 ? Math.round(value) : value.toFixed(1)} ${units[unit]}`;
}

export function timeAgo(seconds: number, now = Date.now() / 1000): string {
  const delta = Math.max(0, Math.round(now - seconds));
  if (delta < 60) return `${delta}s ago`;
  if (delta < 3600) return `${Math.floor(delta / 60)}m ${delta % 60}s ago`;
  if (delta < 86_400) return `${Math.floor(delta / 3600)}h ${Math.floor((delta % 3600) / 60)}m ago`;
  return `${Math.floor(delta / 86_400)}d ${Math.floor((delta % 86_400) / 3600)}h ago`;
}

export function formatDuration(seconds: number): string {
  const s = Math.max(0, Math.round(seconds));
  if (s < 60) return `${s}s`;
  if (s < 3600) return s % 60 ? `${Math.floor(s / 60)}m ${s % 60}s` : `${s / 60}m`;
  return `${Math.floor(s / 3600)}h ${Math.floor((s % 3600) / 60)}m`;
}

export function formatUtc(seconds: number): string {
  return new Date(seconds * 1000).toISOString().replace("T", " ").replace(/\.\d+Z$/, " UTC");
}

// A sample's local time of day, for chart axes: 14:05.
export function formatClock(seconds: number): string {
  return new Date(seconds * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
}
