import { test, expect } from "@playwright/test";

test("type a question, tap send, see response above input", async ({
  page,
}) => {
  await page.goto("/");

  const input = page.getByPlaceholder("Ask, store, search, or plan...");
  await expect(input).toBeVisible();

  // Type a question
  await input.fill("hello from mobile");

  // Tap the send button
  await page.getByLabel("Send").click();

  // User message should appear
  await expect(page.getByText("hello from mobile")).toBeVisible();

  // Loading indicator should show
  await expect(page.getByText("Thinking")).toBeVisible({ timeout: 3000 });

  // Wait for response
  await expect(
    page.locator("[class*='max-w-none']").first()
  ).toBeVisible({ timeout: 30000 });

  // Input should still be visible at the bottom
  await expect(input).toBeVisible();
});
