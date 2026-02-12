export interface MemoryFile {
  id: string;
  filename: string;
  description: string;
  content: string;
  version: number;
  updated_at: string;
}

export interface MemoryFileVersion {
  id: string;
  memory_file_id: string;
  content: string;
  version: number;
  created_at: string;
}

export type ArtifactType =
  | "bookmark"
  | "essay_draft"
  | "story_idea"
  | "book_index"
  | "highlight_collection"
  | "substack_digest"
  | "voice_memo"
  | "note"
  | "image";

export type ArtifactStatus = "unprocessed" | "processed" | "archived";

export interface Artifact {
  id: string;
  type: ArtifactType;
  title: string;
  content: string | null;
  source_url: string | null;
  user_note: string | null;
  summary: string | null;
  embedding: number[] | null;
  tags: string[];
  memory_refs: string[];
  status: ArtifactStatus;
  created_at: string;
  updated_at: string;
}

export type UpdateStatus = "pending" | "approved" | "rejected";

export interface PendingMemoryUpdate {
  id: string;
  memory_file_id: string;
  proposed_diff: string;
  reasoning: string;
  source_artifact_id: string | null;
  status: UpdateStatus;
  created_at: string;
}

export type TaskStatus = "queued" | "running" | "completed" | "failed";

export interface Task {
  id: string;
  command: string;
  status: TaskStatus;
  result: string | null;
  artifact_id: string | null;
  memory_files_used: string[];
  created_at: string;
  completed_at: string | null;
}
