import { describe, it, expect } from "vitest";
import { getTestClient } from "../helpers";

describe("Question handler prerequisites", () => {
  const supabase = getTestClient();

  it("can load memory files from database", async () => {
    const { data, error } = await supabase
      .from("memory_files")
      .select("filename, content")
      .in("filename", ["Gaurav.md", "Reading.md"]);

    expect(error).toBeNull();
    expect(data).toBeDefined();
    // Should have files if seeded
    if (data && data.length > 0) {
      expect(data[0].content).toBeTruthy();
      expect(data[0].filename).toMatch(/\.md$/);
    }
  });

  it("memory files have non-empty content", async () => {
    const { data } = await supabase
      .from("memory_files")
      .select("filename, content");

    if (data) {
      for (const file of data) {
        expect(file.content.length).toBeGreaterThan(0);
      }
    }
  });
});
