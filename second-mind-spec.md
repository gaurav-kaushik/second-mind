# Second Mind

**Author:** Gaurav (with Claude as Principal PM)
**Version:** 0.1 -- Foundation Spec
**Date:** February 2026

---

## 1. What This Is

Second Mind is a personal intelligence system. It maintains a structured understanding of its owner -- preferences, context, taste, history, plans, ideas -- and uses that understanding to respond to terse, high-intent commands without requiring paragraphs of context-setting.

The core value proposition: **every interaction gets smarter because the system already knows you.**

This is not a note-taking app. It is not a chatbot wrapper. It is a context management system with a conversational interface on top.

### Who It's For

One person: Gaurav. Every design decision optimizes for a single user's workflow. There is no onboarding flow, no multi-tenancy, no feature gating. If a design choice makes Gaurav's life easier but would be terrible at scale, we take it.

---

## 2. Architecture: Three Layers

### 2.1 The Memory Layer

The system's understanding of Gaurav lives in 10-20 markdown files. These are not notes. They are **briefing documents** -- the context the system reads before responding to any request.

**Core files (always loaded):**

- `Gaurav.md` -- identity, family, work context, calendar constraints, communication preferences. The spine.

**Domain files (loaded selectively based on the request):**

- `Taste.md` -- favorite books, films, music, art, design sensibility, aesthetic preferences
- `Travel.md` -- favorite destinations, hotel preferences, airline preferences, past trips, bucket list
- `Reading.md` -- books read (with ratings/notes), current reading list, Substacks followed, reading patterns
- `Ideas.md` -- essay seeds, story concepts, half-formed thoughts, creative threads to pull on
- `Essays.md` -- index of published and in-progress essays, themes, Substack metadata
- `Food.md` -- restaurants loved, cuisines, dietary preferences, cooking interests
- `People.md` -- key relationships, gift ideas, important dates
- `Work.md` -- current projects, team context, strategic priorities (separate from Gaurav.md core identity)
- `Health.md` -- fitness goals, routines, preferences
- `Places.md` -- neighborhoods, cities, venues that matter, with notes on why

**Design principles for memory files:**

- Human-readable and directly editable. Gaurav can open any file and tweak it.
- The system proposes updates; Gaurav approves them. Never silent writes.
- Each file has a clear scope. If a piece of context could go in two files, prefer the more specific one.
- Files should be concise. These are not journals. They are structured reference material optimized for an LLM to consume quickly. Think "staff briefing," not "diary."

**Context routing:** When a request comes in, the system determines which memory files are relevant and loads them into the prompt context alongside `Gaurav.md`. A request like "plan a trip to Spain" loads `Gaurav.md` + `Travel.md` + `Food.md` + `People.md` (for family schedule constraints). A request like "what should I read next" loads `Gaurav.md` + `Reading.md` + `Taste.md`.

The routing logic should be an LLM call itself: given the user's input and a manifest of available memory files (filename + one-line description), select which to include.

### 2.2 The Artifact Store

Artifacts are the raw material: essay drafts, story ideas, bookmarked articles, book indexes, Kindle highlights, digested Substacks, saved images, voice memos transcribed to text.

Artifacts live in a database (Supabase/Postgres), not in the memory files. The relationship between artifacts and memory is one-directional: **summaries and metadata from artifacts flow up into memory files, but the artifacts themselves are retrievable separately.**

**Artifact schema (core fields):**

```
id              uuid (pk)
type            enum: bookmark, essay_draft, story_idea, book_index,
                highlight_collection, substack_digest, voice_memo, note, image
title           text
content         text (full content or extracted text)
source_url      text (nullable)
user_note       text (nullable -- annotation at save time, e.g., "use for vacation planning")
summary         text (LLM-generated summary for search and context)
embedding       vector(1536) (for semantic search)
tags            text[] (auto-generated, not user-managed)
memory_refs     text[] (which .md files this artifact has been summarized into)
created_at      timestamp
updated_at      timestamp
status          enum: unprocessed, processed, archived
```

**Artifact lifecycle:**

1. Content enters the system (bookmark, voice memo, upload, manual input)
2. System extracts/processes content, generates summary and embedding
3. System proposes which memory file(s) should be updated with a reference or summary
4. Gaurav approves the memory update
5. Artifact is searchable and retrievable independently

### 2.3 The Interaction Layer

The primary interface is a **Cmd+K command bar**. It is always available. It accepts text input and voice dictation. It is the single entry point for everything: asking questions, storing things, issuing commands, searching.

**Input types the command bar handles:**

| Input pattern | Example | System behavior |
|---|---|---|
| Question | "What should I read next?" | Route to memory, generate response |
| Store command | "Essay idea: the relationship between gardening and software" | Create artifact, propose memory update |
| Task command | "Plan a trip to Spain for spring break" | Load relevant context, generate async task, notify when done |
| Search | "That article about grief I bookmarked" | Semantic search across artifacts |
| Voice memo | [dictated audio] "Story idea: a librarian who..." | Transcribe, create artifact, route to Ideas.md |
| Bookmark (via extension) | URL + optional note | Save artifact, process content, propose memory update |
| Status check | "Show me ongoing tasks" | Display task queue |
| Memory inspection | "What do you know about my travel preferences?" | Surface relevant memory file content |

**Response behavior:**

- Quick answers render inline beneath the command bar (book recommendation, search result, simple factual response).
- Longer outputs (trip plan, essay outline, digest) expand into a full content view.
- Tasks that require time (web research, multi-step planning) run asynchronously. The system shows a brief acknowledgment ("On it -- I'll have your Spain trip plan ready shortly") and notifies when complete.
- The command bar is never blocked. You can issue new commands while tasks are running.

**The Daily Digest:**

A push notification (morning, configurable) that surfaces:

- 3-5 links from bookmarked/saved articles, selected for relevance to current interests and reading patterns
- A short poem or quote (sourced from highlighted passages or curated collections)
- Optional: a nudge related to an ongoing task or upcoming event

The digest is a reading experience, not a dashboard. It should feel like opening a curated newsletter, not checking a to-do list. Design it to keep Gaurav off TikTok.

The digest evolves over time. Early versions ship simple, and the format gets refined based on what actually gets read and engaged with.

---

## 3. Input Sources and Ingestion

### 3.1 Browser Extension

A lightweight Chrome/Safari extension. Click the extension icon on any page to save it.

**Flow:**

1. Click extension icon (or keyboard shortcut)
2. A small popover appears with: page title (editable), a text field for an optional note ("use for vacation planning," "gift idea for wife," "cute design")
3. Hit Enter or click Save
4. Extension sends URL + title + note to the Second Mind API
5. Backend asynchronously: fetches page content, extracts text, generates summary and embedding, creates artifact, proposes memory file update if the note suggests routing

**The extension replaces Raindrop.** Second Mind becomes the single destination for all bookmarks.

### 3.2 Voice Input

Voice dictation is available in the command bar (phone and desktop). Speech-to-text transcription happens client-side or via Whisper API.

**Key behavior:** The system should detect intent from voice input. "Essay idea: [content]" creates an artifact and routes to Ideas.md or Essays.md. "Remind me to [thing]" creates a task. "What was that article about [topic]" triggers a search. Natural language, no special syntax required.

### 3.3 File Upload

Drag-and-drop or file picker in the main interface. Supported types:

- **PDF** (Kindle highlights export, book scans, documents) -- extract text, create artifact
- **Images** (photos of book pages/highlights) -- OCR, extract text, create artifact
- **Markdown/text files** -- direct import as artifacts
- **Book index files** (from Gaurav's custom tool) -- import and enrich

### 3.4 Manual Input

The command bar itself. Typing "essay idea: ..." or "note: ..." or any freeform text that the system recognizes as something to store rather than a question to answer.

---

## 4. Key Workflows

### 4.1 "Recommend my next book"

1. System loads `Gaurav.md` + `Reading.md` + `Taste.md`
2. Considers: books read recently, ratings, patterns (does Gaurav tend to alternate fiction/nonfiction?), books on the reading list, current mood/interests reflected in recent interactions
3. Returns 1-3 recommendations with reasoning: why this book, why now, what it connects to

### 4.2 "Plan a trip to Spain for spring break"

1. System loads `Gaurav.md` (family, kids' ages) + `Travel.md` (preferences, past trips) + `Food.md` (restaurant taste) + `People.md` (family schedule)
2. System checks: when is spring break? (from Gaurav.md or calendar integration) What season is that for Spain? What regions match the family's travel style?
3. Runs async: web search for hotels matching preferences, restaurants worth booking, logistics
4. Delivers a structured plan: itinerary by day, hotel recommendations with links, restaurant shortlist, packing/logistics notes
5. The plan is stored as an artifact and the key decisions are summarized into Travel.md

### 4.3 "Essay idea: the relationship between gardening and software"

1. System creates an artifact (type: story_idea or essay_draft) with the raw idea
2. Optionally enriches: searches existing artifacts and memory for related themes explored before, surfaces connections
3. Proposes an update to Essays.md or Ideas.md: "Added 'Gardening and Software' to essay ideas. Connects to your Gardener's Paradox themes and notes on AI orchestration."
4. Gaurav approves the memory update

### 4.4 "Find me something to read about grief"

1. Semantic search across all artifacts (bookmarks, highlights, saved articles)
2. Also searches memory files for related context (books about grief read before? highlighted passages?)
3. Returns results ranked by relevance, with snippets and source links
4. If nothing in the artifact store matches well, offers to do a web search for new material

### 4.5 Bookmarking via Extension

1. Gaurav is reading an article about boutique hotels in the Basque Country
2. Clicks extension, adds note: "use for Spain trip planning"
3. System saves article, extracts content, generates summary
4. Proposes update to Travel.md: "Added Basque Country hotel article to travel research. Key recommendations: [summary]."
5. When Gaurav later says "plan a trip to Spain," this article is already in context

---

## 5. UX Design Principles

### 5.1 Fewer Words Per Prompt

The entire system exists so that Gaurav can type less. "Plan Spain" should work as well as "Plan a trip to Spain for my family during spring break considering my hotel preferences and the kids' school schedule." The system fills in the rest.

### 5.2 Paper Feel

The interface should feel like reading on paper. This means:

- Generous whitespace and typography that prioritizes readability
- Warm, muted color palette. No bright blues or neon accents.
- Subtle animations: content should appear to settle onto the page, not snap into place. Think of a card being laid down on a table.
- Transitions should feel physical: slides, fades, gentle easing. Nothing should feel "digital" or "app-like."
- The daily digest especially should feel like a broadsheet or a literary magazine, not a notification center.

### 5.3 Tactile Interactions

- Approving a memory update should feel like stamping something -- a satisfying micro-interaction
- Saving a bookmark should have a subtle "collected" animation
- Task completion notifications should feel like a gentle tap on the shoulder, not an alert

### 5.4 Information Density When Needed

The default is minimal and calm. But when Gaurav asks to see all ongoing tasks, or browse artifacts, or inspect a memory file, the interface should shift to a denser, more utilitarian mode. Think of it as two modes: "reading room" (default) and "workshop" (on demand).

### 5.5 The Command Bar is Everything

Cmd+K (desktop) or a persistent input area (mobile) is the single surface. No sidebar navigation, no hamburger menus, no settings pages to find features. If you can't do it from the command bar, it shouldn't exist. The only exception is the daily digest, which is a push experience.

Views that can be summoned from the command bar: task list, artifact browser, memory file inspector, search results, digest history. These are views, not pages. They appear and disappear. The command bar is always present.

---

## 6. Technical Architecture

### 6.1 Stack

| Component | Technology | Notes |
|---|---|---|
| Frontend (web) | Next.js + React | Desktop and mobile responsive. PWA for mobile. |
| Frontend (extension) | Chrome Extension (Manifest V3) | Minimal UI. Save + note field. |
| Backend API | Next.js API routes | Handles all business logic |
| Database | Supabase (Postgres + pgvector) | Artifacts, metadata, embeddings, task queue |
| Memory files | Stored in Supabase `memory_files` table | Content is markdown text. Versioned. |
| LLM | Anthropic Claude API | Sonnet for routing, Opus for generation |
| Speech-to-text | Whisper API or browser Web Speech API | Voice dictation |
| Search | pgvector + Postgres full-text search | Hybrid: vector similarity + keyword matching |
| File processing | Server-side: PDF extraction, OCR (Tesseract) | Runs async on upload |
| Auth | Supabase Auth | Single user, but proper auth. Keeps API secure. |
| Hosting | Vercel (frontend) + Supabase (backend/db) | Simple, managed, low-ops |

### 6.2 Data Model

```sql
-- Memory files: the briefing documents
create table memory_files (
  id uuid primary key default gen_random_uuid(),
  filename text unique not null,        -- e.g., "Gaurav.md", "Travel.md"
  description text not null,            -- one-line summary for context routing
  content text not null,                -- the markdown content
  version integer default 1,
  updated_at timestamptz default now()
);

-- Version history for memory files
create table memory_file_versions (
  id uuid primary key default gen_random_uuid(),
  memory_file_id uuid references memory_files(id),
  content text not null,
  version integer not null,
  created_at timestamptz default now()
);

-- Artifacts: the raw material
create table artifacts (
  id uuid primary key default gen_random_uuid(),
  type text not null,                   -- bookmark, essay_draft, story_idea, etc.
  title text not null,
  content text,                         -- full content or extracted text
  source_url text,
  user_note text,                       -- annotation at save time
  summary text,                         -- LLM-generated
  embedding vector(1536),               -- for semantic search
  tags text[] default '{}',             -- auto-generated
  memory_refs text[] default '{}',      -- which .md files reference this
  status text default 'unprocessed',    -- unprocessed, processed, archived
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Pending memory updates: proposals for Gaurav to approve
create table pending_memory_updates (
  id uuid primary key default gen_random_uuid(),
  memory_file_id uuid references memory_files(id),
  proposed_diff text not null,          -- what to add/change
  reasoning text not null,              -- why the system proposes this
  source_artifact_id uuid references artifacts(id),
  status text default 'pending',        -- pending, approved, rejected
  created_at timestamptz default now()
);

-- Async tasks
create table tasks (
  id uuid primary key default gen_random_uuid(),
  command text not null,                -- the original user input
  status text default 'queued',         -- queued, running, completed, failed
  result text,                          -- the generated output
  artifact_id uuid references artifacts(id),
  memory_files_used text[] default '{}',
  created_at timestamptz default now(),
  completed_at timestamptz
);

-- Indexes
create index on artifacts using ivfflat (embedding vector_cosine_ops) with (lists = 100);
create index on artifacts using gin (to_tsvector('english', coalesce(title, '') || ' ' || coalesce(content, '') || ' ' || coalesce(summary, '')));
create index on pending_memory_updates (status) where status = 'pending';
create index on tasks (status) where status in ('queued', 'running');
```

### 6.3 API Routes

```
POST   /api/command              -- Main entry point. Text in, routed response out.
POST   /api/bookmark             -- Browser extension. URL + note in.
POST   /api/upload               -- File upload. PDF, image, markdown.
GET    /api/search?q=            -- Semantic + full-text search across artifacts.
GET    /api/memory               -- List all memory files with descriptions.
GET    /api/memory/:filename     -- Get a specific memory file.
PATCH  /api/memory/:filename     -- Direct edit to a memory file.
GET    /api/pending-updates      -- List pending memory update proposals.
POST   /api/pending-updates/:id/approve
POST   /api/pending-updates/:id/reject
GET    /api/tasks                -- List tasks with status.
GET    /api/tasks/:id            -- Task detail and result.
GET    /api/artifacts            -- List/filter artifacts.
GET    /api/artifacts/:id        -- Full artifact.
GET    /api/digest               -- Generate or retrieve today's digest.
```

### 6.4 The Command Router

The `/api/command` endpoint is the brain. It receives free-text input and decides what to do.

**Routing logic (itself an LLM call):**

```json
{
  "input": "user's text",
  "context": "list of available actions + memory file manifest",
  "output": {
    "intent": "question | store | task | search | status | memory_inspect",
    "memory_files_needed": ["Gaurav.md", "Travel.md"],
    "action_details": {}
  }
}
```

This is a lightweight, fast call (Sonnet or Haiku). It does not generate the answer -- it routes to the right handler, which then does the heavy lifting with the appropriate context loaded.

**Context routing manifest** (sent to the router):

```
Available memory files:
- Gaurav.md: Core identity, family, work, calendar, communication style
- Taste.md: Books, films, music, art, design, aesthetic preferences
- Travel.md: Destinations, hotels, airlines, past trips, bucket list
- Reading.md: Books read, reading list, Substacks, reading patterns
- Ideas.md: Essay seeds, story concepts, creative threads
- Essays.md: Published and in-progress essays, themes
- Food.md: Restaurants, cuisines, dietary preferences
- People.md: Key relationships, gift ideas, important dates
- Work.md: Current projects, team context, strategic priorities
- Health.md: Fitness, routines, preferences
- Places.md: Neighborhoods, cities, meaningful venues
```

---

## 7. Deployment and Development

### 7.1 Local Development

```bash
# Clone and install
git clone [repo-url] && cd second-mind
npm install

# Environment
cp .env.example .env.local
# Fill in: SUPABASE_URL, SUPABASE_ANON_KEY, ANTHROPIC_API_KEY

# Local Supabase (full Postgres + pgvector + auth via Docker)
npx supabase start

# Run migrations
npx supabase db push

# Dev server
npm run dev
```

### 7.2 Production Deployment

**Frontend:** Vercel. Connect GitHub repo, set env vars, auto-deploy on push to `main`.

**Database:** Supabase Cloud. Run migrations with `npx supabase db push --linked`. Enable RLS on all tables. Daily backups on Supabase Pro.

**CI/CD:** GitHub Actions on push to `main`:

```yaml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci
      - run: npm run lint
      - run: npm run build
      - uses: supabase/setup-cli@v1
      - run: supabase db push --linked
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
          SUPABASE_DB_PASSWORD: ${{ secrets.SUPABASE_DB_PASSWORD }}
```

Vercel auto-deploys from GitHub. No extra step needed.

### 7.3 Branch Strategy

- `main` -- production. Auto-deploys.
- `dev` -- working branch. Iterate on MacBook Pro.
- Feature branches off `dev` as needed.
- PR from `dev` to `main` when ready. CI/CD handles the rest.

### 7.4 Security

- All API routes require Supabase auth token
- RLS policies on every table
- API keys as environment variables, never in code
- Browser extension authenticates via stored session token
- HTTPS everywhere (Vercel and Supabase handle this)

---

## 8. Build Phases

### Phase 1: Foundation (Weeks 1-2)

**Goal:** Core loop works. You can talk to Second Mind and it knows you.

- Set up Next.js project with Supabase
- Create database schema
- Build the command bar UI (text input, response display)
- Implement command router (LLM intent detection + memory file selection)
- Seed 3-5 memory files manually (Gaurav.md, Taste.md, Reading.md, Travel.md, Ideas.md)
- Basic question-answering with memory context
- Deploy to Vercel + Supabase Cloud

**Exit criteria:** Type "what should I read next?" and get a good answer informed by Reading.md and Taste.md.

### Phase 2: Artifacts and Memory Updates (Weeks 3-4)

**Goal:** Content flows in and memory evolves.

- Artifact ingestion pipeline (save, summarize, embed)
- "Store" intent (essay idea, story idea, notes)
- Pending memory updates system (propose, review, approve/reject UI)
- Semantic search across artifacts
- File upload (PDF extraction, image OCR)
- Browser extension (Chrome, Manifest V3)

**Exit criteria:** Bookmark an article, system proposes a memory update, approve it, next relevant query benefits from that context.

### Phase 3: Async Tasks and Voice (Weeks 5-6)

**Goal:** Complex commands work. Voice works.

- Async task queue (creation, background execution, notification)
- "Plan a trip" as reference async task
- Voice dictation (Web Speech API + Whisper fallback)
- Task status view, artifact browser view, memory inspector view

**Exit criteria:** Say "plan a trip to Spain for spring break" and get a good itinerary within minutes.

### Phase 4: Digest and Polish (Weeks 7-8)

**Goal:** Daily digest works. Product feels delightful.

- Digest generation (cron job or Supabase Edge Function)
- Push notification (PWA or email)
- "Paper feel" design: typography, whitespace, color, animations
- Micro-interactions (approval stamp, save animation, completion notification)
- Mobile optimization
- Safari extension (if needed for iOS)

**Exit criteria:** Wake up, see digest, read something good, bookmark something from it, feel like a ritual worth having.

---

## 9. Open Questions

1. **Calendar integration:** Read Google Calendar directly for spring break dates, planned trips? Adds complexity but removes friction. Recommendation: defer to Phase 3, use Gaurav.md for key dates in Phase 1-2.

2. **Web search for tasks:** Should async tasks like trip planning call a search API (Brave, Tavily, Anthropic web search)? Recommendation: yes, use Anthropic's tool-use with web search for tasks that need current info.

3. **Memory file structure:** Pure freeform markdown or lightly structured (H2 sections)? Recommendation: light structure with H2 headers, freeform within sections. Easier for LLM to parse and propose updates to specific sections.

4. **Embedding model:** OpenAI text-embedding-3-small (1536 dims, cheap, good quality) is the default recommendation. Swap later if needed.

5. **Digest delivery:** Email is simplest and most reliable. PWA push is more native but harder. Recommendation: email for v1, PWA push as a Phase 4 stretch goal.

---

## 10. Success Criteria

Second Mind is working when:

- Raindrop is abandoned because the extension is faster and the content is more useful inside Second Mind
- 3-5 word commands return responses that would have required a paragraph of context elsewhere
- The daily digest is something to look forward to, not ignore
- "Let me ask Second Mind" becomes as natural as "let me check my notes"
- Memory files feel like an accurate, evolving portrait
- Planning a trip or choosing a book takes one command, not twenty minutes

---

## Appendix A: Memory File Template

```markdown
# [Domain Name]

> Last updated: [timestamp]
> Auto-updated via Second Mind. Editable directly.

## [Section 1]

[Concise, structured content. Bullets for lists.
Narrative sentences for context and preferences.]

## [Section 2]

...
```

**Example -- Travel.md:**

```markdown
# Travel

> Last updated: 2026-02-11

## Preferences

- Boutique hotels over chains. Character over consistency.
- Walkable neighborhoods matter more than proximity to tourist sites.
- Kids shape logistics: nap schedules, kid-friendly restaurants, not too many museums in a row.
- Direct flights preferred. Will connect for exceptional destinations.

## Favorite Destinations

- Lisbon: stayed in Alfama, loved the light and the tiles. Want to return for food.
- Kyoto: best trip ever. Cherry blossom timing was perfect.

## Bucket List

- Basque Country (Spain) -- San Sebastian for food
- Oaxaca -- mezcal, mole, markets

## Recent Trips

- [Date]: [Destination] -- [one-line takeaway]
```

## Appendix B: Command Bar UX (Text Wireframe)

**Desktop:**

- Cmd+K opens a centered modal, ~600px wide, floating over a dim backdrop
- Single text input with microphone icon on right
- Subtle ghost text suggests completions based on common commands
- Responses appear below input in the same modal, scrollable
- Quick responses render inline; long responses expand to near-full-screen "reading view"
- Modal can be pinned open as a persistent side panel

**Mobile:**

- Persistent input bar at bottom (like a messaging app)
- Microphone icon for voice
- Responses in scrollable area above input
- Full-screen takeover for long content
- Swipe up on input bar for recent commands; swipe left on response to dismiss

**Pending memory updates:**

- Small badge on command bar indicates pending updates
- Clean diff view: "Proposed update to Travel.md" with addition highlighted
- Two buttons: Approve (satisfying stamp animation) and Reject (gentle fade)
- Batch approve option for multiple pending updates
