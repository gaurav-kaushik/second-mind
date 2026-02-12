"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import ReactMarkdown from "react-markdown";

interface CommandBarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CommandBar({ isOpen, onClose }: CommandBarProps) {
  const [input, setInput] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showResponse, setShowResponse] = useState(false);
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

  // Fade-in effect for response
  useEffect(() => {
    if (response && !isLoading) {
      setShowResponse(false);
      const timer = setTimeout(() => setShowResponse(true), 50);
      return () => clearTimeout(timer);
    }
  }, [response, isLoading]);

  const handleSubmit = useCallback(async () => {
    if (!input.trim() || isLoading) return;

    setIsLoading(true);
    setError("");
    setResponse("");
    setShowResponse(false);

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
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/10 backdrop-blur-[2px] pt-[20vh]"
    >
      <div className="w-full max-w-[600px] mx-4 rounded-2xl bg-background shadow-[0_8px_40px_rgba(0,0,0,0.08)] border border-border/60">
        <div className="p-6">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask, store, search, or plan..."
            className="w-full bg-transparent text-foreground text-[16px] leading-6 outline-none placeholder:text-muted/60 border-b border-border/40 pb-3 font-sans"
          />

          {isLoading && (
            <div className="mt-4 flex items-center gap-0.5 text-muted text-sm">
              <span className="animate-pulse">Thinking</span>
              <span className="animate-pulse [animation-delay:200ms]">.</span>
              <span className="animate-pulse [animation-delay:400ms]">.</span>
              <span className="animate-pulse [animation-delay:600ms]">.</span>
            </div>
          )}

          {error && (
            <div className="mt-4 text-sm text-muted italic">
              {error}
            </div>
          )}

          {response && !isLoading && (
            <div
              className="mt-4 prose-sm max-w-none transition-opacity duration-300 ease-in-out"
              style={{ opacity: showResponse ? 1 : 0 }}
            >
              <ReactMarkdown
                components={{
                  p: ({ children }) => (
                    <p className="text-sm leading-relaxed text-foreground mb-3 last:mb-0">
                      {children}
                    </p>
                  ),
                  h1: ({ children }) => (
                    <h1 className="text-lg font-semibold text-foreground mt-4 mb-2 first:mt-0">
                      {children}
                    </h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-base font-semibold text-foreground mt-4 mb-2 first:mt-0">
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-sm font-semibold text-foreground mt-3 mb-1">
                      {children}
                    </h3>
                  ),
                  ul: ({ children }) => (
                    <ul className="text-sm leading-relaxed text-foreground list-disc pl-5 mb-3 space-y-1">
                      {children}
                    </ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="text-sm leading-relaxed text-foreground list-decimal pl-5 mb-3 space-y-1">
                      {children}
                    </ol>
                  ),
                  li: ({ children }) => (
                    <li className="text-sm leading-relaxed text-foreground">
                      {children}
                    </li>
                  ),
                  strong: ({ children }) => (
                    <strong className="font-semibold">{children}</strong>
                  ),
                  em: ({ children }) => (
                    <em className="italic">{children}</em>
                  ),
                  code: ({ children, className }) => {
                    const isBlock = className?.includes("language-");
                    if (isBlock) {
                      return (
                        <code className="block bg-accent/50 rounded-lg p-3 text-xs font-mono text-foreground overflow-x-auto my-3">
                          {children}
                        </code>
                      );
                    }
                    return (
                      <code className="bg-accent/50 rounded px-1 py-0.5 text-xs font-mono text-foreground">
                        {children}
                      </code>
                    );
                  },
                  pre: ({ children }) => (
                    <pre className="bg-accent/50 rounded-lg p-3 overflow-x-auto my-3">
                      {children}
                    </pre>
                  ),
                  a: ({ href, children }) => (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-foreground underline underline-offset-2 decoration-border hover:decoration-foreground transition-colors"
                    >
                      {children}
                    </a>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-2 border-border pl-3 text-muted italic my-3">
                      {children}
                    </blockquote>
                  ),
                }}
              >
                {response}
              </ReactMarkdown>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
