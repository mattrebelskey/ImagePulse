import db from '../_lib/db.js';
import { requireUser } from '../_lib/auth.js';

export default async function handler(req, res) {
  const user = await requireUser(req, res);
  if (!user) return;

  if (req.method === 'GET') {
    try {
      const { rows } = await db.query(
        'SELECT id, title, category, keywords, created_at FROM favorite_niches WHERE user_id = $1 ORDER BY created_at DESC',
        [user.id]
      );
      res.json(rows);
    } catch (error) {
      console.error('Failed to fetch favorites:', error.message);
      res.status(500).json({ error: 'Failed to fetch favorites' });
    }
    return;
  }

  if (req.method === 'POST') {
    const { title, category, keywords } = req.body || {};
    if (!title) {
      return res.status(400).json({ error: 'title is required' });
    }
    try {
      // Mirrors SQLite's INSERT OR IGNORE on the (user_id, title) unique constraint.
      await db.query(
        'INSERT INTO favorite_niches (user_id, title, category, keywords) VALUES ($1, $2, $3, $4) ON CONFLICT ON CONSTRAINT favorite_niches_user_title_uniq DO NOTHING',
        [user.id, title, category, JSON.stringify(keywords || [])]
      );
      res.json({ success: true });
    } catch (error) {
      console.error('Failed to save favorite:', error.message);
      res.status(500).json({ error: 'Failed to save favorite' });
    }
    return;
  }

  res.status(405).json({ error: 'Method not allowed' });
}
