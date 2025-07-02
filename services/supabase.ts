import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Module-level variable to hold the client instance.
let supabaseInstance: SupabaseClient | null = null;

const SUPABASE_URL_KEY = 'supabase_url';
const SUPABASE_ANON_KEY = 'supabase_anon_key';

/**
 * Initializes the Supabase client and saves credentials to localStorage.
 * @param url The Supabase project URL.
 * @param key The Supabase anon key.
 * @returns The initialized Supabase client.
 */
export const initializeSupabase = (url: string, key: string): SupabaseClient => {
  supabaseInstance = createClient(url, key);
  try {
    localStorage.setItem(SUPABASE_URL_KEY, url);
    localStorage.setItem(SUPABASE_ANON_KEY, key);
  } catch (error) {
    console.warn("Could not save Supabase credentials to localStorage.", error);
  }
  return supabaseInstance;
};

/**
 * Attempts to load credentials from localStorage and initialize the client.
 * @returns The initialized client if credentials were found, otherwise null.
 */
export const loadSupabaseFromStorage = (): SupabaseClient | null => {
  try {
    const url = localStorage.getItem(SUPABASE_URL_KEY);
    const key = localStorage.getItem(SUPABASE_ANON_KEY);
    if (url && key) {
      if (!supabaseInstance) {
        return initializeSupabase(url, key);
      }
      return supabaseInstance;
    }
  } catch (error) {
     console.warn("Could not load Supabase credentials from localStorage.", error);
  }
  return null;
};

/**
 * Returns the singleton Supabase client instance if configured.
 * @returns The Supabase client or null.
 */
export const getSupabase = (): SupabaseClient | null => {
  return supabaseInstance;
};

/**
 * Checks if the Supabase client has been initialized.
 * @returns True if configured, false otherwise.
 */
export const isSupabaseConfigured = (): boolean => {
    return supabaseInstance !== null;
};
