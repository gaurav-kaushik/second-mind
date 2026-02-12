# UX Improvements Backlog

Hands-on exploratory test conducted Feb 12, 2026 against live app on `localhost:3000`.
Evaluated against `second-mind-spec.md` Section 5 design principles.
Screenshots in `screenshots/ux-test-feb-12-morning/`.

---

## Critical (P0) — Blocks Usability

### ~~1. AI hallucinates actions for unimplemented intents~~ FIXED (SM-026)
Short-circuited `store`, `task`, `search`, `status` intents in `app/api/command/route.ts` with honest "coming soon" messages. Verified screenshot: `screenshots/ux-fixes/01-store-intent-honest-message.png`.

### ~~2. No timeout on API calls — infinite "Thinking" state~~ FIXED (SM-026)
Added 30s timeout via AbortController in `lib/handlers/question.ts`. Returns friendly timeout message.

### ~~3. "New conversation" doesn't reset loading state~~ FIXED (SM-026)
Added `setIsLoading(false)` and `abortControllerRef.current?.abort()` to `handleNewConversation` in both CommandBar and MobileCommandBar.

---

## Important (P1) — Degrades Experience

### ~~4. Escape key doesn't work when Memory Inspector is open~~ FIXED (SM-026)
Added document-level `keydown` listener that fires when `showMemoryInspector` is true. Verified screenshot: `screenshots/ux-fixes/02-escape-exits-memory-inspector.png`.

### ~~5. Mobile has no prompt pills / empty state is too bare~~ FIXED (SM-026)
Added "What can I help with?" heading and 3 prompt pill buttons to MobileCommandBar empty state. Verified screenshot: `screenshots/ux-fixes/03-mobile-prompt-pills.png`.

### ~~6. TestFile.md appears in memory inspector~~ FIXED (SM-026)
Added `afterAll` cleanup to `tests/api/memory.test.ts` and `tests/e2e/memory-edit.spec.ts` to delete test artifacts.

### ~~7. No loading indicator when memory inspector fetches individual files~~ FIXED (SM-026)
Added `loadingFile` state to MemoryInspector. Shows "Loading..." text on the specific file being fetched.

### 8. Response latency is high — no streaming
**Issue:** Responses take 15-45 seconds to appear. The "Thinking..." indicator is the only feedback. Per spec Section 5.2, content should "settle onto the page."
**Fix:** Implement streaming responses using the Anthropic streaming API. Show tokens as they arrive.

---

## Polish (P2) — Nice to Have

### 9. Long responses clip at modal bottom
**Issue:** No visual affordance that more content exists above when scrolled to the bottom.
**Fix:** Consider a subtle bottom fade gradient or scroll indicator.

### 10. User message bubble doesn't show what intent was detected
**Issue:** No indication of how input was classified (e.g., "memory" or "search" badge).
**Fix:** Consider showing a small intent badge on user messages.

### ~~11. No way to copy or share AI responses~~ FIXED (SM-026)
Added copy button with checkmark feedback on assistant messages in both CommandBar and MobileCommandBar. Verified screenshot: `screenshots/ux-fixes/06-copy-button-on-response.png`.

### 12. Command bar modal position shifts when messages appear
**Issue:** The modal is positioned at `pt-[15vh]` from the top. Internal layout shifts when messages appear.
**Fix:** Pin the input to the bottom of the modal and let the message area grow upward.

### 13. Memory inspector navigation hierarchy unclear
**Issue:** "← All files" and "← Back" use the same visual style.
**Fix:** Consider breadcrumbs navigation.

### 14. No dark mode
**Issue:** No dark mode for early morning / before bed usage.
**Fix:** Add a paper-warm dark mode.

---

## Not Bugs — Feature Gaps (Phase 2+)

- **Artifact storage** (`store` intent): No way to save bookmarks, ideas, notes to the database
- **Semantic search** (`search` intent): No way to find previously saved content
- **Task execution** (`task` intent): No async task planning/execution
- **Status dashboard** (`status` intent): No way to check on running tasks
- **Voice input**: No microphone/dictation support
- **File upload**: No drag-and-drop for PDFs, images, markdown
- **Daily digest**: No push notification / morning summary
- **Browser extension**: No way to save URLs from the web
