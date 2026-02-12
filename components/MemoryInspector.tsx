"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import MarkdownResponse from "./MarkdownResponse";

interface MemoryFileItem {
  id: string;
  filename: string;
  description: string;
  version: number;
  updated_at: string;
}

interface MemoryFileDetail {
  id: string;
  filename: string;
  description: string;
  content: string;
  version: number;
  updated_at: string;
}

type View = "list" | "read" | "edit";

interface MemoryInspectorProps {
  onBack: () => void;
  initialFile?: string;
}

export default function MemoryInspector({ onBack, initialFile }: MemoryInspectorProps) {
  const [files, setFiles] = useState<MemoryFileItem[]>([]);
  const [selectedFile, setSelectedFile] = useState<MemoryFileDetail | null>(null);
  const [view, setView] = useState<View>("list");
  const [editContent, setEditContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingFile, setLoadingFile] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/memory");
      if (res.ok) {
        const data = await res.json();
        setFiles(data);
      }
    } catch {
      // Silently fail — list will be empty
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFile = useCallback(async (filename: string) => {
    setLoadingFile(filename);
    try {
      const res = await fetch(`/api/memory/${encodeURIComponent(filename)}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedFile(data);
        setView("read");
      }
    } catch {
      // Silently fail
    } finally {
      setLoadingFile(null);
    }
  }, []);

  // Auto-open a specific file when initialFile is provided
  useEffect(() => {
    if (initialFile) {
      fetchFile(initialFile);
    }
  }, [initialFile, fetchFile]);

  const handleEdit = useCallback(() => {
    if (selectedFile) {
      setEditContent(selectedFile.content);
      setView("edit");
      setSaveMessage("");
      setTimeout(() => textareaRef.current?.focus(), 50);
    }
  }, [selectedFile]);

  const handleSave = useCallback(async () => {
    if (!selectedFile || isSaving) return;

    setIsSaving(true);
    setSaveMessage("");

    try {
      const res = await fetch(
        `/api/memory/${encodeURIComponent(selectedFile.filename)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: editContent }),
        }
      );

      if (res.ok) {
        const updated = await res.json();
        setSelectedFile(updated);
        setView("read");
        setSaveMessage("Saved");
        setTimeout(() => setSaveMessage(""), 2000);
      } else {
        setSaveMessage("Failed to save");
      }
    } catch {
      setSaveMessage("Failed to save");
    } finally {
      setIsSaving(false);
    }
  }, [selectedFile, editContent, isSaving]);

  const handleCancel = useCallback(() => {
    setView("read");
    setSaveMessage("");
  }, []);

  const handleBackToList = useCallback(() => {
    setSelectedFile(null);
    setView("list");
    setSaveMessage("");
  }, []);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (isLoading && view === "list" && files.length === 0) {
    return (
      <div className="text-sm text-muted py-4">Loading memory files...</div>
    );
  }

  // List view
  if (view === "list") {
    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-foreground tracking-tight">
            Memory Files
          </h2>
          <button
            onClick={onBack}
            className="text-xs text-muted hover:text-foreground transition-colors"
          >
            ← Back
          </button>
        </div>
        <div className="space-y-1">
          {files.map((file) => (
            <button
              key={file.id}
              onClick={() => fetchFile(file.filename)}
              className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-accent/30 transition-colors group"
            >
              <div className="flex items-baseline justify-between">
                <span className="text-sm font-medium text-foreground font-mono">
                  {file.filename}
                </span>
                <span className="text-xs text-muted">
                  {loadingFile === file.filename ? (
                    <span className="animate-pulse">Loading...</span>
                  ) : (
                    <>v{file.version} · {formatDate(file.updated_at)}</>
                  )}
                </span>
              </div>
              <p className="text-xs text-muted mt-0.5 leading-relaxed">
                {file.description}
              </p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Read view
  if (view === "read" && selectedFile) {
    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={handleBackToList}
            className="text-xs text-muted hover:text-foreground transition-colors"
          >
            ← All files
          </button>
          <div className="flex items-center gap-3">
            {saveMessage && (
              <span className="text-xs text-muted">{saveMessage}</span>
            )}
            <button
              onClick={handleEdit}
              className="text-xs text-muted hover:text-foreground transition-colors border border-border/60 rounded px-2 py-1"
            >
              Edit
            </button>
          </div>
        </div>
        <div className="mb-2">
          <span className="text-xs text-muted font-mono">
            {selectedFile.filename}
          </span>
          <span className="text-xs text-muted ml-2">
            v{selectedFile.version}
          </span>
        </div>
        <div className="leading-snug">
          <MarkdownResponse content={selectedFile.content} />
        </div>
      </div>
    );
  }

  // Edit view
  if (view === "edit" && selectedFile) {
    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs text-muted font-mono">
            Editing {selectedFile.filename}
          </span>
          <div className="flex items-center gap-2">
            {saveMessage && (
              <span className="text-xs text-muted">{saveMessage}</span>
            )}
            <button
              onClick={handleCancel}
              className="text-xs text-muted hover:text-foreground transition-colors border border-border/60 rounded px-2 py-1"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="text-xs text-foreground hover:text-foreground/80 transition-colors border border-foreground/20 rounded px-2 py-1 disabled:opacity-50"
            >
              {isSaving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
        <textarea
          ref={textareaRef}
          value={editContent}
          onChange={(e) => setEditContent(e.target.value)}
          className="w-full min-h-[400px] max-h-[60vh] bg-accent/20 text-foreground text-xs leading-relaxed font-mono rounded-lg p-3 outline-none border border-border/40 resize-y"
        />
      </div>
    );
  }

  return null;
}
