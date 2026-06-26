import { useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { ArrowRight, BookOpen, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Sidebar } from '../components/dashboard/Sidebar';
import { TopBar } from '../components/dashboard/TopBar';
import { DailyStreak } from '../components/dashboard/DailyStreak';
import { CourseCard } from '../components/dashboard/CourseCard';
import { CreateCourseModal } from '../components/dashboard/CreateCourseModal';
import { LeaderboardModal } from '../components/streak/LeaderboardModal';
import { StreakMilestoneToast } from '../components/streak/StreakMilestoneToast';
import WelcomeTrialModal from '../components/dashboard/WelcomeTrialModal';
import { useCourses } from '../hooks/useCourses';
import { useSubscription } from '../hooks/useSubscription';

const HomePage = () => {
  const { user } = useUser();
  const [modalOpen, setModalOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [leaderboardOpen, setLeaderboardOpen] = useState(false);
  const [activeMilestone, setActiveMilestone] = useState<7 | 30 | 100 | null>(null);
  const [welcomeModalOpen] = useState(() => {
    const flag = sessionStorage.getItem("sm:justOnboarded");
    if (flag) {
      sessionStorage.removeItem("sm:justOnboarded");
      return true;
    }
    return false;
  });
  const [welcomeModalVisible, setWelcomeModalVisible] = useState(welcomeModalOpen);
  const { data: courses = [], isLoading } = useCourses();
  const { data: subscription } = useSubscription();

  const recentCourses = courses.slice(0, 3);

  return (
    <div className="flex h-screen font-normal bg-light-cream overflow-hidden">
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
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8 lg:h-[40%]">
            <div className='self-center mt-4 lg:mt-0 lg:w-[60%]'>
              <h1 className="text-xl sm:text-2xl lg:text-3xl text-deep-bluish mb-1 font-semibold">
                Welcome back, {user?.firstName ?? 'Learner'}.
              </h1>
              <p className="text-sm text-muted">
                {isLoading
                  ? 'Loading your courses...'
                  : courses.length > 0
                  ? `You have ${courses.length} active course${courses.length !== 1 ? 's' : ''}. Keep the momentum going!`
                  : "You haven't started any courses yet. Create one to begin!"}
              </p>
              <button
                onClick={() => setLeaderboardOpen(true)}
                className="mt-3 flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl transition-opacity hover:opacity-80 bg-moderate-green/10 hover:cursor-pointer text-moderate-green"
              >
                <Trophy size={13} />
                Leaderboard
              </button>
            </div>
            <DailyStreak onMilestone={(n) => setActiveMilestone(n)} />
          </div>

          {/* Your Courses */}
          <section className="mt-6 lg:mt-0 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2
                className="text-base font-semibold text-deep-bluish"
              >
                Your Courses
              </h2>
              <Link
                to="/courses"
                className="flex items-center gap-1 text-sm font-medium transition-opacity hover:opacity-70 text-moderate-green"
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
                      imageUrl={course.imageUrl}
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
                  className="text-sm font-semibold px-4 py-2 rounded-xl text-white bg-deep-bluish transition-opacity hover:opacity-90"
                >
                  Create Course
                </button>
              </div>
            )}
          </section>

          {/* Featured recommendation */}
          <section>
            <h2 className="text-moderate-green font-semibold mb-4">
              Recommended For You
            </h2>
            <div
              className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white shadow-lg shadow-moderate-green/20 rounded-[20px]"
            >
              <div>
                <div className="flex items-center gap-2 mb-2 opacity-80">
                  <BookOpen size={16} />
                  <span className="text-xs font-semibold uppercase tracking-wide">
                    Featured Course
                  </span>
                </div>
                <h3
                  className="text-lg sm:text-xl font-bold mb-1"
                >
                  Data Structures & Algorithms
                </h3>
                <p className="text-sm opacity-75">
                  Build a strong CS foundation with 24 structured topics.
                </p>
              </div>
              <button
                onClick={() => setModalOpen(true)}
                className="shrink-0 px-5 py-2.5 bg-moderate-green text-sm text-[#FEFEFF] font-semibold rounded-xl transition-all cursor-pointer"
              >
                Start Learning
              </button>
            </div>
          </section>
        </main>
      </div>

      <CreateCourseModal open={modalOpen} onClose={() => setModalOpen(false)} />
      <LeaderboardModal open={leaderboardOpen} onClose={() => setLeaderboardOpen(false)} />
      {subscription && (
        <WelcomeTrialModal
          show={welcomeModalVisible}
          onClose={() => setWelcomeModalVisible(false)}
          isEarlyAdopter={subscription.isEarlyAdopter}
          trialEndDate={subscription.currentPeriodEnd}
        />
      )}
      <AnimatePresence>
        {activeMilestone && (
          <StreakMilestoneToast
            milestone={activeMilestone}
            onDismiss={() => setActiveMilestone(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default HomePage;
