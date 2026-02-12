"use client";

import { useState, useEffect, useCallback } from "react";
import CommandBar from "@/components/CommandBar";
import MobileCommandBar from "@/components/MobileCommandBar";
import { useMediaQuery } from "@/lib/hooks/useMediaQuery";

const EXAMPLE_PROMPTS = [
  "What should I read next?",
  "Plan a trip to Japan",
  "Show me my memory files",
];

export default function Home() {
  const [isCommandBarOpen, setIsCommandBarOpen] = useState(false);
  const [initialPrompt, setInitialPrompt] = useState<string | undefined>();
  const isMobile = useMediaQuery("(max-width: 767px)");

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "k") {
      e.preventDefault();
      setIsCommandBarOpen((prev) => !prev);
    }
  }, []);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  if (isMobile) {
    return <MobileCommandBar />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-light tracking-tight text-foreground">
          Second Mind
        </h1>
        <p className="mt-2 text-sm text-muted/70">
          Your personal intelligence system
        </p>
        <p className="mt-6 text-sm text-muted">
          Press{" "}
          <kbd className="rounded border border-border bg-accent px-1.5 py-0.5 text-xs font-mono">
            ⌘K
          </kbd>{" "}
          to begin
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {EXAMPLE_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              onClick={() => {
                setInitialPrompt(prompt);
                setIsCommandBarOpen(true);
              }}
              className="text-xs text-muted/60 hover:text-muted border border-border/30 hover:border-border/60 rounded-full px-3 py-1.5 transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      <CommandBar
        isOpen={isCommandBarOpen}
        onClose={() => setIsCommandBarOpen(false)}
        initialPrompt={initialPrompt}
        onInitialPromptConsumed={() => setInitialPrompt(undefined)}
      />
    </div>
  );
}
