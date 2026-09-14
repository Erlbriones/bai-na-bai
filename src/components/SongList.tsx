import React, { useState } from 'react';
import {
  Play,
  Pause,
  Heart,
  Download,
  Plus,
  Clock,
  Music,
  Share2,
  Trash2
} from 'lucide-react';
import { Song } from '../types';
import { useMusicPlayer } from '../context/MusicPlayerContext';
import { useToast } from '../context/ToastContext';

interface SongListProps {
  songs: Song[];
  playlistId?: string;
  onNavigateToSong?: (songId: string) => void;
  onOpenAddToPlaylist?: (song: Song) => void;
  showAlbum?: boolean;
  customEmptyMessage?: string;
}

export const SongList: React.FC<SongListProps> = ({
  songs,
  playlistId,
  onNavigateToSong,
  onOpenAddToPlaylist,
  showAlbum = true,
  customEmptyMessage = 'No tracks available.',
}) => {
  const {
    currentSong,
    isPlaying,
    playSong,
    pauseSong,
    toggleLike,
    isLiked,
    downloadSong,
    removeSongFromPlaylist,
  } = useMusicPlayer();
  const { showToast } = useToast();

  const [hoveredRowId, setHoveredRowId] = useState<string | null>(null);

  if (songs.length === 0) {
    return (
      <div className="py-16 text-center text-[#70757f] bg-[#141518] rounded-md border border-[#24252b]">
        <Music className="w-8 h-8 mx-auto text-[#60646c] mb-2" />
        <p className="text-xs font-medium text-[#848a93]">{customEmptyMessage}</p>
      </div>
    );
  }

  const formatDuration = (secs?: number) => {
    if (!secs) return '3:20';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleRowPlay = (song: Song) => {
    if (currentSong?.id === song.id) {
      if (isPlaying) pauseSong();
      else playSong(song);
    } else {
      playSong(song, songs);
    }
  };

  const handleShare = (e: React.MouseEvent, song: Song) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(`${window.location.origin}/song/${song.id}`);
    showToast(`Copied share link for "${song.title}"`, 'info');
  };

  return (
    <div className="w-full overflow-x-auto select-none">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-[#24252b] text-[11px] font-semibold uppercase tracking-wider text-[#60646c]">
            <th className="py-2.5 px-3 w-10 text-center">#</th>
            <th className="py-2.5 px-3">Title</th>
            <th className="hidden sm:table-cell py-2.5 px-3">Artist</th>
            {showAlbum && <th className="hidden md:table-cell py-2.5 px-3">Album</th>}
            <th className="hidden lg:table-cell py-2.5 px-3">Genre</th>
            <th className="py-2.5 px-3 w-16 text-right">
              <Clock className="w-3.5 h-3.5 inline-block text-[#60646c]" />
            </th>
            <th className="py-2.5 px-3 w-28 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#1e2025] text-xs">
          {songs.map((song, index) => {
            const isThisCurrent = currentSong?.id === song.id;
            const isThisPlaying = isThisCurrent && isPlaying;
            const liked = isLiked(song.id);
            const isHovered = hoveredRowId === song.id;

            return (
              <tr
                key={song.id}
                onMouseEnter={() => setHoveredRowId(song.id)}
                onMouseLeave={() => setHoveredRowId(null)}
                className={`group transition-colors cursor-pointer ${
                  isThisCurrent
                    ? 'bg-[#1b1d22] text-[#f4f4f5]'
                    : 'hover:bg-[#1a1b20] text-[#9ba1a6]'
                }`}
                onClick={() => handleRowPlay(song)}
              >
                {/* 1. Track Index / Play Button / Equalizer */}
                <td className="py-2 px-3 text-center w-10">
                  {isHovered ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRowPlay(song);
                      }}
                      className="w-6 h-6 rounded bg-[#4ea824] text-white flex items-center justify-center hover:bg-[#5bbd2d] transition-colors mx-auto"
                      title={isThisPlaying ? 'Pause' : 'Play'}
                    >
                      {isThisPlaying ? (
                        <Pause className="w-3 h-3 fill-current" />
                      ) : (
                        <Play className="w-3 h-3 fill-current ml-0.5" />
                      )}
                    </button>
                  ) : isThisPlaying ? (
                    <div className="flex items-center justify-center gap-0.5 h-4">
                      <span className="w-0.5 bg-[#4ea824] rounded-full playing-eq-1" />
                      <span className="w-0.5 bg-[#4ea824] rounded-full playing-eq-2" />
                      <span className="w-0.5 bg-[#4ea824] rounded-full playing-eq-3" />
                    </div>
                  ) : (
                    <span
                      className={`text-[11px] font-mono ${
                        isThisCurrent ? 'text-[#4ea824] font-bold' : 'text-[#60646c]'
                      }`}
                    >
                      {index + 1}
                    </span>
                  )}
                </td>

                {/* 2. Artwork & Song Title */}
                <td className="py-2 px-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={song.artwork_url}
                      alt={song.title}
                      className="w-9 h-9 rounded object-cover border border-[#24252b] shrink-0"
                      onError={(e) => {
                        // Fallback artwork on error
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=150&q=80';
                      }}
                    />
                    <div className="min-w-0">
                      <p
                        onClick={(e) => {
                          e.stopPropagation();
                          onNavigateToSong && onNavigateToSong(song.id);
                        }}
                        className={`font-medium truncate hover:underline ${
                          isThisCurrent ? 'text-[#4ea824]' : 'text-[#f4f4f5]'
                        }`}
                        title={song.title}
                      >
                        {song.title}
                      </p>
                      <p className="text-[11px] text-[#70757f] truncate sm:hidden">
                        {song.artist}
                      </p>
                    </div>
                  </div>
                </td>

                {/* 3. Artist */}
                <td className="hidden sm:table-cell py-2 px-3 text-[#9ba1a6] truncate max-w-[140px]">
                  {song.artist}
                </td>

                {/* 4. Album */}
                {showAlbum && (
                  <td className="hidden md:table-cell py-2 px-3 text-[#70757f] truncate max-w-[140px]">
                    {song.album || 'Single'}
                  </td>
                )}

                {/* 5. Genre */}
                <td className="hidden lg:table-cell py-2 px-3">
                  <span className="px-2 py-0.5 rounded bg-[#1f2025] text-[#848a93] text-[10px] font-medium border border-[#2a2c34]">
                    {song.genre}
                  </span>
                </td>

                {/* 6. Duration */}
                <td className="py-2 px-3 text-right font-mono text-[11px] text-[#70757f]">
                  {formatDuration(song.duration)}
                </td>

                {/* 7. Hover Actions */}
                <td className="py-2 px-3 text-right">
                  <div
                    className={`flex items-center justify-end gap-1.5 transition-opacity ${
                      isHovered || liked ? 'opacity-100' : 'opacity-0 sm:opacity-0'
                    }`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Like / Favorite */}
                    <button
                      onClick={() => toggleLike(song.id)}
                      className={`p-1 rounded hover:bg-[#25272e] transition-colors ${
                        liked ? 'text-[#4ea824]' : 'text-[#70757f] hover:text-[#f4f4f5]'
                      }`}
                      title={liked ? 'Unlike' : 'Like'}
                    >
                      <Heart className={`w-3.5 h-3.5 ${liked ? 'fill-current' : ''}`} />
                    </button>

                    {/* Add to Playlist */}
                    {onOpenAddToPlaylist && (
                      <button
                        onClick={() => onOpenAddToPlaylist(song)}
                        className="p-1 rounded text-[#70757f] hover:text-[#f4f4f5] hover:bg-[#25272e] transition-colors"
                        title="Add to Playlist"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {/* Download */}
                    <button
                      onClick={() => downloadSong(song)}
                      className="p-1 rounded text-[#70757f] hover:text-[#f4f4f5] hover:bg-[#25272e] transition-colors"
                      title="Download Track"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>

                    {/* Remove from Playlist if in playlist context */}
                    {playlistId && (
                      <button
                        onClick={() => removeSongFromPlaylist(playlistId, song.id)}
                        className="p-1 rounded text-[#70757f] hover:text-[#e05252] hover:bg-[#25272e] transition-colors"
                        title="Remove from this playlist"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {/* Share */}
                    <button
                      onClick={(e) => handleShare(e, song)}
                      className="p-1 rounded text-[#70757f] hover:text-[#f4f4f5] hover:bg-[#25272e] transition-colors"
                      title="Copy Share Link"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
