import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { Song, Playlist, RepeatMode, ListeningHistoryItem, DownloadItem } from '../types';
import {
  getStoredSongs,
  saveStoredSongs,
  getStoredPlaylists,
  saveStoredPlaylists,
  getStoredFavorites,
  saveStoredFavorites,
  getStoredHistory,
  saveStoredHistory,
  getStoredDownloads,
  saveStoredDownloads,
  deleteAudioBlob,
} from '../lib/storage';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import {
  useSongs,
  usePlaylists,
  useFavorites,
  useListeningHistory,
  useDownloads,
  useToggleFavorite,
  useCreatePlaylist,
  useUpdatePlaylist,
  useDeletePlaylist,
  useAddSongToPlaylist,
  useRemoveSongFromPlaylist,
  useIncrementPlayCount,
  useIncrementDownloadCount,
} from '../lib/queries';

interface MusicPlayerContextType {
  // Songs & Playlists data
  songs: Song[];
  playlists: Playlist[];
  favoriteSongIds: string[];
  recentlyPlayed: ListeningHistoryItem[];
  downloads: DownloadItem[];
  
  // Playback state
  currentSong: Song | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  repeatMode: RepeatMode;
  isShuffled: boolean;
  queue: Song[];
  isQueueOpen: boolean;
  
  // Playback actions
  playSong: (song: Song, newQueue?: Song[]) => void;
  pauseSong: () => void;
  resumeSong: () => void;
  togglePlayPause: () => void;
  playNext: () => void;
  playPrevious: () => void;
  seekTo: (time: number) => void;
  setVolumeLevel: (vol: number) => void;
  toggleMute: () => void;
  toggleRepeat: () => void;
  toggleShuffle: () => void;
  
  // Queue actions
  addToQueue: (song: Song) => void;
  removeFromQueue: (index: number) => void;
  clearQueue: () => void;
  toggleQueuePanel: () => void;
  setIsQueueOpen: (open: boolean) => void;
  
  // Engagement
  toggleLike: (songId: string) => void;
  isLiked: (songId: string) => boolean;
  downloadSong: (song: Song) => Promise<void>;
  
  // Content Management
  addUploadedSong: (newSong: Song) => void;
  updateSongMetadata: (songId: string, updates: Partial<Song>) => void;
  deleteSong: (songId: string) => Promise<boolean>;
  deleteUploadedSong: (songId: string) => Promise<boolean>;
  
  // Playlist Management
  createPlaylist: (name: string, description?: string, coverUrl?: string) => Playlist;
  updatePlaylist: (id: string, name: string, description?: string, coverUrl?: string) => void;
  deletePlaylist: (id: string) => void;
  addSongToPlaylist: (playlistId: string, songId: string) => void;
  removeSongFromPlaylist: (playlistId: string, songId: string) => void;
  reorderPlaylistSongs: (playlistId: string, startIndex: number, endIndex: number) => void;
  
  // Refresh data
  refreshData: () => Promise<void>;
}

const MusicPlayerContext = createContext<MusicPlayerContextType | undefined>(undefined);

export const MusicPlayerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { showToast } = useToast();

  // Use TanStack Query for data fetching with caching
  const { data: querySongs = [], isLoading: isLoadingSongs } = useSongs();
  const { data: queryPlaylists = [], isLoading: isLoadingPlaylists } = usePlaylists();
  const { data: queryFavorites = [], isLoading: isLoadingFavorites } = useFavorites(user?.id);
  const { data: queryHistory = [], isLoading: isLoadingHistory } = useListeningHistory(user?.id);
  const { data: queryDownloads = [], isLoading: isLoadingDownloads } = useDownloads(user?.id);

  // Mutations
  const toggleFavoriteMutation = useToggleFavorite();
  const createPlaylistMutation = useCreatePlaylist();
  const updatePlaylistMutation = useUpdatePlaylist();
  const deletePlaylistMutation = useDeletePlaylist();
  const addSongToPlaylistMutation = useAddSongToPlaylist();
  const removeSongFromPlaylistMutation = useRemoveSongFromPlaylist();
  const incrementPlayMutation = useIncrementPlayCount();
  const incrementDownloadMutation = useIncrementDownloadCount();

  // Core Data Lists - merge local storage with query data
  const [songs, setSongs] = useState<Song[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [favoriteSongIds, setFavoriteSongIds] = useState<string[]>([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState<ListeningHistoryItem[]>([]);
  const [downloads, setDownloads] = useState<DownloadItem[]>([]);

  // Player State
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolume] = useState<number>(0.8);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('off');
  const [isShuffled, setIsShuffled] = useState<boolean>(false);
  const [queue, setQueue] = useState<Song[]>([]);
  const [isQueueOpen, setIsQueueOpen] = useState<boolean>(false);

  // Audio element reference
  const audioRef = useRef<HTMLAudioElement | null>(null);
  // Track play count threshold logic
  const hasRecordedPlayRef = useRef<boolean>(false);
  const listenDurationRef = useRef<number>(0);

  // Merge query data with local storage data
  useEffect(() => {
    const localSongs = getStoredSongs();
    const localPlaylists = getStoredPlaylists();
    const localFavorites = getStoredFavorites();
    const localHistory = getStoredHistory();
    const localDownloads = getStoredDownloads();

    // Merge Supabase songs with local uploads
    const dbSongIds = new Set(querySongs.map((s) => s.id));
    const localOnly = localSongs.filter((s) => s.is_local && !dbSongIds.has(s.id));
    const mergedSongs = [...querySongs, ...localOnly];

    // Merge playlists
    const dbPlaylistIds = new Set(queryPlaylists.map((p) => p.id));
    const localPlaylistsOnly = localPlaylists.filter((p) => !dbPlaylistIds.has(p.id));
    const mergedPlaylists = [...queryPlaylists, ...localPlaylistsOnly];

    setSongs(mergedSongs);
    setPlaylists(mergedPlaylists);
    setFavoriteSongIds(queryFavorites.length > 0 ? queryFavorites : localFavorites);
    setRecentlyPlayed(queryHistory.length > 0 ? queryHistory : localHistory);
    setDownloads(queryDownloads.length > 0 ? queryDownloads : localDownloads);
  }, [querySongs, queryPlaylists, queryFavorites, queryHistory, queryDownloads]);

  const refreshData = async () => {
    // This is now handled by TanStack Query's automatic refetching
    // We keep this for manual refresh if needed
    await Promise.all([
      // TanStack Query will refetch automatically based on staleTime
      new Promise(resolve => setTimeout(resolve, 100)),
    ]);
  };

  // Setup HTML5 Audio element once
  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'none'; // Changed from 'metadata' to 'none' to avoid preloading all audio
    audioRef.current = audio;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      listenDurationRef.current += 0.25;

      // Increment play count after listening to >= 15 seconds or >= 25% of the song
      if (
        !hasRecordedPlayRef.current &&
        audio.duration > 0 &&
        (audio.currentTime >= 15 || audio.currentTime / audio.duration >= 0.25)
      ) {
        hasRecordedPlayRef.current = true;
        if (currentSong) {
          handleIncrementPlay(currentSong.id);
        }
      }
    };

    const handleLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    const handleEnded = () => {
      if (repeatMode === 'one') {
        audio.currentTime = 0;
        audio.play().catch(console.error);
      } else {
        playNext();
      }
    };

    const handleError = (e: any) => {
      console.warn('Audio playback error:', e);
      setIsPlaying(false);
      showToast('Playback error for this track. Trying next...', 'error');
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.pause();
      audio.src = '';
    };
  }, [repeatMode]);

  // Handle Play Count increment
  const handleIncrementPlay = async (songId: string) => {
    setSongs((prev) => {
      const updated = prev.map((s) => (s.id === songId ? { ...s, play_count: s.play_count + 1 } : s));
      saveStoredSongs(updated);
      return updated;
    });

    // Record in recently played
    const targetSong = songs.find((s) => s.id === songId);
    if (targetSong) {
      const historyItem: ListeningHistoryItem = {
        id: 'hist-' + Date.now(),
        user_id: user?.id || 'guest',
        song_id: songId,
        played_at: new Date().toISOString(),
        song: targetSong,
      };

      setRecentlyPlayed((prev) => {
        // Filter out duplicate previous play of same song
        const filtered = prev.filter((item) => item.song_id !== songId);
        const updated = [historyItem, ...filtered];
        saveStoredHistory(updated);
        return updated;
      });

      // Use TanStack Query mutation for play count increment
      incrementPlayMutation.mutate(songId);

      // Also record in listening history via Supabase
      if (isSupabaseConfigured && supabase && user) {
        try {
          await supabase.from('listening_history').insert([
            {
              user_id: user.id,
              song_id: songId,
              played_at: new Date().toISOString(),
            },
          ]);
        } catch {
          // silent fallback
        }
      }
    }
  };

  // Keyboard shortcuts (Space = Play/Pause, Arrow Right = Next, Arrow Left = Prev, M = Mute)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in input or textarea
      const activeTag = document.activeElement?.tagName?.toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea' || (document.activeElement as HTMLElement)?.isContentEditable) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        togglePlayPause();
      } else if (e.code === 'ArrowRight' && e.altKey) {
        e.preventDefault();
        playNext();
      } else if (e.code === 'ArrowLeft' && e.altKey) {
        e.preventDefault();
        playPrevious();
      } else if (e.key === 'm' || e.key === 'M') {
        toggleMute();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, isMuted, currentSong, queue]);

  // Core Playback Functions
  const playSong = (song: Song, newQueue?: Song[]) => {
    if (!audioRef.current) return;

    hasRecordedPlayRef.current = false;
    listenDurationRef.current = 0;
    setCurrentSong(song);

    if (newQueue) {
      // Filter out current song from the upcoming queue
      const remainingQueue = newQueue.filter((s) => s.id !== song.id);
      setQueue(remainingQueue);
    }

    audioRef.current.src = song.audio_url;
    audioRef.current.load();
    audioRef.current
      .play()
      .then(() => {
        setIsPlaying(true);
      })
      .catch((err) => {
        console.warn('Playback play() was blocked or failed:', err);
        setIsPlaying(false);
      });
  };

  // Preload next song for smoother playback
  useEffect(() => {
    if (!audioRef.current || !currentSong || queue.length === 0) return;

    const nextSong = queue[0];
    if (nextSong && nextSong.id !== currentSong.id) {
      // Preload metadata only for the next song
      const preloadAudio = new Audio();
      preloadAudio.preload = 'metadata';
      preloadAudio.src = nextSong.audio_url;
      
      // Clean up after 5 seconds to avoid memory leaks
      const timeout = setTimeout(() => {
        preloadAudio.src = '';
      }, 5000);

      return () => {
        clearTimeout(timeout);
        preloadAudio.src = '';
     };
    }
  }, [currentSong, queue]);

  const pauseSong = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const resumeSong = () => {
    if (audioRef.current && currentSong) {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => console.warn('Resume error:', err));
    }
  };

  const togglePlayPause = () => {
    if (isPlaying) {
      pauseSong();
    } else {
      if (currentSong) {
        resumeSong();
      } else if (songs.length > 0) {
        playSong(songs[0], songs);
      }
    }
  };

  const playNext = () => {
    if (queue.length > 0) {
      let nextIndex = 0;
      if (isShuffled) {
        nextIndex = Math.floor(Math.random() * queue.length);
      }
      const nextSong = queue[nextIndex];
      const newQueue = queue.filter((_, idx) => idx !== nextIndex);
      playSong(nextSong, newQueue);
    } else if (repeatMode === 'all' && songs.length > 0) {
      playSong(songs[0], songs);
    } else {
      pauseSong();
      setCurrentTime(0);
      if (audioRef.current) audioRef.current.currentTime = 0;
    }
  };

  const playPrevious = () => {
    if (audioRef.current && audioRef.current.currentTime > 3) {
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
      return;
    }

    // Find index of current song in original songs list to step back
    if (currentSong) {
      const currentIndex = songs.findIndex((s) => s.id === currentSong.id);
      if (currentIndex > 0) {
        playSong(songs[currentIndex - 1]);
      } else {
        if (audioRef.current) audioRef.current.currentTime = 0;
      }
    }
  };

  const seekTo = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const setVolumeLevel = (vol: number) => {
    const clamped = Math.max(0, Math.min(1, vol));
    setVolume(clamped);
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : clamped;
    }
    if (clamped > 0 && isMuted) {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    setIsMuted((prev) => {
      const nextMuted = !prev;
      if (audioRef.current) {
        audioRef.current.volume = nextMuted ? 0 : volume;
      }
      return nextMuted;
    });
  };

  const toggleRepeat = () => {
    setRepeatMode((prev) => {
      if (prev === 'off') return 'all';
      if (prev === 'all') return 'one';
      return 'off';
    });
  };

  const toggleShuffle = () => {
    setIsShuffled((prev) => !prev);
    showToast(isShuffled ? 'Shuffle turned off' : 'Shuffle enabled', 'info');
  };

  // Queue actions
  const addToQueue = (song: Song) => {
    setQueue((prev) => [...prev, song]);
    showToast(`Added "${song.title}" to queue`, 'success');
  };

  const removeFromQueue = (index: number) => {
    setQueue((prev) => prev.filter((_, idx) => idx !== index));
  };

  const clearQueue = () => {
    setQueue([]);
    showToast('Queue cleared', 'info');
  };

  const toggleQueuePanel = () => {
    setIsQueueOpen((prev) => !prev);
  };

  // Like / Favorite system
  const toggleLike = async (songId: string) => {
    const isCurrentlyLiked = favoriteSongIds.includes(songId);
    const updated = isCurrentlyLiked
      ? favoriteSongIds.filter((id) => id !== songId)
      : [...favoriteSongIds, songId];

    setFavoriteSongIds(updated);
    saveStoredFavorites(updated);

    if (isCurrentlyLiked) {
      showToast('Removed from Liked Songs', 'info');
    } else {
      showToast('Added to Liked Songs ❤️', 'success');
    }

    // Use TanStack Query mutation
    if (user) {
      toggleFavoriteMutation.mutate({ userId: user.id, songId, isLiked: isCurrentlyLiked });
    }
  };

  const isLiked = (songId: string) => favoriteSongIds.includes(songId);

  // Download song handler
  const downloadSong = async (song: Song) => {
    try {
      showToast(`Preparing download for "${song.title}"...`, 'info');
      
      const response = await fetch(song.audio_url);
      if (!response.ok) {
        throw new Error('Audio file could not be retrieved');
      }
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      
      const safeFilename = `${song.artist} - ${song.title}`.replace(/[/\\?%*:|"<>]/g, '') + '.mp3';
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = safeFilename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(downloadUrl);

      // Record download stats
      setSongs((prev) => {
        const updated = prev.map((s) => (s.id === song.id ? { ...s, download_count: s.download_count + 1 } : s));
        saveStoredSongs(updated);
        return updated;
      });

      const newDownload: DownloadItem = {
        id: 'dl-' + Date.now(),
        user_id: user?.id || 'guest',
        song_id: song.id,
        downloaded_at: new Date().toISOString(),
        song,
      };

      setDownloads((prev) => {
        const updated = [newDownload, ...prev.filter((d) => d.song_id !== song.id)];
        saveStoredDownloads(updated);
        return updated;
      });

      // Use TanStack Query mutation for download count increment
      incrementDownloadMutation.mutate(song.id);

      if (isSupabaseConfigured && supabase && user) {
        try {
          await supabase.from('downloads').insert([
            {
              user_id: user.id,
              song_id: song.id,
              downloaded_at: new Date().toISOString(),
            },
          ]);
        } catch {
          // silent fallback
        }
      }

      showToast(`Downloaded "${safeFilename}"!`, 'success');
    } catch (err) {
      console.error('Download error:', err);
      // Fallback: direct window open
      const a = document.createElement('a');
      a.href = song.audio_url;
      a.target = '_blank';
      a.download = `${song.artist} - ${song.title}.mp3`;
      a.click();
      showToast(`Initiating direct download for "${song.title}"`, 'info');
    }
  };

  // Content Management: Upload, Edit, Delete
  const addUploadedSong = (newSong: Song) => {
    setSongs((prev) => {
      const updated = [newSong, ...prev];
      saveStoredSongs(updated);
      return updated;
    });
    showToast(`"${newSong.title}" is ready to stream!`, 'success');
  };

  const updateSongMetadata = (songId: string, updates: Partial<Song>) => {
    setSongs((prev) => {
      const updated = prev.map((s) => (s.id === songId ? { ...s, ...updates } : s));
      saveStoredSongs(updated);
      return updated;
    });
    if (currentSong?.id === songId) {
      setCurrentSong((prev) => (prev ? { ...prev, ...updates } : null));
    }
    showToast('Song metadata updated', 'success');
  };

  const deleteSong = async (songId: string): Promise<boolean> => {
    try {
      // If currently playing, stop
      if (currentSong?.id === songId) {
        pauseSong();
        setCurrentSong(null);
      }

      // Remove from queue
      setQueue((prev) => prev.filter((s) => s.id !== songId));

      // Remove from favorites
      setFavoriteSongIds((prev) => {
        const updated = prev.filter((id) => id !== songId);
        saveStoredFavorites(updated);
        return updated;
      });

      // Remove from playlists
      setPlaylists((prev) => {
        const updated = prev.map((pl) => ({
          ...pl,
          song_ids: pl.song_ids.filter((id) => id !== songId),
        }));
        saveStoredPlaylists(updated);
        return updated;
      });

      // Remove from songs list
      setSongs((prev) => {
        const updated = prev.filter((s) => s.id !== songId);
        saveStoredSongs(updated);
        return updated;
      });

      // Clean up audio blob if local
      await deleteAudioBlob(songId);

      if (isSupabaseConfigured && supabase) {
        await supabase.from('songs').delete().eq('id', songId);
      }

      showToast('Song deleted from SPOTIBAI', 'info');
      return true;
    } catch (err) {
      console.error('Delete error:', err);
      showToast('Failed to delete song', 'error');
      return false;
    }
  };

  // Playlist management
  const createPlaylist = (name: string, description?: string, coverUrl?: string): Playlist => {
    const newPlaylist: Playlist = {
      id: 'pl-' + Date.now(),
      name,
      description: description || 'Custom playlist on SPOTIBAI',
      cover_url: coverUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80',
      owner_id: user?.id || 'guest',
      owner_name: user?.username || 'Curator',
      created_at: new Date().toISOString(),
      song_ids: [],
    };

    setPlaylists((prev) => {
      const updated = [newPlaylist, ...prev];
      saveStoredPlaylists(updated);
      return updated;
    });

    // Use TanStack Query mutation
    if (user) {
      createPlaylistMutation.mutate({
        name: newPlaylist.name,
        description: newPlaylist.description,
        cover_url: newPlaylist.cover_url,
        owner_id: user.id,
      });
    }

    showToast(`Created playlist "${name}"`, 'success');
    return newPlaylist;
  };

  const updatePlaylist = (id: string, name: string, description?: string, coverUrl?: string) => {
    setPlaylists((prev) => {
      const updated = prev.map((pl) =>
        pl.id === id ? { ...pl, name, description: description ?? pl.description, cover_url: coverUrl ?? pl.cover_url } : pl
      );
      saveStoredPlaylists(updated);
      return updated;
    });

    // Use TanStack Query mutation
    updatePlaylistMutation.mutate({ id, updates: { name, description, cover_url: coverUrl } });

    showToast('Playlist updated', 'success');
  };

  const deletePlaylist = (id: string) => {
    setPlaylists((prev) => {
      const updated = prev.filter((pl) => pl.id !== id);
      saveStoredPlaylists(updated);
      return updated;
    });

    // Use TanStack Query mutation
    deletePlaylistMutation.mutate(id);

    showToast('Playlist removed', 'info');
  };

  const addSongToPlaylist = (playlistId: string, songId: string) => {
    const playlist = playlists.find((p) => p.id === playlistId);
    if (!playlist) return;

    if (playlist.song_ids.includes(songId)) {
      showToast('This track is already in the playlist', 'info');
      return;
    }

    setPlaylists((prev) => {
      const updated = prev.map((p) => (p.id === playlistId ? { ...p, song_ids: [...p.song_ids, songId] } : p));
      saveStoredPlaylists(updated);
      return updated;
    });

    // Use TanStack Query mutation
    addSongToPlaylistMutation.mutate({
      playlistId,
      songId,
      position: playlist.song_ids.length,
    });

    showToast(`Added to "${playlist.name}"`, 'success');
  };

  const removeSongFromPlaylist = (playlistId: string, songId: string) => {
    setPlaylists((prev) => {
      const updated = prev.map((p) => (p.id === playlistId ? { ...p, song_ids: p.song_ids.filter((id) => id !== songId) } : p));
      saveStoredPlaylists(updated);
      return updated;
    });

    // Use TanStack Query mutation
    removeSongFromPlaylistMutation.mutate({ playlistId, songId });

    showToast('Removed track from playlist', 'info');
  };

  const reorderPlaylistSongs = (playlistId: string, startIndex: number, endIndex: number) => {
    setPlaylists((prev) => {
      const updated = prev.map((p) => {
        if (p.id !== playlistId) return p;
        const newIds = [...p.song_ids];
        const [moved] = newIds.splice(startIndex, 1);
        newIds.splice(endIndex, 0, moved);
        return { ...p, song_ids: newIds };
      });
      saveStoredPlaylists(updated);
      return updated;
    });
  };

  return (
    <MusicPlayerContext.Provider
      value={{
        songs,
        playlists,
        favoriteSongIds,
        recentlyPlayed,
        downloads,
        currentSong,
        isPlaying,
        currentTime,
        duration,
        volume,
        isMuted,
        repeatMode,
        isShuffled,
        queue,
        isQueueOpen,
        playSong,
        pauseSong,
        resumeSong,
        togglePlayPause,
        playNext,
        playPrevious,
        seekTo,
        setVolumeLevel,
        toggleMute,
        toggleRepeat,
        toggleShuffle,
        addToQueue,
        removeFromQueue,
        clearQueue,
        toggleQueuePanel,
        setIsQueueOpen,
        toggleLike,
        isLiked,
        downloadSong,
        addUploadedSong,
        updateSongMetadata,
        deleteSong,
        deleteUploadedSong: deleteSong,
        createPlaylist,
        updatePlaylist,
        deletePlaylist,
        addSongToPlaylist,
        removeSongFromPlaylist,
        reorderPlaylistSongs,
        refreshData,
      }}
    >
      {children}
    </MusicPlayerContext.Provider>
  );
};

export const useMusicPlayer = (): MusicPlayerContextType => {
  const context = useContext(MusicPlayerContext);
  if (!context) {
    throw new Error('useMusicPlayer must be used within a MusicPlayerProvider');
  }
  return context;
};
