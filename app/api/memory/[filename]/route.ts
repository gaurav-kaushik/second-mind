import { createServerClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const auth = await requireAuth();
    if (!auth.authenticated) return auth.response;

    const { filename } = await params;
    const supabase = await createServerClient();

    const { data, error } = await supabase
      .from("memory_files")
      .select("*")
      .eq("filename", filename)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: "Memory file not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("GET /api/memory/[filename] error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const auth = await requireAuth();
    if (!auth.authenticated) return auth.response;

    const { filename } = await params;
    const body = await request.json();

    if (!body.content || typeof body.content !== "string" || body.content.trim() === "") {
      return NextResponse.json(
        { error: "Content is required and must be a non-empty string" },
        { status: 400 }
      );
    }

    const supabase = await createServerClient();

    // Fetch the current file
    const { data: current, error: fetchError } = await supabase
      .from("memory_files")
      .select("*")
      .eq("filename", filename)
      .single();

    if (fetchError || !current) {
      return NextResponse.json(
        { error: "Memory file not found" },
        { status: 404 }
      );
    }

    // Save current version to history
    const { error: versionError } = await supabase
      .from("memory_file_versions")
      .insert({
        memory_file_id: current.id,
        content: current.content,
        version: current.version,
      });

    if (versionError) {
      console.error("Failed to save version history:", versionError.message);
      return NextResponse.json(
        { error: "Failed to save version history" },
        { status: 500 }
      );
    }

    // Update the memory file
    const newVersion = current.version + 1;
    const { data: updated, error: updateError } = await supabase
      .from("memory_files")
      .update({
        content: body.content,
        version: newVersion,
        updated_at: new Date().toISOString(),
      })
      .eq("filename", filename)
      .select()
      .single();

    if (updateError || !updated) {
      console.error("Failed to update memory file:", updateError?.message);
      return NextResponse.json(
        { error: "Failed to update memory file" },
        { status: 500 }
      );
    }

    return NextResponse.json(updated);
  } catch (err) {
    console.error("PATCH /api/memory/[filename] error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
