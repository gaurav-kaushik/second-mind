import Anthropic from "@anthropic-ai/sdk";
import { createServerClient } from "@/lib/supabase/server";
import type { ChatMessage } from "@/types/api";

function buildSystemPrompt(memoryContents: { filename: string; content: string }[]): string {
  const memorySection = memoryContents
    .map((f) => `--- ${f.filename} ---\n${f.content}`)
    .join("\n\n");

  return `You are Second Mind, a personal intelligence system for Gaurav. You maintain a deep understanding of Gaurav — his preferences, context, taste, history, plans, and ideas — and use that understanding to respond to terse, high-intent messages without requiring paragraphs of context-setting.

Below are the relevant memory files that contain context about Gaurav. Use this context naturally in your responses without explicitly referencing the files themselves. Respond as if you already know this information — because you do.

${memorySection}

Guidelines:
- Be concise and direct. Gaurav prefers fewer words, not more.
- Format responses in markdown when it improves readability.
- When making recommendations, explain your reasoning briefly.
- Draw connections between different pieces of context when relevant.
- If you don't have enough context to answer well, say so honestly.`;
}

export async function handleQuestion(
  message: string,
  memoryFiles: string[],
  history?: ChatMessage[]
): Promise<string> {
  const model = process.env.GENERATION_MODEL || "claude-sonnet-4-5-20250929";

  try {
    const supabase = await createServerClient();

    // Fetch the content of requested memory files
    const { data: files, error } = await supabase
      .from("memory_files")
      .select("filename, content")
      .in("filename", memoryFiles);

    if (error) {
      console.error("Failed to load memory files:", error.message);
      return "I'm having trouble accessing my memory right now. Please try again.";
    }

    const memoryContents = files || [];
    const systemPrompt = buildSystemPrompt(memoryContents);

    // Build messages array with optional history
    const messages: Anthropic.MessageParam[] = [];

    if (history && history.length > 0) {
      for (const msg of history) {
        messages.push({
          role: msg.role,
          content: msg.content,
        });
      }
    }

    messages.push({ role: "user", content: message });

    const client = new Anthropic();

    // 30-second timeout to prevent infinite "Thinking..." state
    const API_TIMEOUT_MS = 30_000;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

    try {
      const response = await client.messages.create(
        {
          model,
          max_tokens: 2048,
          system: systemPrompt,
          messages,
        },
        { signal: controller.signal }
      );

      clearTimeout(timeoutId);

      const text =
        response.content[0].type === "text" ? response.content[0].text : "";

      return text || "I wasn't able to generate a response. Please try again.";
    } catch (innerErr) {
      clearTimeout(timeoutId);

      // Check for timeout abort
      if (
        innerErr instanceof Error &&
        (innerErr.name === "AbortError" || innerErr.message.includes("abort"))
      ) {
        return "The request took too long. Please try again with a shorter question.";
      }
      throw innerErr; // Re-throw to be caught by outer catch
    }
  } catch (err) {
    console.error(
      "Question handler error:",
      err instanceof Error ? err.message : err
    );
    return "Something went wrong while processing your question. Please try again.";
  }
}
