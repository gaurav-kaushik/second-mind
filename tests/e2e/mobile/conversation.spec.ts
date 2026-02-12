import { test, expect } from "@playwright/test";

test("multi-turn conversation: input pinned at bottom, messages scroll above", async ({
  page,
}) => {
  await page.goto("/");

  const input = page.getByPlaceholder("Ask, store, search, or plan...");

  // First message
  await input.fill("first mobile message");
  await page.getByLabel("Send").click();

  // Wait for first response
  await expect(
    page.locator("[class*='max-w-none']").first()
  ).toBeVisible({ timeout: 30000 });

  // Input should still be visible (pinned at bottom)
  await expect(input).toBeVisible();

  // Second message
  await input.fill("second mobile message");
  await page.getByLabel("Send").click();

  // Wait for second response
  await expect(page.locator("[class*='max-w-none']").nth(1)).toBeVisible({
    timeout: 30000,
  });

  // Both user messages visible
  await expect(page.getByText("first mobile message")).toBeVisible();
  await expect(page.getByText("second mobile message")).toBeVisible();

  // Input still pinned at bottom
  await expect(input).toBeVisible();
});
