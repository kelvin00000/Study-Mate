import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { generateIllustration } from '../api/illustrations';
import { ImageIcon } from 'lucide-react';

export function IllustrationBlock({ prompt }: { prompt: string }) {
  const { getToken } = useAuth();
  const [imageUrl, setImageUrl] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    getToken()
      .then((token) => generateIllustration(prompt.trim(), token!))
      .then(({ imageUrl }) => setImageUrl(imageUrl))
      .catch((err) => {
        console.error('[IllustrationBlock] failed:', err);
        setError(err?.message ?? 'Unknown error');
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prompt]);

  if (error)
    return (
      <div className="my-4 flex flex-col gap-1 text-sm text-[var(--text-secondary)] rounded-xl border border-[var(--border)] bg-gray-50 p-4">
        <div className="flex items-center gap-2">
          <ImageIcon size={16} /> Illustration unavailable
        </div>
        <span className="text-xs opacity-60">{error}</span>
      </div>
    );

  if (!imageUrl)
    return <div className="my-4 h-48 rounded-xl bg-gray-100 animate-pulse" />;

  return (
    <div className="my-4 rounded-xl overflow-hidden border border-[var(--border)]">
      <img src={imageUrl} alt={prompt} className="w-full object-cover" />
      <p className="px-3 py-1.5 text-xs text-[var(--text-secondary)] bg-gray-50 border-t border-[var(--border)]">
        AI illustration · {prompt.slice(0, 60)}{prompt.length > 60 ? '…' : ''}
      </p>
    </div>
  );
}
