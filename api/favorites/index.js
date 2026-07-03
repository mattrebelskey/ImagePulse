import db from '../_lib/db.js';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { rows } = await db.query(
        'SELECT id, title, category, keywords, created_at FROM favorite_niches ORDER BY created_at DESC'
      );
      res.json(rows);
    } catch (error) {
      console.error('Failed to fetch favorites:', error.message);
      res.status(500).json({ error: 'Failed to fetch favorites' });
    }
    return;
  }

  if (req.method === 'POST') {
    const { title, category, keywords } = req.body;
    try {
      // Mirrors SQLite's INSERT OR IGNORE on the (user_id, title) unique constraint.
      await db.query(
        'INSERT INTO favorite_niches (title, category, keywords) VALUES ($1, $2, $3) ON CONFLICT ON CONSTRAINT favorite_niches_user_title_uniq DO NOTHING',
        [title, category, JSON.stringify(keywords)]
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
