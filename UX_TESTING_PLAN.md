# UX Testing Plan

Comprehensive manual and automated testing plan for Second Mind.
Created from hands-on Playwright MCP testing on 2026-02-11.

## Test Results Summary

| # | Test | Status | Notes |
|---|------|--------|-------|
| 1 | Login flow | PASS | Email/password auth works |
| 2 | Landing page | PASS | Title, subtitle, prompt pills, ⌘K hint visible |
| 3 | Cmd+K opens command bar | PASS | Modal overlay with input, keyboard hints |
| 4 | Escape closes command bar | PASS | Returns to landing page |
| 5 | Question intent (simple) | PASS | "Tell me about Gaurav" returns rich contextual response |
| 6 | Question intent (reading) | PASS | "What should I read next?" returns personalized recommendation |
| 7 | Multi-turn conversation | PASS | Follow-up retains context from prior exchange |
| 8 | Memory inspector (/memory) | PASS | Shows 6 files with metadata |
| 9 | Memory file read view | PASS | Gaurav.md renders with full markdown content |
| 10 | "Plan a trip to Japan" | PASS (fixed) | Was: "task" → dead-end. Now: falls through to question handler |
| 11 | "show me my books" | PASS (fixed) | Was: "search" → dead-end. Now: falls through to question handler |
| 12 | "look up bookmarks" | PASS (fixed) | Was: "search" → dead-end. Now: falls through to question handler |
| 13 | "What do you know about me from Gaurav.md?" | PASS (fixed) | Was: "memory_inspect" → dead-end. Now: falls through to question handler |
| 14 | Prompt pill click | PASS (fixed) | Was: showed stale conversation. Now: resets and auto-submits pill text |
| 15 | Memory inspector sticky state | PASS (fixed) | Was: Cmd+K reopened memory inspector. Now: resets to fresh command bar |
| 16 | New conversation button | PASS | Clears messages, resets state |
| 17 | Cmd+Shift+K new conversation | NOT TESTED | |
| 18 | Memory file edit | NOT TESTED | |
| 19 | Click-outside closes command bar | NOT TESTED | |
| 20 | Markdown rendering in responses | PASS | Headers, bold, lists, links render correctly |

## Bugs Found

### BUG-1: Unimplemented intents dead-end (CRITICAL)

**Impact:** Most natural commands fail with "This capability is coming soon."

The router classifies queries into intents: question, task, search, store, status, memory_inspect. Only "question" has a handler. Everything else returns a dead-end message. This means:

- "Plan a trip to Japan" → task → dead-end
- "show me my books" → search → dead-end
- "look up bookmarks" → search → dead-end
- "What do you know about me from Gaurav.md?" → memory_inspect → dead-end
- "Save this idea..." → store → dead-end

**Fix:** For unimplemented intents, fall back to the question handler instead of dead-ending. The question handler already loads memory files and can attempt a useful response. The router already selects relevant memory files even for non-question intents.

**Location:** `app/api/command/route.ts` lines 68-76

**Status:** FIXED — all intents now fall through to question handler

### BUG-2: Prompt pills don't submit their text (MEDIUM)

**Impact:** Clicking a prompt pill opens the command bar but shows the previous conversation. The pill text is never sent.

**Root cause:** `app/page.tsx` line 54 — pill buttons only call `setIsCommandBarOpen(true)`. They don't:
1. Reset conversation state
2. Set the input text
3. Submit the command

**Fix:** Pass the prompt text to CommandBar (e.g., via an `initialPrompt` prop) and have CommandBar auto-submit it when it opens with a prompt.

**Location:** `app/page.tsx` line 54, `components/CommandBar.tsx`

**Status:** FIXED — added `initialPrompt` / `onInitialPromptConsumed` props, CommandBar auto-submits on open

### BUG-3: Memory inspector state is sticky (LOW)

**Impact:** After using /memory, pressing Cmd+K reopens the memory inspector instead of a fresh command bar.

**Root cause:** `showMemoryInspector` state isn't reset when the command bar is closed and reopened. The `onClose` callback in page.tsx sets `isCommandBarOpen = false`, but CommandBar doesn't reset `showMemoryInspector` when `isOpen` transitions from false to true.

**Fix:** Add a useEffect in CommandBar that resets `showMemoryInspector` to false when `isOpen` becomes true.

**Location:** `components/CommandBar.tsx`

**Status:** FIXED — added useEffect to reset showMemoryInspector on open

## Full E2E Test Scenarios

### A. Authentication

| Test | Steps | Expected |
|------|-------|----------|
| A1. Login with valid credentials | Navigate to /login, enter email/password, click Sign in | Redirected to / |
| A2. Login with invalid credentials | Enter wrong password, click Sign in | "Invalid login credentials" error |
| A3. Unauthenticated access | Navigate to / without session | Redirected to /login |
| A4. API auth guard | POST /api/command without session | 401 response |
| A5. Health endpoint public | GET /api/health without session | 200 response |

### B. Landing Page

| Test | Steps | Expected |
|------|-------|----------|
| B1. Elements visible | Load / | "Second Mind", subtitle, ⌘K hint, 3 prompt pills visible |
| B2. Prompt pill "What should I read next?" | Click pill | Command bar opens, submits query, gets response |
| B3. Prompt pill "Plan a trip to Japan" | Click pill | Command bar opens, submits query, gets response |
| B4. Prompt pill "Show me my memory files" | Click pill | Command bar opens, memory inspector shows |

### C. Command Bar (Desktop)

| Test | Steps | Expected |
|------|-------|----------|
| C1. Open with Cmd+K | Press Meta+K | Modal overlay appears with input focused |
| C2. Close with Escape | Press Escape | Modal closes, landing page visible |
| C3. Close with click outside | Click overlay backdrop | Modal closes |
| C4. Submit with Enter | Type text, press Enter | User message appears, "Thinking..." shown, then response |
| C5. Empty submit | Press Enter with empty input | Nothing happens |
| C6. New conversation | Click "+ New" button | Messages cleared, input empty |
| C7. Cmd+Shift+K new conversation | Press Meta+Shift+K | Messages cleared, input empty |
| C8. Keyboard hints | Open with empty conversation | "Enter to send · Esc to close" visible below input |
| C9. Keyboard hints hidden | After first message | Hints disappear |
| C10. Scroll gradient | Long conversation | Gradient appears at top when scrolled down |

### D. Question Flow

| Test | Steps | Expected |
|------|-------|----------|
| D1. Simple question | "Tell me about Gaurav" | Response mentions identity, family, work from Gaurav.md |
| D2. Reading recommendation | "What should I read next?" | Personalized book recommendation from Reading.md + Taste.md |
| D3. Travel question | "Where should I go for spring break?" | Uses Travel.md + Gaurav.md context |
| D4. Taste question | "What kind of films do I like?" | Uses Taste.md context |
| D5. Cross-context question | "What book would make a good trip read for Japan?" | Draws from Reading.md + Travel.md + Taste.md |
| D6. Multi-turn follow-up | Ask question, then follow up referencing response | Second response maintains context |
| D7. Task-like question | "Plan a trip to Japan" | Should get a useful response (not "coming soon") |
| D8. Search-like question | "Show me my books" | Should get a useful response (not "coming soon") |
| D9. Store-like question | "Remember that I liked the Murakami exhibit" | Should get a useful response (not "coming soon") |
| D10. Markdown rendering | Ask a question that produces lists/headers | Bold, headers, lists, code render properly |

### E. Memory Inspector

| Test | Steps | Expected |
|------|-------|----------|
| E1. Open with /memory | Type "/memory", Enter | Memory file list appears |
| E2. Open with "show memory" | Type "show memory", Enter | Memory file list appears |
| E3. Open with "show me my memory files" | Type "show me my memory files", Enter | Memory file list appears |
| E4. File list contents | Open memory inspector | 5+ files shown with filename, version, date, description |
| E5. View file | Click Gaurav.md | Markdown content rendered: Identity, Family, Work, Communication Style |
| E6. Back to list | Click "← All files" | Returns to file list |
| E7. Edit file | Click Edit on a file | Textarea with monospace font, Save/Cancel buttons |
| E8. Save edit | Add text, click Save | Content updated, version incremented |
| E9. Cancel edit | Modify text, click Cancel | Changes discarded, back to read view |
| E10. Persistence | Edit a file, go back, reopen | Changes persist |
| E11. Back to command bar | Click "← Back" from list | Returns to command bar input |
| E12. Escape from inspector | Press Escape in memory inspector | Returns to command bar |
| E13. Fresh state on reopen | Close command bar, reopen with Cmd+K | Shows command bar input, not memory inspector |

### F. Error Handling

| Test | Steps | Expected |
|------|-------|----------|
| F1. API error response | Trigger server error | Error message with icon, italic, muted style (not normal message) |
| F2. Network error | Disconnect network, submit | "Could not reach the server" message |
| F3. Empty message | Submit empty input | Nothing happens (no request sent) |
| F4. Invalid JSON body | Send malformed request to API | 400 response |

### G. Mobile (< 768px viewport)

| Test | Steps | Expected |
|------|-------|----------|
| G1. Persistent input bar | Load on mobile | Bottom input bar visible (no Cmd+K modal) |
| G2. Send button | Tap send arrow | Message sent, response appears above |
| G3. Message scroll | Multi-turn conversation | Messages scroll above, input pinned at bottom |
| G4. No horizontal scroll | Any state | document.body.scrollWidth <= window.innerWidth |
| G5. Font size | Any state | Body font-size >= 16px (no zoom on iOS) |
| G6. Memory inspector | Type /memory, send | Memory file list appears |
| G7. New conversation | Tap "New" button | Messages cleared |

### H. Visual / Design

| Test | Steps | Expected |
|------|-------|----------|
| H1. Paper feel | Overall appearance | Warm off-white (#faf8f5) background, no bright blues |
| H2. Open animation | Open command bar | Overlay fade + modal slide-up animation (200ms) |
| H3. Message animation | New message appears | Fade-slide-in animation |
| H4. User bubble contrast | Send a message | User bubble has readable contrast (bg-accent/60) |
| H5. Error message distinct | Trigger error | Visually distinct from normal assistant messages |
| H6. Loading indicator | Submit and watch | "Thinking..." with pulsing dots |

## Screenshots Captured

All screenshots saved in `screenshots/` directory:

| File | Description |
|------|-------------|
| 01-login-page.png | Login form |
| 02-landing-page.png | Landing page with prompt pills |
| 03-command-bar-open.png | Empty command bar with hints |
| 04-gaurav-question-broken.png | "What do you know about me from Gaurav.md?" → "coming soon" |
| 05-gaurav-question-working.png | "Tell me about Gaurav" → rich response |
| 06-reading-recommendation.png | Book recommendation with memory context |
| 07-multi-turn-conversation.png | Follow-up conversation maintaining context |
| 08-memory-inspector-list.png | Memory file list view |
| 09-gaurav-md-content.png | Gaurav.md rendered content |
| 10-japan-trip-not-implemented.png | "Plan a trip to Japan" → "coming soon" |
| 11-prompt-pill-bug.png | Prompt pill opening stale conversation (before fix) |
| 12-japan-trip-fixed.png | "Plan a trip to Japan" returning rich personalized plan (after fix) |
| 13-show-books-fixed.png | "show me my books" returning book list from Reading.md (after fix) |
