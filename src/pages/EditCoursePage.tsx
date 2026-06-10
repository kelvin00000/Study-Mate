import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, Loader2, ChevronDown, ChevronRight,
  Trash2, Plus, Check, X,
} from 'lucide-react';
import { Sidebar } from '../components/dashboard/Sidebar';
import { TopBar } from '../components/dashboard/TopBar';
import { CreateCourseModal } from '../components/dashboard/CreateCourseModal';
import { useCourse, useUpdateCourse, useDeleteCourse, useAddTopic, useUpdateTopic, useDeleteTopic, useReorderTopics } from '../hooks/useCourses';
import { useObjectives, useAddObjective, useUpdateObjective, useDeleteObjective } from '../hooks/useObjectives';
import type { CourseTopic } from '../api/courses';
import type { LearningObjective } from '../api/objectives';

const PALETTE = ['#6541F0', '#EC4899', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6'];

// ── Objectives sub-section rendered inside an expanded topic row ──────────────
function TopicObjectivesSection({ courseId, topicId }: { courseId: string; topicId: string }) {
  const { data: objectives, isLoading } = useObjectives(courseId, topicId);
  const addObj = useAddObjective(courseId, topicId);
  const updateObj = useUpdateObjective(courseId, topicId);
  const deleteObj = useDeleteObjective(courseId, topicId);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [addText, setAddText] = useState('');

  function startEdit(obj: LearningObjective) {
    setEditingId(obj.id);
    setEditText(obj.text);
  }

  function commitEdit(objectiveId: string) {
    const trimmed = editText.trim();
    if (trimmed) updateObj.mutate({ objectiveId, text: trimmed });
    setEditingId(null);
  }

  function handleAddKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') submitAdd();
  }

  function submitAdd() {
    const trimmed = addText.trim();
    if (!trimmed) return;
    addObj.mutate(trimmed, { onSuccess: () => setAddText('') });
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 size={16} className="animate-spin" style={{ color: 'var(--primary)' }} />
      </div>
    );
  }

  return (
    <div className="mt-3 pl-10 space-y-2">
      {(objectives ?? []).map((obj) => (
        <div key={obj.id} className="flex items-start gap-2 group">
          <span className="mt-1 text-xs font-bold shrink-0" style={{ color: 'var(--text-secondary)' }}>•</span>
          {editingId === obj.id ? (
            <div className="flex flex-1 items-center gap-1">
              <input
                autoFocus
                className="flex-1 text-sm rounded-lg px-2 py-1 border outline-none"
                style={{
                  borderColor: 'var(--primary)',
                  color: 'var(--text-primary)',
                  backgroundColor: 'var(--bg)',
                }}
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                onBlur={() => commitEdit(obj.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') commitEdit(obj.id);
                  if (e.key === 'Escape') setEditingId(null);
                }}
              />
            </div>
          ) : (
            <span
              className="flex-1 text-sm cursor-pointer hover:underline"
              style={{ color: 'var(--text-primary)' }}
              onClick={() => startEdit(obj)}
            >
              {obj.text}
            </span>
          )}
          <button
            onClick={() => deleteObj.mutate(obj.id)}
            className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-red-50"
            title="Delete objective"
          >
            <Trash2 size={13} className="text-red-400" />
          </button>
        </div>
      ))}

      {/* Add objective row */}
      <div className="flex items-center gap-2 mt-2">
        <Plus size={13} style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />
        <input
          className="flex-1 text-sm rounded-lg px-2 py-1 border outline-none"
          style={{
            borderColor: 'var(--border)',
            color: 'var(--text-primary)',
            backgroundColor: 'var(--bg)',
          }}
          placeholder="Add objective..."
          value={addText}
          onChange={(e) => setAddText(e.target.value)}
          onKeyDown={handleAddKeyDown}
          onBlur={submitAdd}
        />
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
const EditCoursePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const { data: course, isLoading, isError } = useCourse(id);
  const updateCourse = useUpdateCourse(id!);
  const deleteCourse = useDeleteCourse();
  const addTopic = useAddTopic(id!);
  const updateTopic = useUpdateTopic(id!);
  const deleteTopic = useDeleteTopic(id!);
  const reorderTopics = useReorderTopics(id!);

  // Course info form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('');
  const [color, setColor] = useState('');
  const [infoSaved, setInfoSaved] = useState(false);

  // Topics local state (for optimistic reorder)
  const [localTopics, setLocalTopics] = useState<CourseTopic[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingTopicId, setEditingTopicId] = useState<string | null>(null);
  const [editingTopicTitle, setEditingTopicTitle] = useState('');
  const [newTopicTitle, setNewTopicTitle] = useState('');

  // Danger zone
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  // Sync form state when course loads
  useEffect(() => {
    if (course) {
      setTitle(course.title);
      setDescription(course.description ?? '');
      setIcon(course.icon ?? '');
      setColor(course.color ?? PALETTE[0]);
      setLocalTopics([...course.topics]);
    }
  }, [course]);

  // ── Info save ──
  function handleSaveInfo() {
    updateCourse.mutate(
      { title: title.trim(), description: description.trim(), icon: icon.trim(), color },
      {
        onSuccess: () => {
          setInfoSaved(true);
          setTimeout(() => setInfoSaved(false), 2000);
        },
      },
    );
  }

  // ── Topic reorder ──
  function moveUp(index: number) {
    if (index === 0) return;
    const next = [...localTopics];
    [next[index - 1], next[index]] = [next[index], next[index - 1]];
    setLocalTopics(next);
    reorderTopics.mutate(next.map((t) => t.id));
  }

  function moveDown(index: number) {
    if (index === localTopics.length - 1) return;
    const next = [...localTopics];
    [next[index], next[index + 1]] = [next[index + 1], next[index]];
    setLocalTopics(next);
    reorderTopics.mutate(next.map((t) => t.id));
  }

  // ── Topic title edit ──
  function startEditTopic(topic: CourseTopic) {
    setEditingTopicId(topic.id);
    setEditingTopicTitle(topic.title);
  }

  function commitTopicEdit(topicId: string) {
    const trimmed = editingTopicTitle.trim();
    if (trimmed) {
      updateTopic.mutate(
        { topicId, title: trimmed },
        {
          onSuccess: () => {
            setLocalTopics((prev) =>
              prev.map((t) => (t.id === topicId ? { ...t, title: trimmed } : t)),
            );
          },
        },
      );
    }
    setEditingTopicId(null);
  }

  // ── Topic delete ──
  function handleDeleteTopic(topicId: string) {
    deleteTopic.mutate(topicId, {
      onSuccess: () => setLocalTopics((prev) => prev.filter((t) => t.id !== topicId)),
    });
  }

  // ── Add topic ──
  function handleAddTopic() {
    const trimmed = newTopicTitle.trim();
    if (!trimmed) return;
    addTopic.mutate(trimmed, {
      onSuccess: (newTopic) => {
        setLocalTopics((prev) => [...prev, newTopic]);
        setNewTopicTitle('');
      },
    });
  }

  // ── Delete course ──
  function handleDeleteCourse() {
    if (!course || deleteConfirmText !== course.title) return;
    deleteCourse.mutate(id!, {
      onSuccess: () => navigate('/courses'),
    });
  }

  if (isLoading) {
    return (
      <div style={{ backgroundColor: 'var(--bg)', minHeight: '100vh' }}>
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} onNewCourse={() => setModalOpen(true)} />
        <div className="lg:pl-60 flex flex-col min-h-screen">
          <TopBar onCreateNew={() => setModalOpen(true)} onMenuToggle={() => setSidebarOpen(true)} />
          <div className="flex items-center justify-center py-24">
            <Loader2 size={28} className="animate-spin" style={{ color: 'var(--primary)' }} />
          </div>
        </div>
        <CreateCourseModal open={modalOpen} onClose={() => setModalOpen(false)} />
      </div>
    );
  }

  if (isError || !course) {
    return (
      <div style={{ backgroundColor: 'var(--bg)', minHeight: '100vh' }}>
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} onNewCourse={() => setModalOpen(true)} />
        <div className="lg:pl-60 flex flex-col min-h-screen">
          <TopBar onCreateNew={() => setModalOpen(true)} onMenuToggle={() => setSidebarOpen(true)} />
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-base font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Course not found.</p>
            <Link to="/courses" className="text-sm font-medium hover:opacity-70" style={{ color: 'var(--primary)' }}>
              Back to My Courses
            </Link>
          </div>
        </div>
        <CreateCourseModal open={modalOpen} onClose={() => setModalOpen(false)} />
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: 'var(--bg)', minHeight: '100vh' }}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} onNewCourse={() => setModalOpen(true)} />

      <div className="lg:pl-60 flex flex-col min-h-screen">
        <TopBar onCreateNew={() => setModalOpen(true)} onMenuToggle={() => setSidebarOpen(true)} />

        <main className="flex-1 p-6 lg:p-8 max-w-3xl">
          {/* Back */}
          <button
            onClick={() => navigate(`/courses/${id}`)}
            className="flex items-center gap-1.5 text-sm font-medium mb-6 transition-opacity hover:opacity-70"
            style={{ color: 'var(--primary)' }}
          >
            <ArrowLeft size={16} />
            Back to Course
          </button>

          <h1
            className="text-2xl font-bold mb-6"
            style={{ fontFamily: 'Archivo Black, sans-serif', color: 'var(--text-primary)' }}
          >
            Edit Course
          </h1>

          {/* ── Section 1: Course Info ── */}
          <section
            className="rounded-2xl border p-6 mb-6"
            style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
          >
            <h2 className="text-base font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
              Course Info
            </h2>

            <div className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                  Title
                </label>
                <input
                  className="w-full rounded-xl px-3 py-2.5 text-sm border outline-none transition-colors focus:border-[var(--primary)]"
                  style={{
                    borderColor: 'var(--border)',
                    color: 'var(--text-primary)',
                    backgroundColor: 'var(--bg)',
                  }}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                  Description
                </label>
                <textarea
                  rows={3}
                  className="w-full rounded-xl px-3 py-2.5 text-sm border outline-none resize-none transition-colors focus:border-[var(--primary)]"
                  style={{
                    borderColor: 'var(--border)',
                    color: 'var(--text-primary)',
                    backgroundColor: 'var(--bg)',
                  }}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              {/* Icon + Color row */}
              <div className="flex flex-wrap gap-6 items-end">
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                    Icon (emoji)
                  </label>
                  <input
                    className="w-16 rounded-xl px-3 py-2.5 text-lg text-center border outline-none transition-colors focus:border-[var(--primary)]"
                    style={{
                      borderColor: 'var(--border)',
                      backgroundColor: 'var(--bg)',
                    }}
                    value={icon}
                    maxLength={2}
                    onChange={(e) => setIcon(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                    Color
                  </label>
                  <div className="flex gap-2">
                    {PALETTE.map((c) => (
                      <button
                        key={c}
                        onClick={() => setColor(c)}
                        className="w-7 h-7 rounded-full border-2 transition-transform hover:scale-110"
                        style={{
                          backgroundColor: c,
                          borderColor: color === c ? 'var(--text-primary)' : 'transparent',
                        }}
                        title={c}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-5">
              <button
                onClick={handleSaveInfo}
                disabled={updateCourse.isPending}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-opacity disabled:opacity-60"
                style={{ backgroundColor: 'var(--primary)' }}
              >
                {updateCourse.isPending ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : null}
                Save Changes
              </button>
              {infoSaved && (
                <span className="flex items-center gap-1 text-sm font-medium text-emerald-500">
                  <Check size={14} /> Saved
                </span>
              )}
            </div>
          </section>

          {/* ── Section 2: Topics ── */}
          <section
            className="rounded-2xl border p-6 mb-6"
            style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
                Topics
              </h2>
            </div>

            <div className="space-y-2">
              {localTopics.map((topic, index) => {
                const isExpanded = expandedId === topic.id;
                const isEditing = editingTopicId === topic.id;

                return (
                  <div
                    key={topic.id}
                    className="rounded-xl border overflow-hidden"
                    style={{ borderColor: 'var(--border)' }}
                  >
                    {/* Row header */}
                    <div
                      className="flex items-center gap-2 px-3 py-2.5"
                      style={{ backgroundColor: 'var(--bg)' }}
                    >
                      {/* Order buttons */}
                      <div className="flex flex-col gap-0.5 shrink-0">
                        <button
                          onClick={() => moveUp(index)}
                          disabled={index === 0}
                          className="w-5 h-4 flex items-center justify-center rounded text-xs disabled:opacity-20 hover:bg-black/5"
                          style={{ color: 'var(--text-secondary)' }}
                          title="Move up"
                        >
                          ▲
                        </button>
                        <button
                          onClick={() => moveDown(index)}
                          disabled={index === localTopics.length - 1}
                          className="w-5 h-4 flex items-center justify-center rounded text-xs disabled:opacity-20 hover:bg-black/5"
                          style={{ color: 'var(--text-secondary)' }}
                          title="Move down"
                        >
                          ▼
                        </button>
                      </div>

                      {/* Number badge */}
                      <span
                        className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                        style={{ backgroundColor: `${color}18`, color }}
                      >
                        {index + 1}
                      </span>

                      {/* Title / edit input */}
                      {isEditing ? (
                        <input
                          autoFocus
                          className="flex-1 text-sm rounded-lg px-2 py-1 border outline-none"
                          style={{
                            borderColor: 'var(--primary)',
                            color: 'var(--text-primary)',
                            backgroundColor: 'var(--card)',
                          }}
                          value={editingTopicTitle}
                          onChange={(e) => setEditingTopicTitle(e.target.value)}
                          onBlur={() => commitTopicEdit(topic.id)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') commitTopicEdit(topic.id);
                            if (e.key === 'Escape') setEditingTopicId(null);
                          }}
                        />
                      ) : (
                        <span
                          className="flex-1 text-sm font-medium cursor-pointer hover:underline"
                          style={{ color: 'var(--text-primary)' }}
                          onClick={() => startEditTopic(topic)}
                          title="Click to rename"
                        >
                          {topic.title}
                        </span>
                      )}

                      {/* Expand + delete */}
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : topic.id)}
                        className="p-1 rounded hover:bg-black/5 shrink-0"
                        title="Show objectives"
                      >
                        {isExpanded
                          ? <ChevronDown size={16} style={{ color: 'var(--text-secondary)' }} />
                          : <ChevronRight size={16} style={{ color: 'var(--text-secondary)' }} />}
                      </button>
                      <button
                        onClick={() => handleDeleteTopic(topic.id)}
                        className="p-1 rounded hover:bg-red-50 shrink-0"
                        title="Delete topic"
                      >
                        <Trash2 size={15} className="text-red-400" />
                      </button>
                    </div>

                    {/* Objectives */}
                    {isExpanded && (
                      <div
                        className="px-3 pb-3"
                        style={{ backgroundColor: 'var(--card)' }}
                      >
                        <TopicObjectivesSection courseId={id!} topicId={topic.id} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Add topic row */}
            <div className="flex items-center gap-2 mt-4">
              <input
                className="flex-1 rounded-xl px-3 py-2.5 text-sm border outline-none transition-colors focus:border-[var(--primary)]"
                style={{
                  borderColor: 'var(--border)',
                  color: 'var(--text-primary)',
                  backgroundColor: 'var(--bg)',
                }}
                placeholder="New topic title..."
                value={newTopicTitle}
                onChange={(e) => setNewTopicTitle(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleAddTopic(); }}
              />
              <button
                onClick={handleAddTopic}
                disabled={!newTopicTitle.trim() || addTopic.isPending}
                className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity disabled:opacity-50"
                style={{ backgroundColor: 'var(--primary)' }}
              >
                {addTopic.isPending ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                Add
              </button>
            </div>
          </section>

          {/* ── Section 3: Danger Zone ── */}
          <section
            className="rounded-2xl border p-6"
            style={{ borderColor: '#FCA5A5' }}
          >
            <h2 className="text-base font-semibold mb-1" style={{ color: '#DC2626' }}>
              Danger Zone
            </h2>
            <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
              Permanently deletes this course, all its topics, objectives, and your progress.
            </p>

            {!showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="px-4 py-2 rounded-xl text-sm font-semibold border border-red-400 text-red-500 hover:bg-red-50 transition-colors"
              >
                Delete Course
              </button>
            ) : (
              <div className="space-y-3">
                <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                  Type <strong>{course.title}</strong> to confirm deletion:
                </p>
                <input
                  autoFocus
                  className="w-full rounded-xl px-3 py-2.5 text-sm border outline-none transition-colors focus:border-red-400"
                  style={{
                    borderColor: 'var(--border)',
                    color: 'var(--text-primary)',
                    backgroundColor: 'var(--bg)',
                  }}
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder={course.title}
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleDeleteCourse}
                    disabled={deleteConfirmText !== course.title || deleteCourse.isPending}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-red-500 hover:bg-red-600 transition-colors disabled:opacity-50"
                  >
                    {deleteCourse.isPending ? <Loader2 size={14} className="animate-spin" /> : null}
                    Delete
                  </button>
                  <button
                    onClick={() => { setShowDeleteConfirm(false); setDeleteConfirmText(''); }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold border transition-colors hover:bg-black/5"
                    style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
                  >
                    <X size={14} />
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </section>
        </main>
      </div>

      <CreateCourseModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
};

export default EditCoursePage;
