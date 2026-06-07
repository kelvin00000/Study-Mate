import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

interface Props {
  content: string;
  color?: string; // text color override (for user bubbles on colored bg)
}

/**
 * Normalise math delimiters so remark-math always sees $...$ / $$...$$
 * regardless of which delimiter style the AI used.
 *
 * Handles:
 *   \( ... \)   →  $...$       (inline, parenthesis-style)
 *   \[ ... \]   →  $$...$$     (block, bracket-style)
 */
function normalizeMath(text: string): string {
  return text
    .replace(/\\\((.+?)\\\)/gs, (_, math) => `$${math}$`)
    .replace(/\\\[(.+?)\\\]/gs, (_, math) => `$$\n${math}\n$$`);
}

export function MarkdownMessage({ content, color }: Props) {
  return (
    <div
      className="markdown-message text-sm leading-relaxed"
      style={color ? { color } : undefined}
    >
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          // Paragraphs — no extra margin on first/last
          p: ({ children }) => (
            <p className="mb-2 last:mb-0">{children}</p>
          ),
          // Inline code
          code: ({ children, className }) => {
            const isBlock = !!className;
            if (isBlock) {
              return (
                <pre
                  className="my-2 px-3 py-2 rounded-lg text-xs overflow-x-auto"
                  style={{ backgroundColor: "rgba(0,0,0,0.07)" }}
                >
                  <code>{children}</code>
                </pre>
              );
            }
            return (
              <code
                className="px-1 py-0.5 rounded text-xs font-mono"
                style={{ backgroundColor: "rgba(0,0,0,0.08)" }}
              >
                {children}
              </code>
            );
          },
          // Bold
          strong: ({ children }) => (
            <strong className="font-semibold">{children}</strong>
          ),
          // Lists
          ul: ({ children }) => (
            <ul className="list-disc list-inside mb-2 space-y-0.5">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside mb-2 space-y-0.5">{children}</ol>
          ),
          li: ({ children }) => <li className="leading-relaxed">{children}</li>,
          // Headings (AI sometimes uses them)
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
