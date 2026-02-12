import { test, expect } from "@playwright/test";

test("app loads at / without errors", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Second Mind")).toBeVisible();
  await expect(page.getByText("⌘K")).toBeVisible();
});
