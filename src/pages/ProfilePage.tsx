import React, { useState } from 'react';
import {
  User as UserIcon,
  Mail,
  Shield,
  Save,
  Key,
  Music,
  Heart,
  ListMusic
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useMusicPlayer } from '../context/MusicPlayerContext';
import { useToast } from '../context/ToastContext';
import { NavigationRoute } from '../types';

interface ProfilePageProps {
  setCurrentRoute?: (route: NavigationRoute) => void;
  onNavigate?: (path: string) => void;
  onOpenSupabaseModal: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  setCurrentRoute,
  onNavigate,
  onOpenSupabaseModal,
}) => {
  const { user, updateProfile } = useAuth();
  const { songs, playlists, favoriteSongIds } = useMusicPlayer();
  const { showToast } = useToast();

  const [username, setUsername] = useState(user?.username || 'SonicProducer');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || '');
  const [isSaving, setIsSaving] = useState(false);

  // User statistics
  const userUploads = songs.filter((s) => s.uploader_id === user?.id || s.is_local);
  const totalStreamsReceived = userUploads.reduce((acc, s) => acc + (s.play_count || 0), 0);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;
    setIsSaving(true);
    await updateProfile({
      username: username.trim(),
      avatar_url: avatarUrl.trim() || undefined,
    });
    setIsSaving(false);
  };

  const presetAvatars = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
  ];

  return (
    <div id="spotibai-profile-page" className="p-5 md:p-8 max-w-3xl mx-auto space-y-6 pb-28 select-none">
      {/* Header */}
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-[#f4f4f5] tracking-tight">
          User Account & Profile
        </h1>
        <p className="text-xs text-[#848a93] mt-0.5">
          Manage your account credentials, avatar, and library overview.
        </p>
      </div>

      {/* Profile Overview Card */}
      <div className="bg-[#151619] border border-[#24252b] rounded-md p-6 flex flex-col sm:flex-row items-center sm:items-start gap-6">
        {/* Avatar */}
        <div className="w-24 h-24 rounded-full overflow-hidden border border-[#2d2e36] bg-[#1c1d22] shrink-0">
          {avatarUrl || user?.avatar_url ? (
            <img
              src={avatarUrl || user?.avatar_url}
              alt="Avatar"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[#4ea824] bg-[#1c1d22]">
              <UserIcon className="w-10 h-10" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-2 flex-1 text-center sm:text-left min-w-0">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <h2 className="text-lg font-bold text-[#f4f4f5] truncate">
              {user?.username || 'Guest Producer'}
            </h2>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-semibold ${
                user?.role === 'admin'
                  ? 'bg-[#4ea824]/15 text-[#4ea824] border border-[#4ea824]/30'
                  : 'bg-[#1f2025] text-[#848a93] border border-[#2a2c34]'
              }`}
            >
              {user?.role || 'user'}
            </span>
          </div>

          <p className="text-xs text-[#848a93] flex items-center justify-center sm:justify-start gap-1.5">
            <Mail className="w-3.5 h-3.5 text-[#60646c]" />
            <span>{user?.email || 'guest@spotibai.io'}</span>
          </p>

          <div className="grid grid-cols-3 gap-3 pt-3 border-t border-[#202227] text-center">
            <div className="p-2 bg-[#17181c] border border-[#24252b] rounded">
              <p className="text-[10px] uppercase font-semibold text-[#70757f]">Uploads</p>
              <p className="text-sm font-bold font-mono text-[#f4f4f5] mt-0.5">{userUploads.length}</p>
            </div>
            <div className="p-2 bg-[#17181c] border border-[#24252b] rounded">
              <p className="text-[10px] uppercase font-semibold text-[#70757f]">Playlists</p>
              <p className="text-sm font-bold font-mono text-[#f4f4f5] mt-0.5">{playlists.length}</p>
            </div>
            <div className="p-2 bg-[#17181c] border border-[#24252b] rounded">
              <p className="text-[10px] uppercase font-semibold text-[#70757f]">Liked</p>
              <p className="text-sm font-bold font-mono text-[#4ea824] mt-0.5">{favoriteSongIds.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Form */}
      <div className="bg-[#151619] border border-[#24252b] rounded-md p-5 space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#848a93]">
          Edit Profile Information
        </h3>

        <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
          <div>
            <label className="block text-[#9ba1a6] font-medium mb-1">Display Name</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-[#17181c] border border-[#26272d] rounded-md px-3 py-2 text-[#f4f4f5] outline-none focus:border-[#4ea824]"
              required
            />
          </div>

          <div>
            <label className="block text-[#9ba1a6] font-medium mb-1">Avatar Image URL</label>
            <input
              type="url"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full bg-[#17181c] border border-[#26272d] rounded-md px-3 py-2 text-[#f4f4f5] placeholder-[#60646c] outline-none focus:border-[#4ea824]"
            />
          </div>

          <div>
            <p className="text-[11px] text-[#70757f] mb-1.5">Preset Avatars:</p>
            <div className="flex items-center gap-2">
              {presetAvatars.map((url, i) => (
                <img
                  key={i}
                  src={url}
                  alt={`Preset ${i}`}
                  onClick={() => setAvatarUrl(url)}
                  className={`w-10 h-10 rounded-full object-cover cursor-pointer border transition-colors ${
                    avatarUrl === url ? 'border-[#4ea824]' : 'border-[#26272d] hover:border-[#40424c]'
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end pt-3 border-t border-[#202227]">
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-1.5 px-4 py-2 rounded-md bg-[#4ea824] hover:bg-[#5bbd2d] text-white font-semibold transition-colors disabled:opacity-50 cursor-pointer text-xs"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Supabase credentials modal trigger */}
      <div className="bg-[#151619] border border-[#24252b] rounded-md p-4 flex items-center justify-between">
        <div>
          <h4 className="text-xs font-semibold text-[#f4f4f5]">Supabase Backend Sync</h4>
          <p className="text-[11px] text-[#70757f] mt-0.5">
            Configure custom Supabase project credentials (URL & Anon Key)
          </p>
        </div>
        <button
          onClick={onOpenSupabaseModal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#1f2025] hover:bg-[#25272e] border border-[#2d2e36] text-xs font-medium text-[#f4f4f5] transition-colors"
        >
          <Key className="w-3.5 h-3.5 text-[#4ea824]" />
          <span>Configure Keys</span>
        </button>
      </div>
    </div>
  );
};
