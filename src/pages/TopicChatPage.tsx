import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  Send,
  CheckCircle2,
  Loader2,
  BookOpen,
  Target,
  Circle,
  X,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Sidebar } from "../components/dashboard/Sidebar";
import { TopBar } from "../components/dashboard/TopBar";
import { CreateCourseModal } from "../components/dashboard/CreateCourseModal";
import { useCourse } from "../hooks/useCourses";
import { useTopicChat, type Message } from "../hooks/useTopicChat";
import { getOverview } from "../lib/overviewCache";
import {
  useObjectives,
  useGenerateObjectives,
  useEvaluateObjectives,
} from "../hooks/useObjectives";
import type { LearningObjective } from "../api/objectives";
import { useChatHistory } from "../hooks/useChatHistory";
import { useUserPreferences } from "../hooks/useUserPreferences";
import { MarkdownMessage } from "../components/MarkdownMessage";

// ── Typing indicator ───────────────────────────────────────────────────────
const TypingDots = () => (
  <div className="flex items-center gap-1 px-4 py-3">
    {[0, 1, 2].map((i) => (
      <span
        key={i}
        className="w-2 h-2 rounded-full animate-bounce"
        style={{
          backgroundColor: "var(--primary)",
          animationDelay: `${i * 0.15}s`,
          opacity: 0.6,
        }}
      />
    ))}
  </div>
);

// ── Main page ──────────────────────────────────────────────────────────────
const TopicChatPage = () => {
  const { courseId, topicIndex } = useParams<{
    courseId: string;
    topicIndex: string;
  }>();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [showMobileObjectives, setShowMobileObjectives] = useState(false);
  const [overview, setOverview] = useState<string>("");
  const [overviewStreaming, setOverviewStreaming] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [activeInterest, setActiveInterest] = useState<string | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { sendMessage } = useTopicChat();

  const { data: course, isLoading: courseLoading } = useCourse(courseId);
  const topicIdx = Number(topicIndex ?? "0");
  const topic = course?.topics.find((t) => t.order === topicIdx);
  const topicName = topic?.title ?? "";

  // ── User interests for re-explain feature ────────────────────────────────
  const { data: preferences } = useUserPreferences();
  const interests = preferences?.interests ?? [];

  // ── Chat history ─────────────────────────────────────────────────────────
  const historyQuery = useChatHistory(topic?.id);
  const historySeeded = useRef(false);
  useEffect(() => {
    if (!historyQuery.data || historySeeded.current) return;
    historySeeded.current = true;
    setMessages(historyQuery.data);
  }, [historyQuery.data]);

  // ── Objectives hooks ─────────────────────────────────────────────────────
  const objectivesQuery = useObjectives(courseId, topic?.id);
  const generateObjectives = useGenerateObjectives(courseId, topic?.id);
  const evaluateObjectives = useEvaluateObjectives(courseId, topic?.id);

  const objectivesData: LearningObjective[] = objectivesQuery.data ?? [];
  const coveredCount = objectivesData.filter((o) => o.covered).length;
  const allCovered = objectivesData.length > 0 && coveredCount === objectivesData.length;

  const objectivesLoading =
    objectivesQuery.isLoading || generateObjectives.isPending;

  // ── Reset objectives when returning from a failed quiz ───────────────────
  const resetRef = useRef(false);
  useEffect(() => {
    if (!location.state?.resetObjectives || resetRef.current || !topic) return;
    resetRef.current = true;
    queryClient.setQueryData(
      ["objectives", courseId, topic.id],
      (prev: LearningObjective[] | undefined) =>
        prev?.map((o) => ({ ...o, covered: false }))
    );
  }, [location.state?.resetObjectives, topic, courseId, queryClient]);

  // ── Auto-generate objectives when none exist yet ─────────────────────────
  const objectivesGenRef = useRef(false);
  useEffect(() => {
    if (
      !course ||
      !topic ||
      !objectivesQuery.isSuccess ||
      objectivesGenRef.current
    )
      return;
    objectivesGenRef.current = true;
    if (objectivesQuery.data.length === 0) {
      generateObjectives.mutate({
        courseTitle: course.title,
        topicTitle: topic.title,
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [objectivesQuery.isSuccess, objectivesQuery.data?.length, course, topic]);

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingContent, scrollToBottom]);

  // ── handleStream: returns full AI text on completion ─────────────────────
  const handleStream = useCallback(
    async (
      history: Message[],
      save?: { topicId: string; userMessage: string }
    ): Promise<string> => {
      if (!course || !topicName) return "";
      setStreaming(true);
      setStreamingContent("");

      return new Promise<string>((resolve) => {
        sendMessage(
          history,
          course.title,
          topicName,
          (delta) => setStreamingContent((prev) => prev + delta),
          (fullText) => {
            setMessages((prev) => [
              ...prev,
              { role: "assistant", content: fullText },
            ]);
            setStreamingContent("");
            setStreaming(false);
            resolve(fullText);
          },
          save
        ).catch(() => {
          setStreamingContent("");
          setStreaming(false);
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content: "Sorry, I ran into an issue. Please try again.",
            },
          ]);
          resolve("");
        });
      });
    },
    [course, topicName, sendMessage]
  );

  // ── Overview seed (runs once on mount) ───────────────────────────────────
  const seededRef = useRef(false);
  useEffect(() => {
    if (!course || !topicName || !topic || seededRef.current) return;
    seededRef.current = true;

    const cached = getOverview(course.id, topic.id);
    if (cached) {
      setOverview(cached);
    } else {
      setOverviewStreaming(true);
      const prompt: Message = {
        role: "user",
        content: `Give a welcoming introduction to "${topicName}" as part of the "${course.title}" course. Explain what it is, why it matters, and the key concepts we'll explore together. Keep it encouraging and under 200 words.`,
      };
      let accumulated = "";
      sendMessage(
        [prompt],
        course.title,
        topicName,
        (delta) => {
          accumulated += delta;
          setOverview(accumulated);
        },
        (fullText) => {
          setOverview(fullText);
          setOverviewStreaming(false);
        }
      ).catch(() => setOverviewStreaming(false));
    }
  }, [course, topicName, topic, sendMessage]);

  // ── Evaluate objectives after AI response ────────────────────────────────
  const runEvaluate = useCallback(
    (updatedMessages: Message[], aiResponse: string) => {
      if (!aiResponse || objectivesData.length === 0) return;
      evaluateObjectives.mutate({
        messages: [...updatedMessages, { role: "assistant", content: aiResponse }],
        objectiveTexts: objectivesData.map((o) => o.text),
      });
    },
    [objectivesData, evaluateObjectives]
  );

  // ── Submit chat message ───────────────────────────────────────────────────
  const submit = async (overrideText?: string) => {
    const text = (overrideText ?? input).trim();
    if (!text || streaming || !course) return;

    if (!overrideText) {
      setInput("");
      if (textareaRef.current) textareaRef.current.style.height = "auto";
    }

    const userMsg: Message = { role: "user", content: text };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);

    const contextSeed: Message[] = overview
      ? [
          {
            role: "user",
            content: `Introduce the topic "${topicName}" from the "${course.title}" course.`,
          },
          { role: "assistant", content: overview },
        ]
      : [];

    const interestSeed: Message[] = activeInterest
      ? [
          {
            role: "user",
            content: `For all your explanations in this session, please use ${activeInterest} as your primary lens — frame concepts with analogies and examples drawn from ${activeInterest}.`,
          },
          {
            role: "assistant",
            content: `Got it! I'll use ${activeInterest} to make every concept more relatable throughout our session.`,
          },
        ]
      : [];

    const save = topic ? { topicId: topic.id, userMessage: text } : undefined;
    const aiResponse = await handleStream([...contextSeed, ...interestSeed, ...updatedMessages], save);
    runEvaluate(updatedMessages, aiResponse);
  };

  // ── "Ask AI" shortcut from objectives panel ───────────────────────────────
  const askAboutObjective = useCallback(
    async (objectiveText: string) => {
      if (streaming || !course) return;
      scrollToBottom();
      await submit(`Please explain this concept in detail: "${objectiveText}"`);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [streaming, course, topic, messages, overview, topicName, handleStream, objectivesData]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = `${Math.min(e.target.scrollHeight, 160)}px`;
  };

  const handleTakeQuiz = () => {
    navigate(`/courses/${courseId}/topics/${topicIndex}/quiz`, {
      state: {
        messages,
        objectives: objectivesData,
        topicId: topic?.id,
        courseTitle: course?.title,
        topicTitle: topic?.title,
        courseColor: course?.color,
      },
    });
  };

  // ── Loading / error states ────────────────────────────────────────────────
  if (courseLoading) {
    return (
      <div
        className="flex items-center justify-center min-h-screen"
        style={{ backgroundColor: "var(--bg)" }}
      >
        <Loader2
          size={28}
          className="animate-spin"
          style={{ color: "var(--primary)" }}
        />
      </div>
    );
  }

  if (!course || !topic) {
    return (
      <div
        className="flex items-center justify-center min-h-screen"
        style={{ backgroundColor: "var(--bg)" }}
      >
        <p style={{ color: "var(--text-secondary)" }}>Topic not found.</p>
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={{ backgroundColor: "var(--bg)" }} className="h-screen overflow-hidden">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onNewCourse={() => setModalOpen(true)}
      />

      <div className="lg:pl-60 flex flex-col h-full">
        <TopBar
          onCreateNew={() => setModalOpen(true)}
          onMenuToggle={() => setSidebarOpen(true)}
        />

        <main className="flex-1 flex overflow-hidden min-h-0">
          {/* ── Left: chat column ── */}
          <div className="flex-1 flex flex-col overflow-hidden min-w-0 min-h-0">
            {/* Header */}
            <div
              className="px-6 lg:px-8 py-4 border-b flex items-center justify-between gap-3 shrink-0"
              style={{
                backgroundColor: "var(--card)",
                borderColor: "var(--border)",
              }}
            >
              <div className="flex items-center gap-3 min-w-0">
                <button
                  onClick={() => navigate(`/courses/${courseId}`)}
                  className="flex items-center gap-1.5 text-sm font-medium transition-opacity hover:opacity-70 shrink-0"
                  style={{ color: "var(--primary)" }}
                >
                  <ArrowLeft size={16} />
                  Back
                </button>
                <div
                  className="w-px h-5 shrink-0"
                  style={{ backgroundColor: "var(--border)" }}
                />
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-lg shrink-0" style={{ lineHeight: 1 }}>
                    {course.icon}
                  </span>
                  <div className="min-w-0">
                    <p
                      className="text-xs font-medium truncate"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {course.title}
                    </p>
                    <p
                      className="text-sm font-semibold truncate"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {topicName}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {/* Mobile: objectives count chip */}
                {!objectivesLoading && objectivesData.length > 0 && (
                  <button
                    onClick={() => setShowMobileObjectives(true)}
                    className="lg:hidden flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg"
                    style={{
                      backgroundColor: "var(--secondary)",
                      color: "var(--primary)",
                    }}
                  >
                    <Target size={12} />
                    {coveredCount}/{objectivesData.length}
                  </button>
                )}

                {/* Completed badge */}
                {topic.completed && (
                  <div
                    className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg"
                    style={{
                      backgroundColor: `${course.color}18`,
                      color: course.color,
                    }}
                  >
                    <CheckCircle2 size={14} />
                    Completed
                  </div>
                )}
              </div>
            </div>

            {/* Message list */}
            <div className="flex-1 overflow-y-auto px-4 lg:px-8 py-6 space-y-4">
              {historyQuery.isLoading && (
                <div className="flex justify-center py-4">
                  <Loader2 size={18} className="animate-spin" style={{ color: "var(--primary)", opacity: 0.4 }} />
                </div>
              )}
              {(overview || overviewStreaming) && (
                <OverviewCard
                  content={overview}
                  streaming={overviewStreaming}
                  courseColor={course.color}
                  topicName={topicName}
                />
              )}

              {messages.map((msg, i) => (
                <ChatBubble
                  key={i}
                  message={msg}
                  courseColor={course.color}
                  interests={interests}
                  disabled={streaming}
                  onReExplain={(interest) =>
                    submit(`Re-explain that using a ${interest.toLowerCase()} analogy or real-world example.`)
                  }
                />
              ))}

              {streaming && (
                <div className="flex items-start gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0"
                    style={{ backgroundColor: `${course.color}20` }}
                  >
                    {course.icon}
                  </div>
                  <div
                    className="rounded-2xl rounded-tl-sm max-w-[75%] lg:max-w-[60%]"
                    style={{
                      backgroundColor: "var(--card)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    {streamingContent ? (
                      <div className="px-4 py-3">
                        <MarkdownMessage content={streamingContent} isStreaming={true} />
                        <span
                          className="inline-block w-0.5 h-4 ml-0.5 animate-pulse align-middle"
                          style={{ backgroundColor: "var(--primary)" }}
                        />
                      </div>
                    ) : (
                      <TypingDots />
                    )}
                  </div>
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* Input bar */}
            <div
              className="px-4 lg:px-8 py-4 border-t shrink-0"
              style={{
                backgroundColor: "var(--card)",
                borderColor: "var(--border)",
              }}
            >
              <div
                className="flex items-end gap-3 rounded-2xl border px-4 py-3"
                style={{
                  borderColor: "var(--border)",
                  backgroundColor: "var(--bg)",
                }}
              >
                <textarea
                  ref={textareaRef}
                  rows={1}
                  value={input}
                  onChange={handleTextareaChange}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask a question..."
                  disabled={streaming}
                  className="flex-1 resize-none bg-transparent text-sm outline-none leading-relaxed"
                  style={{
                    color: "var(--text-primary)",
                    minHeight: "24px",
                    maxHeight: "160px",
                  }}
                />
                <button
                  onClick={() => submit()}
                  disabled={!input.trim() || streaming}
                  className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-opacity"
                  style={{
                    backgroundColor: "var(--primary)",
                    opacity: !input.trim() || streaming ? 0.4 : 1,
                  }}
                >
                  <Send size={14} color="white" />
                </button>
              </div>
              <p
                className="text-xs text-center mt-2"
                style={{ color: "var(--text-secondary)" }}
              >
                Press Enter to send, Shift+Enter for new line
              </p>

              {/* Interest switcher */}
              <div className="flex items-center gap-2 mt-3 flex-wrap">
                <span className="text-xs shrink-0" style={{ color: "var(--text-secondary)" }}>
                  Explain through:
                </span>
                {interests.length === 0 ? (
                  <span className="text-xs italic" style={{ color: "var(--text-secondary)", opacity: 0.5 }}>
                    No interests set
                  </span>
                ) : (
                  interests.map((interest) => {
                    const active = activeInterest === interest;
                    return (
                      <button
                        key={interest}
                        onClick={() => setActiveInterest(active ? null : interest)}
                        className="text-xs font-semibold px-2.5 py-1 rounded-lg transition-all"
                        style={{
                          backgroundColor: active ? course.color : "var(--secondary)",
                          color: active ? "#fff" : "var(--text-secondary)",
                        }}
                      >
                        {interest}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* ── Right: Objectives panel (desktop) ── */}
          <ObjectivesPanel
            objectives={objectivesData}
            isLoading={objectivesLoading}
            isEvaluating={evaluateObjectives.isPending}
            allCovered={allCovered}
            courseColor={course.color}
            topicCompleted={topic.completed}
            onAskAbout={askAboutObjective}
            onTakeQuiz={handleTakeQuiz}
            className="hidden lg:flex"
          />
        </main>
      </div>

      {/* Mobile objectives overlay */}
      {showMobileObjectives && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowMobileObjectives(false)}
          />
          <div className="absolute right-0 top-0 h-full w-80 shadow-xl">
            <ObjectivesPanel
              objectives={objectivesData}
              isLoading={objectivesLoading}
              isEvaluating={evaluateObjectives.isPending}
              allCovered={allCovered}
              courseColor={course.color}
              topicCompleted={topic.completed}
              onAskAbout={(text) => {
                setShowMobileObjectives(false);
                askAboutObjective(text);
              }}
              onTakeQuiz={() => {
                setShowMobileObjectives(false);
                handleTakeQuiz();
              }}
              onClose={() => setShowMobileObjectives(false)}
              className="flex h-full"
            />
          </div>
        </div>
      )}

      <CreateCourseModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
};

// ── ObjectivesPanel ────────────────────────────────────────────────────────
function ObjectivesPanel({
  objectives,
  isLoading,
  isEvaluating,
  allCovered,
  courseColor,
  topicCompleted,
  onAskAbout,
  onTakeQuiz,
  onClose,
  className = "",
}: {
  objectives: LearningObjective[];
  isLoading: boolean;
  isEvaluating: boolean;
  allCovered: boolean;
  courseColor: string;
  topicCompleted: boolean;
  onAskAbout: (text: string) => void;
  onTakeQuiz: () => void;
  onClose?: () => void;
  className?: string;
}) {
  const coveredCount = objectives.filter((o) => o.covered).length;

  return (
    <div
      className={`w-72 shrink-0 border-l flex-col ${className}`}
      style={{ borderColor: "var(--border)", backgroundColor: "var(--card)" }}
    >
      {/* Panel header */}
      <div
        className="px-4 py-4 border-b shrink-0"
        style={{ borderColor: "var(--border)" }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target size={14} style={{ color: "var(--primary)" }} />
            <span
              className="text-sm font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              Learning Objectives
            </span>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="transition-opacity hover:opacity-60"
              style={{ color: "var(--text-secondary)" }}
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Objectives list */}
      <div className="flex-1 overflow-y-auto px-3 py-3">
        {isLoading ? (
          <div className="flex flex-col gap-2 px-1">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-8 rounded-lg animate-pulse"
                style={{ backgroundColor: "var(--secondary)" }}
              />
            ))}
          </div>
        ) : objectives.length === 0 ? (
          <p
            className="text-xs text-center py-6"
            style={{ color: "var(--text-secondary)" }}
          >
            No objectives yet.
          </p>
        ) : (
          <div className="flex flex-col gap-1">
            {objectives.map((obj) => (
              <ObjectiveRow
                key={obj.id}
                objective={obj}
                isEvaluating={isEvaluating}
                courseColor={courseColor}
                onAskAbout={onAskAbout}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer: count + quiz button */}
      {!isLoading && objectives.length > 0 && (
        <div
          className="px-4 py-3 border-t shrink-0"
          style={{ borderColor: "var(--border)" }}
        >
          <p className="text-xs mb-3" style={{ color: "var(--text-secondary)" }}>
            {coveredCount} of {objectives.length} covered
          </p>
          {!topicCompleted && (
            <button
              onClick={onTakeQuiz}
              disabled={!allCovered}
              className="w-full text-sm font-semibold py-2 rounded-xl transition-opacity"
              style={{
                backgroundColor: allCovered ? courseColor : "var(--secondary)",
                color: allCovered ? "#fff" : "var(--text-secondary)",
                opacity: allCovered ? 1 : 0.6,
                cursor: allCovered ? "pointer" : "not-allowed",
              }}
            >
              Take Quiz →
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ── ObjectiveRow ───────────────────────────────────────────────────────────
function ObjectiveRow({
  objective,
  isEvaluating,
  courseColor,
  onAskAbout,
}: {
  objective: LearningObjective;
  isEvaluating: boolean;
  courseColor: string;
  onAskAbout: (text: string) => void;
}) {
  return (
    <div className="group flex items-start gap-2 px-2 py-2 rounded-lg hover:bg-gray-50 transition-colors">
      <div className="mt-0.5 shrink-0">
        {isEvaluating && !objective.covered ? (
          <Loader2 size={13} className="animate-spin" style={{ color: courseColor }} />
        ) : objective.covered ? (
          <CheckCircle2 size={13} style={{ color: courseColor }} />
        ) : (
          <Circle size={13} style={{ color: "var(--border)" }} />
        )}
      </div>
      <span
        className="flex-1 text-xs leading-relaxed"
        style={{
          color: objective.covered ? "var(--text-primary)" : "var(--text-secondary)",
        }}
      >
        {objective.text}
      </span>
      {!objective.covered && !isEvaluating && (
        <button
          onClick={() => onAskAbout(objective.text)}
          className="opacity-0 group-hover:opacity-100 text-xs font-semibold transition-opacity shrink-0 whitespace-nowrap"
          style={{ color: courseColor }}
        >
          Ask AI →
        </button>
      )}
    </div>
  );
}

// ── OverviewCard ───────────────────────────────────────────────────────────
function OverviewCard({
  content,
  streaming,
  courseColor,
  topicName,
}: {
  content: string;
  streaming: boolean;
  courseColor: string;
  topicName: string;
}) {
  return (
    <div
      className="rounded-2xl border p-5"
      style={{
        backgroundColor: `${courseColor}08`,
        borderColor: `${courseColor}30`,
      }}
    >
      <div className="flex items-center gap-2 mb-3">
        <div
          className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
          style={{ backgroundColor: `${courseColor}20` }}
        >
          <BookOpen size={13} style={{ color: courseColor }} />
        </div>
        <span
          className="text-xs font-bold uppercase tracking-widest"
          style={{ color: courseColor }}
        >
          Overview — {topicName}
        </span>
      </div>
      <MarkdownMessage content={content} />
      {streaming && (
        <span
          className="inline-block w-0.5 h-4 ml-0.5 animate-pulse align-middle"
          style={{ backgroundColor: courseColor }}
        />
      )}
    </div>
  );
}

// ── ChatBubble ─────────────────────────────────────────────────────────────
function ChatBubble({
  message,
  courseColor,
  interests = [],
  disabled = false,
  onReExplain,
}: {
  message: Message;
  courseColor: string;
  interests?: string[];
  disabled?: boolean;
  onReExplain?: (interest: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  if (message.role === "user") {
    return (
      <div className="flex justify-end">
        <div
          className="rounded-2xl rounded-tr-sm px-4 py-3 max-w-[75%] lg:max-w-[60%] text-sm leading-relaxed whitespace-pre-wrap"
          style={{ backgroundColor: courseColor, color: "#fff" }}
        >
          {message.content}
        </div>
      </div>
    );
  }

  const showReExplain = interests.length > 0 && !!onReExplain;

  return (
    <div className="flex items-start gap-3">
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0"
        style={{ backgroundColor: `${courseColor}20` }}
      >
        AI
      </div>
      <div className="flex flex-col gap-1.5 max-w-[75%] lg:max-w-[60%]">
        <div
          className="rounded-2xl rounded-tl-sm px-4 py-3"
          style={{
            backgroundColor: "var(--card)",
            border: "1px solid var(--border)",
            color: "var(--text-primary)",
          }}
        >
          <MarkdownMessage content={message.content} />
        </div>

        {/* Re-explain row */}
        {showReExplain && (
          <div className="flex flex-wrap items-center gap-1.5 px-1">
            {!expanded ? (
              <button
                onClick={() => setExpanded(true)}
                disabled={disabled}
                className="text-xs font-medium transition-opacity hover:opacity-80 disabled:opacity-40"
                style={{ color: "var(--text-secondary)" }}
              >
                Re-explain using… ↓
              </button>
            ) : (
              <>
                <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
                  Re-explain using:
                </span>
                {interests.map((interest) => (
                  <button
                    key={interest}
                    onClick={() => {
                      setExpanded(false);
                      onReExplain(interest);
                    }}
                    disabled={disabled}
                    className="text-xs font-semibold px-2.5 py-1 rounded-lg transition-all hover:opacity-90 disabled:opacity-40"
                    style={{
                      backgroundColor: `${courseColor}15`,
                      color: courseColor,
                      border: `1px solid ${courseColor}30`,
                    }}
                  >
                    {interest}
                  </button>
                ))}
                <button
                  onClick={() => setExpanded(false)}
                  className="text-xs transition-opacity hover:opacity-60"
                  style={{ color: "var(--text-secondary)" }}
                >
                  ✕
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default TopicChatPage;
