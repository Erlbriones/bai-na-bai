import React, { useState, memo } from 'react';
import { Play, Pause, Heart, Download, Plus, Music } from 'lucide-react';
import { Song } from '../types';
import { useMusicPlayer } from '../context/MusicPlayerContext';

interface SongCardProps {
  song: Song;
  onNavigateToSong?: (songId: string) => void;
  onOpenAddToPlaylist?: (song: Song) => void;
}

export const SongCard: React.FC<SongCardProps> = memo(({
  song,
  onNavigateToSong,
  onOpenAddToPlaylist,
}) => {
  const {
    currentSong,
    isPlaying,
    playSong,
    pauseSong,
    toggleLike,
    isLiked,
    downloadSong,
  } = useMusicPlayer();

  const [imgError, setImgError] = useState(false);

  const isCurrent = currentSong?.id === song.id;
  const isCurrentlyPlaying = isCurrent && isPlaying;
  const liked = isLiked(song.id);

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isCurrentlyPlaying) {
      pauseSong();
    } else {
      playSong(song);
    }
  };

  const handleCardClick = () => {
    if (onNavigateToSong) {
      onNavigateToSong(song.id);
    } else {
      playSong(song);
    }
  };

  return (
    <div
      id={`song-card-${song.id}`}
      onClick={handleCardClick}
      className="group bg-[#16171b] hover:bg-[#1f2025] p-2.5 rounded-md border border-[#24252b] hover:border-[#33353d] transition-colors cursor-pointer flex flex-col select-none"
    >
      {/* Artwork */}
      <div className="relative aspect-square w-full rounded overflow-hidden bg-[#1c1d22] mb-2.5">
        {!imgError ? (
          <img
            src={song.artwork_url}
            alt={song.title}
            onError={() => setImgError(true)}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#4ea824] bg-[#1a1b20]">
            <Music className="w-8 h-8" />
          </div>
        )}

        {/* Hover Play Button */}
        <div
          className={`absolute bottom-2 right-2 transition-opacity ${
            isCurrentlyPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          }`}
        >
          <button
            onClick={handlePlayClick}
            className="w-9 h-9 rounded-full bg-[#4ea824] hover:bg-[#5bbd2d] text-white flex items-center justify-center shadow-md transition-transform active:scale-95"
            title={isCurrentlyPlaying ? 'Pause' : 'Play'}
          >
            {isCurrentlyPlaying ? (
              <Pause className="w-4 h-4 fill-current" />
            ) : (
              <Play className="w-4 h-4 fill-current ml-0.5" />
            )}
          </button>
        </div>
      </div>

      {/* Title & Artist */}
      <div className="min-w-0">
        <h4
          className={`text-xs font-semibold truncate ${
            isCurrent ? 'text-[#4ea824]' : 'text-[#f4f4f5]'
          }`}
          title={song.title}
        >
          {song.title}
        </h4>
        <p className="text-[11px] text-[#848a93] truncate mt-0.5" title={song.artist}>
          {song.artist}
        </p>
      </div>

      {/* Bottom info: Genre & Quick Actions */}
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#222328] text-[11px] text-[#60646c]">
        <span className="truncate">{song.genre}</span>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleLike(song.id);
            }}
            className={`p-1 rounded hover:text-[#f4f4f5] ${
              liked ? 'text-[#4ea824]' : 'text-[#70757f]'
            }`}
            title={liked ? 'Unlike' : 'Like'}
          >
            <Heart className={`w-3.5 h-3.5 ${liked ? 'fill-current' : ''}`} />
          </button>

          {onOpenAddToPlaylist && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenAddToPlaylist(song);
              }}
              className="p-1 rounded text-[#70757f] hover:text-[#f4f4f5]"
              title="Add to playlist"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              downloadSong(song);
            }}
            className="p-1 rounded text-[#70757f] hover:text-[#f4f4f5]"
            title="Download track"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
});
