import { useEffect, useRef } from "react";
import { useStreak } from "../../hooks/useStreak";

const WEEK_LABELS = ["M", "T", "W", "T", "F", "S", "S"];

interface DailyStreakProps {
  onMilestone?: (n: 7 | 30 | 100) => void;
}

export function DailyStreak({ onMilestone }: DailyStreakProps) {
  const { data: streak } = useStreak();
  const milestoneRef = useRef(false);

  useEffect(() => {
    if (!streak?.milestoneReached || milestoneRef.current || !onMilestone) return;
    milestoneRef.current = true;
    onMilestone(streak.milestoneReached);
  }, [streak?.milestoneReached, onMilestone]);

  const currentStreak = streak?.currentStreak ?? 0;
  const dailyXp = streak?.dailyXp ?? 0;
  const dailyXpGoal = streak?.dailyXpGoal ?? 200;
  const weekDays = streak?.weekDays ?? Array(7).fill(false);
  const xpPercent = Math.min(100, Math.round((dailyXp / dailyXpGoal) * 100));

  return (
    <div className="rounded-2xl p-5 text-white shrink-0 lg:w-[30%] bg-[#6063EE]">
      {!streak ? (
        /* Loading skeleton */
        <div className="flex flex-col gap-3">
          <div className="h-8 w-24 rounded-lg bg-white/20 animate-pulse" />
          <div className="h-3 w-16 rounded bg-white/20 animate-pulse" />
          <div className="flex justify-between mt-2">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <div className="w-4 h-4 rounded-full bg-white/20 animate-pulse" />
                <div className="w-2 h-2 rounded bg-white/20 animate-pulse" />
              </div>
            ))}
          </div>
          <div className="h-2 rounded-full bg-white/20 animate-pulse mt-4" />
        </div>
      ) : (
        <>
          {/* Streak count */}
          <div className="flex items-end gap-2 mb-0.5">
            <span className="text-2xl leading-none">🔥</span>
            <span className="text-3xl font-bold leading-none">{currentStreak}</span>
            <span className="text-base opacity-75 leading-none pb-0.5">Days</span>
          </div>
          <p className="text-sm opacity-70 mt-2">Daily Streak</p>

          {/* 7-day dot grid */}
          <div className="flex justify-between mt-4">
            {WEEK_LABELS.map((label, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <div
                  className={`w-4 h-4 rounded-full ${weekDays[i] ? "bg-white" : "bg-white/30"}`}
                />
                <span className="text-[10px] opacity-60">{label}</span>
              </div>
            ))}
          </div>

          {/* XP bar */}
          <div>
            <div className="flex justify-between text-xs mb-1 opacity-70 mt-4">
              <span className="mb-2">Daily XP</span>
              <span>
                {dailyXp}/{dailyXpGoal}
              </span>
            </div>
            <div className="h-2 bg-[#FFFFFF40] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-white transition-all duration-700"
                style={{ width: `${xpPercent}%` }}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
