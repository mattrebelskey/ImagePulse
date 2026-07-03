# USPTO API Scoping for ImagePulse Trademark Gate
Research date: 2026-07-03. All sources checked this date against official USPTO domains.

## VERDICT
**No official USPTO phrase-search / clearance API exists.** There is no public, documented USPTO endpoint that takes a phrase like "weird vintage cat" and returns matching live marks filtered by class. The public search UI (tmsearch.uspto.gov) has **no documented API**; the ODP (data.uspto.gov) exposes trademark **assignment, TTAB, and bulk data** but **no mark-text search**; TSDR is **status-by-number only**.

**Best route for ImagePulse:** ingest USPTO **bulk trademark XML (daily TDXF + annual full-text archive)** into a local search index (Postgres FTS / Elasticsearch / SQLite FTS5), filter to LIVE + class 16/25, run exact + near-match queries. This is what serious compliance tools do. **Interim/MVP fallback:** a third-party wrapper (Marker API) with an explicit freshness caveat, or keep Gemini grounding as a soft signal while the index is built.

---

## Per-option details

### 1. USPTO Open Data Portal — data.uspto.gov (the new ODP)
- **Trademark text-search endpoint: NONE.** ODP's live API catalog is patent-centric: Patent File Wrapper (with "Smart Search"), Final Petition Decisions, PTAB Decisions, Enriched Citations, Office Action Citations. Trademark presence is limited to **Trademark Assignment Search Data** (ownership-transfer records, not mark clearance), **TTAB decisions**, and **bulk datasets**.
- **Auth:** USPTO.gov account required to access ODP as of **2026-06-18**; extra profile fields required **2026-08-18**. API key at `https://data.uspto.gov/apikey`.
- **Rate limits (patent/meta APIs — no TM search API to limit):** Meta Data Retrieval = 5,000,000 calls/week combined (resets Sun 00:00 UTC); Bulk Dataset downloads = 20/year per key (higher for XML), max 5 files/10s per IP, signed URLs expire ~5s; burst=1 (no parallel calls), sequential 4–15 req/s; HTTP 429 on exceed.
- **Commercial use:** USPTO data is public-domain/government work; free. No commercial restriction on the data itself.
- Sources: https://data.uspto.gov/apis/getting-started , https://data.uspto.gov/apis/api-rate-limits , https://data.uspto.gov/ (checked 2026-07-03).

### 2. Legacy developer.uspto.gov APIs
- **Status:** Legacy Developer Hub **decommissioned 2026-06-18**; `developer.uspto.gov/api-catalog` now 301-redirects to `data.uspto.gov`. TTAB + Trademark Assignment migrated to ODP.
- **TSDR (Trademark Status & Document Retrieval):** Still operational at `tsdr.uspto.gov`. **Confirmed: status/documents by serial or registration number ONLY — no search by mark text, owner, or class.** Rate-limited **60 requests/min per key**; PDF/ZIP downloads **4/min**. API key via `https://account.uspto.gov/api-manager/`. (System-status page 2026-04-29 confirms TSDR still live; a brief outage that day was resolved same-day.)
- **Use for ImagePulse:** TSDR is the right tool to confirm LIVE/DEAD status *after* you already have a serial/registration number — i.e., a second step, not the search itself.
- Sources: https://www.uspto.gov/system-status/20260429-trademark-status-and-document-retrieval-tsdr-issues , https://www.uspto.gov/trademarks/apply/check-status-view-documents/trademark-bulk-data (checked 2026-07-03).

### 3. Trademark Search tool — tmsearch.uspto.gov (TESS replacement)
- **No documented public API.** Page exposes only the web UI (plus a new image-search feature for logged-in users). It is protected by **JavaScript challenges, CAPTCHAs, and behavioral analysis**.
- An **undocumented JSON backend** exists (third parties like parse.bot and Apify scrape it), but using it **violates the site Terms of Use**, is actively rate-limited/blocked, and is fragile. **Do not build ImagePulse's production gate on it.**
- Source: https://tmsearch.uspto.gov/ (checked 2026-07-03).

### 4. Bulk data route (RECOMMENDED)
- **Daily:** Trademark Daily XML Files (TDXF) — applications, assignments, TTAB — full text, XML, updated daily, free. Dataset id `TRTDXFAP` (daily applications). Download via ODP Bulk Data (`data.uspto.gov/bulkdata`) or BDSS (`bulkdata.uspto.gov`); legacy Reed Tech mirror historically at trademarks.reedtech.com.
- **Historical backfill options:**
  - Annual full-text XML applications archive: coverage **April 1884 → present** (XML, Trademark Applications v2.0 DTD).
  - **Trademark Case Files Dataset** (economic-research): **12.7M marks, Oct 1870–Mar 2024**, CSV/DTA, **~4.3 GB compressed CSV**; tables for case_file (incl. LIVE/DEAD status), classification (Nice/US class), statement (mark text), owner, event. **Annual** updates (2023 data released Sept 2025 → ~12+ months stale at the tail, so pair with daily TDXF for currency).
- **Effort estimate:** moderate — a few days to ~2 weeks for one dev to build ETL (XML→DB), a search index, and a daily-update cron. **Storage:** working set ~10–30 GB; a live-marks-only index (mark text + class + status, roughly 3M+ active marks — *approx*) fits well under ~10 GB. **This is the compliance-grade route** and gives full control over near-match logic and class filtering.
- Sources: https://data.uspto.gov/bulkdata/datasets/TRTDXFAP , https://www.uspto.gov/ip-policy/economic-research/research-datasets/trademark-case-files-dataset (checked 2026-07-03).

### 5. Third-party fallbacks (only if official route deferred)
- **Marker API (markerapi.com):** USPTO wordmark data. Plans: Free 1K/mo, $25/10K, $50/250K, $100/10M searches. V2 endpoints: Serial, Trademark, Description, Owner, Expiration; supports exact + wildcard (`*`). Commercial use allowed (vendor cites NamingForce). **Data freshness NOT stated — Marker has a long-standing reputation for infrequent updates; treat as a soft/interim signal, verify hits against TSDR.** No explicit class filter (returns goods/services codes you can post-filter). Source: https://markerapi.com/ (checked 2026-07-03).
- **RapidAPI "USPTO Trademark" (pentium10 / Márton Kodok):** wordmark/owner/serial search, claims daily updates, tiered RapidAPI pricing. **Pricing/quotas UNVERIFIED** (page CAPTCHA-gated on 2026-07-03). Source: https://rapidapi.com/pentium10/api/uspto-trademark.
- **What serious tools use:** Trademarkia, Alt Legal, and similar maintain **their own indexes built from USPTO bulk data**, using TSDR for authoritative status — i.e., option 4, not a magic official search API.

---

## Integration sketch for ImagePulse SAFE/UNSAFE gate

Given the verdict (local index route):

1. **Normalize** the input phrase (lowercase, strip punctuation, singular/plural, common design-word tokens).
2. **Exact-match query** against the local index on the normalized mark text, filtered to **status = LIVE** and **class ∈ {16, 25}** (plus optionally coordinated classes). Exact live hit in a relevant class → **UNSAFE (hard flag)**.
3. **Near-match handling:** fuzzy/phonetic pass (trigram similarity, Levenshtein, or Soundex/Metaphone) + token-overlap on the same class filter. Rank by similarity; surface top N with mark, serial/reg #, class, status, owner.
4. **Status confirmation:** for borderline hits, call **TSDR by serial/registration number** to confirm current LIVE/DEAD (index may lag a day).
5. **Output = risk tiers, not a decision:** e.g. `CLEAR` (no live match), `CAUTION` (near-match live in class), `CONFLICT` (exact/strong live match in class). Show the evidence rows.

**Stays human judgment (never automate):** **likelihood of confusion** is a multi-factor legal test (DuPont factors — similarity of marks *and* goods, channels, sophistication, strength, actual confusion). The gate **informs**; it must not render legal clearance. Ship it with a visible disclaimer: "automated screening, not a legal opinion; consult a trademark attorney." Keep Gemini grounding, if retained, clearly labeled as a heuristic, subordinate to the index result.

---

## UNVERIFIED / gaps
- Exact byte size of the full annual **full-text XML** trademark archive (Case Files research dataset = ~4.3 GB compressed CSV is the closest hard figure; XML set likely larger — not confirmed).
- RapidAPI USPTO Trademark **pricing/quotas/freshness** (CAPTCHA-blocked).
- Marker API **update frequency** (not published).
- Count of currently-LIVE marks (~3M+ is an estimate).
- Whether ODP will add a trademark search API later — no announcement found; verify at data.uspto.gov if revisiting.
