# ImagePulse Real Keyword-Data Vendor Scan

_Verified 2026-07-03 against each vendor's own live pricing page. Budget ceiling $0-25/mo.
"Run" = one niche -> prompts/tags/titles package. A "lookup" below = one keyword's
search-volume data point. Prices tagged Verified (own page) / Verified (secondary) / UNVERIFIED._

## Comparison table

| Vendor | Verified price | Cost @ 500 lookups/mo | Cost @ 5,000 lookups/mo | What you actually get | ToS legitimacy | Source (checked 2026-07-03) |
|---|---|---|---|---|---|---|
| **DataForSEO — Keywords Data (Google Ads Search Volume)** | $50 min deposit; **$0.06/task** standard (≤1,000 kw/task), **$0.09/task** live | ~**$0.06-$0.30** (1-few tasks); <$1/mo | ~**$0.30-$1** (5 tasks of 1k); <$3/mo | **Real Google search volume + CPC + competition.** Batches 1,000 kw/call. No Etsy endpoint (has Amazon + Google Shopping). | **Legitimate** — licensed data reseller, not scraping | dataforseo.com/pricing/keywords-data/google-ads |
| **Keywords Everywhere — API** | **$84/yr** Bronze = 100k credits (1 credit/keyword) | Bronze covers it → **~$7/mo** | 60k/yr still under 100k → **~$7/mo** | **Real Google volume + CPC + competition.** API on all plans since Jun 2025. Credits expire 12 mo. | **Legitimate** | keywordseverywhere.com/ctl/subscriptions |
| **Google Ads API — Keyword Planner** | **Free** (Basic access = 15k ops/day) | **$0** | **$0** | Real Google historical metrics, BUT volume is **bucketed/ranged** (e.g. 1K-10K) unless the Ads account has active spend. No Etsy. | Free but heavy friction (see notes) | developers.google.com/google-ads/api/docs/keyword-planning |
| **Serper.dev** | 2,500 free queries; **$50/50k credits = $1/1,000** (6-mo validity) | **$0** (within free) | ~$5 of credits, $50 min pack → **~$8/mo** amortized | **Raw Google SERP only — no volume number.** You infer demand from results. | SERP scraping (vendor-managed proxies) | serper.dev + serper.dev/pricing |
| **SearchAPI.io** | 100 free; cheapest **Developer $40/mo** = 10k searches ($4/1k) | **$40/mo** (no smaller plan) | **$40/mo** | Raw SERP + Google Shopping engine; **no volume, no Etsy.** | SERP scraping (vendor-managed) | searchapi.io/pricing |
| **ClearSERP** | Starter **$29/mo**; packs: 500-cr **$19**, 5,000-cr **$89** one-time (~$0.01-0.0145/cr) | ~**$19 one-time** (500-cr pack) or $29/mo | ~**$89 one-time** (5k pack) or Pro $99/mo | **SERP analysis only — no volume, no Etsy.** | SERP scraping | clearserp.com/pricing (credit ranges odd, treat as approximate) |
| **Firecrawl** | Free **1,000 credits/mo**; Hobby **$16/mo** = 5,000 cr. Search = 2 cr/10 results; scrape = 1 cr/page | **$0** (1,000 cr free tier) | 10k cr as search → Standard **$83/mo**; OR 5k pages scrape = Hobby **$16/mo** | **Raw HTML/markdown** from SERP or Etsy pages; **no volume, you parse it.** | **Gray** — compliance pushed to user; respects robots.txt; blocks IG/YT/TikTok, does NOT name Google/Etsy; Etsy/Google ToS is on you | firecrawl.dev/pricing + /terms-of-service |
| **Apify — Etsy scrapers** (community actors) | ~**$10.40/1,000 products** (pay-per-event) + Apify platform | ~$5/mo + platform min | ~$52/mo + platform | **Etsy listing data** (prices, reviews, sales metrics) — closest to Etsy-native demand, but noisy estimate, not search volume | **Risk** — scraping violates Etsy ToS; Apify puts compliance on user | apify.com/store?search=etsy |
| **eRank / EverBee / Alura / EtsyHunt** | N/A | — | — | **No public keyword-data API.** Closed SaaS + Chrome extensions. EtsyHunt's "API" is CRM/customer import only, not keyword data. | Not licensable | vendor sites + comparison reviews |
| **Etsy Open API v3 (official)** | Free | $0 | $0 | Listing/shop data only — **does NOT expose search volume or aggregate demand.** | Legitimate but no demand data | (prior scan, confirmed) |

## Notes on the two "free" options' friction

**Google Ads API** is free but not frictionless for a multi-tenant SaaS:
- Requires an active Google Ads account + OAuth + an approved **developer token**.
- **Basic Access** (15,000 ops/day) is enough for volume and lets you query under *your own* manager account, so end users do NOT each need an Ads account — that part is viable.
- But volume is **ranged/bucketed** (e.g. "1K-10K") unless your account has active ad spend; precise numbers require spending money. This materially weakens the "real number" pitch.
- Exposing that data to external users through your tool likely trips the **Required Minimum Functionality** review and a **Standard Access** upgrade (days-to-weeks approval). Fine as a later cost optimization; poor as a launch dependency.

**Firecrawl / SERP scrapers (Serper, SearchAPI, ClearSERP)** return raw search results, not a search-volume number. They give a demand *signal* (result counts, competition, autocomplete), not the metric ImagePulse displays. Using one means building your own volume estimator on top — more engineering, weaker claim.

## Items I could NOT verify (flagged UNVERIFIED)
- **DataForSEO Labs** per-request pricing (Keyword Ideas / Related Keywords / Bulk Search Volume): pages returned navigation only. Typically cheap (~$0.01-0.05/call) but **UNVERIFIED** — confirm before relying on Labs for related-keyword expansion. The core Google Ads Search Volume price IS verified.
- **ClearSERP** credit-per-pack ranges (e.g. "500-1,000 credits") read oddly; treat exact credit counts as approximate.
- **Apify** exact per-actor pricing varies by actor; $10.40/1,000 is one actor via secondary source, not re-checked on the actor's own Pricing tab.
- No public API for eRank/EverBee/Alura/EtsyHunt confirmed via reviews + absence of developer docs; not disproven by a vendor statement (reasonably confirmed, not absolute).

## RECOMMENDATION

**Primary pick: DataForSEO — Keywords Data API (Google Ads Search Volume endpoint).**
- Real Google search volume + CPC + competition, the exact fields that replace Gemini's fabricated numbers.
- Pay-as-you-go, **$50 one-time minimum deposit** (not a monthly fee) that lasts months at this scale.
- **$0.06 per task, up to 1,000 keywords per task.** A run batches its seed + related + candidate-tag keywords into one task, so **per-run data cost ≈ $0.06 (standard) to $0.09 (live).**
- You would need **>400 runs/month** before crossing the $25 ceiling in standard mode. Comfortably inside budget.
- Legitimate licensed data (no scraping / ToS exposure). Add DataForSEO Labs "Related Keywords" for expansion (verify its price first).
- Weakness: no Etsy-native demand. That's a market-wide gap — no vendor sells clean Etsy search volume.

**Runner-up: Keywords Everywhere API.**
- Same class of real Google data (volume/CPC/competition), dead-simple integration, **~$7/mo** (Bronze $84/yr, 100k credits, 1 credit/keyword) covers both 500 and 5,000 lookups/mo.
- Weaknesses vs DataForSEO: annual prepay, credits expire in 12 months, and related-keyword widgets burn many credits per query (a single rich Google lookup can cost 50+ credits). Choose this only if you want zero pay-as-you-go plumbing.

**On Etsy-native demand:** there is no licensable Etsy keyword API. Use Etsy's official Open API for listing *context* and label any Etsy demand figure as an **estimate with a stated basis** (matches what eRank/EverBee openly do). Avoid Apify Etsy scraping at launch — ToS risk on Etsy, and it yields listing noise, not volume.

**Per-run economics summary:** DataForSEO standard mode = **~$0.06/run** (real Google volume). Precompute/cache the daily trend feed rather than calling per page load, and the data line stays a rounding error against the $0-25/mo ceiling.
