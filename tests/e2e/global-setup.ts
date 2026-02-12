import { test as setup, expect } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";

const TEST_EMAIL = "e2e-test@secondmind.local";
const TEST_PASSWORD = "e2e-test-password-123";

setup("authenticate", async ({ page }) => {
  // Create test user via Supabase admin API (idempotent)
  const supabaseUrl = "http://127.0.0.1:54321";
  const serviceRoleKey =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU";

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Try to create the user; ignore "already exists" errors
  const { error } = await supabase.auth.admin.createUser({
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
    email_confirm: true,
  });

  if (error && !error.message.includes("already been registered")) {
    throw new Error(`Failed to create test user: ${error.message}`);
  }

  // Seed memory files for tests
  const files = [
    {
      filename: "Gaurav.md",
      description:
        "Core identity, family, work, calendar, communication style",
      content:
        "# Gaurav\n\n## Identity\nGaurav is a writer and technologist.\n\n## Communication Style\nDirect, curious, warm.",
    },
    {
      filename: "Reading.md",
      description: "Books read, reading list, Substacks, reading patterns",
      content:
        "# Reading\n\n## Currently Reading\n- Thinking, Fast and Slow\n\n## Favorites\n- Blood Meridian\n- Gödel, Escher, Bach",
    },
    {
      filename: "Taste.md",
      description:
        "Books, films, music, art, design, aesthetic preferences",
      content:
        "# Taste\n\n## Music\nLikes jazz, ambient, classical.\n\n## Films\nPrefers auteur cinema.",
    },
    {
      filename: "Travel.md",
      description: "Destinations, hotels, airlines, past trips, bucket list",
      content:
        "# Travel\n\n## Bucket List\n- Kyoto in cherry blossom season\n- Patagonia\n\n## Past Trips\n- Iceland 2023",
    },
    {
      filename: "Ideas.md",
      description: "Essay seeds, story concepts, creative threads",
      content:
        "# Ideas\n\n## Essay Seeds\n- Gardening as programming\n- The aesthetics of maintenance",
    },
  ];

  for (const file of files) {
    await supabase
      .from("memory_files")
      .upsert(file, { onConflict: "filename" });
  }

  // Log in via the browser
  await page.goto("/login");
  await page.getByPlaceholder("Email").fill(TEST_EMAIL);
  await page.getByPlaceholder("Password").fill(TEST_PASSWORD);
  await page.getByRole("button", { name: "Sign in" }).click();

  // Wait for redirect to home page
  await expect(page).toHaveURL("/", { timeout: 10000 });

  // Save auth state
  await page.context().storageState({ path: "tests/e2e/.auth/user.json" });
});
