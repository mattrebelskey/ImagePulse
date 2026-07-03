require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

// Supabase Postgres via the transaction pooler (IPv4-safe, serverless-ready for
// the Session 2 Vercel port). SUPABASE_DB_URL lives in server/.env (gitignored).
// TLS is verified against Supabase's pinned CA cert (public cert, safe to commit).
if (!process.env.SUPABASE_DB_URL) {
  throw new Error('SUPABASE_DB_URL is not set. Add it to server/.env');
}

const pool = new Pool({
  connectionString: process.env.SUPABASE_DB_URL,
  ssl: { ca: fs.readFileSync(path.join(__dirname, 'supabase-ca.crt'), 'utf8') },
  max: 5,
});

module.exports = pool;
