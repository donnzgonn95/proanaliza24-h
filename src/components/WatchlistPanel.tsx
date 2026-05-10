// Renders the user's watchlist as a compact card grid. Used on the home page.
import { Link } from "@tanstack/react-router";
import { Star, X } from "lucide-react";
import { useWatchlist } from "@/lib/watchlist";
import { useTopCoins } from "@/lib/top-coins";
import { ChangePill, formatMoney } from "@/components/StatPill";

export function WatchlistPanel() {
  const { list, remove } = useWatchlist();
  const { data: coins } = useTopCoins();

  if (!list.length) {
    return (
      <section className="rounded-xl border border-dashed border-border bg-card/50 p-5 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Star className="h-4 w-4" />
          <span>
            Brak ulubionych. Otwórz dowolnego coina i kliknij <span className="font-semibold text-foreground">„Dodaj do ulubionych”</span>, aby
            śledzić go tutaj i w menu.
          </span>
        </div>
      </section>
    );
  }

  const items = list.map((sym) => {
    const c = coins?.find((x) => x.symbol === sym);
    return { sym, c };
  });

  return (
    <section className="rounded-xl border border-border bg-card p-5">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Star className="h-4 w-4 text-warning" />
          <h2 className="text-lg font-bold">Ulubione</h2>
          <span className="num text-xs text-muted-foreground">({list.length})</span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
        {items.map(({ sym, c }) => (
          <div key={sym} className="group relative rounded-lg border border-border bg-background/40 p-3">
            <button
              type="button"
              onClick={() => remove(sym)}
              aria-label="Usuń"
              className="absolute right-1 top-1 hidden rounded p-1 text-muted-foreground hover:bg-secondary hover:text-foreground group-hover:block"
            >
              <X className="h-3 w-3" />
            </button>
            <Link to="/coin/$symbol" params={{ symbol: sym }} className="block">
              <div className="flex items-center gap-2">
                {c?.image && <img src={c.image} alt="" width={20} height={20} className="h-5 w-5 rounded-full" />}
                <span className="text-sm font-bold">{sym}</span>
                {c && <ChangePill value={c.change24h} />}
              </div>
              <div className="num mt-1 text-base font-semibold">{c ? formatMoney(c.price) : "—"}</div>
              {c?.name && <div className="text-[11px] text-muted-foreground">{c.name}</div>}
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
