import React from 'react';
import {
  Home,
  Search,
  Library,
  ListMusic,
  Heart,
  Upload,
  FileAudio,
  Plus,
  ShieldCheck,
  Settings,
  Disc3
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useMusicPlayer } from '../context/MusicPlayerContext';
import { NavigationRoute } from '../types';

export interface SidebarProps {
  currentPath?: string;
  currentRoute?: NavigationRoute | string;
  onNavigate?: (path: string) => void;
  setCurrentRoute?: (route: NavigationRoute) => void;
  onSelectPlaylist?: (playlistId: string) => void;
  selectedPlaylistId?: string | null;
  onOpenCreatePlaylist?: () => void;
  onOpenSupabaseModal?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPath,
  currentRoute,
  onNavigate,
  setCurrentRoute,
  onSelectPlaylist,
  selectedPlaylistId,
  onOpenCreatePlaylist,
  onOpenSupabaseModal,
}) => {
  const { user } = useAuth();
  const { playlists, favoriteSongIds } = useMusicPlayer();

  const handleNav = (pathOrRoute: string) => {
    if (pathOrRoute.startsWith('/playlist/')) {
      const plId = pathOrRoute.replace('/playlist/', '');
      if (onSelectPlaylist) {
        onSelectPlaylist(plId);
        return;
      }
    }
    if (onNavigate) {
      onNavigate(pathOrRoute);
      return;
    }
    if (setCurrentRoute) {
      const clean = pathOrRoute.replace(/^\//, '') as NavigationRoute;
      setCurrentRoute(clean);
    }
  };

  const handlePlaylistClick = (playlistId: string) => {
    if (onSelectPlaylist) {
      onSelectPlaylist(playlistId);
      return;
    }
    if (onNavigate) {
      onNavigate(`/playlist/${playlistId}`);
      return;
    }
    if (setCurrentRoute) {
      setCurrentRoute('playlist-detail' as any);
    }
  };

  const activeRoute =
    currentRoute || (currentPath ? currentPath.replace(/^\//, '') : 'home');

  const navItems = [
    { path: '/home', route: 'home', label: 'Home', icon: Home },
    { path: '/search', route: 'search', label: 'Search', icon: Search },
    { path: '/library', route: 'library', label: 'Your Library', icon: Library },
    { path: '/playlists', route: 'playlists', label: 'Playlists', icon: ListMusic, count: playlists.length },
    { path: '/liked', route: 'liked', label: 'Liked Songs', icon: Heart, count: favoriteSongIds.length },
    { path: '/upload', route: 'upload', label: 'Upload Music', icon: Upload },
    { path: '/my-uploads', route: 'my-uploads', label: 'My Uploads', icon: FileAudio },
  ];

  return (
    <aside
      id="spotibai-sidebar"
      className="hidden md:flex flex-col w-60 shrink-0 bg-[#151619] border-r border-[#24252b] h-screen select-none z-30"
    >
      {/* SPOTIBAI Brand Header */}
      <div className="h-16 px-5 flex items-center justify-between border-b border-[#24252b]/80">
        <button
          onClick={() => handleNav('/home')}
          className="flex items-center gap-2.5 text-left group cursor-pointer"
        >
          {/* Apple Green Audio Disc Icon */}
          <div className="w-8 h-8 rounded-md bg-[#1f2025] border border-[#2e3038] flex items-center justify-center text-[#4ea824] group-hover:border-[#4ea824]/40 transition-colors">
            <Disc3 className="w-5 h-5 animate-[spin_10s_linear_infinite]" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-base tracking-wide text-[#f4f4f5] font-sans">
              SPOTI<span className="text-[#4ea824]">BAI</span>
            </span>
          </div>
        </button>
      </div>

      {/* Main Navigation - Simple, functional, flat list */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            activeRoute === item.route ||
            (item.route === 'home' && (!activeRoute || activeRoute === 'home'));
          return (
            <button
              key={item.path}
              id={`nav-${item.route}`}
              onClick={() => handleNav(item.path)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium cursor-pointer transition-colors ${
                isActive
                  ? 'bg-[#202227] text-[#f4f4f5] border-l-2 border-[#4ea824] pl-2.5 font-semibold'
                  : 'text-[#9ba1a6] hover:text-[#f4f4f5] hover:bg-[#1a1b1f]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive ? 'text-[#4ea824]' : 'text-[#848a93]'
                  }`}
                />
                <span>{item.label}</span>
              </div>
              {item.count !== undefined && item.count > 0 && (
                <span className="text-xs font-mono text-[#60646c]">
                  {item.count}
                </span>
              )}
            </button>
          );
        })}

        {/* Divider */}
        <div className="pt-4 pb-2 px-3 flex items-center justify-between">
          <button
            onClick={() => handleNav('/playlists')}
            className="text-[11px] font-semibold tracking-wider uppercase text-[#60646c] hover:text-[#9ba1a6] transition-colors cursor-pointer"
          >
            Playlists
          </button>
          {onOpenCreatePlaylist && (
            <button
              onClick={onOpenCreatePlaylist}
              title="Create Playlist"
              className="text-[#848a93] hover:text-[#f4f4f5] p-0.5 rounded hover:bg-[#202227] transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Pinned Playlists List */}
        <div className="space-y-0.5 max-h-48 overflow-y-auto pr-1">
          {playlists.length === 0 ? (
            <p className="px-3 py-1.5 text-xs text-[#60646c] italic">
              No playlists created yet
            </p>
          ) : (
            playlists.map((pl) => {
              const isPlActive =
                (activeRoute === 'playlist-detail' && selectedPlaylistId === pl.id) ||
                currentPath === `/playlist/${pl.id}`;
              return (
                <button
                  key={pl.id}
                  onClick={() => handlePlaylistClick(pl.id)}
                  className={`w-full text-left px-3 py-1.5 rounded-md text-xs truncate transition-colors cursor-pointer ${
                    isPlActive
                      ? 'text-[#4ea824] bg-[#202227] font-medium'
                      : 'text-[#9ba1a6] hover:text-[#f4f4f5] hover:bg-[#1a1b1f]'
                  }`}
                  title={pl.name}
                >
                  {pl.name}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Subtle Bottom Bar: Database status and settings */}
      <div className="p-3 border-t border-[#24252b] bg-[#131416] space-y-1">
        {user?.role === 'admin' && (
          <button
            onClick={() => handleNav('/admin')}
            className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-md text-xs font-medium cursor-pointer transition-colors ${
              activeRoute === 'admin' || currentPath === '/admin'
                ? 'bg-[#202227] text-[#4ea824]'
                : 'text-[#9ba1a6] hover:text-[#f4f4f5] hover:bg-[#1a1b1f]'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-[#4ea824]" />
            <span>Admin Console</span>
          </button>
        )}

        <button
          onClick={() => handleNav('/settings')}
          className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-md text-xs cursor-pointer transition-colors ${
            activeRoute === 'settings' || currentPath === '/settings'
              ? 'bg-[#202227] text-[#4ea824]'
              : 'text-[#9ba1a6] hover:text-[#f4f4f5] hover:bg-[#1a1b1f]'
          }`}
        >
          <Settings className="w-3.5 h-3.5" />
          <span>Audio Settings</span>
        </button>
      </div>
    </aside>
  );
};
