import React, { useState } from 'react';
import { Play, Music, ArrowRight } from 'lucide-react';
import { useMusicPlayer } from '../context/MusicPlayerContext';
import { SongList } from '../components/SongList';
import { MUSIC_GENRES } from '../data/seedData';
import { Song } from '../types';

interface HomePageProps {
  onNavigateToSong: (songId: string) => void;
  onNavigateToPlaylist: (playlistId: string) => void;
  onNavigate: (path: string) => void;
  onOpenAddToPlaylist: (song: Song) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onNavigateToSong,
  onNavigateToPlaylist,
  onNavigate,
  onOpenAddToPlaylist,
}) => {
  const { songs, playlists, playSong } = useMusicPlayer();
  const [selectedGenre, setSelectedGenre] = useState<string>('All');

  // Greeting based on client hour
  const hour = new Date().getHours();
  const greeting =
    hour < 12
      ? 'Good morning mga Buseng'
      : hour < 18
      ? 'Good afternoon mga Buseng'
      : 'Goodevening mga Buseng';

  // Quick Resume Items: Up to 6 items (playlists + top songs)
  const quickItems = [
    ...playlists.slice(0, 3).map((pl) => ({
      id: pl.id,
      title: pl.name,
      subtitle: `${pl.song_ids.length} tracks`,
      artwork: pl.cover_url || '',
      type: 'playlist' as const,
      data: pl,
    })),
    ...songs.slice(0, 3).map((s) => ({
      id: s.id,
      title: s.title,
      subtitle: s.artist,
      artwork: s.artwork_url,
      type: 'song' as const,
      data: s,
    })),
  ].slice(0, 6);

  const filteredSongs =
    selectedGenre === 'All'
      ? songs
      : songs.filter((s) => s.genre.toLowerCase() === selectedGenre.toLowerCase());

  return (
    <div id="spotibai-home-page" className="p-5 md:p-8 space-y-8 pb-28 max-w-7xl mx-auto">
      {/* 1. Header & Quick Resume Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-[#f4f4f5] tracking-tight">
              {greeting}
            </h1>
            <p className="text-xs text-[#848a93] mt-0.5">
              Welcome to SPOTIBAI. Stream, upload, and explore your music library.
            </p>
          </div>
        </div>

        {/* 6-box Quick Access Desktop Grid or Clean Empty Banner */}
        {quickItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {quickItems.map((item) => (
              <div
                key={`${item.type}-${item.id}`}
                onClick={() => {
                  if (item.type === 'playlist') {
                    onNavigateToPlaylist(item.id);
                  } else {
                    playSong(item.data as Song);
                  }
                }}
                className="group flex items-center justify-between bg-[#17181c] hover:bg-[#1f2026] border border-[#24252b] hover:border-[#33353d] rounded-md overflow-hidden cursor-pointer transition-colors p-0 select-none"
              >
                <div className="flex items-center gap-3 min-w-0 pr-2">
                  <img
                    src={
                      item.artwork ||
                      'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=150&q=80'
                    }
                    alt={item.title}
                    loading="lazy"
                    decoding="async"
                    className="w-12 h-12 object-cover shrink-0 border-r border-[#24252b]"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-[#f4f4f5] truncate group-hover:text-white">
                      {item.title}
                    </p>
                    <p className="text-[11px] text-[#70757f] truncate">{item.subtitle}</p>
                  </div>
                </div>

                {/* Quick Play Button on Hover */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (item.type === 'song') {
                      playSong(item.data as Song);
                    } else {
                      onNavigateToPlaylist(item.id);
                    }
                  }}
                  className="w-8 h-8 rounded-full bg-[#4ea824] hover:bg-[#5bbd2d] text-white flex items-center justify-center mr-3 shadow-md opacity-0 group-hover:opacity-100 transition-opacity shrink-0 cursor-pointer"
                  title={`Play ${item.title}`}
                >
                  <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-[#151619] border border-[#24252b] rounded-lg p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-lg bg-[#1e2026] border border-[#2c2e37] flex items-center justify-center text-[#4ea824] shrink-0">
                <Music className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs font-semibold text-[#f4f4f5]">Your library is clean</h3>
                <p className="text-[11px] text-[#848a93] mt-0.5">Upload audio tracks (MP3, WAV, FLAC) or create playlists to begin streaming.</p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => onNavigate('/upload')}
                className="px-3.5 py-1.5 rounded-md bg-[#4ea824] hover:bg-[#5bbd2d] text-white text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <span>Upload Music</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}
      </section>

      {/* 2. Genre Filter Bar (Clean, understated tabs) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between border-b border-[#24252b] pb-2">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1">
            <button
              onClick={() => setSelectedGenre('All')}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                selectedGenre === 'All'
                  ? 'bg-[#4ea824] text-white font-semibold'
                  : 'bg-[#18191d] text-[#9ba1a6] hover:text-[#f4f4f5] hover:bg-[#202227] border border-[#26272d]'
              }`}
            >
              All Genres
            </button>
            {MUSIC_GENRES.map((g) => (
              <button
                key={g}
                onClick={() => setSelectedGenre(g)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                  selectedGenre === g
                    ? 'bg-[#4ea824] text-white font-semibold'
                    : 'bg-[#18191d] text-[#9ba1a6] hover:text-[#f4f4f5] hover:bg-[#202227] border border-[#26272d]'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* BaiSongs Table View */}
        <div className="bg-[#151619] border border-[#24252b] rounded-md overflow-hidden p-2">
          <div className="px-3 py-2 flex items-center justify-between border-b border-[#202227]">
            <h2 className="text-sm font-bold text-[#f4f4f5]">
              {selectedGenre === 'All' ? 'BaiSongs' : `BaiSongs • ${selectedGenre}`}
            </h2>
            <button
              onClick={() => onNavigate('/library')}
              className="text-xs text-[#4ea824] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View Library</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <SongList
            songs={filteredSongs}
            onNavigateToSong={onNavigateToSong}
            onOpenAddToPlaylist={onOpenAddToPlaylist}
          />
        </div>
      </section>
    </div>
  );
};
