import React from "react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import { MermaidBlock } from "./MermaidBlock";
import { IllustrationBlock } from "./IllustrationBlock";

interface Props {
  content: string;
  color?: string; // text color override (for user bubbles on colored bg)
  isStreaming?: boolean;
}

/**
 * Normalise math delimiters so remark-math always sees $...$ / $$...$$
 * regardless of which delimiter style the AI used.
 *
 * Skips content inside fenced code blocks so mermaid/illustration syntax
 * is never corrupted.
 */
function normalizeMath(text: string): string {
  // Split on fenced code blocks (``` ... ```) — odd indices are code blocks
  const parts = text.split(/(```[\s\S]*?```)/);
  return parts
    .map((part, i) => {
      if (i % 2 !== 0) return part; // inside a code block — leave untouched
      return part
        .replace(/\\\((.+?)\\\)/gs, (_, math) => `$${math}$`)
        .replace(/\\\[(.+?)\\\]/gs, (_, math) => `$$\n${math}\n$$`);
    })
    .join('');
}

export function MarkdownMessage({ content, color, isStreaming }: Props) {
  return (
    <div
      className="markdown-message text-sm leading-relaxed"
      style={color ? { color } : undefined}
    >
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          // ── Block code — handled entirely here to avoid a double-<pre> wrapper ──
          pre: ({ children }) => {
            // Find the <code> child and extract language + content
            let language = '';
            let code = '';
            React.Children.forEach(children, (child) => {
              if (React.isValidElement(child) && child.type === 'code') {
                const el = child as React.ReactElement<{
                  className?: string;
                  children?: React.ReactNode;
                }>;
                language = /language-(\w+)/.exec(el.props.className ?? '')?.[1] ?? '';
                code = String(el.props.children ?? '').replace(/\n$/, '');
              }
            });

            if (!isStreaming) {
              if (language === 'mermaid') return <MermaidBlock code={code} />;
              if (language === 'illustration') return <IllustrationBlock prompt={code} />;
            }

            return (
              <pre
                className="my-2 px-3 py-2 rounded-lg text-xs overflow-x-auto"
                style={{ backgroundColor: 'rgba(0,0,0,0.07)' }}
              >
                {children}
              </pre>
            );
          },
          // ── Inline code only ────────────────────────────────────────────────
          code: ({ children, className }) => {
            if (className) return <code className={className}>{children}</code>;
            return (
              <code
                className="px-1 py-0.5 rounded text-xs font-mono"
                style={{ backgroundColor: 'rgba(0,0,0,0.08)' }}
              >
                {children}
              </code>
            );
          },
          // Paragraphs
          p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
          // Bold
          strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
          // Lists
          ul: ({ children }) => (
            <ul className="list-disc list-inside mb-2 space-y-0.5">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside mb-2 space-y-0.5">{children}</ol>
          ),
          li: ({ children }) => <li className="leading-relaxed">{children}</li>,
          // Headings
          h3: ({ children }) => (
            <h3 className="font-semibold text-sm mt-3 mb-1">{children}</h3>
          ),
          h4: ({ children }) => (
            <h4 className="font-semibold text-sm mt-2 mb-1">{children}</h4>
          ),
        }}
      >
        {normalizeMath(content)}
      </ReactMarkdown>
    </div>
  );
}
