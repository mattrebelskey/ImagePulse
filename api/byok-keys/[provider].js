import db from '../_lib/db.js';
import { requireUser } from '../_lib/auth.js';

export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const user = await requireUser(req, res);
  if (!user) return;

  try {
    await db.query('DELETE FROM byok_keys WHERE user_id = $1 AND provider = $2', [user.id, req.query.provider]);
    res.json({ success: true });
  } catch (error) {
    console.error('Failed to delete BYOK key:', error.message);
    res.status(500).json({ error: 'Failed to delete your API key' });
  }
}
