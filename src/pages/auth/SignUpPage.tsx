import { useSignUp } from '@clerk/clerk-react'
import { FcGoogle } from "react-icons/fc";
import { useState } from 'react';
import { BookOpen, Target, BarChart3, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';
import LoadingScreen from '../../components/LoadingScreen';


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
                <nav className="flex items-center justify-between px-6 lg:px-16 py-5">
                    <div className="flex items-center gap-3">
                        <img src="/logo.png" className="w-11 h-11 rounded-[12px]" alt="StudyMate" />
                        <span className="font-bold text-lg text-deep-bluish">Study Mate</span>
                    </div>
                    <button
                        onClick={handleSignUp}
                        className="hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-xl bg-deep-bluish text-white text-sm font-semibold transition-all hover:opacity-90 cursor-pointer"
                    >
                        Get Started
                        <ArrowRight size={15} />
                    </button>
                </nav>

                {/* Hero */}
                <section className="px-6 lg:px-16 pt-12 lg:pt-20 pb-16 lg:pb-24">
                    <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16 max-w-6xl mx-auto">
                        <div className="flex-1 text-center lg:text-left">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-moderate-green/10 text-moderate-green text-xs font-semibold mb-6">
                                <Sparkles size={13} />
                                AI-Powered Learning
                            </div>
                            <h1 className="text-4xl sm:text-5xl lg:text-[3.4rem] font-bold text-deep-bluish leading-tight mb-4">
                                Learn Smarter,{' '}
                                <span className="text-moderate-green">Not Harder.</span>
                            </h1>
                            <p className="text-base lg:text-lg text-laurel-green max-w-lg mx-auto lg:mx-0 mb-8 leading-relaxed">
                                Create personalized courses, chat with an AI tutor, track your progress,
                                and master any subject at your own pace.
                            </p>

                            <div className="flex flex-col sm:flex-row items-center gap-3 justify-center lg:justify-start">
                                <button
                                    onClick={handleSignUp}
                                    className="flex items-center justify-center gap-3 h-13 w-full sm:w-auto px-7 rounded-xl border border-gray-200 bg-white text-sm font-medium text-deep-bluish shadow-sm transition-all hover:shadow-md hover:border-gray-300 cursor-pointer"
                                >
                                    <FcGoogle className="text-xl" />
                                    Continue with Google
                                </button>
                            </div>

                            <div className="flex items-center gap-5 mt-6 justify-center lg:justify-start text-xs text-laurel-green">
                                <span className="flex items-center gap-1.5">
                                    <CheckCircle2 size={13} className="text-moderate-green" />
                                    Free to use
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <CheckCircle2 size={13} className="text-moderate-green" />
                                    No credit card
                                </span>
                            </div>
                        </div>

                        <div className="flex-1 max-w-md lg:max-w-lg">
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
                        </div>
                    </div>
                </section>

                {/* Features */}
                <section className="px-6 lg:px-16 py-16 lg:py-24 bg-white">
                    <div className="max-w-6xl mx-auto">
                        <div className="text-center mb-14">
                            <h2 className="text-2xl sm:text-3xl font-bold text-deep-bluish mb-3">
                                Everything you need to excel
                            </h2>
                            <p className="text-sm text-laurel-green max-w-md mx-auto">
                                Powerful tools designed to make your study sessions more effective and engaging.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                            {[
                                {
                                    icon: BookOpen,
                                    title: 'AI Course Generation',
                                    desc: 'Generate structured courses on any topic with AI-powered content.',
                                    color: '#276152',
                                },
                                {
                                    icon: Sparkles,
                                    title: 'Smart AI Tutor',
                                    desc: 'Chat with an AI tutor that adapts to your learning style.',
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
                                <div
                                    key={f.title}
                                    className="p-6 rounded-2xl bg-light-cream/60 border border-light-cream transition-all hover:shadow-md hover:border-laurel-green/30 group"
                                >
                                    <div
                                        className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                                        style={{ backgroundColor: f.color + '12' }}
                                    >
                                        <f.icon size={20} style={{ color: f.color }} />
                                    </div>
                                    <h3 className="font-semibold text-deep-bluish text-sm mb-1.5">{f.title}</h3>
                                    <p className="text-xs text-laurel-green leading-relaxed">{f.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* How it works */}
                <section className="px-6 lg:px-16 py-16 lg:py-24">
                    <div className="max-w-6xl mx-auto">
                        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
                            <div className="flex-1 max-w-sm">
                                <div className="relative">
                                    <div className="absolute -inset-4 bg-deep-bluish/5 rounded-3xl blur-2xl" />
                                    <img
                                        src="/image-5.png"
                                        alt="Personalized learning path"
                                        className="relative w-full object-contain"
                                    />
                                </div>
                            </div>
                            <div className="flex-1">
                                <h2 className="text-2xl sm:text-3xl font-bold text-deep-bluish mb-8 text-center lg:text-left">
                                    How it works
                                </h2>
                                <div className="space-y-6">
                                    {[
                                        { step: '01', title: 'Create a course', desc: 'Tell us what you want to learn and AI generates a structured course with topics.' },
                                        { step: '02', title: 'Learn with AI', desc: 'Chat with your AI tutor for each topic. It tracks your understanding in real time.' },
                                        { step: '03', title: 'Take quizzes', desc: 'Test your knowledge with AI-generated quizzes. Score 80% to unlock the next topic.' },
                                    ].map((s) => (
                                        <div key={s.step} className="flex gap-5">
                                            <div className="shrink-0 w-10 h-10 rounded-xl bg-moderate-green flex items-center justify-center text-white text-xs font-bold">
                                                {s.step}
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-deep-bluish text-sm mb-1">{s.title}</h3>
                                                <p className="text-xs text-laurel-green leading-relaxed">{s.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <section className="px-6 lg:px-16 py-16 lg:py-20">
                    <div className="max-w-3xl mx-auto text-center bg-deep-bluish rounded-3xl px-8 py-14 lg:py-16">
                        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                            Ready to start learning?
                        </h2>
                        <p className="text-sm text-laurel-green mb-8 max-w-md mx-auto">
                            Join StudyMate and let AI guide your learning journey. It only takes a few seconds.
                        </p>
                        <button
                            onClick={handleSignUp}
                            className="inline-flex items-center justify-center gap-3 h-13 px-8 rounded-xl bg-white text-sm font-semibold text-deep-bluish shadow-lg shadow-black/20 transition-all hover:shadow-xl hover:scale-[1.02] cursor-pointer"
                        >
                            <FcGoogle className="text-xl" />
                            Continue with Google
                        </button>
                    </div>
                </section>

                {/* Footer */}
                <footer className="px-6 lg:px-16 py-8 border-t border-laurel-green/20">
                    <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <img src="/logo.png" className="w-10 h-10 rounded-[10px]" alt="StudyMate" />
                            <span className="font-semibold text-sm text-deep-bluish">Study Mate</span>
                        </div>
                        <p className="text-xs text-laurel-green">
                            Built with AI to help you learn better.
                        </p>
                    </div>
                </footer>
            </div>

            <LoadingScreen loading={showLoader} />
        </>
    );
};

export default SignUpPage;
