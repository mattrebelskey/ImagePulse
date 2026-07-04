import { supabase } from './supabase.js';

// fetch() wrapper that attaches the Supabase session JWT. Every /api route
// requires it; the server verifies the token and scopes all queries to the
// signed-in user.
export async function apiFetch(path, options = {}) {
  const { data: { session } } = await supabase.auth.getSession();
  const headers = { ...(options.headers || {}) };
  if (session) {
    headers.Authorization = `Bearer ${session.access_token}`;
  }
  return fetch(path, { ...options, headers });
}
