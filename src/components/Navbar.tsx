import React from 'react';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Upload,
  X
} from 'lucide-react';
import { NavigationRoute } from '../types';

export interface NavbarProps {
  currentPath?: string;
  currentRoute?: NavigationRoute | string;
  onNavigate?: (path: string) => void;
  setCurrentRoute?: (route: NavigationRoute) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onOpenSupabaseModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPath,
  currentRoute,
  onNavigate,
  setCurrentRoute,
  searchQuery,
  setSearchQuery,
}) => {
  const handleNav = (pathOrRoute: string) => {
    if (onNavigate) {
      onNavigate(pathOrRoute);
      return;
    }
    if (setCurrentRoute) {
      const clean = pathOrRoute.replace(/^\//, '') as NavigationRoute;
      setCurrentRoute(clean);
    }
  };

  const activeRoute =
    currentRoute || (currentPath ? currentPath.replace(/^\//, '') : 'home');

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (val.trim() && activeRoute !== 'search' && currentPath !== '/search') {
      handleNav('/search');
    }
  };

  return (
    <header className="h-14 bg-[#151619] border-b border-[#24252b] px-4 flex items-center justify-between gap-4 select-none shrink-0 z-20">
      {/* Left: Navigation History Controls */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          <button
            onClick={() => window.history.back()}
            className="w-7 h-7 rounded-md bg-[#1d1e23] border border-[#2b2d35] flex items-center justify-center text-[#9ba1a6] hover:text-[#f4f4f5] hover:border-[#383a44] transition-colors"
            title="Go back"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => window.history.forward()}
            className="w-7 h-7 rounded-md bg-[#1d1e23] border border-[#2b2d35] flex items-center justify-center text-[#9ba1a6] hover:text-[#f4f4f5] hover:border-[#383a44] transition-colors"
            title="Go forward"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Search Bar: Prominent but compact */}
        <div className="relative w-56 sm:w-80 md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#848a93]" />
          <input
            id="spotibai-global-search"
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search songs, artists, albums, or genres..."
            className="w-full bg-[#1b1c21] border border-[#2b2d35] rounded-md pl-9 pr-8 py-1.5 text-xs text-[#f4f4f5] placeholder-[#70757f] outline-none focus:border-[#4ea824] focus:bg-[#1f2026] transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#848a93] hover:text-[#f4f4f5]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2.5">
        {/* Upload Button */}
        <button
          onClick={() => handleNav('/upload')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#1f2025] hover:bg-[#25272e] border border-[#2f313a] text-xs font-medium text-[#f4f4f5] transition-colors cursor-pointer"
          title="Upload Music"
        >
          <Upload className="w-3.5 h-3.5 text-[#4ea824]" />
          <span>Upload</span>
        </button>
      </div>
    </header>
  );
};
