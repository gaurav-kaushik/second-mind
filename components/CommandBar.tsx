"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import MarkdownResponse from "./MarkdownResponse";
import MemoryInspector from "./MemoryInspector";

interface Message {
  role: "user" | "assistant" | "error";
  content: string;
}

interface CommandBarProps {
  isOpen: boolean;
  onClose: () => void;
}

const MAX_HISTORY = 10;
const MEMORY_COMMANDS = ["/memory", "show memory", "show me my memory files"];

function isMemoryCommand(input: string): boolean {
  const normalized = input.trim().toLowerCase();
  return MEMORY_COMMANDS.some((cmd) => normalized === cmd || normalized.startsWith(cmd));
}

export default function CommandBar({ isOpen, onClose }: CommandBarProps) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showMemoryInspector, setShowMemoryInspector] = useState(false);
  const [canScrollUp, setCanScrollUp] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current && !showMemoryInspector) {
      inputRef.current.focus();
    }
  }, [isOpen, showMemoryInspector]);

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

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleScroll = useCallback(() => {
    if (scrollRef.current) {
      setCanScrollUp(scrollRef.current.scrollTop > 8);
    }
  }, []);

  const handleNewConversation = useCallback(() => {
    setMessages([]);
    setInput("");
    setShowMemoryInspector(false);
    setCanScrollUp(false);
    inputRef.current?.focus();
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();

    if (isMemoryCommand(userMessage)) {
      setInput("");
      setShowMemoryInspector(true);
      return;
    }

    setInput("");

    const newMessages: Message[] = [
      ...messages,
      { role: "user", content: userMessage },
    ];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const history = newMessages
        .filter((m) => m.role !== "error")
        .slice(-MAX_HISTORY * 2)
        .slice(0, -1)
        .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));

      const res = await fetch("/api/command", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          history: history.length > 0 ? history : undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setMessages((prev) => [
          ...prev,
          { role: "error", content: data.error || "Something went wrong. Please try again." },
        ]);
        return;
      }

      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.response || "No response received." },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "error", content: "Could not reach the server. Please check your connection." },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, messages]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
      if (e.key === "Escape") {
        if (showMemoryInspector) {
          setShowMemoryInspector(false);
        } else {
          onClose();
        }
      }
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === "K") {
        e.preventDefault();
        handleNewConversation();
      }
    },
    [handleSubmit, onClose, handleNewConversation, showMemoryInspector]
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
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] animate-[overlayIn_200ms_ease-out]"
      style={{ backgroundColor: "rgba(0,0,0,0.1)", backdropFilter: "blur(2px)" }}
    >
      <div className="w-full max-w-[600px] mx-4 rounded-2xl bg-background shadow-[0_8px_40px_rgba(0,0,0,0.08)] border border-border/60 flex flex-col max-h-[70vh] animate-[modalIn_200ms_ease-out]">
        {showMemoryInspector ? (
          <div className="p-6 overflow-y-auto flex-1 min-h-0">
            <MemoryInspector
              onBack={() => {
                setShowMemoryInspector(false);
                setTimeout(() => inputRef.current?.focus(), 50);
              }}
            />
          </div>
        ) : (
          <>
            {messages.length > 0 && (
              <div className="flex items-center justify-end px-6 pt-4 pb-0">
                <button
                  onClick={handleNewConversation}
                  className="flex items-center gap-1.5 text-xs text-muted hover:text-foreground transition-colors border border-border/40 rounded-md px-2 py-1"
                  title="New conversation (⌘⇧K)"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  New
                </button>
              </div>
            )}

            {messages.length > 0 && (
              <div className="relative flex-1 min-h-0">
                {canScrollUp && (
                  <div className="absolute top-0 left-0 right-0 h-6 bg-gradient-to-b from-background to-transparent z-10 pointer-events-none rounded-t-2xl" />
                )}
                <div
                  ref={scrollRef}
                  onScroll={handleScroll}
                  className="h-full overflow-y-auto px-6 pt-3 pb-0 space-y-4"
                >
                  {messages.map((msg, i) => (
                    <div
                      key={i}
                      className={`animate-[fadeSlideIn_200ms_ease-out] ${msg.role === "user" ? "text-right" : ""}`}
                    >
                      {msg.role === "user" ? (
                        <div className="inline-block text-sm text-foreground bg-accent/60 rounded-lg px-3 py-2 max-w-[85%] text-left">
                          {msg.content}
                        </div>
                      ) : msg.role === "error" ? (
                        <div className="flex items-start gap-2 text-sm text-muted italic">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 flex-shrink-0 opacity-60">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="8" x2="12" y2="12" />
                            <line x1="12" y1="16" x2="12.01" y2="16" />
                          </svg>
                          {msg.content}
                        </div>
                      ) : (
                        <div className="max-w-none">
                          <MarkdownResponse content={msg.content} />
                        </div>
                      )}
                    </div>
                  ))}

                  {isLoading && (
                    <div className="flex items-center gap-0.5 text-muted text-sm pb-2">
                      <span className="animate-pulse">Thinking</span>
                      <span className="animate-pulse [animation-delay:200ms]">.</span>
                      <span className="animate-pulse [animation-delay:400ms]">.</span>
                      <span className="animate-pulse [animation-delay:600ms]">.</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="p-6 pt-4">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask, store, search, or plan..."
                className="w-full bg-transparent text-foreground text-[16px] leading-6 outline-none placeholder:text-muted/60 border-b border-border/40 pb-3 font-sans"
              />
              {messages.length === 0 && (
                <div className="mt-2 text-[11px] text-muted/50">
                  Enter to send · Esc to close
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
