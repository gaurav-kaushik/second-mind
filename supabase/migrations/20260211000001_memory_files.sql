-- Memory files: the briefing documents that form the system's understanding
create table memory_files (
  id uuid primary key default gen_random_uuid(),
  filename text unique not null,
  description text not null,
  content text not null,
  version integer default 1,
  updated_at timestamptz default now()
);

-- Version history for memory files
create table memory_file_versions (
  id uuid primary key default gen_random_uuid(),
  memory_file_id uuid references memory_files(id) on delete cascade,
  content text not null,
  version integer not null,
  created_at timestamptz default now()
);
