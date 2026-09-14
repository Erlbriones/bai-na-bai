import React, { useState } from 'react';
import { X, Copy, Check, Database, Key } from 'lucide-react';
import { isSupabaseConfigured, getSupabaseConfigStatus } from '../lib/supabase';
import { useToast } from '../context/ToastContext';

interface SupabaseSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseSetupModal: React.FC<SupabaseSetupModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const { showToast } = useToast();
  const config = getSupabaseConfigStatus();

  if (!isOpen) return null;

  const copyFullSchema = () => {
    const fullSchema = `-- SPOTIBAI Supabase Schema
-- Tables: profiles, songs, playlists, playlist_songs, favorites, play_history, downloads
-- Storage buckets: music, artwork, avatars

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.songs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  album TEXT DEFAULT 'Single',
  genre TEXT DEFAULT 'Various',
  release_year INTEGER DEFAULT EXTRACT(YEAR FROM CURRENT_DATE),
  description TEXT,
  audio_url TEXT NOT NULL,
  artwork_url TEXT NOT NULL,
  uploader_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  play_count INTEGER DEFAULT 0 NOT NULL,
  download_count INTEGER DEFAULT 0 NOT NULL,
  duration INTEGER DEFAULT 180,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.playlists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  cover_url TEXT,
  owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.playlist_songs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  playlist_id UUID REFERENCES public.playlists(id) ON DELETE CASCADE NOT NULL,
  song_id UUID REFERENCES public.songs(id) ON DELETE CASCADE NOT NULL,
  position INTEGER DEFAULT 0 NOT NULL,
  added_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE (playlist_id, song_id)
);

CREATE TABLE IF NOT EXISTS public.favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  song_id UUID REFERENCES public.songs(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE (user_id, song_id)
);

-- Storage bucket creation
INSERT INTO storage.buckets (id, name, public) 
VALUES ('music', 'music', true), ('artwork', 'artwork', true)
ON CONFLICT (id) DO NOTHING;
`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(fullSchema);
      setCopied(true);
      showToast('SQL Schema copied to clipboard!', 'success');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      id="supabase-setup-modal"
      className="fixed inset-0 bg-black/75 backdrop-blur-xs z-50 flex items-center justify-center p-4 select-none"
      onClick={onClose}
    >
      <div
        className="bg-[#18191d] border border-[#2d2e36] rounded-md w-full max-w-lg p-5 shadow-2xl space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-[#24252b]">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-[#4ea824]" />
            <h3 className="text-sm font-bold text-[#f4f4f5]">Supabase Setup & Environment</h3>
          </div>
          <button
            onClick={onClose}
            className="text-[#70757f] hover:text-[#f4f4f5] p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Current Connection Status */}
        <div className="p-3 rounded bg-[#141518] border border-[#24252b] flex items-center justify-between text-xs">
          <div>
            <p className="font-semibold text-[#f4f4f5]">Current Status</p>
            <p className="text-[11px] text-[#70757f] mt-0.5">
              {config.isConfigured
                ? 'Connected to remote Supabase project'
                : 'Running in Local/Offline Mode (IndexedDB & LocalStorage active)'}
            </p>
          </div>
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase ${
              config.isConfigured
                ? 'bg-[#4ea824]/15 text-[#4ea824] border border-[#4ea824]/30'
                : 'bg-[#1f2025] text-[#848a93] border border-[#2a2c34]'
            }`}
          >
            {config.isConfigured ? 'Connected' : 'Local Active'}
          </span>
        </div>

        {/* Vercel / Environment Instructions */}
        <div className="space-y-2 text-xs text-[#9ba1a6]">
          <h4 className="font-semibold text-[#f4f4f5] uppercase tracking-wider text-[11px]">
            To Connect Your Supabase Project (e.g. on Vercel):
          </h4>
          <ol className="list-decimal list-inside space-y-1 text-[#848a93] text-[11px] leading-relaxed">
            <li>
              Set <code className="text-[#4ea824] font-mono">VITE_SUPABASE_URL</code> in your environment or <code className="text-[#f4f4f5] font-mono">.env.local</code>
            </li>
            <li>
              Set <code className="text-[#4ea824] font-mono">VITE_SUPABASE_ANON_KEY</code> with your project's anon/public key.
            </li>
            <li>
              Run the database schema script in your Supabase SQL Editor.
            </li>
          </ol>
        </div>

        {/* Copy SQL button */}
        <div className="pt-2 flex items-center justify-between border-t border-[#24252b]">
          <button
            onClick={copyFullSchema}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#1f2025] hover:bg-[#25272e] border border-[#2d2e36] text-xs font-medium text-[#f4f4f5] transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#4ea824]" />
                <span className="text-[#4ea824]">Schema Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-[#70757f]" />
                <span>Copy SQL Schema</span>
              </>
            )}
          </button>

          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-md bg-[#4ea824] hover:bg-[#5bbd2d] text-white text-xs font-semibold transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
