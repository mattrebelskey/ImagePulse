# Session 3 opener (paste everything below the line into a fresh session)

---

Session 3 of ImagePulse Milestone A — Auth + multi-tenancy.
Brief: C:\Users\mattr\Documents\Code\ImagePulse\research\productization-architecture.md
(read "Milestone A session plan" — Sessions 1-2 are DONE, their status entries have the
notes you need; also read the project CLAUDE.md).

State of the world:
- Sessions 1-2 are committed on branch feat/supabase-foundation (5 commits, not yet
  merged or pushed).
- API is Vercel functions in api/ (ESM), verified locally via `npx vercel dev` on :3000
  against Supabase (project nnyhwhirdtvgdwsbuhnt, us-east-2). DB access via pg over the
  transaction pooler, TLS pinned to api/_lib/supabase-ca.crt. Root .env has SUPABASE_DB_URL;
  GEMINI_API_KEY is at User scope. Vercel project `imagepulse` is linked (.vercel/), git
  integration deliberately DISCONNECTED — do not reconnect; deploy is Session 5.
- The working tree may carry uncommitted files from parallel tracks (marketing/,
  research/pricing-analysis.md, research/gtm-creator-program.md, late brief amendments).
  Leave them to their own tracks; never sweep them into this session's commits
  (git add explicit paths only).

Session 3 scope (from the brief):
1. Supabase Auth: email + Google sign-in, supabase-js client in the React app,
   login/signup UI matching the glassmorphism dark theme.
2. Multi-tenancy: backfill/enforce the nullable user_id columns on favorite_niches,
   favorite_packages, generation_history; every api/ function scopes queries to the
   authenticated user (verify the JWT server-side). CRITICAL: api/_lib/db.js connects
   as the table OWNER via the pooler, and owners bypass RLS — so the explicit
   `WHERE user_id = $1` on every query IS the tenancy enforcement for the api/ path.
   Do not assume the Session 3 RLS policies cover these routes; they only guard the
   Data API / supabase-js path. Also fix while touching every handler: guard
   `req.body || {}` in the 4 POST handlers, and the stale "server/.env" error strings
   (see "Known security debt" in the brief).
3. RLS policies on every table (Session 1 left RLS enabled with zero policies,
   deny-by-default). Decide grants deliberately: tables are NOT exposed to the Data API
   (post-2026-04-28 default) — grant only what supabase-js actually needs, if anything;
   the pg-over-pooler path bypasses the Data API and needs policies only if we adopt
   authenticated roles there.
4. Verify locally with `npx vercel dev`: two test users can't see each other's
   favorites/history; signed-out requests are rejected.

Gotchas carried over: don't merge History and Saved Packages; no TypeScript, match house
style; existing rows (4 history rows, Red's data) must survive the user_id backfill —
assign them to Red's account. Deploy is Session 5; this session is local-only.
Update the brief's status line at session end and write the Session 4 opener prompt
(save it as research/session-4-opener.md; Session 4 note: BYOK is key-PER-PROVIDER,
schema already has byok_keys.provider — see pricing decision #2 and security-debt 1b).
