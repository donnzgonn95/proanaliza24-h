import { createFileRoute, Link } from "@tanstack/react-router";
import { simpleAdvice, sentiment, setups, alerts } from "@/lib/demo-data";
import { useLiveCoins } from "@/lib/binance";
import { ChangePill, formatMoney } from "@/components/StatPill";
import { ArrowRight, CheckCircle2, Flame, Radio, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Co robić teraz? — CryptoPuls" },
      { name: "description", content: "Tryb prosty: jednoznaczna rekomendacja co robić na rynku krypto teraz, oparta o sentyment i siłę relatywną." },
    ],
  }),
  component: Index,
});

function Index() {
  const accent = simpleAdvice.color;
  const accentClass: Record<string, string> = {
    bull: "from-bull/30 to-bull/5 border-bull/40",
    bear: "from-bear/30 to-bear/5 border-bear/40",
    neutral: "from-muted to-muted/20 border-border",
    warning: "from-warning/30 to-warning/5 border-warning/40",
  };

  const top = setups.slice(0, 3);
  const { data: liveCoins, isError, isLoading } = useLiveCoins();
  const featured = ["BTC", "ETH", "SOL", "ARB"];
  const liveTickers = (liveCoins ?? []).filter((c) => featured.includes(c.symbol));

  return (
    <div className="space-y-6">
      {/* Hero — tryb prosty */}
      <section className={cn("rounded-2xl border bg-gradient-to-br p-6 md:p-8", accentClass[accent])}>
        <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
          <Flame className="h-3.5 w-3.5" /> Tryb prosty · Co robić teraz?
        </div>
        <h1 className="mt-3 text-2xl font-bold leading-tight md:text-4xl">{simpleAdvice.headline}</h1>
        <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-background/60 px-4 py-1.5 text-sm font-semibold backdrop-blur">
          <span className={cn("inline-block h-2 w-2 rounded-full", accent === "bull" ? "bg-bull" : accent === "bear" ? "bg-bear" : "bg-warning")} />
          {simpleAdvice.action}
        </div>
        <ul className="mt-5 space-y-2">
          {simpleAdvice.bullets.map((b) => (
            <li key={b} className="flex items-start gap-2 text-sm text-foreground/90">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span>{b}</span>
            </li>
          ))}
        </ul>
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
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">Top 3 setupy dziś</h2>
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
