"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import MarkdownResponse from "./MarkdownResponse";
import MemoryInspector from "./MemoryInspector";

interface Message {
  role: "user" | "assistant" | "error";
  content: string;
}

const MAX_HISTORY = 10;
const MEMORY_COMMANDS = ["/memory", "show memory", "show me my memory files"];

function isMemoryCommand(input: string): boolean {
  const normalized = input.trim().toLowerCase();
  return MEMORY_COMMANDS.some((cmd) => normalized === cmd || normalized.startsWith(cmd));
}

export default function MobileCommandBar() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showMemoryInspector, setShowMemoryInspector] = useState(false);
  const [memoryInitialFile, setMemoryInitialFile] = useState<string | undefined>();
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;

    const handleResize = () => {
      document.documentElement.style.setProperty(
        "--viewport-height",
        `${viewport.height}px`
      );
    };

    handleResize();
    viewport.addEventListener("resize", handleResize);
    return () => viewport.removeEventListener("resize", handleResize);
  }, []);

  const handleNewConversation = useCallback(() => {
    abortControllerRef.current?.abort();
    setMessages([]);
    setInput("");
    setIsLoading(false);
    setShowMemoryInspector(false);
    setMemoryInitialFile(undefined);
    inputRef.current?.focus();
  }, []);

  const submitMessage = useCallback(async (userMessage: string, currentMessages: Message[]) => {
    if (isMemoryCommand(userMessage)) {
      setInput("");
      setShowMemoryInspector(true);
      return;
    }

    setInput("");

    const newMessages: Message[] = [
      ...currentMessages,
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

      const controller = new AbortController();
      abortControllerRef.current = controller;

      const res = await fetch("/api/command", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          history: history.length > 0 ? history : undefined,
        }),
        signal: controller.signal,
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

      // Route memory_inspect intent to the Memory Inspector UI
      if (data.intent === "memory_inspect") {
        const targetFile = data.actionDetails?.targetFile as string | undefined;
        setMemoryInitialFile(targetFile);
        setShowMemoryInspector(true);
        return;
      }

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
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!input.trim() || isLoading) return;
    submitMessage(input.trim(), messages);
  }, [input, isLoading, messages, submitMessage]);

  const handleCopy = useCallback((content: string, index: number) => {
    navigator.clipboard.writeText(content).then(() => {
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    });
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit]
  );

  return (
    <div
      className="flex flex-col w-full"
      style={{ height: "var(--viewport-height, 100dvh)" }}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/40">
        <h1 className="text-base font-light tracking-tight text-foreground">
          Second Mind
        </h1>
        {(messages.length > 0 || showMemoryInspector) && (
          <button
            onClick={handleNewConversation}
            className="flex items-center gap-1 text-xs text-muted hover:text-foreground transition-colors"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            New
          </button>
        )}
      </div>

      {showMemoryInspector ? (
        <div className="flex-1 overflow-y-auto px-4 py-4 min-h-0">
          <MemoryInspector
            onBack={() => {
              setShowMemoryInspector(false);
              setMemoryInitialFile(undefined);
              setTimeout(() => inputRef.current?.focus(), 50);
            }}
            initialFile={memoryInitialFile}
          />
        </div>
      ) : (
        <>
          {/* Scrollable message area */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto px-4 py-4 space-y-4 min-h-0"
          >
            {messages.length === 0 && !isLoading && (
              <div className="flex flex-col items-center justify-center h-full gap-6 px-2">
                <p className="text-muted/50 text-sm font-light">What can I help with?</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {[
                    "What should I read next?",
                    "Plan a trip to Japan",
                    "Show me my memory files",
                  ].map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => submitMessage(prompt, [])}
                      className="text-xs text-muted hover:text-foreground border border-border/40 rounded-full px-3 py-1.5 transition-colors active:bg-accent/30"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}

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
                  <div className="max-w-none relative">
                    <MarkdownResponse content={msg.content} />
                    <button
                      onClick={() => handleCopy(msg.content, i)}
                      className="absolute top-0 right-0 text-muted hover:text-foreground p-1.5 rounded active:bg-accent/30"
                      title="Copy response"
                    >
                      {copiedIndex === i ? (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      ) : (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                        </svg>
                      )}
                    </button>
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center gap-0.5 text-muted text-sm">
                <span className="animate-pulse">Thinking</span>
                <span className="animate-pulse [animation-delay:200ms]">.</span>
                <span className="animate-pulse [animation-delay:400ms]">.</span>
                <span className="animate-pulse [animation-delay:600ms]">.</span>
              </div>
            )}
          </div>

          {/* Bottom input bar */}
          <div className="border-t border-border/40 px-4 py-3 bg-background">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask, store, search, or plan..."
                className="flex-1 bg-transparent text-foreground text-[16px] leading-6 outline-none placeholder:text-muted/60 font-sans min-h-[44px]"
              />
              <button
                onClick={handleSubmit}
                disabled={!input.trim() || isLoading}
                className="text-muted hover:text-foreground disabled:opacity-30 transition-colors p-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
                aria-label="Send"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
