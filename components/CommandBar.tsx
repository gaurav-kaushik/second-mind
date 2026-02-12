"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import MarkdownResponse from "./MarkdownResponse";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface CommandBarProps {
  isOpen: boolean;
  onClose: () => void;
}

const MAX_HISTORY = 10;

export default function CommandBar({ isOpen, onClose }: CommandBarProps) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

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

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleNewConversation = useCallback(() => {
    setMessages([]);
    setError("");
    setInput("");
    inputRef.current?.focus();
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setError("");

    // Add user message to conversation
    const newMessages: Message[] = [
      ...messages,
      { role: "user", content: userMessage },
    ];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      // Build history from last N exchanges
      const history = newMessages
        .slice(-MAX_HISTORY * 2)
        .slice(0, -1) // Exclude the current message (sent separately)
        .map((m) => ({ role: m.role, content: m.content }));

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
        setError(data.error || "Something went wrong. Please try again.");
        return;
      }

      const data = await res.json();
      const responseText = data.response || "No response received.";

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: responseText },
      ]);
    } catch {
      setError("Could not reach the server. Please check your connection.");
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
        onClose();
      }
      // Cmd+Shift+K for new conversation
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === "K") {
        e.preventDefault();
        handleNewConversation();
      }
    },
    [handleSubmit, onClose, handleNewConversation]
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
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/10 backdrop-blur-[2px] pt-[15vh]"
    >
      <div className="w-full max-w-[600px] mx-4 rounded-2xl bg-background shadow-[0_8px_40px_rgba(0,0,0,0.08)] border border-border/60 flex flex-col max-h-[70vh]">
        {/* Header with new conversation button */}
        {messages.length > 0 && (
          <div className="flex items-center justify-end px-6 pt-4 pb-0">
            <button
              onClick={handleNewConversation}
              className="text-xs text-muted hover:text-foreground transition-colors"
              title="New conversation (⌘⇧K)"
            >
              New conversation
            </button>
          </div>
        )}

        {/* Scrollable message area */}
        {messages.length > 0 && (
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto px-6 pt-3 pb-0 space-y-4 min-h-0"
          >
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`animate-in fade-in duration-300 ${
                  msg.role === "user" ? "text-right" : ""
                }`}
              >
                {msg.role === "user" ? (
                  <div className="inline-block text-sm text-foreground bg-accent/40 rounded-lg px-3 py-2 max-w-[85%] text-left">
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
        )}

        {/* Input area - always pinned at bottom */}
        <div className="p-6 pt-4">
          {error && (
            <div className="mb-3 text-sm text-muted italic">{error}</div>
          )}

          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask, store, search, or plan..."
            className="w-full bg-transparent text-foreground text-[16px] leading-6 outline-none placeholder:text-muted/60 border-b border-border/40 pb-3 font-sans"
          />
        </div>
      </div>
    </div>
  );
}
