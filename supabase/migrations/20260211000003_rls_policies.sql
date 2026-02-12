-- Enable Row Level Security on all tables
alter table memory_files enable row level security;
alter table memory_file_versions enable row level security;
alter table artifacts enable row level security;
alter table pending_memory_updates enable row level security;
alter table tasks enable row level security;

-- RLS policies: authenticated users can do everything
create policy "Authenticated users can select memory_files"
  on memory_files for select to authenticated using (true);
create policy "Authenticated users can insert memory_files"
  on memory_files for insert to authenticated with check (true);
create policy "Authenticated users can update memory_files"
  on memory_files for update to authenticated using (true);
create policy "Authenticated users can delete memory_files"
  on memory_files for delete to authenticated using (true);

create policy "Authenticated users can select memory_file_versions"
  on memory_file_versions for select to authenticated using (true);
create policy "Authenticated users can insert memory_file_versions"
  on memory_file_versions for insert to authenticated with check (true);
create policy "Authenticated users can update memory_file_versions"
  on memory_file_versions for update to authenticated using (true);
create policy "Authenticated users can delete memory_file_versions"
  on memory_file_versions for delete to authenticated using (true);

create policy "Authenticated users can select artifacts"
  on artifacts for select to authenticated using (true);
create policy "Authenticated users can insert artifacts"
  on artifacts for insert to authenticated with check (true);
create policy "Authenticated users can update artifacts"
  on artifacts for update to authenticated using (true);
create policy "Authenticated users can delete artifacts"
  on artifacts for delete to authenticated using (true);

create policy "Authenticated users can select pending_memory_updates"
  on pending_memory_updates for select to authenticated using (true);
create policy "Authenticated users can insert pending_memory_updates"
  on pending_memory_updates for insert to authenticated with check (true);
create policy "Authenticated users can update pending_memory_updates"
  on pending_memory_updates for update to authenticated using (true);
create policy "Authenticated users can delete pending_memory_updates"
  on pending_memory_updates for delete to authenticated using (true);

create policy "Authenticated users can select tasks"
  on tasks for select to authenticated using (true);
create policy "Authenticated users can insert tasks"
  on tasks for insert to authenticated with check (true);
create policy "Authenticated users can update tasks"
  on tasks for update to authenticated using (true);
create policy "Authenticated users can delete tasks"
  on tasks for delete to authenticated using (true);

-- Service role bypasses RLS, so the seed script and server-side operations still work
