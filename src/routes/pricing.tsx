import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Check, Flame } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StripeEmbeddedCheckout } from "@/components/StripeEmbeddedCheckout";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Cennik · CryptoPuls Pro" },
      {
        name: "description",
        content:
          "Pełen dostęp do setupów Long/Short, Squeeze Radar, alertów premium i asystenta AI. Plan miesięczny lub roczny.",
      },
    ],
  }),
  component: PricingPage,
});

type PlanId = "pro_monthly" | "pro_yearly";

const PLANS: { id: PlanId; label: string; price: string; per: string; badge?: string }[] = [
  { id: "pro_monthly", label: "Pro miesięczny", price: "49 zł", per: "/ miesiąc" },
  {
    id: "pro_yearly",
    label: "Pro roczny",
    price: "490 zł",
    per: "/ rok",
    badge: "2 miesiące gratis",
  },
];

const FEATURES = [
  "Setupy Long/Short na 1H, 4H, 1D",
  "Squeeze Radar (long + short) z scoringiem",
  "Alerty premium z dźwiękiem i powiadomieniami",
  "Asystent AI – raporty inwestorskie",
  "Nielimitowana watchlista i ulubione",
  "Eksport danych i historii alertów",
];

function PricingPage() {
  const [plan, setPlan] = useState<PlanId>("pro_yearly");
  const [email, setEmail] = useState("");
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  return (
    <div className="space-y-10">
      <header className="text-center">
        <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs uppercase tracking-widest text-muted-foreground">
          <Flame className="h-3 w-3 text-warning" /> CryptoPuls Pro
        </div>
        <h1 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">
          Pełna analityka rynku krypto
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground">
          Setupy, Squeeze Radar, alerty i asystent AI w jednym miejscu. Anuluj kiedy chcesz.
        </p>
      </header>

      {!checkoutOpen ? (
        <div className="grid gap-4 md:grid-cols-2">
          {PLANS.map((p) => {
            const selected = plan === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setPlan(p.id)}
                className={cn(
                  "relative rounded-xl border p-6 text-left transition-all",
                  selected
                    ? "border-primary bg-primary/5 shadow-lg"
                    : "border-border bg-card hover:border-primary/50",
                )}
              >
                {p.badge && (
                  <span className="absolute -top-2 right-4 rounded-full bg-warning px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-background">
                    {p.badge}
                  </span>
                )}
                <div className="text-sm uppercase tracking-widest text-muted-foreground">{p.label}</div>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-3xl font-bold">{p.price}</span>
                  <span className="text-sm text-muted-foreground">{p.per}</span>
                </div>
                <ul className="mt-4 space-y-2">
                  {FEATURES.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-bull" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </button>
            );
          })}
        </div>
      ) : null}

      {!checkoutOpen ? (
        <div className="mx-auto max-w-md space-y-3">
          <div className="space-y-1">
            <Label htmlFor="email">E-mail (opcjonalnie)</Label>
            <Input
              id="email"
              type="email"
              placeholder="ty@przyklad.pl"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <Button size="lg" className="w-full" onClick={() => setCheckoutOpen(true)}>
            Przejdź do płatności
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            Bezpieczna płatność. Anulujesz kiedy chcesz.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Płatność – {PLANS.find((p) => p.id === plan)?.label}</h2>
            <Button variant="ghost" size="sm" onClick={() => setCheckoutOpen(false)}>
              Zmień plan
            </Button>
          </div>
          <StripeEmbeddedCheckout priceId={plan} customerEmail={email || undefined} />
        </div>
      )}
    </div>
  );
}
