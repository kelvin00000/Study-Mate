import { useSignUp } from '@clerk/clerk-react'
import { FcGoogle } from "react-icons/fc";
import { useState } from 'react';
import {
    BookOpen, Target, BarChart3, Sparkles, ArrowRight, CheckCircle2,
    MessageCircle, Brain, GraduationCap, X,
    TrendingUp, Shield, AlarmClock, Puzzle, Headphones, Compass,
    Lightbulb, Rocket,
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
            <title>StudyMate - Understand Any Concept in Minutes</title>

            <div className="min-h-screen bg-light-cream font-normal">
                {/* Nav */}
                <motion.nav
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className="flex items-center justify-between px-4 sm:px-6 lg:px-16 py-5"
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
                <section className="px-4 sm:px-6 lg:px-16 pt-12 lg:pt-20 pb-16 lg:pb-24">
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
                                Understand anything in minutes
                            </motion.div>
                            <motion.h1
                                variants={fadeUp}
                                initial="hidden"
                                animate="visible"
                                custom={0.1}
                                className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.4rem] font-bold text-deep-bluish leading-tight mb-4"
                            >
                                Learn Smarter.{' '}
                                <span className="text-moderate-green">Understand Faster.</span>
                            </motion.h1>
                            <motion.p
                                variants={fadeUp}
                                initial="hidden"
                                animate="visible"
                                custom={0.2}
                                className="text-base lg:text-lg text-laurel-green max-w-lg mx-auto lg:mx-0 mb-8 leading-relaxed"
                            >
                                Stop spending hours confused. StudyMate breaks down any course or concept
                                into bite-sized conversations so you actually understand it — fast.
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
                                className="flex flex-wrap items-center gap-x-4 gap-y-1.5 sm:gap-5 mt-6 justify-center lg:justify-start text-xs text-laurel-green"
                            >
                                <span className="flex items-center gap-1.5">
                                    <CheckCircle2 size={13} className="text-moderate-green" />
                                    Ready in 30 seconds
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <CheckCircle2 size={13} className="text-moderate-green" />
                                    Grasp concepts fast
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <CheckCircle2 size={13} className="text-moderate-green" />
                                    Prove you understand
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
                <section className="px-4 sm:px-6 lg:px-16 py-16 lg:py-24 bg-white">
                    <div className="max-w-6xl mx-auto">
                        <motion.div
                            variants={fadeUp}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: false, amount: 0.2 }}
                            custom={0}
                            className="text-center mb-14"
                        >
                            <h2 className="text-2xl sm:text-3xl font-bold text-deep-bluish mb-3">
                                Sound familiar?
                            </h2>
                            <p className="text-sm text-laurel-green max-w-md mx-auto">
                                You're not alone. Most learners waste hours trying to understand things that should take minutes.
                            </p>
                        </motion.div>

                        <motion.div
                            variants={staggerContainer}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: false, amount: 0.2 }}
                            className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-3xl mx-auto"
                        >
                            {[
                                {
                                    icon: AlarmClock,
                                    title: 'Hours wasted, nothing retained',
                                    quote: '"I studied for 4 hours and still can\'t explain the concept..."',
                                    color: '#8B6914',
                                },
                                {
                                    icon: Puzzle,
                                    title: 'Read it. Forgot it.',
                                    quote: '"I spent hours reading but can\'t remember anything the next day."',
                                    color: '#5B4A8A',
                                },
                                {
                                    icon: Headphones,
                                    title: 'Stuck with no help',
                                    quote: '"It\'s 11pm and I can\'t figure this out. Who do I ask?"',
                                    color: '#2D6A5E',
                                },
                                {
                                    icon: Compass,
                                    title: 'No structure, no direction',
                                    quote: '"I want to learn this topic but I don\'t know where to start."',
                                    color: '#9A5247',
                                },
                            ].map((p) => (
                                <motion.div
                                    key={p.title}
                                    variants={staggerChild}
                                    whileHover={{ y: -4, scale: 1.02 }}
                                    className="bg-light-cream rounded-2xl p-6 border border-transparent hover:border-gray-200 transition-all"
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
                            viewport={{ once: false, amount: 0.2 }}
                            custom={0.3}
                            className="text-center mt-10 text-sm font-semibold text-moderate-green"
                        >
                            What if you could understand any concept in minutes instead?
                        </motion.p>
                    </div>
                </section>

                {/* Features */}
                <section className="px-4 sm:px-6 lg:px-16 py-16 lg:py-24">
                    <div className="max-w-6xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: false, amount: 0.2 }}
                            transition={{ duration: 0.6, ease: 'easeOut' }}
                            className="text-center mb-14"
                        >
                            <h2 className="text-2xl sm:text-3xl font-bold text-deep-bluish mb-3">
                                From confused to confident in minutes
                            </h2>
                            <p className="text-sm text-laurel-green max-w-md mx-auto">
                                Every feature is designed to help you grasp concepts quickly and prove you understand them.
                            </p>
                        </motion.div>

                        <motion.div
                            variants={staggerContainer}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: false, amount: 0.2 }}
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
                        >
                            {[
                                {
                                    icon: BookOpen,
                                    title: 'Instant Course Creation',
                                    desc: 'Type a topic and get a full structured course in seconds — ready to learn.',
                                    color: '#276152',
                                },
                                {
                                    icon: Sparkles,
                                    title: 'AI Tutor That Explains It Right',
                                    desc: 'Have a conversation and understand concepts the way your brain needs to hear them.',
                                    color: '#0D3A35',
                                },
                                {
                                    icon: Target,
                                    title: 'Know When You Get It',
                                    desc: 'Objectives light up as you demonstrate understanding — no guessing if you\'re ready.',
                                    color: '#276152',
                                },
                                {
                                    icon: BarChart3,
                                    title: 'Stay Motivated Daily',
                                    desc: 'Streaks, XP, and leaderboards make every minute of learning count.',
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
                <section className="px-4 sm:px-6 lg:px-16 py-16 lg:py-24 bg-white">
                    <div className="max-w-6xl mx-auto">
                        <motion.div
                            variants={fadeUp}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: false, amount: 0.2 }}
                            custom={0}
                            className="text-center mb-14"
                        >
                            <h2 className="text-2xl sm:text-3xl font-bold text-deep-bluish mb-3">
                                Why it clicks so fast
                            </h2>
                            <p className="text-sm text-laurel-green max-w-lg mx-auto">
                                StudyMate is built around how your brain actually learns — so concepts stick in minutes, not days.
                            </p>
                        </motion.div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                            <motion.div
                                variants={slideInLeft}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: false, amount: 0.2 }}
                                className="space-y-6"
                            >
                                {[
                                    {
                                        icon: Brain,
                                        title: 'Conversation beats textbooks',
                                        desc: 'You learn by talking through concepts, not passively reading. A few minutes of back-and-forth beats hours of highlighting.',
                                    },
                                    {
                                        icon: TrendingUp,
                                        title: 'See understanding happen in real time',
                                        desc: 'Objectives light up as you grasp each concept. You can literally watch yourself go from confused to confident.',
                                    },
                                    {
                                        icon: MessageCircle,
                                        title: 'Get unstuck in seconds, not hours',
                                        desc: 'Confused at midnight? Ask your AI tutor. It breaks down the concept until it makes sense — no waiting, no judgment.',
                                    },
                                    {
                                        icon: Shield,
                                        title: 'Your pace, your way',
                                        desc: 'Some concepts take 2 minutes, some take 10. No pressure, no embarrassing questions — just understanding at your speed.',
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
                                viewport={{ once: false, amount: 0.2 }}
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
                <section className="px-4 sm:px-6 lg:px-16 py-16 lg:py-24">
                    <div className="max-w-6xl mx-auto">
                        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
                            <motion.div
                                variants={slideInLeft}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: false, amount: 0.2 }}
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
                                    viewport={{ once: false, amount: 0.2 }}
                                    transition={{ duration: 0.5, ease: 'easeOut' }}
                                    className="text-2xl sm:text-3xl font-bold text-deep-bluish mb-8 text-center lg:text-left"
                                >
                                    How it works
                                </motion.h2>
                                <motion.div
                                    variants={staggerContainer}
                                    initial="hidden"
                                    whileInView="visible"
                                    viewport={{ once: false, amount: 0.2 }}
                                    className="space-y-6"
                                >
                                    {[
                                        { step: '01', title: 'Pick any topic', desc: 'Type what you want to understand — from "blockchain" to "organic chemistry" — and get a structured course instantly.' },
                                        { step: '02', title: 'Talk it out with AI', desc: 'Chat through each concept one by one. In minutes, not hours, you\'ll actually get it.' },
                                        { step: '03', title: 'Prove you understand', desc: 'Take a quick quiz to confirm mastery. Score 80% and you\'re ready to move on.' },
                                        { step: '04', title: 'Keep the momentum', desc: 'Earn XP, build streaks, and watch yourself go from beginner to confident — topic by topic.' },
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
                <section className="px-4 sm:px-6 lg:px-16 py-16 lg:py-24 bg-white">
                    <div className="max-w-6xl mx-auto">
                        <motion.div
                            variants={fadeUp}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: false, amount: 0.2 }}
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
                            viewport={{ once: false, amount: 0.2 }}
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
                        >
                            {[
                                {
                                    icon: GraduationCap,
                                    title: 'Students',
                                    desc: 'Finally understand that lecture topic in minutes instead of re-reading slides for hours.',
                                    benefits: ['Exam prep', 'Quick concept review', 'Instant clarity'],
                                    color: '#2D6A5E',
                                },
                                {
                                    icon: Lightbulb,
                                    title: 'Self-learners',
                                    desc: 'Curious about something new? Go from zero to solid understanding in one focused session.',
                                    benefits: ['New skills', 'Quick deep-dives', 'Curiosity-driven'],
                                    color: '#8B6914',
                                },
                                {
                                    icon: Rocket,
                                    title: 'Professionals',
                                    desc: 'Need to understand a new framework or concept for work? Get up to speed in minutes, not days.',
                                    benefits: ['Rapid upskilling', 'Certifications', 'Stay current'],
                                    color: '#5B4A8A',
                                },
                            ].map((p) => (
                                <motion.div
                                    key={p.title}
                                    variants={staggerChild}
                                    whileHover={{ y: -6, scale: 1.02 }}
                                    className="p-7 rounded-2xl bg-light-cream border border-transparent hover:border-gray-200 transition-all hover:shadow-lg group"
                                >
                                    <div
                                        className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 transition-colors"
                                        style={{ backgroundColor: p.color + '18' }}
                                    >
                                        <p.icon size={24} style={{ color: p.color }} />
                                    </div>
                                    <h3 className="font-bold text-deep-bluish text-base mb-2">{p.title}</h3>
                                    <p className="text-xs text-laurel-green leading-relaxed mb-4">{p.desc}</p>
                                    <div className="flex flex-wrap gap-2">
                                        {p.benefits.map((b) => (
                                            <span
                                                key={b}
                                                className="text-[11px] px-2.5 py-1 rounded-full font-medium"
                                                style={{ backgroundColor: p.color + '14', color: p.color }}
                                            >
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
                <section className="px-4 sm:px-6 lg:px-16 py-16 lg:py-24">
                    <div className="max-w-4xl mx-auto">
                        <motion.div
                            variants={fadeUp}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: false, amount: 0.2 }}
                            custom={0}
                            className="text-center mb-12"
                        >
                            <h2 className="text-2xl sm:text-3xl font-bold text-deep-bluish mb-3">
                                Hours of confusion vs. minutes of clarity
                            </h2>
                            <p className="text-sm text-laurel-green max-w-md mx-auto">
                                See the difference when learning is designed around understanding, not just reading.
                            </p>
                        </motion.div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <motion.div
                                variants={slideInLeft}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: false, amount: 0.2 }}
                                className="bg-light-cream rounded-2xl p-7 border border-laurel-green/20"
                            >
                                <div className="flex items-center gap-2 mb-5">
                                    <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                                        <X size={16} className="text-red-500" />
                                    </div>
                                    <h3 className="font-bold text-deep-bluish text-sm">The old way</h3>
                                </div>
                                <ul className="space-y-3">
                                    {[
                                        'Spend hours reading without understanding',
                                        'Re-watch lectures hoping it clicks eventually',
                                        'No way to know if you actually get it',
                                        'Stuck for hours with no one to explain',
                                        'Cram for days and still feel unprepared',
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
                                viewport={{ once: false, amount: 0.2 }}
                                className="bg-light-cream rounded-2xl p-7 border border-laurel-green/20"
                            >
                                <div className="flex items-center gap-2 mb-5">
                                    <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                                        <CheckCircle2 size={16} className="text-moderate-green" />
                                    </div>
                                    <h3 className="font-bold text-deep-bluish text-sm">The StudyMate way</h3>
                                </div>
                                <ul className="space-y-3">
                                    {[
                                        'Understand any concept through a quick conversation',
                                        'Grasp topics in minutes, not hours',
                                        'Objectives confirm you actually understand',
                                        'AI tutor explains it until it clicks',
                                        'Quizzes prove you\'re ready to move on',
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
                <section className="px-4 sm:px-6 lg:px-16 py-14 bg-deep-bluish">
                    <motion.div
                        variants={staggerContainer}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: false, amount: 0.2 }}
                        className="max-w-4xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8 text-center"
                    >
                        {[
                            { value: 500, suffix: '+', label: 'Students learning' },
                            { value: 1200, suffix: '+', label: 'Courses created' },
                            { value: 5000, suffix: '+', label: 'Concepts understood' },
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
                <section className="px-4 sm:px-6 lg:px-16 py-16 lg:py-20">
                    <motion.div
                        variants={scaleIn}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: false, amount: 0.2 }}
                        className="max-w-3xl mx-auto text-center bg-deep-bluish rounded-3xl px-5 py-10 sm:px-8 sm:py-14 lg:py-16 relative overflow-hidden"
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
                                viewport={{ once: false, amount: 0.2 }}
                                custom={0.1}
                                className="text-2xl sm:text-3xl font-bold text-white mb-3"
                            >
                                Understand your next concept in minutes
                            </motion.h2>
                            <motion.p
                                variants={fadeUp}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: false, amount: 0.2 }}
                                custom={0.2}
                                className="text-sm text-laurel-green mb-8 max-w-md mx-auto"
                            >
                                Join hundreds of students who stopped wasting hours and started actually understanding. It takes 30 seconds to start.
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
                    viewport={{ once: false, amount: 0.2 }}
                    transition={{ duration: 0.5 }}
                    className="px-6 lg:px-16 py-8 border-t border-laurel-green/20"
                >
                    <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <img src="/logo.png" className="w-10 h-10 rounded-[10px]" alt="StudyMate" />
                            <span className="font-semibold text-sm text-deep-bluish">Study Mate</span>
                        </div>
                        <p className="text-xs text-laurel-green">
                            Understand anything. In minutes.
                        </p>
                    </div>
                </motion.footer>
            </div>

            <LoadingScreen loading={showLoader} />
        </>
    );
};

export default SignUpPage;
