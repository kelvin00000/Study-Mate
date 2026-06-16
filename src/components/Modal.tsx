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
                        relative w-full max-w-md
                        rounded-3xl bg-white
                        p-8 shadow-2xl
                        "
                    >
                        <button
                            onClick={() => setShow(false)}
                            className="
                            absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full bg-[#F3F0FF] transition hover:bg-[#E9E2FF]"
                        >
                            <X size={20} className="text-(--purple-accent)" />
                        </button>

                        <div
                        className=" mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-r from-[#A98BFA] via-[#C4B5FD] to-[#E9D5FF]">
                        <div className="h-7 w-7 rounded-full bg-(--purple-primary)" />
                        </div>

                        <h2 className="text-2xl font-bold text-(--text-primary)">Notice</h2>

                        <p className="mt-4 leading-relaxed text-(--text-secondary)">{message}</p>

                        <button
                            onClick={() => setShow(false)}
                            className="
                            mt-8 h-14 w-full rounded-2xl
                            bg-(--purple-primary)
                            font-semibold text-white
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