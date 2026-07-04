import db from '../_lib/db.js';
import { requireUser } from '../_lib/auth.js';

export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const user = await requireUser(req, res);
  if (!user) return;

  try {
    await db.query('DELETE FROM favorite_niches WHERE title = $1 AND user_id = $2', [req.query.title, user.id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Failed to remove favorite:', error.message);
    res.status(500).json({ error: 'Failed to remove favorite' });
  }
}
