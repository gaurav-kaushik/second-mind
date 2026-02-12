# Second Mind

A personal intelligence system that maintains a structured understanding of its owner and uses that context to respond to terse, high-intent commands without requiring paragraphs of context-setting.

Every interaction gets smarter because the system already knows you.

## Prerequisites

- **Node.js** >= 20
- **Docker** (for local Supabase)
- **Supabase CLI** (`npm install -g supabase` or `npx supabase`)

## Setup

```bash
# Clone and install
git clone <repo-url>
cd second-mind
npm install

# Copy environment variables
cp .env.local.example .env.local
# Edit .env.local with your Anthropic API key

# Start local Supabase (requires Docker)
npx supabase start

# The start command outputs your local keys.
# Update .env.local with the anon key and service role key if different.

# Run database migrations
npx supabase db reset

# Seed memory files
export $(grep -v '^#' .env.local | xargs)
npx tsx scripts/seed-memory.ts

# Create a user account
npx tsx scripts/create-user.ts your@email.com your-password

# Start development server
npm run dev -- --port 3111
```

Open [http://localhost:3111](http://localhost:3111), sign in, and press `⌘K` to start.

## Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run test` | Run Vitest unit/integration tests |
| `npm run test:e2e` | Run Playwright E2E tests (desktop + mobile) |
| `npm run test:watch` | Run Vitest in watch mode |
| `npx tsx scripts/seed-memory.ts` | Seed memory files |
| `npx tsx scripts/create-user.ts <email> <pass>` | Create a user account |
| `npx tsx scripts/ux-screenshots.ts` | Capture UX screenshots |

## Project Structure

```
second-mind/
├── app/                    # Next.js App Router pages and API routes
│   ├── api/
│   │   ├── command/        # POST /api/command — main interaction endpoint
│   │   ├── health/         # GET /api/health — DB connectivity check
│   │   └── memory/         # GET/PATCH memory file CRUD
│   ├── login/              # Login page
│   ├── globals.css         # Tailwind v4 config + animations
│   ├── layout.tsx          # Root layout with fonts
│   └── page.tsx            # Home page with command bar
├── components/
│   ├── CommandBar.tsx       # Desktop command bar modal (⌘K)
│   ├── MobileCommandBar.tsx # Mobile persistent input bar
│   ├── MarkdownResponse.tsx # Shared markdown renderer
│   └── MemoryInspector.tsx  # Memory file list/read/edit views
├── lib/
│   ├── auth.ts             # Reusable auth check for API routes
│   ├── env.ts              # Required env var validation
│   ├── handlers/
│   │   └── question.ts     # Memory-informed LLM generation
│   ├── hooks/
│   │   └── useMediaQuery.ts # Responsive breakpoint hook
│   ├── router.ts           # LLM intent detection (Claude Haiku)
│   └── supabase/
│       ├── client.ts       # Browser Supabase client
│       └── server.ts       # Server Supabase client (service role)
├── types/
│   ├── api.ts              # Request/response types
│   ├── models.ts           # Database model types
│   └── supabase.ts         # Auto-generated Supabase types
├── scripts/
│   ├── create-user.ts      # Create auth user
│   ├── seed-memory.ts      # Seed memory files
│   └── ux-screenshots.ts   # Capture UI screenshots
├── supabase/
│   └── migrations/         # Database schema migrations
├── tests/
│   ├── api/                # API route tests (Vitest)
│   ├── handlers/           # Handler tests
│   ├── e2e/                # Playwright E2E tests
│   │   ├── mobile/         # Mobile device emulation tests
│   │   └── global-setup.ts # Auth setup for E2E
│   ├── helpers.ts          # Test utilities
│   └── router.test.ts      # Router classification tests
├── middleware.ts            # Supabase session refresh + auth redirects
├── playwright.config.ts     # E2E test configuration
├── vitest.config.ts         # Unit test configuration
└── UX_IMPROVEMENTS_BACKLOG.md # Remaining polish items
```

## Environment Variables

See `.env.local.example` for the full list:

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project API URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anonymous/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service role key (server-side only) |
| `ANTHROPIC_API_KEY` | Yes | Anthropic Claude API key |
| `ROUTER_MODEL` | No | Claude model for routing (default: `claude-haiku-4-5-20251001`) |
| `GENERATION_MODEL` | No | Claude model for generation (default: `claude-sonnet-4-5-20250929`) |

## Known Issues / Future Work

Remaining P2 polish items from `UX_IMPROVEMENTS_BACKLOG.md`:

- Loading indicator animation could be more refined (shimmer/breathe effect)
- Test data ("TestFile.md") visible in memory inspector from integration tests
- Save action feedback in memory editor is too ephemeral (needs micro-interaction)
- Next.js debug badge overlaps mobile input in development mode
