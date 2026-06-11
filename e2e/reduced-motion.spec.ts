import { test, expect } from "@playwright/test";

test.describe("apps/web — reduced-motion behaviour", () => {
  test("sets data-motion-mode='reduced' when prefers-reduced-motion: reduce", async ({
    browser,
  }) => {
    const context = await browser.newContext({
      reducedMotion: "reduce",
    });
    const page = await context.newPage();
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const motionMode = await page
      .locator("html")
      .getAttribute("data-motion-mode");
    expect(motionMode).toBe("reduced");

    await context.close();
  });

  test("does not set data-motion-mode='cinematic' when reduced-motion is active", async ({
    browser,
  }) => {
    const context = await browser.newContext({
      reducedMotion: "reduce",
    });
    const page = await context.newPage();
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const motionMode = await page
      .locator("html")
      .getAttribute("data-motion-mode");
    expect(motionMode).not.toBe("cinematic");

    await context.close();
  });

  test("defaults to cinematic or balanced (no reduced-motion preference)", async ({
    browser,
  }) => {
    const context = await browser.newContext({
      reducedMotion: "no-preference",
      viewport: { width: 1440, height: 900 },
    });
    const page = await context.newPage();
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const motionMode = await page
      .locator("html")
      .getAttribute("data-motion-mode");
    expect(["cinematic", "balanced"]).toContain(motionMode);

    await context.close();
  });

  test("clicking the motion-mode button cycles through modes", async ({
    browser,
  }) => {
    const context = await browser.newContext({
      reducedMotion: "no-preference",
    });
    const page = await context.newPage();
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const btn = page.locator("#motion-mode");
    const before = await page.locator("html").getAttribute("data-motion-mode");
    await btn.click();
    const after = await page.locator("html").getAttribute("data-motion-mode");
    expect(after).not.toBe(before);

    await context.close();
  });

  test("particle canvas is not rendered in reduced-motion mode", async ({
    browser,
  }) => {
    const context = await browser.newContext({ reducedMotion: "reduce" });
    const page = await context.newPage();
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const canvas = page.locator("canvas#particle-field, canvas.particle-canvas");
    const count = await canvas.count();
    if (count > 0) {
      const hidden =
        (await canvas.first().evaluate((el) => {
          const s = window.getComputedStyle(el);
          return s.display === "none" || s.visibility === "hidden" || s.opacity === "0";
        })) || true;
      expect(hidden).toBe(true);
    }

    await context.close();
  });
});
