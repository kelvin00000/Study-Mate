import { useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { ArrowRight, BookOpen } from 'lucide-react';
import { Sidebar } from '../components/dashboard/Sidebar';
import { TopBar } from '../components/dashboard/TopBar';
import { DailyStreak } from '../components/dashboard/DailyStreak';
import { CourseCard } from '../components/dashboard/CourseCard';
import { CreateCourseModal } from '../components/dashboard/CreateCourseModal';

const MOCK_COURSES = [
  {
    title: 'System Analysis and Design',
    description: 'Learn structured approaches to analyzing and designing complex information systems.',
    topicsCompleted: 5,
    totalTopics: 18,
    progressPercent: 27,
    color: '#6541F0',
    icon: '🏗️',
  },
  {
    title: 'Introduction to Psychology',
    description: 'Explore fundamental concepts in human behavior, cognition, and mental processes.',
    topicsCompleted: 6,
    totalTopics: 11,
    progressPercent: 50,
    color: '#EC4899',
    icon: '🧠',
  },
  {
    title: 'Advanced Web Development',
    description: 'Master modern frameworks, performance optimization, and full-stack architecture.',
    topicsCompleted: 12,
    totalTopics: 15,
    progressPercent: 80,
    color: '#F59E0B',
    icon: '💻',
  },
];

const HomePage = () => {
  const { user } = useUser();
  const [modalOpen, setModalOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: 'var(--bg)' }}>
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onNewCourse={() => setModalOpen(true)}
      />

      {/* Content — offset by sidebar width on large screens */}
      <div className="flex flex-col flex-1 overflow-hidden lg:ml-60">
        <TopBar
          onCreateNew={() => setModalOpen(true)}
          onMenuToggle={() => setSidebarOpen(true)}
        />

        <main className="flex-1 overflow-y-auto px-4 py-5 lg:px-8 lg:py-7">
          {/* Welcome + Streak */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
            <div>
              <h1
                className="text-2xl lg:text-3xl font-bold mb-1"
                style={{
                  fontFamily: 'Archivo Black, sans-serif',
                  color: 'var(--text-primary)',
                }}
              >
                Welcome back, {user?.firstName ?? 'Learner'}.
              </h1>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                You have {MOCK_COURSES.length} active courses. Keep the momentum going!
              </p>
            </div>
            <DailyStreak />
          </div>

          {/* Your Courses */}
          <section className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2
                className="text-base font-semibold"
                style={{ color: 'var(--text-primary)' }}
              >
                Your Courses
              </h2>
              <button
                className="flex items-center gap-1 text-sm font-medium transition-opacity hover:opacity-70"
                style={{ color: 'var(--primary)' }}
              >
                View all <ArrowRight size={14} />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {MOCK_COURSES.map(course => (
                <CourseCard key={course.title} {...course} />
              ))}
            </div>
          </section>

          {/* Featured recommendation */}
          <section>
            <h2
              className="text-base font-semibold mb-4"
              style={{ color: 'var(--text-primary)' }}
            >
              Recommended For You
            </h2>
            <div
              className="rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              style={{
                background: 'linear-gradient(135deg, var(--primary) 0%, #9B5CF6 100%)',
              }}
            >
              <div className="text-white">
                <div className="flex items-center gap-2 mb-2 opacity-80">
                  <BookOpen size={16} />
                  <span className="text-xs font-semibold uppercase tracking-wide">
                    Featured Course
                  </span>
                </div>
                <h3
                  className="text-xl font-bold mb-1"
                  style={{ fontFamily: 'Archivo Black, sans-serif' }}
                >
                  Data Structures & Algorithms
                </h3>
                <p className="text-sm opacity-75">
                  Build a strong CS foundation with 24 structured topics.
                </p>
              </div>
              <button
                onClick={() => setModalOpen(true)}
                className="shrink-0 px-5 py-2.5 bg-white text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                style={{ color: 'var(--primary)' }}
              >
                Start Learning
              </button>
            </div>
          </section>
        </main>
      </div>

      <CreateCourseModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
};

export default HomePage;
