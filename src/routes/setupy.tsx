import { createFileRoute } from "@tanstack/react-router";
import { setups } from "@/lib/demo-data";
import { cn } from "@/lib/utils";
import { useState } from "react";

export const Route = createFileRoute("/setupy")({
  head: () => ({
    meta: [
      { title: "Panel setupów — CryptoPuls" },
      { name: "description", content: "Setupy Long, Short i obserwacyjne z poziomami wejścia, SL, TP i uzasadnieniem." },
    ],
  }),
  component: SetupyPage,
});

const filters = ["Wszystkie", "Long", "Short", "Obserwuj"] as const;

function SetupyPage() {
  const [filter, setFilter] = useState<(typeof filters)[number]>("Wszystkie");
  const list = setups.filter((s) => filter === "Wszystkie" || s.type === filter);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">Panel setupów</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Konkretne plany transakcyjne: wejście, stop loss, take profit, R/R.
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
              {f}
            </button>
          ))}
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-2">
        {list.map((s) => {
          const range = s.takeProfit - s.stopLoss;
          const entryPos = ((s.entry - s.stopLoss) / range) * 100;
          return (
            <article key={s.symbol + s.type} className="rounded-xl border border-border bg-card p-5">
              <header className="flex items-start justify-between">
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">{s.timeframe}</div>
                  <div className="mt-1 text-xl font-bold">{s.symbol}</div>
                </div>
                <span className={cn(
                  "rounded px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider",
                  s.type === "Long" && "bg-bull/20 text-bull",
                  s.type === "Short" && "bg-bear/20 text-bear",
                  s.type === "Obserwuj" && "bg-warning/20 text-warning",
                )}>
                  {s.type}
                </span>
              </header>

              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                <Cell label="SL" value={`$${s.stopLoss}`} tone="bear" />
                <Cell label="Wejście" value={`$${s.entry}`} />
                <Cell label="TP" value={`$${s.takeProfit}`} tone="bull" />
              </div>

              <div className="relative mt-4 h-2 rounded-full bg-gradient-to-r from-bear/30 via-muted to-bull/30">
                <div
                  className="absolute -top-1 h-4 w-1 rounded bg-foreground"
                  style={{ left: `calc(${Math.max(2, Math.min(98, entryPos))}% - 2px)` }}
                />
              </div>

              <div className="mt-4 flex items-center justify-between text-xs">
                <span className="text-muted-foreground">R/R</span>
                <span className="num font-bold">{s.riskReward.toFixed(1)}</span>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Pewność</span>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                  <div className="h-full bg-primary" style={{ width: `${s.confidence}%` }} />
                </div>
                <span className="num text-xs font-semibold">{s.confidence}%</span>
              </div>

              <p className="mt-4 border-t border-border pt-3 text-sm text-muted-foreground">{s.reason}</p>
            </article>
          );
        })}
      </section>
    </div>
  );
}

function Cell({ label, value, tone }: { label: string; value: string; tone?: "bull" | "bear" }) {
  return (
    <div className={cn(
      "rounded-lg border border-border bg-background/50 p-2",
      tone === "bull" && "border-bull/40",
      tone === "bear" && "border-bear/40",
    )}>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={cn(
        "num mt-0.5 text-sm font-bold",
        tone === "bull" && "text-bull",
        tone === "bear" && "text-bear",
      )}>{value}</div>
    </div>
  );
}
