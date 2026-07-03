# ImagePulse Developer Log & Roadmap

This document serves as the project tracker, history, and roadmap for ImagePulse.

---

## 📅 Project History

### Phase 1 & 2: Core Infrastructure & API Integration
- **Frameworks:** Scaffolded a React+Vite frontend and Node+Express backend.
- **Initial Data Source:** Originally attempted to scrape Google Trends via the `google-trends-api` NPM package. This failed in production due to Google Captchas and rate limits.
- **Pivot:** Rebuilt the backend to parse the official Google Trends XML RSS feeds using `rss-parser`, creating a stable and reliable data pipeline.
- **AI Integration:** Integrated the official `@google/genai` SDK to connect with Gemini 2.5 Pro.
- **Database:** Implemented an SQLite database (`imagepulse.db`) to persistently store generated prompts.

### Phase 3: AI Curation & Legal Safety
- **AI Curator:** Since the raw Google Trends feed consists mostly of news, tragedies, and sports, we implemented a Gemini-powered filter. The backend intercepts the raw feed, uses Gemini to filter out irrelevant/unsafe topics, and returns only design-viable niches, while assigning them dynamic categories (e.g., "Vintage", "Gamer").
- **Search-Grounded Trademark Filter:** To address strict trademark/copyright concerns without relying on expensive USPTO APIs, we enabled Gemini's **Google Search Grounding** feature on the backend. Before any image prompts are generated, the AI actively searches the web to verify if a trend is a protected trademark or public figure. If unsafe, it blocks the prompt generation.
- **UI Updates:** Added a History page to view saved prompts and added dynamic, clickable category chips to the Dashboard to filter trends.

### Phase 4: Global Aggregation
- **Multi-Region Fetching:** The official Google Trends RSS feed caps at 20 items per region. To ensure the AI Curator has enough raw data to find viable niches, the backend now concurrently aggregates trends from the US, GB, CA, and AU (yielding up to 80 raw trends per day).

### Phase 5: AI Niche Generator & Optimization Package
- **Pivot to AI Generator:** Removed reliance on the noisy Google Trends RSS feeds entirely. Implemented an interactive AI Niche Generator where users input a seed (e.g., "Gothic") and Gemini generates 10 tailored, profitable, IP-safe micro-niches.
- **Product Type Targeting:** Added a dropdown to select the target product (T-Shirt, Clipart, Tumbler, etc.) to tailor the generated prompts and SEO data.
- **SEO Optimization Package:** When a package is generated, it now returns 3 Midjourney prompts, 13 Etsy SEO tags, and 2 Optimized Product Titles.

### Phase 6: Favorites, Proxies, and API Resilience
- **Favorites System:** Added a user favorites library. Users can now "Heart" generated micro-niches, which saves them directly to the local SQLite database (`favorite_niches` table), allowing them to build a permanent library of winning trends.
- **Saved Packages System:** Extended the favorites concept to full packages. Users can now save a generated package (prompts, tags, titles) directly to the local SQLite database (`favorite_packages` table) and view them in a dedicated "Saved Packages" dashboard tab.
- **Image Proxy Bypass & Removal (incomplete):** Initially built a proxy endpoint (`/api/preview-image`) to bypass client-side adblockers for Pollinations.ai. Due to persistent API load issues (429s) and a desire to streamline the workflow for prompt-saving, image previews were slated for removal in favor of a faster, pure-text UI. **NOTE:** this removal was left incomplete. The `<img>` tag in `TrendCard.jsx` and the `/api/preview-image` route both remained live, so every niche card still fired one Pollinations request on load (the visible cause of slow/blank card images). Fully removed in Phase 7.
- **Tiered API Resilience:** Google's `gemini-2.5-pro` API frequently throws 503 Service Unavailable errors during peak loads. Built a robust tiered fallback system: First attempts Pro, automatically falls back to `gemini-2.5-flash` if Pro fails, and instantly serves a hardcoded offline array of high-quality niches if both APIs fail. This ensures the UI never breaks.

### Phase 7: Cleanup & History Fix (Claude Code handoff from Antigravity)
- **Completed the image-preview removal:** Removed the leftover `<img>` from `TrendCard.jsx` and deleted the `/api/preview-image` proxy route. Niche cards are now pure text and no longer fire a per-card Pollinations request. The favorite (heart) button moved to the card's top-right corner.
- **Fixed the broken History tab:** History was calling a `/api/saved-prompts` endpoint that did not exist (always returned 404) and read from a `prompts` table that stopped being written after Phase 6, so it always showed empty. History is now an **auto-captured log of every generated package** (title, product type, prompts, tags, titles, timestamp), backed by a new `generation_history` table and a `GET /api/history` endpoint (plus `DELETE /api/history/:id`). This is intentionally distinct from the manual "Saved Packages" favorites tab: History records everything you generate, saved or not.
- **Dropped dead dependencies:** Removed `google-trends-api` and `rss-parser` from `server/package.json`. Both were unused since the Phase 5 pivot away from RSS feeds.

### Phase 8: Honest Data + Prompt Controls (Claude Code)
- **Killed the fabricated demand data (direction #1).** Removed the LLM-invented `searchVolume` and `competition` fields entirely: dropped from the `/api/trends` curator prompt (and replaced with an explicit "do NOT invent search volume, demand, popularity, or competition numbers" guardrail), from both server-side fallback arrays (no-key + offline), and from the `TrendCard` UI (the whole metrics row and its now-unused `Activity`/`Search` icon imports). Verified live: `GET /api/trends` now returns only `id`, `title`, `category`, `keywords`. Real, sourced demand data is still a separate open direction (#2); until it exists the app shows none rather than a fake number.
- **Negative-prompt generator (direction #4).** New `POST /api/negative-prompt` endpoint takes free-text style/inspiration/notes (plus the niche title and selected art style for context) and returns a single comma-separated negative prompt tailored to counter that specific context, not a generic exclusion list (pro→flash fallback; no fake canned output). Surfaced as a "Negative Prompt Helper" section in `PromptGenerator` (textarea + button + copyable result), shown for live niches only.
- **Art-style picker (direction, roadmap "Prompt Style Customization").** Added an Art Style dropdown to `PromptGenerator` (Watercolor, Vintage/Retro, Minimalist Vector, Cyberpunk, Line Art, Cartoon/Kawaii, Hand-drawn Sketch, Bold Typography, Boho/Cottagecore, Grunge/Distressed, Art Deco; default "No specific style"). The chosen style is sent to `/api/generate-prompts` as `style` and folded into the generation instructions so every prompt is rendered in that style. Verified live: same niche generated with vs without "Cyberpunk" produced dramatically different prompts (neon/holographic/synthwave + `--ar` flags vs cozy vector). Not persisted to `generation_history` (no schema change).

---

## 🗺️ Roadmap & Future Plans

### Short-Term
- **Firecrawl Integration (Data Ingestion):** Build a data pipeline using a free Firecrawl account (1000 scrapes/month) to scrape specific Etsy bestseller pages or Pinterest boards, feeding real-time market data into the AI Niche Generator.
- ~~**Prompt Style Customization:** Allow the user to select specific art styles (e.g., "Watercolor", "Cyberpunk", "Minimalist Vector") before clicking generate.~~ **Done in Phase 8.**

### Long-Term (Production Viability)
- **Official API Integrations:** Move away from scraping RSS feeds. Integrate with official, paid trend APIs (like DataForSEO or Glimpse) to get thousands of long-tail keywords rather than just the top 20 viral news trends.
- **Official USPTO Integration:** For a fully public release, the AI search-grounded filter should be augmented with an official trademark API (like MarkerAPI or the USPTO Open Data Portal) to guarantee legal safety for users.
- **User Authentication:** Add user accounts so sellers can manage their own private prompt libraries across devices.
- **Cloud Database:** Migrate from local SQLite to a hosted database (like Supabase or PostgreSQL) for deployment.

---

## 🧭 Product Direction & Competitive Notes (added 2026-07-02)

### Reference point: Trend2Design (trend2designs.com)
The idea seed. Sold as a $25 one-time deal (positioned against a $99/mo "real" price) through a Whop checkout, bundled with a free 4-hour Etsy-selling course. The user searches a seed (or clicks a trending chip) and T2D returns a feed of niche ideas with copy-paste AI prompts to paste into a generator and sell.

**Dashboard reality (corrected 2026-07-02 from actual screenshots; the earlier landing-page-only read understated it):**
- It IS interactive: a search bar ("Try 'boho wedding' or 'Halloween cats'") plus "trending today" chips.
- Per search it returns a "Trend snapshot" (a short paragraph on WHY the trend is rising, plus sub-aesthetic chips), then **10 niche ideas, each with a "For:" buyer persona and 3 prompt angles**. Each prompt shows a per-prompt search-volume estimate (e.g. ~18K/mo) and a Copy button; each niche has a Save button. So it does multi-prompt and shows volume, not "one bare prompt."
- What it still lacks: no Etsy SEO tag/title package, no trademark safety gate, no product-type targeting, no per-generator prompt tailoring.
- The ~Xk/mo volume numbers are shown per prompt but the source is undisclosed and almost certainly LLM-estimated, the same fabrication risk as ImagePulse's current fields. This is the real soft spot.
- Full end-to-end workflow (from Red's screenshots): T2D prompt -> paste into Kittl ("Nano Banana 2" model) -> transparent-PNG clipart -> vectorize/upscale/mockup. ImagePulse slots in at the prompt step.
- Testimonials read as manufactured. Treated as marketing theater, not signal.
- Sourced from a working POD YouTube creator (a real earner). Possible future outreach / affiliate contact (free trial for promotion). Speculative, parked.

### Where ImagePulse already leads (honest, narrowed after seeing the T2D dashboard)
- Full SEO package: 13 Etsy tags + 2 optimized titles, product-type tailored. T2D shows 3 prompts per niche too (so prompts alone are not the edge), but has no tag/title package and no product-type targeting.
- A grounded trademark / IP safety gate. T2D has none (only an FAQ hand-wave).
- **Real, honest data is the wedge.** T2D shows volume numbers but they are almost certainly fabricated; committing to real, disclosed-estimate data is the differentiator (see direction #1-2).
- A curation layer that filters the news/sports/tragedy noise raw search feeds are full of.
- Planned edges T2D lacks: per-generator prompt tailoring (#7) and a negative-prompt generator (#4).

### Direction decisions (Red, 2026-07-02)
1. **No fabricated data.** The current `searchVolume` / `competition` fields are invented by Gemini and must be replaced with real numbers or removed. Honesty is a hard requirement and the main differentiator vs Trend2Design's unverifiable "data-backed" claim.
2. **Real data sourcing under evaluation.** Candidates: SERP APIs (ClearSERP is Red's lead idea; also SerpApi, DataForSEO, ScaleSERP), Etsy-native keyword tools (Everbee, eRank, Sale Samurai, Marmalead), and official Google Trends (rising-signal only, not the backbone). Recommended shape: a real data source supplies the demand numbers; Gemini stays as the curation/synthesis layer that names micro-niches and writes prompts, but never invents figures. Open question: how much of the sourcing method to disclose publicly. Working answer: be transparent that the data is real, keep the specific vendor private (normal practice; protects the supply chain).
3. **Generator-agnostic output.** Do not hard-code Midjourney / DALL-E. Prompts should suit any text-to-image tool (Nano Banana, ChatGPT / GPT image, Ideogram, SDXL, Midjourney, etc.). Antigravity narrowed this without reason.
4. **New feature: negative-prompt generator.** A button that produces a negative prompt (things to exclude). The user first enters style / inspiration / notes into a text box, and the negative prompt is generated to counter that specific context rather than a generic exclusion list.
5. **"What's hot today" daily feed, done cost-effectively.** Today the niche generator runs a live Gemini call on every reload, which is not cost-effective. Precompute a daily curated feed on a schedule and cache it, rather than paying per page load. Live/on-demand generation stays available and is a candidate for a paid tier.
6. **Productization is the plan (not yet started).** Auth, hosted DB (Supabase / Postgres), deployment, and pricing all still to work out. Currently a localhost dev tool.
7. **Per-generator prompt selector (Red, 2026-07-02).** Beyond generator-agnostic defaults, add a selector for the target generator (Midjourney, DALL-E / ChatGPT, Nano Banana / Kittl, Ideogram, SDXL, etc.) that tailors the prompt syntax to that tool: Midjourney flags (`--ar`, `--v`, `::` weights), plain-sentence phrasing for DALL-E, explicit "transparent background, 300 dpi" for clipart tools like Kittl/Nano Banana, and a separate negative prompt for SDXL. Pairs with the negative-prompt feature (#4). The Vault has only partial coverage (mostly Leonardo, maybe Nano Banana), so this needs fresh per-generator research into each tool's current prompt conventions, not a Vault lookup.

### Origin note
Started as a tool for Red's own POD work, then reframed as a sellable product after seeing the $25 lifetime Trend2Design offer and judging it beatable.

### Competitor landscape
See [`research/competitor-landscape.md`](research/competitor-landscape.md) for the full scan (24 tools compared; pricing verified against vendor sites where possible, unverified/contested entries flagged). Headline findings:
- Roughly 15-30 tools fit the strict "trend feed to AI prompt" definition; only 4-6 are truly direct matches to Trend2Design/ImagePulse. The broader "trend research + AI generation for POD" category is 40-70+ products.
- No established Etsy research tool (eRank, EverBee, Marmalead, Sale Samurai, EtsyHunt, Alura, Koalanda, Crest) generates AI image prompts. The clones do prompts but lack data/SEO/safety; the generators do images but lack trend data. The full chain (real demand data -> curated micro-niche -> AI prompt -> full SEO package -> trademark safety -> generator-agnostic output) is open white space, and ImagePulse already covers most of it.
- On data: every vendor hides its sourcing, and Etsy's API does not expose real sales, so even the honest tools estimate demand (EverBee self-reports ~80%). Real, disclosed-estimate data beats Trend2Design's undisclosed claim.
