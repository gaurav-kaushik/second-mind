"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface CommandBarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CommandBar({ isOpen, onClose }: CommandBarProps) {
  const [input, setInput] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleSubmit = useCallback(async () => {
    if (!input.trim() || isLoading) return;

    setIsLoading(true);
    setError("");
    setResponse("");

    try {
      const res = await fetch("/api/command", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input.trim() }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Something went wrong. Please try again.");
        return;
      }

      const data = await res.json();
      setResponse(data.response || "No response received.");
    } catch {
      setError("Could not reach the server. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
      if (e.key === "Escape") {
        onClose();
      }
    },
    [handleSubmit, onClose]
  );

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === overlayRef.current) {
        onClose();
      }
    },
    [onClose]
  );

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/20 backdrop-blur-sm pt-[20vh]"
    >
      <div className="w-full max-w-[600px] mx-4 rounded-xl bg-background shadow-lg border border-border">
        <div className="p-6">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask, store, search, or plan..."
            className="w-full bg-transparent text-foreground text-base outline-none placeholder:text-muted border-b border-border pb-3"
          />

          {isLoading && (
            <div className="mt-4 flex items-center gap-1 text-muted text-sm">
              <span className="animate-pulse">Thinking</span>
              <span className="animate-pulse" style={{ animationDelay: "0.2s" }}>.</span>
              <span className="animate-pulse" style={{ animationDelay: "0.4s" }}>.</span>
              <span className="animate-pulse" style={{ animationDelay: "0.6s" }}>.</span>
            </div>
          )}

          {error && (
            <div className="mt-4 text-sm text-muted">
              {error}
            </div>
          )}

          {response && !isLoading && (
            <div className="mt-4 text-sm leading-relaxed text-foreground whitespace-pre-wrap">
              {response}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
