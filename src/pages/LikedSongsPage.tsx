import React, { useState } from 'react';
import { Heart, Play, Search, Clock } from 'lucide-react';
import { useMusicPlayer } from '../context/MusicPlayerContext';
import { SongList } from '../components/SongList';
import { Song } from '../types';

interface LikedSongsPageProps {
  onNavigateToSong: (songId: string) => void;
  onOpenAddToPlaylist: (song: Song) => void;
}

export const LikedSongsPage: React.FC<LikedSongsPageProps> = ({
  onNavigateToSong,
  onOpenAddToPlaylist,
}) => {
  const { songs, favoriteSongIds, playSong } = useMusicPlayer();
  const [filterQuery, setFilterQuery] = useState('');

  const likedSongs = songs.filter((s) => favoriteSongIds.includes(s.id));

  const filteredLikedSongs = likedSongs.filter(
    (s) =>
      s.title.toLowerCase().includes(filterQuery.toLowerCase()) ||
      s.artist.toLowerCase().includes(filterQuery.toLowerCase()) ||
      s.album.toLowerCase().includes(filterQuery.toLowerCase())
  );

  const totalDuration = likedSongs.reduce((acc, s) => acc + (s.duration || 180), 0);
  const durationMins = Math.floor(totalDuration / 60);

  const handlePlayAll = () => {
    if (likedSongs.length > 0) {
      playSong(likedSongs[0], likedSongs);
    }
  };

  return (
    <div id="spotibai-liked-page" className="p-5 md:p-8 space-y-6 pb-28 max-w-7xl mx-auto select-none">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5 bg-[#151619] border border-[#24252b] rounded-md p-6">
        {/* Cover Icon */}
        <div className="w-32 h-32 md:w-36 md:h-36 rounded bg-[#1f2025] border border-[#2e3038] flex items-center justify-center text-[#4ea824] shrink-0">
          <Heart className="w-16 h-16 fill-current" />
        </div>

        {/* Info */}
        <div className="space-y-1.5 text-center sm:text-left flex-1 min-w-0">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#60646c]">
            Collection
          </span>
          <h1 className="text-2xl md:text-3xl font-bold text-[#f4f4f5] tracking-tight">
            Liked Songs
          </h1>
          <p className="text-xs text-[#848a93]">
            Your personal collection of favorited songs on SPOTIBAI
          </p>
          <p className="text-[11px] font-mono text-[#60646c] pt-1">
            {likedSongs.length} {likedSongs.length === 1 ? 'song' : 'songs'} • approx. {durationMins} min
          </p>
        </div>

        {/* Play All Button */}
        {likedSongs.length > 0 && (
          <button
            onClick={handlePlayAll}
            className="flex items-center gap-2 px-4 py-2 rounded-md bg-[#4ea824] hover:bg-[#5bbd2d] text-white text-xs font-semibold transition-colors shrink-0 shadow-sm"
          >
            <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
            <span>Play All</span>
          </button>
        )}
      </div>

      {/* Filter Toolbar */}
      {likedSongs.length > 0 && (
        <div className="flex items-center justify-between gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#70757f]" />
            <input
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder="Search in liked songs..."
              className="w-full bg-[#17181c] border border-[#24252b] rounded-md pl-8 pr-3 py-1.5 text-xs text-[#f4f4f5] placeholder-[#60646c] outline-none focus:border-[#4ea824]"
            />
          </div>
        </div>
      )}

      {/* Track List */}
      <div className="bg-[#151619] border border-[#24252b] rounded-md overflow-hidden p-1">
        <SongList
          songs={filteredLikedSongs}
          onNavigateToSong={onNavigateToSong}
          onOpenAddToPlaylist={onOpenAddToPlaylist}
          customEmptyMessage="No liked songs yet. Click the heart icon on any track to add it here."
        />
      </div>
    </div>
  );
};
