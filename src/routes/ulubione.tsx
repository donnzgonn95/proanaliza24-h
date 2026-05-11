import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { Star, X, Plus, Search } from "lucide-react";
import { useWatchlist } from "@/lib/watchlist";
import { useTopCoins } from "@/lib/top-coins";
import { ChangePill, formatMoney } from "@/components/StatPill";
import { buildSeo } from "@/lib/seo";

export const Route = createFileRoute("/ulubione")({
  head: () => ({
    meta: buildSeo({
      title: "Ulubione krypto — Twoja watchlista",
      description: "Twoja lista obserwowanych kryptowalut: ceny na żywo, zmiana 24h i szybki dostęp do analiz.",
      path: "/ulubione",
    }),
  }),
  component: UlubionePage,
});

function openCommandPalette() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", ctrlKey: true }));
}

function UlubionePage() {
  const { list, remove } = useWatchlist();
  const { data: coins } = useTopCoins();

  const items = list.map((sym) => ({ sym, c: coins?.find((x) => x.symbol === sym) }));

  return (
    <div className="space-y-6" data-testid="watchlist-page">
      <header className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Star className="h-5 w-5 text-warning" />
          <h1 className="text-2xl font-bold">Ulubione</h1>
          <span className="num text-sm text-muted-foreground">({list.length})</span>
        </div>
        <button
          type="button"
          onClick={openCommandPalette}
          data-testid="watchlist-add-button"
          className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-secondary"
        >
          <Plus className="h-3.5 w-3.5" /> Dodaj coina
        </button>
      </header>

      {list.length === 0 ? (
        <section
          data-testid="watchlist-empty"
          className="rounded-xl border border-dashed border-border bg-card/40 p-8 text-center"
        >
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-warning/10">
            <Star className="h-6 w-6 text-warning" />
          </div>
          <h2 className="mt-3 text-lg font-bold">Brak ulubionych</h2>
          <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
            Dodaj coina, aby śledzić jego cenę i otrzymywać alerty tylko dla wybranych pozycji.
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={openCommandPalette}
              className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-xs font-bold text-primary-foreground hover:bg-primary/90"
            >
              <Search className="h-3.5 w-3.5" /> Znajdź coina (⌘K)
            </button>
            <Link
              to="/sila"
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-2 text-xs font-semibold hover:bg-secondary"
            >
              Przeglądaj ranking siły
            </Link>
          </div>
        </section>
      ) : (
        <ul
          data-testid="watchlist-grid"
          className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4"
        >
          {items.map(({ sym, c }) => (
            <li key={sym} className="group relative rounded-xl border border-border bg-card p-3">
              <button
                type="button"
                onClick={() => remove(sym)}
                aria-label={`Usuń ${sym}`}
                data-testid={`watchlist-remove-${sym}`}
                className="absolute right-1.5 top-1.5 rounded p-1 text-muted-foreground opacity-0 transition-opacity hover:bg-secondary hover:text-foreground group-hover:opacity-100 focus:opacity-100"
              >
                <X className="h-3.5 w-3.5" />
              </button>
              <Link
                to="/coin/$symbol"
                params={{ symbol: sym }}
                data-testid={`watchlist-link-${sym}`}
                className="block"
              >
                <div className="flex items-center gap-2">
                  {c?.image && <img src={c.image} alt="" width={20} height={20} className="h-5 w-5 rounded-full" />}
                  <span className="text-sm font-bold">{sym}</span>
                  {c && <ChangePill value={c.change24h} />}
                </div>
                <div className="num mt-1 text-base font-semibold">{c ? formatMoney(c.price) : "—"}</div>
                {c?.name && <div className="truncate text-[11px] text-muted-foreground">{c.name}</div>}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
