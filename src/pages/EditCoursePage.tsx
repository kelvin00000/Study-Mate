import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Loader2, ChevronDown, ChevronRight,
  Trash2, Plus, Check, X, Menu,
} from 'lucide-react';
import { Sidebar } from '../components/dashboard/Sidebar';
import { CreateCourseModal } from '../components/dashboard/CreateCourseModal';
import { QueryErrorState } from '../components/QueryErrorState';
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
        <Loader2 size={16} className="animate-spin text-moderate-green" />
      </div>
    );
  }

  return (
    <div className="mt-3 pl-10 space-y-2">
      {(objectives ?? []).map((obj) => (
        <div key={obj.id} className="flex items-start gap-2 group">
          <span className="mt-1 text-xs font-bold shrink-0 text-moderate-green/70">•</span>
          {editingId === obj.id ? (
            <div className="flex flex-1 items-center gap-1">
              <input
                autoFocus
                className="flex-1 text-sm rounded-lg px-2 py-1 border outline-none border-moderate-green text-deep-bluish bg-light-cream"
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
              className="flex-1 text-sm cursor-pointer hover:underline text-deep-bluish"
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
        <Plus size={13} className="text-moderate-green/70 shrink-0" />
        <input
          className="flex-1 text-sm rounded-lg px-2 py-1 border outline-none border-laurel-green/20 text-deep-bluish bg-light-cream focus:border-moderate-green"
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

  // Ref to skip topic sync after reorder (prevents useEffect from reverting optimistic state)
  const skipTopicSync = useRef(false);

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
      if (skipTopicSync.current) {
        skipTopicSync.current = false;
      } else {
        setLocalTopics([...course.topics]);
      }
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
    skipTopicSync.current = true;
    reorderTopics.mutate(next.map((t) => t.id));
  }

  function moveDown(index: number) {
    if (index === localTopics.length - 1) return;
    const next = [...localTopics];
    [next[index], next[index + 1]] = [next[index + 1], next[index]];
    setLocalTopics(next);
    skipTopicSync.current = true;
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
      <div className="bg-light-cream min-h-screen">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} onNewCourse={() => setModalOpen(true)} />
        <div className="lg:pl-60 flex flex-col min-h-screen">
          <div className="lg:hidden flex items-center px-4 py-3">
            <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors">
              <Menu size={20} />
            </button>
          </div>
          <div className="flex items-center justify-center py-24">
            <Loader2 size={28} className="animate-spin text-moderate-green" />
          </div>
        </div>
        <CreateCourseModal open={modalOpen} onClose={() => setModalOpen(false)} />
      </div>
    );
  }

  if (isError || !course) {
    return (
      <div className="bg-light-cream min-h-screen">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} onNewCourse={() => setModalOpen(true)} />
        <div className="lg:pl-60 flex flex-col min-h-screen">
          <div className="lg:hidden flex items-center px-4 py-3">
            <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors">
              <Menu size={20} />
            </button>
          </div>
          <QueryErrorState
            title="Couldn't load course"
            message="This course may not exist or the server is temporarily unavailable."
            onRetry={() => window.location.reload()}
            backTo="/courses"
            backLabel="Back to My Courses"
          />
        </div>
        <CreateCourseModal open={modalOpen} onClose={() => setModalOpen(false)} />
      </div>
    );
  }

  return (
    <div className="bg-light-cream min-h-screen">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} onNewCourse={() => setModalOpen(true)} />

      <div className="lg:pl-60 flex flex-col min-h-screen">
        <div className="lg:hidden flex items-center px-4 py-3">
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors">
            <Menu size={20} />
          </button>
        </div>

        <main className="flex-1 px-4 py-5 sm:p-6 lg:p-8 max-w-3xl">
          {/* Back */}
          <button
            className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-105 cursor-pointer shadow-md bg-white border border-laurel-green/30 mb-6"
            onClick={() => navigate(`/courses/${id}`)}
          >
            <ArrowLeft size={18} className="text-moderate-green" />
          </button>

          <h1 className="text-2xl font-bold mb-6 text-deep-bluish">
            Edit Course
          </h1>

          {/* ── Section 1: Course Info ── */}
          <section className="rounded-2xl border border-laurel-green/20 bg-white p-4 sm:p-6 mb-6">
            <h2 className="text-base font-semibold mb-4 text-deep-bluish">
              Course Info
            </h2>

            <div className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-xs font-medium mb-1.5 text-moderate-green/70">
                  Title
                </label>
                <input
                  className="w-full rounded-xl px-3 py-2.5 text-sm border outline-none transition-colors border-laurel-green/20 text-deep-bluish bg-light-cream focus:border-moderate-green"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-medium mb-1.5 text-moderate-green/70">
                  Description
                </label>
                <textarea
                  rows={3}
                  className="w-full rounded-xl px-3 py-2.5 text-sm border outline-none resize-none transition-colors border-laurel-green/20 text-deep-bluish bg-light-cream focus:border-moderate-green"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              {/* Icon + Color row */}
              <div className="flex flex-wrap gap-6 items-end">
                <div>
                  <label className="block text-xs font-medium mb-1.5 text-moderate-green/70">
                    Icon (emoji)
                  </label>
                  <input
                    className="w-16 rounded-xl px-3 py-2.5 text-lg text-center border outline-none transition-colors border-laurel-green/20 bg-light-cream focus:border-moderate-green"
                    value={icon}
                    maxLength={2}
                    onChange={(e) => setIcon(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5 text-moderate-green/70">
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
                          borderColor: color === c ? '#0D3A35' : 'transparent',
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
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-opacity disabled:opacity-60 bg-deep-bluish"
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
          <section className="rounded-2xl border border-laurel-green/20 bg-white p-4 sm:p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-deep-bluish">
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
                    className="rounded-xl border border-laurel-green/20 overflow-hidden"
                  >
                    {/* Row header */}
                    <div
                      className="flex items-center gap-2 px-3 py-2.5 bg-light-cream"
                    >
                      {/* Order buttons */}
                      <div className="flex flex-col gap-0.5 shrink-0">
                        <button
                          onClick={() => moveUp(index)}
                          disabled={index === 0}
                          className="w-5 h-4 flex items-center justify-center rounded text-xs disabled:opacity-20 hover:bg-black/5 text-moderate-green/70"
                          title="Move up"
                        >
                          ▲
                        </button>
                        <button
                          onClick={() => moveDown(index)}
                          disabled={index === localTopics.length - 1}
                          className="w-5 h-4 flex items-center justify-center rounded text-xs disabled:opacity-20 hover:bg-black/5 text-moderate-green/70"
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
                          className="flex-1 text-sm rounded-lg px-2 py-1 border outline-none border-moderate-green text-deep-bluish bg-white"
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
                          className="flex-1 text-sm font-medium cursor-pointer hover:underline text-deep-bluish"
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
                          ? <ChevronDown size={16} className="text-moderate-green/70" />
                          : <ChevronRight size={16} className="text-moderate-green/70" />}
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
                      <div className="px-3 pb-3 bg-white">
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
                className="flex-1 rounded-xl px-3 py-2.5 text-sm border outline-none transition-colors border-laurel-green/20 text-deep-bluish bg-light-cream focus:border-moderate-green"
                placeholder="New topic title..."
                value={newTopicTitle}
                onChange={(e) => setNewTopicTitle(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleAddTopic(); }}
              />
              <button
                onClick={handleAddTopic}
                disabled={!newTopicTitle.trim() || addTopic.isPending}
                className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity disabled:opacity-50 bg-deep-bluish"
              >
                {addTopic.isPending ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                Add
              </button>
            </div>
          </section>

          {/* ── Section 3: Danger Zone ── */}
          <section className="rounded-2xl border border-red-300 bg-white p-4 sm:p-6">
            <h2 className="text-base font-semibold mb-1" style={{ color: '#DC2626' }}>
              Danger Zone
            </h2>
            <p className="text-sm mb-4 text-moderate-green/70">
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
                <p className="text-sm font-medium text-deep-bluish">
                  Type <strong>{course.title}</strong> to confirm deletion:
                </p>
                <input
                  autoFocus
                  className="w-full rounded-xl px-3 py-2.5 text-sm border outline-none transition-colors border-laurel-green/20 text-deep-bluish bg-light-cream focus:border-red-400"
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
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold border border-laurel-green/20 text-moderate-green/70 transition-colors hover:bg-black/5"
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
