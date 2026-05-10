import { createFileRoute } from "@tanstack/react-router";
import { coins as demoCoins } from "@/lib/demo-data";
import { useLiveCoins } from "@/lib/binance";
import { ChangePill, formatMoney } from "@/components/StatPill";
import { cn } from "@/lib/utils";
import { Radio } from "lucide-react";

export const Route = createFileRoute("/sila")({
  head: () => ({
    meta: [
      { title: "Ranking siły kryptowalut — CryptoPuls" },
      { name: "description", content: "Ranking siły relatywnej krypto: które monety przewodzą, a które słabną." },
    ],
  }),
  component: SilaPage,
});

function SilaPage() {
  const ranked = [...coins].sort((a, b) => b.strength - a.strength);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold">Ranking siły</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Wynik 0–100 łączący zmianę 7D, wolumen i RSI. Im wyżej, tym silniejszy trend.
        </p>
      </header>

      <section className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="grid grid-cols-12 gap-2 border-b border-border bg-muted/40 px-4 py-3 text-[10px] uppercase tracking-wider text-muted-foreground">
          <div className="col-span-1">#</div>
          <div className="col-span-3">Coin</div>
          <div className="col-span-2 text-right">Cena</div>
          <div className="col-span-2 text-right">24H</div>
          <div className="col-span-1 text-right">RSI</div>
          <div className="col-span-3">Siła</div>
        </div>
        <ul>
          {ranked.map((c, i) => (
            <li key={c.symbol} className="grid grid-cols-12 items-center gap-2 border-b border-border px-4 py-3 text-sm last:border-b-0 hover:bg-secondary/40">
              <div className="num col-span-1 text-muted-foreground">{i + 1}</div>
              <div className="col-span-3">
                <div className="font-bold">{c.symbol}</div>
                <div className="text-[11px] text-muted-foreground">{c.name}</div>
              </div>
              <div className="num col-span-2 text-right font-semibold">{formatMoney(c.price)}</div>
              <div className="col-span-2 flex justify-end"><ChangePill value={c.change24h} /></div>
              <div className={cn(
                "num col-span-1 text-right font-semibold",
                c.rsi >= 70 && "text-warning",
                c.rsi <= 30 && "text-bear",
              )}>{c.rsi}</div>
              <div className="col-span-3">
                <div className="flex items-center gap-2">
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                    <div
                      className={cn(
                        "h-full rounded-full",
                        c.strength >= 70 && "bg-bull",
                        c.strength >= 40 && c.strength < 70 && "bg-warning",
                        c.strength < 40 && "bg-bear",
                      )}
                      style={{ width: `${c.strength}%` }}
                    />
                  </div>
                  <span className="num w-8 text-right text-xs font-semibold">{c.strength}</span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-bull/40 bg-bull/5 p-5">
          <h3 className="text-sm font-bold uppercase tracking-wider text-bull">Liderzy</h3>
          <ul className="mt-2 space-y-1 text-sm">
            {ranked.slice(0, 3).map((c) => (
              <li key={c.symbol} className="flex justify-between">
                <span className="font-semibold">{c.symbol}</span>
                <span className="num text-bull">+{c.change7d}% (7D)</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border border-bear/40 bg-bear/5 p-5">
          <h3 className="text-sm font-bold uppercase tracking-wider text-bear">Najsłabsi</h3>
          <ul className="mt-2 space-y-1 text-sm">
            {ranked.slice(-3).reverse().map((c) => (
              <li key={c.symbol} className="flex justify-between">
                <span className="font-semibold">{c.symbol}</span>
                <span className="num text-bear">{c.change7d}% (7D)</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
