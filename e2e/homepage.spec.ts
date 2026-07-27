import { test, expect } from "@playwright/test";

test.describe("Homepage", () => {
  test("loads and displays brand name", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/MecBill Tech Salon/);
  });

  test("navigation links are visible", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: /shop/i }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: /book/i }).first()).toBeVisible();
  });

  test("can navigate to shop page", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /shop/i }).first().click();
    await expect(page).toHaveURL(/\/shop/);
    await expect(page.getByText(/shop/i).first()).toBeVisible();
  });

  test("can navigate to booking page", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /book/i }).first().click();
    await expect(page).toHaveURL(/\/book/);
  });
});
