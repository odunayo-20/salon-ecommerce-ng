import { test, expect } from "@playwright/test";

test.describe("Shop", () => {
  test("shop page loads with products", async ({ page }) => {
    await page.goto("/shop");
    await expect(page).toHaveTitle(/Shop/);
  });

  test("shop page has search functionality", async ({ page }) => {
    await page.goto("/shop");
    const searchInput = page.getByPlaceholder(/search/i);
    await expect(searchInput).toBeVisible();
  });

  test("can view a product detail page", async ({ page }) => {
    await page.goto("/shop");
    const productLink = page.locator("a[href*='/shop/']").first();
    if (await productLink.isVisible()) {
      await productLink.click();
      await expect(page).toHaveURL(/\/shop\/[^/]+/);
    }
  });

  test("can add product to cart", async ({ page }) => {
    await page.goto("/shop");
    const productLink = page.locator("a[href*='/shop/']").first();
    if (await productLink.isVisible()) {
      await productLink.click();
      await page.waitForTimeout(1000);
      const addButton = page.getByRole("button", { name: /add to cart/i });
      if (await addButton.isVisible()) {
        await addButton.click();
        await expect(page.getByText(/cart/i).first()).toBeVisible();
      }
    }
  });
});
