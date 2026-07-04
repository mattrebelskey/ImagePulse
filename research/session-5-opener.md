# Session 5 opener (paste everything below the line into a fresh session)

---

Session 5 of ImagePulse Milestone A — Deploy + dogfood. The "test the real thing" point.
Brief: C:\Users\mattr\Documents\Code\ImagePulse\research\productization-architecture.md
(read "Milestone A session plan" — Sessions 1-4 are DONE, their status entries have the
notes you need; also read the project CLAUDE.md and "Known security debt").

RED PRE-FLIGHT (before or at session start):
- Top up Gemini API credit — balance was $5.56 on 2026-07-03 BEFORE Session 4
  verification spend (~$0.10-0.15 burned there); grounded trademark checks run
  ~$0.03-0.04 each and dogfooding will chew through what's left.
- Decide Vercel plan: Hobby is fine for Red-only dogfooding, but its ToS prohibits
  commercial use — Pro ($20/mo) before anything public (brief, "Cost to Red").
- Optional: Google Cloud OAuth client if Google sign-in should go live (redirect URI
  https://nnyhwhirdtvgdwsbuhnt.supabase.co/auth/v1/callback); otherwise skip again.

State of the world:
- Sessions 1-4 on branch feat/supabase-foundation (not merged to master, not pushed).
  Merging/pushing is an open call for Red this session — deploy wants master or a
  deliberate branch deploy.
- BYOK is LIVE locally (Session 4): Settings tab, key-per-provider, validation ping,
  AES-256-GCM at rest. A stored key is AUTHORITATIVE (no silent house fallback); house
  GEMINI_API_KEY covers keyless users — Milestone A policy only, public flips to
  user-key-required at Milestone B. Never log keys / return last4 only. Registry pattern:
  api/_lib/providers.js + PROVIDER_INFO in src/components/Settings.jsx.
- Auth pattern unchanged: ES256 JWT via jose/JWKS in api/_lib/auth.js -> requireUser;
  every query scopes WHERE user_id = $n (pooler connects as table OWNER, RLS bypassed —
  the WHERE clause IS tenancy). byok_keys stays zero-policy deny-all; never add a
  client-readable policy for it.
- Vercel project `imagepulse` linked (scope mattrebelskeys-projects); git integration
  deliberately DISCONNECTED since Session 2 — reconnect deliberately or deploy via CLI.
- test1@imagepulse.test / test2@imagepulse.test passwords are intentionally unknown
  (reset to throwaway randoms via the auth admin API in Session 4's verification) —
  reset the same way when needed: Management API secret key (PowerShell User-scope
  SUPABASE_ACCESS_TOKEN, non-browser -UserAgent) -> PUT /auth/v1/admin/users/{id}.
- mailer_autoconfirm is OFF (deliberate); Supabase built-in rate-limited SMTP is fine
  for Milestone A; custom SMTP before Milestone B public signup.

Session 5 scope (from the brief):
1. Env vars into Vercel (production + preview): SUPABASE_DB_URL, SUPABASE_URL,
   VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY, GEMINI_API_KEY, and
   BYOK_MASTER_KEY — copy the EXACT value from root .env; a different value makes any
   stored ciphertext undecryptable.
2. Supabase auth config off localhost: site_url -> deployed URL + additional redirect
   URLs, or confirmation links and OAuth redirects break (Session 3 note (b)).
3. Confirm the deploy bundler traces api/_lib/supabase-ca.crt (fs.readFileSync with
   import.meta URL) — add vercel.json functions includeFiles if it doesn't.
4. Coarse per-IP rate limiting on the 3 Gemini-backed endpoints (trends,
   generate-prompts, negative-prompt) before anything is publicly reachable —
   security-debt #3. Keep it simple; full run-metering is Milestone B.
5. Delete server/ (legacy Express fallback + its db.js/.env/CA copies) — everything is
   recoverable from git history; note the removal commit hash in the brief like
   Session 2 did for the migration script.
6. DEPLOY. Then CLAUDE DOGFOODS IT (Red: "I mostly just want to see how it works"):
   drive the hosted app via Playwright — sign up a fresh user (or admin-create), confirm
   the email flow, Settings -> paste a Gemini key -> validate, run a full niche ->
   package generation — screenshot each step and deliver a walkthrough report. Then Red
   tests himself.
7. Post-deploy checks: signed-out 401s on the hosted URL, key-leak grep on the deployed
   function logs (vercel logs), tenancy spot-check with test users.

Gotchas carried over: 401 = not signed in, 500 = server misconfig (keep the split).
Don't merge History and Saved Packages. No TypeScript; match house style. Any new SQL
function in public: revoke EXECUTE from anon/authenticated. byok_keys.user_id is still
nullable — if any migration lands this session, include SET NOT NULL for it. Security
debt #2 (prompt-injectable safety check) stays open by design until the Milestone B
USPTO gate; debt 1b backup build is scoped (research/gemini-backup-scoping.md) and
awaits Red's go. Update the brief's status line at session end and write
research/session-6-opener.md (Milestone B kickoff: run metering first, then DataForSEO
wiring + USPTO gate as its own track).
