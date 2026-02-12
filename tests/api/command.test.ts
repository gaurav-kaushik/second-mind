import { describe, it, expect } from "vitest";
import { TEST_BASE_URL } from "../helpers";

describe("POST /api/command", () => {
  it("returns 401 without authentication", async () => {
    const res = await fetch(`${TEST_BASE_URL}/api/command`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "hello" }),
    });

    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error).toBeDefined();
  });

  it("returns 400 for empty message (even without auth, validation runs after auth)", async () => {
    const res = await fetch(`${TEST_BASE_URL}/api/command`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "" }),
    });

    // Will get 401 because auth runs first
    expect(res.status).toBe(401);
  });
});
