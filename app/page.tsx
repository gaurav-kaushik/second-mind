"use client";

import { useState, useEffect, useCallback } from "react";
import CommandBar from "@/components/CommandBar";
import MobileCommandBar from "@/components/MobileCommandBar";
import { useMediaQuery } from "@/lib/hooks/useMediaQuery";

export default function Home() {
  const [isCommandBarOpen, setIsCommandBarOpen] = useState(false);
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
        <p className="mt-4 text-sm text-muted">
          Press{" "}
          <kbd className="rounded border border-border bg-accent px-1.5 py-0.5 text-xs font-mono">
            ⌘K
          </kbd>{" "}
          to begin
        </p>
      </div>

      <CommandBar
        isOpen={isCommandBarOpen}
        onClose={() => setIsCommandBarOpen(false)}
      />
    </div>
  );
}
