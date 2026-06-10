import { Search, Bell, Plus, Zap, Menu } from 'lucide-react';
import { useUser } from '@clerk/clerk-react';

interface TopBarProps {
  onCreateNew: () => void;
  onMenuToggle: () => void;
  searchValue?: string;
  onSearchChange?: (v: string) => void;
}

export function  TopBar({ onCreateNew, onMenuToggle, searchValue, onSearchChange }: TopBarProps) {
    const { user } = useUser();

    return (
        <header className="flex items-center gap-3 px-4 lg:px-6 py-3 bg-white border-b border-b-[#E7ECF3] shrink-0">
            {/* Mobile hamburger */}
            <button
                onClick={onMenuToggle}
                className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
            >
                <Menu size={20} />
            </button>

            {/* Search */}
            <div className="relative flex-1 max-w-sm text-[#A7ACB5]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 pointer-events-none" />
                <input
                    type="text"
                    placeholder="Search courses, topics..."
                    className="w-full pl-9 pr-4 py-2 text-sm text-black bg-[#F8FAFC] rounded-[25px] border-none focus:outline-none transition-colors"
                    value={searchValue ?? ''}
                    onChange={e => onSearchChange?.(e.target.value)}
                />
            </div>

            {/* Right side actions */}
            <div className="flex items-center gap-1.5 ml-auto">
                {/* Upgrade */}
                <button
                    className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-sm text-[#6063EE] font-medium transition-colors hover:opacity-80 cursor-pointer"
                >
                    <Zap size={14} />
                    Upgrade
                </button>

                {/* Create New */}
                <button
                    onClick={onCreateNew}
                    className="hidden lg:flex items-center gap-1.5 px-3 py-2 lg:mr-5 whitespace-nowrap text-sm font-semibold text-white bg-[#6063EE] rounded-lg transition-colors hover:opacity-90 cursor-pointer"
                >
                    <Plus size={14} />
                    <span className="sm:inline wrap-">Create New</span>
                </button>

                {/* Notification icons */}
                <div className="flex items-center lg:pl-3 border-l border-l-[#F8FAFC]">
                     <button className="p-2 mr-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors cursor-pointer">
                        <Bell size={18} />
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
            </div>
        </header>
    );
}
