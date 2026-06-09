import { expect, test } from "@playwright/test";

test.describe("landing page", () => {
  test("renders the login entry point", async ({ page }) => {
    await page.route("**/api/auth/session", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ authenticated: false }),
      });
    });

    await page.goto("/");

    await expect(page.getByRole("heading", { name: "Life Tracker" })).toBeVisible();
    await expect(
      page.getByText(
        "Ordená tus días, entendé tus hábitos y convertí tu rutina en progreso real.",
      ),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: /continuar con google/i })).toBeVisible();
  });
});
