import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("apps/web — accessibility", () => {
  test("homepage has no critical accessibility violations", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();

    const critical = results.violations.filter(
      (v) => v.impact === "critical" || v.impact === "serious"
    );

    if (critical.length > 0) {
      const summary = critical
        .map((v) => `[${v.impact}] ${v.id}: ${v.description}`)
        .join("\n");
      expect.fail(`Accessibility violations found:\n${summary}`);
    }
  });

  test("all images have alt text", async ({ page }) => {
    await page.goto("/");
    const images = await page.locator("img").all();
    for (const img of images) {
      const alt = await img.getAttribute("alt");
      expect(alt, `Image missing alt: ${await img.getAttribute("src")}`).not.toBeNull();
    }
  });

  test("interactive elements are keyboard reachable", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await page.keyboard.press("Tab");
    const focused = await page.evaluate(
      () => document.activeElement?.tagName?.toLowerCase()
    );
    expect(["a", "button", "input", "select", "textarea", "[tabindex]"]).toContain(
      focused
    );
  });

  test("page has a single h1", async ({ page }) => {
    await page.goto("/");
    const h1Count = await page.locator("h1").count();
    expect(h1Count).toBe(1);
  });

  test("page language attribute is set", async ({ page }) => {
    await page.goto("/");
    const lang = await page.locator("html").getAttribute("lang");
    expect(lang).toBeTruthy();
  });

  test("reduced-motion context also passes accessibility checks", async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: "reduce" });
    const page = await context.newPage();
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();

    const critical = results.violations.filter(
      (v) => v.impact === "critical" || v.impact === "serious"
    );
    expect(critical, critical.map((v) => v.id).join(", ")).toHaveLength(0);

    await context.close();
  });
});
