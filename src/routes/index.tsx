import { createFileRoute, Link } from "@tanstack/react-router";
import { sentiment, setups as demoSetups, alerts as demoAlerts } from "@/lib/demo-data";
import { useLiveCoins } from "@/lib/binance";
import { adjustAlertsForRegime, adjustSetupsForRegime, generateSetups, generateAlerts } from "@/lib/signals";
import { useRegime } from "@/lib/regime-store";
import { useMemo } from "react";
import { ChangePill, formatMoney } from "@/components/StatPill";
import { MarketRegimeBanner } from "@/components/MarketRegimeBanner";
import { RegimeHistoryPanel } from "@/components/RegimeHistoryPanel";
import { WatchlistPanel } from "@/components/WatchlistPanel";
import { ArrowRight, Radio, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

import { buildSeo } from "@/lib/seo";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: buildSeo({
      title: "Co robić teraz na rynku krypto?",
      description: "Polski monitor sentymentu, siły relatywnej top 100 krypto, watchlista, alerty cenowe i AI asystent — jednoznaczna rekomendacja co robić teraz.",
      path: "/",
    }),
  }),
  component: Index,
});

function Index() {
  const { data: liveCoins, isError, isLoading } = useLiveCoins();
  const featured = ["BTC", "ETH", "SOL", "ARB"];
  const liveTickers = (liveCoins ?? []).filter((c) => featured.includes(c.symbol));

  // Active regime (auto or manual override) drives downstream signal filtering.
  const coinsForRegime = liveCoins && liveCoins.length ? liveCoins : [];
  const { active: activeRegime } = useRegime(coinsForRegime);

  const rawSetups = useMemo(
    () => (liveCoins && liveCoins.length ? generateSetups(liveCoins) : demoSetups),
    [liveCoins],
  );
  const rawAlerts = useMemo(
    () => (liveCoins && liveCoins.length ? generateAlerts(liveCoins) : demoAlerts),
    [liveCoins],
  );
  const { setups, note: regimeNote } = useMemo(
    () => adjustSetupsForRegime(rawSetups, activeRegime.id),
    [rawSetups, activeRegime.id],
  );
  const alerts = useMemo(
    () => adjustAlertsForRegime(rawAlerts, activeRegime.id),
    [rawAlerts, activeRegime.id],
  );
  const top = setups.slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Market Regime Engine — auto-detected market phase */}
      <MarketRegimeBanner coins={liveCoins ?? undefined} />

      {/* User watchlist (favorites) */}
      <WatchlistPanel />

      {/* Live tickers — Binance */}
      <section className="rounded-xl border border-border bg-card p-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
            <Radio className={cn("h-3.5 w-3.5", !isError && liveCoins && "animate-pulse text-bull")} />
            {isError ? "Brak połączenia · dane DEMO" : isLoading ? "Łączę z Binance…" : "Binance · ceny na żywo"}
          </div>
          <Link to="/sila" className="text-xs text-primary hover:underline">Pełny ranking →</Link>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {(liveTickers.length ? liveTickers : featured.map((s) => ({ symbol: s, price: 0, change24h: 0 }))).map((c) => (
            <div key={c.symbol} className="rounded-lg border border-border bg-background/40 p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold">{c.symbol}</span>
                {c.price > 0 && <ChangePill value={c.change24h} />}
              </div>
              <div className="num mt-1 text-base font-semibold">
                {c.price > 0 ? formatMoney(c.price) : "—"}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Quick stats */}
      <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Fear & Greed" value={`${sentiment.fearGreedIndex}`} sub={sentiment.fearGreedLabel} accent="bull" />
        <StatCard label="Dominacja BTC" value={`${sentiment.btcDominance}%`} sub="↓ rotacja w alty" />
        <StatCard label="Kapitalizacja" value="$2.69T" sub={<ChangePill value={sentiment.marketCapChange24h} />} />
        <StatCard label="Trend rynku" value="Byczy" sub="krótkoterminowy" accent="bull" />
      </section>

      {/* Top setupy */}
      <section className="rounded-xl border border-border bg-card p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold">Top 3 setupy dziś</h2>
            <span className={cn(
              "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
              regimeNote.tone === "bull" && "bg-bull/20 text-bull",
              regimeNote.tone === "bear" && "bg-bear/20 text-bear",
              regimeNote.tone === "warning" && "bg-warning/20 text-warning",
              regimeNote.tone === "neutral" && "bg-muted text-muted-foreground",
            )} title="Setupy są filtrowane wg aktualnego reżimu rynku">
              {regimeNote.tag}
            </span>
          </div>
          <Link to="/setupy" className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
            Wszystkie <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {top.map((s) => (
            <div key={s.symbol} className="rounded-lg border border-border bg-background/50 p-4">
              <div className="flex items-center justify-between">
                <div className="text-base font-bold">{s.symbol}</div>
                <span className={cn(
                  "rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                  s.type === "Long" && "bg-bull/20 text-bull",
                  s.type === "Short" && "bg-bear/20 text-bear",
                  s.type === "Obserwuj" && "bg-warning/20 text-warning",
                )}>
                  {s.type}
                </span>
              </div>
              <div className="num mt-2 text-xs text-muted-foreground">
                Wejście: <span className="text-foreground">${s.entry}</span> · RR {s.riskReward}
              </div>
              <div className="mt-2 flex items-center gap-2">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                  <div className="h-full bg-primary" style={{ width: `${s.confidence}%` }} />
                </div>
                <span className="num text-xs text-muted-foreground">{s.confidence}%</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Latest alerts */}
      <section className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">Najnowsze alerty</h2>
          <Link to="/alerty" className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
            Wszystkie <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <ul className="mt-3 divide-y divide-border">
          {alerts.slice(0, 4).map((a) => (
            <li key={a.id} className="flex items-start gap-3 py-3">
              <ShieldAlert className={cn(
                "mt-0.5 h-4 w-4 shrink-0",
                a.level === "critical" && "text-bear",
                a.level === "warning" && "text-warning",
                a.level === "info" && "text-muted-foreground",
              )} />
              <div className="flex-1">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="num">{a.time}</span>
                  <span className="font-semibold text-foreground">{a.symbol}</span>
                </div>
                <div className="text-sm">{a.message}</div>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Regime change history */}
      <RegimeHistoryPanel />
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string;
  sub: React.ReactNode;
  accent?: "bull" | "bear";
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={cn("num mt-1 text-2xl font-bold", accent === "bull" && "text-bull", accent === "bear" && "text-bear")}>
        {value}
      </div>
      <div className="mt-1 text-xs text-muted-foreground">{sub}</div>
    </div>
  );
}
