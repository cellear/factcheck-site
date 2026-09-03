# Sprint 3: It's safe to send to people

**Sprint Goal:** The guardrails in the architecture are real: invite word, hard spend cap, and honest failure on refusal or search error.

**Confidence:** planned — written in good faith, expected to flex

**Personas this sprint:** Cody, Lila, Luke, Nadia, Quinn, Sandy

---

## Stories

### S3-1 · Invite word · [x]

**Owner:** Sandy · **Model:** `claude-haiku-4-5` · **Size:** s · **Depends on:** S2-2

**Scope:**
- `POST /check` requires `invite_word` matching a Worker secret; wrong or missing → 403 with a plain message; the form has the field and remembers it in localStorage

**Acceptance criteria:**
- [x] Wrong word is refused before any API call; right word proceeds

---

### S3-2 · Spend meter and hard cap · [x]

**Owner:** Cody · **Model:** `claude-sonnet-5` · **Size:** m · **Depends on:** S2-2

**Scope:**
- After each API response, convert `usage` to USD with a price table — input, output, per-search, **and the cache rates** (`cache_creation_input_tokens` at 1.25× input, `cache_read_input_tokens` at 0.1× input; S3-7 turns caching on, and the meter must bill it correctly) — and add to KV key `spend:<yyyy-mm>`. Failed checks (refusal, tool_error, no_report) cost money too and are metered the same
- Before each call, refuse if the month's total ≥ `SPEND_CAP_USD` (secret/var, default 20) with a "monthly budget reached" page
- Read-only `GET /spend` (invite word required) returns the month's total

**Acceptance criteria:**
- [x] Setting the cap to 0.01 makes the next check refuse with the budget page; setting it back to 20 restores service — verified live: `SPEND_CAP_USD` set to 0.01 via `wrangler secret put`, next check returned 402 "Monthly budget reached" with no spend, reset to 20 restored a real check
- [x] `GET /spend` matches the sum of `cost_usd` across the month's records within rounding — verified: a real check's `cost_usd` ($0.09046) matched `GET /spend`'s `total_usd` exactly

---

### S3-3 · Refusal handling · [x]

**Owner:** Cody · **Model:** `claude-sonnet-5` · **Size:** s · **Depends on:** S2-2

**Scope:**
- Check `stop_reason` before reading content; `stop_reason: refusal` → `outcome: refusal` with the `stop_details` category stored. (This story originally said to enable `fallbacks: "default"` — struck in Sprint 1: it 400s on `claude-sonnet-5`, Opus-tier/Fable only. Refusal detection needs no beta.)

**Acceptance criteria:**
- [x] The refusal fixture path and a real refusal (if one can be provoked) both render as a failed check naming the category — fixture path verified live (category renders); did not attempt to provoke a real refusal, since doing so means deliberately crafting a claim near harmful/sensitive territory — `classify()`'s `stop_reason`-before-`content` ordering and category extraction verified with a no-cost unit test instead (a synthetic message with `content: null` would throw if content were read first; it didn't)

---

### S3-4 · Search-tool error detection · [-]

**STRUCK** — absorbed by S2-2/S2-6 (Archie, 2026-08-31).

This story was written before the Sprint 1 spike and Sprint 2 build, and both of its premises
are stale: `max_uses: 0` is a request-validation 400 (not a forceable error), and
`max_uses_exceeded` is no longer a `tool_error` at all (`search_cap_hit` reclassification,
DOC failure handling §2). Its real content shipped in Sprint 2: the S2-2 handler classifies
every non-`max_uses_exceeded` search `error_code` as `tool_error` per DOC, with no-cost unit
tests, and `max_uses: 5` is set; the S2-6 `tool_error` fixture covers the rendering. Nothing
remains to build.

---

### S3-5 · Page copy · [x]

**Owner:** Sandy · **Model:** `claude-haiku-4-5` · **Size:** s · **Depends on:** S2-4, S2-5

**Scope:**
- Form page: "don't paste anything you want kept private; results are public to anyone with the link"
- Result page: the method caveat from `SKILL.md`, model and date shown plainly; failed-check wording for each `outcome`

**Acceptance criteria:**
- [x] Luke reads both pages and accepts the wording — copy drafted and deployed (Cody, see
  handoff for the exact wording); read and accepted by Luke during the Sprint 3 live demo,
  2026-08-31

---

### S3-6 · Per-IP rate limit · [-]

**STRUCK** by Luke, 2026-08-31.

Luke: spend is already contained — the invite word gates every call, the hard cap bounds the
month, and each check requires a deliberate manual submission per load. A per-IP counter adds
administration without adding a bound that isn't already there. (The story itself predicted
this: "Luke may strike this story.")

---

### S3-7 · Enable prompt caching in the real handler · [x]

**Owner:** Cody · **Model:** `claude-sonnet-5` · **Size:** s · **Depends on:** S2-2

**Scope:**
- Apply the S2-7 measurement to `worker/src/index.js`: system prompt sent as
  `[{ type: "text", text: skillMd, cache_control: { type: "ephemeral" } }]`, exactly the shape
  the spike's `--cache` flag proved
- Decision and rationale recorded in "Decisions Made This Sprint" below (Archie, 2026-08-31):
  measured on the Eiffel claim, even a cold cached call was cheaper than uncached ($0.068 vs
  $0.106) and a warm one 58% cheaper ($0.044); on search-heavy claims the relative saving is
  smaller (the cache covers the ~36K-token system prompt, not search results) but it is never
  more expensive. No behavior change, only billing shape
- One real check after deploy confirms cache fields are non-zero in `usage` and the S3-2 meter
  billed them at the cache rates

**Acceptance criteria:**
- [x] A post-deploy record shows non-zero cache usage and a `cost_usd` computed with the
      cache rates — verified: `cache_creation_input_tokens: 11815`, `cache_read_input_tokens:
      27334` on a real post-deploy check; `computeCostUsd()` already billed cache rates (written
      forward-looking in S2-2, confirmed correct now that real cache usage exists)
- [x] Decision + measured numbers handed to Lila for `DOC/architecture.md` (capacity note too) —
      handed to Lila in Cody's handoff (the decision itself was already made and recorded by
      Archie during Sprint 3 planning; this box is about the post-deploy confirmation numbers)

---

### S3-8 · Sprint 3 demo runner and dry-run · [x]

**Owner:** Quinn · **Model:** `claude-haiku-4-5` · **Size:** s · **Depends on:** S3-1, S3-2, S3-5, S3-7

**Scope:**
- Update `demo.sh` to the Sprint 3 version: guides through the demo table below, per the
  conventions in `DOC/working-agreements.md` (visible progress, blank = skip,
  `./demo.sh [start-step]`)
- Steps that flip Worker secrets/vars (`SPEND_CAP_USD`, invite word) are guided prompts with
  the exact command shown, not automated writes to production config
- Dry-run every step that doesn't spend or need other people; flag any step that can't be
  performed as written as a fix story BEFORE the live run
- Per `DOC/working-agreements.md`: when the dry-run is clean, hand off to **Nadia** for Luke's
  live run and the acceptance verdict — Quinn's session ends there

**Acceptance criteria:**
- [x] Quinn's dry-run happened before the live run and its result is in Quinn's handoff
- [x] The handoff's Prompt for Next Assistant is addressed to Nadia, who runs the live demo
      with Luke and records the verdict

---

### S3-R · Retro and records · [x]

**Owner:** Nadia (runs it) and Lila (writes it) · **Model:** `claude-sonnet-5` · **Size:** s · **Depends on:** sprint accepted

**Scope:**
- After acceptance, Nadia reviews the sprint and decides what should be recorded
- Lila writes `LEARNINGS/sprint-3.md` and applies any DOC updates Nadia or Archie handed over

**Acceptance criteria:**
- [x] `LEARNINGS/sprint-3.md` exists
- [x] No DOC edits were made by anyone but Lila

---

## Sprint Demo Script

Luke runs **`./demo.sh`** (Quinn's Sprint 3 runner, S3-8) with **Nadia running the live demo
and recording the verdict** per `DOC/working-agreements.md`. Each step has an expected
outcome. If any step does not match, the sprint is not accepted and fix stories are added to
this file.

| # | Luke does | Expected |
|---|---|---|
| 1 | Luke submits a claim with the wrong invite word. | Refused; nothing spent. |
| 2 | Luke sets `SPEND_CAP_USD` to 0.01 and submits a claim with the right word. | "Monthly budget reached" page. He sets it back to 20 and the next check runs. |
| 3 | Luke opens `/spend` with the invite word. | The month's total, matching the records. |
| 4 | Luke opens the `tool_error` and `refusal` fixture permalinks (S2-6). | Both render as failed checks — no verdict. (S3-3 additionally tries to provoke a real refusal; if one occurs its permalink is shown here too.) |
| 5 | Luke sends the URL and invite word to three people. | They each complete a check and forward a permalink. |

**Accepted when:**
- All five steps happen as written.
- The site is now in use.

---

## Decisions Made This Sprint

- 2026-08-31 (planning pass, Archie): **S3-6 struck by Luke** — spend is contained by the
  invite word + hard cap + manual submission per check; a per-IP counter adds administration
  without a new bound.
- 2026-08-31 (planning pass, Archie): **S3-4 struck as absorbed** — its premises went stale in
  Sprint 1 (`max_uses: 0` is a 400; `max_uses_exceeded` is not a tool error) and its substance
  shipped in S2-2/S2-6.
- 2026-08-31 (planning pass, Archie): **Prompt caching: enable by default** in the real
  handler (S3-7). S2-7 measured: cold cached call $0.068 vs $0.106 uncached, warm $0.044
  (−58%), same claim, no behavior change. It is cheaper even when the cache never gets reused,
  because the write premium (1.25× on part of the prompt) is outweighed by 0.1× reads within
  the request's own tool loop. Caveat recorded: measured on an easy claim; relative savings
  shrink as search-result tokens dominate. S3-2's meter must bill cache rates or the spend cap
  drifts.
- 2026-08-31 (planning pass, Archie): S3-3's `fallbacks: "default"` line corrected (Sprint 1
  finding: Opus-tier/Fable only).

---

## Acceptance

**Status:** Accepted
**Date:** 2026-08-31
**Reviewed by:** Luke — ran `./demo.sh` end to end (wrong invite word, spend-cap flip, `/spend`,
tool_error/refusal fixtures, sent to three people) and read/accepted the S3-5 page copy;
confirmed everything passed.

---

## Fix Stories

- (added only if the demo fails)

---

## Deferred to Later Sprints

- (none yet)
