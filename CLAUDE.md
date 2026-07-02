# ImagePulse - Project Context

POD (print-on-demand) trend research and AI-prompt/SEO generation tool for Etsy/Amazon Merch/Redbubble sellers. Seed a niche, get AI-curated micro-niches, then generate a full package (image prompts + Etsy tags + titles) with a live trademark safety check. Positioned as a "better than Trend2Design" product (see DEVLOG for competitive analysis and direction).

Started in Google Antigravity, migrated to Claude Code 2026-07-02. This clone at `Documents\Code\ImagePulse` is the canonical copy; the old Antigravity copy at `C:\Users\mattr\.gemini\antigravity\scratch\ImagePulse` is stale (do not edit it).

## Stack

- **Frontend:** React 19 + Vite 8 (plain JSX, no TypeScript). Inline styles + `src/index.css` (glassmorphism dark theme). Icons via `lucide-react`.
- **Backend:** Node.js + Express 5 (CommonJS). `server/index.js` is the whole API.
- **Database:** SQLite via `better-sqlite3`, file at `server/imagepulse.db` (gitignored). Schema in `server/db.js`, created on boot with `CREATE TABLE IF NOT EXISTS`.
- **AI:** Google Gemini via `@google/genai` (`gemini-2.5-pro` with `gemini-2.5-flash` fallback, then hardcoded offline fallback). Trademark check uses Gemini Google Search grounding.
- **Repo:** github.com/mattrebelskey/ImagePulse (public). Default branch `master`. Commit author: Matt Rebelskey <matt.rebelskey@gmail.com> (repo-local config).

## Run it (two terminals)

```
# Terminal 1 - backend (needs GEMINI_API_KEY; Red has it set at User scope)
cd server && npm install && npm start      # http://localhost:3000

# Terminal 2 - frontend
npm install && npm run dev                  # http://localhost:5173
```

Without `GEMINI_API_KEY`, `/api/trends` serves a 2-item fallback and `/api/generate-prompts` returns 401. Frontend fetches are hardcoded to `http://localhost:3000`.

## API surface (server/index.js)

- `GET /api/trends?seed=` - AI-generated micro-niches (or fallback).
- `POST /api/generate-prompts` - trademark check, then 3 prompts + 13 tags + 2 titles; auto-logs to `generation_history`.
- `GET/POST/DELETE /api/favorites` - saved niches (`favorite_niches`).
- `GET/POST/DELETE /api/favorite-packages` - manually saved packages (`favorite_packages`).
- `GET/DELETE /api/history` - auto-logged generations (`generation_history`), read by the History tab.

## No-touch rules

- Never commit `server/.env` or `server/imagepulse.db` (both gitignored). No secrets in frontend code.
- Do not reintroduce the removed `/api/preview-image` Pollinations proxy or per-card `<img>` previews (removed 2026-07-02; they caused the 429/slow-card problem).
- History = auto-log of every generation (`generation_history`). "Saved Packages" = manual favorites (`favorite_packages`). Keep them distinct; do not merge.
- Do not let Gemini fabricate demand numbers. The current `searchVolume`/`competition` fields are LLM-invented and are slated for replacement with real data (see DEVLOG direction #1-2). Do not add more fabricated metrics.
- Match the surrounding plain-JSX, inline-style house style. No TypeScript, no CSS framework.

## Key docs

- `DEVLOG.md` - project history, Phase 7 fixes, product direction, competitive analysis.
- `research/competitor-landscape.md` - verified scan of 24 competitor tools.
