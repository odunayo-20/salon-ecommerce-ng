import { test, expect } from "@playwright/test";

test.describe("SEO", () => {
  test("sitemap.xml is accessible", async ({ page }) => {
    const response = await page.goto("/sitemap.xml");
    expect(response?.status()).toBe(200);
    const content = await page.content();
    expect(content).toContain("<urlset");
    expect(content).toContain("mecbilltechsalon");
  });

  test("robots.txt is accessible", async ({ page }) => {
    const response = await page.goto("/robots.txt");
    expect(response?.status()).toBe(200);
    const content = await page.textContent("body");
    expect(content).toContain("User-agent");
    expect(content).toContain("Sitemap:");
  });

  test("robots.txt disallows admin and dashboard", async ({ page }) => {
    await page.goto("/robots.txt");
    const content = await page.textContent("body");
    expect(content).toContain("/admin");
    expect(content).toContain("/dashboard");
    expect(content).toContain("/api/");
  });

  test("homepage has structured data (JSON-LD)", async ({ page }) => {
    await page.goto("/");
    const scripts = page.locator('script[type="application/ld+json"]');
    const count = await scripts.count();
    expect(count).toBeGreaterThan(0);
    const content = await scripts.first().textContent();
    expect(content).toContain("HairSalon");
  });
});

test.describe("Security Headers", () => {
  test("returns security headers", async ({ page }) => {
    const response = await page.goto("/");
    const headers = response?.headers();
    expect(headers?.["x-content-type-options"]).toBe("nosniff");
    expect(headers?.["x-frame-options"]).toBe("DENY");
  });
});
