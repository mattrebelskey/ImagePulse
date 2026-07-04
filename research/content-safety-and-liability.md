# Content safety gate + liability protection (scoped 2026-07-03)

Internal doc. Answers Red's question: "keep me protected if something goes wrong with the
app or someone uses it in a way they shouldn't, or gets back a prompt they shouldn't run."
Two halves: a PRODUCT gate (block bad content) and a LEGAL shell (limit what lands on Red
when something slips through anyway). Nothing here is legal advice; a lawyer pass before
charging money is the standing caveat, and this doc is the brief to hand that lawyer.

## Half 1 — the content-safety gate (ships BEFORE public access)

The app's output is prompt TEXT that users run elsewhere. The image generators' own
filters are a second line of defense, not ours; the app must not knowingly emit prompt
text that describes prohibited content, and must not accept seeds asking for it.

**Where it sits:** server-side, on BOTH sides of every generation. Check the user's input
(seed / niche request) before generating, and check the generated output (prompts, tags,
titles) before returning it. Fail-closed, same pattern as the trademark check: no verdict
obtainable = 503, never "proceed unchecked."

**Blocked categories (Red's two, plus the ones he asked me to fill in):**

1. **Sexual content involving minors — absolute, zero tolerance.** Includes age-ambiguous
   sexualization ("young-looking," school settings + sexual framing). Block, terminate the
   account, preserve records. CSAM is criminal territory, not a moderation judgment call.
2. **Hate / bigoted content:** demeaning or dehumanizing protected groups; hate symbols
   and coded slogans (Etsy prohibits these on the marketplace side too).
3. **Sexualized depictions of real, identifiable people** (celebrity or private): deepfake
   territory; right-of-publicity exposure; overlaps the NY AI-disclosure landscape already
   tracked in POD compliance memory.
4. **Harassment of private individuals:** designs targeting a named non-public person.
5. **Violence:** glorification of graphic violence, incitement, or threats. (Stylized/
   artistic dark themes are fine; a "kill [group/person]" design is not.)
6. **Extremism:** terror-org glorification, recruitment iconography.
7. **Self-harm promotion:** content encouraging suicide/self-injury (recovery/awareness
   designs are fine; the line is promotion).
8. **Illegal-goods promotion where marketplaces ban it:** hard-drug promotion, weapons
   sales framing. Light touch; mostly a marketplace-rules mirror.
9. **IP infringement:** already covered by the trademark gate + the no-copyrighted-
   characters rule; the AUP names it so termination has contractual footing.

Cross-check the final list against Etsy's prohibited-items policy (ingested in the Vault,
June 2026): if Etsy bans selling it, ImagePulse should not help design it.

**Implementation notes:**
- Gemini `safetySettings` are set PER REQUEST by the app, so they stay pinned strict even
  on a user's own BYOK key. Key ownership does not control safety config; the app does.
  Never expose a "safety off" toggle.
- Layered: pinned safety settings + a moderation instruction in the system prompt + an
  explicit category-verdict check (schema-constrained), with the user's text quoted as
  data, not spliced as instructions.
- Same prompt-injection caveat as the trademark gate (security debt #2): a crafted seed
  can try to steer any LLM verdict. Mitigations: strict verdict schema, separate
  moderation call, and category keyword pre-filters that no prompt can talk their way past
  (the CSAM category especially should have a deterministic layer, not LLM-only).
- Log every block (a moderation_log table or run_ledger flag): evidence trail + enables a
  repeat-offender ladder (block -> warn -> suspend -> terminate; category 1 skips straight
  to terminate).
- Lawyer question to ask explicitly: US electronic service providers have NCMEC reporting
  duties for apparent CSAM. Whether a text-prompt REQUEST triggers the duty is exactly the
  kind of call the lawyer makes; the app's job is block + terminate + preserve records.

## Half 2 — the legal shell around Red

1. **Entity separation.** ImagePulse should live under an LLC so app liability can't reach
   personal assets, and ideally not the same LLC as Jointed Carpentry (a lawsuit against
   the app should not be able to touch the carpentry business). Iowa LLC formation is
   cheap; whether new-LLC vs series/DBA is an accountant + lawyer question.
2. **Terms of Service** carrying the standard shields: "as is" warranty disclaimer,
   limitation of liability (capped at fees paid), USER INDEMNIFICATION (the user is
   responsible for what they generate, list, and sell), the Acceptable Use Policy
   (= the category list above, which makes termination contractual), termination rights,
   18+ age requirement, refund policy (Stripe requires it), governing law. Arbitration +
   class-action waiver is a lawyer call.
3. **Privacy policy** (already gated in the landing copy): storing users' encrypted API
   keys creates real obligations, including breach notification. Say only what we do, do
   only what we say.
4. **DMCA designated agent:** register with the Copyright Office (~$6, online) + a
   takedown process in the ToS. Cheap, and it preserves safe-harbor protection if a user
   claims a generated prompt/design infringed.
5. **Honest-marketing posture** (already enforced in the landing copy): no income
   promises, trademark check labeled informational-not-legal-advice everywhere, no
   security claims before the implementation ships. Overclaiming is itself liability.
6. **Insurance, later:** tech E&O / cyber liability (~$500-1,500/yr at micro-SaaS scale)
   once there's revenue to protect. Not launch-blocking.
7. **One real lawyer pass** over ToS + privacy + AUP + the NCMEC question before real
   users pay money. I draft; the lawyer blesses. Budget a few hundred dollars, once.

## Red-team test

An adversarial harness that tries to break this gate is scoped in
`research/content-safety-redteam-plan.md`: a category x attack-technique corpus + a runner
that scores leak rates, run first as a BASELINE against the current (gateless) app for
evidence, then as the gate's acceptance suite once it ships. Hard line carried in that
plan: category 1 is never authored as a realistic fixture, only probed via the
deterministic pre-filter with placeholder tokens.

## Build placement

The gate is a Milestone B item and a hard PRE-PUBLIC gate (it protects Red the moment
strangers can type into the app, which is deploy + public signup, not billing). The legal
pages were already Milestone B step 10; the AUP + DMCA agent + entity question join them.
The moderation plumbing shares the fail-closed pattern already shipped for the trademark
check, so the build cost is an extra structured call + a log table, not a new subsystem.
