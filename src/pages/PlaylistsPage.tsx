import React from 'react';
import { ListMusic, Plus } from 'lucide-react';
import { useMusicPlayer } from '../context/MusicPlayerContext';
import { PlaylistCard } from '../components/PlaylistCard';

interface PlaylistsPageProps {
  onNavigateToPlaylist: (playlistId: string) => void;
  onOpenCreatePlaylist: () => void;
}

export const PlaylistsPage: React.FC<PlaylistsPageProps> = ({
  onNavigateToPlaylist,
  onOpenCreatePlaylist,
}) => {
  const { playlists } = useMusicPlayer();

  return (
    <div id="spotibai-playlists-page" className="p-5 md:p-8 space-y-6 pb-28 max-w-7xl mx-auto select-none">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-[#f4f4f5] tracking-tight">
            Playlists
          </h1>
          <p className="text-xs text-[#848a93] mt-0.5">
            Curated playlists, mixtapes, and your custom audio sets.
          </p>
        </div>

        <button
          onClick={onOpenCreatePlaylist}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#4ea824] hover:bg-[#5bbd2d] text-white text-xs font-semibold transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Playlist</span>
        </button>
      </div>

      {playlists.length === 0 ? (
        <div className="py-16 text-center text-[#70757f] bg-[#151619] rounded-md border border-[#24252b] space-y-3">
          <ListMusic className="w-8 h-8 mx-auto text-[#60646c]" />
          <h3 className="text-sm font-semibold text-[#f4f4f5]">No playlists yet</h3>
          <p className="text-xs text-[#70757f] max-w-sm mx-auto">
            Create your first playlist to organize your favorite music.
          </p>
          <button
            onClick={onOpenCreatePlaylist}
            className="px-3.5 py-1.5 rounded-md bg-[#4ea824] hover:bg-[#5bbd2d] text-white text-xs font-semibold transition-colors"
          >
            Create Playlist
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
  );
};
