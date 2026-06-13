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
  // Resolved color: use state immediately, fall back to loaded course data
  const courseColor = stateColor || course?.color || "#0D3A35";

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
      <div className="flex items-center justify-center min-h-screen bg-light-cream">
        <div className="text-center">
          <Loader2 size={32} className="animate-spin mx-auto mb-4 text-moderate-green" />
          <p className="text-sm font-medium text-moderate-green/70">
            Generating your quiz…
          </p>
          <p className="text-xs mt-1 text-moderate-green/70 opacity-60">
            This may take up to a minute
          </p>
        </div>
      </div>
    );
  }

  // ── Error screen ───────────────────────────────────────────────────────────
  if (phase === "error") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-light-cream">
        <div className="text-center max-w-xs px-4">
          <p className="text-3xl mb-4">⚠️</p>
          <p className="text-base font-semibold mb-1 text-deep-bluish">
            Quiz generation failed
          </p>
          <p className="text-sm mb-6 text-moderate-green/70">
            The AI took too long to respond. Please go back and try again.
          </p>
          <button
            onClick={() => navigate(`/courses/${courseId}/topics/${topicIndex}`)}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-deep-bluish"
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
      <div className="min-h-screen bg-light-cream">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <button
            onClick={() => navigate(`/courses/${courseId}/topics/${topicIndex}`)}
            className="flex items-center gap-1.5 text-sm font-medium mb-8 transition-opacity hover:opacity-70 text-moderate-green"
          >
            <ArrowLeft size={16} />
            Back to topic
          </button>

          {/* Progress header */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-lg font-bold text-deep-bluish">
                Quiz — {topicTitle}
              </h1>
              <span className="text-sm text-moderate-green/70">
                Question {currentQ + 1} of {quiz.questions.length}
              </span>
            </div>
            <div className="h-2 rounded-full bg-laurel-green/15">
              <div
                className="h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%`, backgroundColor: courseColor }}
              />
            </div>
          </div>

          {/* Question card */}
          <div className="rounded-2xl border border-laurel-green/20 bg-white p-6 mb-5">
            <div className="mb-5">
              <MarkdownMessage content={question.question} />
            </div>

            <div className="flex flex-col gap-3">
              {question.options.map((option, idx) => {
                const selected = selectedAnswer === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedAnswer(idx)}
                    className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all text-deep-bluish ${selected ? '' : 'border-laurel-green/20 bg-light-cream'}`}
                    style={selected ? { borderColor: courseColor, backgroundColor: `${courseColor}12` } : undefined}
                  >
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${selected ? '' : 'border-laurel-green/20'}`}
                      style={selected ? { borderColor: courseColor, backgroundColor: courseColor } : undefined}
                    >
                      {selected && (
                        <div className="w-2 h-2 rounded-full bg-white" />
                      )}
                    </div>
                    <span className="text-sm"><MarkdownMessage content={option} /></span>
                  </button>
                );
              })}
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
    <div className="min-h-screen bg-light-cream">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate(`/courses/${courseId}/topics/${topicIndex}`)}
          className="flex items-center gap-1.5 text-sm font-medium mb-8 transition-opacity hover:opacity-70 text-moderate-green"
        >
          <ArrowLeft size={16} />
          Back to topic
        </button>

        {/* Score card */}
        <div className="rounded-2xl border border-laurel-green/20 bg-white p-8 mb-6 text-center">
          <div className="text-5xl mb-3">{passed ? "🎉" : "💪"}</div>
          <h1 className="text-2xl font-bold mb-2 text-deep-bluish">
            {passed ? "Great work!" : "Keep going!"}
          </h1>
          <p className="text-sm text-moderate-green/70">
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
                  className="rounded-xl border border-laurel-green/20 bg-white p-4"
                >
                  <div className="flex items-start gap-2">
                    {isCorrect ? (
                      <CheckCircle2 size={16} className="shrink-0 mt-0.5 text-green-500" />
                    ) : (
                      <XCircle size={16} className="shrink-0 mt-0.5 text-red-500" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium mb-1 text-deep-bluish">
                        Q{i + 1} — <MarkdownMessage content={q.question} />
                      </div>
                      {!isCorrect && (
                        <div className="mt-2 space-y-1">
                          <p className="text-xs text-red-500">
                            Your answer: {q.options[answers[i] ?? 0]}
                          </p>
                          <p className="text-xs text-green-500">
                            Correct: {q.options[q.correctIndex]}
                          </p>
                          <div className="text-xs mt-2 p-2.5 rounded-lg leading-relaxed bg-laurel-green/10 text-moderate-green/70">
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
                className="px-4 py-2.5 rounded-xl text-sm font-semibold border border-laurel-green/20 text-deep-bluish transition-colors hover:opacity-80"
              >
                {showExplanations ? "Hide answers" : "Review answers"}
              </button>
              <button
                onClick={() =>
                  navigate(`/courses/${courseId}/topics/${topicIndex}`, {
                    state: { resetObjectives: true },
                  })
                }
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-deep-bluish"
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
