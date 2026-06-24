import { Flame, Zap, BookOpen, Users } from "lucide-react";
import type { AchievementStats } from "../api/achievements";

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: typeof Flame;
  category: "Streaks" | "XP Milestones" | "Learning Progress" | "Leaderboard";
  threshold: number;
  statKey: keyof AchievementStats;
}

export const ACHIEVEMENTS: Achievement[] = [
  // Streaks
  { id: "streak_7", title: "Week Warrior", description: "Maintain a 7-day streak", icon: Flame, category: "Streaks", threshold: 7, statKey: "longestStreak" },
  { id: "streak_30", title: "Monthly Master", description: "Maintain a 30-day streak", icon: Flame, category: "Streaks", threshold: 30, statKey: "longestStreak" },
  { id: "streak_100", title: "Century Streak", description: "Maintain a 100-day streak", icon: Flame, category: "Streaks", threshold: 100, statKey: "longestStreak" },

  // XP Milestones
  { id: "xp_1000", title: "XP Apprentice", description: "Earn 1,000 total XP", icon: Zap, category: "XP Milestones", threshold: 1000, statKey: "totalXp" },
  { id: "xp_5000", title: "XP Scholar", description: "Earn 5,000 total XP", icon: Zap, category: "XP Milestones", threshold: 5000, statKey: "totalXp" },
  { id: "xp_10000", title: "XP Master", description: "Earn 10,000 total XP", icon: Zap, category: "XP Milestones", threshold: 10000, statKey: "totalXp" },

  // Learning Progress
  { id: "topics_5", title: "First Steps", description: "Complete 5 topics", icon: BookOpen, category: "Learning Progress", threshold: 5, statKey: "topicsCompleted" },
  { id: "topics_25", title: "Knowledge Seeker", description: "Complete 25 topics", icon: BookOpen, category: "Learning Progress", threshold: 25, statKey: "topicsCompleted" },
  { id: "topics_50", title: "Topic Titan", description: "Complete 50 topics", icon: BookOpen, category: "Learning Progress", threshold: 50, statKey: "topicsCompleted" },
  { id: "courses_1", title: "Course Creator", description: "Enroll in your first course", icon: BookOpen, category: "Learning Progress", threshold: 1, statKey: "coursesEnrolled" },
  { id: "courses_5", title: "Lifelong Learner", description: "Enroll in 5 courses", icon: BookOpen, category: "Learning Progress", threshold: 5, statKey: "coursesEnrolled" },

  // Leaderboard
  { id: "leader_1", title: "Top of the Class", description: "Spend 1 day at #1", icon: Users, category: "Leaderboard", threshold: 1, statKey: "daysAtTop" },
  { id: "leader_7", title: "Weekly Champion", description: "Spend 7 days at #1", icon: Users, category: "Leaderboard", threshold: 7, statKey: "daysAtTop" },
  { id: "leader_30", title: "Reigning Champion", description: "Spend 30 days at #1", icon: Users, category: "Leaderboard", threshold: 30, statKey: "daysAtTop" },
];

export const ACHIEVEMENT_CATEGORIES = ["Streaks", "XP Milestones", "Learning Progress", "Leaderboard"] as const;
