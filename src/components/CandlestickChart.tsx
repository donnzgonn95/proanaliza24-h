// Candlestick chart using lightweight-charts. Client-only — guards against SSR.
import { useEffect, useRef } from "react";
import type { Candle } from "@/lib/providers/coingecko-top";

export function CandlestickChart({ data, height = 360 }: { data: Candle[]; height?: number }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current || typeof window === "undefined") return;
    let disposed = false;
    let chart: { remove: () => void } | null = null;

    (async () => {
      const lib = await import("lightweight-charts");
      if (disposed || !ref.current) return;

      const created = lib.createChart(ref.current, {
        height,
        layout: {
          background: { color: "transparent" },
          textColor: "rgba(200,200,210,0.85)",
          fontFamily: "inherit",
        },
        grid: {
          vertLines: { color: "rgba(255,255,255,0.05)" },
          horzLines: { color: "rgba(255,255,255,0.05)" },
        },
        rightPriceScale: { borderColor: "rgba(255,255,255,0.08)" },
        timeScale: { borderColor: "rgba(255,255,255,0.08)", timeVisible: true, secondsVisible: false },
        crosshair: { mode: 1 },
      });
      chart = created;

      // v5 uses addSeries(CandlestickSeries, options); v4 uses addCandlestickSeries(options).
      const v5 = (lib as unknown as { CandlestickSeries?: unknown }).CandlestickSeries;
      const opts = {
        upColor: "#16a34a",
        downColor: "#dc2626",
        wickUpColor: "#16a34a",
        wickDownColor: "#dc2626",
        borderVisible: false,
      };
      const series = v5
        ? (created as unknown as { addSeries: (t: unknown, o: unknown) => { setData: (d: unknown[]) => void } })
            .addSeries(v5, opts)
        : (created as unknown as { addCandlestickSeries: (o: unknown) => { setData: (d: unknown[]) => void } })
            .addCandlestickSeries(opts);

      series.setData(data);

      const ro = new ResizeObserver(() => {
        if (!ref.current) return;
        (created as unknown as { applyOptions: (o: { width: number }) => void }).applyOptions({
          width: ref.current.clientWidth,
        });
      });
      ro.observe(ref.current);

      return () => ro.disconnect();
    })();

    return () => {
      disposed = true;
      try {
        chart?.remove();
      } catch {
        /* noop */
      }
    };
  }, [data, height]);

  return <div ref={ref} style={{ width: "100%", height }} />;
}
