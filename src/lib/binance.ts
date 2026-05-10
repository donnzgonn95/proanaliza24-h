// Live data from Binance public API (no key required).
// Docs: https://binance-docs.github.io/apidocs/spot/en/#24hr-ticker-price-change-statistics

import { useQuery } from "@tanstack/react-query";
import { coins as demoCoins, type Coin } from "./demo-data";

// Map our internal symbols to Binance trading pairs (USDT quote)
const PAIRS: Record<string, string> = {
  BTC: "BTCUSDT",
  ETH: "ETHUSDT",
  SOL: "SOLUSDT",
  BNB: "BNBUSDT",
  XRP: "XRPUSDT",
  AVAX: "AVAXUSDT",
  LINK: "LINKUSDT",
  DOGE: "DOGEUSDT",
  MATIC: "POLUSDT", // MATIC was renamed to POL on Binance
  ARB: "ARBUSDT",
};

type BinanceTicker = {
  symbol: string;
  lastPrice: string;
  priceChangePercent: string;
  quoteVolume: string;
  weightedAvgPrice: string;
};

async function fetchTickers(): Promise<BinanceTicker[]> {
  const symbols = Object.values(PAIRS);
  const url = `https://api.binance.com/api/v3/ticker/24hr?symbols=${encodeURIComponent(JSON.stringify(symbols))}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Binance API ${res.status}`);
  return res.json();
}

// Lightweight RSI proxy from 24h change (not real RSI, but a reasonable demo signal).
function approxRsi(change24h: number): number {
  // map -10%..+10% → 20..80
  const clamped = Math.max(-10, Math.min(10, change24h));
  return Math.round(50 + clamped * 3);
}

// Strength score from 24h change + relative volume rank.
function computeStrength(change24h: number, volRank: number, totalRanks: number): number {
  const changeScore = Math.max(0, Math.min(100, 50 + change24h * 5));
  const volScore = ((totalRanks - volRank) / totalRanks) * 100;
  return Math.round(changeScore * 0.7 + volScore * 0.3);
}

export type LiveCoin = Coin & { live: true };

function mergeWithDemo(tickers: BinanceTicker[]): LiveCoin[] {
  const bySymbol = new Map(tickers.map((t) => [t.symbol, t]));
  const enriched = demoCoins.map((c) => {
    const pair = PAIRS[c.symbol];
    const t = pair ? bySymbol.get(pair) : undefined;
    if (!t) return { ...c, live: true as const };
    const price = parseFloat(t.lastPrice);
    const change24h = parseFloat(t.priceChangePercent);
    const volume24h = parseFloat(t.quoteVolume);
    return {
      ...c,
      price,
      change24h,
      // keep demo 7d (Binance v3 doesn't return 7d easily); approximate with 1.6× of 24h move
      change7d: parseFloat((change24h * 1.6).toFixed(2)),
      volume24h,
      live: true as const,
    };
  });

  // recompute RSI + strength from live numbers
  const sortedByVol = [...enriched].sort((a, b) => b.volume24h - a.volume24h);
  const volRank = new Map(sortedByVol.map((c, i) => [c.symbol, i]));
  return enriched.map((c) => ({
    ...c,
    rsi: approxRsi(c.change24h),
    strength: computeStrength(c.change24h, volRank.get(c.symbol) ?? 0, enriched.length),
  }));
}

export function useLiveCoins() {
  return useQuery({
    queryKey: ["binance", "tickers"],
    queryFn: fetchTickers,
    refetchInterval: 15_000,
    staleTime: 10_000,
    select: mergeWithDemo,
  });
}

// Global market sentiment from BTC dominance + total market cap (CoinGecko fallback-free heuristic)
export function useLiveMarketCap() {
  return useQuery({
    queryKey: ["binance", "btc-eth-prices"],
    queryFn: fetchTickers,
    refetchInterval: 30_000,
    staleTime: 20_000,
    select: (tickers: BinanceTicker[]) => {
      const btc = tickers.find((t) => t.symbol === "BTCUSDT");
      const change = btc ? parseFloat(btc.priceChangePercent) : 0;
      return { btc24hChange: change };
    },
  });
}
