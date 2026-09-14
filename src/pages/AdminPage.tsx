import React, { useState } from 'react';
import {
  ShieldAlert,
  Music,
  Users,
  Download,
  Trash2,
  Play,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { useMusicPlayer } from '../context/MusicPlayerContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Song, NavigationRoute } from '../types';

interface AdminPageProps {
  setCurrentRoute?: (route: NavigationRoute) => void;
  onNavigate?: (path: string) => void;
  onNavigateToSong?: (songId: string) => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({
  setCurrentRoute,
  onNavigate,
  onNavigateToSong,
}) => {
  const { songs, playSong, deleteUploadedSong } = useMusicPlayer();
  const { user, updateProfile } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'overview' | 'songs' | 'users'>('overview');
  const [songToDelete, setSongToDelete] = useState<Song | null>(null);

  // Aggregated metrics
  const totalStreams = songs.reduce((acc, s) => acc + (s.play_count || 0), 0);
  const totalDownloads = songs.reduce((acc, s) => acc + (s.download_count || 0), 0);
  const totalArtists = new Set(songs.map((s) => s.artist)).size;

  const profiles = [
    {
      id: user?.id || 'usr-1',
      username: user?.username || 'Current User',
      email: user?.email || 'admin@spotibai.io',
      role: user?.role || 'admin',
      created_at: '2024-01-10',
      songs_count: songs.filter((s) => s.uploader_id === user?.id || s.is_local).length,
    },
    {
      id: 'usr-2',
      username: 'NeonPulse',
      email: 'neon@spotibai.io',
      role: 'user',
      created_at: '2024-02-14',
      songs_count: 4,
    },
    {
      id: 'usr-3',
      username: 'AuraStudio',
      email: 'aura@spotibai.io',
      role: 'user',
      created_at: '2024-03-01',
      songs_count: 2,
    },
  ];

  const handleConfirmDelete = () => {
    if (!songToDelete) return;
    deleteUploadedSong(songToDelete.id);
    showToast(`Track "${songToDelete.title}" removed by admin`, 'info');
    setSongToDelete(null);
  };

  const toggleAdminRole = async () => {
    const nextRole = user?.role === 'admin' ? 'user' : 'admin';
    await updateProfile({ role: nextRole });
    showToast(`Your account role changed to ${nextRole.toUpperCase()}`, 'success');
  };

  return (
    <div id="spotibai-admin-page" className="p-5 md:p-8 space-y-6 pb-28 max-w-7xl mx-auto select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-[#f4f4f5] tracking-tight">
            Admin Console
          </h1>
          <p className="text-xs text-[#848a93] mt-0.5">
            Platform catalog moderation, analytics, and user access controls.
          </p>
        </div>

        <button
          onClick={toggleAdminRole}
          className="px-3 py-1.5 rounded-md bg-[#1f2025] hover:bg-[#25272e] border border-[#2d2e36] text-xs font-medium text-[#f4f4f5] transition-colors self-start sm:self-auto"
        >
          Active Role: <span className="text-[#4ea824] font-semibold">{user?.role?.toUpperCase() || 'USER'}</span> (Click to switch)
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-4 border-b border-[#24252b]">
        <button
          onClick={() => setActiveTab('overview')}
          className={`py-2 px-1 text-xs font-medium border-b-2 transition-colors ${
            activeTab === 'overview'
              ? 'border-[#4ea824] text-[#f4f4f5] font-semibold'
              : 'border-transparent text-[#848a93] hover:text-[#f4f4f5]'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('songs')}
          className={`py-2 px-1 text-xs font-medium border-b-2 transition-colors ${
            activeTab === 'songs'
              ? 'border-[#4ea824] text-[#f4f4f5] font-semibold'
              : 'border-transparent text-[#848a93] hover:text-[#f4f4f5]'
          }`}
        >
          Catalog Management ({songs.length})
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`py-2 px-1 text-xs font-medium border-b-2 transition-colors ${
            activeTab === 'users'
              ? 'border-[#4ea824] text-[#f4f4f5] font-semibold'
              : 'border-transparent text-[#848a93] hover:text-[#f4f4f5]'
          }`}
        >
          User Accounts ({profiles.length})
        </button>
      </div>

      {/* 1. Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 bg-[#151619] border border-[#24252b] rounded-md">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[#70757f]">
                Total Tracks
              </p>
              <p className="text-xl font-bold font-mono text-[#f4f4f5] mt-1">{songs.length}</p>
            </div>
            <div className="p-4 bg-[#151619] border border-[#24252b] rounded-md">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[#70757f]">
                Total Streams
              </p>
              <p className="text-xl font-bold font-mono text-[#4ea824] mt-1">
                {totalStreams.toLocaleString()}
              </p>
            </div>
            <div className="p-4 bg-[#151619] border border-[#24252b] rounded-md">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[#70757f]">
                Total Downloads
              </p>
              <p className="text-xl font-bold font-mono text-[#f4f4f5] mt-1">
                {totalDownloads.toLocaleString()}
              </p>
            </div>
            <div className="p-4 bg-[#151619] border border-[#24252b] rounded-md">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[#70757f]">
                Unique Artists
              </p>
              <p className="text-xl font-bold font-mono text-[#f4f4f5] mt-1">{totalArtists}</p>
            </div>
          </div>
        </div>
      )}

      {/* 2. Catalog Management Tab */}
      {activeTab === 'songs' && (
        <div className="bg-[#151619] border border-[#24252b] rounded-md overflow-hidden">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#24252b] text-[11px] font-semibold uppercase tracking-wider text-[#60646c]">
                <th className="py-2.5 px-4">Track</th>
                <th className="hidden md:table-cell py-2.5 px-4">Genre</th>
                <th className="hidden sm:table-cell py-2.5 px-4 text-center">Plays</th>
                <th className="hidden sm:table-cell py-2.5 px-4 text-center">Downloads</th>
                <th className="py-2.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e2025]">
              {songs.map((song) => (
                <tr key={song.id} className="hover:bg-[#1a1b20] transition-colors">
                  <td className="py-2.5 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={song.artwork_url}
                        alt={song.title}
                        className="w-9 h-9 rounded object-cover border border-[#26272d] shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="font-medium text-[#f4f4f5] truncate">{song.title}</p>
                        <p className="text-[11px] text-[#70757f] truncate">{song.artist}</p>
                      </div>
                    </div>
                  </td>

                  <td className="hidden md:table-cell py-2.5 px-4 text-[#848a93]">
                    <span className="px-2 py-0.5 rounded bg-[#1f2025] text-[#848a93] text-[10px] font-medium border border-[#2a2c34]">
                      {song.genre}
                    </span>
                  </td>

                  <td className="hidden sm:table-cell py-2.5 px-4 text-center font-mono text-[#848a93]">
                    {song.play_count.toLocaleString()}
                  </td>

                  <td className="hidden sm:table-cell py-2.5 px-4 text-center font-mono text-[#848a93]">
                    {song.download_count.toLocaleString()}
                  </td>

                  <td className="py-2.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => playSong(song)}
                        className="p-1.5 rounded hover:bg-[#202227] text-[#4ea824] transition-colors"
                        title="Test playback"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                      </button>

                      <button
                        onClick={() => setSongToDelete(song)}
                        className="p-1.5 rounded hover:bg-[#202227] text-[#70757f] hover:text-[#e05252] transition-colors"
                        title="Delete track"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 3. Users Tab */}
      {activeTab === 'users' && (
        <div className="bg-[#151619] border border-[#24252b] rounded-md overflow-hidden">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#24252b] text-[11px] font-semibold uppercase tracking-wider text-[#60646c]">
                <th className="py-2.5 px-4">User</th>
                <th className="py-2.5 px-4">Email</th>
                <th className="py-2.5 px-4">Role</th>
                <th className="hidden sm:table-cell py-2.5 px-4 text-center">Tracks Uploaded</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e2025]">
              {profiles.map((p) => (
                <tr key={p.id} className="hover:bg-[#1a1b20] transition-colors">
                  <td className="py-2.5 px-4 font-medium text-[#f4f4f5]">{p.username}</td>
                  <td className="py-2.5 px-4 text-[#848a93]">{p.email}</td>
                  <td className="py-2.5 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-semibold ${
                        p.role === 'admin'
                          ? 'bg-[#4ea824]/15 text-[#4ea824] border border-[#4ea824]/30'
                          : 'bg-[#1f2025] text-[#848a93] border border-[#2a2c34]'
                      }`}
                    >
                      {p.role}
                    </span>
                  </td>
                  <td className="hidden sm:table-cell py-2.5 px-4 text-center font-mono text-[#848a93]">
                    {p.songs_count}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {songToDelete && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-[#18191d] border border-[#2d2e36] rounded-md p-6 w-full max-w-sm space-y-4 shadow-xl text-center">
            <div className="w-10 h-10 rounded-full bg-[#e05252]/10 border border-[#e05252]/30 flex items-center justify-center mx-auto text-[#e05252]">
              <AlertTriangle className="w-5 h-5" />
            </div>

            <div>
              <h3 className="text-sm font-bold text-[#f4f4f5]">Delete track as admin?</h3>
              <p className="text-xs text-[#848a93] mt-1">
                "{songToDelete.title}" will be permanently removed from SPOTIBAI.
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setSongToDelete(null)}
                className="px-3 py-1.5 rounded-md bg-[#202227] hover:bg-[#282a32] text-xs text-[#9ba1a6] hover:text-[#f4f4f5]"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-3.5 py-1.5 rounded-md bg-[#e05252] hover:bg-[#ef4444] text-white text-xs font-semibold"
              >
                Delete Track
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
