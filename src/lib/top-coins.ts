import { useQuery } from "@tanstack/react-query";
import { fetchTop100Coins, fetchCoinOHLC, type Candle } from "@/lib/providers/coingecko-top";
import type { Coin } from "@/lib/demo-data";

export function useTopCoins() {
  return useQuery({
    queryKey: ["coins", "top100"],
    queryFn: fetchTop100Coins,
    refetchInterval: 60_000,
    staleTime: 45_000,
    retry: 1,
  });
}

export function useCoinOHLC(id: string | undefined, days: number) {
  return useQuery({
    queryKey: ["ohlc", id, days],
    queryFn: () => fetchCoinOHLC(id!, days),
    enabled: !!id,
    staleTime: 60_000,
    refetchInterval: 120_000,
    retry: 1,
  });
}

export type { Candle, Coin };
