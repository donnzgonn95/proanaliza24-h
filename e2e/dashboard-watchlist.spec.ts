import { test, expect } from "@playwright/test";

test.describe("Dashboard + Watchlist", () => {
  test.beforeEach(async ({ context }) => {
    // Wyczyść storage między testami, by stan watchlisty był deterministyczny.
    await context.clearCookies();
  });

  test("dashboard renders key sections", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: /Top 3 setupy/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Najnowsze alerty/i })).toBeVisible();
  });

  test("watchlist add/remove and deep-link nav", async ({ page }) => {
    await page.goto("/ulubione");
    // Pusty stan widoczny.
    await expect(page.getByTestId("watchlist-empty")).toBeVisible();

    // Dodaj BTC ręcznie do localStorage (symulacja kliknięcia gwiazdki na stronie coina).
    await page.evaluate(() => {
      localStorage.setItem("watchlist:v1", JSON.stringify(["BTC"]));
      window.dispatchEvent(new CustomEvent("watchlist:changed"));
    });

    await expect(page.getByTestId("watchlist-link-BTC")).toBeVisible();

    // Deep link do coina działa.
    await page.getByTestId("watchlist-link-BTC").click();
    await expect(page).toHaveURL(/\/coin\/BTC/i);
    await page.goBack();

    // Usuń BTC.
    await page.getByTestId("watchlist-remove-BTC").click({ force: true });
    await expect(page.getByTestId("watchlist-empty")).toBeVisible();
  });

  test("mobile bottom nav switches sections without breaking deep links", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 800 });
    await page.goto("/asystent");

    const nav = page.getByTestId("mobile-bottom-nav");
    await expect(nav).toBeVisible();

    await nav.getByRole("link", { name: /Ulubione/i }).click();
    await expect(page).toHaveURL(/\/ulubione/);

    await nav.getByRole("link", { name: /Ustawienia/i }).click();
    await expect(page).toHaveURL(/\/ustawienia/);

    await nav.getByRole("link", { name: /Panel/i }).click();
    await expect(page).toHaveURL(/\/$/);
  });
});
