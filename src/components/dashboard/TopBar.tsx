import { Search, Bell, ThumbsUp, Plus, Zap, Menu } from 'lucide-react';
import { useUser } from '@clerk/clerk-react';

interface TopBarProps {
  onCreateNew: () => void;
  onMenuToggle: () => void;
}

export function TopBar({ onCreateNew, onMenuToggle }: TopBarProps) {
  const { user } = useUser();

  return (
    <header
      className="flex items-center gap-3 px-4 lg:px-6 py-3 bg-white border-b shrink-0"
      style={{ borderColor: 'var(--border)' }}
    >
      {/* Mobile hamburger */}
      <button
        onClick={onMenuToggle}
        className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
      >
        <Menu size={20} />
      </button>

      {/* Search */}
      <div className="relative flex-1 max-w-sm">
        <Search
          size={15}
          className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ color: 'var(--text-secondary)' }}
        />
        <input
          type="text"
          placeholder="Search courses, topics..."
          className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border focus:outline-none transition-colors"
          style={{
            backgroundColor: 'var(--bg)',
            borderColor: 'var(--border)',
            color: 'var(--text-primary)',
          }}
          onFocus={e => {
            e.currentTarget.style.borderColor = 'var(--primary)';
            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(101,65,240,0.1)';
          }}
          onBlur={e => {
            e.currentTarget.style.borderColor = 'var(--border)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        />
      </div>

      {/* Right side actions */}
      <div className="flex items-center gap-1.5 ml-auto">
        {/* Upgrade */}
        <button
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg border transition-colors hover:opacity-80"
          style={{ color: 'var(--primary)', borderColor: 'var(--primary)' }}
        >
          <Zap size={14} />
          Upgrade
        </button>

        {/* Create New */}
        <button
          onClick={onCreateNew}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-white rounded-lg transition-colors hover:opacity-90"
          style={{ backgroundColor: 'var(--primary)' }}
        >
          <Plus size={14} />
          <span className="hidden sm:inline">Create New</span>
        </button>

        {/* Notification icons */}
        <button className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
          <Bell size={18} />
        </button>
        <button className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
          <ThumbsUp size={18} />
        </button>

        {/* User avatar */}
        {user?.imageUrl ? (
          <img
            src={user.imageUrl}
            alt={user.firstName ?? 'User'}
            className="w-8 h-8 rounded-full object-cover border-2 shrink-0"
            style={{ borderColor: 'var(--border)' }}
          />
        ) : (
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
            style={{ backgroundColor: 'var(--primary)' }}
          >
            {user?.firstName?.[0]?.toUpperCase() ?? 'U'}
          </div>
        )}
      </div>
    </header>
  );
}
