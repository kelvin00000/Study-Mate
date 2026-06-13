import { useEffect } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";

interface StreakMilestoneToastProps {
  milestone: 7 | 30 | 100;
  onDismiss: () => void;
}

export function StreakMilestoneToast({ milestone, onDismiss }: StreakMilestoneToastProps) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 4000);
    return () => clearTimeout(t);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 40 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-60 flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl text-white"
      style={{
        background: "linear-gradient(135deg, #6063EE 0%, #8B5CF6 100%)",
        minWidth: 260,
      }}
    >
      <span className="text-3xl leading-none">🔥</span>
      <div className="flex-1">
        <p className="font-bold text-base leading-tight">{milestone}-Day Streak!</p>
        <p className="text-xs opacity-80 mt-0.5">Keep the momentum going!</p>
      </div>
      <button
        onClick={onDismiss}
        className="shrink-0 p-1 rounded-lg opacity-70 hover:opacity-100 transition-opacity"
      >
        <X size={16} />
      </button>
    </motion.div>
  );
}
