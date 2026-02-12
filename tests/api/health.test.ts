import { describe, it, expect } from "vitest";
import { TEST_BASE_URL } from "../helpers";

describe("GET /api/health", () => {
  it("returns ok when Supabase is running", async () => {
    const res = await fetch(`${TEST_BASE_URL}/api/health`);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.status).toBe("ok");
    expect(data.db).toBe(true);
  });
});
