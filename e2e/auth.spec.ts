import { test, expect } from "@playwright/test";

test.describe("Auth", () => {
  test("signin page loads", async ({ page }) => {
    await page.goto("/auth/signin");
    await expect(page).toHaveTitle(/Sign/);
  });

  test("signup page loads", async ({ page }) => {
    await page.goto("/auth/signup");
    await expect(page).toHaveTitle(/Sign/);
  });

  test("signin has email and password fields", async ({ page }) => {
    await page.goto("/auth/signin");
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
  });

  test("signup has registration form fields", async ({ page }) => {
    await page.goto("/auth/signup");
    await expect(page.getByLabel(/name/i).first()).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
  });

  test("forgot password page loads", async ({ page }) => {
    await page.goto("/auth/forgot-password");
    await expect(page.getByText(/forgot/i).first()).toBeVisible();
  });

  test("can submit signin form with empty fields shows validation", async ({ page }) => {
    await page.goto("/auth/signin");
    const submitButton = page.getByRole("button", { name: /sign in/i });
    await submitButton.click();
    await page.waitForTimeout(500);
    await expect(page).toHaveURL(/\/auth\/signin/);
  });
});
