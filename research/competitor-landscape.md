# ImagePulse Competitor Landscape

_Compiled 2026-07-02. Method: 3 parallel research agents (bucketed by tool type) plus orchestrator re-verification of the highest-stakes prices against vendor sites. Prices are current as of 2026-07-01/02; this category moves fast, so treat any figure over a few weeks old as stale. Every price is tagged with a verification status. "Verified (re-checked)" means the orchestrator personally confirmed it on the vendor's own site; "Verified (agent)" means a research agent fetched it from the vendor's own pricing page; "Unverified" / "Contested" means it could not be confirmed on a primary source._

---

## Executive summary

**How many tools exist?** Roughly **15-30 tools** fit the strict definition of Trend2Design/ImagePulse (a daily or frequent trend feed paired with a ready-to-use AI image prompt for POD sellers). Only **4-6 are truly direct** matches where the prompt-per-trend is the core product. Widen the lens to the whole "trend research + AI generation for POD" category (keyword tools, design generators, listing writers) and it is **40-70+ distinct products, climbing past 100** if you count every Gumroad/Whop one-person wrapper and static prompt-pack. This report logs ~25 named tools with enough detail to compare.

**The single most important finding:** across every established Etsy research tool reviewed (eRank, EverBee, Marmalead, Sale Samurai, EtsyHunt/EHunt, Alura, Koalanda, Crest), **none generate AI image prompts.** They do data and SEO. Conversely, the direct trend-to-prompt clones do prompts but have thin or no SEO output, no trademark safety, and undisclosed data. And the pure AI generators (Kittl, Ideogram, etc.) do images with no trend data or SEO at all. **No competitor spans the full chain: real demand data → curated micro-niche → AI prompt → full SEO package (13 tags + titles) → trademark safety → generator-agnostic output.** That gap is ImagePulse's wedge.

**On data sourcing (relevant to the "real data" decision):** every vendor treats its data pipeline as a trade secret. The direct clones (and ImagePulse today) disclose nothing real. The honest Etsy tools admit the hard truth: **Etsy does not expose real sales via its API, so competitor demand is *estimated*** (EverBee self-reports ~80% accuracy). There is no clean public "true Etsy search volume" feed. Real data is achievable and a differentiator, but the industry ceiling is disclosed estimation, not ground truth.

---

## 1. Direct competitors (trend feed -> AI prompt)

These are the true head-to-head set. All are small, new, or thin.

| Tool | URL | What it is | Pricing | Data source | Outputs | Price status |
|---|---|---|---|---|---|---|
| **Trend2Design** | trend2designs.com | Daily trending niches, one copy-paste prompt each; the idea seed | **$25 one-time** (claims it reverts to $99/mo) | "daily search data", undisclosed | Prompts only | Verified (own scrape) |
| **PODAutomation** | podautomation.net | Freemium daily POD trends + AI prompts across 6+ marketplaces | Free; **Pro $3.99/mo** | "multiple data sources" + weighting algorithm, undisclosed | Trend list, prompts, copyable tags, CSV | Verified (agent) |
| **InspoMode** | inspomode.com | Hourly social/search trend scans, style-matched prompts | **Free during beta** (waitlist full); launch price TBD | social + search scans, undisclosed | Prompts | Verified (agent) |
| **Mockup Maestro** (AI POD Tools) | mockupmaestro.com | Keyword in -> 20 micro-niches + prompts; plus an SEO listing writer | Not disclosed | "trained on POD data", undisclosed | 20 niches+prompts; SEO titles/tags/descriptions | **Unverified** |

**Notes / false leads:** trendspods.com (unrelated retail store), trend-pod.com (dead domain), FuelPod "Trend Analyzer" (fulfillment service, the analyzer is a blog concept, not a product). Whop/Gumroad in-app marketplaces are under-indexed by search engines; a logged-in browse would likely surface a few more direct clones and would raise the low end of the 15-30 estimate.

---

## 2. Broader suites with a trend/research module (partial matches)

| Tool | URL | What it is | Pricing | Data source | AI image prompts? | Price status |
|---|---|---|---|---|---|---|
| **Vaybel** | vaybel.com | Brand-matched trend feed inside a full AI design/mockup/listing suite | Starter **$19/mo** (200 credits); Growth **$79/mo** (1,000); Enterprise custom | undisclosed | Design generation (not a prompt-per-trend product) | Verified (agent) |
| **PodCS** | podcs.com | Free-leaning POD keyword+trend research (Merch/Redbubble/Etsy/eBay) + "PodSpy" social trend monitor | Free; **Pro ~$19.90/mo** (site shows an odd "$19.80/yr" annual figure) | **Real marketplace buyer search terms** (explicitly stated) | No | **Contested** (annual < monthly display quirk) |
| **InsightFactory.app** | insightfactory.app | Etsy trend/keyword/competitor research + AI "Magic Listing" writer | Free (15 credits); Starter **$19.99/mo** ($199.99/yr); Essential **$36.89/mo**; Empire **$289.84/yr** | Etsy marketplace data (best-seller tags/titles) | No (text listings only) | Verified (agent) |

> Naming trap: **insightfactory.app** (the Etsy tool above) is a different company from **insightfactory.ai** (an unrelated enterprise data platform). Cite the `.app`.

---

## 3. Established Etsy / POD keyword & research SaaS

The mature, well-funded adjacent set. Strong data and SEO, **zero AI image-prompt generation.**

| Tool | URL | Pricing | Data source | AI image prompts? | Price status |
|---|---|---|---|---|---|
| **eRank** | erank.com | Free; Basic **$5.99** ($65.99/yr); Pro **$9.99** ($94.99/yr); Expert **$29.99** ($269.99/yr) | Etsy API (shop data) + estimation | No (AI Listing Helper = text only) | **Verified (re-checked)** |
| **EverBee** | everbee.io | Free (Hobby); Growth **$29.99/mo** ($19.99 annual, $239/yr); Business **$99/mo** ($69 annual, $828/yr) | Proprietary estimation (Etsy hides sales); ~80% self-reported accuracy | No | **Verified (re-checked)** |
| **Marmalead** | marmalead.com | **$19/mo**; $53/qtr; $190/yr; **$300 lifetime**; no free tier | Etsy API integration (stated) | No (AI = description critique, FAQ) | Verified (agent) |
| **Sale Samurai** | salesamurai.io | **$9.99/mo**; $99.99/yr; 3-day trial | "Real Etsy search volume" (method undisclosed) | No | Verified (agent) |
| **EtsyHunt / EHunt** | ehunt.ai | Free; Basic **$9.99** ($7.99 annual); Pro **$19.99** ($15.99 annual); Elite **$59.99** ($29.99 annual); Team $79.99 | Etsy API (own disclaimer) | **Partial** (AI Pattern Extractor + Mockup Generator: pattern transfer onto mockups, not text-to-image prompts) | Verified (agent) |
| **Alura** | alura.io | Free; Basic **$7.99**; Growth **$14.99**; Pro **$29.99** (annual "up to 50% off", exact $ not itemized) | undisclosed | No (AI = text; A/B tests existing images) | Verified monthly (agent); annual unverified |
| **Koalanda** | koalanda.pro | Free tier confirmed; paid $ not captured | "Real Etsy API data" (self-reported) | No | **Unverified** (paid tiers) |
| **Crest / Crestfull** | crestfull.com (getcrest.app erroring) | Free; Pro **$12.99/mo** (a secondary source says $9.99, no free tier) | undisclosed | No AI features | **Contested** |

**Excluded (category mismatch), so you don't chase them:**
- **Koala Inspector** (koala-apps.io) is a **Shopify** spy tool, not Etsy. Not a competitor. (Koalanda, above, is the Etsy one.)
- **PodBase** (podbase.com) is a **fulfillment/supplier** platform (phone cases, etc.), not research or generation. Its own copy confirms "does NOT offer keyword research, SEO, or AI image generation."
- **PODturbo** appears **defunct** (site framed "2019-2024").

---

## 4. AI design / prompt / listing generators

Images and copy, but no trend/demand data (unless noted). ImagePulse would use one of these downstream (paste the prompt in), not compete head-on.

| Tool | URL | Pricing | Trend data? | Outputs | Price status |
|---|---|---|---|---|---|
| **Kittl** | kittl.com | Free; Pro **$15/mo** ($120/yr); Expert **$30/mo** ($288/yr); Business custom | No | Vector/raster designs, mockups | Unverified (secondary; site JS-blocked) |
| **Creative Fabrica (Spark)** | creativefabrica.com/spark | ~**$9/mo** or ~**$47/yr** (coin-based) | No (marketplace surfaces bestsellers) | AI images, patterns, SVG | Unverified (secondary) |
| **Ideogram** | ideogram.ai | Contested: ~$7-$20/mo range across sources | No | Images (strong in-image text) | **Unverified** (site 403'd) |
| **Microsoft Designer** | designer.microsoft.com | Free (15 boosts/day); more via M365 from $6.99/mo | No | Designs, some copy | Free confirmed; detail unverified |
| **PromptBase** | promptbase.com | Prompts **$1.99-$9.99**; Select **$14-$19/mo** | No | Prompt text (a marketplace) | Mostly secondary |
| **ListifyAI** | listifyai.net | Free (3/mo); Starter **$7-9/mo**; Pro **$23/mo**; Agency **$63/mo** | Partial (some keyword data) | Full Etsy listings (photo->listing) | Verified (agent) |
| **Flying Upload** | flyingupload.com | Pro **€329/yr**; Advanced €168/yr; KDP €129/yr; bundle €495/yr | **Yes** (seller trend stats) | Research + trademark + bulk upload (not AI prompts) | Verified (agent; promo muddled) |
| **Roketfy** | roketfy.com | Hobby **$29.99/mo**; Pro **$49.99/mo** | Implied (live Etsy performance) | Listings | Unverified (single source) |
| **EtsyGenerator** | etsygenerator.com | Basic **$10/mo**; Pro **$25/mo** | No | Descriptions, tags | Unverified (single source) |

Long tail (surfaced but not detailed / pricing unverified): **Pixelcut**, **Plykit.ai**, **MyDesigns**, **Vaybel** (also in section 2), plus general-purpose tools POD sellers use but that are not POD-specific (Midjourney, DALL-E, ChatGPT, Canva, Adobe Firefly, Leonardo.ai, Vexels, Placeit, Dynamic Mockups).

---

## 5. Data-sourcing patterns (the part that matters for the "real data" decision)

Three sourcing models exist in the market:

1. **Undisclosed / likely LLM or Google Trends.** The direct clones (Trend2Design, PODAutomation, InspoMode) and **ImagePulse today** (which fabricates `searchVolume`/`competition` via Gemini). All market "real search data" but none disclose a source. This is the bluff.
2. **Real marketplace search-term data.** PodCS explicitly claims buyer search terms from Merch/Etsy/Redbubble/eBay; Sale Samurai claims "real Etsy search volume." Method (API vs scraping) undisclosed.
3. **Etsy API + proprietary estimation.** eRank, EverBee, Marmalead. The honest admission here is the key market fact: **Etsy's API does not expose competitor sales, so every one of these tools *estimates* demand** (EverBee self-reports ~80%). There is no clean public ground-truth Etsy volume feed.

**Implication for ImagePulse.** Being genuinely data-backed is achievable and is the sharpest differentiator against the clones, but know the ceiling: even the mature tools estimate. The honest, buildable path:
- **Google/SERP demand signal for the number** — a keyword-volume API (DataForSEO) or a SERP API (ClearSERP, SerpApi) for real volume + related-keyword expansion + freshness.
- **Etsy-native context** for what actually sells on the platform (via Etsy API for what it does expose, plus your own estimation, clearly labeled as an estimate with a confidence level).
- **Gemini only as the synthesis layer** that names micro-niches and writes prompts, never as the source of a number.

Simply labeling figures as *estimates with a stated basis* already beats Trend2Design's undisclosed hand-wave. You do not have to name your vendor publicly; "real search and marketplace demand data" is honest and standard, and keeps the supply chain private.

---

## 6. Gaps and opportunities for ImagePulse

1. **The full-chain white space.** No competitor spans real demand data -> curated trending micro-niche -> AI image prompt -> full SEO package (13 tags + 2 titles) -> trademark safety gate -> generator-agnostic prompt (+ the planned negative-prompt feature). Etsy SaaS = data+SEO, no prompts. Clones = prompts, no data/SEO/safety. Generators = images, no trend/data. ImagePulse already covers more of that chain than anyone; adding real data closes it.
2. **Trademark safety is nearly unique.** Only ImagePulse and Flying Upload (trademark screening) touch IP risk. The clones ignore it. This is a real, defensible feature for nervous sellers.
3. **Pricing wedge.** Direct clones are $0-$4/mo or a $25 lifetime hook; Etsy SaaS is $6-$30/mo (data, no prompts); generators $9-$30/mo (images, no data). ImagePulse can slot in as an affordable "data + prompt + SEO" layer, and the **$25-lifetime launch hook** (T2D's move) is a proven acquisition play, with a subscription tier for the daily real-data feed. Note the daily feed should be **precomputed/cached**, not a live LLM call per page load (the current cost trap).
4. **The one to watch: EtsyHunt/EHunt.** Its AI Pattern Extractor + Mockup Generator is the closest anyone gets to ImagePulse's image space. It is pattern transfer today, not text-to-image prompts, but it is the most likely to expand into the wedge.
5. **Trust as a moat.** Trend2Design carries a low-trust signal (newly registered domain, flagged by an automated scam-scoring site; unconfirmed but notable). The clone space is hype-heavy with manufactured testimonials. Honest, cited, real data is a positioning differentiator, not just an ethics choice.
6. **Go-to-market.** This space is won on creator promotion (you found T2D through a YouTuber who is actually earning). The parked idea of offering that creator a free trial for a shout-out fits exactly how buyers discover these tools.

---

## Verification ledger and caveats

- **Personally re-verified against vendor site (highest confidence):** Trend2Design ($25/$99), eRank (all tiers), EverBee (all tiers).
- **Verified by a research agent on the vendor's own pricing page:** PODAutomation, InspoMode (beta-free), Vaybel, InsightFactory.app, Marmalead, Sale Samurai, EtsyHunt/EHunt, Alura (monthly), PodCS (with the annual-display anomaly), ListifyAI, Flying Upload.
- **Unverified or contested (do not quote externally without a fresh check):** Mockup Maestro (no price), Koalanda (paid tiers), Crest/Crestfull ($9.99 vs $12.99), Kittl (secondary), Creative Fabrica (secondary), Ideogram (site 403'd), Roketfy, EtsyGenerator, Pixelcut, Plykit, MyDesigns, Microsoft Designer detail, Alura annual.
- **Naming corrections applied:** insightfactory.app (not .ai); Koalanda (Etsy) vs Koala Inspector (Shopify); getcrest.co -> getcrest.app/crestfull.com; PODturbo defunct; PodBase = fulfillment.
- **Known coverage gap:** Whop and Gumroad in-app marketplaces are under-indexed by public search; a logged-in browse would likely surface additional direct clones and raise the low end of the 15-30 count. Static "prompt pack" PDFs (hundreds on Gumroad/Etsy) were excluded as out of scope (static content, not tools).
- **Cost note:** 3 research agents (Sonnet) + orchestrator re-verification of 3 vendors. No stronger-model escalation needed.
