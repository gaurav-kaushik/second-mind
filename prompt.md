Read `prd.json` for the task list. Read `progress.txt` for learnings from previous iterations. Read `second-mind-spec.md` for full product spec if you need architectural context.

Each iteration:
1. Pick the next story where `passes` is `false`, ordered by priority
2. Read all relevant acceptance criteria carefully before writing any code
3. Implement only that one story
4. Verify all acceptance criteria. Run tests if applicable. Fix failures before proceeding.
5. Set `passes: true` in prd.json
6. Append to `progress.txt`: what you built, what you learned, gotchas for future iterations
7. Commit all changes with message referencing the story ID (e.g., "SM-004: Database schema for memory files")
8. If all stories pass, output `<promise>COMPLETE</promise>`

Constraints:
- SM-001 is discovery only. Verify environment, read the spec, no code changes.
- SM-002 scaffolds into a repo that already has files (prd.json, prompt.md, progress.txt, second-mind-spec.md, README.md). Preserve them all.
- Next.js 14+ with App Router. TypeScript strict mode. No `any` types.
- Supabase client via `@supabase/ssr` for server components and route handlers.
- All database operations go through Supabase client, not raw SQL at runtime.
- Do not install packages without checking if an existing dependency covers the need.
- Env vars: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, ANTHROPIC_API_KEY, ROUTER_MODEL, GENERATION_MODEL
- Do not modify files created by previous stories unless the current story explicitly requires it.
- If a test fails, fix it before marking the story as passed.
- For E2E tests (SM-021+): use @playwright/test with Chromium. Use webServer config in playwright.config.ts to auto-start the dev server.
- Playwright device emulation for mobile: use devices['iPhone 14'] and devices['Pixel 7'] from @playwright/test.
- When taking screenshots for UX audit, save to docs/ux-screenshots/ with descriptive names.