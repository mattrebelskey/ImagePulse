# ImagePulse productization architecture (V2 sketch)

_2026-07-03, Fable session, after factory run #2. Answers Red's question: "when this goes public, what do people/we need for real storage and recall, per-stage structure, editing, and push-to-their-own-store? What does it cost me and what do I charge?"_

## The core insight: the folders were never the point

The local lifecycle (raw -> production -> staged -> shipped -> retired) is a **state machine**. On Red's laptop it wears a filesystem costume: stage = which folder the files sit in. In the app, stage becomes a **status column in a database row**, and "moving a folder" becomes updating that column. Nothing is physically moved.

**Consequence for the local ROADMAP build:** make `listing.json` + the manifest the source of truth and treat folders as a *view* of that state. Then the local pipeline IS the prototype of the cloud schema, and the port is mechanical instead of a rewrite.

## Data model (multi-tenant)

One core entity, `listing`, per design-in-flight:

| Field | What it holds |
|---|---|
| id, user_id, created_at | ownership + tenancy (Supabase RLS row-level security) |
| concept_slug, product_type | drives the field set (prints / apparel / stickers / mugs...) |
| status | enum: raw, production, staged, shipped, retired (+ status_history timestamps) |
| retired_reason | enum: didnt_renew, not_selling, etsy_takedown, ip_complaint, superseded, owner_choice, other (+ free-text note) — the RETIRED.md label as data |
| listing_data (JSONB) | exactly today's listing.json: titles[], chosen_title (incl. write-your-own), description, tags[], price, etsy fields, checklist state |
| compliance (JSONB) | 4-track verdicts + citations. **Legal text is NOT stored in the editable description** — it's composed server-side at render/push time, so no client can strip the AI disclosure. Stronger than a read-only UI field. |
| store_push | provider, external product id, shop id, pushed_at, live_url — the usage ledger as rows |

Assets (masters, crops, mockups, zips) live in **object storage**, keyed `user_id/listing_id/<stage-or-kind>/...` — Supabase Storage to start (100 GB on Pro), Cloudflare R2 (~$0.015/GB-mo, zero egress fees) if image volume outgrows it.

The React listing builder = the current listing.html backed by that row: edit-in-place, tag chips with Etsy limits, product-type dropdown swapping field sets, locked legal blocks.

## Push to their own stores (connector layer)

- **Physical POD:** user pastes their own Printify Personal Access Token (or Printful OAuth). App stores it encrypted (same AES-GCM pattern as the IFS app), pushes create-product via their token, and **Printify's native Etsy sync publishes** — same flow Red uses, no Etsy API needed.
- **Digital downloads (Red's current listings):** these do NOT go through Printify. Multi-tenant digital push requires the **Etsy API** (OAuth per seller + Etsy's commercial app approval + rate limits). That is a real gate — which is exactly why the Etsy API application (Opus track) matters beyond analytics.
- V1 connector order: Printify -> Printful -> Etsy-direct (digital) once API access is approved. Each is an adapter behind one `push(listing, connection)` interface.
- External dependency (Red, 2026-07-03): his own Printify page needs updating/restoring before push-to-Printify can be exercised even for dogfooding.

## Long-term management

All managed services, no servers to babysit: Vercel (frontend + API functions), Supabase (Postgres + auth + storage + RLS), Stripe (billing). One real engineering wrinkle: **image-generation runs take minutes**, longer than a standard serverless function — needs a background job/queue layer (Vercel durable workflows, Inngest, or Trigger.dev) rather than a request-response call.

**Headscale: not a fit.** Headscale is a self-hosted, open-source replacement for the Tailscale coordination server — it builds a private mesh VPN between your own devices (e.g., reach a home server securely from anywhere). It is networking plumbing, not app hosting, database, or storage. Nothing in the Vercel + Supabase stack needs a private network. It only becomes relevant in a future where Red runs, say, local GPU generation on a home machine that the app must reach privately — and that is an ops burden to avoid, not seek.

## Cost to Red (verified 2026-07-03)

Fixed floor once real users exist (~$45-50/mo):
- Vercel Pro: **$20/mo** (Hobby free tier prohibits commercial use)
- Supabase Pro: **$25/mo** (8 GB DB, 100 GB storage, 100K MAU included)
- Domain ~$12/yr; Stripe takes 2.9% + $0.30 per charge

Variable, per full listing run (approximate; image gen dominates):
- Image generation: ~$0.13/image at 4K x 3-5 variants = **$0.40-0.65**
- Gemini text calls (niches, prompts, tags, negative prompt): ~$0.02-0.05
- Grounded trademark check: ~$0.03-0.04/query
- Real keyword data (DataForSEO-class, pay-as-you-go): ~$0.01-0.05
- Storage: ~50-150 MB/listing if all generations are kept -> fractions of a cent/mo
- **Total: roughly $0.50-0.80 per completed listing run**

## Pricing — RED'S DECISIONS (2026-07-03 evening)

Anchors: Trend2Design $99/mo, PODAutomation $3.99/mo, eRank $5.99-29.99/mo.

1. **No in-house image generation in public V1.** It becomes a higher paid tier later (credits cover gen cost at that tier). **Red 2026-07-03: when it does land, offer MULTIPLE generators** — Nano Banana 2 + Pro, GPT image, Midjourney, Leonardo, etc. Per-generator cost differs, so it reshapes that tier's pricing — to be figured out then. Caveat to verify at build time: Midjourney has no official public API (third-party wrappers are ToS-risky); scope which generators have legitimate API access before promising them.
2. **BYOK (bring-your-own-key) on every tier.** User's Gemini key powers generation AND the text calls; their cost, not Red's.
3. **Every tier gets X runs/month + the option to buy more credits.** Volume-based tiering, full workflow on every tier — no feature paywall (consistent with Red's standing pricing rule from jc-app). A "run" = one full niche→package generation; under BYOK, Red's per-run cost is only the real-data vendor lookups (pennies), so caps are value-metering + data-cost control.
4. **Tiers must be visible on the main webpage BEFORE and AFTER paywall** — public pricing grid on the landing page, plan/usage/buy-credits page in-app.
- Dollar amounts TBD (placeholder instinct: Starter ~$9 / Pro ~$19 / gen-included tier ~$29-39). The $25-lifetime hook remains Trend2Design's play, not ours; GTM stays YT-creator outreach.

## Launch order (Red: "get everything we need to make it public in order, then test the real thing myself")

Milestone A — hosted, Red can test (billing NOT required for this):
1. **DB port: SQLite → Supabase Postgres.** Supabase is definitely needed, not optional — Vercel's serverless filesystem is ephemeral, better-sqlite3 cannot run there. Tables: users, listings (state machine), favorites, history, byok_keys (encrypted), run_ledger, plans/credits.
2. **API port: Express routes → Vercel functions**; kill hardcoded localhost:3000 in the frontend (relative /api paths).
3. **Auth + multi-tenancy:** Supabase Auth (email + Google), RLS on every table.
4. **BYOK settings page:** paste key → validate ping → encrypt at rest → used per-request, never logged.
5. **DEPLOY to Vercel + Supabase. Red dogfoods the hosted app.** ← "test the real thing" point.

Milestone B — public-ready:
6. **Run metering:** run_ledger row per generation, server-side tier caps.
7. **Real-data vendor wired — RESEARCHED 2026-07-03, pick = DataForSEO** Keywords Data API (Google Ads Search Volume): $50 one-time deposit (not monthly), $0.06/task of up to 1,000 keywords → **~$0.06 per run**; 400+ runs/mo before hitting the $25 ceiling. Runner-up: Keywords Everywhere ($84/yr). ClearSERP eliminated (SERP-only, no volume). No Etsy-native keyword API exists anywhere — label Etsy demand figures as estimates with stated basis. Full scan: `research/real-data-vendor-scan.md`.
7b. **USPTO trademark gate — SCOPED 2026-07-03: no official phrase-search API exists.** tmsearch.uspto.gov has no documented API (scraping it violates ToS); ODP (data.uspto.gov) has no mark-text search; TSDR is status-by-number only. **Route: local index built from USPTO bulk trademark XML** (daily TDXF + backfill; live-marks-only index trimmed to classes 16/25 fits in low GB — check against Supabase Pro's 8GB or park it in a separate store), TSDR confirms borderline hits, output = CLEAR/CAUTION/CONFLICT risk tiers + evidence, never a legal verdict. Interim MVP option: Marker API ($25/10K searches, freshness unpublished) or keep Gemini grounding labeled as heuristic. Effort: days-to-2-weeks — this is a real sub-project; schedule it as its own build track inside Milestone B. Full scoping: `research/uspto-api-scoping.md`.
8. **Stripe:** subscription tiers + one-time credit top-ups + webhooks → credit balance.
9. **Public face:** landing page with pricing grid (pre-pay) + in-app plan/usage/buy-credits (post-pay).
10. **Legal pages:** ToS + privacy policy (storing users' API keys makes privacy policy mandatory; Stripe requires terms/refund links).
11. **Launch:** domain + YT-creator outreach.

Parallel track (not blocking A): listing-builder React port (flagship differentiator, ship at/near launch), generator selector, cached daily feed (feed runs on RED'S key, so cache before public).

## Milestone A session plan (approved 2026-07-03; one session per step to avoid context rot)

Verified 2026-07-03: NO Supabase footing on this machine (no CLI, no ~/.supabase, no SUPABASE_URL in any Code project .env). From scratch.

- **Session 1 — Supabase foundation. ✅ DONE 2026-07-03.** Project `nnyhwhirdtvgdwsbuhnt` (us-east-2, org "Red", free tier) created via Management API; `npx supabase` v2.109.0 ran fine (no Smart App Control block). Schema migration `supabase/migrations/20260703191206_initial_schema.sql` applied via `db push --linked`: 9 tables (plans, profiles, listings + status/retired-reason enums, store_pushes, favorite_niches, favorite_packages, generation_history, byok_keys, run_ledger), RLS enabled everywhere with zero policies (deny-by-default; Session 3 adds policies + backfills the nullable user_id columns). Advisors: no issues. SQLite data ported (4 history rows, counts reconciled); Express wired to Postgres via `pg` over the transaction pooler (port 6543, serverless-ready), TLS verified against pinned Supabase CA (`server/supabase-ca.crt`). All DB routes tested green end-to-end. Creds in `server/.env` (gitignored): SUPABASE_DB_PASSWORD + SUPABASE_DB_URL. Notes for later sessions: (a) tables are NOT exposed to the Data API (post-2026-04-28 default) — Session 3 must grant deliberately if supabase-js is used; (b) drop `better-sqlite3` + the migration script in Session 2; (c) plan rows seeded with placeholder prices ($0/$9/$19) and run caps (3/25/100) — Red re-prices at Milestone B.
- **Session 2 — API port.** Express routes → Vercel functions; frontend fetches → relative /api; verify with `vercel dev` locally.
- **Session 3 — Auth + multi-tenancy.** Supabase Auth (email + Google), RLS on every table.
- **Session 4 — BYOK.** Settings page: paste Gemini key → validation ping → encrypted at rest → per-request use, never logged.
- **Session 5 — Deploy + dogfood.** Link Vercel project, env vars, deploy. CLAUDE DOGFOODS IT (Red's request: "I mostly just want to see how it works"): drive the hosted app via Playwright — sign up, enter key, run a full generation — screenshot each step and deliver a walkthrough report. Then Red tests himself.

Each session starts fresh with THIS DOC as the brief. Update the checkboxes/status here at each session end.
