import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Lock, CheckCircle2, ChevronRight, Loader2, Pencil } from 'lucide-react';
import { Sidebar } from '../components/dashboard/Sidebar';
import { TopBar } from '../components/dashboard/TopBar';
import { CreateCourseModal } from '../components/dashboard/CreateCourseModal';
import { useCourse } from '../hooks/useCourses';

const CourseDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const { data: course, isLoading, isError } = useCourse(id);

  return (
    <div style={{ backgroundColor: 'var(--bg)', minHeight: '100vh' }}>
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onNewCourse={() => setModalOpen(true)}
      />

      <div className="lg:pl-60 flex flex-col min-h-screen">
        <TopBar
          onCreateNew={() => setModalOpen(true)}
          onMenuToggle={() => setSidebarOpen(true)}
        />

        <main className="flex-1 p-6 lg:p-8">
          {/* Back button */}
          <button
            onClick={() => navigate('/courses')}
            className="flex items-center gap-1.5 text-sm font-medium mb-6 transition-opacity hover:opacity-70"
            style={{ color: 'var(--primary)' }}
          >
            <ArrowLeft size={16} />
            My Courses
          </button>

          {isLoading && (
            <div className="flex items-center justify-center py-24">
              <Loader2 size={28} className="animate-spin" style={{ color: 'var(--primary)' }} />
            </div>
          )}

          {isError && (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="text-5xl mb-4">🔍</div>
              <p className="text-base font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                Course not found.
              </p>
              <Link
                to="/courses"
                className="text-sm font-medium transition-opacity hover:opacity-70"
                style={{ color: 'var(--primary)' }}
              >
                Back to My Courses
              </Link>
            </div>
          )}

          {!isLoading && !isError && course && (
            <>
              {/* Course header card */}
              <div
                className="rounded-2xl p-6 mb-6 border"
                style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
              >
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
                    <h1
                      className="text-xl lg:text-2xl font-bold mb-1"
                      style={{ fontFamily: 'Archivo Black, sans-serif', color: 'var(--text-primary)' }}
                    >
                      {course.title}
                    </h1>
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                      {course.description}
                    </p>
                  </div>
                  </div>
                  <button
                    onClick={() => navigate(`/courses/${id}/edit`)}
                    className="shrink-0 p-2 rounded-xl border transition-colors hover:bg-[var(--secondary)]"
                    style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
                    title="Edit course"
                  >
                    <Pencil size={16} />
                  </button>
                </div>

                {/* Progress */}
                <div>
                  <div
                    className="flex justify-between text-sm mb-2"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    <span>{course.topicsCompleted}/{course.totalTopics} topics completed</span>
                    <span className="font-semibold" style={{ color: course.color }}>
                      {course.progressPercent}%
                    </span>
                  </div>
                  <div className="h-2.5 rounded-full overflow-hidden" style={{ backgroundColor: '#F3F0FF' }}>
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${course.progressPercent}%`, backgroundColor: course.color }}
                    />
                  </div>
                </div>
              </div>

              {/* Topics section */}
              <div>
                <h2
                  className="text-base font-semibold mb-4"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Topics
                </h2>
                <div className="flex flex-col gap-3">
                  {(() => {
                    const firstIncomplete = course.topics.findIndex(t => !t.completed);
                    return course.topics.map((topic, i) => {
                      const done = topic.completed;
                      const unlocked = !done && i === firstIncomplete;
                      const clickable = done || unlocked;
                      const Wrapper = clickable ? 'button' : 'div';
                      return (
                        <Wrapper
                          key={topic.id}
                          onClick={clickable ? () => navigate(`/courses/${id}/topics/${topic.order}`) : undefined}
                          className={`flex items-center gap-4 rounded-xl p-4 border w-full text-left transition-all${clickable ? ' hover:shadow-sm cursor-pointer' : ' cursor-default'}`}
                          style={{
                            backgroundColor: 'var(--card)',
                            borderColor: unlocked ? course.color : 'var(--border)',
                            outline: 'none',
                          }}
                        >
                          {done ? (
                            <CheckCircle2 size={20} style={{ color: course.color, flexShrink: 0 }} />
                          ) : unlocked ? (
                            <ChevronRight size={20} style={{ color: course.color, flexShrink: 0 }} />
                          ) : (
                            <Lock size={20} style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />
                          )}
                          <div className="flex-1">
                            <p
                              className="text-sm font-medium"
                              style={{ color: clickable ? 'var(--text-primary)' : 'var(--text-secondary)' }}
                            >
                              {topic.title}
                            </p>
                            {!clickable && (
                              <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                                Locked
                              </p>
                            )}
                            {unlocked && (
                              <p className="text-xs mt-0.5 font-medium" style={{ color: course.color }}>
                                Up next
                              </p>
                            )}
                          </div>
                          {done && (
                            <span
                              className="text-xs font-semibold px-2 py-0.5 rounded-md"
                              style={{ backgroundColor: `${course.color}18`, color: course.color }}
                            >
                              Done
                            </span>
                          )}
                          {unlocked && (
                            <span
                              className="text-xs font-semibold px-2 py-0.5 rounded-md"
                              style={{ backgroundColor: `${course.color}18`, color: course.color }}
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
