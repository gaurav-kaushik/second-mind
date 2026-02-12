"use client";

import ReactMarkdown from "react-markdown";

interface MarkdownResponseProps {
  content: string;
}

export default function MarkdownResponse({ content }: MarkdownResponseProps) {
  return (
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
        em: ({ children }) => <em className="italic">{children}</em>,
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
      {content}
    </ReactMarkdown>
  );
}
