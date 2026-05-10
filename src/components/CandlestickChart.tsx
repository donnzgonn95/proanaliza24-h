// Candlestick + optional indicator overlays + optional volume histogram.
// Client-only: lightweight-charts is loaded dynamically inside useEffect.
import { useEffect, useRef } from "react";
import type { Candle, VolumePoint } from "@/lib/providers/coingecko-top";
import type { LinePoint } from "@/lib/indicators";

export type ChartOverlay = { id: string; color: string; data: LinePoint[]; title?: string };

export function CandlestickChart({
  data,
  height = 380,
  overlays = [],
  volumes,
}: {
  data: Candle[];
  height?: number;
  overlays?: ChartOverlay[];
  volumes?: VolumePoint[];
}) {
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
        rightPriceScale: { borderColor: "rgba(255,255,255,0.08)", scaleMargins: { top: 0.05, bottom: volumes ? 0.25 : 0.05 } },
        timeScale: { borderColor: "rgba(255,255,255,0.08)", timeVisible: true, secondsVisible: false },
        crosshair: { mode: 1 },
      });
      chart = created;

      // Compatible with v5 (addSeries(SeriesType, opts)) and v4 (addCandlestickSeries(opts)).
      type AnyChart = {
        addSeries?: (t: unknown, o: unknown) => { setData: (d: unknown[]) => void };
        addCandlestickSeries?: (o: unknown) => { setData: (d: unknown[]) => void };
        addLineSeries?: (o: unknown) => { setData: (d: unknown[]) => void };
        addHistogramSeries?: (o: unknown) => { setData: (d: unknown[]) => void; priceScale?: () => { applyOptions: (o: unknown) => void } };
        applyOptions: (o: unknown) => void;
        priceScale: (id: string) => { applyOptions: (o: unknown) => void };
      };
      const c = created as unknown as AnyChart;
      const v5 = lib as unknown as { CandlestickSeries?: unknown; LineSeries?: unknown; HistogramSeries?: unknown };

      // Candles
      const candleSeries = v5.CandlestickSeries
        ? c.addSeries!(v5.CandlestickSeries, {
            upColor: "#16a34a",
            downColor: "#dc2626",
            wickUpColor: "#16a34a",
            wickDownColor: "#dc2626",
            borderVisible: false,
          })
        : c.addCandlestickSeries!({
            upColor: "#16a34a",
            downColor: "#dc2626",
            wickUpColor: "#16a34a",
            wickDownColor: "#dc2626",
            borderVisible: false,
          });
      candleSeries.setData(data);

      // Indicator overlays
      for (const ov of overlays) {
        if (!ov.data.length) continue;
        const line = v5.LineSeries
          ? c.addSeries!(v5.LineSeries, { color: ov.color, lineWidth: 2, priceLineVisible: false, lastValueVisible: false, title: ov.title ?? ov.id })
          : c.addLineSeries!({ color: ov.color, lineWidth: 2, priceLineVisible: false, lastValueVisible: false, title: ov.title ?? ov.id });
        line.setData(ov.data);
      }

      // Volume histogram on a separate price scale "vol"
      if (volumes && volumes.length) {
        const histSeries = v5.HistogramSeries
          ? c.addSeries!(v5.HistogramSeries, { color: "#64748b", priceScaleId: "vol", priceFormat: { type: "volume" } })
          : c.addHistogramSeries!({ color: "#64748b", priceScaleId: "vol", priceFormat: { type: "volume" } });
        // Color bars green/red based on candle direction at the same time bucket.
        const dirByTime = new Map<number, boolean>();
        for (const k of data) dirByTime.set(k.time, k.close >= k.open);
        // Snap each volume point to the nearest candle time so colors line up
        const candleTimes = data.map((d) => d.time).sort((a, b) => a - b);
        const snap = (t: number) => {
          // binary search nearest
          let lo = 0, hi = candleTimes.length - 1;
          while (lo < hi) {
            const mid = (lo + hi) >> 1;
            if (candleTimes[mid] < t) lo = mid + 1;
            else hi = mid;
          }
          const a = candleTimes[Math.max(0, lo - 1)];
          const b = candleTimes[lo];
          return Math.abs(a - t) <= Math.abs(b - t) ? a : b;
        };
        const colored = volumes.map((v) => {
          const snapped = candleTimes.length ? snap(v.time) : v.time;
          const up = dirByTime.get(snapped);
          return { time: snapped, value: v.value, color: up === false ? "rgba(220,38,38,0.55)" : "rgba(22,163,74,0.55)" };
        });
        histSeries.setData(colored);
        c.priceScale("vol").applyOptions({ scaleMargins: { top: 0.78, bottom: 0 } });
      }

      const ro = new ResizeObserver(() => {
        if (!ref.current) return;
        c.applyOptions({ width: ref.current.clientWidth });
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
  }, [data, height, overlays, volumes]);

  return <div ref={ref} style={{ width: "100%", height }} />;
}
