import db from '../_lib/db.js';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      // jsonb columns come back as parsed arrays; no JSON.parse step needed.
      const { rows } = await db.query(
        'SELECT id, trend_title, product_type, prompts, tags, titles, created_at FROM favorite_packages ORDER BY created_at DESC'
      );
      res.json(rows);
    } catch (error) {
      console.error('Failed to fetch saved packages:', error.message);
      res.status(500).json({ error: 'Failed to fetch saved packages' });
    }
    return;
  }

  if (req.method === 'POST') {
    const { trend_title, product_type, generatedData } = req.body;
    try {
      await db.query(
        'INSERT INTO favorite_packages (trend_title, product_type, prompts, tags, titles) VALUES ($1, $2, $3, $4, $5)',
        [trend_title, product_type, JSON.stringify(generatedData.prompts), JSON.stringify(generatedData.tags), JSON.stringify(generatedData.titles)]
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
