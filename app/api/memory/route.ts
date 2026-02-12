import { createServerClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createServerClient();

    const { data, error } = await supabase
      .from("memory_files")
      .select("id, filename, description, version, updated_at")
      .order("filename");

    if (error) {
      console.error("GET /api/memory error:", error.message);
      return NextResponse.json({ error: "Failed to fetch memory files" }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("GET /api/memory error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
