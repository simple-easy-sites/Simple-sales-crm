import { createClient } from '@supabase/supabase-js';

// IMPORTANT: Replace with your Supabase project's URL and Anon Key.
// You can find these in your Supabase project settings under 'API'.
const supabaseUrl = 'https://your-project-ref.supabase.co';
const supabaseKey = 'your-anon-key';

if (supabaseUrl === 'https://your-project-ref.supabase.co' || supabaseKey === 'your-anon-key') {
  // In a real app, you might throw an error or have a specific UI state for this.
  // For this context, a console warning is appropriate to guide the developer.
  console.warn(`
********************************************************************************
* WARNING: Supabase credentials are placeholders.                                *
* Please update them in src/services/supabase.ts to connect to your project.   *
********************************************************************************
  `);
}

export const supabase = createClient(supabaseUrl, supabaseKey);
