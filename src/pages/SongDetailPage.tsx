import React from 'react';
import {
  Play,
  Pause,
  Heart,
  Download,
  Plus,
  ArrowLeft,
  Music,
  Share2
} from 'lucide-react';
import { useMusicPlayer } from '../context/MusicPlayerContext';
import { useToast } from '../context/ToastContext';
import { Song, NavigationRoute } from '../types';
import { SongCard } from '../components/SongCard';

interface SongDetailPageProps {
  songId: string;
  onNavigateToSong: (songId: string) => void;
  setCurrentRoute?: (route: NavigationRoute) => void;
  onNavigate?: (path: string) => void;
  onOpenAddToPlaylist: (song: Song) => void;
}

export const SongDetailPage: React.FC<SongDetailPageProps> = ({
  songId,
  onNavigateToSong,
  setCurrentRoute,
  onNavigate,
  onOpenAddToPlaylist,
}) => {
  const {
    songs,
    currentSong,
    isPlaying,
    playSong,
    pauseSong,
    toggleLike,
    isLiked,
    downloadSong,
  } = useMusicPlayer();
  const { showToast } = useToast();

  const song = songs.find((s) => s.id === songId);

  const handleBack = () => {
    if (onNavigate) onNavigate('/library');
    else if (setCurrentRoute) setCurrentRoute('library');
  };

  if (!song) {
    return (
      <div className="p-8 text-center py-24 space-y-3">
        <h2 className="text-base font-bold text-[#f4f4f5]">Song not found</h2>
        <p className="text-xs text-[#70757f]">The requested audio track does not exist or was removed.</p>
        <button
          onClick={handleBack}
          className="px-3 py-1.5 rounded-md bg-[#1f2025] hover:bg-[#25272e] text-[#f4f4f5] text-xs font-medium border border-[#2d2e36]"
        >
          Return to Library
        </button>
      </div>
    );
  }

  const isCurrentPlaying = currentSong?.id === song.id && isPlaying;
  const liked = isLiked(song.id);

  const handleTogglePlay = () => {
    if (isCurrentPlaying) {
      pauseSong();
    } else {
      playSong(song);
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast('Track link copied to clipboard', 'info');
    }
  };

  // Similar tracks by genre or artist
  const similarSongs = songs
    .filter((s) => s.id !== song.id && (s.genre === song.genre || s.artist === song.artist))
    .slice(0, 6);

  return (
    <div id="spotibai-song-detail-page" className="p-5 md:p-8 space-y-8 pb-28 max-w-7xl mx-auto select-none">
      {/* Back button */}
      <button
        onClick={handleBack}
        className="flex items-center gap-1.5 text-xs text-[#848a93] hover:text-[#f4f4f5] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back</span>
      </button>

      {/* Song Header Banner */}
      <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 bg-[#151619] border border-[#24252b] rounded-md p-6">
        {/* Cover Artwork */}
        <div className="w-40 h-40 rounded bg-[#1c1d22] border border-[#26272d] overflow-hidden shrink-0 relative group">
          <img
            src={song.artwork_url}
            alt={song.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=300&q=80';
            }}
          />
          <button
            onClick={handleTogglePlay}
            className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
          >
            <div className="w-12 h-12 rounded-full bg-[#4ea824] hover:bg-[#5bbd2d] flex items-center justify-center shadow-md">
              {isCurrentPlaying ? (
                <Pause className="w-5 h-5 fill-current" />
              ) : (
                <Play className="w-5 h-5 fill-current ml-0.5" />
              )}
            </div>
          </button>
        </div>

        {/* Track Details */}
        <div className="space-y-1.5 text-center sm:text-left flex-1 min-w-0">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#60646c]">
              Song
            </span>
            <span className="text-[#60646c] text-xs">•</span>
            <span className="px-1.5 py-0.5 rounded bg-[#202227] text-[#848a93] text-[10px] font-medium border border-[#2a2c34]">
              {song.genre}
            </span>
          </div>

          <h1 className="text-2xl md:text-4xl font-bold text-[#f4f4f5] tracking-tight truncate">
            {song.title}
          </h1>

          <p className="text-sm text-[#9ba1a6] font-medium">{song.artist}</p>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-[11px] text-[#70757f] font-mono pt-1">
            <span>Album: {song.album || 'Single'}</span>
            <span>•</span>
            <span>Year: {song.release_year}</span>
            <span>•</span>
            <span>Duration: {Math.floor((song.duration || 180) / 60)}:{((song.duration || 180) % 60).toString().padStart(2, '0')}</span>
            <span>•</span>
            <span>{song.play_count.toLocaleString()} plays</span>
            <span>•</span>
            <span>{song.download_count.toLocaleString()} downloads</span>
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleTogglePlay}
            className="flex items-center gap-2 px-4 py-2 rounded-md bg-[#4ea824] hover:bg-[#5bbd2d] text-white text-xs font-semibold transition-colors shadow-sm"
          >
            {isCurrentPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                <span>Play</span>
              </>
            )}
          </button>

          <button
            onClick={() => toggleLike(song.id)}
            className={`p-2 rounded-md border transition-colors ${
              liked
                ? 'bg-[#1f2025] border-[#2d2e36] text-[#e05252]'
                : 'bg-[#1f2025] hover:bg-[#282a32] border-[#2d2e36] text-[#848a93] hover:text-[#f4f4f5]'
            }`}
            title={liked ? 'Unlike' : 'Like'}
          >
            <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
          </button>

          <button
            onClick={() => onOpenAddToPlaylist(song)}
            className="p-2 rounded-md bg-[#1f2025] hover:bg-[#282a32] border border-[#2d2e36] text-[#848a93] hover:text-[#f4f4f5] transition-colors"
            title="Add to Playlist"
          >
            <Plus className="w-4 h-4" />
          </button>

          <button
            onClick={() => downloadSong(song)}
            className="p-2 rounded-md bg-[#1f2025] hover:bg-[#282a32] border border-[#2d2e36] text-[#848a93] hover:text-[#f4f4f5] transition-colors"
            title="Download Track"
          >
            <Download className="w-4 h-4" />
          </button>

          <button
            onClick={handleShare}
            className="p-2 rounded-md bg-[#1f2025] hover:bg-[#282a32] border border-[#2d2e36] text-[#848a93] hover:text-[#f4f4f5] transition-colors"
            title="Share Song Link"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Description if any */}
      {song.description && (
        <div className="bg-[#151619] border border-[#24252b] rounded-md p-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[#848a93] mb-1">
            About this track
          </h3>
          <p className="text-xs text-[#f4f4f5] leading-relaxed">{song.description}</p>
        </div>
      )}

      {/* More tracks like this */}
      {similarSongs.length > 0 && (
        <section className="space-y-3">
          <h3 className="text-sm font-bold text-[#f4f4f5]">
            More from {song.genre} & Related
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {similarSongs.map((simSong) => (
              <SongCard
                key={simSong.id}
                song={simSong}
                onNavigateToSong={onNavigateToSong}
                onOpenAddToPlaylist={onOpenAddToPlaylist}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
