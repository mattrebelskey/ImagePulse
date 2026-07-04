# ImagePulse landing page copy (v1 draft, 2026-07-03)

Source of truth for the public landing page (Milestone B step 9). The HTML preview at
`marketing/landing-preview.html` mirrors this file exactly. All page copy is OUTWARD:
no em-dashes anywhere, no invented social proof, claims gated as listed below.

## Publish gates (clear these before this page goes live)

1. **"Real search data" claims** gate on DataForSEO being wired (Milestone B step 7).
   Until then, use the [PRE-DATA] variant lines below.
2. **Prices are placeholders** (the $0/$9/$19 + 3/25/100-run tiers seeded in the plans
   table). Red re-prices at Milestone B; update here + the HTML + Stripe together.
3. **No user counts, testimonials, or "trusted by" lines until real.** A slot is marked.
4. Every mention of the trademark check keeps "not legal advice" nearby. The check is
   heuristic until the USPTO bulk-index gate ships; do not use the word "verified."
5. Terms + Privacy links must resolve before launch (Milestone B step 10).
6. "Encrypted at rest and never logged" (key handling) gates on Session 4 BYOK shipping
   exactly as described. Do not publish the security claim before the implementation.

---

## Hero

**Eyebrow:** POD trend research, rebuilt on real data
[PRE-DATA eyebrow variant: "POD trend research, no fabricated numbers"]

**H1:** Find niches with real demand. Get the prompts to fill them.
[PRE-DATA H1: use "Stop guessing what sells." until the data gate clears]

**Subhead:** ImagePulse turns one seed idea into ranked micro-niches, then builds the
whole package: image prompts in your art style, 13 Etsy-ready tags, title options, and
a trademark check with the evidence shown (informational, not legal advice). Real
search data, not made-up numbers.

[PRE-DATA subhead variant: "...a trademark check with the evidence shown (informational,
not legal advice). Demand labeled honestly: real data where we have it, clearly marked
estimates where we don't."]

**Primary CTA:** Start free
**Secondary CTA:** See pricing
**Trust line:** 3 free runs every month. No credit card. Bring your own AI key and
typically pay cents per run, never a markup.

**H1 alternates (pick or park):**
- Stop guessing what sells. *(safe pre-data)*
- Real trend data in. Ready-to-use prompts out. *(GATED: real-data claim, post-gate only)*
- The distance from "idea" to "listed" just got shorter. *(safe pre-data)*

---

## Video slot (directly below the hero)

- **Content:** 30-60 second screen capture of one real run: type a seed, watch the
  micro-niches rank, open the package, copy a prompt. No talking head required; captions
  and music carry it.
- **On-page caption:** Watch a full run before you sign up for anything.
- **Production:** Red is evaluating Hyperframes (Sabrina Ramonov has a tutorial on it;
  not yet ingested in the Vault. Nate Herk's ingested courses mention Hyperframes if
  background is needed).
- The video is NOT a publish gate: ship the page without it if it isn't ready, the slot
  degrades to nothing.

---

## Problem section

**H2:** Most trend tools guess. Your shop can't afford it.

**Card 1 - Invented numbers.** Plenty of tools show "search volume" scores that an AI made
up on the spot. You end up betting real listing fees on fiction.

**Card 2 - Trademark landmines.** One phrase with a live trademark behind it can cost you
the listing or the whole shop. Most tools never even check.

**Card 3 - The blank prompt box.** Even with a good niche picked, you still stare at an
empty prompt field. The gap between "good niche" and "good image" is where most sellers
stall out.

---

## How it works

**H2:** One seed in. A finished package out.

**Step 1 - Seed it.** Type one idea. "Cottagecore cats." "Retro camping." Anything.

**Step 2 - Pick your lane.** Get 10 micro-niches built around your seed, ranked with real
keyword data so you can see demand before you commit.
[PRE-DATA variant: "...with demand labeled honestly: real data where we have it, clearly
marked estimates where we don't."]

**Step 3 - Grab the package.** One click builds the whole kit: 3 detailed image prompts in
the art style you choose, a tailored negative prompt, 13 Etsy-ready tags, title options,
and a trademark check with the reasoning shown (informational, not legal advice).

**Wrap line:** From there it's paste, generate, list. Every package auto-saves to your
History, and favorites keep the best niches one click away.

---

## Differentiators

**H2:** Built different where it counts.

**1 - Real numbers, or labeled estimates.** If a number on your screen can't be traced to
real search data, we mark it as an estimate. We would rather show you less data than
made-up data.

**2 - A trademark check with receipts.** Risky phrases get flagged with the evidence shown,
so you can judge with open eyes before you invest hours in a design. It's informational,
not legal advice, and it beats finding out from a takedown notice.

**3 - Bring your own key. Pay actual cost.** Your Google Gemini key powers the AI. You pay
Google's real prices, typically cents per run, with zero markup from us. Your key is
encrypted at rest and never logged.

**4 - Every feature, every tier.** Tiers change how many runs you get, never which features
you get. The free tier runs the exact same workflow as Pro.

**(Social proof slot: empty until real. No fabricated counts or testimonials.)**

---

## Pricing (public grid, shown pre- and post-paywall)

**H2:** Simple tiers. Every feature, every tier.
**Sub:** Pick by volume, top up when a good week hits. Full workflow on all of them.

| | Free | Starter | Pro | Studio (coming later) |
|---|---|---|---|---|
| Price | $0 | $9/mo | $19/mo | TBA |
| Runs per month | 3 | 25 | 100 | TBA |
| Full workflow (niches, prompts, tags, titles, trademark check) | Yes | Yes | Yes | Yes |
| Niche rankings on real search data (estimates labeled) | Yes | Yes | Yes | Yes |
| Art style + negative prompt generator | Yes | Yes | Yes | Yes |
| Favorites, saved packages, history | Yes | Yes | Yes | Yes |
| Bring your own Gemini key | Yes | Yes | Yes | Yes |
| Buy extra runs anytime | Yes | Yes | Yes | Yes |
| Built-in image generation (credits included, multiple generators) | - | - | - | Yes |

Pro carries the "Most popular" badge. Studio renders as a muted teaser card with a
waitlist link, not a buy button.

**Top-up line:** Out of runs? Add 20 more for $5, on any tier, no upgrade required.
*(placeholder price; rationale in research/pricing-analysis.md)*

**Run definition (footnote):** One run takes a niche from idea to a complete package:
micro-niches, prompts, tags, titles, and the trademark check, all included.

---

## FAQ

**What counts as a run?**
One full trip through the workflow: your seed becomes ranked micro-niches, and one niche
becomes a complete package (image prompts, negative prompt, 13 tags, titles, trademark
check). Browsing your history and favorites never costs runs.

**What does "bring your own key" mean, and what does it cost me?**
You connect your own Google Gemini API key (free to create at Google AI Studio). The AI
calls bill to you at Google's actual prices, which usually works out to cents per run.
We never see a markup on your AI usage, and your key is stored encrypted and never logged.

**Is the trademark check legal advice?**
No. It flags risky phrases and shows you the reasoning so you can make an informed call,
and it can miss things. For anything high-stakes, talk to a trademark attorney.

**Which image generators do the prompts work with?**
Any generator you can type a prompt into: Midjourney, DALL-E, Ideogram, Nano Banana, and
the rest. Per-generator prompt tailoring is on the roadmap.

**Which marketplaces is this built for?**
Etsy first: 13-tag sets, Etsy-length titles, Etsy-shaped SEO. The niche research and
prompts carry straight over to Amazon Merch or Redbubble; you'll adapt the tags and
keywords to each platform's own format.

**Do unused runs roll over?**
Monthly runs reset each billing cycle. Purchased top-up runs never expire.

**Can I cancel anytime?**
Yes. You keep access through the end of the period you paid for.

---

## Roadmap strip

**H2:** On the bench next.

- **Listing builder.** Build the Etsy listing itself: edit every field in place, copy
  per field, and track it from draft to live.
- **Per-generator prompts.** The same package, tuned to Midjourney, DALL-E, or Ideogram
  syntax with one dropdown.
- **Studio tier.** Generate images inside ImagePulse with credits included, across
  multiple generators.
- **Store connectors.** Push finished products to Printify with your own token.

---

## Footer

ImagePulse · Terms · Privacy · support@ *(email TBD)*
Line: "Made for POD sellers who are tired of guessing."

---

## Assumptions logged (Red to confirm or correct, none block the draft)

- Monthly runs reset, purchased top-ups never expire (matches the credit-top-up decision;
  exact policy is Red's call at Stripe time).
- Top-up placeholder: 20 runs / $5 ($0.25/run, between Starter's and Pro's effective
  rates so upgrading always wins for heavy users). Full pricing rationale + open calls:
  `research/pricing-analysis.md`. Dollar amounts everywhere are placeholders until Red
  signs off (Milestone B step 8 at the latest).
- Name stays ImagePulse; no domain chosen yet (Milestone B step 11).
- Voice: plain, seller-to-seller, zero hype-speak. Matches the "no fabricated data"
  positioning; the honesty IS the brand.
- **Look & feel: design pass pending.** The current theme is inherited from the app's
  Antigravity-era glassmorphism (Red: "I don't dislike it, but it can be better"). Before
  launch, a deliberate design pass drawing on the Vault's design-inspiration material.
  The preview HTML now has a notes box under every section + a "Copy notes for Claude"
  button; Red's wording and look adjustments flow back through those.
