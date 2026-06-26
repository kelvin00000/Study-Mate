import { motion, AnimatePresence } from "framer-motion";
import { X, Trophy, Flame } from "lucide-react";
import { useLeaderboard } from "../../hooks/useStreak";
import type { LeaderboardEntry } from "../../api/streak";

interface LeaderboardModalProps {
  open: boolean;
  onClose: () => void;
}

function AvatarFallback({ name, size = 32 }: { name: string; size?: number }) {
  return (
    <div
      className="rounded-full flex items-center justify-center text-white font-bold shrink-0 bg-moderate-green"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.4,
      }}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

function RankBadge({ rank }: { rank: number }) {
  const medals: Record<number, { bg: string; text: string; label: string }> = {
    1: { bg: "#FEF3C7", text: "#D97706", label: "🥇" },
    2: { bg: "#F3F4F6", text: "#6B7280", label: "🥈" },
    3: { bg: "#FEF0E6", text: "#C2410C", label: "🥉" },
  };
  const medal = medals[rank];
  if (medal) {
    return (
      <span
        className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
        style={{ backgroundColor: medal.bg, color: medal.text }}
      >
        {medal.label}
      </span>
    );
  }
  return (
    <span className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 bg-light-cream text-laurel-green">
      {rank}
    </span>
  );
}

function LeaderboardRow({ entry }: { entry: LeaderboardEntry }) {
  return (
    <div
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl ${entry.isCurrentUser ? "bg-light-cream" : ""}`}
    >
      <RankBadge rank={entry.rank} />

      {entry.avatarUrl ? (
        <img
          src={entry.avatarUrl}
          alt={entry.displayName}
          className="w-8 h-8 rounded-full object-cover shrink-0"
        />
      ) : (
        <AvatarFallback name={entry.displayName} />
      )}

      <span className="flex-1 min-w-0 text-sm font-medium truncate text-deep-bluish">
        {entry.displayName}
        {entry.isCurrentUser && (
          <span className="ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-moderate-green text-white">
            You
          </span>
        )}
      </span>

      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        <div className="flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg bg-moderate-green/10 text-moderate-green">
          <Flame size={11} />
          {entry.currentStreak}d
        </div>
        <span className="text-xs font-bold text-laurel-green">
          {entry.totalXp.toLocaleString()} XP
        </span>
      </div>
    </div>
  );
}

export function LeaderboardModal({ open, onClose }: LeaderboardModalProps) {
  const { data, isLoading } = useLeaderboard(open);

  const showCurrentUserSeparately =
    data?.currentUserEntry &&
    !data.topEntries.some((e) => e.isCurrentUser);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/45 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative w-full max-w-xs sm:max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="px-5 py-4 border-b border-laurel-green/20 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trophy size={18} className="text-moderate-green" />
                <span className="font-bold text-base text-deep-bluish">
                  Leaderboard
                </span>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg transition-colors hover:bg-light-cream text-laurel-green cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* List */}
            <div className="px-3 py-3 max-h-[60vh] overflow-y-auto">
              {isLoading ? (
                <div className="flex flex-col gap-2">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-12 rounded-xl animate-pulse bg-light-cream"
                    />
                  ))}
                </div>
              ) : !data ? (
                <p className="text-sm text-center py-8 text-laurel-green">
                  Failed to load leaderboard.
                </p>
              ) : (
                <>
                  <div className="flex flex-col gap-1">
                    {data.topEntries.map((entry) => (
                      <LeaderboardRow key={entry.userId} entry={entry} />
                    ))}
                  </div>

                  {showCurrentUserSeparately && data.currentUserEntry && (
                    <>
                      <div className="my-3 border-t border-dashed border-laurel-green/20" />
                      <LeaderboardRow entry={data.currentUserEntry} />
                    </>
                  )}
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
