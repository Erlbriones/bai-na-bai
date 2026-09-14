import React, { useState } from 'react';
import {
  FileAudio,
  Edit2,
  Trash2,
  Play,
  Download,
  Plus,
  AlertTriangle,
  X
} from 'lucide-react';
import { useMusicPlayer } from '../context/MusicPlayerContext';
import { useAuth } from '../context/AuthContext';
import { Song, NavigationRoute } from '../types';
import { MUSIC_GENRES } from '../data/seedData';

interface MyUploadsPageProps {
  setCurrentRoute?: (route: NavigationRoute) => void;
  onNavigate?: (path: string) => void;
  onNavigateToSong?: (songId: string) => void;
  onOpenAddToPlaylist?: (song: Song) => void;
}

export const MyUploadsPage: React.FC<MyUploadsPageProps> = ({
  setCurrentRoute,
  onNavigate,
  onNavigateToSong,
}) => {
  const { songs, playSong, updateSongMetadata, deleteUploadedSong } = useMusicPlayer();
  const { user } = useAuth();

  // User uploaded tracks
  const userUploads = songs.filter((s) => s.uploader_id === user?.id || s.is_local);

  // Edit Modal
  const [editingSong, setEditingSong] = useState<Song | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editArtist, setEditArtist] = useState('');
  const [editAlbum, setEditAlbum] = useState('');
  const [editGenre, setEditGenre] = useState('');
  const [editYear, setEditYear] = useState(2024);

  // Delete modal
  const [deletingSong, setDeletingSong] = useState<Song | null>(null);

  const startEdit = (song: Song) => {
    setEditingSong(song);
    setEditTitle(song.title);
    setEditArtist(song.artist);
    setEditAlbum(song.album || 'Single');
    setEditGenre(song.genre);
    setEditYear(song.release_year || 2024);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSong || !editTitle.trim()) return;

    updateSongMetadata(editingSong.id, {
      title: editTitle.trim(),
      artist: editArtist.trim(),
      album: editAlbum.trim(),
      genre: editGenre,
      release_year: editYear,
    });

    setEditingSong(null);
  };

  const handleConfirmDelete = () => {
    if (!deletingSong) return;
    deleteUploadedSong(deletingSong.id);
    setDeletingSong(null);
  };

  const handleGoUpload = () => {
    if (onNavigate) onNavigate('/upload');
    else if (setCurrentRoute) setCurrentRoute('upload');
  };

  return (
    <div id="spotibai-my-uploads-page" className="p-5 md:p-8 space-y-6 pb-28 max-w-7xl mx-auto select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-[#f4f4f5] tracking-tight">
            Manage Uploaded Music
          </h1>
          <p className="text-xs text-[#848a93] mt-0.5">
            Manage audio tracks you have published to SPOTIBAI.
          </p>
        </div>

        <button
          onClick={handleGoUpload}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#4ea824] hover:bg-[#5bbd2d] text-white text-xs font-semibold transition-colors self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Upload Track</span>
        </button>
      </div>

      {userUploads.length === 0 ? (
        <div className="py-16 text-center text-[#70757f] bg-[#151619] rounded-md border border-[#24252b] space-y-3">
          <FileAudio className="w-8 h-8 mx-auto text-[#60646c]" />
          <h3 className="text-sm font-semibold text-[#f4f4f5]">No uploaded tracks yet</h3>
          <p className="text-xs text-[#70757f] max-w-sm mx-auto">
            Upload your own audio files (MP3, WAV, FLAC, M4A, OGG) to stream and manage here.
          </p>
          <button
            onClick={handleGoUpload}
            className="px-3.5 py-1.5 rounded-md bg-[#4ea824] hover:bg-[#5bbd2d] text-white text-xs font-semibold transition-colors"
          >
            Upload a Track
          </button>
        </div>
      ) : (
        <div className="bg-[#151619] border border-[#24252b] rounded-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#24252b] text-[11px] font-semibold uppercase tracking-wider text-[#60646c]">
                  <th className="py-2.5 px-4">Track</th>
                  <th className="hidden md:table-cell py-2.5 px-4">Album</th>
                  <th className="hidden lg:table-cell py-2.5 px-4">Genre</th>
                  <th className="hidden sm:table-cell py-2.5 px-4 text-center">Plays</th>
                  <th className="hidden sm:table-cell py-2.5 px-4 text-center">Downloads</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e2025]">
                {userUploads.map((song) => (
                  <tr key={song.id} className="hover:bg-[#1a1b20] transition-colors">
                    {/* Artwork & Title */}
                    <td className="py-2.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={song.artwork_url}
                          alt={song.title}
                          className="w-10 h-10 rounded object-cover border border-[#26272d] shrink-0"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=150&q=80';
                          }}
                        />
                        <div className="min-w-0">
                          <p
                            onClick={() => onNavigateToSong && onNavigateToSong(song.id)}
                            className="font-medium text-[#f4f4f5] truncate hover:underline cursor-pointer"
                          >
                            {song.title}
                          </p>
                          <p className="text-[11px] text-[#70757f] truncate">{song.artist}</p>
                        </div>
                      </div>
                    </td>

                    {/* Album */}
                    <td className="hidden md:table-cell py-2.5 px-4 text-[#848a93]">
                      {song.album || 'Single'}
                    </td>

                    {/* Genre */}
                    <td className="hidden lg:table-cell py-2.5 px-4">
                      <span className="px-2 py-0.5 rounded bg-[#1f2025] text-[#848a93] text-[10px] font-medium border border-[#2a2c34]">
                        {song.genre}
                      </span>
                    </td>

                    {/* Plays */}
                    <td className="hidden sm:table-cell py-2.5 px-4 text-center font-mono text-[#848a93]">
                      {song.play_count.toLocaleString()}
                    </td>

                    {/* Downloads */}
                    <td className="hidden sm:table-cell py-2.5 px-4 text-center font-mono text-[#848a93]">
                      {song.download_count.toLocaleString()}
                    </td>

                    {/* Actions */}
                    <td className="py-2.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => playSong(song)}
                          className="p-1.5 rounded hover:bg-[#202227] text-[#4ea824] transition-colors"
                          title="Play Track"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                        </button>

                        <button
                          onClick={() => startEdit(song)}
                          className="p-1.5 rounded hover:bg-[#202227] text-[#848a93] hover:text-[#f4f4f5] transition-colors"
                          title="Edit Track Metadata"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => setDeletingSong(song)}
                          className="p-1.5 rounded hover:bg-[#202227] text-[#70757f] hover:text-[#e05252] transition-colors"
                          title="Delete Track"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Metadata Modal */}
      {editingSong && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-[#18191d] border border-[#2d2e36] rounded-md p-6 w-full max-w-md space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#26272d] pb-3">
              <h3 className="text-sm font-bold text-[#f4f4f5]">Edit Track Metadata</h3>
              <button
                onClick={() => setEditingSong(null)}
                className="text-[#70757f] hover:text-[#f4f4f5]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#9ba1a6] font-medium mb-1">Song Title</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full bg-[#141518] border border-[#26272d] rounded-md px-3 py-1.5 text-[#f4f4f5] outline-none focus:border-[#4ea824]"
                  required
                />
              </div>

              <div>
                <label className="block text-[#9ba1a6] font-medium mb-1">Artist</label>
                <input
                  type="text"
                  value={editArtist}
                  onChange={(e) => setEditArtist(e.target.value)}
                  className="w-full bg-[#141518] border border-[#26272d] rounded-md px-3 py-1.5 text-[#f4f4f5] outline-none focus:border-[#4ea824]"
                  required
                />
              </div>

              <div>
                <label className="block text-[#9ba1a6] font-medium mb-1">Album</label>
                <input
                  type="text"
                  value={editAlbum}
                  onChange={(e) => setEditAlbum(e.target.value)}
                  className="w-full bg-[#141518] border border-[#26272d] rounded-md px-3 py-1.5 text-[#f4f4f5] outline-none focus:border-[#4ea824]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#9ba1a6] font-medium mb-1">Genre</label>
                  <select
                    value={editGenre}
                    onChange={(e) => setEditGenre(e.target.value)}
                    className="w-full bg-[#141518] border border-[#26272d] rounded-md px-2.5 py-1.5 text-[#f4f4f5] outline-none focus:border-[#4ea824]"
                  >
                    {MUSIC_GENRES.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[#9ba1a6] font-medium mb-1">Year</label>
                  <input
                    type="number"
                    value={editYear}
                    onChange={(e) => setEditYear(parseInt(e.target.value) || 2024)}
                    className="w-full bg-[#141518] border border-[#26272d] rounded-md px-3 py-1.5 text-[#f4f4f5] outline-none focus:border-[#4ea824] font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#26272d]">
                <button
                  type="button"
                  onClick={() => setEditingSong(null)}
                  className="px-3 py-1.5 rounded-md bg-[#202227] hover:bg-[#282a32] text-[#9ba1a6] hover:text-[#f4f4f5]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 rounded-md bg-[#4ea824] hover:bg-[#5bbd2d] text-white font-semibold"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingSong && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-[#18191d] border border-[#2d2e36] rounded-md p-6 w-full max-w-sm space-y-4 shadow-xl text-center">
            <div className="w-10 h-10 rounded-full bg-[#e05252]/10 border border-[#e05252]/30 flex items-center justify-center mx-auto text-[#e05252]">
              <AlertTriangle className="w-5 h-5" />
            </div>

            <div>
              <h3 className="text-sm font-bold text-[#f4f4f5]">Delete this track?</h3>
              <p className="text-xs text-[#848a93] mt-1">
                "{deletingSong.title}" will be permanently removed from your uploads.
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setDeletingSong(null)}
                className="px-3 py-1.5 rounded-md bg-[#202227] hover:bg-[#282a32] text-xs text-[#9ba1a6] hover:text-[#f4f4f5]"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-3.5 py-1.5 rounded-md bg-[#e05252] hover:bg-[#ef4444] text-white text-xs font-semibold"
              >
                Delete Track
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
