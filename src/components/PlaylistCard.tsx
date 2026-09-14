import React, { memo } from 'react';
import { Play, ListMusic } from 'lucide-react';
import { Playlist } from '../types';
import { useMusicPlayer } from '../context/MusicPlayerContext';

interface PlaylistCardProps {
  playlist: Playlist;
  onSelect: (playlistId: string) => void;
}

export const PlaylistCard: React.FC<PlaylistCardProps> = memo(({ playlist, onSelect }) => {
  const { songs, playSong } = useMusicPlayer();

  const handlePlayPlaylist = (e: React.MouseEvent) => {
    e.stopPropagation();
    const playlistSongs = songs.filter((s) => playlist.song_ids.includes(s.id));
    if (playlistSongs.length > 0) {
      playSong(playlistSongs[0], playlistSongs);
    }
  };

  return (
    <div
      id={`playlist-card-${playlist.id}`}
      onClick={() => onSelect(playlist.id)}
      className="group bg-[#16171b] hover:bg-[#1f2025] p-2.5 rounded-md border border-[#24252b] hover:border-[#33353d] transition-colors cursor-pointer flex flex-col select-none"
    >
      {/* Artwork */}
      <div className="relative aspect-square w-full rounded overflow-hidden bg-[#1c1d22] mb-2.5">
        {playlist.cover_url ? (
          <img
            src={playlist.cover_url}
            alt={playlist.name}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=300&q=80';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-[#1c1d22] text-[#4ea824]">
            <ListMusic className="w-8 h-8" />
          </div>
        )}

        {/* Hover play button */}
        <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handlePlayPlaylist}
            className="w-9 h-9 rounded-full bg-[#4ea824] hover:bg-[#5bbd2d] text-white flex items-center justify-center shadow-md transition-transform active:scale-95"
            title="Play Playlist"
          >
            <Play className="w-4 h-4 fill-current ml-0.5" />
          </button>
        </div>

        {/* Track count badge */}
        <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-black/70 text-[10px] font-mono text-[#f4f4f5]">
          {playlist.song_ids.length} {playlist.song_ids.length === 1 ? 'track' : 'tracks'}
        </span>
      </div>

      <div className="min-w-0">
        <h4 className="text-xs font-semibold text-[#f4f4f5] truncate" title={playlist.name}>
          {playlist.name}
        </h4>
        <p className="text-[11px] text-[#848a93] truncate mt-0.5">
          {playlist.description || `Created by ${playlist.owner_name || 'SPOTIBAI'}`}
        </p>
      </div>
    </div>
  );
});
