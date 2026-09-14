-- ==============================================================================
-- SPOTIBAI SUPABASE DATABASE & STORAGE SCHEMA
-- Run this script in the Supabase SQL Editor (Dashboard > SQL Editor > New query)
-- ==============================================================================

-- 1. Create Profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create Songs table
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

-- 3. Create Playlists table
CREATE TABLE IF NOT EXISTS public.playlists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  cover_url TEXT,
  owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Create Playlist Songs junction table
CREATE TABLE IF NOT EXISTS public.playlist_songs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  playlist_id UUID REFERENCES public.playlists(id) ON DELETE CASCADE NOT NULL,
  song_id UUID REFERENCES public.songs(id) ON DELETE CASCADE NOT NULL,
  position INTEGER DEFAULT 0 NOT NULL,
  added_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(playlist_id, song_id)
);

-- 5. Create Favorites table (Liked Songs)
CREATE TABLE IF NOT EXISTS public.favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  song_id UUID REFERENCES public.songs(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, song_id)
);

-- 6. Create Listening History table
CREATE TABLE IF NOT EXISTS public.listening_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  song_id UUID REFERENCES public.songs(id) ON DELETE CASCADE NOT NULL,
  played_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Create Downloads table
CREATE TABLE IF NOT EXISTS public.downloads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  song_id UUID REFERENCES public.songs(id) ON DELETE CASCADE NOT NULL,
  downloaded_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create Indexes for fast querying
CREATE INDEX IF NOT EXISTS idx_songs_uploader ON public.songs(uploader_id);
CREATE INDEX IF NOT EXISTS idx_songs_play_count ON public.songs(play_count DESC);
CREATE INDEX IF NOT EXISTS idx_songs_created_at ON public.songs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_favorites_user ON public.favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_playlists_owner ON public.playlists(owner_id);
CREATE INDEX IF NOT EXISTS idx_playlist_songs_playlist ON public.playlist_songs(playlist_id);
CREATE INDEX IF NOT EXISTS idx_listening_history_user ON public.listening_history(user_id, played_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playlist_songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listening_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.downloads ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- RLS POLICIES
-- ==============================================================================

-- Profiles: Public read, User can update own profile
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Songs: Public read, authenticated users can insert, uploaders can update/delete
CREATE POLICY "Songs are viewable by everyone" ON public.songs
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can upload songs" ON public.songs
  FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = uploader_id);

CREATE POLICY "Users can update their own songs" ON public.songs
  FOR UPDATE USING (auth.uid() = uploader_id);

CREATE POLICY "Users can delete their own songs" ON public.songs
  FOR DELETE USING (auth.uid() = uploader_id);

-- Playlists: Public read, owners can create/update/delete
CREATE POLICY "Playlists are viewable by everyone" ON public.playlists
  FOR SELECT USING (true);

CREATE POLICY "Users can create playlists" ON public.playlists
  FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = owner_id);

CREATE POLICY "Owners can update playlists" ON public.playlists
  FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Owners can delete playlists" ON public.playlists
  FOR DELETE USING (auth.uid() = owner_id);

-- Playlist Songs: viewable by everyone, editable by playlist owner
CREATE POLICY "Playlist songs viewable by everyone" ON public.playlist_songs
  FOR SELECT USING (true);

CREATE POLICY "Playlist owners can insert songs" ON public.playlist_songs
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.playlists WHERE id = playlist_id AND owner_id = auth.uid())
  );

CREATE POLICY "Playlist owners can remove songs" ON public.playlist_songs
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.playlists WHERE id = playlist_id AND owner_id = auth.uid())
  );

-- Favorites: Users can manage own favorites
CREATE POLICY "Users can view their own favorites" ON public.favorites
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert favorites" ON public.favorites
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete favorites" ON public.favorites
  FOR DELETE USING (auth.uid() = user_id);

-- Listening History: Users can view & add to own history
CREATE POLICY "Users can view own listening history" ON public.listening_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own listening history" ON public.listening_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Downloads: Users can view own downloads
CREATE POLICY "Users can view own downloads" ON public.downloads
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert downloads" ON public.downloads
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Functions to increment play and download counts safely
CREATE OR REPLACE FUNCTION increment_song_play(song_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.songs
  SET play_count = play_count + 1
  WHERE id = song_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION increment_song_download(song_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.songs
  SET download_count = download_count + 1
  WHERE id = song_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Storage Buckets Setup
-- You can create these in Supabase Dashboard > Storage:
-- 1. 'music' (Public: true)
-- 2. 'artwork' (Public: true)
-- 3. 'avatars' (Public: true)
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('music', 'music', true),
  ('artwork', 'artwork', true),
  ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies
CREATE POLICY "Music files are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'music');

CREATE POLICY "Authenticated users can upload music" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'music' AND auth.role() = 'authenticated');

CREATE POLICY "Artwork files are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'artwork');

CREATE POLICY "Authenticated users can upload artwork" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'artwork' AND auth.role() = 'authenticated');

CREATE POLICY "Avatars are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Authenticated users can upload avatars" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');
