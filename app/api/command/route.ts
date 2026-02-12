import { createServerClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth";
import { routeCommand } from "@/lib/router";
import { handleQuestion } from "@/lib/handlers/question";
import { NextRequest, NextResponse } from "next/server";
import type { CommandResponse } from "@/types/api";

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth();
    if (!auth.authenticated) return auth.response;

    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    if (!body.message || typeof body.message !== "string" || body.message.trim() === "") {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    const message = body.message.trim();
    const history = Array.isArray(body.history) ? body.history : undefined;

    const supabase = await createServerClient();

    // Fetch memory file manifest
    const { data: manifest, error: manifestError } = await supabase
      .from("memory_files")
      .select("filename, description");

    if (manifestError || !manifest) {
      console.error("Failed to fetch manifest:", manifestError?.message);
      return NextResponse.json(
        { error: "Service temporarily unavailable" },
        { status: 503 }
      );
    }

    // Route the command
    const routerResult = await routeCommand(message, manifest);

    // Handle based on intent
    if (routerResult.intent === "question") {
      const response = await handleQuestion(
        message,
        routerResult.memoryFilesNeeded,
        history
      );

      const result: CommandResponse = {
        intent: "question",
        memoryFilesUsed: routerResult.memoryFilesNeeded,
        response,
      };

      return NextResponse.json(result);
    }

    // Other intents: not yet implemented
    const result: CommandResponse = {
      intent: routerResult.intent,
      memoryFilesUsed: routerResult.memoryFilesNeeded,
      response: "This capability is coming soon.",
      status: "not_implemented",
    };

    return NextResponse.json(result);
  } catch (err) {
    console.error("POST /api/command error:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
