import db from '../_lib/db.js';
import { requireUser } from '../_lib/auth.js';

export default async function handler(req, res) {
  const user = await requireUser(req, res);
  if (!user) return;

  if (req.method === 'GET') {
    try {
      // jsonb columns come back as parsed arrays; no JSON.parse step needed.
      const { rows } = await db.query(
        'SELECT id, trend_title, product_type, prompts, tags, titles, created_at FROM favorite_packages WHERE user_id = $1 ORDER BY created_at DESC',
        [user.id]
      );
      res.json(rows);
    } catch (error) {
      console.error('Failed to fetch saved packages:', error.message);
      res.status(500).json({ error: 'Failed to fetch saved packages' });
    }
    return;
  }

  if (req.method === 'POST') {
    const { trend_title, product_type, generatedData } = req.body || {};
    if (!trend_title || !generatedData) {
      return res.status(400).json({ error: 'trend_title and generatedData are required' });
    }
    try {
      await db.query(
        'INSERT INTO favorite_packages (user_id, trend_title, product_type, prompts, tags, titles) VALUES ($1, $2, $3, $4, $5, $6)',
        [user.id, trend_title, product_type, JSON.stringify(generatedData.prompts || []), JSON.stringify(generatedData.tags || []), JSON.stringify(generatedData.titles || [])]
      );
      res.json({ success: true });
    } catch (error) {
      console.error('Failed to save package:', error.message);
      res.status(500).json({ error: 'Failed to save package' });
    }
    return;
  }

  res.status(405).json({ error: 'Method not allowed' });
}
