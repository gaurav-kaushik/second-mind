export type CommandIntent =
  | "question"
  | "store"
  | "task"
  | "search"
  | "status"
  | "memory_inspect";

export interface CommandRequest {
  message: string;
  history?: ChatMessage[];
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface CommandResponse {
  intent: CommandIntent;
  memoryFilesUsed: string[];
  response: string;
  status?: "not_implemented";
}

export interface RouterResult {
  intent: CommandIntent;
  memoryFilesNeeded: string[];
  actionDetails: Record<string, unknown>;
}

export interface MemoryFileListItem {
  id: string;
  filename: string;
  description: string;
  version: number;
  updated_at: string;
}

export interface SearchResult {
  id: string;
  type: string;
  title: string;
  snippet: string;
  source_url: string | null;
  score: number;
}
