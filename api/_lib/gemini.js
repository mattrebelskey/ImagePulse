import { GoogleGenAI } from '@google/genai';
import db from './db.js';
import { decryptKey } from './crypto.js';

// House client (Red's GEMINI_API_KEY); null when the env var is missing so
// routes can serve their fallbacks — same behavior as before Session 4.
const houseAi = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
  : null;

// Gemini client for a signed-in user's generation calls.
// A stored BYOK key is AUTHORITATIVE: when present it is always used and
// never silently swapped for the house key — a broken user key must surface
// as a failure, not as hidden spend on the house key. The house key only
// serves users with NO stored key (Milestone A dogfood policy; the public
// model at Milestone B is user-key-required).
// Decrypted keys live only for the duration of the request — never cached,
// never logged. Returns { ai, source: 'byok' | 'house' | null }.
export async function getGeminiForUser(userId) {
  const { rows } = await db.query(
    'SELECT key_ciphertext, key_iv FROM byok_keys WHERE user_id = $1 AND provider = $2',
    [userId, 'gemini']
  );
  if (rows.length > 0) {
    return {
      ai: new GoogleGenAI({ apiKey: decryptKey(rows[0].key_ciphertext, rows[0].key_iv) }),
      source: 'byok',
    };
  }
  return { ai: houseAi, source: houseAi ? 'house' : null };
}
