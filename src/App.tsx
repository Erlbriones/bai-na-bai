import React, { useState, lazy, Suspense } from 'react';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { MusicPlayerProvider } from './context/MusicPlayerContext';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { MusicPlayer } from './components/MusicPlayer';
import { QueuePanel } from './components/QueuePanel';
import { AddToPlaylistModal } from './components/AddToPlaylistModal';
import { CreatePlaylistModal } from './components/CreatePlaylistModal';
import { SupabaseSetupModal } from './components/SupabaseSetupModal';

// Lazy load all page components for code splitting
const HomePage = lazy(() => import('./pages/HomePage').then(m => ({ default: m.HomePage })));
const SearchPage = lazy(() => import('./pages/SearchPage').then(m => ({ default: m.SearchPage })));
const LibraryPage = lazy(() => import('./pages/LibraryPage').then(m => ({ default: m.LibraryPage })));
const LikedSongsPage = lazy(() => import('./pages/LikedSongsPage').then(m => ({ default: m.LikedSongsPage })));
const PlaylistsPage = lazy(() => import('./pages/PlaylistsPage').then(m => ({ default: m.PlaylistsPage })));
const PlaylistDetailPage = lazy(() => import('./pages/PlaylistDetailPage').then(m => ({ default: m.PlaylistDetailPage })));
const SongDetailPage = lazy(() => import('./pages/SongDetailPage').then(m => ({ default: m.SongDetailPage })));
const UploadPage = lazy(() => import('./pages/UploadPage').then(m => ({ default: m.UploadPage })));
const MyUploadsPage = lazy(() => import('./pages/MyUploadsPage').then(m => ({ default: m.MyUploadsPage })));
const ProfilePage = lazy(() => import('./pages/ProfilePage').then(m => ({ default: m.ProfilePage })));
const SettingsPage = lazy(() => import('./pages/SettingsPage').then(m => ({ default: m.SettingsPage })));
const AdminPage = lazy(() => import('./pages/AdminPage').then(m => ({ default: m.AdminPage })));

import { NavigationRoute, Song } from './types';
import { Home, Search, Library, Upload, User } from 'lucide-react';

const SpotibaiApp: React.FC = () => {
  // Navigation routing state
  const [currentRoute, setCurrentRoute] = useState<NavigationRoute>('home');
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null);
  const [selectedSongId, setSelectedSongId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals state
  const [isCreatePlaylistOpen, setIsCreatePlaylistOpen] = useState(false);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);
  const [songToAddToPlaylist, setSongToAddToPlaylist] = useState<Song | null>(null);

  // Navigation handlers
  const handleNavigateToSong = (songId: string) => {
    setSelectedSongId(songId);
    setCurrentRoute('song-detail');
    const scrollEl = document.getElementById('spotibai-main-scroll-view');
    if (scrollEl) scrollEl.scrollTop = 0;
  };

  const handleNavigateToPlaylist = (playlistId: string) => {
    setSelectedPlaylistId(playlistId);
    setCurrentRoute('playlist-detail');
    const scrollEl = document.getElementById('spotibai-main-scroll-view');
    if (scrollEl) scrollEl.scrollTop = 0;
  };

  const handleRouteSelect = (route: NavigationRoute | string) => {
    if (typeof route === 'string' && route.startsWith('/playlist/')) {
      const plId = route.replace('/playlist/', '');
      handleNavigateToPlaylist(plId);
      return;
    }
    if (typeof route === 'string' && route.startsWith('/song/')) {
      const sId = route.replace('/song/', '');
      handleNavigateToSong(sId);
      return;
    }
    const cleanRoute = (typeof route === 'string' ? route.replace(/^\//, '') : route) as NavigationRoute;
    setCurrentRoute(cleanRoute);
    const scrollEl = document.getElementById('spotibai-main-scroll-view');
    if (scrollEl) scrollEl.scrollTop = 0;
  };

  const handleNavigate = (path: string) => {
    if (path.startsWith('/playlist/')) {
      const plId = path.replace('/playlist/', '');
      handleNavigateToPlaylist(plId);
      return;
    }
    if (path.startsWith('/song/')) {
      const sId = path.replace('/song/', '');
      handleNavigateToSong(sId);
      return;
    }
    const cleanPath = path.replace(/^\//, '');
    if (!cleanPath || cleanPath === 'home') {
      handleRouteSelect('home');
    } else {
      handleRouteSelect(cleanPath as NavigationRoute);
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#101114] text-[#f4f4f5] font-sans selection:bg-[#4ea824] selection:text-white">
      {/* 1. Left Sidebar Navigation */}
      <Sidebar
        currentRoute={currentRoute}
        currentPath={`/${currentRoute}`}
        setCurrentRoute={handleRouteSelect}
        onNavigate={handleNavigate}
        onSelectPlaylist={handleNavigateToPlaylist}
        selectedPlaylistId={selectedPlaylistId}
        onOpenCreatePlaylist={() => setIsCreatePlaylistOpen(true)}
        onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
      />

      {/* 2. Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Top Navbar */}
        <Navbar
          currentRoute={currentRoute}
          currentPath={`/${currentRoute}`}
          setCurrentRoute={handleRouteSelect}
          onNavigate={handleNavigate}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
        />

        {/* Scrollable Viewport */}
        <main
          id="spotibai-main-scroll-view"
          className="flex-1 overflow-y-auto overflow-x-hidden bg-[#101114]"
        >
          <Suspense fallback={<div className="p-8 text-center text-[#848a93]">Loading...</div>}>
            {currentRoute === 'home' && (
              <HomePage
                onNavigateToSong={handleNavigateToSong}
                onNavigateToPlaylist={handleNavigateToPlaylist}
                onNavigate={handleNavigate}
                onOpenAddToPlaylist={(song) => setSongToAddToPlaylist(song)}
              />
            )}

            {currentRoute === 'search' && (
              <SearchPage
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                onNavigateToSong={handleNavigateToSong}
                onNavigateToPlaylist={handleNavigateToPlaylist}
                onOpenAddToPlaylist={(song) => setSongToAddToPlaylist(song)}
              />
            )}

            {currentRoute === 'library' && (
              <LibraryPage
                onNavigateToSong={handleNavigateToSong}
                onNavigateToPlaylist={handleNavigateToPlaylist}
                setCurrentRoute={handleRouteSelect}
                onNavigate={handleNavigate}
                onOpenAddToPlaylist={(song) => setSongToAddToPlaylist(song)}
                onOpenCreatePlaylist={() => setIsCreatePlaylistOpen(true)}
              />
            )}

            {currentRoute === 'liked' && (
              <LikedSongsPage
                onNavigateToSong={handleNavigateToSong}
                onOpenAddToPlaylist={(song) => setSongToAddToPlaylist(song)}
              />
            )}

            {currentRoute === 'playlists' && (
              <PlaylistsPage
                onNavigateToPlaylist={handleNavigateToPlaylist}
                onOpenCreatePlaylist={() => setIsCreatePlaylistOpen(true)}
              />
            )}

            {(currentRoute === 'playlist-detail' || currentRoute === 'playlist') && (
              selectedPlaylistId ? (
                <PlaylistDetailPage
                  playlistId={selectedPlaylistId}
                  onNavigateToSong={handleNavigateToSong}
                  setCurrentRoute={handleRouteSelect}
                  onNavigate={handleNavigate}
                  onOpenAddToPlaylist={(song) => setSongToAddToPlaylist(song)}
                />
              ) : (
                <PlaylistsPage
                  onNavigateToPlaylist={handleNavigateToPlaylist}
                  onOpenCreatePlaylist={() => setIsCreatePlaylistOpen(true)}
                />
              )
            )}

            {(currentRoute === 'song-detail' || currentRoute === 'song') && (
              selectedSongId ? (
                <SongDetailPage
                  songId={selectedSongId}
                  onNavigateToSong={handleNavigateToSong}
                  setCurrentRoute={handleRouteSelect}
                  onNavigate={handleNavigate}
                  onOpenAddToPlaylist={(song) => setSongToAddToPlaylist(song)}
                />
              ) : (
                <SearchPage
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  onNavigateToSong={handleNavigateToSong}
                  onNavigateToPlaylist={handleNavigateToPlaylist}
                  onOpenAddToPlaylist={(song) => setSongToAddToPlaylist(song)}
                />
              )
            )}

            {currentRoute === 'upload' && (
              <UploadPage
                setCurrentRoute={handleRouteSelect}
                onNavigate={handleNavigate}
                onNavigateToSong={handleNavigateToSong}
              />
            )}

            {currentRoute === 'my-uploads' && (
              <MyUploadsPage
                setCurrentRoute={handleRouteSelect}
                onNavigate={handleNavigate}
                onNavigateToSong={handleNavigateToSong}
                onOpenAddToPlaylist={(song) => setSongToAddToPlaylist(song)}
              />
            )}

            {currentRoute === 'profile' && (
              <ProfilePage
                setCurrentRoute={handleRouteSelect}
                onNavigate={handleNavigate}
                onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
              />
            )}

            {currentRoute === 'settings' && <SettingsPage />}

            {currentRoute === 'admin' && (
              <AdminPage
                setCurrentRoute={handleRouteSelect}
                onNavigate={handleNavigate}
                onNavigateToSong={handleNavigateToSong}
              />
            )}
          </Suspense>
        </main>

        {/* Floating Play Queue drawer */}
        <QueuePanel />

        {/* Bottom persistent Music Player */}
        <MusicPlayer
          onOpenSongDetail={handleNavigateToSong}
          onOpenAddToPlaylist={(song) => setSongToAddToPlaylist(song)}
        />

        {/* Mobile Bottom Navigation Bar */}
        <nav className="md:hidden flex items-center justify-around py-2 px-3 bg-[#16171b] border-t border-[#24252b] z-20 shrink-0">
          <button
            onClick={() => handleRouteSelect('home')}
            className={`flex flex-col items-center gap-0.5 text-[10px] font-medium transition-colors ${
              currentRoute === 'home' ? 'text-[#4ea824]' : 'text-[#848a93]'
            }`}
          >
            <Home className="w-4 h-4" />
            <span>Home</span>
          </button>
          <button
            onClick={() => handleRouteSelect('search')}
            className={`flex flex-col items-center gap-0.5 text-[10px] font-medium transition-colors ${
              currentRoute === 'search' ? 'text-[#4ea824]' : 'text-[#848a93]'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>Search</span>
          </button>
          <button
            onClick={() => handleRouteSelect('library')}
            className={`flex flex-col items-center gap-0.5 text-[10px] font-medium transition-colors ${
              currentRoute === 'library' ? 'text-[#4ea824]' : 'text-[#848a93]'
            }`}
          >
            <Library className="w-4 h-4" />
            <span>Library</span>
          </button>
          <button
            onClick={() => handleRouteSelect('upload')}
            className={`flex flex-col items-center gap-0.5 text-[10px] font-medium transition-colors ${
              currentRoute === 'upload' ? 'text-[#4ea824]' : 'text-[#848a93]'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Upload</span>
          </button>
          <button
            onClick={() => handleRouteSelect('profile')}
            className={`flex flex-col items-center gap-0.5 text-[10px] font-medium transition-colors ${
              currentRoute === 'profile' ? 'text-[#4ea824]' : 'text-[#848a93]'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Profile</span>
          </button>
        </nav>
      </div>

      {/* Global Modals */}
      <CreatePlaylistModal
        isOpen={isCreatePlaylistOpen}
        onClose={() => setIsCreatePlaylistOpen(false)}
        onPlaylistCreated={handleNavigateToPlaylist}
      />

      <AddToPlaylistModal
        song={songToAddToPlaylist}
        onClose={() => setSongToAddToPlaylist(null)}
      />

      <SupabaseSetupModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <MusicPlayerProvider>
          <SpotibaiApp />
        </MusicPlayerProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
