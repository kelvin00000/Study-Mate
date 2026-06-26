import { Search, Bell, Menu } from 'lucide-react';
import { UserButton } from '@clerk/clerk-react';

interface TopBarProps {
  onCreateNew: () => void;
  onMenuToggle: () => void;
  showSearch?: boolean;
  searchValue?: string;
  onSearchChange?: (v: string) => void;
}

export function  TopBar({ onMenuToggle, showSearch = false, searchValue, onSearchChange }: TopBarProps) {

    return (
        <header className="flex items-center gap-3 px-4 lg:px-6 py-3 bg-light-cream  shrink-0">
            {/* Mobile hamburger */}
            <button
                onClick={onMenuToggle}
                aria-label="Toggle menu"
                className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
            >
                <Menu size={20} />
            </button>

            {/* Search — only shown when showSearch is true */}
            {showSearch && (
              <div className="relative flex-1 max-w-sm text-[#A7ACB5]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 pointer-events-none" />
                  <input
                      type="text"
                      placeholder="Search courses, topics..."
                      className="w-full pl-9 pr-4 py-2 text-sm text-black bg-white rounded-[25px] border-none focus:outline-none transition-colors"
                      value={searchValue ?? ''}
                      onChange={e => onSearchChange?.(e.target.value)}
                  />
              </div>
            )}

            {/* Right side actions */}
            <div className="flex items-center gap-1.5 ml-auto">
                {/* Create New */}
             
                {/* Notification icons */}
                <div className="flex items-center lg:pl-3 border-l border-l-laurel-green/20">
                     <button aria-label="Notifications" className="p-2 mr-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors cursor-pointer">
                        <Bell size={18} />
                    </button>

                <UserButton/>
                </div>
            </div>
        </header>
    );
}
