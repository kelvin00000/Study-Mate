import { apiCall } from "./apicall";

export interface AchievementStats {
  longestStreak: number;
  totalXp: number;
  topicsCompleted: number;
  coursesEnrolled: number;
  daysAtTop: number;
}

export interface AchievementsResponse {
  stats: AchievementStats;
}

function authHeaders(token: string) {
  return { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
}

export const getAchievements = (token: string): Promise<AchievementsResponse> =>
  apiCall("/streak/achievements", { headers: authHeaders(token) });
