# ImagePulse - Project Context

POD (print-on-demand) trend research and AI-prompt/SEO generation tool for Etsy/Amazon Merch/Redbubble sellers. Seed a niche, get AI-curated micro-niches, then generate a full package (image prompts + Etsy tags + titles) with a live trademark safety check. Positioned as a "better than Trend2Design" product (see DEVLOG for competitive analysis and direction).

Started in Google Antigravity, migrated to Claude Code 2026-07-02. This clone at `Documents\Code\ImagePulse` is the canonical copy; the old Antigravity copy at `C:\Users\mattr\.gemini\antigravity\scratch\ImagePulse` is stale (do not edit it).

## Stack

- **Frontend:** React 19 + Vite 8 (plain JSX, no TypeScript). Inline styles + `src/index.css` (glassmorphism dark theme). Icons via `lucide-react`.
- **Backend:** Vercel serverless functions in `api/` (plain JS, ESM — root package.json is `"type": "module"`). One file per endpoint (Vercel file-based routing); shared helpers in `api/_lib/` (underscore dirs are not exposed as routes). The old Express 5 server (`server/index.js`, CommonJS) still works as a legacy fallback and gets deleted in Session 5.
- **Database:** Supabase Postgres (project `nnyhwhirdtvgdwsbuhnt`, us-east-2) via `pg` over the transaction pooler, TLS pinned to `server/supabase-ca.crt`. Schema lives in `supabase/migrations/` (applied with `npx supabase db push --linked`); `api/_lib/db.js` exports the Pool (the legacy Express copy is `server/db.js`). Connection string `SUPABASE_DB_URL` in root `.env` for `vercel dev` and in `server/.env` for the legacy server (both gitignored). The old SQLite file `server/imagepulse.db` is archival only (ported 2026-07-03; the one-time migration script was deleted in Session 2 — recover from commit `f6c1a04` if ever needed). `better-sqlite3` dropped 2026-07-03.
- **Auth (Session 3):** Supabase Auth, email+password live (Google wired in UI but provider disabled pending Red's Google Cloud OAuth client). ES256 JWTs verified server-side in `api/_lib/auth.js` (`jose` + JWKS); every `api/` route requires `Authorization: Bearer <jwt>` and scopes queries `WHERE user_id = $n` — that WHERE clause IS tenancy enforcement, because the pooler connection is table owner and bypasses RLS. Frontend: `@supabase/supabase-js` for auth only (`src/lib/supabase.js`); all API calls go through `src/lib/api.js` `apiFetch`. Data API table grants are revoked; `byok_keys` has zero RLS policies on purpose.
- **AI:** Google Gemini via `@google/genai` (`gemini-2.5-pro` with `gemini-2.5-flash` fallback, then hardcoded offline fallback). Trademark check uses Gemini Google Search grounding.
- **Repo:** github.com/mattrebelskey/ImagePulse (public). Default branch `master`. Commit author: Matt Rebelskey <matt.rebelskey@gmail.com> (repo-local config).

## Run it (one terminal)

```
# needs GEMINI_API_KEY at User scope + root .env with SUPABASE_DB_URL,
# SUPABASE_URL, VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY
npm install && npx vercel dev              # frontend + api on http://localhost:3000
```

Legacy two-terminal workflow still works (`cd server && npm start` + `npm run dev`; vite proxies `/api` to port 3000). Without `GEMINI_API_KEY`, `/api/trends` serves a 2-item fallback and `/api/generate-prompts` returns 401. Frontend fetches use relative `/api` paths.

## API surface (api/)

All routes require a signed-in user (401 otherwise); rows are scoped to that user.

- `GET /api/trends?seed=` - AI-generated micro-niches (or fallback). `api/trends.js`
- `POST /api/generate-prompts` - trademark check, then 3 prompts + 13 tags + 2 titles; auto-logs to `generation_history`. `api/generate-prompts.js`
- `POST /api/negative-prompt` - context-tailored negative prompt. `api/negative-prompt.js`
- `GET/POST/DELETE /api/favorites` - saved niches (`favorite_niches`). `api/favorites/index.js` + `api/favorites/[title].js`
- `GET/POST/DELETE /api/favorite-packages` - manually saved packages (`favorite_packages`). `api/favorite-packages/index.js` + `api/favorite-packages/[id].js`
- `GET/DELETE /api/history` - auto-logged generations (`generation_history`), read by the History tab. `api/history/index.js` + `api/history/[id].js`

## No-touch rules

- Never commit `server/.env` or `server/imagepulse.db` (both gitignored). No secrets in frontend code.
- Do not reintroduce the removed `/api/preview-image` Pollinations proxy or per-card `<img>` previews (removed 2026-07-02; they caused the 429/slow-card problem).
- History = auto-log of every generation (`generation_history`). "Saved Packages" = manual favorites (`favorite_packages`). Keep them distinct; do not merge.
- Do not let Gemini fabricate demand numbers. The current `searchVolume`/`competition` fields are LLM-invented and are slated for replacement with real data (see DEVLOG direction #1-2). Do not add more fabricated metrics.
- Match the surrounding plain-JSX, inline-style house style. No TypeScript, no CSS framework.

## Key docs

- **`research/productization-architecture.md` - THE PLAN OF RECORD / TODO list.** Launch order (Milestone A: hosted for Red's own testing -> Milestone B: public), the approved one-session-per-step plan, pricing decisions (BYOK every tier, X runs/mo + credit top-ups, no in-house image gen in V1), and the data-model sketch. Read this first in any productization session; update its status lines as steps complete.
- `research/real-data-vendor-scan.md` - verified 2026-07-03: real search-volume vendor = DataForSEO ($50 one-time deposit, ~$0.06/run). Replaces the fabricated searchVolume fields (direction #1-2).
- `research/uspto-api-scoping.md` - verified 2026-07-03: NO official USPTO phrase-search API exists; trademark gate route = local index from USPTO bulk XML + TSDR status confirmation. Own sub-project in Milestone B.
- `DEVLOG.md` - project history, Phase 7 fixes, product direction, competitive analysis.
- `research/competitor-landscape.md` - verified scan of 24 competitor tools.
