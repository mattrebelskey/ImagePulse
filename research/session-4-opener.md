# Session 4 opener (paste everything below the line into a fresh session)

---

Session 4 of ImagePulse Milestone A — BYOK settings page.
Brief: C:\Users\mattr\Documents\Code\ImagePulse\research\productization-architecture.md
(read "Milestone A session plan" — Sessions 1-3 are DONE, their status entries have the
notes you need; also read the project CLAUDE.md and "Known security debt").

State of the world:
- Sessions 1-3 committed on branch feat/supabase-foundation (not yet merged or pushed).
- Auth is LIVE: every api/ route requires a Supabase ES256 JWT (verified via jose + JWKS
  in api/_lib/auth.js -> `requireUser(req, res)`); every query scopes WHERE user_id = $n.
  That WHERE clause is the tenancy enforcement — api/_lib/db.js connects as table OWNER
  over the pooler and owners bypass RLS. Keep the pattern on anything new.
- Frontend: supabase-js is auth-only (src/lib/supabase.js); src/lib/api.js `apiFetch`
  injects the token — use it for ALL new fetches. AuthScreen handles signin/signup;
  App.jsx gates on session. UI is plain JSX + inline styles, glassmorphism dark theme.
- Users that exist (admin-created, pre-confirmed): matt.rebelskey@gmail.com = Red
  (uuid b6372d30-fbde-45c6-b015-60dab24962ad, owns the 4 backfilled history rows),
  test1@imagepulse.test, test2@imagepulse.test. Google sign-in provider still DISABLED
  (Red-action: Google Cloud OAuth client; redirect URI
  https://nnyhwhirdtvgdwsbuhnt.supabase.co/auth/v1/callback). If Red has credentials
  ready this session, enabling is one Management API PATCH — otherwise skip.
- Data API path is dead by design: anon/authenticated table+sequence grants revoked,
  default-privilege auto-grants revoked (migration 20260704012551). RLS policies are
  SELECT-own only; byok_keys deliberately has ZERO policies (deny-all) — never add a
  client-readable policy for it.
- Root .env has SUPABASE_DB_URL, SUPABASE_URL, VITE_SUPABASE_URL,
  VITE_SUPABASE_PUBLISHABLE_KEY; GEMINI_API_KEY at User scope. `npx vercel dev` on
  :3000 runs everything. Vercel git integration deliberately DISCONNECTED — do not
  reconnect; deploy is Session 5.
- SUPABASE_ACCESS_TOKEN (Management API) is at Windows USER scope — visible to
  PowerShell via [Environment]::GetEnvironmentVariable('SUPABASE_ACCESS_TOKEN','User'),
  NOT inherited by the Bash tool. Supabase admin/API calls from PowerShell need a
  non-browser -UserAgent or GoTrue rejects the secret key ("Forbidden use of secret
  API key in browser").
- The working tree may carry uncommitted parallel-track files (marketing/,
  research/pricing-analysis.md, research/gtm-creator-program.md, the brief itself
  carries doc-track amendments). Leave them; git add explicit paths only.

Session 4 scope (from the brief):
1. BYOK settings page: paste key -> validation ping -> encrypted at rest -> used
   per-request, never logged (and never echoed back to the client — return last4 only).
2. Key-PER-PROVIDER from day one (pricing decision #2, Red 2026-07-03 late): schema
   already supports it — byok_keys has `provider` text default 'gemini' + unique
   (user_id, provider) `nulls not distinct`. Gemini ships first, but UI/API/DB shapes
   must not assume Gemini-only: provider is a parameter everywhere, validation ping is
   a per-provider adapter, settings UI lists one row per provider.
3. Encryption: AES-256-GCM, same pattern as the IFS app — master key in server env
   (NEW env var; Session 5 must set it in Vercel), ciphertext + iv in byok_keys
   (columns exist: key_ciphertext, key_iv, key_last4, validated_at). Node built-in
   crypto only; no new deps needed.
4. Wire generation calls to the user's key: api/_lib/gemini.js currently builds one
   client from the house GEMINI_API_KEY — refactor so trends/generate-prompts/
   negative-prompt use the signed-in user's decrypted Gemini key when present
   (fallback policy: decide with Red — house key for Red-only dogfooding is fine in
   Milestone A, but the public model is user-key-required).
5. Scope security-debt 1b (Gemini reliability backup) — it shapes key management:
   user keys per provider for generation + possibly a HOUSE key on a second provider
   (needs web-search grounding for the trademark check; candidates Anthropic/OpenAI —
   verify current grounding support + pricing before proposing). Scope only unless Red
   says build.
6. Verify with `npx vercel dev`: save/validate/delete key round-trip; key never appears
   in logs or responses (grep the dev output); a second user's key is invisible
   (tenancy); generation uses the stored key (temporarily swap in a known-bad key and
   confirm the failure surfaces, then restore).

Gotchas carried over: user_id is still NULLABLE on byok_keys (listings/store_pushes/
run_ledger too) — enforce it on byok_keys writes in the handler, or add SET NOT NULL
for byok_keys in this session's migration if one is created anyway. Don't merge History
and Saved Packages. No TypeScript; match house style. Deploy is Session 5; local only.
401 = not signed in, 500 = server misconfig (keep that split). Any new SQL function in
public: revoke EXECUTE from anon/authenticated (default privileges still grant it).
Update the brief's status line at session end and write research/session-5-opener.md
(Session 5 pre-flight for Red: top up Gemini credit — was $5.56 on 2026-07-03; plus
site_url + redirect URLs must move off localhost, env vars into Vercel, confirm the
bundler traces api/_lib/supabase-ca.crt, delete server/, coarse per-IP rate limiting
per security-debt #3).
