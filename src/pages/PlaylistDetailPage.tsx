import React, { useState } from 'react';
import {
  Play,
  ListMusic,
  Trash2,
  Edit2,
  ArrowLeft,
  X
} from 'lucide-react';
import { useMusicPlayer } from '../context/MusicPlayerContext';
import { useAuth } from '../context/AuthContext';
import { SongList } from '../components/SongList';
import { Song, NavigationRoute } from '../types';

interface PlaylistDetailPageProps {
  playlistId: string;
  onNavigateToSong: (songId: string) => void;
  setCurrentRoute?: (route: NavigationRoute) => void;
  onNavigate?: (path: string) => void;
  onOpenAddToPlaylist: (song: Song) => void;
}

export const PlaylistDetailPage: React.FC<PlaylistDetailPageProps> = ({
  playlistId,
  onNavigateToSong,
  setCurrentRoute,
  onNavigate,
  onOpenAddToPlaylist,
}) => {
  const { playlists, songs, playSong, updatePlaylist, deletePlaylist } = useMusicPlayer();
  const { user } = useAuth();

  const playlist = playlists.find((p) => p.id === playlistId);

  // Edit states
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  const handleBack = () => {
    if (onNavigate) onNavigate('/playlists');
    else if (setCurrentRoute) setCurrentRoute('playlists');
  };

  if (!playlist) {
    return (
      <div className="p-8 text-center py-24 space-y-3">
        <h2 className="text-base font-bold text-[#f4f4f5]">Playlist not found</h2>
        <p className="text-xs text-[#70757f]">The requested playlist does not exist or was removed.</p>
        <button
          onClick={handleBack}
          className="px-3 py-1.5 rounded-md bg-[#1f2025] hover:bg-[#25272e] text-[#f4f4f5] text-xs font-medium border border-[#2d2e36]"
        >
          Back to Playlists
        </button>
      </div>
    );
  }

  // Playlist songs
  const playlistSongs = playlist.song_ids
    .map((id) => songs.find((s) => s.id === id))
    .filter((s): s is Song => Boolean(s));

  const totalDuration = playlistSongs.reduce((acc, s) => acc + (s.duration || 180), 0);
  const durationMins = Math.floor(totalDuration / 60);

  const isOwner = user ? playlist.owner_id === user.id : true;

  const handlePlayAll = () => {
    if (playlistSongs.length > 0) {
      playSong(playlistSongs[0], playlistSongs);
    }
  };

  const handleStartEdit = () => {
    setEditName(playlist.name);
    setEditDesc(playlist.description || '');
    setIsEditing(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) return;
    updatePlaylist(playlist.id, editName.trim(), editDesc.trim(), playlist.cover_url);
    setIsEditing(false);
  };

  const handleConfirmDelete = () => {
    deletePlaylist(playlist.id);
    handleBack();
  };

  return (
    <div id="spotibai-playlist-detail-page" className="p-5 md:p-8 space-y-6 pb-28 max-w-7xl mx-auto select-none">
      {/* Back button */}
      <button
        onClick={handleBack}
        className="flex items-center gap-1.5 text-xs text-[#848a93] hover:text-[#f4f4f5] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Playlists</span>
      </button>

      {/* Playlist Header Banner */}
      <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5 bg-[#151619] border border-[#24252b] rounded-md p-6">
        {/* Cover Artwork */}
        <div className="w-36 h-36 rounded bg-[#1c1d22] border border-[#26272d] overflow-hidden shrink-0 flex items-center justify-center">
          {playlist.cover_url ? (
            <img
              src={playlist.cover_url}
              alt={playlist.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=300&q=80';
              }}
            />
          ) : (
            <ListMusic className="w-12 h-12 text-[#4ea824]" />
          )}
        </div>

        {/* Info */}
        <div className="space-y-1 text-center sm:text-left flex-1 min-w-0">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#60646c]">
            Playlist
          </span>
          <h1 className="text-2xl md:text-3xl font-bold text-[#f4f4f5] tracking-tight truncate">
            {playlist.name}
          </h1>
          {playlist.description && (
            <p className="text-xs text-[#848a93] line-clamp-2">{playlist.description}</p>
          )}
          <p className="text-[11px] font-mono text-[#60646c] pt-1">
            Created by {playlist.owner_name || 'SPOTIBAI User'} • {playlistSongs.length} tracks • {durationMins} min
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {playlistSongs.length > 0 && (
            <button
              onClick={handlePlayAll}
              className="flex items-center gap-2 px-4 py-2 rounded-md bg-[#4ea824] hover:bg-[#5bbd2d] text-white text-xs font-semibold transition-colors shadow-sm"
            >
              <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
              <span>Play</span>
            </button>
          )}

          {isOwner && (
            <>
              <button
                onClick={handleStartEdit}
                className="p-2 rounded-md bg-[#1f2025] hover:bg-[#282a32] border border-[#2d2e36] text-[#848a93] hover:text-[#f4f4f5] transition-colors"
                title="Edit Playlist"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setIsConfirmingDelete(true)}
                className="p-2 rounded-md bg-[#1f2025] hover:bg-[#282a32] border border-[#2d2e36] text-[#70757f] hover:text-[#e05252] transition-colors"
                title="Delete Playlist"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Playlist Tracks Table */}
      <div className="bg-[#151619] border border-[#24252b] rounded-md overflow-hidden p-1">
        <SongList
          songs={playlistSongs}
          onNavigateToSong={onNavigateToSong}
          onOpenAddToPlaylist={onOpenAddToPlaylist}
          customEmptyMessage="This playlist is currently empty. Browse or search songs and click '+' to add them here."
        />
      </div>

      {/* Edit Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-[#18191d] border border-[#2d2e36] rounded-md p-6 w-full max-w-sm space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#26272d] pb-3">
              <h3 className="text-sm font-bold text-[#f4f4f5]">Edit Playlist</h3>
              <button
                onClick={() => setIsEditing(false)}
                className="text-[#70757f] hover:text-[#f4f4f5]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#9ba1a6] font-medium mb-1">Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-[#141518] border border-[#26272d] rounded-md px-3 py-1.5 text-[#f4f4f5] outline-none focus:border-[#4ea824]"
                  required
                />
              </div>

              <div>
                <label className="block text-[#9ba1a6] font-medium mb-1">Description</label>
                <textarea
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  rows={3}
                  className="w-full bg-[#141518] border border-[#26272d] rounded-md px-3 py-1.5 text-[#f4f4f5] outline-none focus:border-[#4ea824] resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#26272d]">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1.5 rounded-md bg-[#202227] hover:bg-[#282a32] text-[#9ba1a6] hover:text-[#f4f4f5]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 rounded-md bg-[#4ea824] hover:bg-[#5bbd2d] text-white font-semibold"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {isConfirmingDelete && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-[#18191d] border border-[#2d2e36] rounded-md p-6 w-full max-w-sm space-y-4 shadow-xl text-center">
            <h3 className="text-sm font-bold text-[#f4f4f5]">Delete Playlist?</h3>
            <p className="text-xs text-[#848a93]">
              Are you sure you want to delete "{playlist.name}"? The songs will remain in your library.
            </p>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setIsConfirmingDelete(false)}
                className="px-3 py-1.5 rounded-md bg-[#202227] hover:bg-[#282a32] text-xs text-[#9ba1a6] hover:text-[#f4f4f5]"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-3.5 py-1.5 rounded-md bg-[#e05252] hover:bg-[#ef4444] text-white text-xs font-semibold"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
