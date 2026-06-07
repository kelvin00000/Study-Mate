import { SignOutButton } from '@clerk/clerk-react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, BookOpen, Library, Trophy, Plus, HelpCircle, LogOut, X, Settings} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import Logo from '../Logo';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onNewCourse: () => void;
}

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  { label: 'My Courses', icon: BookOpen, href: '/courses' },
  { label: 'AI Library', icon: Library, href: '/library' },
  { label: 'Achievements', icon: Trophy, href: '/achievements' },
];

function SidebarContent({ onClose, onNewCourse }: { onClose: () => void; onNewCourse: () => void }) {
    const location = useLocation();

    return (
        <div className="flex flex-col h-full bg-card border-l shadow">
            {/* Logo */}
            <div className="flex items-center justify-start pl-3 w-full h-[10%]">
                <Logo subtitle='Study Effectively' />
            </div>

            {/* Nav items */}
            <nav className="flex-1 px-3 py-2 space-y-0.5">
                {navItems.map(({ label, icon: Icon, href }) => {
                    const active = location.pathname === href;
                    return (
                        <Link
                            key={href}
                            to={href}
                            onClick={onClose}
                            className={`container flex items-center gap-3 px-3 py-2.5 rounded-xl ${active?'bg-[#F8F9FF] text-[#4338CA]':'text-[#475569]'} text-sm font-medium transition-all hover:bg-gray-100 hover:text-gray-900`}
                        >
                            <Icon size={18} color={`${active?'#4338CA':'#475569'}`} className='container-hover:text-gray-900' />
                            {label}
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom section */}
            <div className="lg:self-center p-3 lg:w-[93%] border-t border-t-[#E7ECF3]">
                <button
                    onClick={() => {
                        onNewCourse();
                        onClose();
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-card mb-0.5 bg-[#4648D4]"
                >
                    <Plus size={18} className='text-card' />
                    New Course
                </button>

                <Link
                    to=""
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm mb-0.5 text-[#476272] font-medium transition-all hover:bg-gray-100"
                    >
                    <Settings size={18} />
                    Settings
                </Link>

                <Link
                    to="/help"
                    onClick={onClose}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm mb-0.5 text-[#476272] font-medium transition-all hover:bg-gray-100"
                    >
                    <HelpCircle size={18} />
                    Help Center
                </Link>

                <SignOutButton>
                    <button
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-[#476272] transition-colors duration-200 hover:bg-gray-100 cursor-pointer"
                    >
                        <LogOut size={18} />
                        Log Out
                    </button>
                </SignOutButton>
            </div>
        </div>
    );
}

export function Sidebar({ isOpen, onClose, onNewCourse }: SidebarProps) {
    return (
        <>
            {/* Desktop sidebar — fixed, always visible on lg+ */}
            <div className="hidden lg:block fixed left-0 top-0 h-screen w-60 z-30">
                <SidebarContent onClose={() => {}} onNewCourse={onNewCourse} />
            </div>

            {/* Mobile overlay drawer */}
            <AnimatePresence>
                {isOpen && (
                    <div className="lg:hidden fixed inset-0 z-50">
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="absolute inset-0"
                            style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
                            onClick={onClose}
                        />
                        {/* Drawer */}
                        <motion.div
                            initial={{ x: -240 }}
                            animate={{ x: 0 }}
                            exit={{ x: -240 }}
                            transition={{ duration: 0.25, ease: 'easeOut' }}
                            className="absolute left-0 top-0 h-full w-60 shadow-2xl"
                        >
                        <button
                            onClick={onClose}
                            className="absolute right-3 top-3 z-10 p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                        >
                            <X size={18} />
                        </button>
                        <SidebarContent onClose={onClose} onNewCourse={onNewCourse} />
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
