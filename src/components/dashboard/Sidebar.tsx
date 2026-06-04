import { SignOutButton } from '@clerk/clerk-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  BookOpen,
  Library,
  Trophy,
  Plus,
  HelpCircle,
  LogOut,
  X,
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

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

function SidebarContent({
  onClose,
  onNewCourse,
}: {
  onClose: () => void;
  onNewCourse: () => void;
}) {
  const location = useLocation();

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: '#1a1333' }}>
      {/* Logo */}
      <div className="px-5 pt-6 pb-4">
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ backgroundColor: 'var(--primary)' }}
          >
            <span className="text-white font-bold text-sm">S</span>
          </div>
          <span
            className="text-white text-lg font-bold"
            style={{ fontFamily: 'Archivo Black, sans-serif' }}
          >
            StudyMate
          </span>
        </div>
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
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors"
              style={{
                backgroundColor: active ? 'var(--primary)' : 'transparent',
                color: active ? '#fff' : 'rgba(255,255,255,0.55)',
              }}
              onMouseEnter={e => {
                if (!active) {
                  (e.currentTarget as HTMLElement).style.backgroundColor =
                    'rgba(255,255,255,0.08)';
                  (e.currentTarget as HTMLElement).style.color = '#fff';
                }
              }}
              onMouseLeave={e => {
                if (!active) {
                  (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
                  (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.55)';
                }
              }}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="p-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
        <button
          onClick={() => {
            onNewCourse();
            onClose();
          }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors mb-0.5"
          style={{ color: 'rgba(255,255,255,0.55)' }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255,255,255,0.08)';
            (e.currentTarget as HTMLElement).style.color = '#fff';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
            (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.55)';
          }}
        >
          <Plus size={18} />
          New Course
        </button>

        <Link
          to="/help"
          onClick={onClose}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors mb-0.5"
          style={{ color: 'rgba(255,255,255,0.55)' }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255,255,255,0.08)';
            (e.currentTarget as HTMLElement).style.color = '#fff';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
            (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.55)';
          }}
        >
          <HelpCircle size={18} />
          Help Center
        </Link>

        <SignOutButton>
          <button
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors"
            style={{ color: 'rgba(239,68,68,0.75)' }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(239,68,68,0.1)';
              (e.currentTarget as HTMLElement).style.color = 'rgb(239,68,68)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
              (e.currentTarget as HTMLElement).style.color = 'rgba(239,68,68,0.75)';
            }}
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
