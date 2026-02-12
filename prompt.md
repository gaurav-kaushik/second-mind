Read `prd.json` for the task list. Read `progress.txt` for learnings from previous iterations. Read `second-mind-spec.md` for full product spec if you need architectural context.

Each iteration:
1. Pick the next story where `passes` is `false`, ordered by priority
2. Implement only that one story
3. Verify all acceptance criteria. Run tests if applicable. Fix failures before proceeding.
4. Set `passes: true` in prd.json
5. Append to `progress.txt`: what you built, what you learned, gotchas for future iterations
6. Commit all changes with message referencing the story ID (e.g., "SM-003: Database schema for memory files")
7. If all stories pass, output `<promise>COMPLETE</promise>`

Constraints:
- Next.js 14+ with App Router. TypeScript strict mode. No `any` types.
- Supabase client initialized via `@supabase/ssr` for server components and route handlers
- All database operations go through Supabase client, not raw SQL at runtime
- Do not install packages without checking if an existing dependency covers the need
- Env vars: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, ANTHROPIC_API_KEY
- Do not modify files created by previous stories unless the current story explicitly requires it
- If a test fails, fix it before marking the story as passed
- For E2E tests (SM-020+): use @playwright/test with Chromium. The dev server must be running for E2E tests. Use webServer config in playwright.config.ts to auto-start it.
- Playwright device emulation for mobile: use devices['iPhone 14'] and devices['Pixel 7'] from @playwright/test. These provide viewport, touch, and user agent presets.
- When taking screenshots for UX audit, save to docs/ux-screenshots/ with descriptive names
