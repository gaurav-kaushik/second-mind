# UX Improvements Backlog

Audit conducted against `second-mind-spec.md` Section 5 design principles:
Paper feel, tactile interactions, information density, command bar primacy.

Screenshots in `docs/ux-screenshots/`.

---

## Critical (P0) -- Blocks Usability

### 1. Error responses indistinguishable from normal responses
**Screen:** Command bar conversation (05-command-bar-response.png, 06-command-bar-conversation.png)
**Issue:** When the LLM is unavailable (placeholder API key or actual failure), the error message "Something went wrong while processing your question. Please try again." renders identically to a normal assistant message. The user cannot visually tell this is an error versus a real response.
**Fix:** Render error responses with a subtle visual distinction: italic text, slightly muted color, and a small warning icon or "retry" affordance. The error should appear in the message flow but be clearly different from assistant content.

### 2. Command bar lacks open/close animation
**Screen:** Command bar open (03-command-bar-empty.png)
**Issue:** The command bar appears and disappears instantly with no transition. Spec Section 5.2 says "content should appear to settle onto the page, not snap into place" and "transitions should feel physical: slides, fades, gentle easing." Currently violates the core paper-feel principle.
**Fix:** Add a CSS transition on the command bar modal: opacity fade (0 to 1, 200ms) combined with a subtle translateY (8px to 0) for a "settling" effect. The overlay backdrop should also fade in.

### 3. No scroll affordance in conversation area
**Screen:** Command bar conversation (06-command-bar-conversation.png)
**Issue:** When conversation grows beyond visible area, there's no visual indicator that content is scrollable. Users may not realize there are earlier messages above.
**Fix:** Add a subtle gradient fade (8px) at the top edge of the scrollable message area when scrolled down. Optionally add one at the bottom when content extends below.

---

## Important (P1) -- Degrades Experience

### 4. User message bubble contrast is low
**Screen:** Command bar loading (04-command-bar-loading.png)
**Issue:** The user message bubble uses `bg-accent/40` which is very close to the modal background. The bubble almost blends in. It should be visually distinct enough to immediately identify as "your message."
**Fix:** Increase background opacity to `bg-accent/60` or use a slightly warmer shade. The text should feel like it's sitting on a clearly different surface.

### 5. Landing page is too bare
**Screen:** Landing page (02-landing-page.png)
**Issue:** The landing page shows only "Second Mind" and "Press ⌘K to begin." For a first-time user (even if it's just Gaurav), this provides no context about what Second Mind does or what kind of things to ask. The spec says the system should feel like it "already knows you" — the empty state should reflect that warmth.
**Fix:** Add a brief warm subtitle below the title, e.g., "Your personal intelligence system" in muted text. Optionally show 2-3 example prompts as clickable suggestions: "What should I read next?", "Plan a trip to Japan", "Show me my memory files."

### 6. "New conversation" button too subtle
**Screen:** Command bar conversation (06-command-bar-conversation.png)
**Issue:** The "New conversation" text in the top-right corner is tiny, unadorned, and easy to miss. The keyboard shortcut (⌘⇧K) is not visible anywhere.
**Fix:** Make the button slightly larger, add a subtle icon (e.g., a "+" or circular arrow), and show the keyboard shortcut hint on hover or as a title tooltip.

### 7. No keyboard shortcut hints in command bar
**Screen:** Command bar (03-command-bar-empty.png)
**Issue:** The command bar shows no affordances for its keyboard shortcuts. Users don't know about Escape to close, ⌘⇧K for new conversation, or that Enter submits. Spec Section 5.5 says the command bar is the primary surface — it should teach its shortcuts.
**Fix:** Add a subtle hint row below the input: "Enter to send · Esc to close" in small muted text. Only show when the conversation is empty (hide once messages appear to save space).

### 8. Memory inspector Back/navigation inconsistency
**Screen:** Memory inspector list (07-memory-inspector-list.png), file view (08-memory-inspector-file.png)
**Issue:** The list view has "Back" (returns to command bar), and the file view has "← All files" (returns to list). The wording and style are inconsistent. Navigation hierarchy is unclear.
**Fix:** Use consistent naming: "← Back" to return to command bar from list, "← All files" to return to list from file view. Both should use the same arrow style.

---

## Polish (P2) -- Nice to Have

### 9. Loading indicator could be more refined
**Screen:** Command bar loading (04-command-bar-loading.png)
**Issue:** The "Thinking..." with animated dots works but feels basic. The pulse animation on individual dots is functional but not particularly elegant.
**Fix:** Consider a subtle shimmer/gradient animation on the "Thinking" text, or use a more typographically interesting loading state (e.g., three dots that breathe/scale rather than pulse opacity).

### 10. Memory inspector "TestFile.md" appears in screenshots
**Screen:** Memory inspector list (07-memory-inspector-list.png, 12-mobile-memory-inspector.png)
**Issue:** A "TestFile.md" with "A test file" description appears in the memory file list. This is test data pollution from integration tests. Not a UI issue but affects perceived quality.
**Fix:** E2E test cleanup should remove test artifacts after running. Alternatively, seed data should be scoped to avoid polluting the main DB.

### 11. No feedback on successful actions
**Screen:** Memory inspector edit (09-memory-inspector-edit.png)
**Issue:** After saving a memory file, the "Saved" feedback is a brief flash of text. Spec Section 5.3 says "saving should have a satisfying micro-interaction." Currently the feedback is too ephemeral.
**Fix:** Add a brief checkmark animation or gentle color flash on the Save button to create a more satisfying confirmation moment.

### 12. Mobile input placeholder partially obscured
**Screen:** Mobile landing (10-mobile-landing.png)
**Issue:** In development, the Next.js debug badge (black "N" circle) in the bottom-left overlaps with the mobile input placeholder text. In production this won't appear, but it affects dev experience.
**Fix:** No action needed for production. For dev, could add slight left padding to the mobile input or accept this as a dev-only issue.

### 13. Response text lacks fade-in animation
**Screen:** Command bar response (05-command-bar-response.png)
**Issue:** Spec Section 5.2 requires "content should appear to settle onto the page." While a CSS animation class exists for fade-in, it may not be consistently applied to all response elements in the conversation flow.
**Fix:** Ensure each new message (both user and assistant) fades in with a gentle opacity + translateY transition when it appears.
