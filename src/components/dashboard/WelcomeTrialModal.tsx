import { X, Crown, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Props = {
  show: boolean;
  onClose: () => void;
  isEarlyAdopter: boolean;
  trialEndDate: string | null;
};

const WelcomeTrialModal = ({ show, onClose, isEarlyAdopter, trialEndDate }: Props) => {
  const formattedDate = trialEndDate
    ? new Date(trialEndDate).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : null;

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
              onClick={onClose}
              className="absolute right-4 top-4 flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-light-cream transition hover:bg-laurel-green/20 cursor-pointer"
            >
              <X size={20} className="text-deep-bluish" />
            </button>

            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-moderate-green/15">
              {isEarlyAdopter ? (
                <Crown size={28} className="text-moderate-green" />
              ) : (
                <Sparkles size={28} className="text-moderate-green" />
              )}
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-deep-bluish">
              {isEarlyAdopter ? "You're an Early Adopter!" : "Welcome to StudyMate!"}
            </h2>

            <p className="mt-4 leading-relaxed text-laurel-green">
              {isEarlyAdopter ? (
                <>
                  As one of our first 10 users, you get{" "}
                  <span className="font-semibold text-deep-bluish">3 months of Pro for free</span>
                  — unlimited courses, chat messages, quizzes, Quick Chat, and AI illustrations.
                  {formattedDate && (
                    <>
                      {" "}Your Pro access is valid until{" "}
                      <span className="font-semibold text-deep-bluish">{formattedDate}</span>.
                    </>
                  )}
                </>
              ) : (
                <>
                  You're starting with a{" "}
                  <span className="font-semibold text-deep-bluish">3-day free Pro trial</span>
                  — enjoy unlimited courses, chat messages, quizzes, Quick Chat, and AI illustrations.
                  {formattedDate && (
                    <>
                      {" "}Your trial ends on{" "}
                      <span className="font-semibold text-deep-bluish">{formattedDate}</span>.
                    </>
                  )}
                  {" "}After that, you can upgrade anytime to keep full access.
                </>
              )}
            </p>

            <button
              onClick={onClose}
              className="mt-8 h-14 w-full rounded-2xl bg-deep-bluish font-semibold text-white cursor-pointer transition hover:opacity-90"
            >
              {isEarlyAdopter ? "Let's Go!" : "Start Exploring"}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WelcomeTrialModal;
