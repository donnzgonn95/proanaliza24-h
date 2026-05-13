import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/checkout/return")({
  head: () => ({
    meta: [
      { title: "Płatność zakończona · CryptoPuls" },
      { name: "robots", content: "noindex" },
    ],
  }),
  validateSearch: (search: Record<string, unknown>): { session_id?: string } => ({
    session_id: typeof search.session_id === "string" ? search.session_id : undefined,
  }),
  component: CheckoutReturn,
});

function CheckoutReturn() {
  const { session_id: sessionId } = Route.useSearch();

  return (
    <div className="mx-auto max-w-md space-y-6 py-12 text-center">
      <CheckCircle2 className="mx-auto h-16 w-16 text-bull" />
      <div>
        <h1 className="text-2xl font-bold">Dzięki za zakup!</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {sessionId
            ? "Twoja płatność została potwierdzona. Wysłaliśmy potwierdzenie e-mailem."
            : "Brak danych sesji – jeśli płatność została pobrana, sprawdź skrzynkę pocztową."}
        </p>
        {sessionId && (
          <p className="mt-2 text-[10px] font-mono text-muted-foreground">Sesja: {sessionId}</p>
        )}
      </div>
      <div className="flex flex-col gap-2">
        <Button asChild>
          <Link to="/">Wróć do panelu</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/setupy">Przejdź do setupów</Link>
        </Button>
      </div>
    </div>
  );
}
