import { test, expect } from "@playwright/test";

test("multi-turn conversation: follow-up appears below first response", async ({
  page,
}) => {
  await page.goto("/");

  // Open command bar
  await page.keyboard.press("Meta+k");
  const input = page.getByPlaceholder("Ask, store, search, or plan...");

  // First message
  await input.fill("hello, my name is Test User");
  await page.keyboard.press("Enter");

  // Wait for first response
  const firstResponse = page.locator("[class*='max-w-none']").first();
  await expect(firstResponse).toBeVisible({ timeout: 30000 });

  // Send follow-up
  await input.fill("what did I just tell you?");
  await page.keyboard.press("Enter");

  // Wait for second response
  await expect(page.locator("[class*='max-w-none']").nth(1)).toBeVisible({
    timeout: 30000,
  });

  // Both user messages should be visible
  await expect(page.getByText("hello, my name is Test User")).toBeVisible();
  await expect(page.getByText("what did I just tell you?")).toBeVisible();

  // Two assistant responses should exist
  const responseCount = await page.locator("[class*='max-w-none']").count();
  expect(responseCount).toBeGreaterThanOrEqual(2);
});
