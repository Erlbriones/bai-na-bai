/// <reference types="vite/client" />
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Retrieve environment variables using import.meta.env as required
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.trim() !== '' &&
  supabaseAnonKey.trim() !== '' &&
  supabaseUrl.startsWith('http')
);

export let supabase: SupabaseClient | null = null;

if (isSupabaseConfigured) {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
  } catch (err) {
    console.warn('Failed to initialize Supabase client:', err);
    supabase = null;
  }
}

export const getSupabaseConfigStatus = () => {
  return {
    isConfigured: isSupabaseConfigured,
    url: supabaseUrl ? `${supabaseUrl.substring(0, 20)}...` : 'Not Set',
  };
};
