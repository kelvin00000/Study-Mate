import { useState } from "react";
import { UserButton } from "@clerk/clerk-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  BookOpen,
  MessageCircle,
  Trophy,
  Plus,
  HelpCircle,
  X,
  Settings,
  ChevronDown,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import Logo from "../Logo";
import { useConversations } from "../../hooks/useQuickChat";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onNewCourse: () => void;
}

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { label: "My Courses", icon: BookOpen, href: "/courses" },
  { label: "Quick Chat", icon: MessageCircle, href: "/quick-chat" },
  { label: "Achievements", icon: Trophy, href: "/achievements" },
];

function SidebarContent({
  onClose,
  onNewCourse,
}: {
  onClose: () => void;
  onNewCourse: () => void;
}) {
  const location = useLocation();
  const { data: conversations } = useConversations();
  const [recentChatsOpen, setRecentChatsOpen] = useState(true);
  const recentChats = (conversations ?? []).slice(0, 5);

  return (
    <div className="flex flex-col h-full bg-light-cream border-l shadow">
      {/* Logo */}
      <div className="flex items-center justify-start pl-3 w-full h-[10%]">
        <Logo subtitle="Study Effectively" />
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
        {navItems.map(({ label, icon: Icon, href }) => {
          const active = location.pathname === href || (href === "/quick-chat" && location.pathname.startsWith("/quick-chat"));
          return (
            <Link
              key={href}
              to={href}
              onClick={onClose}
              className={`container flex items-center gap-3 px-3 py-2.5 rounded-xl ${active ? "bg-laurel-green text-deep-bluish" : "text-moderate-green"} text-sm font-semibold transition-all hover:bg-gray-100 hover:text-gray-900`}
            >
              <Icon
                size={18}
                color={`${active ? " #0D3A35" : "#276152"}`}
                className="container-hover:text-gray-900"
              />
              {label}
            </Link>
          );
        })}

        {/* Recent Chats */}
        {recentChats.length > 0 && (
          <div className="mt-4">
            <button
              onClick={() => setRecentChatsOpen(!recentChatsOpen)}
              className="flex items-center gap-2 px-3 py-1.5 w-full text-xs font-semibold uppercase tracking-wide text-moderate-green/60 hover:text-moderate-green transition-colors"
            >
              <ChevronDown
                size={12}
                className={`transition-transform ${recentChatsOpen ? "" : "-rotate-90"}`}
              />
              Recent Chats
            </button>
            {recentChatsOpen && (
              <div className="mt-1 space-y-0.5">
                {recentChats.map((chat) => (
                  <Link
                    key={chat.id}
                    to={`/quick-chat?c=${chat.id}`}
                    onClick={onClose}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-moderate-green/80 hover:bg-gray-100 transition-all truncate"
                  >
                    <MessageCircle size={13} className="shrink-0 opacity-50" />
                    <span className="truncate">{chat.title}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </nav>

      {/* Bottom section */}
      <div className="lg:self-center p-3 lg:w-[93%] border-t border-t-laurel-green/20">
        <button
          onClick={() => {
            onNewCourse();
            onClose();
          }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-card mb-0.5 bg-moderate-green font-medium transition-all hover:bg-laurel-green hover:cursor-pointer"
        >
          <Plus size={18} className="text-card" />
          New Course
        </button>

        <Link
          to="/settings"
          onClick={onClose}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm mb-0.5 text-moderate-green/70 font-medium transition-all hover:bg-gray-100"
        >
          <Settings size={18} />
          Settings
        </Link>

        <Link
          to="/help"
          onClick={onClose}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm mb-0.5 text-moderate-green/70 font-medium transition-all hover:bg-gray-100"
        >
          <HelpCircle size={18} />
          Help Center
        </Link>
        <UserButton
          showName={true}
          appearance={{
            elements: {
              userButtonBox: {
                flexDirection: "row-reverse",
              },
            },
          }}
        />
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
              style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
              onClick={onClose}
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: -240 }}
              animate={{ x: 0 }}
              exit={{ x: -240 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
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
