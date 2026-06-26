import { X, Crown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

type Props = {
  show: boolean;
  onClose: () => void;
  daysRemaining: number;
  expiryDate: string;
};

const RenewalPromptModal = ({ show, onClose, daysRemaining, expiryDate }: Props) => {
  const navigate = useNavigate();

  const formattedDate = new Date(expiryDate).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const handleDismiss = () => {
    sessionStorage.setItem("renewal_dismissed", "1");
    onClose();
  };

  const handleRenew = () => {
    onClose();
    navigate("/pricing");
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className="relative w-full max-w-sm sm:max-w-md rounded-3xl bg-white p-5 sm:p-8 shadow-2xl"
          >
            <button
              onClick={handleDismiss}
              className="absolute right-4 top-4 flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-light-cream transition hover:bg-laurel-green/20 cursor-pointer"
            >
              <X size={20} className="text-deep-bluish" />
            </button>

            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/15">
              <Crown size={28} className="text-amber-500" />
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-deep-bluish">
              Your Pro Plan Expires Soon
            </h2>

            <p className="mt-4 leading-relaxed text-laurel-green">
              Your Pro access expires in{" "}
              <span className="font-semibold text-deep-bluish">
                {daysRemaining <= 0
                  ? "less than a day"
                  : daysRemaining === 1
                    ? "1 day"
                    : `${daysRemaining} days`}
              </span>{" "}
              on{" "}
              <span className="font-semibold text-deep-bluish">{formattedDate}</span>.
              Renew now to keep unlimited courses, chat messages, quizzes, and more.
            </p>

            <button
              onClick={handleRenew}
              className="mt-8 h-14 w-full rounded-2xl bg-deep-bluish font-semibold text-white cursor-pointer transition hover:opacity-90"
            >
              Renew Pro
            </button>

            <button
              onClick={handleDismiss}
              className="mt-3 w-full text-center text-sm font-medium text-moderate-green/70 hover:text-deep-bluish transition-colors cursor-pointer"
            >
              Remind Me Later
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RenewalPromptModal;
