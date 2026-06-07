import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { useAuth } from "@clerk/clerk-react";
import { useCourse, useCompleteTopic } from "../hooks/useCourses";
import { useGenerateQuiz } from "../hooks/useQuiz";
import { MarkdownMessage } from "../components/MarkdownMessage";
import type { GeneratedQuiz } from "../api/quiz";
import type { LearningObjective } from "../api/objectives";

const PASS_THRESHOLD = 4; // 4/5 = 80%

const TopicQuizPage = () => {
  const { courseId, topicIndex } = useParams<{ courseId: string; topicIndex: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const [phase, setPhase] = useState<"generating" | "in-progress" | "results" | "error">("generating");
  const [quiz, setQuiz] = useState<GeneratedQuiz | null>(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [showExplanations, setShowExplanations] = useState(false);

  // All data needed for generation is in location.state — no API wait required
  const objectives: LearningObjective[] = location.state?.objectives ?? [];
  const topicId: string = location.state?.topicId ?? "";
  const courseTitle: string = location.state?.courseTitle ?? "";
  const topicTitle: string = location.state?.topicTitle ?? "";
  const stateColor: string = location.state?.courseColor ?? "";

  // useCourse loads in parallel — only needed for result screen UI
  const { data: course } = useCourse(courseId);
  const topicIdx = Number(topicIndex ?? "0");
  const topic = course?.topics.find((t) => t.order === topicIdx);

  // Resolved color: use state immediately, fall back to loaded course data
  const courseColor = stateColor || course?.color || "var(--primary)";

  const { mutate: completeTopic, isPending: completing } = useCompleteTopic(courseId ?? "");

  const { isLoaded } = useAuth();

  // topicId comes from state — generation starts once Clerk is ready
  const generateQuiz = useGenerateQuiz(courseId, topicId);
  const generatedRef = useRef(false);

  useEffect(() => {
    if (!isLoaded || !topicId || !courseTitle || !topicTitle || generatedRef.current) return;
    generatedRef.current = true;

    const timeout = setTimeout(() => setPhase("error"), 40_000);

    generateQuiz
      .mutateAsync({
        objectives: objectives.map((o) => o.text),
        courseTitle,
        topicTitle,
      })
      .then((data) => {
        clearTimeout(timeout);
        setQuiz(data);
        setAnswers(new Array(data.questions.length).fill(null));
        setPhase("in-progress");
      })
      .catch(() => {
        clearTimeout(timeout);
        setPhase("error");
      });

    return () => clearTimeout(timeout);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded]);

  // ── Generating screen ──────────────────────────────────────────────────────
  if (phase === "generating") {
    return (
      <div
        className="flex items-center justify-center min-h-screen"
        style={{ backgroundColor: "var(--bg)" }}
      >
        <div className="text-center">
          <Loader2
            size={32}
            className="animate-spin mx-auto mb-4"
            style={{ color: "var(--primary)" }}
          />
          <p className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
            Generating your quiz…
          </p>
          <p className="text-xs mt-1" style={{ color: "var(--text-secondary)", opacity: 0.6 }}>
            This may take up to a minute
          </p>
        </div>
      </div>
    );
  }

  // ── Error screen ───────────────────────────────────────────────────────────
  if (phase === "error") {
    return (
      <div
        className="flex items-center justify-center min-h-screen"
        style={{ backgroundColor: "var(--bg)" }}
      >
        <div className="text-center max-w-xs px-4">
          <p className="text-3xl mb-4">⚠️</p>
          <p className="text-base font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
            Quiz generation failed
          </p>
          <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
            The AI took too long to respond. Please go back and try again.
          </p>
          <button
            onClick={() => navigate(`/courses/${courseId}/topics/${topicIndex}`)}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
            style={{ backgroundColor: "var(--primary)" }}
          >
            ← Back to Topic
          </button>
        </div>
      </div>
    );
  }

  if (!quiz) return null;

  const question = quiz.questions[currentQ];
  const isLastQuestion = currentQ === quiz.questions.length - 1;

  // ── In-progress screen ─────────────────────────────────────────────────────
  if (phase === "in-progress") {
    const handleNext = () => {
      if (selectedAnswer === null) return;
      const newAnswers = [...answers];
      newAnswers[currentQ] = selectedAnswer;
      setAnswers(newAnswers);

      if (isLastQuestion) {
        setPhase("results");
      } else {
        setCurrentQ((prev) => prev + 1);
        setSelectedAnswer(null);
      }
    };

    const progress = (currentQ / quiz.questions.length) * 100;

    return (
      <div className="min-h-screen" style={{ backgroundColor: "var(--bg)" }}>
        <div className="max-w-2xl mx-auto px-4 py-8">
          <button
            onClick={() => navigate(`/courses/${courseId}/topics/${topicIndex}`)}
            className="flex items-center gap-1.5 text-sm font-medium mb-8 transition-opacity hover:opacity-70"
            style={{ color: "var(--primary)" }}
          >
            <ArrowLeft size={16} />
            Back to topic
          </button>

          {/* Progress header */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
                Quiz — {topicTitle}
              </h1>
              <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
                Question {currentQ + 1} of {quiz.questions.length}
              </span>
            </div>
            <div className="h-2 rounded-full" style={{ backgroundColor: "var(--secondary)" }}>
              <div
                className="h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%`, backgroundColor: courseColor }}
              />
            </div>
          </div>

          {/* Question card */}
          <div
            className="rounded-2xl border p-6 mb-5"
            style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
          >
            <div className="mb-5">
              <MarkdownMessage content={question.question} />
            </div>

            <div className="flex flex-col gap-3">
              {question.options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedAnswer(idx)}
                  className="flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all"
                  style={{
                    borderColor: selectedAnswer === idx ? courseColor : "var(--border)",
                    backgroundColor: selectedAnswer === idx ? `${courseColor}12` : "var(--bg)",
                    color: "var(--text-primary)",
                  }}
                >
                  <div
                    className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all"
                    style={{
                      borderColor: selectedAnswer === idx ? courseColor : "var(--border)",
                      backgroundColor: selectedAnswer === idx ? courseColor : "transparent",
                    }}
                  >
                    {selectedAnswer === idx && (
                      <div className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </div>
                  <span className="text-sm"><MarkdownMessage content={option} /></span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleNext}
              disabled={selectedAnswer === null}
              className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity"
              style={{
                backgroundColor: courseColor,
                opacity: selectedAnswer === null ? 0.4 : 1,
              }}
            >
              {isLastQuestion ? "See Results" : "Next Question →"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Results screen ─────────────────────────────────────────────────────────
  const score = answers.filter((ans, i) => ans === quiz.questions[i].correctIndex).length;
  const passed = score >= PASS_THRESHOLD;
  const scorePercent = Math.round((score / quiz.questions.length) * 100);

  const handleMarkComplete = () => {
    completeTopic(topicId, {
      onSuccess: () => navigate(`/courses/${courseId}`),
    });
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--bg)" }}>
      <div className="max-w-2xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate(`/courses/${courseId}/topics/${topicIndex}`)}
          className="flex items-center gap-1.5 text-sm font-medium mb-8 transition-opacity hover:opacity-70"
          style={{ color: "var(--primary)" }}
        >
          <ArrowLeft size={16} />
          Back to topic
        </button>

        {/* Score card */}
        <div
          className="rounded-2xl border p-8 mb-6 text-center"
          style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
        >
          <div className="text-5xl mb-3">{passed ? "🎉" : "💪"}</div>
          <h1 className="text-2xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>
            {passed ? "Great work!" : "Keep going!"}
          </h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            You scored {score}/{quiz.questions.length} ({scorePercent}%)
            {!passed && ` — need ${PASS_THRESHOLD}/${quiz.questions.length} to pass`}
          </p>
        </div>

        {/* Per-question breakdown */}
        {(passed || showExplanations) && (
          <div className="flex flex-col gap-3 mb-6">
            {quiz.questions.map((q, i) => {
              const isCorrect = answers[i] === q.correctIndex;
              return (
                <div
                  key={i}
                  className="rounded-xl border p-4"
                  style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
                >
                  <div className="flex items-start gap-2">
                    {isCorrect ? (
                      <CheckCircle2
                        size={16}
                        className="shrink-0 mt-0.5"
                        style={{ color: "#22c55e" }}
                      />
                    ) : (
                      <XCircle
                        size={16}
                        className="shrink-0 mt-0.5"
                        style={{ color: "#ef4444" }}
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium mb-1" style={{ color: "var(--text-primary)" }}>
                        Q{i + 1} — <MarkdownMessage content={q.question} />
                      </div>
                      {!isCorrect && (
                        <div className="mt-2 space-y-1">
                          <p className="text-xs" style={{ color: "#ef4444" }}>
                            Your answer: {q.options[answers[i] ?? 0]}
                          </p>
                          <p className="text-xs" style={{ color: "#22c55e" }}>
                            Correct: {q.options[q.correctIndex]}
                          </p>
                          <div
                            className="text-xs mt-2 p-2.5 rounded-lg leading-relaxed"
                            style={{
                              backgroundColor: "var(--secondary)",
                              color: "var(--text-secondary)",
                            }}
                          >
                            <MarkdownMessage content={q.explanation} />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-3">
          {passed ? (
            <button
              onClick={handleMarkComplete}
              disabled={completing}
              className="flex-1 py-3 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2"
              style={{ backgroundColor: courseColor }}
            >
              {completing ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Saving…
                </>
              ) : (
                "Mark Topic Complete"
              )}
            </button>
          ) : (
            <>
              <button
                onClick={() => setShowExplanations((v) => !v)}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold border transition-colors hover:opacity-80"
                style={{ borderColor: "var(--border)", color: "var(--text-primary)" }}
              >
                {showExplanations ? "Hide answers" : "Review answers"}
              </button>
              <button
                onClick={() =>
                  navigate(`/courses/${courseId}/topics/${topicIndex}`, {
                    state: { resetObjectives: true },
                  })
                }
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white"
                style={{ backgroundColor: "var(--primary)" }}
              >
                ← Study More
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TopicQuizPage;
