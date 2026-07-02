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
