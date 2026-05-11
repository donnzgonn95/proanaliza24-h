// Wykres TradingView (Advanced Chart) — osadzany dynamicznie przez oficjalny embed script.
// Wspiera dowolny symbol; domyślnie mapujemy ticker krypto na BINANCE:{SYM}USDT.
import { memo, useEffect, useRef } from "react";

export type TradingViewChartProps = {
  /** Symbol w formacie TradingView, np. "BINANCE:BTCUSDT" lub "NASDAQ:AAPL". */
  symbol?: string;
  /** Skrót coina (np. "BTC") — gdy nie podano `symbol`, mapujemy na BINANCE:{SYM}USDT. */
  coinSymbol?: string;
  /** Wysokość kontenera w px. Domyślnie 520. */
  height?: number;
  /** Zakres podświetlony przy starcie (np. "1D", "5D", "1M", "3M", "6M", "YTD", "12M", "60M", "ALL"). */
  range?: string;
  /** Interwał świec ("1","5","15","60","D","W","M"). Domyślnie "D". */
  interval?: string;
  /** Język UI widgetu — domyślnie "pl". */
  locale?: string;
  /** Motyw — "dark" / "light". Domyślnie "dark". */
  theme?: "dark" | "light";
};

function buildSymbol({ symbol, coinSymbol }: Pick<TradingViewChartProps, "symbol" | "coinSymbol">) {
  if (symbol) return symbol;
  const sym = (coinSymbol ?? "BTC").toUpperCase();
  // Wyjątki dla stablecoinów / niestandardowych mapowań — fallback do USDT.
  if (sym === "USDT" || sym === "USDC" || sym === "DAI") return `BINANCE:${sym}USD`;
  return `BINANCE:${sym}USDT`;
}

function TradingViewChartImpl({
  symbol,
  coinSymbol,
  height = 520,
  range = "3M",
  interval = "D",
  locale = "pl",
  theme = "dark",
}: TradingViewChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const tvSymbol = buildSymbol({ symbol, coinSymbol });

  useEffect(() => {
    if (!containerRef.current) return;
    const root = containerRef.current;
    // Reset przy zmianie symbolu/zakresu — TradingView nie aktualizuje konfigu po starcie.
    root.innerHTML = "";

    const widget = document.createElement("div");
    widget.className = "tradingview-widget-container__widget";
    widget.style.height = "calc(100% - 32px)";
    widget.style.width = "100%";
    root.appendChild(widget);

    const copyright = document.createElement("div");
    copyright.className = "tradingview-widget-copyright";
    copyright.innerHTML =
      '<a href="https://pl.tradingview.com/" rel="noopener nofollow" target="_blank"><span class="blue-text">Track all markets on TradingView</span></a>';
    root.appendChild(copyright);

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      allow_symbol_change: true,
      calendar: false,
      details: true,
      hide_side_toolbar: false,
      hide_top_toolbar: false,
      hide_legend: false,
      hide_volume: false,
      hotlist: true,
      interval,
      locale,
      save_image: true,
      style: "1",
      symbol: tvSymbol,
      theme,
      timezone: "Etc/UTC",
      backgroundColor: "#0F0F0F",
      gridColor: "rgba(242, 242, 242, 0.13)",
      watchlist: [],
      withdateranges: false,
      range,
      compareSymbols: [],
      studies: [],
      autosize: true,
    });
    root.appendChild(script);

    return () => {
      root.innerHTML = "";
    };
  }, [tvSymbol, range, interval, locale, theme]);

  return (
    <div
      data-testid="tradingview-chart"
      data-tv-symbol={tvSymbol}
      className="overflow-hidden rounded-lg border border-border bg-[#0F0F0F]"
      style={{ height }}
    >
      <div ref={containerRef} className="tradingview-widget-container" style={{ height: "100%", width: "100%" }} />
    </div>
  );
}

export const TradingViewChart = memo(TradingViewChartImpl);
