import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Bell, BellOff, Check, Radio } from "lucide-react";
import {
  DATA_SOURCES,
  DATA_SOURCE_LABELS,
  setDataSource,
  useDataSource,
  type DataSource,
} from "@/lib/data-source";
import { fetchBinanceCoins } from "@/lib/providers/binance";
import { fetchCoingeckoCoins } from "@/lib/providers/coingecko";
import { fetchCryptoCompareCoins } from "@/lib/providers/cryptocompare";
import {
  fireNotification,
  notifPermission,
  requestNotifPermission,
  setNotifSettings,
  useNotifSettings,
  type NotifLevel,
} from "@/lib/notifications";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/ustawienia")({
  head: () => ({
    meta: [
      { title: "Ustawienia — CryptoPuls" },
      { name: "description", content: "Wybierz źródło danych: Binance, CoinGecko lub CryptoCompare." },
    ],
  }),
  component: SettingsPage,
});

const META: Record<DataSource, { desc: string; pros: string; klines: boolean }> = {
  binance: {
    desc: "Dane z największej giełdy spot. Najszybsze, najświeższe, świetne wolumeny.",
    pros: "Realne 7D z świec dziennych (/api/v3/klines)",
    klines: true,
  },
  coingecko: {
    desc: "Agregator z setek giełd. Globalna kapitalizacja i dominacja.",
    pros: "Wbudowane 7D, market cap, brak limitu CORS",
    klines: false,
  },
  cryptocompare: {
    desc: "Dobre źródło porównawcze, wolumeny zagregowane.",
    pros: "Realne 7D z dziennych świec (histoday)",
    klines: true,
  },
};

function SettingsPage() {
  const source = useDataSource();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold">Ustawienia</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Wybierz źródło danych rynkowych. Wybór zapisuje się lokalnie w przeglądarce.
        </p>
      </header>

      <section className="space-y-3">
        <h2 className="text-xs uppercase tracking-widest text-muted-foreground">Źródło danych</h2>
        {DATA_SOURCES.map((s) => {
          const active = source === s;
          const meta = META[s];
          return (
            <button
              key={s}
              onClick={() => setDataSource(s)}
              className={cn(
                "block w-full rounded-xl border bg-card p-5 text-left transition-colors",
                active ? "border-primary ring-1 ring-primary/40" : "border-border hover:border-primary/50",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold">{DATA_SOURCE_LABELS[s]}</span>
                    {meta.klines && (
                      <span className="rounded bg-bull/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-bull">
                        7D realne
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{meta.desc}</p>
                  <p className="mt-2 text-xs text-foreground/70">✓ {meta.pros}</p>
                </div>
                <div className={cn(
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border",
                  active ? "border-primary bg-primary text-primary-foreground" : "border-border",
                )}>
                  {active && <Check className="h-3.5 w-3.5" />}
                </div>
              </div>
            </button>
          );
        })}
      </section>

      <NotificationsSection />

      <SourceTest />

      <section className="rounded-xl border border-border bg-card/60 p-5 text-sm">
        <h3 className="font-semibold">Wskazówka</h3>
        <p className="mt-2 text-muted-foreground">
          Jeśli któreś źródło zwraca błąd (CORS, limity rate limit), spróbuj innego.
          CoinGecko bywa wolniejsze, ale ma wbudowane 7D bez dodatkowych zapytań.
          Binance i CryptoCompare używają świec dziennych, by policzyć prawdziwą zmianę 7D.
        </p>
      </section>
    </div>
  );
}

function SourceTest() {
  const source = useDataSource();
  const { data, isFetching, isError, error, dataUpdatedAt, refetch } = useQuery({
    queryKey: ["settings-test", source],
    queryFn: () =>
      source === "binance"
        ? fetchBinanceCoins()
        : source === "coingecko"
          ? fetchCoingeckoCoins()
          : fetchCryptoCompareCoins(),
  });

  return (
    <section className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Test połączenia · {DATA_SOURCE_LABELS[source]}</h3>
        <button
          onClick={() => refetch()}
          className="rounded-md border border-border bg-background px-3 py-1 text-xs hover:bg-secondary"
        >
          Odśwież
        </button>
      </div>
      <div className="mt-3 flex items-center gap-2 text-xs">
        <Radio className={cn("h-3 w-3", !isError && data && "animate-pulse text-bull")} />
        {isFetching ? (
          <span className="text-muted-foreground">Pobieram…</span>
        ) : isError ? (
          <span className="text-bear">Błąd: {(error as Error)?.message ?? "nieznany"}</span>
        ) : data ? (
          <span className="text-bull">
            OK — pobrano {data.length} monet · {new Date(dataUpdatedAt).toLocaleTimeString("pl-PL")}
          </span>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </div>
      {data && (
        <div className="mt-3 grid grid-cols-2 gap-2 text-xs sm:grid-cols-5">
          {data.slice(0, 5).map((c) => (
            <div key={c.symbol} className="rounded border border-border bg-background/40 p-2">
              <div className="font-bold">{c.symbol}</div>
              <div className="num text-muted-foreground">${c.price.toFixed(2)}</div>
              <div className="num">7D: {c.change7d >= 0 ? "+" : ""}{c.change7d}%</div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
