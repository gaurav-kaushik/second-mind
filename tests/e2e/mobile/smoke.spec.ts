import { test, expect } from "@playwright/test";

test("app loads and shows persistent bottom input bar (not Cmd+K modal)", async ({
  page,
}) => {
  await page.goto("/");

  // Mobile should show "Second Mind" in top bar
  await expect(page.getByText("Second Mind")).toBeVisible();

  // Should have a persistent input bar visible (not hidden behind Cmd+K)
  const input = page.getByPlaceholder("Ask, store, search, or plan...");
  await expect(input).toBeVisible();

  // Should show prompt pills in empty state
  await expect(page.getByText("What can I help with?")).toBeVisible();
  await expect(page.getByRole("button", { name: "What should I read next?" })).toBeVisible();

  // Send button should be visible
  await expect(page.getByLabel("Send")).toBeVisible();
});
