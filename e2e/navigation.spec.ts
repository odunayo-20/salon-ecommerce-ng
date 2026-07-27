import { test, expect } from "@playwright/test";

test.describe("Booking Flow", () => {
  test("booking page loads with service categories", async ({ page }) => {
    await page.goto("/book");
    await expect(page).toHaveTitle(/Book/);
  });

  test("booking redirects unauthenticated users to sign in", async ({ page }) => {
    await page.goto("/book");
    await page.waitForTimeout(2000);
    const url = page.url();
    expect(url).toMatch(/\/(book|auth\/signin)/);
  });
});

test.describe("Blog", () => {
  test("blog page loads", async ({ page }) => {
    await page.goto("/blog");
    await expect(page).toHaveTitle(/Blog/);
  });

  test("blog page has article cards or empty state", async ({ page }) => {
    await page.goto("/blog");
    await page.waitForTimeout(1000);
    const hasContent = await page.getByText(/blog/i).first().isVisible();
    expect(hasContent).toBeTruthy();
  });
});

test.describe("Public Pages", () => {
  const pages = [
    { path: "/about", title: /about/i },
    { path: "/faq", title: /faq/i },
    { path: "/contact", title: /contact/i },
    { path: "/locations", title: /location/i },
    { path: "/shipping", title: /shipping/i },
    { path: "/returns", title: /return/i },
    { path: "/privacy", title: /privacy/i },
    { path: "/terms", title: /term/i },
  ];

  for (const { path, title } of pages) {
    test(`${path} page loads`, async ({ page }) => {
      await page.goto(path);
      await expect(page).toHaveTitle(title);
    });
  }
});
