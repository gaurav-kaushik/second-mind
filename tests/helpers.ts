import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "http://127.0.0.1:54321";
const serviceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU";

export function getTestClient() {
  return createClient(supabaseUrl, serviceRoleKey);
}

export const TEST_BASE_URL = process.env.TEST_BASE_URL || "http://localhost:3111";

export async function seedTestData() {
  const supabase = getTestClient();

  const files = [
    {
      filename: "Gaurav.md",
      description: "Core identity",
      content: "# Gaurav\n\nTest content for Gaurav.",
    },
    {
      filename: "Reading.md",
      description: "Books and reading",
      content: "# Reading\n\nTest reading content.",
    },
  ];

  for (const file of files) {
    await supabase.from("memory_files").upsert(file, { onConflict: "filename" });
  }

  return files;
}
