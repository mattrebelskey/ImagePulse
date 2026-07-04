# Pricing analysis (2026-07-03) — dollar amounts are NOT locked

Internal doc. Red's correction (2026-07-03): the pricing STRUCTURE is decided (BYOK every
tier, X runs/mo + credit top-ups, no in-house gen in V1, tiers publicly visible). The
DOLLAR AMOUNTS are placeholders. This doc turns the placeholders into a defensible launch
hypothesis. Final sign-off is Red's, at Milestone B step 8 (Stripe setup) at the latest.

## Market anchors (all verified in `research/competitor-landscape.md`)

| Band | Who | Price |
|---|---|---|
| Direct clones (prompts, fake/undisclosed data) | PODAutomation $3.99/mo; Trend2Design $25 one-time → claimed $99/mo | $0-4/mo real money |
| Etsy research SaaS (real-ish data, NO prompts) | Sale Samurai $9.99; eRank $5.99/$9.99/$29.99; EtsyHunt $9.99/$19.99; Alura $7.99/$14.99/$29.99; Marmalead $19; EverBee $29.99 ($19.99 annual) | clusters at **$9.99 and $19.99** |
| Listing-AI / suite tools | ListifyAI $7-9/$23; InsightFactory $19.99+; Vaybel $19 (200 credits)/$79 | $19-79 |

**Read the anchor table as PRICE FAMILIARITY, not feature parity.** The research-SaaS names
(eRank, Sale Samurai, Alura, Marmalead, EverBee) are keyword/SEO/data tools — none generate
text-to-image PROMPTS. The one partial exception is **EtsyHunt** (AI Pattern Extractor +
Mockup Generator: pattern transfer onto mockups, not prompt generation), which the landscape
scan flags as "the one to watch" — the competitor most likely to grow into our wedge. The
direct clones (T2D, PODAutomation) do prompts but no real SEO package, no trademark safety,
and undisclosed data (PODAutomation offers copyable tags, which is light SEO, not a 13-tag +
titles package). So the familiar per-month price for an Etsy research tool clusters at
**$9.99 and $19.99** — note that's the AGGREGATE band, not a per-tool fact: Alura runs
$7.99/$14.99/$29.99 and EverBee is $29.99/mo ($19.99 annual). The point stands: it's what a
seller is CONDITIONED to pay, not a list of things that do what ImagePulse does. Per `competitor-landscape.md`: no competitor spans the full
chain (real data → micro-niche → prompt → 13 tags + titles → trademark flag → any generator).

ImagePulse spans two bands (research data + prompts + SEO + trademark flag), which is the
argument for pricing at the TOP of the research band, not above it: the brand is unproven,
so we take the familiar price and win on what it includes. The deliberate consequence is that
V1 delivers MORE than its price implies — a land-and-expand posture (underprice vs value to
buy trust, raise for new cohorts once the real-data + trademark features are proven). T2D's
claimed $99/mo reverts from a $25 one-time price (per the landscape scan). Best read: it's
an urgency decoy for the lifetime hook, not a real market anchor — treat it as a marketing
foil, not evidence sellers pay $99/mo for prompts.

## Cost reality (why margin doesn't drive this)

Fixed floor ~$45-50/mo (Vercel Pro + Supabase Pro). Under BYOK the marginal cost of a run
is ~$0.06 (DataForSEO lookup); everything else bills to the user's key. Six Starter subs
cover the floor. Price is a positioning decision, not a cost-recovery one.

## Recommendation (launch hypothesis)

| Tier | Price | Runs/mo | Effective $/run | Anchor logic |
|---|---|---|---|---|
| Free | $0 | 3 | - | top of funnel; enough to feel the full workflow |
| Starter | **$9/mo** | 25 | $0.36 | sits on the $9.99 cluster (eRank Pro, Sale Samurai, EtsyHunt Basic), a hair under |
| Pro | **$19/mo** | 100 | $0.19 | sits on the $19.99 cluster (Marmalead, EtsyHunt Pro, Vaybel Starter); "most popular" |
| Studio | TBA later | TBA | - | price only when generator costs are known; Vaybel $19/200-credits is the closest comp |

**Top-up: 20 runs for $5** ($0.25/run). Deliberately between Starter's $0.36 and Pro's
$0.19 effective rates: a Starter user can bridge a good week, but a heavy user is always
better off upgrading. (The earlier 25-for-$5 placeholder was $0.20/run, which undercut the
ladder; don't use it.)

**Why not lower:** $3.99-land (PODAutomation) reads as a toy and can't fund the real-data
promise. **Why not higher:** above $19.99 collides with EverBee/eRank-Expert expectations
without their brand trust; $29+ is Studio's territory once generation is included. T2D's
claimed $99/mo stays useful as the marketing foil, not as our price.

## Change strategy

Launch pricing is a hypothesis, not a tattoo. Stripe makes repricing for NEW customers
cheap; grandfather early subscribers at their price (goodwill, and churn insurance).
Scheduled reality checks: after the founding-creator cohort has used it (their read on
"what would you pay" beats any analysis), and again at ~50 paying users. Annual plans
(the standard ~2-months-free discount) are worth adding at Stripe time, not before.

## Open for Red

1. Sign off / adjust the three numbers ($0/$9/$19) and the run caps (3/25/100).
2. Top-up: 20 runs/$5, or pick different psychology (e.g., 10/$3 impulse-sized).
3. Charm pricing or flat ($9 vs $9.99): flat reads more honest, charm converts marginally
   better; recommendation is flat, consistent with the no-tricks brand.
