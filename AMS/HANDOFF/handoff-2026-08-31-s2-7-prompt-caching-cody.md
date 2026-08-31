# Handoff — S2-7: Prompt-caching measurement

**Cody (Coder) · claude-sonnet-5 · S2-7**

Real API spend: **$0.218094** across 3 real calls — well within the ≤$1.50 budget.

**Blocker hit, resolved by Luke:** the Anthropic Console balance was down to $1.01 before this
story (under the story's own budget). Luke topped up; the Console showed $11.01 after (a $10
top-up landed, not the $20 he thought he added — worth him checking that if it matters).

---

## What was attempted and the outcome

Added a `--cache` flag to `spike/check.mjs` (off by default, so default behavior is unchanged
— confirmed by the control run below). When set, the system prompt (`SKILL.md`, the largest
stable prefix by a wide margin — tens of thousands of tokens vs. one small tool definition) is
wrapped as `[{ type: "text", text: skillMd, cache_control: { type: "ephemeral" } }]` instead of
a plain string.

Ran the same claim (the Eiffel Tower claim used throughout Sprint 2 — reliably triggers 2
searches) three times back to back:

| Run | Flag | input_tokens | cache_creation | cache_read | cost_usd | duration |
|---|---|---|---|---|---|---|
| 1 | `--cache` | 143 | 10,435 | 26,185 | $0.06824 | 31.2s |
| 2 | `--cache` | 143 | 2,376 | 34,089 | $0.044284 | 24.7s |
| 3 | (none, control) | 35,990 | 0 | 0 | $0.10557 | 30.4s |

**Answer to S2-7's question: yes, prompt caching reduces billed input tokens and cost inside
the server-tool loop, substantially.** The uncached control run billed the full 35,990-token
system prompt at the standard input rate every time ($0.10557/check). With caching on, the
first run split that into a small direct-input remainder (143 tokens) plus a cache write
(10,435 tokens, billed at 1.25x) and a cache read (26,185 tokens, billed at 0.1x) — cheaper
even on the very first cached call. By the second cached call, most of the prompt was served
from cache (34,089 read vs. 2,376 written), landing at **$0.044284 — 58% cheaper than the
uncached baseline.**

**One surprise, not fully explained:** even the *first* `--cache` run showed a non-zero
`cache_read_input_tokens` (26,185), not the clean cache-miss-then-hit pattern I expected. Likely
explanation: several earlier stories today (S2-1, S2-2, S2-4) sent the identical `SKILL.md` text
as a plain-string system prompt within the same rough time window, and Anthropic's caching
picked up on that overlap once `cache_control` was present to opt in. I did not chase this
further — the run-to-run trend (more cache read, less cache creation, lower cost) and the clean
zero-cache control run are enough to answer S2-7's actual question. Worth Archie knowing this
if he digs into caching further: the exact mechanics of what gets cached and when may be more
permissive than "identical requests only," at least across recent, closely-timed calls.

**No conclusion drawn on whether to enable caching in S2-2's real handler** — per S2-7's scope,
that decision belongs to Archie. The measured numbers above are the whole of what I'm handing
over.

## What worked, what didn't

Straightforward. The flag-based approach kept `spike/check.mjs`'s default path completely
untouched — the control run's `cache_read_input_tokens=0`, `cache_creation_input_tokens=0`,
and `input_tokens=35990` (the pre-S2-7 shape) confirm nothing regressed for existing callers of
the script without `--cache`.

## Current state

- S2-7: **done**, both acceptance criteria met.
- `spike/check.mjs` has a `--cache` flag; unused by default; the real S2-2 Worker handler is
  untouched (S2-7 was scoped as a measurement in the spike script, not a change to the shipped
  function).
- 3 new result pairs in `spike/results/` from this story's runs.

## Open questions

- Whether to enable prompt caching in the real `POST /check` handler — Archie's call, with the
  numbers above as input. Given the site's real usage pattern (any two checks share the exact
  same `SKILL.md` system prompt, potentially minutes to hours apart depending on how often the
  cache actually gets reused before its TTL expires — I didn't measure the ephemeral cache's
  TTL boundary, only that back-to-back calls within ~1 minute clearly benefited), this seems
  like a reasonable win to take, but that's Archie's decision to make, not mine.

## Files created or modified

**Created:** this handoff, 3 new `spike/results/*.{md,json}` pairs
(`20260831T073654Z`, `20260831T073737Z`, `20260831T073816Z`, all `claude-sonnet-5`).
**Modified:** `spike/check.mjs` (`--cache` flag), `AMS/SPRINTS/sprint-2.md` (S2-7 checkbox, ACs,
Decisions Made This Sprint).
**Not touched:** `AMS/DOC/`, `AMS/LEARNINGS/`, `worker/`, `site/`.

**Sprint/stories touched:** Sprint 2, S2-7 (complete).

---

S2-7 was the last Cody story before S2-8 (Quinn, demo runner). Per Luke's instruction, stopping
here — S2-8 is QA's story, not mine to run.
