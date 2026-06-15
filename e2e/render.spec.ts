import { test, expect } from "@playwright/test";

test.describe("apps/web — page render", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("loads without console errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });
    await page.reload();
    await page.waitForLoadState("networkidle");
    expect(errors).toHaveLength(0);
  });

  test("renders the site heading", async ({ page }) => {
    await expect(page.locator("h1").first()).toBeVisible();
  });

  test("renders the #plugins section", async ({ page }) => {
    const plugins = page.locator("#plugins");
    await expect(plugins).toBeVisible();
  });

  test("renders the #marketplace anchor", async ({ page }) => {
    const marketplace = page.locator("#marketplace");
    await expect(marketplace).toBeAttached();
  });

  test("renders the #gap-board element", async ({ page }) => {
    const gapBoard = page.locator("#gap-board");
    await expect(gapBoard).toBeAttached();
  });

  test("renders the skip-link for keyboard users", async ({ page }) => {
    const skip = page.locator("a[href='#main'], .skip-link, [data-skip-link]");
    await expect(skip.first()).toBeAttached();
  });

  test("renders motion-mode toggle button", async ({ page }) => {
    const btn = page.locator("#motion-mode");
    await expect(btn).toBeVisible();
  });
});
