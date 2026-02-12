# What I Learned — Hands-on UX Testing, Feb 12 2026

## What's Working Well

### The core interaction loop is genuinely impressive
The command bar → router → memory-informed AI response loop works. When I typed "Plan a trip to Japan" (just 6 words), the system loaded Travel.md, Gaurav.md, and relevant context, then produced a 2-week personalized itinerary that factored in:
- Kids' ages and school schedules (spring break timing)
- Previous Kyoto visits ("familiar from last time")
- Art island interest (Naoshima)
- Food preferences
- Hotel aesthetic preferences

This is the spec's vision of "fewer words per prompt" actually working. The follow-up "recommend specific hotels in Kyoto" continued the conversation with full context — recommending Sowaka and Ace Hotel based on design sensibility.

### Memory files are rich and well-structured
The 5 memory files (Gaurav.md, Reading.md, Taste.md, Travel.md, Ideas.md) contain genuine, detailed context. The AI uses this naturally — it doesn't say "according to your Reading.md file" but instead speaks as if it knows Gaurav personally. This is the core differentiator from ChatGPT/Claude direct.

### The memory inspector is clean and functional
The list → read → edit → save flow works well on both desktop and mobile. Markdown renders beautifully. Versioning works (saves increment version numbers). The new natural language routing ("Show me Gaurav.md", "Open my reading notes") tested perfectly on both desktop and mobile.

### Design language is cohesive
The paper-warm color palette, Geist font, generous whitespace, and subtle animations create a consistent aesthetic. The command bar modal with backdrop blur looks polished. The settle animation on open feels right.

### Mobile is solid for what it does
The persistent bottom input bar pattern works well. Conversations render cleanly. Memory inspector adapts to the viewport. The `visualViewport` API handling for mobile keyboard is a thoughtful touch.

---

## What's Broken or Risky

### The "fake save" problem is the #1 risk
When I said "Save this bookmark: https://craigmod.com/ridgeline/187/", the AI responded: "I've saved that bookmark. Craig Mod's Ridgeline 187 — added to your collection." It did not save anything. The store handler isn't implemented, so the request fell through to the question handler, which generated a plausible-sounding response. This is the worst kind of bug — it looks correct but silently drops data. If a user trusts this and doesn't realize their bookmarks are gone, they'll lose faith in the system.

### The infinite-thinking bug creates a dead-end
On first test, the API request hung for 90+ seconds with no timeout, no error, and no recovery. Clicking "New" didn't help because `isLoading` stays true. The only escape was reloading the page. This is two bugs compounding: (1) no API timeout and (2) New conversation doesn't reset loading state.

### Keyboard navigation has a gap
Escape doesn't work when the Memory Inspector is open. The handler is on the `<input>` element which isn't rendered in inspector mode. Users are stuck until they mouse-click "← Back". This breaks the "command bar is everything" principle — keyboard-only users hit a dead end.

---

## What I Noticed About the Content

### The memory files paint a specific, detailed picture
The content in the memory files is well-crafted:
- **Gaurav.md**: SVP of AI, writer, married with two young kids, family time shapes schedules, values depth over breadth
- **Reading.md**: Currently reading Queneau and Saunders, reads 2-3 books simultaneously, abandons books at page 80
- **Taste.md**: Joan Didion, Borges, Calvino; Wong Kar-wai, Koreeda; Japanese design sensibility, wabi-sabi
- **Travel.md**: Loves Kyoto, interested in Naoshima, prefers boutique hotels, kids drive scheduling
- **Ideas.md**: Essay seeds, story concepts, creative threads

The AI integrates these naturally. When recommending hotels, it suggested Sowaka ("wabi-sabi meets boutique luxury") — a clear match to the Taste.md profile. When discussing Japan timing, it immediately said "Late March / Early April — aligns with spring break" because it knows about the kids' school calendar.

### Search fails gracefully but honestly
When I searched "Find that article about grief I saved", the AI correctly said it couldn't find it and suggested where it might be (different memory file, browser, unshared file). This is much better than hallucinating a result. But it also doesn't actually search any artifact store because none exists yet.

---

## Architecture Insights

### The two-model routing pattern works
Haiku for classification (~200ms) → Sonnet for generation (~15-45s) is the right split. The router correctly classified all 6 intents I tested: question, store, search, memory_inspect. The `memory_inspect` short-circuit we just built saves the entire Sonnet call for memory queries.

### The memory-loading pattern scales to ~10 files
Currently 5 files are loaded per request. The router selects 2-4 relevant files. At 10-15 files (spec target), this stays under token limits. But at scale, the system prompt with multiple memory files could get large. May want to consider summarized versions for the system prompt with full versions available on demand.

### The conversation history works but has no persistence
Multi-turn conversation uses in-memory state (React component). Refreshing the page loses all history. The spec doesn't require persistence, but for "plan a trip" style multi-turn conversations that span days, this is a limitation.

---

## Comparison to Spec Vision

| Spec Principle | Current State | Gap |
|---|---|---|
| "Fewer words per prompt" | Working well — "Plan Spain" works | None for questions |
| "Paper feel" | Color palette and typography are right | Animations could be smoother (streaming) |
| "Tactile interactions" | Not yet — no micro-interactions for save/approve | Phase 2+ feature |
| "Command bar is everything" | Yes — all interaction through command bar | Keyboard gaps in inspector |
| "Reading room vs workshop" | Both modes work (chat vs memory inspector) | Transition between modes could be smoother |
| Store artifacts | Not implemented — AI lies about saving | Critical gap |
| Search artifacts | Not implemented — fails gracefully | Phase 2 |
| Async tasks | Not implemented | Phase 3 |
| Daily digest | Not implemented | Phase 4 |

---

## Recommendations (Ordered by Impact)

1. **Fix the fake-save problem** (P0) — Either short-circuit unimplemented intents with honest messages, or add guardrails to the system prompt preventing hallucinated actions
2. **Add API timeout + loading state reset** (P0) — 30s timeout, AbortController, reset isLoading on New
3. **Add response streaming** (P1) — Biggest single UX improvement. Transforms the 45s wait from "is it broken?" to "watching it think"
4. **Fix Escape key in inspector** (P1) — Document-level keydown listener
5. **Add mobile prompt pills** (P1) — Match the desktop empty-state experience
6. **Clean up TestFile.md** (P1) — Quick DB cleanup + test teardown fix
7. **Add copy button on responses** (P2) — The Japan trip plan is genuinely useful and should be shareable
