import React from 'react';
import { X, Trash2, Play, Music } from 'lucide-react';
import { useMusicPlayer } from '../context/MusicPlayerContext';
import { Song } from '../types';

export const QueuePanel: React.FC = () => {
  const {
    queue,
    currentSong,
    isPlaying,
    isQueueOpen,
    setIsQueueOpen,
    removeFromQueue,
    clearQueue,
    playSong,
  } = useMusicPlayer();

  if (!isQueueOpen) return null;

  return (
    <div
      id="spotibai-queue-panel"
      className="fixed top-12 right-0 bottom-[68px] w-80 md:w-88 bg-[#16171b] border-l border-[#24252b] z-30 flex flex-col select-none shadow-xl"
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-[#24252b] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Music className="w-4 h-4 text-[#4ea824]" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#f4f4f5]">Play Queue</h3>
          <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#202227] text-[#848a93] font-mono">
            {queue.length}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {queue.length > 0 && (
            <button
              onClick={clearQueue}
              className="p-1 rounded text-[#70757f] hover:text-[#e05252] transition-colors"
              title="Clear queue"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={() => setIsQueueOpen(false)}
            className="p-1 rounded text-[#70757f] hover:text-[#f4f4f5] transition-colors"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {/* Now Playing */}
        {currentSong && (
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[#70757f] mb-1.5 px-1">
              Now Playing
            </p>
            <div className="flex items-center gap-2.5 p-2 rounded bg-[#1f2025] border border-[#2d2e36]">
              <img
                src={currentSong.artwork_url}
                alt={currentSong.title}
                className="w-10 h-10 rounded object-cover shrink-0 border border-[#26272d]"
              />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-[#4ea824] truncate">{currentSong.title}</p>
                <p className="text-[11px] text-[#848a93] truncate">{currentSong.artist}</p>
              </div>
              <div className="w-2 h-2 rounded-full bg-[#4ea824] shrink-0 mr-1 animate-pulse" />
            </div>
          </div>
        )}

        {/* Up Next */}
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[#70757f] mb-1.5 px-1">
            Next In Queue ({queue.length})
          </p>

          {queue.length === 0 ? (
            <div className="py-8 text-center text-[#70757f]">
              <p className="text-xs">Queue is empty</p>
              <p className="text-[11px] mt-0.5 text-[#60646c]">
                Add songs from any list to queue them up
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {queue.map((song: Song, index: number) => (
                <div
                  key={`${song.id}-${index}`}
                  className="group flex items-center gap-2.5 p-1.5 rounded hover:bg-[#1f2025] transition-colors"
                >
                  <span className="w-5 text-center text-[10px] font-mono text-[#60646c]">
                    {index + 1}
                  </span>
                  <img
                    src={song.artwork_url}
                    alt={song.title}
                    className="w-8 h-8 rounded object-cover shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-[#f4f4f5] truncate">{song.title}</p>
                    <p className="text-[10px] text-[#70757f] truncate">{song.artist}</p>
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => playSong(song)}
                      className="p-1 text-[#4ea824] hover:text-[#5bbd2d]"
                      title="Play now"
                    >
                      <Play className="w-3 h-3 fill-current" />
                    </button>
                    <button
                      onClick={() => removeFromQueue(index)}
                      className="p-1 text-[#70757f] hover:text-[#e05252]"
                      title="Remove from queue"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
