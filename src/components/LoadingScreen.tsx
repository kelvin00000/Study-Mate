import { motion, AnimatePresence } from "framer-motion";

type LoadingScreenProps = {
  loading: boolean;
};

const particles = Array.from({ length: 12 });

const LoadingScreen = ({ loading }: LoadingScreenProps) => {
    return (
        <AnimatePresence>
            {loading && (
                <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="
                    fixed inset-0 z-999
                    flex items-center justify-center
                    bg-black/25
                    backdrop-blur-md
                "
                >
                <div className="relative flex h-10 w-10 items-center justify-center">

                    {/* Orbit Particles */}
                    {particles.map((_, index) => {
                    const angle = (360 / particles.length) * index;

                    return (
                        <motion.div
                        key={index}
                        animate={{
                            rotate: 360,
                        }}
                        transition={{
                            repeat: Infinity,
                            duration: 4,
                            ease: "linear",
                            delay: index * 0.08,
                        }}
                        className="absolute h-full w-full"
                        style={{
                            rotate: `${angle}deg`,
                        }}
                        >
                        <motion.div
                            animate={{
                                y: [0, -12, 0],
                                scale: [1, 1.4, 1],
                                opacity: [0.5, 1, 0.5],
                            }}
                            transition={{
                                repeat: Infinity,
                                duration: 1.6,
                                delay: index * 0.12,
                            }}
                            className="
                            absolute left-1/2 top-0
                            h-2 w-2 -translate-x-1/2
                            rounded-full
                            bg-(--purple-accent)
                            shadow-[0_0_20px_rgba(101,65,240,0.7)]
                            "
                        />
                        </motion.div>
                    );
                    })}

                    {/* Text */}
                    <motion.p
                    animate={{
                        opacity: [0.4, 1, 0.4],
                    }}
                    transition={{
                        repeat: Infinity,
                        duration: 1.5,
                    }}
                    className="
                        absolute -bottom-12.5
                        text-lg font-semibold
                        text-white
                    "
                    >
                    Loading...
                    </motion.p>
                </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default LoadingScreen;
