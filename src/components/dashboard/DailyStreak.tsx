const STREAK_DAYS = 12;
const CURRENT_XP = 340;
const TARGET_XP = 500;

export function DailyStreak() {
    const xpPercent = Math.round((CURRENT_XP / TARGET_XP) * 100);

    return (
        <div className="rounded-2xl p-5 text-white shrink-0 lg:w-[30%] h-[50%] lg:h-[90%] bg-[#6063EE]">
            {/* Streak count */}
            <div className="flex items-end gap-2 mb-0.5">
                <span className="text-2xl leading-none">🔥</span>
                <span className="text-3xl font-bold leading-none">{STREAK_DAYS}</span>
                <span className="text-base opacity-75 leading-none pb-0.5">Days</span>
            </div>
            <p className="text-sm opacity-70 mt-2">Daily Streak</p>

            {/* XP bar */}
            <div>
                <div className="flex justify-between text-xs opacity-70 mt-7 lg:mt-12">
                    <span className="mb-2">Daily XP</span>
                    <span>
                        {CURRENT_XP}/{TARGET_XP}
                    </span>
                </div>
                <div className="h-2 bg-[#FFFFFF40] rounded-full overflow-hidden">
                <div
                    className="h-full rounded-full bg-white transition-all duration-700"
                    style={{ width: `${xpPercent}%` }}
                />
                </div>
            </div>
        </div>
    );
}
