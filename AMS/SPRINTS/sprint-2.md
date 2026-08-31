# Sprint 2: It's a website

**Sprint Goal:** A visitor can paste a claim on a deployed URL, wait, and land on a permalink that opens anywhere.

**Confidence:** planned — written in good faith, expected to flex

**Personas this sprint:** Cody, Lila, Luke, Nadia, Quinn, Sandy

---

## Stories

### S2-1 · Cloudflare project and the six-minute go/no-go · [x]

**Owner:** Cody · **Model:** `claude-sonnet-5` · **Size:** m · **Depends on:** S1-4

**Scope:**
- Cloudflare account (Luke creates), Pages project, Worker, KV namespace, API key as a Worker secret
- **Hold test first, free:** a throwaway Worker that artificially waits six minutes (spike's
  slowest real run was 5m40s) before responding, called from a browser — proves the platform
  and the browser connection hold, before any API spend
- Then one real check end to end on the platform, returning the report (~$0.36)
- If the platform cannot hold six minutes, stop and report; the fallbacks in order are the two
  escape hatches in `DOC/architecture.md` (SSE heartbeat, respond-with-id-then-poll) on
  Cloudflare, then Netlify/Vercel

**Acceptance criteria:**
- [x] A deployed URL held a request open ≥ 360s and returned normally (artificial delay is fine) —
  `https://factcheck-worker.lm2000.workers.dev/hold-test`, opened in an actual Chrome tab,
  returned `held_ms=360000` after a real 6-minute wait (2026-08-30)
- [x] A deployed URL returns a complete report for one real test claim —
  `https://factcheck-worker.lm2000.workers.dev/real-check-test`, third attempt, see Cody's
  handoff for why the first two attempts didn't
- [x] `DOC/architecture.md` decision 14 is confirmed or overturned (handed to Lila to record) —
  **confirmed**, handed to Lila in Cody's handoff

---

### S2-2 · The function: POST /check · [x]

**Owner:** Cody · **Model:** `claude-sonnet-5` · **Size:** m · **Depends on:** S2-1, S1-1

**Scope:**
- Accept `{ claim }`; call the API as in the spike; classify outcome; build the result record per `DOC/architecture.md`; write `result:<id>` to KV; return `{ id }`
- Three rules from Sprint 1 that the spike script does NOT implement — do not copy them from `spike/check.mjs`, implement per DOC:
  - **Keep citations:** preserve `block.citations` (url, title, cited_text) into `citations[]`; join text blocks with NO separator
  - **Single-turn frame:** wrap the claim in the fixed user-message frame (DOC failure handling §3); a completed message with no `# Fact-Check Report` heading → `outcome: no_report`
  - **`max_uses_exceeded` is not a tool error:** outcome stays `ok` with `search_cap_hit: true`; every other search `error_code` → `tool_error`
- Unguessable id (≥ 16 random bytes, URL-safe)
- No invite word or spend cap yet — Sprint 3

**Acceptance criteria:**
- [x] POSTing a claim returns an id; the record in KV has every field in the sketch, including `skill_commit`, `cost_usd`, `duration_ms`, `outcome` — verified against two real calls, see Cody's handoff
- [x] A refusal or tool error produces a record with `outcome ≠ ok` and no `report` masquerading as a verdict — `classify()` verified with a no-cost unit test covering refusal, real tool_error, max_uses_exceeded, no_report, and truncated cases; not exercised against a real refusal/error response (would need an unreliable forcing trick to trigger for real)
- [x] A record for a claim with searches contains a non-empty `citations[]` — confirmed (20 entries) after a required fix; see Cody's handoff for why `block.citations` (DOC's assumed source) doesn't populate in practice

---

### S2-3 · GET /r/:id · [x]

**Owner:** Sandy · **Model:** `claude-haiku-4-5` · **Size:** s · **Depends on:** S2-2

**Scope:**
- Read `result:<id>`; return the record as JSON; unknown id → 404

**Acceptance criteria:**
- [x] Known id returns the stored record; unknown id returns 404 with a plain message — verified
  against two real ids from S2-2's KV writes plus one unknown id, no new spend (Cody, standing
  in for Sandy per Luke's direction — see handoff)

---

### S2-4 · Form page with predicted countdown · [x]

**Owner:** Cody · **Model:** `claude-sonnet-5` · **Size:** m · **Depends on:** S2-2

**Scope:**
- Static page: textarea, submit; on submit POST and show a **90-second countdown** (S1-4's prediction); on response redirect to `/r/<id>`
- At zero the countdown is replaced with "Still checking — claims that need many sources can take up to six minutes"; it never restarts, and reaching zero does not fail the request

**Acceptance criteria:**
- [x] On a phone, Luke pastes a claim, sees the countdown, and is redirected to a permalink —
  verified via browser automation (not a literal phone) with the real Worker; a Cloudflare
  Pages routing bug was found and fixed along the way (see Cody's handoff) — Luke, worth a real
  phone pass before the demo since the automation tool's viewport resize didn't visibly narrow
- [x] A network error shows a message, not a blank page — verified with a simulated `fetch`
  failure (no spend)

---

### S2-5 · Result page · [x]

**Owner:** Cody · **Model:** `claude-sonnet-5` · **Size:** m · **Depends on:** S2-3, S1-5

**Scope:**
- Static page at `/r/<id>` that fetches the record and renders: the claim, the report as verbatim markdown starting at the first `# Fact-Check Report` line, a **Sources list from `citations[]`** (deduped by URL), model, skill commit, date, duration
- A record with `outcome ≠ ok` (including `no_report`) renders as a failed check: what failed, no verdict
- `search_cap_hit: true` renders one line: "Search budget reached; this report is based on 5 searches"

**Acceptance criteria:**
- [x] The same permalink renders identically in a private window on a second device — the page
  is fully stateless (no cookies, no localStorage, fetches fresh from the public JSON API every
  load), so this holds by construction; not literally tested on a second physical device — see
  Cody's handoff
- [x] A failed-check record renders the failure state — verified with a synthetic `tool_error`
  fixture written directly to KV (no spend), rendered with no verdict shown; also verified 404
  (unknown id) renders "No result found"

---

### S2-6 · Failure fixture · [x]

**Owner:** Sandy · **Model:** `claude-haiku-4-5` · **Size:** s · **Depends on:** S2-2

**Scope:**
- A way to produce records with `outcome` = refusal / tool_error / truncated / **no_report**, plus an `ok` record with `search_cap_hit: true`, without spending: seeded KV records and/or a `?fixture=` hook that is disabled in production
- The seeded tool_error fixture doubles as the classifier test that S1-2's forced-error run used to provide (a synthesized message with a non-`max_uses_exceeded` error code) — the old `max_uses: 1` trick no longer produces `tool_error` under the reclassification

**Acceptance criteria:**
- [x] Luke can open a permalink for each failure kind (refusal, tool_error, truncated, no_report) and see it rendered as a failed check — `worker/fixtures/seed.mjs` seeds all 5 (4 failure kinds + search_cap_hit) via KV writes, no spend; all 5 permalinks verified in-browser
- [x] The `search_cap_hit` fixture renders as a verdict WITH the one-line search-budget note — verified: full report, Sources list, and "Search budget reached; this report is based on 5 searches." all render together

---

### S2-7 · Prompt-caching measurement · [x]

**Owner:** Cody · **Model:** `claude-sonnet-5` · **Size:** s · **Depends on:** none

**Scope:**
- One question, one measurement: does prompt caching reduce billed input tokens inside the
  server-tool loop? Add `cache_control` to the system prompt (and largest stable prefix) in
  `spike/check.mjs` behind a flag; run one multi-search claim once or twice; read
  `cache_read_input_tokens`
- Budget: ≤ $1.50 of real API spend, recorded
- No conclusions drawn in code — the measured numbers go in the handoff, decision to Archie,
  recording to Lila

**Acceptance criteria:**
- [x] A run's measured `cache_read_input_tokens` (zero or not) and spend are in the handoff — three real runs measured (two cached, one uncached control); see Cody's handoff for the full numbers
- [x] `spike/check.mjs` default behavior is unchanged when the flag is off — verified: the uncached control run showed `cache_read_input_tokens=0`, `cache_creation_input_tokens=0`, `input_tokens=35990` (the full prompt, unchanged from pre-S2-7 behavior)

---

### S2-8 · Sprint 2 demo runner and dry-run · [x]

**Owner:** Quinn · **Model:** `claude-haiku-4-5` · **Size:** s · **Depends on:** S2-4, S2-5, S2-6

**Scope:**
- Replace `demo.sh` with the Sprint 2 version: guides Luke through the demo table below,
  pausing between steps; phone/second-device steps are guided prompts, not automation
- Follows the conventions in `DOC/working-agreements.md`: visible progress on any silent step,
  blank answer = skip, `./demo.sh [start-step]`
- Dry-run every step that doesn't need a phone or spend; flag any step that cannot be
  performed as written as a fix story BEFORE Luke runs it

**Acceptance criteria:**
- [x] Quinn's dry-run happened before Luke's live run, and its result is in Quinn's handoff
- [x] `./demo.sh` covers all demo steps; the runner writes nothing outside what a check itself writes —
  trivially true this sprint: the runner never invokes a local check (the live check happens
  through the deployed site on Luke's phone), so it makes no local writes at all; `git status`
  after the full dry-run showed only `demo.sh` itself as modified

---

### S2-R · Retro and records · [x]

**Owner:** Nadia (runs it) and Lila (writes it) · **Model:** `claude-sonnet-5` · **Size:** s · **Depends on:** sprint accepted

**Scope:**
- After acceptance, Nadia reviews the sprint and decides what should be recorded
- Lila writes `LEARNINGS/sprint-2.md` and applies any DOC updates Nadia or Archie handed over

**Acceptance criteria:**
- [x] `LEARNINGS/sprint-2.md` exists
- [x] No DOC edits were made by anyone but Lila

---

## Sprint Demo Script

Luke runs **`./demo.sh`** (Quinn's Sprint 2 runner, S2-8) which guides him through these steps in order. Each has an expected outcome. If any step does not match, the sprint is not accepted and fix stories are added to this file.

| # | Luke does | Expected |
|---|---|---|
| 1 | Luke opens the deployed URL on his phone and pastes a claim. | Countdown runs; he is redirected to `/r/<id>`; the report is there. |
| 2 | Luke opens that `/r/<id>` in a private window on a laptop. | Same report, same metadata. |
| 3 | Luke texts the link to one person and asks them to open it. | They see the report. |
| 4 | Luke opens the fixture permalinks from S2-6. | The four failure fixtures render as failed checks with no verdict; the `search_cap_hit` fixture renders as a verdict with the search-budget note. |

**Accepted when:**
- All three views of one permalink match.
- Every fixture renders as a failure, never a verdict.
- Until Sprint 3 is accepted the URL is not shared beyond the demo; Luke sets a workspace spend limit in the Anthropic Console as a stopgap.

---

## Decisions Made This Sprint

- **S2-7 measured** (2026-08-31): prompt caching on the system prompt (SKILL.md) substantially
  cuts cost inside the server-tool loop — uncached $0.10557/check vs. $0.044284/check with a
  warm cache (58% cheaper). No conclusion drawn here on whether to enable it by default in
  S2-2's real handler — that decision is Archie's; numbers are in Cody's handoff.
- **Decision 14 confirmed** (S2-1, 2026-08-30): Cloudflare Workers held a real browser request
  open for the full six minutes and returned normally; hosting stack (Pages + Workers + KV)
  stands as decided. DOC update handed to Lila in Cody's handoff.
- **DOC correction needed** (S2-2, 2026-08-30): `block.citations` — the field DOC's Result
  record design assumed citations would come from — does not populate on real runs. Sonnet 5
  invokes `web_search` from inside an automatic, undeclared `code_execution` sandbox, and text
  blocks carry no `citations` field in that mode. Implemented a fallback (raw search results,
  deduped at render time as already planned) instead; DOC update handed to Lila in Cody's
  handoff.

---

## Acceptance

**Status:** Accepted
**Date:** 2026-08-31
**Reviewed by:** Luke — ran `./demo.sh` end to end (phone check, private-window permalink,
texted link, all five S2-6 fixtures) and confirmed all demos passed.

---

## Fix Stories

- (added only if the demo fails)

---

## Deferred to Later Sprints

- (none yet)
