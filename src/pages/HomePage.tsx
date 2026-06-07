import { useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { ArrowRight, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Sidebar } from '../components/dashboard/Sidebar';
import { TopBar } from '../components/dashboard/TopBar';
import { DailyStreak } from '../components/dashboard/DailyStreak';
import { CourseCard } from '../components/dashboard/CourseCard';
import { CreateCourseModal } from '../components/dashboard/CreateCourseModal';
import { useCourses } from '../hooks/useCourses';

const HomePage = () => {
  const { user } = useUser();
  const [modalOpen, setModalOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { data: courses = [], isLoading } = useCourses();

  const recentCourses = courses.slice(0, 3);

  return (
    <div className="flex h-screen font-normal bg-[#F8F9FF] overflow-hidden">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onNewCourse={() => setModalOpen(true)}
      />

      <div className="flex flex-col flex-1 overflow-hidden lg:ml-60">
        <TopBar
          onCreateNew={() => setModalOpen(true)}
          onMenuToggle={() => setSidebarOpen(true)}
        />

        <main className="flex-1 overflow-y-auto px-4 py-5 lg:px-8 lg:py-7">
          {/* Welcome + Streak */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8 h-[40%]">
            <div className='self-center mt-10 lg:mt-0 lg:w-[60%]'>
              <h1 className="text-2xl lg:text-3xl mb-1 font-semibold">
                Welcome back, {user?.firstName ?? 'Learner'}.
              </h1>
              <p className="text-sm text-muted">
                {isLoading
                  ? 'Loading your courses...'
                  : courses.length > 0
                  ? `You have ${courses.length} active course${courses.length !== 1 ? 's' : ''}. Keep the momentum going!`
                  : "You haven't started any courses yet. Create one to begin!"}
              </p>
            </div>
            <DailyStreak />
          </div>

          {/* Your Courses */}
          <section className="mt-10 lg:mt-0 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2
                className="text-base font-semibold"
                style={{ color: 'var(--text-primary)' }}
              >
                Your Courses
              </h2>
              <Link
                to="/courses"
                className="flex items-center gap-1 text-sm font-medium transition-opacity hover:opacity-70"
                style={{ color: 'var(--primary)' }}
              >
                View all <ArrowRight size={14} />
              </Link>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {[1, 2, 3].map(n => (
                  <div
                    key={n}
                    className="rounded-2xl bg-white p-5 animate-pulse"
                    style={{ minHeight: 160 }}
                  >
                    <div className="w-11 h-11 rounded-xl mb-4 bg-gray-100" />
                    <div className="h-4 rounded mb-2 w-3/4 bg-gray-100" />
                    <div className="h-3 rounded w-full bg-gray-100" />
                  </div>
                ))}
              </div>
            ) : recentCourses.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {recentCourses.map(course => (
                  <Link key={course.id} to={`/courses/${course.id}`} className="block">
                    <CourseCard
                      title={course.title}
                      description={course.description}
                      topicsCompleted={course.topicsCompleted}
                      totalTopics={course.totalTopics}
                      progressPercent={course.progressPercent}
                      color={course.color}
                      icon={course.icon}
                    />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl bg-white p-8 text-center">
                <p className="text-sm mb-3 text-muted">
                  No courses yet. Create your first one!
                </p>
                <button
                  onClick={() => setModalOpen(true)}
                  className="text-sm font-semibold px-4 py-2 rounded-xl text-white bg-[#6063EE] transition-opacity hover:opacity-90"
                >
                  Create Course
                </button>
              </div>
            )}
          </section>

          {/* Featured recommendation */}
          <section>
            <h2 className="text-[#6063EE] font-semibold mb-4">
              Recommended For You
            </h2>
            <div
              className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-[0_15px_25px_rgba(0,0,0,0.1)] rounded-[20px]"
            >
              <div>
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
                className="shrink-0 px-5 py-2.5 bg-[#6063EE] text-sm text-[#FEFEFF] font-semibold rounded-xl transition-all cursor-pointer"
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
