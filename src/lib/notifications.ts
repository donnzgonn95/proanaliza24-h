// Browser push notifications driven by generated alerts.
import { useEffect, useSyncExternalStore } from "react";
import { toast } from "sonner";
import { useLiveCoins } from "./binance";
import { generateAlerts } from "./signals";
import type { Alert } from "./demo-data";

export type NotifLevel = Alert["level"];

export type QuietHours = {
  enabled: boolean;
  from: string; // "HH:MM"
  to: string;   // "HH:MM"
};

export type NotifSettings = {
  enabled: boolean;
  levels: Record<NotifLevel, boolean>;
  inAppToast: boolean;
  quietHours: QuietHours;
};

const DEFAULTS: NotifSettings = {
  enabled: false,
  levels: { critical: true, warning: true, info: false },
  inAppToast: true,
  quietHours: { enabled: false, from: "22:00", to: "07:00" },
};

const KEY = "cryptopuls:notif-settings";
const SEEN_KEY = "cryptopuls:notif-seen";
const HISTORY_KEY = "cryptopuls:notif-history";
const SEEN_MAX = 200;
const HISTORY_MAX = 50;

export type NotifHistoryItem = {
  id: string;
  title: string;
  body: string;
  level: NotifLevel;
  symbol: string;
  ts: number;
};

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
      quietHours: { ...DEFAULTS.quietHours, ...(p.quietHours ?? {}) },
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

// ============== History ==============

const historyListeners = new Set<() => void>();
let historyCache: NotifHistoryItem[] | null = null;

function loadHistory(): NotifHistoryItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(HISTORY_KEY);
    return raw ? (JSON.parse(raw) as NotifHistoryItem[]) : [];
  } catch {
    return [];
  }
}

function emitHistory() {
  historyCache = loadHistory();
  historyListeners.forEach((l) => l());
}

function pushHistory(item: NotifHistoryItem) {
  const list = loadHistory();
  list.unshift(item);
  const trimmed = list.slice(0, HISTORY_MAX);
  window.localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed));
  emitHistory();
}

export function useNotifHistory() {
  return useSyncExternalStore(
    (cb) => {
      historyListeners.add(cb);
      return () => historyListeners.delete(cb);
    },
    () => {
      if (!historyCache) historyCache = loadHistory();
      return historyCache;
    },
    () => [],
  );
}

export function clearNotifHistory() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(HISTORY_KEY);
  window.localStorage.removeItem(SEEN_KEY);
  emitHistory();
}

// ============== Quiet hours ==============

/** Returns true if `now` falls inside quiet hours window (handles overnight). */
export function isInQuietHours(qh: QuietHours, now = new Date()): boolean {
  if (!qh.enabled) return false;
  const [fh, fm] = qh.from.split(":").map(Number);
  const [th, tm] = qh.to.split(":").map(Number);
  if (Number.isNaN(fh) || Number.isNaN(th)) return false;
  const cur = now.getHours() * 60 + now.getMinutes();
  const from = fh * 60 + fm;
  const to = th * 60 + tm;
  if (from === to) return false;
  return from < to ? cur >= from && cur < to : cur >= from || cur < to;
}

const ICON: Record<NotifLevel, string> = {
  critical: "🚨",
  warning: "⚠️",
  info: "📈",
};

export function fireNotification(a: Alert, settings: NotifSettings, opts?: { force?: boolean }) {
  const muted = !opts?.force && isInQuietHours(settings.quietHours);
  const title = `${ICON[a.level]} ${a.symbol} — CryptoPuls`;
  const body = a.message;

  // Always log to history (so user can review what was muted)
  pushHistory({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    title,
    body,
    level: a.level,
    symbol: a.symbol,
    ts: Date.now(),
  });

  if (muted) return;

  if (settings.inAppToast) {
    const fn = a.level === "critical" ? toast.error : a.level === "warning" ? toast.warning : toast.info;
    fn(`${ICON[a.level]} ${a.symbol}`, { description: body });
  }
  if (settings.enabled && notifPermission() === "granted") {
    try {
      new Notification(title, {
        body,
        tag: `${a.symbol}-${a.level}`,
        silent: a.level === "info",
      });
    } catch {
      // ignore
    }
  }
}

/** Fires a hard-coded test push notification (uses Notification API + toast). */
export async function sendTestPush(settings: NotifSettings) {
  if (notifPermission() === "default") {
    await requestNotifPermission();
  }
  fireNotification(
    {
      id: "test-push",
      time: new Date().toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" }),
      symbol: "PUSH",
      level: "critical",
      message: "Test powiadomienia push — jeśli to widzisz, kanał działa poprawnie.",
    },
    settings,
    { force: true },
  );
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
    const firstRun = !window.localStorage.getItem(SEEN_KEY);

    for (const a of alerts) {
      if (!settings.levels[a.level]) continue;
      const k = alertKey(a);
      if (seen.has(k)) continue;
      seen.add(k);
      if (!firstRun) fireNotification(a, settings);
    }
    saveSeen(seen);
  }, [coins, settings]);
}
