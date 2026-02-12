import Anthropic from "@anthropic-ai/sdk";
import type { RouterResult, CommandIntent } from "@/types/api";

const VALID_INTENTS: CommandIntent[] = [
  "question",
  "store",
  "task",
  "search",
  "status",
  "memory_inspect",
];

interface ManifestEntry {
  filename: string;
  description: string;
}

function buildSystemPrompt(manifest: ManifestEntry[]): string {
  const fileList = manifest
    .map((f) => `- ${f.filename}: ${f.description}`)
    .join("\n");

  return `You are a command router for a personal intelligence system called Second Mind. Your job is to analyze the user's input and determine:
1. The intent (what they want to do)
2. Which memory files are needed to fulfill the request

Available intents:
- "question": The user is asking a question that requires context from memory files to answer well.
- "store": The user wants to save something (an idea, note, bookmark, essay concept).
- "task": The user wants to plan or execute something that requires multiple steps (trip planning, research).
- "search": The user wants to find something they previously saved or bookmarked.
- "status": The user wants to check on ongoing tasks or system status.
- "memory_inspect": The user wants to view or edit their memory files directly.

Available memory files:
${fileList}

Rules:
- For "question" and "task" intents, ALWAYS include Gaurav.md in memoryFilesNeeded.
- Select only the memory files that are relevant to the request.
- For "store" intent, include the memory file(s) where the stored content would be referenced.
- For "memory_inspect" intent, memoryFilesNeeded can be empty. If the user mentions a specific file by name (e.g. "Show me Gaurav.md", "Open my reading notes"), include {"targetFile": "Filename.md"} in actionDetails matching the closest memory file name.
- For "status" intent, memoryFilesNeeded can be empty.
- For "search" intent, include memory files that might provide context for ranking results.

Respond with ONLY a JSON object in this exact format (no markdown, no code fences):
{"intent": "question", "memoryFilesNeeded": ["Gaurav.md", "Reading.md"], "actionDetails": {}}`;
}

function getDefaultResult(manifest: ManifestEntry[]): RouterResult {
  return {
    intent: "question",
    memoryFilesNeeded: manifest.map((f) => f.filename),
    actionDetails: {},
  };
}

function parseRouterResponse(text: string): RouterResult | null {
  try {
    // Try to extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    const parsed = JSON.parse(jsonMatch[0]);

    if (
      !parsed.intent ||
      !VALID_INTENTS.includes(parsed.intent) ||
      !Array.isArray(parsed.memoryFilesNeeded)
    ) {
      return null;
    }

    return {
      intent: parsed.intent as CommandIntent,
      memoryFilesNeeded: parsed.memoryFilesNeeded,
      actionDetails: parsed.actionDetails || {},
    };
  } catch {
    return null;
  }
}

export async function routeCommand(
  input: string,
  manifest: ManifestEntry[]
): Promise<RouterResult> {
  const model = process.env.ROUTER_MODEL || "claude-haiku-4-5-20251001";

  try {
    const client = new Anthropic();
    const systemPrompt = buildSystemPrompt(manifest);

    const response = await client.messages.create({
      model,
      max_tokens: 256,
      system: systemPrompt,
      messages: [{ role: "user", content: input }],
    });

    const text =
      response.content[0].type === "text" ? response.content[0].text : "";
    const result = parseRouterResponse(text);

    if (result) return result;

    // Retry once on malformed response
    const retryResponse = await client.messages.create({
      model,
      max_tokens: 256,
      system:
        systemPrompt +
        "\n\nIMPORTANT: You must respond with ONLY valid JSON. No other text.",
      messages: [{ role: "user", content: input }],
    });

    const retryText =
      retryResponse.content[0].type === "text"
        ? retryResponse.content[0].text
        : "";
    const retryResult = parseRouterResponse(retryText);

    if (retryResult) return retryResult;

    // Fall back to defaults
    console.error("Router returned malformed JSON after retry, using defaults");
    return getDefaultResult(manifest);
  } catch (err) {
    console.error(
      "Router API error:",
      err instanceof Error ? err.message : err
    );
    return getDefaultResult(manifest);
  }
}
