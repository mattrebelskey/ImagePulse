import fs from 'node:fs';
import pg from 'pg';

// Supabase Postgres via the transaction pooler (IPv4-safe, serverless-ready).
// SUPABASE_DB_URL comes from the function environment (root .env under
// `vercel dev`, project env vars once deployed). TLS is verified against
// Supabase's pinned CA cert (public cert, safe to commit).
if (!process.env.SUPABASE_DB_URL) {
  throw new Error('SUPABASE_DB_URL is not set. Add it to .env (local) or the Vercel project env vars.');
}

// Module scope so warm invocations reuse the connection; max 1 because a
// function instance only ever runs one query at a time.
const pool = new pg.Pool({
  connectionString: process.env.SUPABASE_DB_URL,
  ssl: { ca: fs.readFileSync(new URL('./supabase-ca.crt', import.meta.url), 'utf8') },
  max: 1,
});

export default pool;
