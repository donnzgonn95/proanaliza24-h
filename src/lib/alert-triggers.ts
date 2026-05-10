// Per-coin price alert triggers ("above"/"below" thresholds).
// Stored in localStorage; checked by useAlertNotifications against live prices.
import { useEffect, useState } from "react";

export type Trigger = {
  id: string;
  symbol: string;
  side: "above" | "below";
  price: number;
  enabled: boolean;
  createdAt: number;
};

const KEY = "alert-triggers:v1";
const FIRED_KEY = "alert-triggers:fired:v1";
const EVT = "alert-triggers:changed";

export function readTriggers(): Trigger[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Trigger[]) : [];
  } catch {
    return [];
  }
}

function write(list: Trigger[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(list));
  window.dispatchEvent(new CustomEvent(EVT));
}

export function readFired(): Record<string, number> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(FIRED_KEY) || "{}");
  } catch {
    return {};
  }
}

export function writeFired(map: Record<string, number>) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(FIRED_KEY, JSON.stringify(map));
}

export function useTriggers(symbol?: string) {
  const [list, setList] = useState<Trigger[]>([]);
  useEffect(() => {
    const reload = () => setList(readTriggers());
    reload();
    window.addEventListener(EVT, reload);
    window.addEventListener("storage", reload);
    return () => {
      window.removeEventListener(EVT, reload);
      window.removeEventListener("storage", reload);
    };
  }, []);

  const filtered = symbol ? list.filter((t) => t.symbol === symbol.toUpperCase()) : list;

  const add = (t: Omit<Trigger, "id" | "createdAt" | "enabled"> & { enabled?: boolean }) => {
    const next: Trigger = {
      ...t,
      symbol: t.symbol.toUpperCase(),
      enabled: t.enabled ?? true,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      createdAt: Date.now(),
    };
    const all = [...readTriggers(), next];
    write(all);
    setList(all);
  };
  const remove = (id: string) => {
    const all = readTriggers().filter((t) => t.id !== id);
    write(all);
    setList(all);
  };
  const toggle = (id: string) => {
    const all = readTriggers().map((t) => (t.id === id ? { ...t, enabled: !t.enabled } : t));
    write(all);
    setList(all);
  };

  return { list: filtered, all: list, add, remove, toggle };
}
