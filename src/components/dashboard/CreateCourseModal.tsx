import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Loader2, RefreshCw, ArrowLeft, CheckCircle2, Plus, Trash2, ChevronUp, ChevronDown, Pencil } from 'lucide-react';
import { useGenerateCourse, useCreateCourse } from '../../hooks/useCourses';
import { useGenerateOverviews } from '../../hooks/useGenerateOverviews';
import type { CoursePreview } from '../../api/courses';

interface CreateCourseModalProps {
  open: boolean;
  onClose: () => void;
}

type Step = 'input' | 'preview';

export function CreateCourseModal({ open, onClose }: CreateCourseModalProps) {
  const [step, setStep] = useState<Step>('input');
  const [courseName, setCourseName] = useState('');
  const [preview, setPreview] = useState<CoursePreview | null>(null);
  const [error, setError] = useState('');
  const [editableTopics, setEditableTopics] = useState<string[]>([]);
  const [newTopicInput, setNewTopicInput] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState('');
  const editInputRef = useRef<HTMLInputElement>(null);

  const navigate = useNavigate();
  const { mutateAsync: generateTopics, isPending: generating } = useGenerateCourse();
  const { mutateAsync: createCourse, isPending: creating } = useCreateCourse();
  const { generateOverviews } = useGenerateOverviews();

  const busy = generating || creating;

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !busy) onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, busy, onClose]);

  // Sync editableTopics when preview changes
  useEffect(() => {
    if (preview) setEditableTopics(preview.topics);
  }, [preview]);

  // Reset on close
  useEffect(() => {
    if (!open) {
      setStep('input');
      setCourseName('');
      setPreview(null);
      setError('');
      setEditableTopics([]);
      setNewTopicInput('');
      setEditingIndex(null);
    }
  }, [open]);

  // Focus inline edit input when editing starts
  useEffect(() => {
    if (editingIndex !== null) editInputRef.current?.focus();
  }, [editingIndex]);

  const handleGenerate = async () => {
    if (!courseName.trim() || busy) return;
    setError('');
    try {
      const result = await generateTopics(courseName.trim());
      setPreview(result);
      setStep('preview');
    } catch {
      setError('Failed to generate topics. Please try again.');
    }
  };

  const handleRegenerate = async () => {
    if (busy) return;
    setError('');
    try {
      const result = await generateTopics(courseName.trim());
      setPreview(result);
    } catch {
      setError('Failed to regenerate. Please try again.');
    }
  };

  const handleCreate = async () => {
    if (!preview || busy) return;
    setError('');
    try {
      const course = await createCourse({ title: courseName.trim(), preview: { ...preview, topics: editableTopics } });
      generateOverviews(course); // fire-and-forget: pre-generate topic overviews in background
      onClose();
      navigate(`/courses/${course.id}`);
    } catch {
      setError('Failed to create course. Please try again.');
    }
  };

  const commitEdit = (index: number) => {
    const trimmed = editingValue.trim();
    if (trimmed) {
      setEditableTopics(prev => prev.map((t, i) => (i === index ? trimmed : t)));
    }
    setEditingIndex(null);
  };

  const addTopic = () => {
    const trimmed = newTopicInput.trim();
    if (!trimmed) return;
    setEditableTopics(prev => [...prev, trimmed]);
    setNewTopicInput('');
  };

  const deleteTopic = (index: number) => {
    if (editableTopics.length <= 1) return;
    setEditableTopics(prev => prev.filter((_, i) => i !== index));
  };

  const moveTopic = (index: number, dir: -1 | 1) => {
    const next = index + dir;
    if (next < 0 || next >= editableTopics.length) return;
    setEditableTopics(prev => {
      const arr = [...prev];
      [arr[index], arr[next]] = [arr[next], arr[index]];
      return arr;
    });
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
            onClick={!busy ? onClose : undefined}
          />

          {/* Modal card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Close button */}
            {!busy && (
              <button
                onClick={onClose}
                className="absolute right-4 top-4 z-10 p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <X size={18} />
              </button>
            )}

            <AnimatePresence mode="wait">
              {step === 'input' ? (
                <motion.div
                  key="input"
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={{ duration: 0.18 }}
                  className="p-7"
                >
                  {/* Badge */}
                  <div className="flex justify-center mb-5">
                    <span
                      className="text-xs font-bold px-3 py-1 rounded-full text-white tracking-widest uppercase"
                      style={{ backgroundColor: 'var(--primary)' }}
                    >
                      AI Course Builder
                    </span>
                  </div>

                  <h2
                    className="text-2xl font-bold text-center mb-2"
                    style={{ fontFamily: 'Archivo Black, sans-serif', color: 'var(--text-primary)' }}
                  >
                    Design your path
                  </h2>
                  <p className="text-sm text-center mb-6" style={{ color: 'var(--text-secondary)' }}>
                    Enter a topic and let AI create a personalized learning roadmap for you.
                  </p>

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
                    disabled={generating}
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

                  {error && <p className="text-xs text-red-500 mb-3 text-center">{error}</p>}

                  <button
                    onClick={handleGenerate}
                    disabled={!courseName.trim() || generating}
                    className="w-full flex items-center justify-center gap-2 py-3 text-sm font-semibold text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 mb-2"
                    style={{ backgroundColor: 'var(--primary)' }}
                  >
                    {generating ? (
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

                  <button
                    onClick={onClose}
                    disabled={generating}
                    className="w-full py-2.5 text-sm font-medium transition-colors disabled:opacity-40"
                    style={{ color: 'var(--text-secondary)' }}
                    onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = 'var(--text-primary)')}
                    onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)')}
                  >
                    Cancel
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="preview"
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 16 }}
                  transition={{ duration: 0.18 }}
                  className="p-7"
                >
                  {/* Back button */}
                  <button
                    onClick={() => { setStep('input'); setError(''); }}
                    disabled={busy}
                    className="flex items-center gap-1 text-sm font-medium mb-5 transition-opacity hover:opacity-70 disabled:opacity-40"
                    style={{ color: 'var(--primary)' }}
                  >
                    <ArrowLeft size={14} />
                    Edit name
                  </button>

                  {/* Course header */}
                  {preview && (
                    <>
                      <div className="flex items-center gap-3 mb-3">
                        <div
                          className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0"
                          style={{ backgroundColor: `${preview.color}18` }}
                        >
                          {preview.icon}
                        </div>
                        <div>
                          <p
                            className="font-bold text-base leading-snug"
                            style={{ fontFamily: 'Archivo Black, sans-serif', color: 'var(--text-primary)' }}
                          >
                            {courseName}
                          </p>
                          <p className="text-xs leading-relaxed mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                            {preview.description}
                          </p>
                        </div>
                      </div>

                      {/* Topic list */}
                      <div
                        className="rounded-xl border p-3 mb-4"
                        style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg)' }}
                      >
                        <p className="text-xs font-semibold mb-2 uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>
                          {editableTopics.length} topics
                        </p>
                        <ol className="space-y-1 max-h-64 overflow-y-auto pr-0.5">
                          {editableTopics.map((topic, i) => (
                            <li key={i} className="flex items-center gap-1.5 group">
                              <span
                                className="w-5 h-5 rounded-md flex items-center justify-center text-xs font-bold shrink-0"
                                style={{ backgroundColor: `${preview.color}18`, color: preview.color }}
                              >
                                {i + 1}
                              </span>

                              {editingIndex === i ? (
                                <input
                                  ref={editInputRef}
                                  value={editingValue}
                                  onChange={e => setEditingValue(e.target.value)}
                                  onBlur={() => commitEdit(i)}
                                  onKeyDown={e => {
                                    if (e.key === 'Enter') { e.preventDefault(); commitEdit(i); }
                                    if (e.key === 'Escape') { e.preventDefault(); setEditingIndex(null); }
                                  }}
                                  disabled={busy}
                                  className="flex-1 min-w-0 text-sm px-2 py-0.5 border rounded-lg focus:outline-none"
                                  style={{ borderColor: 'var(--primary)', color: 'var(--text-primary)', boxShadow: '0 0 0 2px rgba(101,65,240,0.12)' }}
                                />
                              ) : (
                                <span
                                  className="flex-1 min-w-0 text-sm truncate cursor-text"
                                  style={{ color: 'var(--text-primary)' }}
                                  onClick={() => { if (!busy) { setEditingIndex(i); setEditingValue(topic); } }}
                                  title="Click to edit"
                                >
                                  {topic}
                                </span>
                              )}

                              <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                {editingIndex !== i && (
                                  <button
                                    onClick={() => { if (!busy) { setEditingIndex(i); setEditingValue(topic); } }}
                                    disabled={busy}
                                    className="p-0.5 rounded transition-colors hover:text-purple-600 disabled:opacity-40"
                                    style={{ color: 'var(--text-secondary)' }}
                                    title="Rename"
                                  >
                                    <Pencil size={12} />
                                  </button>
                                )}
                                <button
                                  onClick={() => moveTopic(i, -1)}
                                  disabled={busy || i === 0}
                                  className="p-0.5 rounded transition-colors hover:text-purple-600 disabled:opacity-20"
                                  style={{ color: 'var(--text-secondary)' }}
                                  title="Move up"
                                >
                                  <ChevronUp size={14} />
                                </button>
                                <button
                                  onClick={() => moveTopic(i, 1)}
                                  disabled={busy || i === editableTopics.length - 1}
                                  className="p-0.5 rounded transition-colors hover:text-purple-600 disabled:opacity-20"
                                  style={{ color: 'var(--text-secondary)' }}
                                  title="Move down"
                                >
                                  <ChevronDown size={14} />
                                </button>
                                <button
                                  onClick={() => deleteTopic(i)}
                                  disabled={busy || editableTopics.length <= 1}
                                  className="p-0.5 rounded transition-colors hover:text-red-500 disabled:opacity-20"
                                  style={{ color: 'var(--text-secondary)' }}
                                  title="Delete"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            </li>
                          ))}
                        </ol>

                        {/* Add topic row */}
                        <div className="flex items-center gap-1.5 mt-2 pt-2" style={{ borderTop: '1px solid var(--border)' }}>
                          <input
                            type="text"
                            value={newTopicInput}
                            onChange={e => setNewTopicInput(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTopic(); } }}
                            placeholder="Add a topic..."
                            disabled={busy}
                            className="flex-1 min-w-0 text-sm px-2 py-1 border rounded-lg focus:outline-none transition-colors disabled:opacity-50"
                            style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                            onFocus={e => { e.currentTarget.style.borderColor = 'var(--primary)'; }}
                            onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}
                          />
                          <button
                            onClick={addTopic}
                            disabled={busy || !newTopicInput.trim()}
                            className="p-1.5 rounded-lg text-white transition-all disabled:opacity-40 hover:opacity-90"
                            style={{ backgroundColor: 'var(--primary)' }}
                            title="Add topic"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>
                    </>
                  )}

                  {error && <p className="text-xs text-red-500 mb-3 text-center">{error}</p>}

                  <button
                    onClick={handleCreate}
                    disabled={busy}
                    className="w-full flex items-center justify-center gap-2 py-3 text-sm font-semibold text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 mb-2"
                    style={{ backgroundColor: 'var(--primary)' }}
                  >
                    {creating ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Creating Course...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={16} />
                        Create Course
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleRegenerate}
                    disabled={busy}
                    className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-xl border transition-all disabled:opacity-40 hover:opacity-70"
                    style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
                  >
                    {generating ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <RefreshCw size={14} />
                    )}
                    Regenerate Topics
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
