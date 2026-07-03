import db from '../_lib/db.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { rows } = await db.query(
      'SELECT id, trend_title, product_type, prompts, tags, titles, created_at FROM generation_history ORDER BY created_at DESC LIMIT 100'
    );
    res.json(rows);
  } catch (error) {
    console.error('Failed to fetch history:', error.message);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
}
