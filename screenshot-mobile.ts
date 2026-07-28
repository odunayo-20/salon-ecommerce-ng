import { chromium } from "@playwright/test";

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 375, height: 812 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();

  // 1. First screenshot the login page at mobile
  await page.goto("http://localhost:3000/auth/login", { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: "C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\mobile-login.png", fullPage: true });

  const loginIssues = await page.evaluate(() => {
    const results: string[] = [];
    const clientWidth = document.documentElement.clientWidth;
    const scrollWidth = document.documentElement.scrollWidth;
    if (scrollWidth > clientWidth + 2) {
      results.push(`HORIZONTAL OVERFLOW: ${scrollWidth} > ${clientWidth}`);
    }
    // Check all elements
    const allEls = document.querySelectorAll("button, a, input, select");
    for (const el of Array.from(allEls)) {
      const rect = el.getBoundingClientRect();
      if (rect.height > 0 && rect.height < 40 && rect.width > 0) {
        results.push(`Small target: <${el.tagName}> ${Math.round(rect.height)}x${Math.round(rect.width)} "${(el.textContent || "").trim().slice(0,30)}"`);
      }
    }
    return results;
  });
  console.log("=== LOGIN ===");
  loginIssues.forEach((i) => console.log(i));

  // 2. Try to log in with test credentials
  // First check what's on the login page
  const pageContent = await page.evaluate(() => {
    const inputs = document.querySelectorAll("input");
    const buttons = document.querySelectorAll("button");
    return {
      inputs: Array.from(inputs).map((i) => ({ type: i.type, name: i.name, placeholder: i.placeholder })),
      buttons: Array.from(buttons).map((b) => ({ text: (b.textContent || "").trim().slice(0, 30), type: b.type })),
      hasForm: !!document.querySelector("form"),
    };
  });
  console.log("Login page elements:", JSON.stringify(pageContent, null, 2));

  // Check if there's a seeded admin user or we need to use credentials from the codebase
  // Let me check the seed file or env
  const envCheck = await page.evaluate(() => {
    // Check if there's any visible error or form
    const allText = document.body.innerText;
    return allText.slice(0, 500);
  });
  console.log("Page text:", envCheck);

  await browser.close();
  console.log("\nDone");
})();
