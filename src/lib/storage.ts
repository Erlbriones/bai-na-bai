import { Song, Playlist, ListeningHistoryItem, DownloadItem } from '../types';
import { INITIAL_SONGS, INITIAL_PLAYLISTS } from '../data/seedData';

const DB_NAME = 'spotibai_storage_db';
const DB_VERSION = 1;
const AUDIO_STORE = 'audio_files';
const ARTWORK_STORE = 'artwork_files';

// Initialize IndexedDB
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(AUDIO_STORE)) {
        db.createObjectStore(AUDIO_STORE);
      }
      if (!db.objectStoreNames.contains(ARTWORK_STORE)) {
        db.createObjectStore(ARTWORK_STORE);
      }
    };
  });
}

// Store audio file in IndexedDB and return an Object URL
export async function saveAudioBlob(id: string, file: Blob): Promise<string> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(AUDIO_STORE, 'readwrite');
      const store = tx.objectStore(AUDIO_STORE);
      store.put(file, id);
      tx.oncomplete = () => {
        resolve(URL.createObjectURL(file));
      };
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    // Fallback in case of restricted IndexedDB iframe
    return URL.createObjectURL(file);
  }
}

// Retrieve audio blob by ID
export async function getAudioBlobUrl(id: string): Promise<string | null> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(AUDIO_STORE, 'readonly');
      const store = tx.objectStore(AUDIO_STORE);
      const req = store.get(id);
      req.onsuccess = () => {
        if (req.result instanceof Blob) {
          resolve(URL.createObjectURL(req.result));
        } else {
          resolve(null);
        }
      };
      req.onerror = () => reject(req.error);
    });
  } catch {
    return null;
  }
}

// Delete audio file from IndexedDB
export async function deleteAudioBlob(id: string): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(AUDIO_STORE, 'readwrite');
      tx.objectStore(AUDIO_STORE).delete(id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  } catch {
    // ignore
  }
}

// Local storage keys
const SONGS_KEY = 'spotibai_clean_songs_v1';
const PLAYLISTS_KEY = 'spotibai_clean_playlists_v1';
const FAVORITES_KEY = 'spotibai_clean_favorites_v1';
const HISTORY_KEY = 'spotibai_clean_history_v1';
const DOWNLOADS_KEY = 'spotibai_clean_downloads_v1';

// One-time cleanup of old seed mock data
try {
  localStorage.removeItem('spotibai_songs_v1');
  localStorage.removeItem('spotibai_playlists_v1');
  localStorage.removeItem('spotibai_favorites_v1');
  localStorage.removeItem('spotibai_history_v1');
} catch {
  // ignore
}

export function getStoredSongs(): Song[] {
  try {
    const data = localStorage.getItem(SONGS_KEY);
    if (!data) {
      localStorage.setItem(SONGS_KEY, JSON.stringify([]));
      return [];
    }
    // Filter out any legacy mock demo songs
    const parsed: Song[] = JSON.parse(data);
    const cleanSongs = parsed.filter((s) => !s.id.startsWith('song-') || s.is_local);
    return cleanSongs;
  } catch {
    return [];
  }
}

export function saveStoredSongs(songs: Song[]): void {
  try {
    localStorage.setItem(SONGS_KEY, JSON.stringify(songs));
  } catch (err) {
    console.error('Failed to persist songs to local storage:', err);
  }
}

export function getStoredPlaylists(): Playlist[] {
  try {
    const data = localStorage.getItem(PLAYLISTS_KEY);
    if (!data) {
      localStorage.setItem(PLAYLISTS_KEY, JSON.stringify([]));
      return [];
    }
    const parsed: Playlist[] = JSON.parse(data);
    // Filter out legacy mock playlists
    const cleanPlaylists = parsed.filter((pl) => !pl.id.startsWith('playlist-'));
    return cleanPlaylists;
  } catch {
    return [];
  }
}

export function saveStoredPlaylists(playlists: Playlist[]): void {
  try {
    localStorage.setItem(PLAYLISTS_KEY, JSON.stringify(playlists));
  } catch (err) {
    console.error('Failed to persist playlists:', err);
  }
}

export function getStoredFavorites(): string[] {
  try {
    const data = localStorage.getItem(FAVORITES_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveStoredFavorites(ids: string[]): void {
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(ids));
  } catch (err) {
    console.error('Failed to persist favorites:', err);
  }
}

export function getStoredHistory(): ListeningHistoryItem[] {
  try {
    const data = localStorage.getItem(HISTORY_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveStoredHistory(history: ListeningHistoryItem[]): void {
  try {
    // Keep max 100 history items
    const truncated = history.slice(0, 100);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(truncated));
  } catch (err) {
    console.error('Failed to persist history:', err);
  }
}

export function getStoredDownloads(): DownloadItem[] {
  try {
    const data = localStorage.getItem(DOWNLOADS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveStoredDownloads(downloads: DownloadItem[]): void {
  try {
    localStorage.setItem(DOWNLOADS_KEY, JSON.stringify(downloads));
  } catch (err) {
    console.error('Failed to persist downloads:', err);
  }
}

export async function clearLocalData(): Promise<void> {
  try {
    localStorage.removeItem(SONGS_KEY);
    localStorage.removeItem(PLAYLISTS_KEY);
    localStorage.removeItem(FAVORITES_KEY);
    localStorage.removeItem(HISTORY_KEY);
    localStorage.removeItem(DOWNLOADS_KEY);

    // Clean up IndexedDB if available
    try {
      const db = await openDB();
      const tx = db.transaction([AUDIO_STORE, ARTWORK_STORE], 'readwrite');
      tx.objectStore(AUDIO_STORE).clear();
      tx.objectStore(ARTWORK_STORE).clear();
    } catch {
      // ignore
    }
  } catch (err) {
    console.error('Failed to clear local data:', err);
  }
}

