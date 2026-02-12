import { test, expect } from "@playwright/test";

test("type /memory, see file list, tap a file, see content", async ({
  page,
}) => {
  await page.goto("/");

  const input = page.getByPlaceholder("Ask, store, search, or plan...");

  // Type /memory
  await input.fill("/memory");
  await page.getByLabel("Send").click();

  // Memory inspector should show files
  await expect(page.getByText("Gaurav.md")).toBeVisible({ timeout: 10000 });
  await expect(page.getByText("Reading.md")).toBeVisible();
  await expect(page.getByText("Travel.md")).toBeVisible();

  // Tap on Reading.md
  await page.getByText("Reading.md").click();

  // Content should be readable
  await expect(page.getByText("Currently Reading")).toBeVisible({
    timeout: 10000,
  });
});
