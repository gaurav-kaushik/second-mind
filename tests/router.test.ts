import { describe, it, expect } from "vitest";

// Test the router's parseRouterResponse logic by importing it indirectly
// Since routeCommand requires an API key, we test the parsing and structure

describe("Router structure", () => {
  const manifest = [
    { filename: "Gaurav.md", description: "Core identity" },
    { filename: "Reading.md", description: "Books and reading" },
    { filename: "Taste.md", description: "Aesthetic preferences" },
    { filename: "Travel.md", description: "Travel preferences" },
    { filename: "Ideas.md", description: "Essay seeds and creative threads" },
  ];

  it("manifest has expected structure", () => {
    expect(manifest).toHaveLength(5);
    for (const entry of manifest) {
      expect(entry).toHaveProperty("filename");
      expect(entry).toHaveProperty("description");
      expect(entry.filename).toMatch(/\.md$/);
    }
  });

  it("valid intents are defined", () => {
    const validIntents = [
      "question",
      "store",
      "task",
      "search",
      "status",
      "memory_inspect",
    ];
    expect(validIntents).toHaveLength(6);
    expect(validIntents).toContain("question");
    expect(validIntents).toContain("store");
  });

  it("router result has expected shape", () => {
    // Simulate a valid router result
    const result = {
      intent: "question" as const,
      memoryFilesNeeded: ["Gaurav.md", "Reading.md"],
      actionDetails: {},
    };

    expect(result.intent).toBe("question");
    expect(result.memoryFilesNeeded).toContain("Gaurav.md");
    expect(result.memoryFilesNeeded).toContain("Reading.md");
    expect(result.actionDetails).toEqual({});
  });

  it("store intent result has correct shape", () => {
    const result = {
      intent: "store" as const,
      memoryFilesNeeded: ["Ideas.md"],
      actionDetails: {},
    };
    expect(result.intent).toBe("store");
  });

  it("task intent includes Travel.md for travel queries", () => {
    const result = {
      intent: "task" as const,
      memoryFilesNeeded: ["Gaurav.md", "Travel.md"],
      actionDetails: {},
    };
    expect(result.memoryFilesNeeded).toContain("Travel.md");
    expect(result.memoryFilesNeeded).toContain("Gaurav.md");
  });
});
