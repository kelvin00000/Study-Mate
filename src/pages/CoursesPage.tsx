import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Sidebar } from '../components/dashboard/Sidebar';
import { TopBar } from '../components/dashboard/TopBar';
import { CourseCard } from '../components/dashboard/CourseCard';
import { CreateCourseModal } from '../components/dashboard/CreateCourseModal';
import { useCourses } from '../hooks/useCourses';
import type { CourseListItem } from '../api/courses';

type Filter = 'all' | 'in-progress' | 'completed';

const CoursesPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<Filter>('all');
  const [search, setSearch] = useState('');
  const { data: courses = [], isLoading } = useCourses();

  const tabFiltered = courses.filter((c: CourseListItem) => {
    if (activeFilter === 'in-progress') return c.progressPercent > 0 && c.progressPercent < 100;
    if (activeFilter === 'completed') return c.progressPercent === 100;
    return true;
  });

  const q = search.trim().toLowerCase();
  const filtered = q
    ? tabFiltered.filter(c =>
        c.title.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q) ||
        c.topicTitles.some(t => t.toLowerCase().includes(q))
      )
    : tabFiltered;

  const counts = {
    all: courses.length,
    'in-progress': courses.filter((c: CourseListItem) => c.progressPercent > 0 && c.progressPercent < 100).length,
    completed: courses.filter((c: CourseListItem) => c.progressPercent === 100).length,
  };

  const tabs: { key: Filter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'in-progress', label: 'In Progress' },
    { key: 'completed', label: 'Completed' },
  ];

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
          searchValue={search}
          onSearchChange={setSearch}
        />

        <main className="flex-1 p-6 lg:p-8">
          {/* Page header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1
                className="text-2xl lg:text-3xl font-bold mb-1"
                style={{ fontFamily: 'Archivo Black, sans-serif', color: 'var(--text-primary)' }}
              >
                My Courses
              </h1>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                {isLoading ? '...' : `${counts.all} course${counts.all !== 1 ? 's' : ''} total`}
              </p>
            </div>
            <button
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: 'var(--primary)' }}
            >
              <Plus size={16} />
              New Course
            </button>
          </div>

          {/* Filter tabs */}
          <div className="flex items-center gap-2 mb-6 flex-wrap">
            {tabs.map(tab => {
              const isActive = activeFilter === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveFilter(tab.key)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  style={
                    isActive
                      ? { backgroundColor: 'var(--primary)', color: '#fff' }
                      : { backgroundColor: 'var(--secondary)', color: 'var(--text-secondary)' }
                  }
                >
                  {tab.label}
                  <span
                    className="text-xs px-1.5 py-0.5 rounded-md font-semibold"
                    style={
                      isActive
                        ? { backgroundColor: 'rgba(255,255,255,0.25)', color: '#fff' }
                        : { backgroundColor: 'var(--border)', color: 'var(--text-secondary)' }
                    }
                  >
                    {counts[tab.key]}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Loading skeleton */}
          {isLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {[1, 2, 3].map(n => (
                <div
                  key={n}
                  className="rounded-2xl border p-5 animate-pulse"
                  style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', minHeight: 180 }}
                >
                  <div className="w-11 h-11 rounded-xl mb-4" style={{ backgroundColor: 'var(--secondary)' }} />
                  <div className="h-4 rounded mb-2 w-3/4" style={{ backgroundColor: 'var(--secondary)' }} />
                  <div className="h-3 rounded mb-1 w-full" style={{ backgroundColor: 'var(--secondary)' }} />
                  <div className="h-3 rounded w-2/3" style={{ backgroundColor: 'var(--secondary)' }} />
                </div>
              ))}
            </div>
          )}

          {/* Course grid or empty state */}
          {!isLoading && (
            filtered.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {filtered.map(course => (
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
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="text-5xl mb-4">
                  {q ? '🔍' : activeFilter === 'all' ? '📭' : activeFilter === 'in-progress' ? '📖' : '🏆'}
                </div>
                <p className="text-base font-medium" style={{ color: 'var(--text-primary)' }}>
                  {q
                    ? `No courses found for "${search.trim()}"`
                    : activeFilter === 'all'
                    ? 'No courses yet.'
                    : activeFilter === 'in-progress'
                    ? 'No in-progress courses yet.'
                    : 'No completed courses yet.'}
                </p>
                <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                  {q
                    ? 'Try a different search term or clear the search.'
                    : activeFilter === 'all'
                    ? 'Create your first course to get started.'
                    : activeFilter === 'in-progress'
                    ? 'Start a course to see it here.'
                    : 'Finish a course to see it here.'}
                </p>
                {!q && activeFilter === 'all' && (
                  <button
                    onClick={() => setModalOpen(true)}
                    className="mt-4 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
                    style={{ backgroundColor: 'var(--primary)' }}
                  >
                    <Plus size={16} />
                    New Course
                  </button>
                )}
              </div>
            )
          )}
        </main>
      </div>

      <CreateCourseModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
};

export default CoursesPage;
