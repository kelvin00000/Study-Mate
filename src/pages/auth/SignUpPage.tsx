import { useSignUp } from '@clerk/clerk-react'
import { FcGoogle } from "react-icons/fc";
import { useState } from 'react';
import {
    BookOpen, Target, BarChart3, Sparkles, ArrowRight, CheckCircle2,
    MessageCircle, Brain, Clock, GraduationCap, Briefcase, X,
    TrendingUp, Shield,
} from 'lucide-react';
import { motion, useInView } from 'motion/react';
import { useRef, useEffect } from 'react';
import LoadingScreen from '../../components/LoadingScreen';

const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: (delay: number = 0) => ({
        opacity: 1, y: 0,
        transition: { duration: 0.6, delay, ease: 'easeOut' as const },
    }),
};

const staggerContainer = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.12 } },
};

const staggerChild = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
};

const slideInLeft = {
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: 'easeOut' as const } },
};

const slideInRight = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: 'easeOut' as const } },
};

const scaleIn = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: 'easeOut' as const } },
};

function AnimatedCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
    const ref = useRef<HTMLSpanElement>(null);
    const isInView = useInView(ref, { once: true });
    const [count, setCount] = useState(0);

    useEffect(() => {
        if (!isInView) return;
        let start = 0;
        const duration = 1500;
        const step = Math.ceil(target / (duration / 16));
        const timer = setInterval(() => {
            start += step;
            if (start >= target) {
                setCount(target);
                clearInterval(timer);
            } else {
                setCount(start);
            }
        }, 16);
        return () => clearInterval(timer);
    }, [isInView, target]);

    return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

const SignUpPage = () => {
    const [showLoader, setShowLoader] = useState(false)
    const { signUp, isLoaded } = useSignUp()

    const handleSignUp = async () => {
        setShowLoader(true)
        if (!isLoaded) return
        try {
            await signUp!.authenticateWithRedirect({
                strategy: 'oauth_google',
                redirectUrl: '/sso-callback',
                redirectUrlComplete: '/onBoarding',
            })
        } catch (err) {
            console.error('Google sign-up error:', err);
            setShowLoader(false)
        }
    }

    return (
        <>
            <title>StudyMate - Your Smart Study Companion</title>

            <div className="min-h-screen bg-light-cream font-normal">
                {/* Nav */}
                <motion.nav
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className="flex items-center justify-between px-6 lg:px-16 py-5"
                >
                    <div className="flex items-center gap-3">
                        <img src="/logo.png" className="w-11 h-11 rounded-[12px]" alt="StudyMate" />
                        <span className="font-bold text-lg text-deep-bluish">Study Mate</span>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={handleSignUp}
                        className="hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-xl bg-deep-bluish text-white text-sm font-semibold transition-all hover:opacity-90 cursor-pointer"
                    >
                        Get Started
                        <ArrowRight size={15} />
                    </motion.button>
                </motion.nav>

                {/* Hero */}
                <section className="px-6 lg:px-16 pt-12 lg:pt-20 pb-16 lg:pb-24">
                    <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16 max-w-6xl mx-auto">
                        <div className="flex-1 text-center lg:text-left">
                            <motion.div
                                variants={fadeUp}
                                initial="hidden"
                                animate="visible"
                                custom={0}
                                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-moderate-green/10 text-moderate-green text-xs font-semibold mb-6"
                            >
                                <Sparkles size={13} />
                                Smart Study Companion
                            </motion.div>
                            <motion.h1
                                variants={fadeUp}
                                initial="hidden"
                                animate="visible"
                                custom={0.1}
                                className="text-4xl sm:text-5xl lg:text-[3.4rem] font-bold text-deep-bluish leading-tight mb-4"
                            >
                                Learn Smarter,{' '}
                                <span className="text-moderate-green">Not Harder.</span>
                            </motion.h1>
                            <motion.p
                                variants={fadeUp}
                                initial="hidden"
                                animate="visible"
                                custom={0.2}
                                className="text-base lg:text-lg text-laurel-green max-w-lg mx-auto lg:mx-0 mb-8 leading-relaxed"
                            >
                                Create personalized courses, get guided explanations, track your progress,
                                and master any subject at your own pace.
                            </motion.p>

                            <motion.div
                                variants={fadeUp}
                                initial="hidden"
                                animate="visible"
                                custom={0.3}
                                className="flex flex-col sm:flex-row items-center gap-3 justify-center lg:justify-start"
                            >
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.97 }}
                                    onClick={handleSignUp}
                                    className="flex items-center justify-center gap-3 h-13 w-full sm:w-auto px-7 rounded-xl border border-gray-200 bg-white text-sm font-medium text-deep-bluish shadow-sm transition-all hover:shadow-md hover:border-gray-300 cursor-pointer"
                                >
                                    <FcGoogle className="text-xl" />
                                    Continue with Google
                                </motion.button>
                            </motion.div>

                            <motion.div
                                variants={fadeUp}
                                initial="hidden"
                                animate="visible"
                                custom={0.4}
                                className="flex items-center gap-5 mt-6 justify-center lg:justify-start text-xs text-laurel-green"
                            >
                                <span className="flex items-center gap-1.5">
                                    <CheckCircle2 size={13} className="text-moderate-green" />
                                    Setup in 30 seconds
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <CheckCircle2 size={13} className="text-moderate-green" />
                                    Learn any subject
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <CheckCircle2 size={13} className="text-moderate-green" />
                                    Track your progress
                                </span>
                            </motion.div>
                        </div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }}
                            className="flex-1 max-w-md lg:max-w-lg"
                        >
                            <div className="relative">
                                <div className="absolute -inset-4 bg-moderate-green/5 rounded-3xl blur-2xl" />
                                <div className="relative bg-white rounded-2xl shadow-xl shadow-deep-bluish/5 p-6 lg:p-8">
                                    <img
                                        src="/image-3.png"
                                        alt="StudyMate dashboard preview"
                                        className="w-full object-contain"
                                    />
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* Pain Points */}
                <section className="px-6 lg:px-16 py-16 lg:py-24 bg-white">
                    <div className="max-w-6xl mx-auto">
                        <motion.div
                            variants={fadeUp}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            custom={0}
                            className="text-center mb-14"
                        >
                            <h2 className="text-2xl sm:text-3xl font-bold text-deep-bluish mb-3">
                                Sound familiar?
                            </h2>
                            <p className="text-sm text-laurel-green max-w-md mx-auto">
                                You're not alone. These are the struggles that hold most students back.
                            </p>
                        </motion.div>

                        <motion.div
                            variants={staggerContainer}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-3xl mx-auto"
                        >
                            {[
                                {
                                    icon: Clock,
                                    title: 'Too much to study, too little time',
                                    quote: '"I have 3 exams this week and I haven\'t even started..."',
                                    color: '#B45309',
                                    bg: 'bg-amber-50',
                                },
                                {
                                    icon: Brain,
                                    title: 'Read it. Forgot it.',
                                    quote: '"I spent hours reading but can\'t remember anything the next day."',
                                    color: '#7C3AED',
                                    bg: 'bg-violet-50',
                                },
                                {
                                    icon: MessageCircle,
                                    title: 'Stuck with no help',
                                    quote: '"It\'s 11pm and I can\'t figure this out. Who do I ask?"',
                                    color: '#0D3A35',
                                    bg: 'bg-emerald-50',
                                },
                                {
                                    icon: Target,
                                    title: 'No structure, no direction',
                                    quote: '"I want to learn this topic but I don\'t know where to start."',
                                    color: '#DC2626',
                                    bg: 'bg-red-50',
                                },
                            ].map((p) => (
                                <motion.div
                                    key={p.title}
                                    variants={staggerChild}
                                    whileHover={{ y: -4, scale: 1.02 }}
                                    className={`${p.bg} rounded-2xl p-6 border border-transparent hover:border-gray-200 transition-all`}
                                >
                                    <div
                                        className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                                        style={{ backgroundColor: p.color + '15' }}
                                    >
                                        <p.icon size={20} style={{ color: p.color }} />
                                    </div>
                                    <h3 className="font-semibold text-deep-bluish text-sm mb-2">{p.title}</h3>
                                    <p className="text-xs text-laurel-green leading-relaxed italic">{p.quote}</p>
                                </motion.div>
                            ))}
                        </motion.div>

                        <motion.p
                            variants={fadeUp}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            custom={0.3}
                            className="text-center mt-10 text-sm font-semibold text-moderate-green"
                        >
                            StudyMate was built to fix all of this.
                        </motion.p>
                    </div>
                </section>

                {/* Features */}
                <section className="px-6 lg:px-16 py-16 lg:py-24">
                    <div className="max-w-6xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, ease: 'easeOut' }}
                            className="text-center mb-14"
                        >
                            <h2 className="text-2xl sm:text-3xl font-bold text-deep-bluish mb-3">
                                Everything you need to excel
                            </h2>
                            <p className="text-sm text-laurel-green max-w-md mx-auto">
                                Powerful tools designed to make your study sessions more effective and engaging.
                            </p>
                        </motion.div>

                        <motion.div
                            variants={staggerContainer}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
                        >
                            {[
                                {
                                    icon: BookOpen,
                                    title: 'Instant Course Creation',
                                    desc: 'Generate structured courses on any topic in seconds.',
                                    color: '#276152',
                                },
                                {
                                    icon: Sparkles,
                                    title: 'Interactive Tutor',
                                    desc: 'Chat with a tutor that adapts to your learning style.',
                                    color: '#0D3A35',
                                },
                                {
                                    icon: Target,
                                    title: 'Learning Objectives',
                                    desc: 'Track what you\'ve learned with auto-evaluated objectives.',
                                    color: '#276152',
                                },
                                {
                                    icon: BarChart3,
                                    title: 'Progress Tracking',
                                    desc: 'Streaks, XP, and leaderboards to keep you motivated.',
                                    color: '#0D3A35',
                                },
                            ].map((f) => (
                                <motion.div
                                    key={f.title}
                                    variants={staggerChild}
                                    whileHover={{ y: -6 }}
                                    className="p-6 rounded-2xl bg-white border border-laurel-green/20 transition-all hover:shadow-md hover:border-laurel-green/40 group"
                                >
                                    <div
                                        className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                                        style={{ backgroundColor: f.color + '12' }}
                                    >
                                        <f.icon size={20} style={{ color: f.color }} />
                                    </div>
                                    <h3 className="font-semibold text-deep-bluish text-sm mb-1.5">{f.title}</h3>
                                    <p className="text-xs text-laurel-green leading-relaxed">{f.desc}</p>
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>
                </section>

                {/* Why StudyMate */}
                <section className="px-6 lg:px-16 py-16 lg:py-24 bg-white">
                    <div className="max-w-6xl mx-auto">
                        <motion.div
                            variants={fadeUp}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            custom={0}
                            className="text-center mb-14"
                        >
                            <h2 className="text-2xl sm:text-3xl font-bold text-deep-bluish mb-3">
                                Why students love StudyMate
                            </h2>
                            <p className="text-sm text-laurel-green max-w-lg mx-auto">
                                It's not just another study tool. It's a complete learning system designed around how you actually learn.
                            </p>
                        </motion.div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                            <motion.div
                                variants={slideInLeft}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true }}
                                className="space-y-6"
                            >
                                {[
                                    {
                                        icon: Brain,
                                        title: 'Built around how your brain works',
                                        desc: 'Active recall through conversation, spaced practice with quizzes, and objective tracking ensure you actually retain what you learn — not just read it.',
                                    },
                                    {
                                        icon: TrendingUp,
                                        title: 'See your progress in real time',
                                        desc: 'Learning objectives light up as you master them. Streaks and XP keep you motivated. You always know exactly where you stand.',
                                    },
                                    {
                                        icon: MessageCircle,
                                        title: 'Get unstuck instantly',
                                        desc: 'Stuck on a concept at midnight? Your tutor is always available to explain, simplify, and guide you through tough topics.',
                                    },
                                    {
                                        icon: Shield,
                                        title: 'Learn at your own pace, judgment-free',
                                        desc: 'No embarrassing questions. No falling behind. Ask anything, revisit topics as many times as you need, and move at your speed.',
                                    },
                                ].map((b) => (
                                    <motion.div
                                        key={b.title}
                                        whileHover={{ x: 6 }}
                                        transition={{ duration: 0.2 }}
                                        className="flex gap-4 group cursor-default"
                                    >
                                        <div className="shrink-0 w-11 h-11 rounded-xl bg-moderate-green/10 flex items-center justify-center group-hover:bg-moderate-green/20 transition-colors">
                                            <b.icon size={20} className="text-moderate-green" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-deep-bluish text-sm mb-1">{b.title}</h3>
                                            <p className="text-xs text-laurel-green leading-relaxed">{b.desc}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </motion.div>

                            <motion.div
                                variants={slideInRight}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true }}
                                className="relative"
                            >
                                <div className="absolute -inset-6 bg-moderate-green/5 rounded-3xl blur-2xl" />
                                <div className="relative bg-light-cream rounded-2xl p-8">
                                    <img
                                        src="/image-5.png"
                                        alt="Learning progress"
                                        className="w-full object-contain"
                                    />
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* How it works */}
                <section className="px-6 lg:px-16 py-16 lg:py-24">
                    <div className="max-w-6xl mx-auto">
                        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
                            <motion.div
                                variants={slideInLeft}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true }}
                                className="flex-1 max-w-sm"
                            >
                                <div className="relative">
                                    <div className="absolute -inset-4 bg-deep-bluish/5 rounded-3xl blur-2xl" />
                                    <img
                                        src="/image-3.png"
                                        alt="Personalized learning path"
                                        className="relative w-full object-contain"
                                    />
                                </div>
                            </motion.div>
                            <div className="flex-1">
                                <motion.h2
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, ease: 'easeOut' }}
                                    className="text-2xl sm:text-3xl font-bold text-deep-bluish mb-8 text-center lg:text-left"
                                >
                                    How it works
                                </motion.h2>
                                <motion.div
                                    variants={staggerContainer}
                                    initial="hidden"
                                    whileInView="visible"
                                    viewport={{ once: true }}
                                    className="space-y-6"
                                >
                                    {[
                                        { step: '01', title: 'Create a course', desc: 'Tell us what you want to learn and get a structured course with topics in seconds.' },
                                        { step: '02', title: 'Learn through conversation', desc: 'Chat your way through each topic. Your understanding is tracked in real time.' },
                                        { step: '03', title: 'Take quizzes', desc: 'Test your knowledge with tailored quizzes. Score 80% to unlock the next topic.' },
                                        { step: '04', title: 'Level up', desc: 'Earn XP, build streaks, and climb the leaderboard as you master new subjects.' },
                                    ].map((s) => (
                                        <motion.div key={s.step} variants={staggerChild} whileHover={{ x: 8 }} className="flex gap-5 cursor-default">
                                            <div className="shrink-0 w-10 h-10 rounded-xl bg-moderate-green flex items-center justify-center text-white text-xs font-bold">
                                                {s.step}
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-deep-bluish text-sm mb-1">{s.title}</h3>
                                                <p className="text-xs text-laurel-green leading-relaxed">{s.desc}</p>
                                            </div>
                                        </motion.div>
                                    ))}
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Who it's for */}
                <section className="px-6 lg:px-16 py-16 lg:py-24 bg-white">
                    <div className="max-w-6xl mx-auto">
                        <motion.div
                            variants={fadeUp}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            custom={0}
                            className="text-center mb-14"
                        >
                            <h2 className="text-2xl sm:text-3xl font-bold text-deep-bluish mb-3">
                                Built for every kind of learner
                            </h2>
                            <p className="text-sm text-laurel-green max-w-md mx-auto">
                                Whether you're in school, self-taught, or leveling up your career — StudyMate adapts to you.
                            </p>
                        </motion.div>

                        <motion.div
                            variants={staggerContainer}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
                        >
                            {[
                                {
                                    icon: GraduationCap,
                                    title: 'Students',
                                    desc: 'Ace your courses with structured study paths and on-demand help for any subject.',
                                    benefits: ['Exam preparation', 'Course review', 'Concept clarity'],
                                },
                                {
                                    icon: Brain,
                                    title: 'Self-learners',
                                    desc: 'Pick up any skill or topic on your own terms, with a system that keeps you on track.',
                                    benefits: ['New skills', 'Career pivots', 'Curiosity-driven'],
                                },
                                {
                                    icon: Briefcase,
                                    title: 'Professionals',
                                    desc: 'Stay sharp and grow your expertise with focused, bite-sized learning sessions.',
                                    benefits: ['Upskilling', 'Certifications', 'Industry knowledge'],
                                },
                            ].map((p) => (
                                <motion.div
                                    key={p.title}
                                    variants={staggerChild}
                                    whileHover={{ y: -6, scale: 1.02 }}
                                    className="p-7 rounded-2xl bg-light-cream/60 border border-laurel-green/20 hover:border-moderate-green/40 transition-all hover:shadow-lg group"
                                >
                                    <div className="w-12 h-12 rounded-xl bg-moderate-green/10 flex items-center justify-center mb-5 group-hover:bg-moderate-green/20 transition-colors">
                                        <p.icon size={24} className="text-moderate-green" />
                                    </div>
                                    <h3 className="font-bold text-deep-bluish text-base mb-2">{p.title}</h3>
                                    <p className="text-xs text-laurel-green leading-relaxed mb-4">{p.desc}</p>
                                    <div className="flex flex-wrap gap-2">
                                        {p.benefits.map((b) => (
                                            <span key={b} className="text-[11px] px-2.5 py-1 rounded-full bg-moderate-green/10 text-moderate-green font-medium">
                                                {b}
                                            </span>
                                        ))}
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>
                </section>

                {/* Old vs New */}
                <section className="px-6 lg:px-16 py-16 lg:py-24">
                    <div className="max-w-4xl mx-auto">
                        <motion.div
                            variants={fadeUp}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            custom={0}
                            className="text-center mb-12"
                        >
                            <h2 className="text-2xl sm:text-3xl font-bold text-deep-bluish mb-3">
                                The old way vs. the StudyMate way
                            </h2>
                            <p className="text-sm text-laurel-green max-w-md mx-auto">
                                See how StudyMate transforms the way you study.
                            </p>
                        </motion.div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <motion.div
                                variants={slideInLeft}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true }}
                                className="bg-red-50/80 rounded-2xl p-7 border border-red-100"
                            >
                                <div className="flex items-center gap-2 mb-5">
                                    <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                                        <X size={16} className="text-red-500" />
                                    </div>
                                    <h3 className="font-bold text-deep-bluish text-sm">The old way</h3>
                                </div>
                                <ul className="space-y-3">
                                    {[
                                        'Scattered notes across apps and notebooks',
                                        'Hours of passive reading and highlighting',
                                        'No way to know if you actually understood',
                                        'Stuck at midnight with no one to ask',
                                        'Cramming before exams with no structure',
                                    ].map((item) => (
                                        <li key={item} className="flex items-start gap-2.5 text-sm text-laurel-green">
                                            <X size={14} className="text-red-400 shrink-0 mt-0.5" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </motion.div>

                            <motion.div
                                variants={slideInRight}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true }}
                                className="bg-emerald-50/80 rounded-2xl p-7 border border-emerald-100"
                            >
                                <div className="flex items-center gap-2 mb-5">
                                    <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                                        <CheckCircle2 size={16} className="text-moderate-green" />
                                    </div>
                                    <h3 className="font-bold text-deep-bluish text-sm">The StudyMate way</h3>
                                </div>
                                <ul className="space-y-3">
                                    {[
                                        'Organized courses with clear topic breakdowns',
                                        'Active learning through conversation',
                                        'Real-time objective tracking shows mastery',
                                        'A tutor available 24/7 for any question',
                                        'Structured paths with quizzes to prove readiness',
                                    ].map((item) => (
                                        <li key={item} className="flex items-start gap-2.5 text-sm text-deep-bluish">
                                            <CheckCircle2 size={14} className="text-moderate-green shrink-0 mt-0.5" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* Stats Banner */}
                <section className="px-6 lg:px-16 py-14 bg-deep-bluish">
                    <motion.div
                        variants={staggerContainer}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        className="max-w-4xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-8 text-center"
                    >
                        {[
                            { value: 500, suffix: '+', label: 'Students learning' },
                            { value: 1200, suffix: '+', label: 'Courses created' },
                            { value: 5000, suffix: '+', label: 'Study sessions' },
                            { value: 10, suffix: '+', label: 'Countries' },
                        ].map((s) => (
                            <motion.div key={s.label} variants={staggerChild}>
                                <div className="text-2xl sm:text-3xl font-bold text-white mb-1">
                                    <AnimatedCounter target={s.value} suffix={s.suffix} />
                                </div>
                                <p className="text-xs text-laurel-green">{s.label}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </section>

                {/* CTA */}
                <section className="px-6 lg:px-16 py-16 lg:py-20">
                    <motion.div
                        variants={scaleIn}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        className="max-w-3xl mx-auto text-center bg-deep-bluish rounded-3xl px-8 py-14 lg:py-16 relative overflow-hidden"
                    >
                        <div className="absolute inset-0 opacity-10">
                            <div className="absolute top-6 left-10 w-20 h-20 rounded-full border-2 border-white" />
                            <div className="absolute bottom-8 right-12 w-32 h-32 rounded-full border-2 border-white" />
                            <div className="absolute top-1/2 left-1/3 w-14 h-14 rounded-full border border-white" />
                        </div>
                        <div className="relative">
                            <motion.h2
                                variants={fadeUp}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true }}
                                custom={0.1}
                                className="text-2xl sm:text-3xl font-bold text-white mb-3"
                            >
                                Your next study session can be smarter
                            </motion.h2>
                            <motion.p
                                variants={fadeUp}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true }}
                                custom={0.2}
                                className="text-sm text-laurel-green mb-8 max-w-md mx-auto"
                            >
                                Join hundreds of students who've already transformed the way they learn. It only takes a few seconds.
                            </motion.p>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={handleSignUp}
                                className="inline-flex items-center justify-center gap-3 h-13 px-8 rounded-xl bg-white text-sm font-semibold text-deep-bluish shadow-lg shadow-black/20 transition-all hover:shadow-xl cursor-pointer"
                            >
                                <FcGoogle className="text-xl" />
                                Continue with Google
                            </motion.button>
                        </div>
                    </motion.div>
                </section>

                {/* Footer */}
                <motion.footer
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="px-6 lg:px-16 py-8 border-t border-laurel-green/20"
                >
                    <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <img src="/logo.png" className="w-10 h-10 rounded-[10px]" alt="StudyMate" />
                            <span className="font-semibold text-sm text-deep-bluish">Study Mate</span>
                        </div>
                        <p className="text-xs text-laurel-green">
                            Built to help you learn better.
                        </p>
                    </div>
                </motion.footer>
            </div>

            <LoadingScreen loading={showLoader} />
        </>
    );
};

export default SignUpPage;
