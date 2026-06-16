import { expect, test } from "@playwright/test";
import {
  emptyEventsResponse,
  fulfillJson,
  mockSession,
} from "./helpers/events";

test.describe("authentication", () => {
  test("shows the login entry point when there is no active session", async ({ page }) => {
    await page.route("**/api/auth/session", (route) =>
      fulfillJson(route, { authenticated: false }),
    );

    await page.goto("/");

    await expect(page.getByRole("heading", { name: "Life Tracker" })).toBeVisible();
    await expect(page.getByRole("button", { name: /continuar con google/i })).toBeVisible();
  });

  test("redirects an authenticated user from landing to events", async ({ page }) => {
    await page.route("**/api/auth/session", (route) =>
      fulfillJson(route, mockSession),
    );
    await page.route("**/api/events?*", (route) =>
      fulfillJson(route, emptyEventsResponse),
    );
    await page.route("**/api/events/tags*", (route) =>
      fulfillJson(route, { items: [] }),
    );

    await Promise.all([page.waitForURL(/\/home\/events$/), page.goto("/")]);

    await expect(page.getByRole("heading", { name: "Eventos" })).toBeVisible();
  });

  test("keeps login usable when the session check fails", async ({ page }) => {
    await page.route("**/api/auth/session", (route) =>
      fulfillJson(route, { message: "Service unavailable" }, 503),
    );

    await page.goto("/");

    await expect(page.getByRole("button", { name: /continuar con google/i })).toBeEnabled();
  });
});
