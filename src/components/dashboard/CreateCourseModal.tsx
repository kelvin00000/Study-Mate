import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Loader2 } from 'lucide-react';

interface CreateCourseModalProps {
  open: boolean;
  onClose: () => void;
}

export function CreateCourseModal({ open, onClose }: CreateCourseModalProps) {
  const [courseName, setCourseName] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isGenerating) onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, isGenerating, onClose]);

  // Reset state when closed
  useEffect(() => {
    if (!open) {
      setCourseName('');
      setIsGenerating(false);
    }
  }, [open]);

  const handleGenerate = async () => {
    if (!courseName.trim() || isGenerating) return;
    setIsGenerating(true);
    // TODO: wire up actual AI generation API
    await new Promise(res => setTimeout(res, 2000));
    setIsGenerating(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0"
          style={{ backgroundColor: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }}
          onClick={!isGenerating ? onClose : undefined}
        />

        {/* Modal card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="relative w-full max-w-md bg-white rounded-2xl p-7 shadow-2xl"
        >
        {/* Close button */}
        {!isGenerating && (
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <X size={18} />
          </button>
        )}

        {/* Badge */}
        <div className="flex justify-center mb-5">
          <span
            className="text-xs font-bold px-3 py-1 rounded-full text-white tracking-widest uppercase"
            style={{ backgroundColor: 'var(--primary)' }}
          >
            AI Course Builder
          </span>
        </div>

        {/* Heading */}
        <h2
          className="text-2xl font-bold text-center mb-2"
          style={{
            fontFamily: 'Archivo Black, sans-serif',
            color: 'var(--text-primary)',
          }}
        >
          Design your path
        </h2>
        <p className="text-sm text-center mb-6" style={{ color: 'var(--text-secondary)' }}>
          Enter a topic and let AI create a personalized learning roadmap for you.
        </p>

        {/* Course name input */}
        <label className="block mb-1.5">
          <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
            Course name
          </span>
        </label>
        <input
          type="text"
          value={courseName}
          onChange={e => setCourseName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleGenerate()}
          placeholder="e.g. Introduction to Machine Learning"
          disabled={isGenerating}
          className="w-full px-4 py-2.5 text-sm border rounded-xl mb-5 focus:outline-none transition-colors disabled:opacity-60"
          style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
          onFocus={e => {
            e.currentTarget.style.borderColor = 'var(--primary)';
            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(101,65,240,0.12)';
          }}
          onBlur={e => {
            e.currentTarget.style.borderColor = 'var(--border)';
            e.currentTarget.style.boxShadow = 'none';
          }}
          autoFocus
        />

        {/* Generate button */}
        <button
          onClick={handleGenerate}
          disabled={!courseName.trim() || isGenerating}
          className="w-full flex items-center justify-center gap-2 py-3 text-sm font-semibold text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 mb-2"
          style={{ backgroundColor: 'var(--primary)' }}
        >
          {isGenerating ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Generating Topics...
            </>
          ) : (
            <>
              <Sparkles size={16} />
              Generate Topics with AI
            </>
          )}
        </button>

        {/* Cancel */}
        <button
          onClick={onClose}
          disabled={isGenerating}
          className="w-full py-2.5 text-sm font-medium transition-colors disabled:opacity-40"
          style={{ color: 'var(--text-secondary)' }}
          onMouseEnter={e =>
            ((e.currentTarget as HTMLElement).style.color = 'var(--text-primary)')
          }
          onMouseLeave={e =>
            ((e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)')
          }
        >
          Cancel
        </button>
        </motion.div>
      </div>
      )}
    </AnimatePresence>
  );
}
