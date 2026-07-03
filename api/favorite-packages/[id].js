import db from '../_lib/db.js';

export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await db.query('DELETE FROM favorite_packages WHERE id = $1', [req.query.id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Failed to remove package:', error.message);
    res.status(500).json({ error: 'Failed to remove package' });
  }
}
