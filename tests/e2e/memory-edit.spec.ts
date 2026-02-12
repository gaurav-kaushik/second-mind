import { test, expect } from "@playwright/test";

let originalContent: string;

test("edit memory file, save, and verify change persists", async ({
  page,
}) => {
  // Store original content for cleanup
  const res = await page.request.get("/api/memory/Ideas.md");
  if (res.ok()) {
    const data = await res.json();
    originalContent = data.content;
  }
  await page.goto("/");

  // Open command bar and navigate to memory inspector
  await page.keyboard.press("Meta+k");
  const input = page.getByPlaceholder("Ask, store, search, or plan...");
  await input.fill("/memory");
  await page.keyboard.press("Enter");

  // Wait for file list
  await expect(page.getByText("Ideas.md")).toBeVisible({ timeout: 10000 });

  // Click on Ideas.md
  await page.getByText("Ideas.md").click();

  // Wait for file content to load
  await expect(page.getByText("Essay Seeds")).toBeVisible({ timeout: 10000 });

  // Click Edit
  await page.getByRole("button", { name: "Edit" }).click();

  // Textarea should appear with content
  const textarea = page.locator("textarea");
  await expect(textarea).toBeVisible();

  // Add a unique marker to the content
  const marker = `E2E_TEST_MARKER_${Date.now()}`;
  const currentContent = await textarea.inputValue();
  await textarea.fill(currentContent + `\n\n## Test\n${marker}`);

  // Save
  await page.getByRole("button", { name: "Save" }).click();

  // Should return to read view with updated content
  await expect(page.getByText(marker)).toBeVisible({ timeout: 10000 });

  // Navigate back to list and re-open the file to verify persistence
  await page.getByText("← All files").click();
  await expect(page.getByText("Ideas.md")).toBeVisible({ timeout: 10000 });
  await page.getByText("Ideas.md").click();
  await expect(page.getByText(marker)).toBeVisible({ timeout: 10000 });
});

test.afterAll(async ({ request }) => {
  // Restore original content to avoid test data pollution
  if (originalContent) {
    await request.patch("/api/memory/Ideas.md", {
      data: { content: originalContent },
    });
  }
});
