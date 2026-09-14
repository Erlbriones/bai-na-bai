import React, { useState } from 'react';
import { X, ListMusic, Plus } from 'lucide-react';
import { useMusicPlayer } from '../context/MusicPlayerContext';
import { useToast } from '../context/ToastContext';

interface CreatePlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlaylistCreated?: (playlistId: string) => void;
}

export const CreatePlaylistModal: React.FC<CreatePlaylistModalProps> = ({
  isOpen,
  onClose,
  onPlaylistCreated,
}) => {
  const { createPlaylist } = useMusicPlayer();
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [coverUrl, setCoverUrl] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newPlaylist = createPlaylist(
      name.trim(),
      description.trim() || undefined,
      coverUrl.trim() || undefined
    );

    setName('');
    setDescription('');
    setCoverUrl('');
    onClose();

    if (onPlaylistCreated) {
      onPlaylistCreated(newPlaylist.id);
    }
  };

  const presetCovers = [
    'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=300&q=80',
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=300&q=80',
    'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=300&q=80',
    'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=300&q=80',
  ];

  return (
    <div
      id="create-playlist-modal"
      className="fixed inset-0 bg-black/75 backdrop-blur-xs z-50 flex items-center justify-center p-4 select-none"
      onClick={onClose}
    >
      <div
        className="bg-[#18191d] border border-[#2d2e36] rounded-md w-full max-w-md p-5 shadow-2xl space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-[#24252b]">
          <div className="flex items-center gap-2">
            <ListMusic className="w-4 h-4 text-[#4ea824]" />
            <h3 className="text-sm font-bold text-[#f4f4f5]">Create Playlist</h3>
          </div>
          <button
            onClick={onClose}
            className="text-[#70757f] hover:text-[#f4f4f5] p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block text-[#9ba1a6] font-medium mb-1">Playlist Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Late Night Beats"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              className="w-full bg-[#141518] border border-[#26272d] rounded-md px-3 py-2 text-[#f4f4f5] placeholder-[#60646c] outline-none focus:border-[#4ea824]"
            />
          </div>

          <div>
            <label className="block text-[#9ba1a6] font-medium mb-1">Description (optional)</label>
            <textarea
              placeholder="Add an optional description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full bg-[#141518] border border-[#26272d] rounded-md px-3 py-1.5 text-[#f4f4f5] placeholder-[#60646c] outline-none focus:border-[#4ea824] resize-none"
            />
          </div>

          <div>
            <label className="block text-[#9ba1a6] font-medium mb-1">Cover Artwork URL (optional)</label>
            <input
              type="url"
              placeholder="https://..."
              value={coverUrl}
              onChange={(e) => setCoverUrl(e.target.value)}
              className="w-full bg-[#141518] border border-[#26272d] rounded-md px-3 py-1.5 text-[#f4f4f5] placeholder-[#60646c] outline-none focus:border-[#4ea824]"
            />
          </div>

          <div>
            <p className="text-[11px] text-[#70757f] mb-1.5">Preset Artwork:</p>
            <div className="grid grid-cols-4 gap-2">
              {presetCovers.map((url, i) => (
                <img
                  key={i}
                  src={url}
                  alt={`Cover ${i}`}
                  onClick={() => setCoverUrl(url)}
                  className={`w-full aspect-square rounded object-cover cursor-pointer border transition-colors ${
                    coverUrl === url ? 'border-[#4ea824]' : 'border-[#24252b] hover:border-[#383a44]'
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#24252b]">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-md bg-[#202227] hover:bg-[#282a32] text-[#9ba1a6] hover:text-[#f4f4f5]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-[#4ea824] hover:bg-[#5bbd2d] disabled:opacity-40 text-white font-semibold transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
