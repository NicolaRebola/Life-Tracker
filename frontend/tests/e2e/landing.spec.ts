import { expect, test } from "@playwright/test";

test.describe("landing page", () => {
  test("renders the login entry point", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { name: "Life Tracker" })).toBeVisible();
    await expect(page.getByText("Bienvenido a tu proceso transformador").first()).toBeVisible();
    await expect(page.getByRole("button", { name: /continuar con google/i })).toBeVisible();
  });
});
