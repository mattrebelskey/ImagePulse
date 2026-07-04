import { createClient } from '@supabase/supabase-js';

// Auth-only client: sessions, sign-in/up/out. All data access goes through
// the /api functions (which verify the JWT server-side) — no table reads or
// writes through supabase-js, and the tables carry no Data API grants.
// The publishable key is safe to expose to the browser by design.
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
);
