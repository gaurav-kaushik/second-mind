import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { getTestClient } from "../helpers";

describe("Memory API (via Supabase client)", () => {
  const supabase = getTestClient();

  beforeAll(async () => {
    // Seed test data
    await supabase.from("memory_files").upsert(
      {
        filename: "TestFile.md",
        description: "A test file",
        content: "# Test\n\nOriginal content.",
      },
      { onConflict: "filename" }
    );
  });

  afterAll(async () => {
    // Clean up test data to avoid polluting the memory inspector
    const { data } = await supabase
      .from("memory_files")
      .select("id")
      .eq("filename", "TestFile.md")
      .single();

    if (data) {
      await supabase
        .from("memory_file_versions")
        .delete()
        .eq("memory_file_id", data.id);
      await supabase
        .from("memory_files")
        .delete()
        .eq("filename", "TestFile.md");
    }
  });

  it("lists memory files without content", async () => {
    const { data, error } = await supabase
      .from("memory_files")
      .select("id, filename, description, version, updated_at")
      .order("filename");

    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect(data!.length).toBeGreaterThan(0);
    // Verify no content field in list query
    const first = data![0] as Record<string, unknown>;
    expect(first).not.toHaveProperty("content");
  });

  it("gets a specific memory file with content", async () => {
    const { data, error } = await supabase
      .from("memory_files")
      .select("*")
      .eq("filename", "TestFile.md")
      .single();

    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect(data!.content).toContain("Original content");
  });

  it("returns error for nonexistent file", async () => {
    const { data, error } = await supabase
      .from("memory_files")
      .select("*")
      .eq("filename", "NonExistent.md")
      .single();

    expect(error).not.toBeNull();
    expect(data).toBeNull();
  });

  it("updates a memory file with versioning", async () => {
    // Get current state
    const { data: before } = await supabase
      .from("memory_files")
      .select("*")
      .eq("filename", "TestFile.md")
      .single();

    expect(before).toBeDefined();

    // Save version history
    await supabase.from("memory_file_versions").insert({
      memory_file_id: before!.id,
      content: before!.content,
      version: before!.version,
    });

    // Update
    const newVersion = before!.version + 1;
    const { data: updated, error } = await supabase
      .from("memory_files")
      .update({
        content: "# Test\n\nUpdated content.",
        version: newVersion,
        updated_at: new Date().toISOString(),
      })
      .eq("filename", "TestFile.md")
      .select()
      .single();

    expect(error).toBeNull();
    expect(updated!.version).toBe(newVersion);
    expect(updated!.content).toContain("Updated content");

    // Verify version history saved
    const { data: versions } = await supabase
      .from("memory_file_versions")
      .select("*")
      .eq("memory_file_id", before!.id);

    expect(versions).toBeDefined();
    expect(versions!.length).toBeGreaterThan(0);
    expect(versions![0].content).toContain("Original content");
  });
});
