# Handoff — S2-6: Failure fixture

**Cody (Coder) · claude-sonnet-5 · S2-6**

Story owner per `AMS/SPRINTS/sprint-2.md` is Sandy (`claude-haiku-4-5`) — continuing as Cody per
Luke's direction to work through S2-3 through S2-7 in one session.

Real API spend: **$0**. Fixtures are hand-written JSON records written directly to KV; no
Anthropic API calls.

---

## What was attempted and the outcome

Built `worker/fixtures/seed.mjs`: a repeatable script that writes 5 fixture records straight to
the `RESULTS` KV namespace (reading the namespace id from `wrangler.jsonc` so it stays in sync),
each at a fixed, memorable id rather than a random one, since these are meant to be stable demo
permalinks:

- `fixture-refusal` — outcome `refusal`
- `fixture-tool-error` — outcome `tool_error` (error_code `unavailable`, a non-`max_uses_exceeded`
  code, since that's the case S1-2's old `max_uses: 1` forcing trick used to cover before the
  reclassification broke it)
- `fixture-truncated` — outcome `truncated`
- `fixture-no-report` — outcome `no_report`
- `fixture-search-cap-hit` — outcome `ok`, `search_cap_hit: true`, with a real (fabricated but
  properly formatted) `# Fact-Check Report` and two citations, so the Sources list and the
  search-budget note both have something real to render against

All claim texts are prefixed "S2-6 fixture — ... not a real fact-check" so nobody mistakes a
seeded fixture for genuine output if they land on one directly.

Went with seeded KV records rather than a `?fixture=` query-param hook (S2-6's scope allowed
either) — simpler, no risk of a debug hook ever needing to be "disabled in production" since
there's no code path to disable, and the fixtures are reusable indefinitely for S2-8's demo
runner without re-seeding.

**Verified all 5 permalinks in-browser**, no spend:
- `fixture-refusal`, `fixture-tool-error`, `fixture-truncated`, `fixture-no-report` all render
  the "Check failed" box with an outcome-specific message, no report, no verdict
- `fixture-search-cap-hit` renders the full report, the Sources list (2 links), and the one-line
  "Search budget reached; this report is based on 5 searches." note — all together, exactly per
  the acceptance criterion

## What worked, what didn't

No surprises. S2-5's result-page rendering logic (built in this same session) handled every
fixture correctly on the first try — the outcome-based branching and the `FAILURE_MESSAGES` map
were already general enough that no changes to `site/r.html` were needed.

## Current state

- S2-6: **done**, both acceptance criteria met.
- 5 stable fixture permalinks now live at `https://factcheck-site.pages.dev/r/fixture-*` —
  Luke or Quinn (S2-8) can open any of them directly, any time, at no cost.
- `worker/fixtures/seed.mjs` is idempotent (re-running overwrites the same keys) — safe to
  re-run if a fixture ever needs adjusting.

## Open questions

None.

## Files created or modified

**Created:** `worker/fixtures/seed.mjs`, this handoff.
**Modified:** `AMS/SPRINTS/sprint-2.md` (S2-6 checkbox and ACs).
**Not touched:** `AMS/DOC/`, `AMS/LEARNINGS/`, `worker/src/index.js`, `site/`.

**Sprint/stories touched:** Sprint 2, S2-6 (complete).

---

Moving on to S2-7 next (prompt-caching measurement) — the last story before S2-8 (Quinn, demo
runner). Per Luke's new standing instruction, committing this story's progress now before
continuing (not pushing).
