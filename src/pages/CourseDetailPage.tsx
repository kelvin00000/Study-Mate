import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Lock,
  CheckCircle2,
  ChevronRight,
  Loader2,
  Pencil,
  Menu,
} from "lucide-react";
import { Sidebar } from "../components/dashboard/Sidebar";
import { CreateCourseModal } from "../components/dashboard/CreateCourseModal";
import { useCourse } from "../hooks/useCourses";

const CourseDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const { data: course, isLoading, isError } = useCourse(id);

  return (
    <div className="bg-light-cream min-h-screen">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onNewCourse={() => setModalOpen(true)}
      />

      <div className="lg:pl-60 flex flex-col min-h-screen">
        {/* Mobile hamburger */}
        <div className="lg:hidden flex items-center px-4 py-1 bg-light-cream">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
          >
            <Menu size={20} />
          </button>
        </div>

        <main className="flex-1 p-6 lg:p-8">
          {/* Back button */}
          <button
            className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-105 cursor-pointer shadow-md bg-white border border-laurel-green/30 mb-6"
            onClick={() => navigate("/courses")}
          >
            <ArrowLeft size={18} className="text-moderate-green" />
          </button>

          {isLoading && (
            <div className="flex items-center justify-center py-24">
              <Loader2 size={28} className="animate-spin text-moderate-green" />
            </div>
          )}

          {isError && (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="text-5xl mb-4">🔍</div>
              <p className="text-base font-medium mb-2 text-deep-bluish">
                Course not found.
              </p>
              <Link
                to="/courses"
                className="text-sm font-medium transition-opacity hover:opacity-70 text-moderate-green"
              >
                Back to My Courses
              </Link>
            </div>
          )}

          {!isLoading && !isError && course && (
            <>
              {/* Course header card */}
              <div className="rounded-2xl p-6 mb-6 border bg-white border-laurel-green/20">
                <div className="flex items-start justify-between gap-4 mb-5">
                  <div className="flex items-start gap-4 flex-1">
                    {course.imageUrl ? (
                      <img
                        src={course.imageUrl}
                        alt={course.title}
                        className="w-14 h-14 rounded-2xl object-cover shrink-0"
                      />
                    ) : (
                      <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0"
                        style={{ backgroundColor: `${course.color}18` }}
                      >
                        {course.icon}
                      </div>
                    )}
                    <div>
                      <h1 className="text-xl lg:text-2xl font-bold mb-1 text-deep-bluish">
                        {course.title}
                      </h1>
                      <p className="text-sm leading-relaxed text-moderate-green/70">
                        {course.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-normal text-moderate-green">Edit course</p>
                    <button
                      onClick={() => navigate(`/courses/${id}/edit`)}
                      className="shrink-0 p-2 rounded-xl border border-laurel-green/20 text-moderate-green/70 transition-colors hover:bg-laurel-green/10"
                      title="Edit course"
                    >
                      <Pencil size={16} />
                    </button>
                  </div>
                </div>

                {/* Progress */}
                <div>
                  <div className="flex justify-between text-sm mb-2 text-moderate-green/70">
                    <span>
                      {course.topicsCompleted}/{course.totalTopics} topics
                      completed
                    </span>
                    <span
                      className="font-semibold"
                      style={{ color: course.color }}
                    >
                      {course.progressPercent}%
                    </span>
                  </div>
                  <div className="h-2.5 rounded-full overflow-hidden bg-laurel-green/15">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${course.progressPercent}%`,
                        backgroundColor: course.color,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Topics section */}
              <div>
                <h2 className="text-base font-semibold mb-4 text-deep-bluish">
                  Topics
                </h2>
                <div className="flex flex-col gap-3">
                  {(() => {
                    const firstIncomplete = course.topics.findIndex(
                      (t) => !t.completed,
                    );
                    return course.topics.map((topic, i) => {
                      const done = topic.completed;
                      const unlocked = !done && i === firstIncomplete;
                      const clickable = done || unlocked;
                      const Wrapper = clickable ? "button" : "div";
                      return (
                        <Wrapper
                          key={topic.id}
                          onClick={
                            clickable
                              ? () =>
                                  navigate(
                                    `/courses/${id}/topics/${topic.order}`,
                                  )
                              : undefined
                          }
                          className={`flex items-center gap-4 rounded-xl p-4 border w-full text-left transition-all bg-white ${!unlocked ? "border-laurel-green/20" : ""}${clickable ? " hover:shadow-sm cursor-pointer" : " cursor-default"}`}
                          style={{
                            borderColor: unlocked ? course.color : undefined,
                          }}
                        >
                          {done ? (
                            <CheckCircle2
                              size={20}
                              style={{ color: course.color, flexShrink: 0 }}
                            />
                          ) : unlocked ? (
                            <ChevronRight
                              size={20}
                              style={{ color: course.color, flexShrink: 0 }}
                            />
                          ) : (
                            <Lock
                              size={20}
                              className="text-moderate-green/50 shrink-0"
                            />
                          )}
                          <div className="flex-1">
                            <p
                              className={`text-sm font-medium ${clickable ? "text-deep-bluish" : "text-moderate-green/50"}`}
                            >
                              {topic.title}
                            </p>
                            {!clickable && (
                              <p className="text-xs mt-0.5 text-moderate-green/50">
                                Locked
                              </p>
                            )}
                            {unlocked && (
                              <p
                                className="text-xs mt-0.5 font-medium"
                                style={{ color: course.color }}
                              >
                                Up next
                              </p>
                            )}
                          </div>
                          {done && (
                            <span
                              className="text-xs font-semibold px-2 py-0.5 rounded-md"
                              style={{
                                backgroundColor: `${course.color}18`,
                                color: course.color,
                              }}
                            >
                              Done
                            </span>
                          )}
                          {unlocked && (
                            <span
                              className="text-xs font-semibold px-2 py-0.5 rounded-md"
                              style={{
                                backgroundColor: `${course.color}18`,
                                color: course.color,
                              }}
                            >
                              Start
                            </span>
                          )}
                        </Wrapper>
                      );
                    });
                  })()}
                </div>
              </div>
            </>
          )}
        </main>
      </div>

      <CreateCourseModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
};

export default CourseDetailPage;
