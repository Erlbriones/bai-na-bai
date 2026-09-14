import React, { useMemo } from 'react';
import { Search as SearchIcon, Music, Disc, User, Play, X, ListMusic } from 'lucide-react';
import { useMusicPlayer } from '../context/MusicPlayerContext';
import { Song } from '../types';
import { SongList } from '../components/SongList';
import { PlaylistCard } from '../components/PlaylistCard';
import { MUSIC_GENRES } from '../data/seedData';

interface SearchPageProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onNavigateToSong: (songId: string) => void;
  onNavigateToPlaylist: (playlistId: string) => void;
  onOpenAddToPlaylist: (song: Song) => void;
}

export const SearchPage: React.FC<SearchPageProps> = ({
  searchQuery,
  setSearchQuery,
  onNavigateToSong,
  onNavigateToPlaylist,
  onOpenAddToPlaylist,
}) => {
  const { songs, playlists, playSong } = useMusicPlayer();

  // Multi-field search results
  const { matchedSongs, matchedArtists, matchedAlbums, matchedPlaylists } = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) {
      return {
        matchedSongs: [],
        matchedArtists: [],
        matchedAlbums: [],
        matchedPlaylists: [],
      };
    }

    // Matching songs
    const matchedSongs = songs.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.artist.toLowerCase().includes(q) ||
        s.album.toLowerCase().includes(q) ||
        s.genre.toLowerCase().includes(q)
    );

    // Matching Artists
    const artistMap = new Map<string, { artist: string; count: number; sampleSong: Song }>();
    songs.forEach((s) => {
      if (s.artist.toLowerCase().includes(q)) {
        if (!artistMap.has(s.artist)) {
          artistMap.set(s.artist, { artist: s.artist, count: 1, sampleSong: s });
        } else {
          artistMap.get(s.artist)!.count += 1;
        }
      }
    });

    // Matching Albums
    const albumMap = new Map<
      string,
      { album: string; artist: string; sampleSong: Song; count: number }
    >();
    songs.forEach((s) => {
      if (s.album && s.album.toLowerCase().includes(q) && s.album !== 'Single') {
        if (!albumMap.has(s.album)) {
          albumMap.set(s.album, { album: s.album, artist: s.artist, sampleSong: s, count: 1 });
        } else {
          albumMap.get(s.album)!.count += 1;
        }
      }
    });

    // Matching Playlists
    const matchedPlaylists = playlists.filter(
      (pl) =>
        pl.name.toLowerCase().includes(q) ||
        (pl.description && pl.description.toLowerCase().includes(q))
    );

    return {
      matchedSongs,
      matchedArtists: Array.from(artistMap.values()),
      matchedAlbums: Array.from(albumMap.values()),
      matchedPlaylists,
    };
  }, [songs, playlists, searchQuery]);

  const hasQuery = searchQuery.trim().length > 0;
  const topResultSong = matchedSongs[0];

  return (
    <div id="spotibai-search-page" className="p-5 md:p-8 space-y-8 pb-28 max-w-7xl mx-auto select-none">
      {/* Search Input Bar */}
      <div className="relative max-w-xl">
        <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#848a93]" />
        <input
          id="search-page-input"
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search songs, artists, albums, or genres..."
          className="w-full bg-[#17181c] border border-[#26272d] rounded-md pl-10 pr-10 py-2.5 text-sm text-[#f4f4f5] placeholder-[#70757f] outline-none focus:border-[#4ea824] transition-colors"
          autoFocus
        />
        {hasQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#848a93] hover:text-[#f4f4f5] p-1"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {!hasQuery ? (
        /* Empty Query: Browse All Genres */
        <section className="space-y-4">
          <div>
            <h2 className="text-sm font-bold text-[#f4f4f5] uppercase tracking-wider">
              Browse Categories & Genres
            </h2>
            <p className="text-xs text-[#70757f] mt-0.5">
              Select a genre to discover matching tracks in your library
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
            {MUSIC_GENRES.map((genre) => {
              const genreCount = songs.filter(
                (s) => s.genre.toLowerCase() === genre.toLowerCase()
              ).length;
              return (
                <div
                  key={genre}
                  onClick={() => setSearchQuery(genre)}
                  className="p-3 bg-[#17181c] hover:bg-[#1f2025] border border-[#24252b] hover:border-[#33353d] rounded-md cursor-pointer transition-colors"
                >
                  <p className="text-xs font-semibold text-[#f4f4f5]">{genre}</p>
                  <p className="text-[11px] text-[#70757f] mt-1 font-mono">
                    {genreCount} {genreCount === 1 ? 'track' : 'tracks'}
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      ) : (
        /* Has Search Query: Organized Results */
        <div className="space-y-8">
          {matchedSongs.length === 0 &&
          matchedArtists.length === 0 &&
          matchedAlbums.length === 0 &&
          matchedPlaylists.length === 0 ? (
            <div className="py-20 text-center text-[#70757f] bg-[#151619] rounded-md border border-[#24252b]">
              <Music className="w-8 h-8 mx-auto text-[#60646c] mb-2" />
              <h3 className="text-sm font-semibold text-[#f4f4f5]">
                No results found for "{searchQuery}"
              </h3>
              <p className="text-xs text-[#70757f] max-w-sm mx-auto mt-1">
                Check spelling or search for another song title, artist, album, or genre.
              </p>
            </div>
          ) : (
            <>
              {/* Top Result + Songs Table Row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Top Result Spotlight */}
                {topResultSong && (
                  <div className="lg:col-span-1 space-y-2">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-[#848a93]">
                      Top Result
                    </h2>
                    <div
                      onClick={() => playSong(topResultSong)}
                      className="group p-4 bg-[#17181c] hover:bg-[#1f2025] border border-[#24252b] hover:border-[#33353d] rounded-md transition-colors cursor-pointer relative"
                    >
                      <img
                        src={topResultSong.artwork_url}
                        alt={topResultSong.title}
                        className="w-20 h-20 rounded object-cover border border-[#24252b] mb-3"
                      />
                      <h3 className="text-base font-bold text-[#f4f4f5] truncate">
                        {topResultSong.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-[#848a93]">{topResultSong.artist}</span>
                        <span className="text-[#60646c] text-xs">•</span>
                        <span className="px-1.5 py-0.5 rounded bg-[#202227] text-[#848a93] text-[10px] font-medium border border-[#2a2c34]">
                          {topResultSong.genre}
                        </span>
                      </div>

                      {/* Play Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          playSong(topResultSong);
                        }}
                        className="absolute bottom-4 right-4 w-10 h-10 rounded-full bg-[#4ea824] hover:bg-[#5bbd2d] text-white flex items-center justify-center shadow-md transition-transform active:scale-95"
                        title="Play"
                      >
                        <Play className="w-4 h-4 fill-current ml-0.5" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Songs Table (Matched Tracks) */}
                <div
                  className={`${
                    topResultSong ? 'lg:col-span-2' : 'lg:col-span-3'
                  } space-y-2`}
                >
                  <h2 className="text-xs font-bold uppercase tracking-wider text-[#848a93]">
                    Songs ({matchedSongs.length})
                  </h2>
                  <div className="bg-[#151619] border border-[#24252b] rounded-md overflow-hidden p-1">
                    <SongList
                      songs={matchedSongs.slice(0, 6)}
                      onNavigateToSong={onNavigateToSong}
                      onOpenAddToPlaylist={onOpenAddToPlaylist}
                    />
                  </div>
                </div>
              </div>

              {/* Artists Section */}
              {matchedArtists.length > 0 && (
                <section className="space-y-3">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-[#848a93]">
                    Artists
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {matchedArtists.map((a) => (
                      <div
                        key={a.artist}
                        onClick={() => playSong(a.sampleSong)}
                        className="group p-3 bg-[#17181c] hover:bg-[#1f2025] border border-[#24252b] hover:border-[#33353d] rounded-md transition-colors cursor-pointer text-center"
                      >
                        <div className="w-16 h-16 rounded-full overflow-hidden mx-auto mb-2 border border-[#26272d] relative bg-[#1c1d22]">
                          <img
                            src={a.sampleSong.artwork_url}
                            alt={a.artist}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <p className="text-xs font-semibold text-[#f4f4f5] truncate">
                          {a.artist}
                        </p>
                        <p className="text-[11px] text-[#70757f] font-mono mt-0.5">
                          {a.count} {a.count === 1 ? 'track' : 'tracks'}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Albums Section */}
              {matchedAlbums.length > 0 && (
                <section className="space-y-3">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-[#848a93]">
                    Albums
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {matchedAlbums.map((alb) => (
                      <div
                        key={alb.album}
                        onClick={() => playSong(alb.sampleSong)}
                        className="group p-2.5 bg-[#17181c] hover:bg-[#1f2025] border border-[#24252b] hover:border-[#33353d] rounded-md transition-colors cursor-pointer"
                      >
                        <img
                          src={alb.sampleSong.artwork_url}
                          alt={alb.album}
                          className="w-full aspect-square object-cover rounded mb-2 border border-[#24252b]"
                        />
                        <p className="text-xs font-semibold text-[#f4f4f5] truncate">
                          {alb.album}
                        </p>
                        <p className="text-[11px] text-[#70757f] truncate mt-0.5">
                          {alb.artist}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Playlists Section */}
              {matchedPlaylists.length > 0 && (
                <section className="space-y-3">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-[#848a93]">
                    Playlists
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {matchedPlaylists.map((pl) => (
                      <PlaylistCard
                        key={pl.id}
                        playlist={pl}
                        onSelect={onNavigateToPlaylist}
                      />
                    ))}
                  </div>
                </section>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};
