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

    // Short-circuit memory_inspect — no need to call Sonnet
    if (routerResult.intent === "memory_inspect") {
      return NextResponse.json({
        intent: "memory_inspect",
        memoryFilesUsed: [],
        response: "",
        actionDetails: routerResult.actionDetails,
      } satisfies CommandResponse);
    }

    // Short-circuit unimplemented intents — be honest instead of hallucinating
    const UNIMPLEMENTED_MESSAGES: Record<string, string> = {
      store:
        "Saving artifacts is coming soon. For now, you can store this in one of your memory files via the Memory Inspector (/memory).",
      task: "Task planning and execution is coming soon. For now, I can help you think through tasks as a conversation.",
      search:
        "Search is coming soon. I can answer questions using your memory files — try asking me directly.",
      status:
        "The status dashboard is coming soon. Ask me anything and I'll do my best to help.",
    };

    if (routerResult.intent in UNIMPLEMENTED_MESSAGES) {
      return NextResponse.json({
        intent: routerResult.intent,
        memoryFilesUsed: [],
        response:
          UNIMPLEMENTED_MESSAGES[
            routerResult.intent as keyof typeof UNIMPLEMENTED_MESSAGES
          ],
        status: "not_implemented",
      } satisfies CommandResponse);
    }

    // Handle question intent — load memory files and generate response
    const response = await handleQuestion(
      message,
      routerResult.memoryFilesNeeded,
      history
    );

    const result: CommandResponse = {
      intent: routerResult.intent,
      memoryFilesUsed: routerResult.memoryFilesNeeded,
      response,
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
