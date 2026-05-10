import { useMemo, useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useTopCoins, useCoinOHLC, useCoinVolumes } from "@/lib/top-coins";
import { CandlestickChart, type ChartOverlay } from "@/components/CandlestickChart";
import { RSIChart } from "@/components/RSIChart";
import { WatchlistStar } from "@/components/WatchlistStar";
import { ChangePill, formatMoney } from "@/components/StatPill";
import { sma, ema, rsi as rsiCalc } from "@/lib/indicators";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/coin/$symbol")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.symbol.toUpperCase()} — szczegóły kryptowaluty` },
      {
        name: "description",
        content: `Szczegółowe statystyki, świece OHLC, SMA/EMA, RSI i wolumen dla ${params.symbol.toUpperCase()}.`,
      },
    ],
  }),
  component: CoinPage,
  errorComponent: ({ error }) => (
    <div className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">
      Nie udało się załadować: {error.message}
    </div>
  ),
  notFoundComponent: () => (
    <div className="rounded-xl border border-border bg-card p-6">
      <h1 className="text-lg font-bold">Nie znaleziono kryptowaluty</h1>
      <Link to="/" className="text-primary hover:underline">← Powrót</Link>
    </div>
  ),
});

const RANGES = [
  { label: "1D", days: 1 },
  { label: "7D", days: 7 },
  { label: "30D", days: 30 },
  { label: "90D", days: 90 },
  { label: "1R", days: 365 },
] as const;

function CoinPage() {
  const { symbol } = Route.useParams();
  const sym = symbol.toUpperCase();
  const { data: coins, isLoading } = useTopCoins();
  const coin = coins?.find((c) => c.symbol === sym);
  const [days, setDays] = useState<number>(30);
  const [showSMA, setShowSMA] = useState(true);
  const [showEMA, setShowEMA] = useState(true);
  const [showRSI, setShowRSI] = useState(true);
  const [showVolume, setShowVolume] = useState(true);

  const { data: candles, isLoading: loadingChart, isError: chartError } = useCoinOHLC(coin?.id, days);
  const { data: volumes } = useCoinVolumes(coin?.id, days);

  const overlays: ChartOverlay[] = useMemo(() => {
    if (!candles?.length) return [];
    const list: ChartOverlay[] = [];
    if (showSMA) list.push({ id: "sma20", color: "#3b82f6", title: "SMA 20", data: sma(candles, 20) });
    if (showEMA) list.push({ id: "ema50", color: "#f59e0b", title: "EMA 50", data: ema(candles, 50) });
    return list;
  }, [candles, showSMA, showEMA]);

  const rsiData = useMemo(() => (candles?.length ? rsiCalc(candles, 14) : []), [candles]);

  if (!isLoading && coins && !coin) {
    throw notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <Link to="/" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-3 w-3" /> Powrót
        </Link>
      </div>

      {/* Header */}
      <section className="rounded-xl border border-border bg-card p-5">
        <div className="flex flex-wrap items-center gap-4">
          {coin?.image && <img src={coin.image} alt={coin.name} width={48} height={48} className="h-12 w-12 rounded-full" />}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold">{coin?.name ?? sym}</h1>
              <span className="rounded bg-secondary px-2 py-0.5 text-xs font-bold uppercase">{sym}</span>
              {coin?.rank && (
                <span className="num rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">#{coin.rank}</span>
              )}
            </div>
            {coin && (
              <div className="mt-1 flex flex-wrap items-center gap-3">
                <span className="num text-2xl font-bold">{formatMoney(coin.price)}</span>
                <ChangePill value={coin.change24h} />
                <span className="text-xs text-muted-foreground">24h</span>
              </div>
            )}
          </div>
          <WatchlistStar symbol={sym} />
        </div>
      </section>

      {/* Stats grid */}
      {coin && (
        <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Stat label="Kapitalizacja" value={formatMoney(coin.marketCap)} />
          <Stat label="Wolumen 24h" value={formatMoney(coin.volume24h)} />
          <Stat label="Zmiana 7D" value={`${coin.change7d > 0 ? "+" : ""}${coin.change7d.toFixed(2)}%`} accent={coin.change7d >= 0 ? "bull" : "bear"} />
          <Stat label="RSI (przybl.)" value={`${coin.rsi}`} accent={coin.rsi >= 70 ? "bear" : coin.rsi <= 30 ? "bull" : undefined} />
          <Stat label="Maks. 24h" value={coin.high24h ? formatMoney(coin.high24h) : "—"} />
          <Stat label="Min. 24h" value={coin.low24h ? formatMoney(coin.low24h) : "—"} />
          <Stat label="ATH" value={coin.ath ? formatMoney(coin.ath) : "—"} sub={coin.athChangePct != null ? `${coin.athChangePct.toFixed(1)}% od ATH` : undefined} />
          <Stat label="Podaż w obiegu" value={coin.circulatingSupply ? coin.circulatingSupply.toLocaleString("pl-PL", { maximumFractionDigits: 0 }) : "—"} />
        </section>
      )}

      {/* Candlestick chart + controls */}
      <section className="rounded-xl border border-border bg-card p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-bold">Mapa świec (Candlestick)</h2>
          <div className="flex flex-wrap items-center gap-2">
            <Toggle active={showSMA} onClick={() => setShowSMA((v) => !v)} dot="#3b82f6">SMA 20</Toggle>
            <Toggle active={showEMA} onClick={() => setShowEMA((v) => !v)} dot="#f59e0b">EMA 50</Toggle>
            <Toggle active={showVolume} onClick={() => setShowVolume((v) => !v)}>Wolumen</Toggle>
            <Toggle active={showRSI} onClick={() => setShowRSI((v) => !v)} dot="#a855f7">RSI 14</Toggle>
          </div>
        </div>
        <div className="mb-3 flex flex-wrap gap-1">
          {RANGES.map((r) => (
            <button
              key={r.days}
              onClick={() => setDays(r.days)}
              className={cn(
                "rounded-md border border-border px-3 py-1 text-xs",
                days === r.days ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground hover:text-foreground",
              )}
            >
              {r.label}
            </button>
          ))}
        </div>
        {loadingChart && <div className="py-12 text-center text-sm text-muted-foreground">Ładuję dane świec…</div>}
        {chartError && <div className="py-12 text-center text-sm text-bear">Nie udało się pobrać danych OHLC.</div>}
        {candles && candles.length > 0 && (
          <CandlestickChart data={candles} overlays={overlays} volumes={showVolume ? volumes : undefined} />
        )}
        {candles && candles.length === 0 && (
          <div className="py-12 text-center text-sm text-muted-foreground">Brak danych świecowych dla tego zakresu.</div>
        )}

        {showRSI && rsiData.length > 0 && (
          <div className="mt-4 border-t border-border pt-3">
            <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
              <span>RSI 14 — strefy 30/70</span>
              <span className="num">aktualne: {rsiData[rsiData.length - 1].value.toFixed(1)}</span>
            </div>
            <RSIChart data={rsiData} />
          </div>
        )}

        <p className="mt-3 text-[11px] text-muted-foreground">
          Dane: CoinGecko OHLC + market_chart. Wskaźniki SMA/EMA/RSI obliczane lokalnie z zamknięć świec — nie generują dodatkowych zapytań do API.
        </p>
      </section>
    </div>
  );
}

function Toggle({
  active,
  onClick,
  children,
  dot,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  dot?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs transition-colors",
        active ? "border-primary/40 bg-primary/10 text-foreground" : "border-border bg-background text-muted-foreground hover:text-foreground",
      )}
    >
      {dot && <span className="h-2 w-2 rounded-full" style={{ backgroundColor: dot }} />}
      {children}
    </button>
  );
}

function Stat({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: "bull" | "bear" }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={cn("num mt-1 text-lg font-bold", accent === "bull" && "text-bull", accent === "bear" && "text-bear")}>
        {value}
      </div>
      {sub && <div className="mt-1 text-xs text-muted-foreground">{sub}</div>}
    </div>
  );
}
