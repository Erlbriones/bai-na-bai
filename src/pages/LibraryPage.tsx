import React, { useState, useMemo } from 'react';
import {
  Music,
  Disc,
  User,
  ListMusic,
  Download,
  FileAudio,
  ArrowUpDown,
  Plus,
  Search
} from 'lucide-react';
import { useMusicPlayer } from '../context/MusicPlayerContext';
import { useAuth } from '../context/AuthContext';
import { Song, NavigationRoute } from '../types';
import { SongList } from '../components/SongList';
import { PlaylistCard } from '../components/PlaylistCard';

interface LibraryPageProps {
  onNavigateToSong: (songId: string) => void;
  onNavigateToPlaylist: (playlistId: string) => void;
  setCurrentRoute?: (route: NavigationRoute) => void;
  onNavigate?: (path: string) => void;
  onOpenAddToPlaylist: (song: Song) => void;
  onOpenCreatePlaylist: () => void;
}

type LibraryTab = 'songs' | 'playlists' | 'albums' | 'artists' | 'downloads' | 'uploads';
type SortOption = 'recent_added' | 'recent_played' | 'alphabetical' | 'artist' | 'most_played';

export const LibraryPage: React.FC<LibraryPageProps> = ({
  onNavigateToSong,
  onNavigateToPlaylist,
  setCurrentRoute,
  onNavigate,
  onOpenAddToPlaylist,
  onOpenCreatePlaylist,
}) => {
  const { songs, playlists, downloads, recentlyPlayed, playSong } = useMusicPlayer();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<LibraryTab>('songs');
  const [sortBy, setSortBy] = useState<SortOption>('recent_added');
  const [filterQuery, setFilterQuery] = useState('');

  // User uploads
  const userUploads = useMemo(() => {
    return songs.filter((s) => s.uploader_id === user?.id || s.is_local);
  }, [songs, user]);

  // Downloaded songs
  const downloadedSongs = useMemo(() => {
    const downloadedIds = new Set(downloads.map((d) => d.song_id));
    return songs.filter((s) => downloadedIds.has(s.id));
  }, [songs, downloads]);

  // Sort and filter logic for songs
  const processedSongs = useMemo(() => {
    let list = [...songs];

    if (filterQuery.trim()) {
      const q = filterQuery.toLowerCase();
      list = list.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.artist.toLowerCase().includes(q) ||
          s.album.toLowerCase().includes(q) ||
          s.genre.toLowerCase().includes(q)
      );
    }

    switch (sortBy) {
      case 'recent_added':
        return list.sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      case 'most_played':
        return list.sort((a, b) => b.play_count - a.play_count);
      case 'alphabetical':
        return list.sort((a, b) => a.title.localeCompare(b.title));
      case 'artist':
        return list.sort((a, b) => a.artist.localeCompare(b.artist));
      case 'recent_played': {
        const recentMap = new Map<string, number>();
        recentlyPlayed.forEach((item, idx) => {
          if (!recentMap.has(item.song_id)) {
            recentMap.set(item.song_id, idx);
          }
        });
        return list.sort((a, b) => {
          const rankA = recentMap.has(a.id) ? recentMap.get(a.id)! : 999;
          const rankB = recentMap.has(b.id) ? recentMap.get(b.id)! : 999;
          return rankA - rankB;
        });
      }
      default:
        return list;
    }
  }, [songs, sortBy, recentlyPlayed, filterQuery]);

  // Unique Albums
  const albumsList = useMemo(() => {
    const map = new Map<string, { album: string; artist: string; songs: Song[] }>();
    songs.forEach((s) => {
      const albumKey = `${s.album}___${s.artist}`;
      if (!map.has(albumKey)) {
        map.set(albumKey, { album: s.album, artist: s.artist, songs: [s] });
      } else {
        map.get(albumKey)!.songs.push(s);
      }
    });
    return Array.from(map.values());
  }, [songs]);

  // Unique Artists
  const artistsList = useMemo(() => {
    const map = new Map<string, { artist: string; songs: Song[] }>();
    songs.forEach((s) => {
      if (!map.has(s.artist)) {
        map.set(s.artist, { artist: s.artist, songs: [s] });
      } else {
        map.get(s.artist)!.songs.push(s);
      }
    });
    return Array.from(map.values());
  }, [songs]);

  const tabs: { id: LibraryTab; label: string; count?: number; icon: any }[] = [
    { id: 'songs', label: 'Songs', count: songs.length, icon: Music },
    { id: 'playlists', label: 'Playlists', count: playlists.length, icon: ListMusic },
    { id: 'albums', label: 'Albums', count: albumsList.length, icon: Disc },
    { id: 'artists', label: 'Artists', count: artistsList.length, icon: User },
    { id: 'downloads', label: 'Downloads', count: downloadedSongs.length, icon: Download },
    { id: 'uploads', label: 'My Uploads', count: userUploads.length, icon: FileAudio },
  ];

  return (
    <div id="spotibai-library-page" className="p-5 md:p-8 space-y-6 pb-28 max-w-7xl mx-auto select-none">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-[#f4f4f5] tracking-tight">
            Your Library
          </h1>
          <p className="text-xs text-[#848a93] mt-0.5">
            Browse and manage your saved songs, playlists, and uploaded tracks.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenCreatePlaylist}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#1f2025] hover:bg-[#25272e] border border-[#2d2e36] text-xs font-medium text-[#f4f4f5] transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-[#4ea824]" />
            <span>New Playlist</span>
          </button>

          <button
            onClick={() => {
              if (onNavigate) onNavigate('/upload');
              else if (setCurrentRoute) setCurrentRoute('upload');
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#4ea824] hover:bg-[#5bbd2d] text-white text-xs font-semibold transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Upload Track</span>
          </button>
        </div>
      </div>

      {/* Tabs Row (Flat, unboxed desktop styling) */}
      <div className="flex items-center gap-4 border-b border-[#24252b] overflow-x-auto scrollbar-none">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-2.5 px-1 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
                isActive
                  ? 'border-[#4ea824] text-[#f4f4f5] font-semibold'
                  : 'border-transparent text-[#848a93] hover:text-[#f4f4f5]'
              }`}
            >
              <Icon
                className={`w-3.5 h-3.5 ${
                  isActive ? 'text-[#4ea824]' : 'text-[#70757f]'
                }`}
              />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className="text-[10px] font-mono text-[#60646c]">
                  ({tab.count})
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Filter / Sort Toolbar for Songs */}
      {activeTab === 'songs' && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          {/* Quick Filter */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#70757f]" />
            <input
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder="Filter tracks..."
              className="w-full bg-[#17181c] border border-[#24252b] rounded-md pl-8 pr-3 py-1.5 text-xs text-[#f4f4f5] placeholder-[#60646c] outline-none focus:border-[#4ea824]"
            />
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-2 text-[#848a93]">
            <ArrowUpDown className="w-3.5 h-3.5 text-[#4ea824]" />
            <span className="text-[11px] font-medium uppercase tracking-wider text-[#60646c]">
              Sort:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="bg-[#17181c] border border-[#24252b] rounded-md px-2.5 py-1 text-xs text-[#f4f4f5] outline-none focus:border-[#4ea824]"
            >
              <option value="recent_added">Recently Added</option>
              <option value="recent_played">Recently Played</option>
              <option value="most_played">Most Played</option>
              <option value="alphabetical">Title (A-Z)</option>
              <option value="artist">Artist (A-Z)</option>
            </select>
          </div>
        </div>
      )}

      {/* Content Area */}
      {activeTab === 'songs' && (
        <div className="bg-[#151619] border border-[#24252b] rounded-md overflow-hidden p-1">
          <SongList
            songs={processedSongs}
            onNavigateToSong={onNavigateToSong}
            onOpenAddToPlaylist={onOpenAddToPlaylist}
            customEmptyMessage={
              filterQuery
                ? `No songs matched "${filterQuery}".`
                : 'No songs found in your library.'
            }
          />
        </div>
      )}

      {activeTab === 'playlists' && (
        <div>
          {playlists.length === 0 ? (
            <div className="py-16 text-center text-[#70757f] bg-[#151619] rounded-md border border-[#24252b] space-y-2">
              <ListMusic className="w-8 h-8 mx-auto text-[#60646c]" />
              <p className="text-xs font-medium text-[#848a93]">No playlists created yet</p>
              <button
                onClick={onOpenCreatePlaylist}
                className="px-3 py-1.5 rounded-md bg-[#4ea824] hover:bg-[#5bbd2d] text-white text-xs font-semibold transition-colors"
              >
                Create First Playlist
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {playlists.map((pl) => (
                <PlaylistCard
                  key={pl.id}
                  playlist={pl}
                  onSelect={onNavigateToPlaylist}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'albums' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {albumsList.map((alb) => {
            const firstSong = alb.songs[0];
            return (
              <div
                key={`${alb.album}-${alb.artist}`}
                onClick={() => playSong(firstSong, alb.songs)}
                className="group p-2.5 bg-[#16171b] hover:bg-[#1f2025] border border-[#24252b] hover:border-[#33353d] rounded-md transition-colors cursor-pointer"
              >
                <img
                  src={firstSong.artwork_url}
                  alt={alb.album}
                  className="w-full aspect-square object-cover rounded mb-2 border border-[#24252b]"
                />
                <h4 className="text-xs font-semibold text-[#f4f4f5] truncate">
                  {alb.album}
                </h4>
                <p className="text-[11px] text-[#848a93] truncate mt-0.5">{alb.artist}</p>
                <span className="text-[10px] font-mono text-[#60646c]">
                  {alb.songs.length} {alb.songs.length === 1 ? 'song' : 'songs'}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'artists' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {artistsList.map((art) => {
            const firstSong = art.songs[0];
            return (
              <div
                key={art.artist}
                onClick={() => playSong(firstSong, art.songs)}
                className="group p-3 bg-[#16171b] hover:bg-[#1f2025] border border-[#24252b] hover:border-[#33353d] rounded-md transition-colors cursor-pointer text-center"
              >
                <div className="w-16 h-16 rounded-full overflow-hidden mx-auto mb-2 border border-[#26272d]">
                  <img
                    src={firstSong.artwork_url}
                    alt={art.artist}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h4 className="text-xs font-semibold text-[#f4f4f5] truncate">
                  {art.artist}
                </h4>
                <p className="text-[11px] text-[#70757f] font-mono mt-0.5">
                  {art.songs.length} {art.songs.length === 1 ? 'song' : 'songs'}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'downloads' && (
        <div className="bg-[#151619] border border-[#24252b] rounded-md overflow-hidden p-1">
          <SongList
            songs={downloadedSongs}
            onNavigateToSong={onNavigateToSong}
            onOpenAddToPlaylist={onOpenAddToPlaylist}
            customEmptyMessage="No downloaded tracks yet. Click the download icon on any track to save it for offline listening."
          />
        </div>
      )}

      {activeTab === 'uploads' && (
        <div className="bg-[#151619] border border-[#24252b] rounded-md overflow-hidden p-1">
          <SongList
            songs={userUploads}
            onNavigateToSong={onNavigateToSong}
            onOpenAddToPlaylist={onOpenAddToPlaylist}
            customEmptyMessage="You have not uploaded any tracks yet."
          />
        </div>
      )}
    </div>
  );
};
