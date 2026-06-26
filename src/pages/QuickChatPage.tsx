import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Send,
  Plus,
  Trash2,
  Loader2,
  MessageCircle,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useQueryClient } from "@tanstack/react-query";
import { Sidebar } from "../components/dashboard/Sidebar";
import { CreateCourseModal } from "../components/dashboard/CreateCourseModal";
import { MarkdownMessage } from "../components/MarkdownMessage";
import { Colors as C } from "../constants/Color";
import { useUserPreferences } from "../hooks/useUserPreferences";
import {
  useConversations,
  useConversationMessages,
  useCreateConversation,
  useDeleteConversation,
  useQuickChatStream,
  type Message,
} from "../hooks/useQuickChat";

// ── Thinking indicator ───────────────────────────────────────────────────────
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

// ── Streaming bubble ─────────────────────────────────────────────────────────
const StreamingBubble = React.memo(({ content }: { content: string }) => {
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
          {stable && <MarkdownMessage content={stable} isStreaming={true} />}
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

// ── Chat bubble ──────────────────────────────────────────────────────────────
function ChatBubble({
  message,
  interests = [],
  disabled = false,
  onReExplain,
}: {
  message: Message;
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
      <div style={{ color: C.ink }}>
        <MarkdownMessage content={message.content} />
      </div>

      {showReExplain && (
        <div className="flex flex-col gap-2 mt-1">
          <div>
            <button
              onClick={() => setExpanded(!expanded)}
              disabled={disabled}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full transition-all disabled:opacity-40 cursor-pointer"
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
                        onReExplain!(interest);
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

// ── Delete confirmation modal ────────────────────────────────────────────────
function DeleteConfirmModal({
  open,
  onCancel,
  onConfirm,
  isDeleting,
}: {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
}) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40"
            onClick={onCancel}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="relative w-[90%] max-w-sm rounded-2xl p-5 shadow-xl"
            style={{ backgroundColor: C.cardBg }}
          >
            <h3 className="text-sm font-semibold mb-1" style={{ color: C.ink }}>
              Delete conversation?
            </h3>
            <p className="text-xs mb-5" style={{ color: C.inkMuted }}>
              This action cannot be undone.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={onCancel}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl text-xs font-semibold transition-colors hover:bg-black/5 cursor-pointer"
                style={{ color: C.inkMid }}
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-red-500 text-white transition-opacity hover:opacity-90 cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? (
                  <Loader2 size={14} className="animate-spin mx-auto" />
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// ── Conversation list item ───────────────────────────────────────────────────
function ConversationItem({
  title,
  updatedAt,
  active,
  onSelect,
  onDelete,
  isDeleting,
}: {
  title: string;
  updatedAt: string;
  active: boolean;
  onSelect: () => void;
  onDelete: () => void;
  isDeleting?: boolean;
}) {
  const timeAgo = useMemo(() => {
    const diff = Date.now() - new Date(updatedAt).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  }, [updatedAt]);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onSelect(); }}
      className={`group w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-left transition-all cursor-pointer ${
        active ? "bg-[rgba(39,97,82,0.1)]" : "hover:bg-[rgba(39,97,82,0.04)]"
      }`}
    >
      <MessageCircle size={14} style={{ color: C.inkMid }} className="shrink-0" />
      <div className="flex-1 min-w-0">
        <p
          className="text-xs font-medium truncate"
          style={{ color: active ? C.ink : C.inkMid }}
        >
          {title}
        </p>
        <p className="text-[10px]" style={{ color: C.inkMuted }}>
          {timeAgo}
        </p>
      </div>
      {isDeleting ? (
        <Loader2 size={12} className="animate-spin text-red-400 shrink-0" />
      ) : (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="md:opacity-0 md:group-hover:opacity-100 p-1 rounded-md transition-all hover:bg-red-50"
        >
          <Trash2 size={12} className="text-red-400" />
        </button>
      )}
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────
const QuickChatPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [chatListOpen, setChatListOpen] = useState(false);
  const [activeConvoId, setActiveConvoId] = useState<string | null>(
    searchParams.get("c")
  );
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [activeInterest, setActiveInterest] = useState<string | null>(null);
  const [showInterests, setShowInterests] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const initializedRef = useRef(false);

  const { data: preferences } = useUserPreferences();
  const interests = preferences?.interests ?? [];

  const { data: conversations, isLoading: convosLoading } = useConversations();
  const { data: convoMessages, isLoading: messagesLoading } =
    useConversationMessages(activeConvoId);
  const createConvo = useCreateConversation();
  const deleteConvo = useDeleteConversation();
  const { sendMessage } = useQuickChatStream();

  // Seed messages when loading a conversation
  const seededConvoId = useRef<string | null>(null);
  useEffect(() => {
    if (!convoMessages || seededConvoId.current === activeConvoId) return;
    seededConvoId.current = activeConvoId;
    setMessages(
      convoMessages.map((m) => ({ role: m.role as "user" | "assistant", content: m.content }))
    );
  }, [convoMessages, activeConvoId]);

  // Auto-create first conversation if none exist
  useEffect(() => {
    if (initializedRef.current || convosLoading || !conversations) return;
    initializedRef.current = true;
    if (conversations.length === 0 && !createConvo.isPending) {
      createConvo.mutate(undefined, {
        onSuccess: (convo) => {
          setActiveConvoId(convo.id);
          setSearchParams({ c: convo.id });
        },
      });
    } else if (!activeConvoId && conversations.length > 0) {
      setActiveConvoId(conversations[0].id);
      setSearchParams({ c: conversations[0].id });
    }
  }, [conversations, convosLoading]);

  // Sync URL param
  useEffect(() => {
    if (activeConvoId) {
      setSearchParams({ c: activeConvoId });
    }
  }, [activeConvoId]);

  // Scroll to bottom
  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingContent, scrollToBottom]);

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleNewChat = () => {
    createConvo.mutate(undefined, {
      onSuccess: (convo) => {
        setActiveConvoId(convo.id);
        setMessages([]);
        seededConvoId.current = convo.id;
        setChatListOpen(false);
      },
    });
  };

  const handleSelectConvo = (id: string) => {
    if (id === activeConvoId) return;
    setActiveConvoId(id);
    seededConvoId.current = null; // force re-seed
    setMessages([]);
    setChatListOpen(false);
  };

  const [deletingConvoId, setDeletingConvoId] = useState<string | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const handleDeleteConvo = (id: string) => {
    setDeleteTargetId(id);
  };

  const confirmDelete = () => {
    if (!deleteTargetId) return;
    setDeletingConvoId(deleteTargetId);
    deleteConvo.mutate(deleteTargetId, {
      onSuccess: () => {
        const deletedId = deleteTargetId;
        setDeletingConvoId(null);
        setDeleteTargetId(null);
        if (deletedId === activeConvoId) {
          const remaining = conversations?.filter((c) => c.id !== deletedId) ?? [];
          if (remaining.length > 0) {
            setActiveConvoId(remaining[0].id);
            seededConvoId.current = null;
            setMessages([]);
          } else {
            handleNewChat();
          }
        }
      },
      onError: () => {
        setDeletingConvoId(null);
        setDeleteTargetId(null);
      },
    });
  };

  const submit = async (overrideText?: string) => {
    const text = (overrideText ?? input).trim();
    if (!text || streaming || !activeConvoId) return;
    if (!overrideText) {
      setInput("");
      if (textareaRef.current) textareaRef.current.style.height = "auto";
    }

    const userMsg: Message = { role: "user", content: text };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);

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

    setStreaming(true);
    setStreamingContent("");

    try {
      await sendMessage(
        activeConvoId,
        [...interestSeed, ...updatedMessages],
        text,
        (delta) => setStreamingContent((prev) => prev + delta),
        (fullText) => {
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: fullText },
          ]);
          setStreamingContent("");
          setStreaming(false);
          queryClient.invalidateQueries({ queryKey: ["quickConversations"] });
        }
      );
    } catch {
      setStreamingContent("");
      setStreaming(false);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I ran into an issue. Please try again.",
        },
      ]);
    }
  };

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

  const activeTitle =
    conversations?.find((c) => c.id === activeConvoId)?.title ?? "New Chat";

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div style={{ backgroundColor: C.pageBg }} className="h-screen overflow-hidden">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onNewCourse={() => setModalOpen(true)}
      />

      <div className="lg:pl-60 flex h-full">
        {/* Desktop conversation list panel */}
        <div
          className="hidden md:flex flex-col w-64 shrink-0 border-r h-full"
          style={{ borderColor: C.border, backgroundColor: C.cardBg }}
        >
          <div className="p-3 border-b" style={{ borderColor: C.border }}>
            <button
              onClick={handleNewChat}
              disabled={createConvo.isPending}
              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90 cursor-pointer"
              style={{ backgroundColor: C.accentFill, color: "#FBF6F0" }}
            >
              {createConvo.isPending ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Plus size={14} />
              )}
              New Chat
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
            {convosLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 size={16} className="animate-spin" style={{ color: C.inkMuted }} />
              </div>
            ) : conversations?.length === 0 ? (
              <p className="text-xs text-center py-8" style={{ color: C.inkMuted }}>
                No conversations yet
              </p>
            ) : (
              conversations?.map((c) => (
                <ConversationItem
                  key={c.id}
                  title={c.title}
                  updatedAt={c.updatedAt}
                  active={c.id === activeConvoId}
                  onSelect={() => handleSelectConvo(c.id)}
                  onDelete={() => handleDeleteConvo(c.id)}
                  isDeleting={deletingConvoId === c.id}
                />
              ))
            )}
          </div>
        </div>

        {/* Chat area */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0 min-h-0">
          {/* Header */}
          <div
            className="px-4 lg:px-6 py-3 flex items-center gap-3 shrink-0 border-b"
            style={{ borderColor: C.border, backgroundColor: C.cardBg }}
          >
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-1.5 rounded-lg transition-colors hover:bg-black/5"
              style={{ color: C.inkMid }}
            >
              <Menu size={18} />
            </button>
            <button
              onClick={() => setChatListOpen(true)}
              className="md:hidden p-1.5 rounded-lg transition-colors hover:bg-black/5"
              style={{ color: C.inkMid }}
            >
              <ChevronLeft size={18} />
            </button>
            <MessageCircle size={18} style={{ color: C.inkMid }} />
            <h1
              className="text-sm font-semibold truncate flex-1"
              style={{ color: C.ink }}
            >
              {activeTitle}
            </h1>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto" style={{ backgroundColor: C.pageBg }}>
            <div className="max-w-3xl mx-auto w-full px-4 lg:px-8 py-6 space-y-6">
              {messagesLoading && (
                <div className="flex justify-center py-4">
                  <Loader2
                    size={18}
                    className="animate-spin"
                    style={{ color: C.inkMuted }}
                  />
                </div>
              )}

              {!messagesLoading && messages.length === 0 && !streaming && (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center"
                    style={{ backgroundColor: C.accentFillLight }}
                  >
                    <MessageCircle size={28} style={{ color: C.inkMid }} />
                  </div>
                  <div className="text-center">
                    <h2
                      className="text-lg font-semibold mb-1"
                      style={{ color: C.ink }}
                    >
                      Ask me anything
                    </h2>
                    <p className="text-sm" style={{ color: C.inkMuted }}>
                      No course needed — just type your question below.
                    </p>
                  </div>
                </div>
              )}

              {messages.map((msg, i) => (
                <ChatBubble
                  key={i}
                  message={msg}
                  interests={interests}
                  disabled={streaming}
                  onReExplain={(interest) =>
                    submit(
                      `Re-explain that using a ${interest.toLowerCase()} analogy or real-world example.`
                    )
                  }
                />
              ))}

              {streaming && <StreamingBubble content={streamingContent} />}

              <div
                ref={bottomRef}
                style={{ height: streaming ? "40vh" : 0 }}
                className="transition-[height] duration-300"
              />
            </div>
          </div>

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

          {/* Interest pill + Input */}
          <div className="px-4 lg:px-8 py-3 shrink-0" style={{ backgroundColor: C.pageBg }}>
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
                  placeholder="Ask anything..."
                  disabled={streaming || !activeConvoId}
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
                    disabled={!input.trim() || streaming || !activeConvoId}
                    className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-opacity cursor-pointer"
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
      </div>

      {/* Mobile chat list drawer */}
      <AnimatePresence>
        {chatListOpen && (
          <div className="md:hidden fixed inset-0 z-50">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/30"
              onClick={() => setChatListOpen(false)}
            />
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="absolute left-0 top-0 h-full w-72 shadow-2xl flex flex-col"
              style={{ backgroundColor: C.cardBg }}
            >
              <div className="p-3 flex items-center justify-between border-b" style={{ borderColor: C.border }}>
                <h2 className="text-sm font-semibold" style={{ color: C.ink }}>
                  Conversations
                </h2>
                <button
                  onClick={() => setChatListOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-black/5"
                >
                  <X size={16} style={{ color: C.inkMid }} />
                </button>
              </div>
              <div className="p-3 border-b" style={{ borderColor: C.border }}>
                <button
                  onClick={handleNewChat}
                  disabled={createConvo.isPending}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer"
                  style={{ backgroundColor: C.accentFill, color: "#FBF6F0" }}
                >
                  {createConvo.isPending ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Plus size={14} />
                  )}
                  New Chat
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
                {conversations?.map((c) => (
                  <ConversationItem
                    key={c.id}
                    title={c.title}
                    updatedAt={c.updatedAt}
                    active={c.id === activeConvoId}
                    onSelect={() => handleSelectConvo(c.id)}
                    onDelete={() => handleDeleteConvo(c.id)}
                    isDeleting={deletingConvoId === c.id}
                  />
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <DeleteConfirmModal
        open={!!deleteTargetId}
        onCancel={() => setDeleteTargetId(null)}
        onConfirm={confirmDelete}
        isDeleting={!!deletingConvoId}
      />
      <CreateCourseModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
};

export default QuickChatPage;
