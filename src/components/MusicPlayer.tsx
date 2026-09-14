import React, { useState } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Repeat,
  Repeat1,
  Shuffle,
  Volume2,
  VolumeX,
  Volume1,
  Heart,
  Download,
  ListMusic,
  Music
} from 'lucide-react';
import { useMusicPlayer } from '../context/MusicPlayerContext';
import { Song } from '../types';

interface MusicPlayerProps {
  onNavigateToSong?: (songId: string) => void;
  onOpenSongDetail?: (songId: string) => void;
  onOpenAddToPlaylist?: (song: Song) => void;
}

export const MusicPlayer: React.FC<MusicPlayerProps> = ({
  onNavigateToSong,
  onOpenSongDetail,
}) => {
  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    repeatMode,
    isShuffled,
    togglePlayPause,
    playNext,
    playPrevious,
    seekTo,
    setVolumeLevel,
    toggleMute,
    toggleRepeat,
    toggleShuffle,
    toggleLike,
    isLiked,
    downloadSong,
    toggleQueuePanel,
    isQueueOpen,
    songs,
    playSong,
  } = useMusicPlayer();

  const [imgError, setImgError] = useState(false);

  const handleSongClick = () => {
    if (!currentSong) return;
    if (onOpenSongDetail) {
      onOpenSongDetail(currentSong.id);
    } else if (onNavigateToSong) {
      onNavigateToSong(currentSong.id);
    }
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const targetPercent = parseFloat(e.target.value);
    seekTo((targetPercent / 100) * duration);
  };

  // If no song is loaded, render ready bar with easy 1-click play from catalog
  if (!currentSong) {
    const firstSong = songs[0];
    return (
      <footer
        id="spotibai-music-player"
        className="fixed bottom-0 left-0 right-0 h-18 bg-[#151619] border-t border-[#24252b] px-4 md:px-6 flex items-center justify-between z-40 select-none"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-[#1f2025] border border-[#2b2d35] flex items-center justify-center text-[#71757e]">
            <Music className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-semibold text-[#f4f4f5]">SPOTIBAI Player</p>
            <p className="text-[11px] text-[#848a93]">Select a track to start playback</p>
          </div>
        </div>

        {firstSong && (
          <button
            onClick={() => playSong(firstSong)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#4ea824] hover:bg-[#5bbd2d] text-white text-xs font-semibold transition-colors"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Play "{firstSong.title}"</span>
          </button>
        )}
      </footer>
    );
  }

  const isCurrentLiked = isLiked(currentSong.id);

  return (
    <footer
      id="spotibai-music-player"
      className="fixed bottom-0 left-0 right-0 h-18 bg-[#151619] border-t border-[#24252b] px-4 md:px-6 flex items-center justify-between z-40 select-none"
    >
      {/* 1. Left: Track Info & Favorite */}
      <div className="flex items-center gap-3 w-1/4 min-w-[180px] max-w-[280px]">
        <div
          onClick={handleSongClick}
          className="relative shrink-0 cursor-pointer group"
          title="View song info"
        >
          {!imgError ? (
            <img
              src={currentSong.artwork_url}
              alt={currentSong.title}
              onError={() => setImgError(true)}
              decoding="async"
              className="w-11 h-11 rounded object-cover border border-[#26272d] group-hover:opacity-90 transition-opacity"
            />
          ) : (
            <div className="w-11 h-11 rounded bg-[#1f2025] border border-[#2b2d35] flex items-center justify-center text-[#4ea824]">
              <Music className="w-5 h-5" />
            </div>
          )}

          {/* Playing indicator equalizer overlay */}
          {isPlaying && (
            <div className="absolute inset-0 bg-black/40 rounded flex items-center justify-center gap-0.5">
              <span className="w-1 bg-[#4ea824] rounded-full playing-eq-1" />
              <span className="w-1 bg-[#4ea824] rounded-full playing-eq-2" />
              <span className="w-1 bg-[#4ea824] rounded-full playing-eq-3" />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p
            onClick={handleSongClick}
            className="text-xs font-semibold text-[#f4f4f5] truncate cursor-pointer hover:underline"
            title={currentSong.title}
          >
            {currentSong.title}
          </p>
          <p className="text-[11px] text-[#848a93] truncate" title={currentSong.artist}>
            {currentSong.artist}
          </p>
        </div>

        {/* Favorite button */}
        <button
          onClick={() => toggleLike(currentSong.id)}
          className={`p-1.5 rounded hover:bg-[#202227] transition-colors shrink-0 ${
            isCurrentLiked ? 'text-[#4ea824]' : 'text-[#70757f] hover:text-[#f4f4f5]'
          }`}
          title={isCurrentLiked ? 'Remove from Liked' : 'Save to Liked'}
        >
          <Heart className={`w-4 h-4 ${isCurrentLiked ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* 2. Center: Controls & Scrubber */}
      <div className="flex flex-col items-center justify-center max-w-[560px] w-2/4 px-2">
        {/* Buttons Row */}
        <div className="flex items-center gap-4 mb-1">
          {/* Shuffle */}
          <button
            onClick={toggleShuffle}
            className={`p-1 rounded transition-colors ${
              isShuffled ? 'text-[#4ea824]' : 'text-[#70757f] hover:text-[#f4f4f5]'
            }`}
            title={`Shuffle: ${isShuffled ? 'On' : 'Off'}`}
          >
            <Shuffle className="w-3.5 h-3.5" />
          </button>

          {/* Previous */}
          <button
            onClick={playPrevious}
            className="p-1 rounded text-[#9ba1a6] hover:text-[#f4f4f5] transition-colors"
            title="Previous Track"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          {/* Play / Pause Primary Button */}
          <button
            id="player-play-pause-btn"
            onClick={togglePlayPause}
            className="w-8 h-8 rounded-full bg-[#4ea824] hover:bg-[#5bbd2d] active:bg-[#41901e] text-white flex items-center justify-center transition-colors shadow-sm"
            title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 fill-current text-white" />
            ) : (
              <Play className="w-4 h-4 fill-current text-white ml-0.5" />
            )}
          </button>

          {/* Next */}
          <button
            onClick={playNext}
            className="p-1 rounded text-[#9ba1a6] hover:text-[#f4f4f5] transition-colors"
            title="Next Track"
          >
            <SkipForward className="w-4 h-4" />
          </button>

          {/* Repeat */}
          <button
            onClick={toggleRepeat}
            className={`p-1 rounded transition-colors ${
              repeatMode !== 'off' ? 'text-[#4ea824]' : 'text-[#70757f] hover:text-[#f4f4f5]'
            }`}
            title={`Repeat: ${repeatMode}`}
          >
            {repeatMode === 'one' ? (
              <Repeat1 className="w-3.5 h-3.5" />
            ) : (
              <Repeat className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        {/* Progress Bar Row */}
        <div className="w-full flex items-center gap-2">
          <span className="text-[10px] font-mono text-[#70757f] w-8 text-right">
            {formatTime(currentTime)}
          </span>

          <div className="relative flex-1 flex items-center group">
            <input
              type="range"
              min="0"
              max="100"
              step="0.1"
              value={progressPercent}
              onChange={handleSeek}
              className="w-full h-1 bg-[#282a31] rounded appearance-none cursor-pointer group-hover:h-1.5 transition-all"
              style={{
                background: `linear-gradient(to right, #4ea824 ${progressPercent}%, #282a31 ${progressPercent}%)`,
              }}
            />
          </div>

          <span className="text-[10px] font-mono text-[#70757f] w-8 text-left">
            {formatTime(duration)}
          </span>
        </div>
      </div>

      {/* 3. Right: Download, Queue, Volume */}
      <div className="flex items-center justify-end gap-3 w-1/4 min-w-[150px]">
        {/* Download Track */}
        <button
          onClick={() => downloadSong(currentSong)}
          className="p-1.5 rounded text-[#70757f] hover:text-[#f4f4f5] hover:bg-[#202227] transition-colors"
          title="Download audio file to computer"
        >
          <Download className="w-4 h-4" />
        </button>

        {/* Queue Toggle */}
        <button
          onClick={toggleQueuePanel}
          className={`p-1.5 rounded transition-colors ${
            isQueueOpen
              ? 'text-[#4ea824] bg-[#202227]'
              : 'text-[#70757f] hover:text-[#f4f4f5] hover:bg-[#202227]'
          }`}
          title="Play Queue"
        >
          <ListMusic className="w-4 h-4" />
        </button>

        {/* Volume Control */}
        <div className="hidden sm:flex items-center gap-2">
          <button
            onClick={toggleMute}
            className="p-1 rounded text-[#70757f] hover:text-[#f4f4f5] transition-colors"
            title={isMuted ? 'Unmute (M)' : 'Mute (M)'}
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-4 h-4 text-[#e05252]" />
            ) : volume < 0.5 ? (
              <Volume1 className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </button>

          <input
            type="range"
            min="0"
            max="1"
            step="0.02"
            value={isMuted ? 0 : volume}
            onChange={(e) => setVolumeLevel(parseFloat(e.target.value))}
            className="w-18 h-1 bg-[#282a31] rounded appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #4ea824 ${
                (isMuted ? 0 : volume) * 100
              }%, #282a31 ${(isMuted ? 0 : volume) * 100}%)`,
            }}
          />
        </div>
      </div>
    </footer>
  );
};
