import React, { useState } from 'react';
import { X, Plus, Check, ListMusic } from 'lucide-react';
import { Song } from '../types';
import { useMusicPlayer } from '../context/MusicPlayerContext';

interface AddToPlaylistModalProps {
  song: Song | null;
  onClose: () => void;
}

export const AddToPlaylistModal: React.FC<AddToPlaylistModalProps> = ({ song, onClose }) => {
  const { playlists, addSongToPlaylist, createPlaylist } = useMusicPlayer();
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  if (!song) return null;

  const handleSelectPlaylist = (playlistId: string) => {
    addSongToPlaylist(playlistId, song.id);
    onClose();
  };

  const handleCreateAndAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;
    const pl = createPlaylist(newPlaylistName.trim());
    addSongToPlaylist(pl.id, song.id);
    onClose();
  };

  return (
    <div
      id="add-to-playlist-modal"
      className="fixed inset-0 bg-black/75 backdrop-blur-xs z-50 flex items-center justify-center p-4 select-none"
      onClick={onClose}
    >
      <div
        className="bg-[#18191d] border border-[#2d2e36] rounded-md w-full max-w-sm p-5 shadow-2xl space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-[#24252b]">
          <div className="min-w-0 pr-2">
            <h3 className="text-sm font-bold text-[#f4f4f5]">Add to Playlist</h3>
            <p className="text-[11px] text-[#848a93] truncate">
              "{song.title}" • {song.artist}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-[#70757f] hover:text-[#f4f4f5] p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Existing playlists */}
        <div className="max-h-56 overflow-y-auto space-y-1">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[#60646c] mb-1.5">
            Choose Destination:
          </p>
          {playlists.length === 0 ? (
            <p className="text-xs text-[#70757f] py-4 text-center">No playlists created yet.</p>
          ) : (
            playlists.map((pl) => {
              const alreadyHas = pl.song_ids.includes(song.id);
              return (
                <button
                  key={pl.id}
                  onClick={() => handleSelectPlaylist(pl.id)}
                  disabled={alreadyHas}
                  className={`w-full flex items-center justify-between p-2 rounded text-left transition-colors ${
                    alreadyHas
                      ? 'opacity-50 cursor-default bg-[#141518]'
                      : 'hover:bg-[#1f2025] text-[#f4f4f5]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded bg-[#1f2025] flex items-center justify-center shrink-0 border border-[#26272d]">
                      {pl.cover_url ? (
                        <img src={pl.cover_url} alt={pl.name} className="w-full h-full object-cover rounded" />
                      ) : (
                        <ListMusic className="w-3.5 h-3.5 text-[#4ea824]" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-[#f4f4f5] truncate">{pl.name}</p>
                      <p className="text-[10px] text-[#70757f] font-mono">{pl.song_ids.length} tracks</p>
                    </div>
                  </div>
                  {alreadyHas && (
                    <span className="flex items-center gap-1 text-[10px] text-[#4ea824] shrink-0 font-mono">
                      <Check className="w-3 h-3" /> In Playlist
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* Inline Create New Playlist */}
        <div className="pt-3 border-t border-[#24252b]">
          {isCreating ? (
            <form onSubmit={handleCreateAndAdd} className="space-y-2 text-xs">
              <input
                type="text"
                placeholder="New playlist title..."
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                autoFocus
                className="w-full bg-[#141518] border border-[#26272d] rounded-md px-3 py-1.5 text-[#f4f4f5] placeholder-[#60646c] outline-none focus:border-[#4ea824]"
              />
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-2.5 py-1 rounded text-[#848a93] hover:text-[#f4f4f5]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1 rounded bg-[#4ea824] hover:bg-[#5bbd2d] text-white font-semibold"
                >
                  Create & Add
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setIsCreating(true)}
              className="w-full flex items-center justify-center gap-1.5 py-2 rounded border border-dashed border-[#2d2e36] hover:border-[#4ea824] text-xs font-medium text-[#848a93] hover:text-[#f4f4f5] transition-colors"
            >
              <Plus className="w-3.5 h-3.5 text-[#4ea824]" />
              <span>Create New Playlist</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
