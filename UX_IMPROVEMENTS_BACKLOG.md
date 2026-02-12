# UX Improvements Backlog

Audit conducted against `second-mind-spec.md` Section 5 design principles:
Paper feel, tactile interactions, information density, command bar primacy.

Screenshots in `docs/ux-screenshots/`.

---

## Critical (P0) -- Blocks Usability

### 1. Error responses indistinguishable from normal responses -- DONE
**Screen:** Command bar conversation (05-command-bar-response.png, 06-command-bar-conversation.png)
**Issue:** When the LLM is unavailable (placeholder API key or actual failure), the error message renders identically to a normal assistant message.
**Fix:** Added separate "error" message role. Error messages now render with italic text, muted color, and a warning icon (circle with exclamation). Applied to both desktop CommandBar and MobileCommandBar.

### 2. Command bar lacks open/close animation -- DONE
**Screen:** Command bar open (03-command-bar-empty.png)
**Issue:** The command bar appears and disappears instantly with no transition.
**Fix:** Added CSS keyframe animations: `overlayIn` (opacity fade, 200ms) for the backdrop, `modalIn` (opacity + translateY 8px settling effect, 200ms) for the modal container. Content now "settles onto the page" per spec Section 5.2.

### 3. No scroll affordance in conversation area -- DONE
**Screen:** Command bar conversation (06-command-bar-conversation.png)
**Issue:** No visual indicator that content is scrollable when conversation grows.
**Fix:** Added gradient fade at top of scroll area that appears when scrolled down. Uses `onScroll` handler tracking `canScrollUp` state, conditionally rendering a `bg-gradient-to-b from-background to-transparent` overlay.

---

## Important (P1) -- Degrades Experience

### 4. User message bubble contrast is low -- DONE
**Screen:** Command bar loading (04-command-bar-loading.png)
**Issue:** User message bubble `bg-accent/40` was too close to modal background.
**Fix:** Increased to `bg-accent/60` on both desktop and mobile CommandBar components for clearer visual distinction.

### 5. Landing page is too bare -- DONE
**Screen:** Landing page (02-landing-page.png)
**Issue:** Only showed "Second Mind" and "Press ⌘K to begin" with no context.
**Fix:** Added subtitle "Your personal intelligence system" in muted text. Added 3 example prompt pills ("What should I read next?", "Plan a trip to Japan", "Show me my memory files") as rounded clickable buttons that open the command bar.

### 6. "New conversation" button too subtle -- DONE
**Screen:** Command bar conversation (06-command-bar-conversation.png)
**Issue:** Tiny unadorned text in corner, easy to miss.
**Fix:** Added "+" icon (SVG plus), light border, rounded-md styling, shortened to "New". Applied consistently to both desktop and mobile. Desktop has tooltip with keyboard shortcut.

### 7. No keyboard shortcut hints in command bar -- DONE
**Screen:** Command bar (03-command-bar-empty.png)
**Issue:** No visible keyboard shortcut affordances.
**Fix:** Added "Enter to send · Esc to close" hint in 11px muted text below the input. Only shows when conversation is empty (hides once messages appear to save space).

### 8. Memory inspector Back/navigation inconsistency -- DONE
**Screen:** Memory inspector list (07-memory-inspector-list.png), file view (08-memory-inspector-file.png)
**Issue:** List view had "Back", file view had "← All files" — inconsistent arrow style.
**Fix:** Changed list view button from "Back" to "← Back" to match the arrow style used in "← All files" on the file view.

---

## Polish (P2) -- Nice to Have

### 9. Loading indicator could be more refined
**Screen:** Command bar loading (04-command-bar-loading.png)
**Issue:** The "Thinking..." with animated dots works but feels basic.
**Fix:** Consider a subtle shimmer/gradient animation or dots that breathe/scale.

### 10. Memory inspector "TestFile.md" appears in screenshots
**Screen:** Memory inspector list (07-memory-inspector-list.png, 12-mobile-memory-inspector.png)
**Issue:** Test data pollution from integration tests.
**Fix:** E2E test cleanup should remove test artifacts after running.

### 11. No feedback on successful actions
**Screen:** Memory inspector edit (09-memory-inspector-edit.png)
**Issue:** "Saved" feedback is too ephemeral.
**Fix:** Add checkmark animation or gentle color flash on Save button.

### 12. Mobile input placeholder partially obscured
**Screen:** Mobile landing (10-mobile-landing.png)
**Issue:** Next.js debug badge overlaps mobile input in development.
**Fix:** Dev-only issue, no production impact.

### 13. Response text lacks fade-in animation -- DONE (bonus)
**Screen:** Command bar response (05-command-bar-response.png)
**Issue:** Messages appeared without transition.
**Fix:** Added `fadeSlideIn` CSS keyframe animation (opacity + translateY 4px, 200ms) to all message elements in the conversation flow on both desktop and mobile.
