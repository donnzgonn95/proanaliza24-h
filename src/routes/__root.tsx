import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "theme-color", content: "#0b1020" },
      { name: "author", content: "CryptoPuls" },
      { name: "twitter:site", content: "@Lovable" },
      { name: "robots", content: "index, follow" },
      { title: "(Aktualne dane/Trendy 8T/  ver.Premium- 3 Special Agent" },
      { property: "og:title", content: "(Aktualne dane/Trendy 8T/  ver.Premium- 3 Special Agent" },
      { name: "twitter:title", content: "(Aktualne dane/Trendy 8T/  ver.Premium- 3 Special Agent" },
      { name: "description", content: "Latwo stworzyc aplikacje, płaci sie za wiedze w niej zawarta." },
      { property: "og:description", content: "Latwo stworzyc aplikacje, płaci sie za wiedze w niej zawarta." },
      { name: "twitter:description", content: "Latwo stworzyc aplikacje, płaci sie za wiedze w niej zawarta." },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/SEELnZfOq2fDrqL2I2ema9v6pP52/social-images/social-1778726145210-c96f82b0-0b08-4b9f-80f5-c79cbeab5a85.webp" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/SEELnZfOq2fDrqL2I2ema9v6pP52/social-images/social-1778726145210-c96f82b0-0b08-4b9f-80f5-c79cbeab5a85.webp" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:type", content: "website" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://api.coingecko.com" },
      { rel: "preconnect", href: "https://stream.binance.com" },
      { rel: "dns-prefetch", href: "https://api.binance.com" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "CryptoPuls",
          url: "https://dosprawdzenioappjasnyl.lovable.app",
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "CryptoPuls",
          url: "https://dosprawdzenioappjasnyl.lovable.app",
        }),
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

import { Header } from "@/components/Header";
import { Toaster } from "@/components/ui/sonner";
import { useAlertNotifications } from "@/lib/notifications";
import { CommandPalette } from "@/components/CommandPalette";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { PaymentTestModeBanner } from "@/components/PaymentTestModeBanner";

function NotificationsBridge() {
  useAlertNotifications();
  return null;
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-background">
        <PaymentTestModeBanner />
        <Header />
        <main className="mx-auto max-w-6xl px-4 pb-32 pt-32 md:pb-24 md:pt-24">
          <Outlet />
        </main>
        <MobileBottomNav />
        <CommandPalette />
        <NotificationsBridge />
        <Toaster position="top-right" richColors closeButton />
      </div>
    </QueryClientProvider>
  );
}
