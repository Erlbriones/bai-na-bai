import React, { useState, useRef } from 'react';
import {
  Upload,
  Music,
  CheckCircle2,
  AlertCircle,
  FileAudio,
  Play,
  Pause,
  ArrowRight,
  Image as ImageIcon
} from 'lucide-react';
import { useMusicPlayer } from '../context/MusicPlayerContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Song, NavigationRoute } from '../types';
import { saveAudioBlob } from '../lib/storage';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { MUSIC_GENRES } from '../data/seedData';

interface UploadPageProps {
  setCurrentRoute?: (route: NavigationRoute) => void;
  onNavigate?: (path: string) => void;
  onNavigateToSong?: (songId: string) => void;
}

export const UploadPage: React.FC<UploadPageProps> = ({
  setCurrentRoute,
  onNavigate,
  onNavigateToSong,
}) => {
  const { addUploadedSong, playSong } = useMusicPlayer();
  const { user } = useAuth();
  const { showToast } = useToast();

  // Form Fields
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioDuration, setAudioDuration] = useState<number>(0);
  const [artworkFile, setArtworkFile] = useState<File | null>(null);
  const [artworkPreview, setArtworkPreview] = useState<string>('');
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState(user?.username || '');
  const [album, setAlbum] = useState('Single');
  const [genre, setGenre] = useState('Electronic');
  const [releaseYear, setReleaseYear] = useState<number>(new Date().getFullYear());

  // Status
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const [uploadedSong, setUploadedSong] = useState<Song | null>(null);

  // Audio Preview state
  const [audioPreviewUrl, setAudioPreviewUrl] = useState<string | null>(null);
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);

  const audioInputRef = useRef<HTMLInputElement>(null);
  const artworkInputRef = useRef<HTMLInputElement>(null);

  const handleAudioChange = (file: File) => {
    setErrorMsg('');
    const validExts = ['mp3', 'wav', 'ogg', 'm4a', 'flac', 'aac'];
    const ext = file.name.split('.').pop()?.toLowerCase();

    if (!validExts.includes(ext || '')) {
      setErrorMsg('Supported audio formats: MP3, WAV, OGG, M4A, FLAC, AAC.');
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      setErrorMsg('File exceeds 50MB size limit.');
      return;
    }

    setAudioFile(file);

    // Auto-fill title from filename
    if (!title) {
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
      setTitle(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
    }

    // Create object URL for local test preview and duration calculation
    const url = URL.createObjectURL(file);
    setAudioPreviewUrl(url);

    const tempAudio = new Audio(url);
    tempAudio.addEventListener('loadedmetadata', () => {
      if (tempAudio.duration && isFinite(tempAudio.duration)) {
        setAudioDuration(Math.round(tempAudio.duration));
      }
    });
  };

  const handleArtworkChange = (file: File) => {
    setErrorMsg('');
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Artwork file must be an image (JPEG, PNG, WebP).');
      return;
    }
    setArtworkFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setArtworkPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const togglePreviewPlay = () => {
    if (!previewAudioRef.current) return;
    if (isPreviewPlaying) {
      previewAudioRef.current.pause();
      setIsPreviewPlaying(false);
    } else {
      previewAudioRef.current.play();
      setIsPreviewPlaying(true);
    }
  };

  const handleResetForm = () => {
    setAudioFile(null);
    setArtworkFile(null);
    setArtworkPreview('');
    setTitle('');
    setAlbum('Single');
    setUploadedSong(null);
    setUploadProgress(0);
    setErrorMsg('');
    if (audioPreviewUrl) {
      URL.revokeObjectURL(audioPreviewUrl);
      setAudioPreviewUrl(null);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!audioFile) {
      setErrorMsg('Please select an audio file to upload.');
      return;
    }
    if (!title.trim()) {
      setErrorMsg('Song Title is required.');
      return;
    }
    if (!artist.trim()) {
      setErrorMsg('Artist name is required.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(15);

    try {
      const songId = `user-track-${Date.now()}`;
      let finalAudioUrl = '';
      let finalArtworkUrl =
        artworkPreview ||
        'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=400&q=80';

      // 1. Supabase Storage if configured
      if (isSupabaseConfigured && supabase) {
        setUploadProgress(30);
        try {
          const fileExt = audioFile.name.split('.').pop();
          const filePath = `${songId}.${fileExt}`;

          const { data: storageData, error: uploadErr } = await supabase.storage
            .from('music')
            .upload(filePath, audioFile, { cacheControl: '3600', upsert: true });

          if (uploadErr) {
            console.warn('Supabase storage upload failed, falling back to local:', uploadErr);
          } else if (storageData) {
            const { data: urlData } = supabase.storage
              .from('music')
              .getPublicUrl(filePath);
            if (urlData?.publicUrl) {
              finalAudioUrl = urlData.publicUrl;
            }
          }
        } catch (sErr) {
          console.warn('Supabase storage exception:', sErr);
        }
      }

      setUploadProgress(65);

      // 2. Client Blob / IndexedDB fallback if no public URL
      if (!finalAudioUrl) {
        await saveAudioBlob(songId, audioFile);
        finalAudioUrl = URL.createObjectURL(audioFile);
      }

      setUploadProgress(85);

      // Create new song record
      const newSong: Song = {
        id: songId,
        title: title.trim(),
        artist: artist.trim(),
        album: album.trim() || 'Single',
        genre: genre.trim() || 'Electronic',
        release_year: releaseYear || new Date().getFullYear(),
        audio_url: finalAudioUrl,
        artwork_url: finalArtworkUrl,
        uploader_id: user?.id || 'guest',
        uploader_name: user?.username || 'Guest Producer',
        play_count: 0,
        download_count: 0,
        duration: audioDuration || 180,
        created_at: new Date().toISOString(),
        is_local: !isSupabaseConfigured,
      };

      // Add to global state
      await addUploadedSong(newSong);

      setUploadProgress(100);
      setUploadedSong(newSong);
      showToast(`Track "${newSong.title}" uploaded successfully!`, 'success');
    } catch (err: any) {
      console.error('Upload error:', err);
      setErrorMsg(err.message || 'Failed to process track upload. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div id="spotibai-upload-page" className="p-5 md:p-8 max-w-2xl mx-auto pb-28 select-none">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-[#f4f4f5] tracking-tight">
          Upload Music
        </h1>
        <p className="text-xs text-[#848a93] mt-0.5">
          Publish tracks to your SPOTIBAI library and share high-fidelity audio.
        </p>
      </div>

      {/* Success State */}
      {uploadedSong ? (
        <div className="bg-[#151619] border border-[#24252b] rounded-md p-6 space-y-5 text-center">
          <div className="w-12 h-12 rounded-full bg-[#4ea824]/15 border border-[#4ea824]/40 flex items-center justify-center mx-auto text-[#4ea824]">
            <CheckCircle2 className="w-6 h-6" />
          </div>

          <div>
            <h2 className="text-base font-bold text-[#f4f4f5]">
              Upload Completed Successfully
            </h2>
            <p className="text-xs text-[#848a93] mt-1">
              "{uploadedSong.title}" by {uploadedSong.artist} is now ready for streaming and download.
            </p>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => playSong(uploadedSong)}
              className="flex items-center gap-2 px-4 py-2 rounded-md bg-[#4ea824] hover:bg-[#5bbd2d] text-white text-xs font-semibold transition-colors shadow-sm"
            >
              <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
              <span>Play Now</span>
            </button>

            <button
              onClick={handleResetForm}
              className="px-4 py-2 rounded-md bg-[#1f2025] hover:bg-[#25272e] border border-[#2d2e36] text-xs font-medium text-[#f4f4f5] transition-colors"
            >
              Upload Another Track
            </button>

            <button
              onClick={() => {
                if (onNavigate) onNavigate('/my-uploads');
                else if (setCurrentRoute) setCurrentRoute('my-uploads');
              }}
              className="px-4 py-2 rounded-md bg-[#1f2025] hover:bg-[#25272e] border border-[#2d2e36] text-xs font-medium text-[#f4f4f5] transition-colors"
            >
              View My Uploads
            </button>
          </div>
        </div>
      ) : (
        /* Upload Form */
        <form onSubmit={handleUploadSubmit} className="space-y-5">
          {/* Error Banner */}
          {errorMsg && (
            <div className="flex items-center gap-2 p-3 rounded-md bg-[#e05252]/10 border border-[#e05252]/40 text-[#f87171] text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* 1. Select Music File */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#848a93]">
              Music File <span className="text-[#4ea824]">*</span>
            </label>

            <input
              ref={audioInputRef}
              type="file"
              accept="audio/*,.mp3,.wav,.ogg,.m4a,.flac,.aac"
              onChange={(e) => e.target.files?.[0] && handleAudioChange(e.target.files[0])}
              className="hidden"
            />

            {!audioFile ? (
              <div
                onClick={() => audioInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (e.dataTransfer.files?.[0]) handleAudioChange(e.dataTransfer.files[0]);
                }}
                className="p-8 border border-dashed border-[#2d2e36] hover:border-[#4ea824]/60 bg-[#151619] hover:bg-[#1a1b20] rounded-md text-center cursor-pointer transition-colors"
              >
                <FileAudio className="w-8 h-8 mx-auto text-[#60646c] mb-2" />
                <p className="text-xs font-semibold text-[#f4f4f5]">
                  Click to select music file or drag and drop
                </p>
                <p className="text-[11px] text-[#70757f] mt-1">
                  Supports MP3, WAV, FLAC, M4A, OGG up to 50MB
                </p>
              </div>
            ) : (
              <div className="flex items-center justify-between p-3 rounded-md bg-[#18191d] border border-[#26272d]">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded bg-[#1f2025] border border-[#2d2e36] flex items-center justify-center text-[#4ea824] shrink-0">
                    <Music className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-[#f4f4f5] truncate">
                      {audioFile.name}
                    </p>
                    <p className="text-[10px] text-[#70757f] font-mono">
                      {(audioFile.size / (1024 * 1024)).toFixed(2)} MB • {audioDuration > 0 ? `${Math.floor(audioDuration / 60)}:${(audioDuration % 60).toString().padStart(2, '0')}` : 'Analyzing duration...'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {audioPreviewUrl && (
                    <>
                      <audio
                        ref={previewAudioRef}
                        src={audioPreviewUrl}
                        onEnded={() => setIsPreviewPlaying(false)}
                      />
                      <button
                        type="button"
                        onClick={togglePreviewPlay}
                        className="p-1.5 rounded bg-[#202227] hover:bg-[#282a32] text-[#f4f4f5] text-xs flex items-center gap-1 transition-colors"
                        title="Test audio playback"
                      >
                        {isPreviewPlaying ? (
                          <Pause className="w-3.5 h-3.5 fill-current" />
                        ) : (
                          <Play className="w-3.5 h-3.5 fill-current" />
                        )}
                        <span className="text-[11px] hidden sm:inline">Preview</span>
                      </button>
                    </>
                  )}

                  <button
                    type="button"
                    onClick={() => audioInputRef.current?.click()}
                    className="px-2.5 py-1 rounded bg-[#202227] hover:bg-[#282a32] text-xs text-[#9ba1a6] hover:text-[#f4f4f5] transition-colors"
                  >
                    Change
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 2. Metadata Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Song Title */}
            <div className="space-y-1">
              <label className="block text-xs font-medium text-[#9ba1a6]">
                Song Title <span className="text-[#4ea824]">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Midnight Reverie"
                className="w-full bg-[#17181c] border border-[#26272d] rounded-md px-3 py-2 text-xs text-[#f4f4f5] placeholder-[#60646c] outline-none focus:border-[#4ea824] transition-colors"
                required
              />
            </div>

            {/* Artist */}
            <div className="space-y-1">
              <label className="block text-xs font-medium text-[#9ba1a6]">
                Artist <span className="text-[#4ea824]">*</span>
              </label>
              <input
                type="text"
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                placeholder="Artist or band name"
                className="w-full bg-[#17181c] border border-[#26272d] rounded-md px-3 py-2 text-xs text-[#f4f4f5] placeholder-[#60646c] outline-none focus:border-[#4ea824] transition-colors"
                required
              />
            </div>

            {/* Album */}
            <div className="space-y-1">
              <label className="block text-xs font-medium text-[#9ba1a6]">
                Album
              </label>
              <input
                type="text"
                value={album}
                onChange={(e) => setAlbum(e.target.value)}
                placeholder="Single or Album title"
                className="w-full bg-[#17181c] border border-[#26272d] rounded-md px-3 py-2 text-xs text-[#f4f4f5] placeholder-[#60646c] outline-none focus:border-[#4ea824] transition-colors"
              />
            </div>

            {/* Genre */}
            <div className="space-y-1">
              <label className="block text-xs font-medium text-[#9ba1a6]">
                Genre
              </label>
              <select
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                className="w-full bg-[#17181c] border border-[#26272d] rounded-md px-3 py-2 text-xs text-[#f4f4f5] outline-none focus:border-[#4ea824] transition-colors"
              >
                {MUSIC_GENRES.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>

            {/* Release Year */}
            <div className="space-y-1">
              <label className="block text-xs font-medium text-[#9ba1a6]">
                Release Year
              </label>
              <input
                type="number"
                min="1900"
                max={new Date().getFullYear() + 1}
                value={releaseYear}
                onChange={(e) => setReleaseYear(parseInt(e.target.value) || new Date().getFullYear())}
                className="w-full bg-[#17181c] border border-[#26272d] rounded-md px-3 py-2 text-xs text-[#f4f4f5] outline-none focus:border-[#4ea824] transition-colors font-mono"
              />
            </div>

            {/* Artwork File Upload */}
            <div className="space-y-1">
              <label className="block text-xs font-medium text-[#9ba1a6]">
                Cover Artwork
              </label>
              <input
                ref={artworkInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files?.[0] && handleArtworkChange(e.target.files[0])}
                className="hidden"
              />
              <div className="flex items-center gap-2">
                {artworkPreview ? (
                  <img
                    src={artworkPreview}
                    alt="Preview"
                    className="w-8 h-8 rounded object-cover border border-[#26272d]"
                  />
                ) : (
                  <div className="w-8 h-8 rounded bg-[#17181c] border border-[#26272d] flex items-center justify-center text-[#60646c]">
                    <ImageIcon className="w-4 h-4" />
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => artworkInputRef.current?.click()}
                  className="px-3 py-2 rounded-md bg-[#17181c] hover:bg-[#202227] border border-[#26272d] text-xs text-[#9ba1a6] hover:text-[#f4f4f5] transition-colors flex-1 text-left truncate"
                >
                  {artworkFile ? artworkFile.name : 'Choose image (optional)'}
                </button>
              </div>
            </div>
          </div>

          {/* Progress Bar (Visible during upload) */}
          {isUploading && (
            <div className="space-y-1 pt-2">
              <div className="flex justify-between text-[11px] font-mono text-[#848a93]">
                <span>Processing upload...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full h-1.5 bg-[#202227] rounded overflow-hidden">
                <div
                  className="h-full bg-[#4ea824] transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-3">
            <button
              type="submit"
              disabled={isUploading}
              className="w-full py-2.5 rounded-md bg-[#4ea824] hover:bg-[#5bbd2d] active:bg-[#41901e] disabled:opacity-50 text-white font-semibold text-xs tracking-wide transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <Upload className="w-4 h-4" />
              <span>{isUploading ? 'Uploading Track...' : 'Upload Music'}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
