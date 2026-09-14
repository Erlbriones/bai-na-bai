import { useQuery, useMutation, useQueryClient, QueryClient } from '@tanstack/react-query';
import { supabase, isSupabaseConfigured } from './supabase';
import { Song, Playlist, UserProfile } from '../types';

// Create a QueryClient instance with optimized defaults
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes - data is fresh for 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes - garbage collection time (formerly cacheTime)
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
    },
  },
});

// Query keys for cache management
export const queryKeys = {
  songs: ['songs'] as const,
  song: (id: string) => ['songs', id] as const,
  playlists: ['playlists'] as const,
  playlist: (id: string) => ['playlists', id] as const,
  favorites: (userId: string) => ['favorites', userId] as const,
  listeningHistory: (userId: string) => ['listeningHistory', userId] as const,
  downloads: (userId: string) => ['downloads', userId] as const,
  profile: (userId: string) => ['profile', userId] as const,
};

// ============================================
// SONGS QUERIES
// ============================================

export const useSongs = () => {
  return useQuery({
    queryKey: queryKeys.songs,
    queryFn: async (): Promise<Song[]> => {
      if (!isSupabaseConfigured || !supabase) {
        return [];
      }
      
      const { data, error } = await supabase
        .from('songs')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    staleTime: 10 * 60 * 1000, // 10 minutes for songs (relatively stable)
  });
};

export const useSong = (id: string) => {
  return useQuery({
    queryKey: queryKeys.song(id),
    queryFn: async (): Promise<Song | null> => {
      if (!isSupabaseConfigured || !supabase || !id) {
        return null;
      }
      
      const { data, error } = await supabase
        .from('songs')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!id,
    staleTime: 15 * 60 * 1000, // 15 minutes for individual song
  });
};

// ============================================
// PLAYLISTS QUERIES
// ============================================

export const usePlaylists = () => {
  return useQuery({
    queryKey: queryKeys.playlists,
    queryFn: async (): Promise<Playlist[]> => {
      if (!isSupabaseConfigured || !supabase) {
        return [];
      }
      
      const { data, error } = await supabase
        .from('playlists')
        .select('*, playlist_songs(song_id, position)')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return (data || []).map((pl: any) => ({
        id: pl.id,
        name: pl.name,
        description: pl.description,
        cover_url: pl.cover_url,
        owner_id: pl.owner_id,
        created_at: pl.created_at,
        song_ids: (pl.playlist_songs || [])
          .sort((a: any, b: any) => a.position - b.position)
          .map((ps: any) => ps.song_id),
      }));
    },
    staleTime: 5 * 60 * 1000, // 5 minutes for playlists
  });
};

export const usePlaylist = (id: string) => {
  return useQuery({
    queryKey: queryKeys.playlist(id),
    queryFn: async (): Promise<Playlist | null> => {
      if (!isSupabaseConfigured || !supabase || !id) {
        return null;
      }
      
      const { data, error } = await supabase
        .from('playlists')
        .select('*, playlist_songs(song_id, position)')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      return {
        id: data.id,
        name: data.name,
        description: data.description,
        cover_url: data.cover_url,
        owner_id: data.owner_id,
        created_at: data.created_at,
        song_ids: (data.playlist_songs || [])
          .sort((a: any, b: any) => a.position - b.position)
          .map((ps: any) => ps.song_id),
      };
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

// ============================================
// FAVORITES QUERIES
// ============================================

export const useFavorites = (userId: string | undefined) => {
  return useQuery({
    queryKey: queryKeys.favorites(userId || 'guest'),
    queryFn: async (): Promise<string[]> => {
      if (!isSupabaseConfigured || !supabase || !userId) {
        return [];
      }
      
      const { data, error } = await supabase
        .from('favorites')
        .select('song_id')
        .eq('user_id', userId);
      
      if (error) throw error;
      return (data || []).map((f: any) => f.song_id);
    },
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes - favorites change more frequently
  });
};

// ============================================
// LISTENING HISTORY QUERIES
// ============================================

export const useListeningHistory = (userId: string | undefined) => {
  return useQuery({
    queryKey: queryKeys.listeningHistory(userId || 'guest'),
    queryFn: async () => {
      if (!isSupabaseConfigured || !supabase || !userId) {
        return [];
      }
      
      const { data, error } = await supabase
        .from('listening_history')
        .select('*, songs(*)')
        .eq('user_id', userId)
        .order('played_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!userId,
    staleTime: 1 * 60 * 1000, // 1 minute - history changes frequently
  });
};

// ============================================
// DOWNLOADS QUERIES
// ============================================

export const useDownloads = (userId: string | undefined) => {
  return useQuery({
    queryKey: queryKeys.downloads(userId || 'guest'),
    queryFn: async () => {
      if (!isSupabaseConfigured || !supabase || !userId) {
        return [];
      }
      
      const { data, error } = await supabase
        .from('downloads')
        .select('*, songs(*)')
        .eq('user_id', userId)
        .order('downloaded_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });
};

// ============================================
// PROFILE QUERIES
// ============================================

export const useProfile = (userId: string | undefined) => {
  return useQuery({
    queryKey: queryKeys.profile(userId || 'guest'),
    queryFn: async (): Promise<UserProfile | null> => {
      if (!isSupabaseConfigured || !supabase || !userId) {
        return null;
      }
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });
};

// ============================================
// MUTATIONS
// ============================================

export const useToggleFavorite = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userId, songId, isLiked }: { userId: string; songId: string; isLiked: boolean }) => {
      if (!isSupabaseConfigured || !supabase) return;
      
      if (isLiked) {
        await supabase.from('favorites').delete().match({ user_id: userId, song_id: songId });
      } else {
        await supabase.from('favorites').insert([{ user_id: userId, song_id: songId }]);
      }
    },
    onSuccess: (_, { userId }) => {
      // Invalidate favorites cache for this user
      queryClient.invalidateQueries({ queryKey: queryKeys.favorites(userId) });
    },
  });
};

export const useCreatePlaylist = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (playlist: Omit<Playlist, 'id' | 'created_at' | 'song_ids'>) => {
      if (!isSupabaseConfigured || !supabase) throw new Error('Supabase not configured');
      
      const { data, error } = await supabase
        .from('playlists')
        .insert([playlist])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // Invalidate playlists cache
      queryClient.invalidateQueries({ queryKey: queryKeys.playlists });
    },
  });
};

export const useUpdatePlaylist = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Playlist> }) => {
      if (!isSupabaseConfigured || !supabase) throw new Error('Supabase not configured');
      
      const { error } = await supabase
        .from('playlists')
        .update(updates)
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: (_, { id }) => {
      // Invalidate both general and specific playlist cache
      queryClient.invalidateQueries({ queryKey: queryKeys.playlists });
      queryClient.invalidateQueries({ queryKey: queryKeys.playlist(id) });
    },
  });
};

export const useDeletePlaylist = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      if (!isSupabaseConfigured || !supabase) throw new Error('Supabase not configured');
      
      const { error } = await supabase.from('playlists').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.playlists });
    },
  });
};

export const useAddSongToPlaylist = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ playlistId, songId, position }: { playlistId: string; songId: string; position: number }) => {
      if (!isSupabaseConfigured || !supabase) throw new Error('Supabase not configured');
      
      const { error } = await supabase.from('playlist_songs').insert([{
        playlist_id: playlistId,
        song_id: songId,
        position,
      }]);
      
      if (error) throw error;
    },
    onSuccess: (_, { playlistId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.playlists });
      queryClient.invalidateQueries({ queryKey: queryKeys.playlist(playlistId) });
    },
  });
};

export const useRemoveSongFromPlaylist = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ playlistId, songId }: { playlistId: string; songId: string }) => {
      if (!isSupabaseConfigured || !supabase) throw new Error('Supabase not configured');
      
      const { error } = await supabase
        .from('playlist_songs')
        .delete()
        .match({ playlist_id: playlistId, song_id: songId });
      
      if (error) throw error;
    },
    onSuccess: (_, { playlistId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.playlists });
      queryClient.invalidateQueries({ queryKey: queryKeys.playlist(playlistId) });
    },
  });
};

export const useIncrementPlayCount = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (songId: string) => {
      if (!isSupabaseConfigured || !supabase) return;
      
      await supabase.rpc('increment_song_play', { song_id: songId });
    },
    onSuccess: (_, songId) => {
      // Invalidate specific song cache
      queryClient.invalidateQueries({ queryKey: queryKeys.song(songId) });
      // Also invalidate songs list to update play counts
      queryClient.invalidateQueries({ queryKey: queryKeys.songs });
    },
  });
};

export const useIncrementDownloadCount = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (songId: string) => {
      if (!isSupabaseConfigured || !supabase) return;
      
      await supabase.rpc('increment_song_download', { song_id: songId });
    },
    onSuccess: (_, songId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.song(songId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.songs });
    },
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userId, updates }: { userId: string; updates: Partial<UserProfile> }) => {
      if (!isSupabaseConfigured || !supabase) throw new Error('Supabase not configured');
      
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId);
      
      if (error) throw error;
    },
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.profile(userId) });
    },
  });
};
