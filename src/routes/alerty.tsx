import { createFileRoute } from "@tanstack/react-router";
import { alerts } from "@/lib/demo-data";
import { cn } from "@/lib/utils";
import { AlertCircle, AlertTriangle, Info } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/alerty")({
  head: () => ({
    meta: [
      { title: "Alerty — CryptoPuls" },
      { name: "description", content: "Alerty techniczne: wybicia, RSI, zmiana wolumenu, dominacja BTC, funding rate." },
    ],
  }),
  component: AlertyPage,
});

const filters = ["Wszystkie", "critical", "warning", "info"] as const;
const labels: Record<string, string> = { Wszystkie: "Wszystkie", critical: "Krytyczne", warning: "Ostrzeżenia", info: "Info" };

function AlertyPage() {
  const [filter, setFilter] = useState<(typeof filters)[number]>("Wszystkie");
  const list = alerts.filter((a) => filter === "Wszystkie" || a.level === filter);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">Alerty</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Sygnały techniczne i zmiany sentymentu. W wersji produkcyjnej — push i e-mail.
          </p>
        </div>
        <div className="flex gap-1 rounded-lg border border-border bg-card p-1">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-semibold transition-colors",
                filter === f ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {labels[f]}
            </button>
          ))}
        </div>
      </header>

      <section className="rounded-xl border border-border bg-card">
        <ul className="divide-y divide-border">
          {list.map((a) => {
            const Icon = a.level === "critical" ? AlertCircle : a.level === "warning" ? AlertTriangle : Info;
            return (
              <li key={a.id} className="flex items-start gap-4 p-4">
                <div className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                  a.level === "critical" && "bg-bear/15 text-bear",
                  a.level === "warning" && "bg-warning/15 text-warning",
                  a.level === "info" && "bg-secondary text-muted-foreground",
                )}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="num">{a.time}</span>
                    <span>·</span>
                    <span className="rounded bg-secondary px-1.5 py-0.5 font-bold text-foreground">{a.symbol}</span>
                    <span className={cn(
                      "rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                      a.level === "critical" && "bg-bear/20 text-bear",
                      a.level === "warning" && "bg-warning/20 text-warning",
                      a.level === "info" && "bg-muted",
                    )}>{a.level}</span>
                  </div>
                  <p className="mt-1 text-sm">{a.message}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <div className="rounded-xl border border-dashed border-border bg-card/40 p-5 text-sm text-muted-foreground">
        <strong className="text-foreground">Wersja DEMO:</strong> alerty są przykładowe. Po podpięciu API
        (CoinGecko / Binance / CryptoCompare) będą generowane na żywo z reguł:
        wybicia ze średnich, zmiany wolumenu &gt;100%, RSI &gt;70 lub &lt;30, funding rate, dominacja BTC.
      </div>
    </div>
  );
}
