import React, { useState } from 'react';
import {
  Volume2,
  Keyboard,
  HardDrive,
  Check,
  RefreshCw,
  Database
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { clearLocalData } from '../lib/storage';
import { isSupabaseConfigured } from '../lib/supabase';

export const SettingsPage: React.FC = () => {
  const { showToast } = useToast();

  const [audioQuality, setAudioQuality] = useState('320kbps');
  const [eqPreset, setEqPreset] = useState('Flat');
  const [normalizeVolume, setNormalizeVolume] = useState(true);
  const [autoplayNext, setAutoplayNext] = useState(true);
  const [crossfade, setCrossfade] = useState('Off');

  const handleClearCache = async () => {
    if (window.confirm('Reset local library cache and start fresh?')) {
      await clearLocalData();
      showToast('Cache reset successfully. Reloading...', 'info');
      setTimeout(() => window.location.reload(), 800);
    }
  };

  return (
    <div id="spotibai-settings-page" className="p-5 md:p-8 max-w-3xl mx-auto space-y-6 pb-28 select-none">
      {/* Header */}
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-[#f4f4f5] tracking-tight">
          Settings
        </h1>
        <p className="text-xs text-[#848a93] mt-0.5">
          Audio fidelity, playback preferences, and keyboard shortcuts.
        </p>
      </div>

      {/* 1. Audio Quality & Playback */}
      <div className="bg-[#151619] border border-[#24252b] rounded-md p-5 space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#848a93] flex items-center gap-2">
          <Volume2 className="w-4 h-4 text-[#4ea824]" />
          <span>Audio Playback & Quality</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-[#9ba1a6] font-medium mb-1">Streaming Quality</label>
            <select
              value={audioQuality}
              onChange={(e) => setAudioQuality(e.target.value)}
              className="w-full bg-[#17181c] border border-[#26272d] rounded-md px-3 py-1.5 text-[#f4f4f5] outline-none focus:border-[#4ea824]"
            >
              <option value="128kbps">Normal (128 kbps AAC)</option>
              <option value="256kbps">High (256 kbps AAC)</option>
              <option value="320kbps">Very High (320 kbps MP3 / Flac)</option>
            </select>
          </div>

          <div>
            <label className="block text-[#9ba1a6] font-medium mb-1">Crossfade</label>
            <select
              value={crossfade}
              onChange={(e) => setCrossfade(e.target.value)}
              className="w-full bg-[#17181c] border border-[#26272d] rounded-md px-3 py-1.5 text-[#f4f4f5] outline-none focus:border-[#4ea824]"
            >
              <option value="Off">Off</option>
              <option value="2s">2 seconds</option>
              <option value="5s">5 seconds</option>
              <option value="10s">10 seconds</option>
            </select>
          </div>
        </div>

        <div className="pt-2 border-t border-[#202227] space-y-2">
          <label className="flex items-center justify-between cursor-pointer py-1">
            <div>
              <p className="text-xs font-medium text-[#f4f4f5]">Autoplay similar tracks</p>
              <p className="text-[11px] text-[#70757f]">Keep listening when your current track finishes</p>
            </div>
            <input
              type="checkbox"
              checked={autoplayNext}
              onChange={(e) => setAutoplayNext(e.target.checked)}
              className="w-4 h-4 accent-[#4ea824] rounded"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer py-1">
            <div>
              <p className="text-xs font-medium text-[#f4f4f5]">Normalize volume</p>
              <p className="text-[11px] text-[#70757f]">Set the same volume level for all tracks</p>
            </div>
            <input
              type="checkbox"
              checked={normalizeVolume}
              onChange={(e) => setNormalizeVolume(e.target.checked)}
              className="w-4 h-4 accent-[#4ea824] rounded"
            />
          </label>
        </div>
      </div>

      {/* 2. Keyboard Shortcuts */}
      <div className="bg-[#151619] border border-[#24252b] rounded-md p-5 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#848a93] flex items-center gap-2">
          <Keyboard className="w-4 h-4 text-[#4ea824]" />
          <span>Desktop Keyboard Shortcuts</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
          <div className="p-2 bg-[#17181c] border border-[#24252b] rounded flex items-center justify-between">
            <span className="text-[#848a93]">Play / Pause</span>
            <kbd className="px-1.5 py-0.5 rounded bg-[#202227] text-[#f4f4f5] font-mono text-[10px] border border-[#2d2e36]">
              Space
            </kbd>
          </div>

          <div className="p-2 bg-[#17181c] border border-[#24252b] rounded flex items-center justify-between">
            <span className="text-[#848a93]">Seek ±5s</span>
            <kbd className="px-1.5 py-0.5 rounded bg-[#202227] text-[#f4f4f5] font-mono text-[10px] border border-[#2d2e36]">
              ← / →
            </kbd>
          </div>

          <div className="p-2 bg-[#17181c] border border-[#24252b] rounded flex items-center justify-between">
            <span className="text-[#848a93]">Volume ±10%</span>
            <kbd className="px-1.5 py-0.5 rounded bg-[#202227] text-[#f4f4f5] font-mono text-[10px] border border-[#2d2e36]">
              ↑ / ↓
            </kbd>
          </div>

          <div className="p-2 bg-[#17181c] border border-[#24252b] rounded flex items-center justify-between">
            <span className="text-[#848a93]">Mute Toggle</span>
            <kbd className="px-1.5 py-0.5 rounded bg-[#202227] text-[#f4f4f5] font-mono text-[10px] border border-[#2d2e36]">
              M
            </kbd>
          </div>

          <div className="p-2 bg-[#17181c] border border-[#24252b] rounded flex items-center justify-between">
            <span className="text-[#848a93]">Search Bar</span>
            <kbd className="px-1.5 py-0.5 rounded bg-[#202227] text-[#f4f4f5] font-mono text-[10px] border border-[#2d2e36]">
              /
            </kbd>
          </div>
        </div>
      </div>

      {/* 3. Backend & Storage */}
      <div className="bg-[#151619] border border-[#24252b] rounded-md p-5 space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#848a93] flex items-center gap-2">
          <Database className="w-4 h-4 text-[#4ea824]" />
          <span>Backend & Storage Configuration</span>
        </h3>

        <div className="flex items-center justify-between text-xs py-1 border-b border-[#202227]">
          <div>
            <p className="font-medium text-[#f4f4f5]">Supabase Integration</p>
            <p className="text-[11px] text-[#70757f]">
              {isSupabaseConfigured
                ? 'Connected to remote Supabase database & storage'
                : 'Offline/Local mode (Local storage & IndexedDB active)'}
            </p>
          </div>
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase ${
              isSupabaseConfigured
                ? 'bg-[#4ea824]/15 text-[#4ea824] border border-[#4ea824]/30'
                : 'bg-[#1f2025] text-[#848a93] border border-[#2a2c34]'
            }`}
          >
            {isSupabaseConfigured ? 'Connected' : 'Local Active'}
          </span>
        </div>

        <div className="flex items-center justify-between text-xs pt-1">
          <div>
            <p className="font-medium text-[#f4f4f5]">Reset Cache</p>
            <p className="text-[11px] text-[#70757f]">Clear locally stored tracks and restore initial catalog</p>
          </div>
          <button
            onClick={handleClearCache}
            className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-[#1f2025] hover:bg-[#25272e] border border-[#2d2e36] text-xs font-medium text-[#f4f4f5] transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#848a93]" />
            <span>Reset Cache</span>
          </button>
        </div>
      </div>
    </div>
  );
};
