import { test, expect } from "@playwright/test";

test("submit question and verify response renders with text", async ({
  page,
}) => {
  await page.goto("/");

  // Open command bar
  await page.keyboard.press("Meta+k");
  const input = page.getByPlaceholder("Ask, store, search, or plan...");
  await expect(input).toBeVisible();

  // Submit a question
  await input.fill("what should I read next?");
  await page.keyboard.press("Enter");

  // Wait for response to appear (up to 30s for LLM call)
  const responseArea = page.locator("[class*='max-w-none']").first();
  await expect(responseArea).toBeVisible({ timeout: 30000 });

  // Response should contain actual text (paragraph or list)
  const responseText = await responseArea.textContent();
  expect(responseText).toBeTruthy();
  expect(responseText!.length).toBeGreaterThan(10);

  // Response should render markdown elements (p, ul, ol, or li)
  const hasMarkdownElements = await responseArea
    .locator("p, ul, ol, li")
    .count();
  expect(hasMarkdownElements).toBeGreaterThan(0);
});
