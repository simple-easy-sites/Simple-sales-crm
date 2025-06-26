
import { createClient, User } from '@supabase/supabase-js';
import { User as AppUser } from '../types'; // Import your app's User type

// Read from environment variables. If they are not set (e.g., in local development),
// use non-functional, but syntactically valid, placeholders. This allows the 
// application to load without crashing and avoids console errors.
// The developer must set the actual environment variables in their deployment
// environment (like Vercel) for Supabase functionality to work.
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://example.supabase.co';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const mapSupabaseUserToAppUser = (supabaseUser: User | null): AppUser | null => {
  if (!supabaseUser) return null;
  return {
    id: supabaseUser.id,
    username: supabaseUser.email || '', // Using email as username
  };
};
