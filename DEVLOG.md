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

---

## 🗺️ Roadmap & Future Plans

### Short-Term
- **Firecrawl Integration (Data Ingestion):** Build a data pipeline using a free Firecrawl account (1000 scrapes/month) to scrape specific Etsy bestseller pages or Pinterest boards, feeding real-time market data into the AI Niche Generator.
- **Prompt Style Customization:** Allow the user to select specific art styles (e.g., "Watercolor", "Cyberpunk", "Minimalist Vector") before clicking generate.

### Long-Term (Production Viability)
- **Official API Integrations:** Move away from scraping RSS feeds. Integrate with official, paid trend APIs (like DataForSEO or Glimpse) to get thousands of long-tail keywords rather than just the top 20 viral news trends.
- **Official USPTO Integration:** For a fully public release, the AI search-grounded filter should be augmented with an official trademark API (like MarkerAPI or the USPTO Open Data Portal) to guarantee legal safety for users.
- **User Authentication:** Add user accounts so sellers can manage their own private prompt libraries across devices.
- **Cloud Database:** Migrate from local SQLite to a hosted database (like Supabase or PostgreSQL) for deployment.

---

## 🧭 Product Direction & Competitive Notes (added 2026-07-02)

### Reference point: Trend2Design (trend2designs.com)
The idea seed. A done-for-you daily trend feed sold as a $25 one-time deal (positioned against a $99/mo "real" price) through a Whop checkout, bundled with a free 4-hour Etsy-selling course. The model is passive: they mine "daily search data," hand the user one copy-paste AI prompt per trend, and the user lists the result for sale.
- Push feed, not interactive. No seed input, no niche targeting.
- One prompt per trend. No SEO tags, no titles, no product-type variants.
- "Real search data" is claimed but the source is unnamed (likely Google Trends).
- Generator-agnostic (Midjourney, DALL-E, ChatGPT, Nano Banana).
- Testimonials read as manufactured. Treated as marketing theater, not signal.
- Sourced from a working POD YouTube creator (a real earner). Possible future outreach / affiliate contact (free trial for promotion). Speculative, parked.

### Where ImagePulse already leads
- Full package (3 prompts + 13 Etsy tags + 2 titles), product-type tailored, vs one bare prompt.
- A grounded trademark / IP safety gate (Trend2Design only hand-waves legal risk in an FAQ).
- Interactive seed-to-niche generation.
- A curation layer that filters the news/sports/tragedy noise raw search feeds are full of.

### Direction decisions (Red, 2026-07-02)
1. **No fabricated data.** The current `searchVolume` / `competition` fields are invented by Gemini and must be replaced with real numbers or removed. Honesty is a hard requirement and the main differentiator vs Trend2Design's unverifiable "data-backed" claim.
2. **Real data sourcing under evaluation.** Candidates: SERP APIs (ClearSERP is Red's lead idea; also SerpApi, DataForSEO, ScaleSERP), Etsy-native keyword tools (Everbee, eRank, Sale Samurai, Marmalead), and official Google Trends (rising-signal only, not the backbone). Recommended shape: a real data source supplies the demand numbers; Gemini stays as the curation/synthesis layer that names micro-niches and writes prompts, but never invents figures. Open question: how much of the sourcing method to disclose publicly. Working answer: be transparent that the data is real, keep the specific vendor private (normal practice; protects the supply chain).
3. **Generator-agnostic output.** Do not hard-code Midjourney / DALL-E. Prompts should suit any text-to-image tool (Nano Banana, ChatGPT / GPT image, Ideogram, SDXL, Midjourney, etc.). Antigravity narrowed this without reason.
4. **New feature: negative-prompt generator.** A button that produces a negative prompt (things to exclude). The user first enters style / inspiration / notes into a text box, and the negative prompt is generated to counter that specific context rather than a generic exclusion list.
5. **"What's hot today" daily feed, done cost-effectively.** Today the niche generator runs a live Gemini call on every reload, which is not cost-effective. Precompute a daily curated feed on a schedule and cache it, rather than paying per page load. Live/on-demand generation stays available and is a candidate for a paid tier.
6. **Productization is the plan (not yet started).** Auth, hosted DB (Supabase / Postgres), deployment, and pricing all still to work out. Currently a localhost dev tool.

### Origin note
Started as a tool for Red's own POD work, then reframed as a sellable product after seeing the $25 lifetime Trend2Design offer and judging it beatable.

### Competitor landscape
See [`research/competitor-landscape.md`](research/competitor-landscape.md) for the full scan (24 tools compared; pricing verified against vendor sites where possible, unverified/contested entries flagged). Headline findings:
- Roughly 15-30 tools fit the strict "trend feed to AI prompt" definition; only 4-6 are truly direct matches to Trend2Design/ImagePulse. The broader "trend research + AI generation for POD" category is 40-70+ products.
- No established Etsy research tool (eRank, EverBee, Marmalead, Sale Samurai, EtsyHunt, Alura, Koalanda, Crest) generates AI image prompts. The clones do prompts but lack data/SEO/safety; the generators do images but lack trend data. The full chain (real demand data -> curated micro-niche -> AI prompt -> full SEO package -> trademark safety -> generator-agnostic output) is open white space, and ImagePulse already covers most of it.
- On data: every vendor hides its sourcing, and Etsy's API does not expose real sales, so even the honest tools estimate demand (EverBee self-reports ~80%). Real, disclosed-estimate data beats Trend2Design's undisclosed claim.
