// Browser push notifications driven by generated alerts.
import { useEffect, useSyncExternalStore } from "react";
import { toast } from "sonner";
import { useLiveCoins } from "./binance";
import { generateAlerts } from "./signals";
import type { Alert } from "./demo-data";

export type NotifLevel = Alert["level"];

export type NotifSettings = {
  enabled: boolean;
  levels: Record<NotifLevel, boolean>;
  inAppToast: boolean;
};

const DEFAULTS: NotifSettings = {
  enabled: false,
  levels: { critical: true, warning: true, info: false },
  inAppToast: true,
};

const KEY = "cryptopuls:notif-settings";
const SEEN_KEY = "cryptopuls:notif-seen";
const SEEN_MAX = 200;

function read(): NotifSettings {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return DEFAULTS;
    const p = JSON.parse(raw);
    return {
      enabled: !!p.enabled,
      inAppToast: p.inAppToast ?? true,
      levels: { ...DEFAULTS.levels, ...(p.levels ?? {}) },
    };
  } catch {
    return DEFAULTS;
  }
}

const listeners = new Set<() => void>();
let cache: NotifSettings | null = null;

function getSnapshot(): NotifSettings {
  if (!cache) cache = read();
  return cache;
}

function emit() {
  cache = read();
  listeners.forEach((l) => l());
}

export function setNotifSettings(patch: Partial<NotifSettings>) {
  const next = { ...getSnapshot(), ...patch };
  window.localStorage.setItem(KEY, JSON.stringify(next));
  emit();
}

export function useNotifSettings() {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    getSnapshot,
    () => DEFAULTS,
  );
}

export function notifPermission(): NotificationPermission | "unsupported" {
  if (typeof window === "undefined" || !("Notification" in window)) return "unsupported";
  return Notification.permission;
}

export async function requestNotifPermission(): Promise<NotificationPermission | "unsupported"> {
  if (typeof window === "undefined" || !("Notification" in window)) return "unsupported";
  const p = await Notification.requestPermission();
  emit();
  return p;
}

function alertKey(a: Alert): string {
  // Stable key per "type" of alert per coin per hour
  const hourBucket = new Date().toISOString().slice(0, 13);
  return `${a.symbol}:${a.level}:${a.message.slice(0, 40)}:${hourBucket}`;
}

function loadSeen(): Set<string> {
  try {
    const raw = window.localStorage.getItem(SEEN_KEY);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

function saveSeen(set: Set<string>) {
  const arr = Array.from(set).slice(-SEEN_MAX);
  window.localStorage.setItem(SEEN_KEY, JSON.stringify(arr));
}

const ICON: Record<NotifLevel, string> = {
  critical: "🚨",
  warning: "⚠️",
  info: "📈",
};

export function fireNotification(a: Alert, settings: NotifSettings) {
  if (settings.inAppToast) {
    const fn = a.level === "critical" ? toast.error : a.level === "warning" ? toast.warning : toast.info;
    fn(`${ICON[a.level]} ${a.symbol}`, { description: a.message });
  }
  if (settings.enabled && notifPermission() === "granted") {
    try {
      new Notification(`${ICON[a.level]} ${a.symbol} — CryptoPuls`, {
        body: a.message,
        tag: `${a.symbol}-${a.level}`,
        silent: a.level === "info",
      });
    } catch {
      // ignore
    }
  }
}

/** Mounts globally — watches live coin data and fires notifications for new alerts. */
export function useAlertNotifications() {
  const settings = useNotifSettings();
  const { data: coins } = useLiveCoins();

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!settings.enabled && !settings.inAppToast) return;
    if (!coins || coins.length === 0) return;

    const alerts = generateAlerts(coins);
    const seen = loadSeen();
    let firstRun = !window.localStorage.getItem(SEEN_KEY);

    for (const a of alerts) {
      if (!settings.levels[a.level]) continue;
      const k = alertKey(a);
      if (seen.has(k)) continue;
      seen.add(k);
      // Don't spam on first ever load — register as seen but stay silent
      if (!firstRun) fireNotification(a, settings);
    }
    saveSeen(seen);
  }, [coins, settings]);
}
