import { Link, useRouterState } from "@tanstack/react-router";
import { Activity, ArrowLeftRight, BarChart3, Bell, BookOpen, Settings, Sparkles, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import eljotLogo from "@/assets/eljot-logo.png";

const nav = [
  { to: "/", label: "Panel", icon: Sparkles },
  { to: "/sentyment", label: "Sentyment", icon: Activity },
  { to: "/przeplyw", label: "Przepływ", icon: ArrowLeftRight },
  { to: "/sila", label: "Siła", icon: BarChart3 },
  { to: "/setupy", label: "Setupy", icon: Target },
  { to: "/alerty", label: "Alerty", icon: Bell },
  { to: "/slownik", label: "Słownik", icon: BookOpen },
  { to: "/ustawienia", label: "Ustawienia", icon: Settings },
] as const;

export function Header() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border bg-background/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link to="/" className="flex items-center gap-3">
          <img
            src={eljotLogo}
            alt="Logo eL Jot"
            width={56}
            height={56}
            className="h-14 w-14 rounded-full"
          />
          <div className="leading-tight">
            <div className="text-base font-bold md:text-lg">Kukomy co w rynkach piszczy</div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
              DEMO · v0.1 · szczegółowa analiza struktury rynku by eL Jot
            </div>
          </div>
        </Link>
        <div className="hidden items-center gap-1 md:flex">
          {nav.map((n) => {
            const active = path === n.to;
            return (
              <Link
                key={n.to}
                to={n.to}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm transition-colors",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                )}
              >
                {n.label}
              </Link>
            );
          })}
        </div>
        <div className="hidden items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-[10px] uppercase tracking-widest text-muted-foreground sm:flex">
          <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
          dane demo
        </div>
      </div>
      {/* Mobile nav */}
      <nav className="flex gap-1 overflow-x-auto border-t border-border px-3 py-2 md:hidden">
        {nav.map((n) => {
          const active = path === n.to;
          const Icon = n.icon;
          return (
            <Link
              key={n.to}
              to={n.to}
              className={cn(
                "flex shrink-0 flex-col items-center gap-0.5 rounded-md px-3 py-1.5 text-[11px] transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-secondary",
              )}
            >
              <Icon className="h-4 w-4" />
              {n.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
