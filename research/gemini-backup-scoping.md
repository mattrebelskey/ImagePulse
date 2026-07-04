# Gemini reliability backup — scoping (security-debt 1b)

Scoped 2026-07-03 (Session 4), per the brief: SCOPE ONLY, no build. Web-verified against
official pricing/docs pages the same day.

## Reframe (carried in from Red's BYOK decision #2)

Not "find a Gemini backup" — the provider-adapter layer arrives sooner. Two separate needs:

1. **Generation calls** (trends, prompts, negative prompt): run on the USER's key,
   per-provider. Session 4 shipped the adapter shape (`api/_lib/providers.js` registry +
   `byok_keys.provider`); adding a second generation provider is a registry entry + a
   Settings row, no route changes.
2. **Trademark safety check**: the PLATFORM's legal guardrail. Should eventually run on a
   HOUSE key on a second provider, independent of the user's BYOK key, so a Gemini outage
   (or a user's dead key) cannot take the guardrail down with it. Needs web-search
   grounding. This is the actual "backup" question.

## Verified options for the safety check (July 2026)

| Provider | Mechanism | Search cost | Model + token cost | Per-check est. |
|---|---|---|---|---|
| **Anthropic** | `web_search` server tool (GA) | $10 / 1,000 searches | Claude Haiku 4.5: $1/MTok in, $5/MTok out (+ ~500-token tool-use overhead) | **~$0.012–0.014** |
| **OpenAI** | Responses API `web_search` tool | $10 / 1,000 calls | gpt-5.4-nano: $0.20/MTok in, $1.25/MTok out | **~$0.011–0.013** |
| Perplexity | Sonar (searches by default) | $5–12 / 1k requests by context tier | `sonar`: $1/$1 per MTok | ~$0.006–0.008 |
| xAI Grok | Live Search tool | ~$5 / 1k calls — **unverified**, no first-party price page reachable | varies | ~$0.005–0.007 (low confidence) |

Sources: platform.claude.com/docs pricing + web-search tool docs; developers.openai.com
pricing + tools-web-search guide + gpt-5.4-nano model page; docs.perplexity.ai pricing.
xAI figure comes from secondary aggregators only — treat as unconfirmed.

Caveats worth remembering at build time:
- Anthropic web search is org-enabled by default, no tier gate; not available via Bedrock.
- OpenAI web search needs at least default reasoning effort on GPT-5-series models.
- The variable part of both estimates (search-result content tokens) is directional, not
  exact — real cost lands within ~2x of the table.

## Recommendation

**Anthropic Claude Haiku 4.5 + `web_search`** as the house-key safety-check backup:
flat transparent pricing, GA with no gating, ~$12–14/mo worst case at 1,000 checks
(Milestone A volume is far below that). OpenAI is functionally equivalent on cost —
choose on ecosystem preference, not price. Perplexity/xAI savings (a few $/mo) don't
justify a third vendor key for one SAFE/UNSAFE prompt.

## Suggested build shape (when Red says go — likely Session 5+ or Milestone B)

- Safety check tries Gemini (house key, current behavior) → on no-verdict, tries the
  backup provider (house key #2) → still fail-closed 503 if neither yields a verdict.
- New env var for the backup key (e.g. `ANTHROPIC_API_KEY`), server-side only, same
  handling rules as GEMINI_API_KEY.
- Note the Milestone B USPTO local index (research/uspto-api-scoping.md) removes the LLM
  dependency for trademark verdicts entirely — so don't over-invest here; the backup is
  a bridge, not the destination.
- User-facing generation redundancy stays a BYOK/provider-registry question (decision
  #2), NOT part of this backup.
