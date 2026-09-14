export interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  genre: string;
  release_year: number;
  description?: string;
  audio_url: string;
  artwork_url: string;
  uploader_id: string;
  uploader_name?: string;
  play_count: number;
  download_count: number;
  duration?: number; // duration in seconds
  created_at: string;
  is_local?: boolean;
}

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  cover_url?: string;
  owner_id: string;
  owner_name?: string;
  created_at: string;
  song_ids: string[];
}

export interface UserProfile {
  id: string;
  email: string;
  username: string;
  avatar_url?: string;
  role?: 'user' | 'admin';
  created_at: string;
}

export interface ListeningHistoryItem {
  id: string;
  user_id: string;
  song_id: string;
  played_at: string;
  song?: Song;
}

export interface DownloadItem {
  id: string;
  user_id: string;
  song_id: string;
  downloaded_at: string;
  song?: Song;
}

export type RepeatMode = 'off' | 'all' | 'one';

export type NavigationRoute =
  | 'home'
  | 'search'
  | 'library'
  | 'liked'
  | 'playlists'
  | 'playlist'
  | 'playlist-detail'
  | 'song'
  | 'song-detail'
  | 'upload'
  | 'my-uploads'
  | 'profile'
  | 'settings'
  | 'admin'
  | 'login'
  | 'register'
  | 'forgot-password'
  | 'reset-password';
