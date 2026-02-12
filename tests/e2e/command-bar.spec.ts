import { test, expect } from "@playwright/test";

test("Cmd+K opens command bar, typing and Enter shows loading then response", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.getByText("Second Mind")).toBeVisible();

  // Open command bar with Cmd+K
  await page.keyboard.press("Meta+k");

  // Command bar input should appear
  const input = page.getByPlaceholder("Ask, store, search, or plan...");
  await expect(input).toBeVisible();
  await expect(input).toBeFocused();

  // Type a question and submit
  await input.fill("hello");
  await page.keyboard.press("Enter");

  // User message should appear
  await expect(page.getByText("hello")).toBeVisible();

  // Loading indicator should show
  await expect(page.getByText("Thinking")).toBeVisible({ timeout: 3000 });

  // Wait for a response (either real or error-graceful)
  await expect(
    page.locator("[class*='max-w-none']").first()
  ).toBeVisible({ timeout: 30000 });
});

test("Escape closes command bar", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Meta+k");

  const input = page.getByPlaceholder("Ask, store, search, or plan...");
  await expect(input).toBeVisible();

  await page.keyboard.press("Escape");
  await expect(input).not.toBeVisible();
});
