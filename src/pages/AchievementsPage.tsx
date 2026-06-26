import { useState } from "react";
import { Menu, CheckCircle, Flame, Zap, BookOpen, Trophy } from "lucide-react";
import { Sidebar } from "../components/dashboard/Sidebar";
import { CreateCourseModal } from "../components/dashboard/CreateCourseModal";
import { useAchievements } from "../hooks/useAchievements";
import { ACHIEVEMENTS, ACHIEVEMENT_CATEGORIES } from "../constants/achievements";

const STAT_CARDS = [
  { label: "Total XP", key: "totalXp" as const, icon: Zap, format: (v: number) => v.toLocaleString() },
  { label: "Longest Streak", key: "longestStreak" as const, icon: Flame, format: (v: number) => `${v} days` },
  { label: "Topics Completed", key: "topicsCompleted" as const, icon: BookOpen, format: (v: number) => String(v) },
  { label: "Days at #1", key: "daysAtTop" as const, icon: Trophy, format: (v: number) => String(v) },
];

const AchievementsPage = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { data, isLoading } = useAchievements();

  const stats = data?.stats;

  return (
    <div className="flex h-screen font-normal bg-light-cream overflow-hidden">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onNewCourse={() => setModalOpen(true)}
      />

      <div className="flex flex-col flex-1 overflow-hidden lg:ml-60">
        {/* Mobile hamburger */}
        <div className="lg:hidden flex items-center px-4 py-3 bg-light-cream">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
          >
            <Menu size={20} />
          </button>
        </div>

        <main className="flex-1 overflow-y-auto px-4 py-6 lg:px-8 lg:py-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-semibold mb-1 text-deep-bluish">
              Achievements
            </h1>
            <p className="text-sm mb-8 text-moderate-green/70">
              Track your milestones and unlock new achievements.
            </p>

            {/* Stats Summary */}
            {isLoading ? (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 mb-10">
                {[1, 2, 3, 4].map((n) => (
                  <div key={n} className="bg-white rounded-2xl p-3.5 sm:p-5 border border-laurel-green/20 animate-pulse">
                    <div className="h-4 w-20 rounded bg-gray-100 mb-3" />
                    <div className="h-7 w-16 rounded bg-gray-100" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 mb-10">
                {STAT_CARDS.map(({ label, key, icon: Icon, format }) => (
                  <div key={key} className="bg-white rounded-2xl p-3.5 sm:p-5 border border-laurel-green/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Icon size={16} className="text-moderate-green" />
                      <span className="text-xs font-medium text-moderate-green/70">{label}</span>
                    </div>
                    <p className="text-xl sm:text-2xl font-semibold text-deep-bluish">
                      {format(stats?.[key] ?? 0)}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Achievement Grid by Category */}
            {isLoading ? (
              <div className="space-y-8">
                {[1, 2, 3].map((n) => (
                  <div key={n}>
                    <div className="h-5 w-32 rounded bg-gray-100 mb-4 animate-pulse" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {[1, 2, 3].map((m) => (
                        <div key={m} className="bg-white rounded-2xl p-5 border border-laurel-green/20 animate-pulse">
                          <div className="h-10 w-10 rounded-full bg-gray-100 mb-3" />
                          <div className="h-4 w-28 rounded bg-gray-100 mb-2" />
                          <div className="h-3 w-40 rounded bg-gray-100 mb-4" />
                          <div className="h-2 w-full rounded bg-gray-100" />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-8">
                {ACHIEVEMENT_CATEGORIES.map((category) => {
                  const items = ACHIEVEMENTS.filter((a) => a.category === category);
                  return (
                    <div key={category}>
                      <h2 className="text-base font-semibold text-deep-bluish mb-4">
                        {category}
                      </h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {items.map((achievement) => {
                          const current = stats?.[achievement.statKey] ?? 0;
                          const unlocked = current >= achievement.threshold;
                          const progress = Math.min(current / achievement.threshold, 1);
                          const Icon = achievement.icon;

                          return (
                            <div
                              key={achievement.id}
                              className={`relative bg-white rounded-2xl p-4 sm:p-5 border transition-all ${
                                unlocked
                                  ? "border-moderate-green/30"
                                  : "border-laurel-green/20 opacity-70"
                              }`}
                            >
                              {unlocked && (
                                <div className="absolute top-3 right-3">
                                  <CheckCircle size={20} className="text-moderate-green" />
                                </div>
                              )}
                              <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 ${
                                  unlocked
                                    ? "bg-moderate-green/10 text-moderate-green"
                                    : "bg-gray-100 text-gray-400"
                                }`}
                              >
                                <Icon size={20} />
                              </div>
                              <h3 className="text-sm font-semibold text-deep-bluish mb-0.5">
                                {achievement.title}
                              </h3>
                              <p className="text-xs text-moderate-green/70 mb-4">
                                {achievement.description}
                              </p>
                              <div className="w-full bg-gray-100 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full transition-all ${
                                    unlocked ? "bg-moderate-green" : "bg-moderate-green/40"
                                  }`}
                                  style={{ width: `${progress * 100}%` }}
                                />
                              </div>
                              <p className="text-xs text-moderate-green/60 mt-1.5">
                                {current.toLocaleString()} / {achievement.threshold.toLocaleString()}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>

      <CreateCourseModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
};

export default AchievementsPage;
