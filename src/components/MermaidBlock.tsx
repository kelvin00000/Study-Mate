import { useEffect, useId, useState } from 'react';
import mermaid from 'mermaid';

mermaid.initialize({ startOnLoad: false, theme: 'neutral', fontFamily: 'Roboto, sans-serif' });

export function MermaidBlock({ code }: { code: string }) {
  const id = `m${useId().replace(/:/g, '')}`;
  const [svg, setSvg] = useState('');
  const [error, setError] = useState(false);

  useEffect(() => {
    mermaid
      .render(id, code.trim())
      .then(({ svg }) => setSvg(svg))
      .catch(() => setError(true));
  }, [id, code]);

  if (error)
    return (
      <pre className="my-3 rounded-xl bg-gray-50 border border-[var(--border)] p-4 text-xs overflow-x-auto">
        <code>{code}</code>
      </pre>
    );

  if (!svg)
    return <div className="my-4 h-28 rounded-xl bg-gray-100 animate-pulse" />;

  return (
    <div
      className="my-4 overflow-x-auto rounded-xl border border-[var(--border)] bg-white p-4"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
