import { apiCall } from "./apicall";

export interface StreakResponse {
  currentStreak: number;
  longestStreak: number;
  totalXp: number;
  dailyXp: number;
  dailyXpGoal: number;
  lastActivityDate: string | null;
  weekDays: boolean[];
  milestoneReached: 7 | 30 | 100 | null;
}

export interface RecordActivityRequest {
  type: "chat_message" | "topic_complete";
  metadata?: { topicId?: string; courseId?: string };
}

export interface RecordActivityResponse {
  streakUpdated: boolean;
  newStreak: number;
  xpAwarded: number;
  totalXp: number;
  dailyXp: number;
  milestoneReached: 7 | 30 | 100 | null;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  totalXp: number;
  currentStreak: number;
  isCurrentUser: boolean;
}

export interface LeaderboardResponse {
  topEntries: LeaderboardEntry[];
  currentUserEntry: LeaderboardEntry | null;
}

function authHeaders(token: string) {
  return { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
}

export const getStreak = (token: string): Promise<StreakResponse> =>
  apiCall("/streak", { headers: authHeaders(token) });

export const postActivity = (
  token: string,
  body: RecordActivityRequest
): Promise<RecordActivityResponse> =>
  apiCall("/streak/activity", {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(body),
  });

export const getLeaderboard = (
  token: string,
  limit = 10
): Promise<LeaderboardResponse> =>
  apiCall(`/streak/leaderboard?limit=${limit}`, { headers: authHeaders(token) });
