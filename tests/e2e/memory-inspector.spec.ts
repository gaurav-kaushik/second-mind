import { test, expect } from "@playwright/test";

test("type /memory to open memory inspector, see file list, click a file", async ({
  page,
}) => {
  await page.goto("/");

  // Open command bar
  await page.keyboard.press("Meta+k");
  const input = page.getByPlaceholder("Ask, store, search, or plan...");
  await expect(input).toBeVisible({ timeout: 5000 });

  // Type /memory to trigger inspector
  await input.fill("/memory");
  await page.keyboard.press("Enter");

  // Memory inspector should show file list
  await expect(page.getByText("Gaurav.md")).toBeVisible({ timeout: 10000 });
  await expect(page.getByText("Reading.md")).toBeVisible();
  await expect(page.getByText("Taste.md")).toBeVisible();
  await expect(page.getByText("Travel.md")).toBeVisible();
  await expect(page.getByText("Ideas.md")).toBeVisible();

  // Click on Gaurav.md
  await page.getByText("Gaurav.md").click();

  // Should show file content
  await expect(page.getByText("Identity")).toBeVisible({ timeout: 10000 });
  await expect(page.getByText("Communication Style")).toBeVisible();
});
