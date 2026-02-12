import { test, expect } from "@playwright/test";

test("no horizontal scroll on mobile viewport", async ({ page }) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");

  const hasHorizontalScroll = await page.evaluate(() => {
    return document.body.scrollWidth > window.innerWidth;
  });

  expect(hasHorizontalScroll).toBe(false);
});
