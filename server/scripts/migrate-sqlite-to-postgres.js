// One-time port of local SQLite data (favorite_niches, favorite_packages,
// generation_history) into Supabase Postgres. Milestone A Session 1.
// Rows land with user_id NULL; Session 3 (auth) backfills them to Red's account.
// Idempotent: any table that already has rows in Postgres is skipped, so a
// re-run cannot duplicate history/package rows (which have no unique key).
// Run from server/:  node scripts/migrate-sqlite-to-postgres.js
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const fs = require('fs');
const Database = require('better-sqlite3');
const { Pool } = require('pg');

const sslCa = fs.readFileSync(path.join(__dirname, '..', 'supabase-ca.crt'), 'utf8');

// SQLite CURRENT_TIMESTAMP is UTC in 'YYYY-MM-DD HH:MM:SS' form.
const toIso = (s) => (s ? new Date(s.replace(' ', 'T') + 'Z').toISOString() : new Date().toISOString());

(async () => {
  const sqlite = new Database(path.join(__dirname, '..', 'imagepulse.db'), { readonly: true });
  const pool = new Pool({ connectionString: process.env.SUPABASE_DB_URL, ssl: { ca: sslCa } });

  const migrated = {};

  const skipIfPopulated = async (table) => {
    const { rows } = await pool.query(`SELECT COUNT(*)::int AS n FROM ${table}`);
    if (rows[0].n > 0) {
      console.log(`SKIP ${table}: already has ${rows[0].n} rows in Postgres`);
      return true;
    }
    return false;
  };

  if (!(await skipIfPopulated('favorite_niches'))) {
    const src = sqlite.prepare('SELECT * FROM favorite_niches').all();
    for (const r of src) {
      await pool.query(
        'INSERT INTO favorite_niches (title, category, keywords, created_at) VALUES ($1, $2, $3, $4)',
        [r.title, r.category, r.keywords_json ?? '[]', toIso(r.created_at)]
      );
    }
    migrated.favorite_niches = src.length;
  }

  if (!(await skipIfPopulated('favorite_packages'))) {
    const src = sqlite.prepare('SELECT * FROM favorite_packages').all();
    for (const r of src) {
      await pool.query(
        'INSERT INTO favorite_packages (trend_title, product_type, prompts, tags, titles, created_at) VALUES ($1, $2, $3, $4, $5, $6)',
        [r.trend_title, r.product_type, r.prompts_json ?? '[]', r.tags_json ?? '[]', r.titles_json ?? '[]', toIso(r.created_at)]
      );
    }
    migrated.favorite_packages = src.length;
  }

  if (!(await skipIfPopulated('generation_history'))) {
    const src = sqlite.prepare('SELECT * FROM generation_history').all();
    for (const r of src) {
      await pool.query(
        'INSERT INTO generation_history (trend_title, product_type, prompts, tags, titles, created_at) VALUES ($1, $2, $3, $4, $5, $6)',
        [r.trend_title, r.product_type, r.prompts_json ?? '[]', r.tags_json ?? '[]', r.titles_json ?? '[]', toIso(r.created_at)]
      );
    }
    migrated.generation_history = src.length;
  }

  console.log('Migrated:', JSON.stringify(migrated));

  // Reconcile: SQLite count vs Postgres count per table, mechanically.
  for (const table of ['favorite_niches', 'favorite_packages', 'generation_history']) {
    const sq = sqlite.prepare(`SELECT COUNT(*) AS n FROM ${table}`).get().n;
    const pg = (await pool.query(`SELECT COUNT(*)::int AS n FROM ${table}`)).rows[0].n;
    console.log(`${table}: sqlite=${sq} postgres=${pg} ${sq === pg ? 'OK' : 'MISMATCH'}`);
  }

  await pool.end();
  sqlite.close();
})().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
