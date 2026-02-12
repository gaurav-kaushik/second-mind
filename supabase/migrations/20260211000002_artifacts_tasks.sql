-- Enable pgvector extension
create extension if not exists vector;

-- Artifacts: the raw material (bookmarks, essays, ideas, etc.)
create table artifacts (
  id uuid primary key default gen_random_uuid(),
  type text not null,
  title text not null,
  content text,
  source_url text,
  user_note text,
  summary text,
  embedding vector(1536),
  tags text[] default '{}',
  memory_refs text[] default '{}',
  status text default 'unprocessed',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Pending memory updates: proposals for the user to approve
create table pending_memory_updates (
  id uuid primary key default gen_random_uuid(),
  memory_file_id uuid references memory_files(id) on delete cascade,
  proposed_diff text not null,
  reasoning text not null,
  source_artifact_id uuid references artifacts(id) on delete set null,
  status text default 'pending',
  created_at timestamptz default now()
);

-- Async tasks
create table tasks (
  id uuid primary key default gen_random_uuid(),
  command text not null,
  status text default 'queued',
  result text,
  artifact_id uuid references artifacts(id) on delete set null,
  memory_files_used text[] default '{}',
  created_at timestamptz default now(),
  completed_at timestamptz
);

-- Indexes
-- Note: ivfflat requires data to build the index properly;
-- for empty tables, we create the index but it will rebuild on first use
create index artifacts_embedding_idx on artifacts using ivfflat (embedding vector_cosine_ops) with (lists = 100);
create index artifacts_fts_idx on artifacts using gin (to_tsvector('english', coalesce(title, '') || ' ' || coalesce(content, '') || ' ' || coalesce(summary, '')));
create index pending_memory_updates_status_idx on pending_memory_updates (status) where status = 'pending';
create index tasks_status_idx on tasks (status) where status in ('queued', 'running');
