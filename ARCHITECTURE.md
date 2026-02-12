# Architecture

## Three-Layer Model

Second Mind is organized into three layers:

### 1. Memory Layer
Markdown briefing documents stored in the `memory_files` table. These are the system's understanding of the user — preferences, context, taste, history. The router selects which files to load for each request.

**Tables:** `memory_files`, `memory_file_versions`

### 2. Artifact Layer
External content ingested into the system — bookmarks, notes, links. Artifacts are stored with optional embeddings for semantic search.

**Tables:** `artifacts`, `pending_memory_updates`, `tasks`

### 3. Interaction Layer
The command bar UI and API endpoints that tie everything together. User input flows through a router that determines intent, then to the appropriate handler.

## Request Flow

```
User Input
    │
    ▼
POST /api/command
    │
    ├── Fetch memory file manifest (filenames + descriptions)
    │
    ▼
routeCommand() — Claude Haiku
    │
    ├── Classifies intent: question | store | task | search | memory_inspect
    ├── Selects relevant memory files
    │
    ▼
Handler dispatch
    │
    ├── question → handleQuestion() — Claude Sonnet with memory context
    ├── store → (not yet implemented)
    ├── task → (not yet implemented)
    ├── search → (not yet implemented)
    └── memory_inspect → (handled client-side)
    │
    ▼
Response (markdown text)
```

## Tech Stack

| Component | Technology | Rationale |
|---|---|---|
| Framework | Next.js 16 (App Router) | SSR, API routes, React 19 |
| Styling | Tailwind CSS v4 | CSS-based config, utility classes |
| Database | Supabase (Postgres + pgvector) | Auth, RLS, vector search, real-time |
| LLM (routing) | Claude Haiku | Fast, cheap intent classification |
| LLM (generation) | Claude Sonnet | High-quality contextual responses |
| Auth | Supabase Auth | Email/password, session cookies |
| Markdown | react-markdown | Lightweight response rendering |
| Testing | Vitest + Playwright | Unit/integration + E2E |

## Data Model

### memory_files
Core briefing documents. Each has a unique filename (e.g., `Gaurav.md`), description, markdown content, and version number.

### memory_file_versions
Append-only version history. Every edit to a memory file saves the old content here before updating.

### artifacts
External content (bookmarks, notes). Has title, content, optional embedding (vector(1536)), tags, and memory file references.

### pending_memory_updates
Proposed changes to memory files from artifact processing. Status: pending → approved/rejected.

### tasks
Background task queue for long-running operations. Status: queued → running → completed/failed.

## Key Files

| File | Purpose |
|---|---|
| `lib/router.ts` | LLM-based intent classification. Calls Claude Haiku with the memory manifest to determine what the user wants and which files to load. |
| `lib/handlers/question.ts` | Memory-informed generation. Loads selected memory files, constructs a system prompt with their content, calls Claude Sonnet. |
| `lib/auth.ts` | Reusable authentication check. Verifies Supabase session from cookies, returns user ID or 401. |
| `lib/supabase/server.ts` | Server-side Supabase client using service role key. Bypasses RLS for internal operations. |
| `middleware.ts` | Session refresh on every request. Redirects unauthenticated users to /login. |
| `components/CommandBar.tsx` | Primary desktop interaction surface. Modal overlay triggered by ⌘K. Multi-turn conversation with history. |
| `components/MobileCommandBar.tsx` | Mobile interaction surface. Persistent bottom input bar with scrollable messages above. |
| `components/MemoryInspector.tsx` | List/read/edit views for memory files. Workshop mode with denser UI. |
| `app/api/command/route.ts` | Main API endpoint. Wires router to handlers. Single entry point for all user interactions. |

## Design Principles

- **Paper feel:** Warm palette (#faf8f5 background), generous whitespace, settle animations
- **Command bar is everything:** No sidebar, no navigation pages. All interactions through ⌘K (desktop) or persistent input (mobile)
- **Two modes:** "Reading room" (calm, minimal) for conversations; "Workshop" (dense, monospace) for memory inspection
- **Single user:** All design decisions optimize for one person's workflow
