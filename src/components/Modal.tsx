import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type MessageModalProps = {
    show: boolean;
    setShow: React.Dispatch<React.SetStateAction<boolean>>;
    message: string;
};

const MessageModal = ({ show, setShow, message }: MessageModalProps) => {
    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="
                        fixed inset-0 z-50
                        flex items-center justify-center
                        bg-black/40 p-4
                        backdrop-blur-sm
                    "
                    >
                    <motion.div
                        initial={{ opacity: 0, y: 30, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 30, scale: 0.95 }}
                        transition={{ duration: 0.25 }}
                        className="
                        relative w-full max-w-sm sm:max-w-md
                        rounded-3xl bg-white
                        p-5 sm:p-8 shadow-2xl
                        "
                    >
                        <button
                            onClick={() => setShow(false)}
                            className="
                            absolute right-4 top-4 flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-light-cream transition hover:bg-laurel-green/20"
                        >
                            <X size={20} className="text-deep-bluish" />
                        </button>

                        <div
                        className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-moderate-green/15">
                        <div className="h-7 w-7 rounded-full bg-moderate-green" />
                        </div>

                        <h2 className="text-2xl font-bold text-deep-bluish">Notice</h2>

                        <p className="mt-4 leading-relaxed text-laurel-green">{message}</p>

                        <button
                            onClick={() => setShow(false)}
                            className="
                            mt-8 h-14 w-full rounded-2xl
                            bg-deep-bluish
                            font-semibold text-white cursor-pointer
                            transition hover:opacity-90"
                        >
                            Close
                        </button>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default MessageModal;
