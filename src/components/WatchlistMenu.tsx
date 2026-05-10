// Compact dropdown listing watchlist symbols, with quick navigation.
import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Star, X } from "lucide-react";
import { useWatchlist } from "@/lib/watchlist";
import { useTopCoins } from "@/lib/top-coins";
import { cn } from "@/lib/utils";

export function WatchlistMenu({ className }: { className?: string }) {
  const { list, remove } = useWatchlist();
  const { data: coins } = useTopCoins();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Ulubione"
        className="inline-flex h-8 items-center gap-1 rounded-md border border-border bg-card px-2 text-xs text-muted-foreground hover:bg-secondary hover:text-foreground"
      >
        <Star className={cn("h-3.5 w-3.5", list.length > 0 && "fill-warning text-warning")} />
        <span className="num">{list.length}</span>
      </button>
      {open && (
        <div className="absolute right-0 z-50 mt-1 w-72 overflow-hidden rounded-lg border border-border bg-popover shadow-xl">
          <div className="border-b border-border px-3 py-2 text-xs uppercase tracking-wider text-muted-foreground">
            Ulubione ({list.length})
          </div>
          {list.length === 0 ? (
            <div className="px-3 py-4 text-xs text-muted-foreground">
              Pusto. Otwórz coina i kliknij <span className="font-semibold text-foreground">„Dodaj do ulubionych”</span>.
            </div>
          ) : (
            <ul className="max-h-80 overflow-y-auto py-1">
              {list.map((sym) => {
                const c = coins?.find((x) => x.symbol === sym);
                return (
                  <li key={sym} className="group flex items-center gap-2 px-2 py-1 hover:bg-secondary/60">
                    <Link
                      to="/coin/$symbol"
                      params={{ symbol: sym }}
                      onClick={() => setOpen(false)}
                      className="flex flex-1 items-center gap-2 rounded px-1 py-1 text-sm"
                    >
                      {c?.image && <img src={c.image} alt="" width={18} height={18} className="h-4 w-4 rounded-full" />}
                      <span className="font-semibold">{sym}</span>
                      {c && (
                        <span className={cn("num ml-auto text-xs", c.change24h >= 0 ? "text-bull" : "text-bear")}>
                          {c.change24h >= 0 ? "+" : ""}
                          {c.change24h.toFixed(2)}%
                        </span>
                      )}
                    </Link>
                    <button
                      type="button"
                      onClick={() => remove(sym)}
                      aria-label="Usuń"
                      className="rounded p-1 text-muted-foreground opacity-0 transition-opacity hover:bg-secondary hover:text-foreground group-hover:opacity-100"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
