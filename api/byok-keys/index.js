import db from '../_lib/db.js';
import { requireUser } from '../_lib/auth.js';
import { encryptKey } from '../_lib/crypto.js';
import { PROVIDERS } from '../_lib/providers.js';

// BYOK key management. The plaintext key exists only inside the POST request:
// validated with a provider ping, encrypted, stored, and never logged or
// echoed back — responses carry last4 at most. user_id always comes from the
// verified JWT (requireUser), which is the NOT NULL enforcement for
// byok_keys.user_id (column is still nullable in the schema).
export default async function handler(req, res) {
  const user = await requireUser(req, res);
  if (!user) return;

  if (req.method === 'GET') {
    try {
      const { rows } = await db.query(
        'SELECT provider, key_last4, validated_at, created_at FROM byok_keys WHERE user_id = $1 ORDER BY provider',
        [user.id]
      );
      return res.json(rows);
    } catch (error) {
      console.error('Failed to list BYOK keys:', error.message);
      return res.status(500).json({ error: 'Failed to load your API keys' });
    }
  }

  if (req.method === 'POST') {
    const { provider, key } = req.body || {};
    if (typeof provider !== 'string' || !Object.hasOwn(PROVIDERS, provider)) {
      return res.status(400).json({ error: `Unknown provider. Supported: ${Object.keys(PROVIDERS).join(', ')}` });
    }
    const trimmed = typeof key === 'string' ? key.trim() : '';
    if (trimmed.length < 8 || trimmed.length > 256) {
      return res.status(400).json({ error: 'That does not look like an API key. Paste the full key from your provider.' });
    }

    const verdict = await PROVIDERS[provider].validateKey(trimmed);
    if (!verdict.ok) {
      return res.status(verdict.transient ? 502 : 400).json({ error: verdict.reason });
    }

    try {
      const { ciphertext, iv } = encryptKey(trimmed);
      const { rows } = await db.query(
        `INSERT INTO byok_keys (user_id, provider, key_ciphertext, key_iv, key_last4, validated_at)
         VALUES ($1, $2, $3, $4, $5, now())
         ON CONFLICT (user_id, provider) DO UPDATE
           SET key_ciphertext = excluded.key_ciphertext,
               key_iv = excluded.key_iv,
               key_last4 = excluded.key_last4,
               validated_at = excluded.validated_at
         RETURNING provider, key_last4, validated_at`,
        [user.id, provider, ciphertext, iv, trimmed.slice(-4)]
      );
      return res.json(rows[0]);
    } catch (error) {
      console.error('Failed to save BYOK key:', error.message);
      return res.status(500).json({ error: 'Failed to save your API key' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
