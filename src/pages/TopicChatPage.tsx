import React, { useState, useEffect, useLayoutEffect, useRef, useCallback, useMemo } from "react";
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
  Menu,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@clerk/clerk-react";
import { useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "motion/react";
import { Sidebar } from "../components/dashboard/Sidebar";
import { CreateCourseModal } from "../components/dashboard/CreateCourseModal";
import { useCourse } from "../hooks/useCourses";
import { useTopicChat, type Message } from "../hooks/useTopicChat";
import { putTopicOverview } from "../api/courses";
import {
  useObjectives,
  useGenerateObjectives,
  useEvaluateObjectives,
} from "../hooks/useObjectives";
import type { LearningObjective } from "../api/objectives";
import { useChatHistory } from "../hooks/useChatHistory";
import { useUserPreferences } from "../hooks/useUserPreferences";
import { useRecordActivity } from "../hooks/useStreak";
import { MarkdownMessage } from "../components/MarkdownMessage";
import { Colors as C } from "../constants/Color";

// ── Thinking indicator (gentle pulsing dots) ─────────────────────────────────
const ThinkingIndicator = () => (
  <div className="flex items-center gap-1.5 px-1 py-3">
    {[0, 1, 2].map((i) => (
      <span
        key={i}
        className="w-1.5 h-1.5 rounded-full thinking-dot"
        style={{
          backgroundColor: C.inkMuted,
          animationDelay: `${i * 0.2}s`,
        }}
      />
    ))}
  </div>
);

// ── Streaming bubble — splits stable vs in-progress text to avoid flicker ────
const StreamingBubble = React.memo(({ content }: { content: string }) => {
  // Split into completed blocks (double newline) vs the trailing partial line.
  // Only the partial tail re-renders on each delta; completed blocks are stable markdown.
  const { stable, tail } = useMemo(() => {
    if (!content) return { stable: "", tail: "" };
    const lastBreak = content.lastIndexOf("\n\n");
    if (lastBreak === -1) return { stable: "", tail: content };
    return {
      stable: content.slice(0, lastBreak),
      tail: content.slice(lastBreak + 2),
    };
  }, [content]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      {content ? (
        <div style={{ color: C.ink }}>
          {stable && (
            <MarkdownMessage content={stable} isStreaming={true} />
          )}
          {tail && (
            <div className="markdown-message text-sm leading-relaxed">
              <p className="mb-2 last:mb-0 whitespace-pre-wrap">{tail}</p>
            </div>
          )}
          <span
            className="inline-block w-0.5 h-5 ml-0.5 align-middle rounded-full streaming-cursor"
            style={{ backgroundColor: C.inkMid }}
          />
        </div>
      ) : (
        <ThinkingIndicator />
      )}
    </motion.div>
  );
});

// ── Main page ─────────────────────────────────────────────────────────────────
const TopicChatPage = () => {
  const { courseId, topicIndex } = useParams<{
    courseId: string;
    topicIndex: string;
  }>();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [showMobileObjectives, setShowMobileObjectives] = useState(false);
  const [showObjectives, setShowObjectives] = useState(false);
  const [overview, setOverview] = useState<string>("");
  const [overviewStreaming, setOverviewStreaming] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [activeInterest, setActiveInterest] = useState<string | null>(null);
  const [showInterests, setShowInterests] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { sendMessage } = useTopicChat();
  const { mutate: recordActivity } = useRecordActivity();

  const { data: course, isLoading: courseLoading } = useCourse(courseId);
  const topicIdx = Number(topicIndex ?? "0");
  const topic = course?.topics.find((t) => t.order === topicIdx);
  const topicName = topic?.title ?? "";

  const { data: preferences } = useUserPreferences();
  const interests = preferences?.interests ?? [];

  // ── Chat history ──────────────────────────────────────────────────────────
  const historyQuery = useChatHistory(topic?.id);
  const historySeeded = useRef(false);
  useEffect(() => {
    if (!historyQuery.data || historySeeded.current) return;
    historySeeded.current = true;
    setMessages(historyQuery.data);
  }, [historyQuery.data]);

  // Use cached data directly on first render (before seed effect commits)
  const displayMessages =
    !historySeeded.current && historyQuery.data?.length
      ? historyQuery.data
      : messages;

  // ── Objectives hooks ──────────────────────────────────────────────────────
  const objectivesQuery = useObjectives(courseId, topic?.id);
  const generateObjectives = useGenerateObjectives(courseId, topic?.id);
  const evaluateObjectives = useEvaluateObjectives(courseId, topic?.id);

  const objectivesData: LearningObjective[] = objectivesQuery.data ?? [];
  const coveredCount = objectivesData.filter((o) => o.covered).length;
  const allCovered =
    objectivesData.length > 0 && coveredCount === objectivesData.length;
  const objectivesLoading =
    objectivesQuery.isLoading || generateObjectives.isPending;

  // ── Reset objectives on failed quiz return ────────────────────────────────
  const resetRef = useRef(false);
  useEffect(() => {
    if (!location.state?.resetObjectives || resetRef.current || !topic) return;
    resetRef.current = true;
    queryClient.setQueryData(
      ["objectives", courseId, topic.id],
      (prev: LearningObjective[] | undefined) =>
        prev?.map((o) => ({ ...o, covered: false })),
    );
  }, [location.state?.resetObjectives, topic, courseId, queryClient]);

  // ── Auto-generate objectives ──────────────────────────────────────────────
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

  const initialScrollDone = useRef(false);

  // Snap to bottom BEFORE browser paints (no visible scroll)
  useLayoutEffect(() => {
    if (displayMessages.length > 0 && !initialScrollDone.current) {
      initialScrollDone.current = true;
      bottomRef.current?.scrollIntoView({ behavior: "instant" });
    }
  }, [displayMessages]);

  // Smooth-scroll for new messages / streaming after initial load
  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (initialScrollDone.current) {
      scrollToBottom();
    }
  }, [messages, streamingContent, scrollToBottom]);

  // ── handleStream ──────────────────────────────────────────────────────────
  const handleStream = useCallback(
    async (
      history: Message[],
      save?: { topicId: string; userMessage: string },
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
          save,
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
    [course, topicName, sendMessage],
  );

  // ── Overview seed ─────────────────────────────────────────────────────────
  // Read overview from DB (returned with course data) or stream on first visit
  const seededRef = useRef(false);
  if (course && topic && !seededRef.current && topic.overview) {
    seededRef.current = true;
    if (!overview) setOverview(topic.overview);
  }

  // Stream overview only when not in DB (first visit)
  useEffect(() => {
    if (!course || !topicName || !topic || seededRef.current) return;
    seededRef.current = true;
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
      async (fullText) => {
        setOverview(fullText);
        setOverviewStreaming(false);
        // Save overview to DB so it doesn't regenerate
        try {
          const token = await getToken();
          if (token) {
            await putTopicOverview(token, course.id, topic.id, fullText);
            // Update cached course data so next visit reads from DB
            queryClient.setQueryData(
              ["course", course.id],
              (prev: typeof course | undefined) => {
                if (!prev) return prev;
                return {
                  ...prev,
                  topics: prev.topics.map((t) =>
                    t.id === topic.id ? { ...t, overview: fullText } : t,
                  ),
                };
              },
            );
          }
        } catch {
          // Saving failed — overview will regenerate next visit, non-critical
        }
      },
    ).catch(() => setOverviewStreaming(false));
  }, [course, topicName, topic, sendMessage, getToken, queryClient]);

  // ── Evaluate objectives ───────────────────────────────────────────────────
  const runEvaluate = useCallback(
    (updatedMessages: Message[], aiResponse: string) => {
      if (!aiResponse || objectivesData.length === 0) return;
      evaluateObjectives.mutate({
        messages: [
          ...updatedMessages,
          { role: "assistant", content: aiResponse },
        ],
        objectiveTexts: objectivesData.map((o) => o.text),
      });
    },
    [objectivesData, evaluateObjectives],
  );

  // ── Submit ────────────────────────────────────────────────────────────────
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
    const aiResponse = await handleStream(
      [...contextSeed, ...interestSeed, ...updatedMessages],
      save,
    );
    runEvaluate(updatedMessages, aiResponse);
    if (aiResponse && topic) {
      recordActivity({
        type: "chat_message",
        metadata: { topicId: topic.id, courseId },
      });
    }
  };

  const askAboutObjective = useCallback(
    async (objectiveText: string) => {
      if (streaming || !course) return;
      scrollToBottom();
      await submit(`Please explain this concept in detail: "${objectiveText}"`);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      streaming,
      course,
      topic,
      messages,
      overview,
      topicName,
      handleStream,
      objectivesData,
    ],
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

  // ── Loading / error ───────────────────────────────────────────────────────
  if (courseLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-light-cream">
        <Loader2 size={24} className="animate-spin text-moderate-green" />
      </div>
    );
  }
  if (!course || !topic) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-light-cream">
        <p className="text-laurel-green">Topic not found.</p>
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div
      style={{ backgroundColor: C.pageBg }}
      className="h-screen overflow-hidden"
    >
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onNewCourse={() => setModalOpen(true)}
      />

      <div className="lg:pl-60 flex flex-col h-full">
        <main className="flex-1 flex overflow-hidden min-h-0">
          {/* ── Chat column ── */}
          <div className="flex-1 flex flex-col overflow-hidden min-w-0 min-h-0 relative">
            {/* Header — glassmorphism overlay, content scrolls behind */}
            <div className="absolute top-0 left-0 right-0 z-10 px-4 lg:px-6 py-3 bg-light-cream/80 backdrop-blur-md lg:bg-transparent lg:backdrop-blur-none">
              {/* Mobile: left-aligned row */}
              <div className="flex lg:hidden items-center gap-3">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="p-1.5 rounded-lg transition-colors hover:bg-black/5 shrink-0"
                  style={{ color: C.inkMid }}
                >
                  <Menu size={18} />
                </button>
                <button
                  className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 shadow-md"
                  style={{
                    backgroundColor: C.cardBg,
                    border: `1px solid ${C.border}`,
                  }}
                  onClick={() => navigate(`/courses/${courseId}`)}
                >
                  <ArrowLeft size={16} style={{ color: C.inkMid }} />
                </button>
                <div className="flex-1" />
              </div>

              {/* Desktop: back button on left, course title on right */}
              <div className="hidden lg:flex items-center justify-between">
                <button
                  className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-105 cursor-pointer shadow-md"
                  style={{
                    backgroundColor: C.cardBg,
                    border: `1px solid ${C.border}`,
                  }}
                  onClick={() => navigate(`/courses/${courseId}`)}
                >
                  <ArrowLeft size={18} style={{ color: C.inkMid }} />
                </button>
              </div>
            </div>

            {/* Message list — centered column, pt accounts for floating header */}
            <div
              className="flex-1 overflow-y-auto pt-16 pb-8"
              style={{ backgroundColor: C.pageBg }}
            >
              <div className="max-w-3xl mx-auto w-full px-4 lg:px-8 space-y-6">
                {historyQuery.isLoading && (
                  <div className="flex justify-center py-4">
                    <Loader2
                      size={18}
                      className="animate-spin"
                      style={{ color: C.inkMuted }}
                    />
                  </div>
                )}

                {(overview || overviewStreaming) && (
                  <OverviewCard
                    content={overview}
                    streaming={overviewStreaming}
                  />
                )}

                {displayMessages.map((msg, i) => (
                  <ChatBubble
                    key={i}
                    message={msg}
                    courseColor={course.color}
                    interests={interests}
                    disabled={streaming}
                    onReExplain={(interest) =>
                      submit(
                        `Re-explain that using a ${interest.toLowerCase()} analogy or real-world example.`,
                      )
                    }
                  />
                ))}

                {/* Streaming bubble — borderless, no avatar */}
                {streaming && (
                  <StreamingBubble content={streamingContent} />
                )}
                <div
                  ref={bottomRef}
                  style={{ height: streaming ? "40vh" : 0 }}
                  className="transition-[height] duration-300"
                />
              </div>
            </div>

            {/* Mobile floating objectives pill */}
            {!objectivesLoading && objectivesData.length > 0 && !showMobileObjectives && (
              <div className="lg:hidden flex justify-center pb-2 shrink-0">
                <motion.button
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5, type: "spring", damping: 20 }}
                  onClick={() => setShowMobileObjectives(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold shadow-lg cursor-pointer"
                  style={{ backgroundColor: C.accentFill, color: "#FBF6F0" }}
                >
                  <Target size={13} />
                  {coveredCount}/{objectivesData.length} Objectives
                  <ChevronRight size={12} className="-ml-0.5" />
                </motion.button>
              </div>
            )}

            {/* Interest picker — expands upward above input */}
            <AnimatePresence>
              {showInterests && interests.length > 0 && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                  className="overflow-hidden shrink-0 px-4 lg:px-8"
                  style={{ backgroundColor: C.pageBg }}
                >
                  <div className="max-w-3xl mx-auto w-full pb-2">
                    <div
                      className="rounded-2xl border px-4 py-3"
                      style={{ borderColor: C.border, backgroundColor: C.cardBg }}
                    >
                      <p className="text-xs font-semibold mb-2" style={{ color: C.inkMid }}>
                        Explain using analogy from…
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {interests.map((interest, i) => {
                          const active = activeInterest === interest;
                          return (
                            <motion.button
                              key={interest}
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.2, delay: i * 0.04, ease: "easeInOut" }}
                              onClick={() => {
                                setActiveInterest(active ? null : interest);
                                setShowInterests(false);
                              }}
                              className="text-xs font-semibold px-3 py-1.5 rounded-full transition-all cursor-pointer"
                              style={{
                                backgroundColor: active ? C.accentFillMid : C.chipInactive,
                                color: active ? "#FBF6F0" : C.inkMid,
                              }}
                            >
                              {interest}
                            </motion.button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Interest pill + Input bar */}
            <div
              className="px-4 lg:px-8 py-3 shrink-0"
              style={{ backgroundColor: C.pageBg }}
            >
              <div className="max-w-3xl mx-auto w-full flex flex-col gap-2">
                {/* Interest floating pill */}
                {interests.length > 0 && !showInterests && (
                  <div className="flex justify-center">
                    <motion.button
                      initial={{ y: 10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.3, type: "spring", damping: 20 }}
                      onClick={() => setShowInterests(true)}
                      className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold shadow-lg cursor-pointer"
                      style={{
                        backgroundColor: activeInterest ? C.accentFillMid : C.accentFill,
                        color: "#FBF6F0",
                      }}
                    >
                      <Sparkles size={13} />
                      {activeInterest ?? "Interest Lens"}
                      <ChevronRight size={12} className="-ml-0.5 -rotate-90" />
                    </motion.button>
                  </div>
                )}

                {/* Input box */}
                <div
                  className="rounded-2xl border px-4 py-3"
                  style={{ borderColor: C.border, backgroundColor: C.cardBg }}
                >
                  <textarea
                    ref={textareaRef}
                    rows={1}
                    value={input}
                    onChange={handleTextareaChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask a question..."
                    disabled={streaming}
                    className="w-full resize-none bg-transparent text-sm outline-none leading-relaxed"
                    style={{
                      color: C.ink,
                      minHeight: "24px",
                      maxHeight: "160px",
                    }}
                  />
                  <div className="flex items-center mt-2">
                    <div className="flex-1" />
                    <button
                      onClick={() => submit()}
                      disabled={!input.trim() || streaming}
                      className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-opacity"
                      style={{
                        backgroundColor: C.accentFill,
                        opacity: !input.trim() || streaming ? 0.3 : 1,
                      }}
                    >
                      <Send size={14} color="#FBF6F0" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Objectives panel (desktop) ── */}
          <AnimatePresence mode="wait">
            {showObjectives && (
              <motion.div
                key="objectives-panel"
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 288, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="hidden lg:block shrink-0 overflow-hidden"
              >
                <ObjectivesPanel
                  objectives={objectivesData}
                  isLoading={objectivesLoading}
                  isEvaluating={evaluateObjectives.isPending}
                  allCovered={allCovered}
                  topicCompleted={topic.completed}
                  onAskAbout={askAboutObjective}
                  onTakeQuiz={handleTakeQuiz}
                  onCollapse={() => setShowObjectives(false)}
                  className="flex h-full"
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Floating objectives pill (desktop, when panel hidden) */}
          <AnimatePresence>
            {!showObjectives &&
              !objectivesLoading &&
              objectivesData.length > 0 && (
                <motion.button
                  key="objectives-pill"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  onClick={() => setShowObjectives(true)}
                  className="hidden lg:flex fixed bottom-6 right-6 items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold shadow-lg hover:scale-105 z-30 cursor-pointer"
                  style={{ backgroundColor: C.accentFill, color: "#FBF6F0" }}
                >
                  <Target size={14} />
                  {coveredCount}/{objectivesData.length} Objectives
                </motion.button>
              )}
          </AnimatePresence>
        </main>
      </div>

      {/* Mobile objectives bottom sheet */}
      <AnimatePresence>
        {showMobileObjectives && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-black/30"
              onClick={() => setShowMobileObjectives(false)}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              drag="y"
              dragConstraints={{ top: 0 }}
              dragElastic={0.1}
              onDragEnd={(_, info) => {
                if (info.offset.y > 100 || info.velocity.y > 500) {
                  setShowMobileObjectives(false);
                }
              }}
              className="absolute bottom-0 left-0 right-0 rounded-t-2xl overflow-hidden shadow-2xl"
              style={{ maxHeight: "85vh", backgroundColor: C.pageBg }}
            >
              {/* Drag handle */}
              <div className="flex justify-center pt-3 pb-1 cursor-grab active:cursor-grabbing">
                <div className="w-10 h-1 rounded-full bg-[rgba(177,183,171,0.4)]" />
              </div>
              <ObjectivesPanel
                objectives={objectivesData}
                isLoading={objectivesLoading}
                isEvaluating={evaluateObjectives.isPending}
                allCovered={allCovered}
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
                className="flex"
                isBottomSheet
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <CreateCourseModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
};



// ── ObjectivesPanel ───────────────────────────────────────────────────────────
function ObjectivesPanel({
  objectives,
  isLoading,
  isEvaluating,
  allCovered,
  topicCompleted,
  onAskAbout,
  onTakeQuiz,
  onClose,
  onCollapse,
  className = "",
  isBottomSheet = false,
}: {
  objectives: LearningObjective[];
  isLoading: boolean;
  isEvaluating: boolean;
  allCovered: boolean;
  topicCompleted: boolean;
  onAskAbout: (text: string) => void;
  onTakeQuiz: () => void;
  onClose?: () => void;
  onCollapse?: () => void;
  className?: string;
  isBottomSheet?: boolean;
}) {
  const coveredCount = objectives.filter((o) => o.covered).length;

  return (
    <div
      className={`${isBottomSheet ? "w-full" : "w-72"} shrink-0 flex-col bg-light-cream ${isBottomSheet ? "" : "border border-gray-200"} ${className}`}
      style={{
        boxShadow: isBottomSheet ? "none" : "-4px 0 12px rgba(0,0,0,0.04)",
        maxHeight: isBottomSheet ? "calc(85vh - 20px)" : undefined,
      }}
    >
      {/* Panel header */}
      <div
        className="px-4 py-4 border-b shrink-0"
        style={{ borderColor: C.border }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="w-1 h-4 rounded-full shrink-0"
              style={{ backgroundColor: C.inkMid }}
            />
            <Target size={13} style={{ color: C.inkMid }} />
            <span className="text-sm font-semibold" style={{ color: C.ink }}>
              Learning Objectives
            </span>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="transition-opacity hover:opacity-50"
              style={{ color: C.inkMid }}
            >
              <X size={16} color={C.inkMid} />
            </button>
          )}
          {onCollapse && !onClose && (
            <button
              onClick={onCollapse}
              className="transition-opacity hover:opacity-50"
              style={{ color: C.inkMuted }}
            >
              <ChevronRight size={16} color={C.inkMid} />
            </button>
          )}
        </div>
      </div>

      {/* Objectives list */}
      <div className="flex-1 overflow-y-auto px-3 py-4">
        {isLoading ? (
          <div className="flex flex-col gap-2.5 px-1">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-10 rounded-xl animate-pulse"
                style={{ backgroundColor: C.pageBg }}
              />
            ))}
          </div>
        ) : objectives.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 gap-2">
            <Target size={20} style={{ color: C.inkMuted, opacity: 0.4 }} />
            <p className="text-xs" style={{ color: C.inkMuted }}>
              No objectives yet
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-1.5">
            {objectives.map((obj) => (
              <ObjectiveRow
                key={obj.id}
                objective={obj}
                isEvaluating={isEvaluating}
                onAskAbout={onAskAbout}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {!isLoading && objectives.length > 0 && (
        <div className="px-4 py-4 shrink-0">
          {/* Completed badge */}
          {topicCompleted && (
            <div
              className="flex items-center justify-center gap-2 text-xs font-semibold px-3 py-2 rounded-xl mb-3"
              style={{ backgroundColor: C.accentFillLight, color: C.inkMid }}
            >
              <CheckCircle2 size={14} />
              Completed
            </div>
          )}

          {/* Progress */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] uppercase tracking-wide font-medium" style={{ color: C.inkMuted }}>
                Progress
              </span>
              <span
                className="text-xs font-bold"
                style={{ color: C.inkMid }}
              >
                {coveredCount}/{objectives.length}
              </span>
            </div>
            <div
              className="h-1.5 rounded-full overflow-hidden"
              style={{ backgroundColor: "rgba(177,183,171,0.2)" }}
            >
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${objectives.length > 0 ? (coveredCount / objectives.length) * 100 : 0}%`,
                  backgroundColor: C.inkMid,
                }}
              />
            </div>
          </div>

          {/* Quiz button */}
          {!topicCompleted && (
            <button
              onClick={onTakeQuiz}
              disabled={!allCovered}
              className="w-full text-sm font-semibold py-2.5 rounded-xl transition-all cursor-pointer disabled:cursor-not-allowed"
              style={{
                backgroundColor: allCovered ? C.accentFill : C.chipInactive,
                color: allCovered ? "#FBF6F0" : C.inkMuted,
                opacity: allCovered ? 1 : 0.5,
                cursor: allCovered ? "pointer" : "not-allowed",
              }}
            >
              Take Quiz
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ── ObjectiveRow ──────────────────────────────────────────────────────────────
function ObjectiveRow({
  objective,
  isEvaluating,
  onAskAbout,
}: {
  objective: LearningObjective;
  isEvaluating: boolean;
  onAskAbout: (text: string) => void;
}) {
  const covered = objective.covered;

  return (
    <button
      className={`group flex items-start gap-3 px-3 py-2.5 rounded-xl transition-all text-left cursor-pointer ${
        covered
          ? "bg-[rgba(39,97,82,0.08)]"
          : "hover:bg-[rgba(39,97,82,0.04)]"
      }`}
      onClick={() => !covered && onAskAbout(objective.text)}
      disabled={covered}
    >
      <div className="mt-0.5 shrink-0">
        {isEvaluating && !covered ? (
          <Loader2
            size={14}
            className="animate-spin"
            style={{ color: C.inkMid }}
          />
        ) : covered ? (
          <CheckCircle2 size={14} style={{ color: C.inkMid }} />
        ) : (
          <Circle size={14} style={{ color: C.inkMuted, opacity: 0.5 }} />
        )}
      </div>
      <span
        className={`flex-1 text-xs leading-relaxed ${covered ? "line-through opacity-60" : ""}`}
        style={{ color: covered ? C.inkMid : C.ink }}
      >
        {objective.text}
      </span>
      {!covered && !isEvaluating && (
        <span
          className="opacity-0 group-hover:opacity-100 text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-md transition-all shrink-0"
          style={{ backgroundColor: C.accentFillLight, color: C.inkMid }}
        >
          Ask
        </span>
      )}
    </button>
  );
}

// ── OverviewCard ──────────────────────────────────────────────────────────────
function OverviewCard({
  content,
  streaming,
}: {
  content: string;
  streaming: boolean;
}) {
  return (
    <div
      className="rounded-xl p-5"
      style={{ backgroundColor: C.accentFillLight }}
    >
      <div className="flex items-center gap-2 mb-3">
        <BookOpen size={13} style={{ color: C.inkMid }} />
        <span className="text-xs font-semibold" style={{ color: C.inkMid }}>
          Topic Overview
        </span>
      </div>
      <div style={{ color: C.ink }}>
        <MarkdownMessage content={content} />
      </div>
      {streaming && (
        <span
          className="inline-block w-0.5 h-4 ml-0.5 animate-pulse align-middle"
          style={{ backgroundColor: C.inkMid }}
        />
      )}
    </div>
  );
}

// ── ChatBubble ────────────────────────────────────────────────────────────────
function ChatBubble({
  message,
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
          className="rounded-2xl rounded-tr-sm px-4 py-3 max-w-[85%] text-sm leading-relaxed whitespace-pre-wrap"
          style={{ backgroundColor: C.accentFill, color: "#FBF6F0" }}
        >
          {message.content}
        </div>
      </div>
    );
  }

  const showReExplain = interests.length > 0 && !!onReExplain;

  return (
    <div className="flex flex-col gap-1.5">
      {/* AI message — borderless, no avatar, directly on page background */}
      <div style={{ color: C.ink }}>
        <MarkdownMessage content={message.content} />
      </div>

      {/* Re-explain row */}
      {showReExplain && (
        <div className="flex flex-col gap-2 mt-1">
          <div>
            <button
              onClick={() => setExpanded(!expanded)}
              disabled={disabled}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full transition-all disabled:opacity-40"
              style={{
                backgroundColor: expanded ? C.accentFillMid : C.chipInactive,
                color: expanded ? "#FBF6F0" : C.inkMid,
              }}
            >
              Re-explain using…
              <motion.span
                animate={{ rotate: expanded ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className="inline-flex"
              >
                <ChevronRight size={12} className="rotate-90" />
              </motion.span>
            </button>
          </div>

          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
                className="overflow-hidden"
              >
                <div className="flex flex-wrap items-center gap-2 pb-1">
                  {interests.map((interest, i) => (
                    <motion.button
                      key={interest}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 6 }}
                      transition={{ duration: 0.25, delay: 0.1 + i * 0.06, ease: "easeInOut" }}
                      onClick={() => {
                        setExpanded(false);
                        onReExplain(interest);
                      }}
                      disabled={disabled}
                      className="text-xs font-semibold px-3 py-1.5 rounded-full disabled:opacity-40 cursor-pointer"
                      style={{
                        backgroundColor: C.accentFillLight,
                        color: C.inkMid,
                      }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {interest}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

export default TopicChatPage;
