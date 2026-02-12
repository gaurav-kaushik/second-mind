import { test, expect } from "@playwright/test";

test("text is readable without zooming (body font-size >= 16px)", async ({
  page,
}) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");

  const fontSize = await page.evaluate(() => {
    const body = document.body;
    const computed = window.getComputedStyle(body);
    return parseFloat(computed.fontSize);
  });

  expect(fontSize).toBeGreaterThanOrEqual(16);
});
