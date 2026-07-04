# GTM: YouTube creator program (idea capture, 2026-07-03)

> Readable version for Red: `research/gtm-creator-program.html` (keep the two in sync).

Internal doc. Captures the answer to Red's "how do I connect with YT creators, what does a
free trial look like, how do I market this and what does it cost" question. Nothing here is
committed; it shapes Milestone B (Stripe + plans) so the mechanics are cheap to add later.

## Cost model: assume creators will NOT bring a key (Red's correction, 2026-07-03)

The first draft assumed comped creators would BYOK, making comps nearly free. Red's call:
assume they won't. Asking a creator to go create a Google AI Studio key before they can
even try the app is exactly the friction that kills a trial. So comp accounts run on
RED'S house key ("house-key mode") and every AI call is on his dime.

Per-run cost on the house key (V1 has no in-house image generation; creators still make
images in their own tools, so this is text + data only):
- Gemini text calls (niches, prompts, tags, negative prompt): ~$0.02-0.05
- Grounded trademark check: ~$0.03-0.04
- Real-data lookup (DataForSEO): ~$0.06
- **Total: ~$0.11-0.15 per run**

A creator hammering a Pro-level cap (100 runs/mo) costs $11-15/mo worst case. A
10-creator cohort at full tilt: ~$110-150/mo; realistic usage is a fraction of that
(creators binge for a week, then run sporadically). Cheap enough to stay generous,
real enough that comp accounts keep run caps.

## Recommended shape

1. **Founding-creator comps (a small handful, including the working-POD-YouTuber who
   seeded the idea):** full Pro access on the house key, no expiration ("founding creator"
   status). Real cost: $1-15/mo each depending on how hard they run it. The "I've used
   this for months" authenticity in their videos is worth far more, but the bill scales
   with cohort size, so keep the founding list to 3-5 rather than 10.
2. **General creator outreach (after the founders):** 90-day full Pro pass, house key,
   Pro-level run cap (100/mo). Not a week, not a few hours: creators need time to fold a
   tool into their real workflow before they will show it on camera. Short trials produce
   no videos.
3. **No promotion demanded upfront.** "Here's full access, no strings, tell me what sucks"
   converts; "free month if you promote me" reads transactional and gets ignored. The ask
   comes later, after they like it, and even then it's an offer (below), not a condition.
4. **Affiliate layer (the actual incentive):** creator gets a code; their audience gets an
   extended trial or first-month discount; the creator earns 20-30% recurring for 12 months
   on subscribers they bring. Standard micro-SaaS playbook, costs nothing until revenue
   exists, and turns "please promote me" into "here's a revenue stream for you."

## What it costs

- Comps on the house key: ~$0.11-0.15/run, so roughly $10-50/mo for a realistic active
  cohort, ~$150/mo absolute worst case with 10 creators maxing their caps.
- Affiliate: 20-30% of revenue that would not exist otherwise. No cash outlay.
- Paid ads: not in V1. Creator outreach + affiliate is the whole initial motion.
- The real cost is Red's time writing personalized outreach. That pipeline can be built
  (shortlist -> research the channel -> draft per creator -> Red approves each send; the
  draft-first email rule applies as always).

## Build implications (fold into Milestone B, do not build early)

- **House-key mode:** a per-account flag that routes AI calls to Red's key instead of the
  user's BYOK entry. Not throwaway work: it is the same plumbing the future Studio tier
  (credits included) and any keyless free-trial onboarding will need. Comp accounts keep
  server-side run caps (run_ledger is already planned), and the per-IP rate limiting from
  the security-debt list protects against a leaked comp login.
- `plans`/profiles need a comp/override flag (tier + expiry null = founding comp).
- Stripe promo codes cover trials + discounts; affiliate tracking can start as manual
  promo-code attribution before any affiliate platform is worth its fee.
- Waitlist link on the Studio teaser card doubles as a creator-contact capture point.

## Open questions for Red (later, none urgent)

- Who besides the seed YouTuber goes on the founding shortlist?
- Affiliate percent and duration (20-30% / 12 mo is the conventional band).
- Does the audience-side offer stack with the free tier (e.g., code bumps Free 3 -> 10
  runs for 60 days) or gift Starter outright?
- **The same no-BYOK friction applies to the public Free tier.** If a stranger has to
  create a Google AI Studio key before their first run, most bounce. A keyless Free tier
  on the house key costs Red ~$0.45/user/mo at the full 3-run cap, which is a viable
  acquisition cost, but it needs abuse guardrails. Decide at Milestone B alongside
  run metering.
