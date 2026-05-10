// Per-coin alert trigger editor: add "above/below price" thresholds.
import { useState } from "react";
import { Bell, Plus, Trash2 } from "lucide-react";
import { useTriggers } from "@/lib/alert-triggers";
import { cn } from "@/lib/utils";

export function AlertTriggersPanel({ symbol, currentPrice }: { symbol: string; currentPrice?: number }) {
  const { list, add, remove, toggle } = useTriggers(symbol);
  const [side, setSide] = useState<"above" | "below">("above");
  const [price, setPrice] = useState<string>("");

  const submit = () => {
    const p = parseFloat(price.replace(",", "."));
    if (!isFinite(p) || p <= 0) return;
    add({ symbol, side, price: p });
    setPrice("");
  };

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="mb-3 flex items-center gap-2 text-sm font-bold">
        <Bell className="h-4 w-4 text-warning" />
        Wyzwalacze alertów dla {symbol}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex overflow-hidden rounded-md border border-border">
          <button
            type="button"
            onClick={() => setSide("above")}
            className={cn("px-3 py-1.5 text-xs", side === "above" ? "bg-bull/20 text-bull" : "text-muted-foreground")}
          >
            Powyżej
          </button>
          <button
            type="button"
            onClick={() => setSide("below")}
            className={cn("px-3 py-1.5 text-xs", side === "below" ? "bg-bear/20 text-bear" : "text-muted-foreground")}
          >
            Poniżej
          </button>
        </div>
        <input
          type="text"
          inputMode="decimal"
          placeholder={currentPrice ? currentPrice.toString() : "cena USD"}
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          className="num h-8 w-32 rounded-md border border-border bg-background px-2 text-sm outline-none focus:border-primary"
        />
        <button
          type="button"
          onClick={submit}
          className="inline-flex h-8 items-center gap-1 rounded-md bg-primary px-3 text-xs font-semibold text-primary-foreground hover:opacity-90"
        >
          <Plus className="h-3 w-3" /> Dodaj
        </button>
      </div>
      {list.length === 0 ? (
        <p className="mt-3 text-xs text-muted-foreground">
          Brak wyzwalaczy. Powiadomię Cię, gdy cena przekroczy ustawiony poziom.
        </p>
      ) : (
        <ul className="mt-3 divide-y divide-border">
          {list.map((t) => (
            <li key={t.id} className="flex items-center gap-2 py-2 text-sm">
              <span
                className={cn(
                  "rounded px-2 py-0.5 text-[10px] font-bold uppercase",
                  t.side === "above" ? "bg-bull/20 text-bull" : "bg-bear/20 text-bear",
                )}
              >
                {t.side === "above" ? "Powyżej" : "Poniżej"}
              </span>
              <span className="num font-semibold">${t.price.toLocaleString("en-US")}</span>
              <button
                type="button"
                onClick={() => toggle(t.id)}
                className={cn(
                  "ml-auto rounded-md border px-2 py-0.5 text-[10px]",
                  t.enabled
                    ? "border-primary/40 bg-primary/10 text-foreground"
                    : "border-border text-muted-foreground",
                )}
              >
                {t.enabled ? "Aktywny" : "Wyłączony"}
              </button>
              <button
                type="button"
                onClick={() => remove(t.id)}
                aria-label="Usuń"
                className="rounded p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
