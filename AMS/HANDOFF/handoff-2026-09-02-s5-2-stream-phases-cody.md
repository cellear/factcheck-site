Cody · claude-sonnet-5 · S5-2

## What was attempted

S5-2: stream both phases of the session flow as SSE (per Sprint 5's plan), so watching a check
run shows searches and report text live instead of a silent wait. Second of four chained stories
in this session (S5-1 → S5-2 → S5-3 → S5-4), written as its own handoff per Luke's direction this
sprint even though it continues in the same session as S5-1.

## What was done

**Built exactly as scoped first**, then found via live testing that part of it didn't hold up, and
redesigned with Luke's input mid-story. Summary of the final state; full blow-by-blow is in the
session transcript if anyone needs it.

**Phase 1 (`POST /session`) streams as SSE, unchanged from the original scope.** Added SSE
plumbing to `worker/src/index.js`: `parseAnthropicSSE()` (raw `event:`/`data:` wire-format
parser), `consumeAnthropicStream()` (reconstructs the same message shape a non-streaming call
would return — `content`/`usage`/`stop_reason`/`stop_details` — so `classify()`/
`extractTextAndCitations()`/`extractReport()`/`computeCostUsd()` run completely unchanged against
a streamed response), `relayEvent()` (maps the raw Anthropic events to a small browser-facing
vocabulary: `search`, `search_results`, `fetch`, `fetch_result`, `text`, `error`, `done` — this
project's own design, not an Anthropic-defined format), `sseResponse()` (returns the streaming
`Response` immediately, runs the work via `ctx.waitUntil`). Confirmed live via a probe before
writing any of this: `server_tool_use` blocks for `web_search`/`web_fetch` carry their full
`input` in the `content_block_start` event itself, not streamed via delta, so the browser-facing
`search`/`fetch` events fire the instant the tool call starts.

**Phase 2 (`POST /session/:id/proceed`) does NOT stream to the browser anymore — reverted to a
blocking call after live testing.** This is the real story of this session. Original plan: stream
phase 2 the same way as phase 1, with `ctx.waitUntil` keeping it running if the client
disconnects ("closing this tab cancels nothing," per the sprint's own scope). Live testing found
this didn't work:

1. Built the SSE version first, matching S5-1's pattern exactly (`sseResponse` + `ctx.waitUntil`).
   Tested locally (`wrangler dev` + `.dev.vars`, gitignored, sourced from the documented key-file
   pattern) — worked perfectly, including a disconnect test.
2. Deployed and re-tested on production. A disconnected phase-1 call (~15-20s) completed and
   metered correctly. **Three separate disconnected phase-2 calls (74-250s typical duration)
   never completed** — no record, no billed spend, even after 5+ minutes of waiting.
3. Traced this to Cloudflare's own documented limit: `ctx.waitUntil()` only extends execution up
   to **30 seconds** past when the response finishes sending or the client disconnects. Phase 1
   fits inside that window; phase 2 almost never does.
4. **Presented this to Luke** with three options (Cloudflare Queues / poll instead of push /
   accept the gap). He chose **poll instead of push**: redesigned `handleProceedSession` to run
   as a plain blocking call (matching `/check`'s established pattern) that writes throttled
   progress snapshots to a new `progress:<sessionId>` KV key (`makeProgressTracker()` coalesces
   the rapid stream of text deltas into a running string so the ~1/sec-throttled KV write — KV
   limits writes to the same key to about once per second — doesn't fragment the report into
   dozens of tiny entries) for the browser to poll via the new `GET /session/:id/progress`.
5. **Re-tested the "disconnect" scenario on this new blocking+polling design.** Worked perfectly
   locally (confirmed: killed the client 5s in, the check still completed, metered, and wrote a
   result). **Failed identically on production** — same symptom as before (nothing completes).
6. This forced a much bigger realization, confirmed by fetching Cloudflare's own docs directly:
   *"When the client disconnects... outstanding work may be canceled unless it is passed to
   `ctx.waitUntil()`"* — and this applies to **subrequests**, not just the Worker's own execution,
   **for a plain blocking handler exactly the same as a streaming one**. There is no way to
   guarantee survival of a multi-minute check past a client disconnect using only "one serverless
   function + KV" — that needs genuinely decoupled infrastructure (Cloudflare Queues, Durable
   Objects). Local `wrangler dev`/Miniflare does not reproduce this cancellation at all, which is
   why every local test looked fine while every clean production test of a genuine disconnect
   failed — a real, consequential local/production behavior gap worth remembering for any future
   disconnect-sensitive testing on this project.
7. **This also means the *existing* `/check` endpoint (live since Sprint 2) almost certainly has
   the same gap.** S2-1's six-minute hold test proved a check survives while the client stays
   connected — it never tested an actual disconnect. "Closing this tab cancels nothing" may have
   been an untested assumption since Sprint 2, not a verified product property.
8. **Presented this larger finding to Luke** with three options (Queues for real / investigate
   further first / accept and document). He chose **accept and document the gap for now**, rather
   than add new infrastructure this sprint.
9. Implemented the honest version: `handleProceedSession` still wraps the actual work
   (`runPhase2()`) in `ctx.waitUntil` in addition to directly awaiting it — pure upside, zero
   added complexity, gives a disconnect very close to completion (or during phase 1) a real chance
   to still finish instead of zero grace at all, without claiming to solve the multi-minute case.

**Verified live**, both locally and on production (post-final-deploy): a connected client
completes normally through phase 2 (confirmed `outcome: "ok"`, proper report, citations); the
`/session/:id/progress` polling endpoint correctly reflects accumulating events and final
completion for a connected client (noting Cloudflare KV's own eventual-consistency lag — observed
up to roughly a minute in testing — as a real characteristic of the live-polling experience, worth
knowing for whoever builds S5-4's firehose display).

**`AMS/SPRINTS/sprint-5.md` updated to state what actually held up, not the original optimistic
scope:** S5-2's scope/acceptance criteria rewritten with the full story condensed; demo script step
6 rewritten (the tab-close step will not pass as originally worded — the check is now expected to
be lost, not preserved); a new dated entry in "Decisions Made This Sprint" recording Luke's
accept-the-gap call. Sprint acceptance/demo-running personas (Quinn, Nadia) should read this
before running the Sprint 5 demo — step 6 needs their own re-verification against the *current*
expected outcome, not the original one.

## What worked, what didn't

**Testing against real production caught two consequential facts that local dev testing would
never have surfaced** (Miniflare doesn't reproduce Cloudflare's disconnect-cancellation behavior
at all). Worth remembering as a standing practice for this project: local `wrangler dev` is fast
and cheap for verifying request/response shapes and business logic, but is not a substitute for at
least one production test of anything disconnect-, timing-, or platform-lifecycle-sensitive.

**Didn't work:** my first assumption that "blocking like `/check`" would automatically inherit
`/check`'s disconnect resilience — that resilience was never actually proven to exist for `/check`
either; I was extrapolating from an untested assumption baked into the product's own copy/design
mockups, not from a verified fact.

## Current state and blockers

S5-2 done, committed (`47d8149`), deployed, verified live for the connected-client path. The
disconnect-guarantee gap is a real, accepted, documented limitation — not a blocker for continuing
the sprint, per Luke's explicit decision. Continuing directly into S5-3 in this same session.

## Open questions

None blocking. Flagging for whoever eventually revisits the disconnect gap (not mine to schedule):
Cloudflare Queues is the documented, correct fix, but is new infrastructure and wasn't in scope
for this sprint's decision.

## Files created or modified

- `worker/src/index.js` — SSE plumbing (`parseAnthropicSSE`, `consumeAnthropicStream`,
  `relayEvent`, `sseResponse`) for phase 1; `makeProgressTracker`, throttled progress writes, new
  `GET /session/:id/progress` route, `handleProceedSession` reverted to blocking + `ctx.waitUntil`
  wrap for phase 2. `/check`/`frameClaim()` still untouched.
- `AMS/SPRINTS/sprint-5.md` — S5-2 story box and ACs rewritten to state verified reality; demo
  script step 6 rewritten; new dated decision entry for Luke's accept-the-gap call.
- `AMS/OFFICES/cody/desk.md`, `open-threads.md`, `working-notes.md` (updated at session end)
- This handoff

Not touched: `site/`, `skill/`, `DOC/`, `LEARNINGS/`. Nothing pushed by me — Luke ran every
deploy himself (three during this story, after the initial redesign, the final `ctx.waitUntil`
addition, and confirming each).

## DOC promotions for Lila (I don't write DOC/LEARNINGS myself)

1. **`DOC/architecture.md`, Latency section** (or a new "Disconnect behavior" subsection) needs
   the ctx.waitUntil-30-second-cap finding recorded as current truth, replacing/correcting the
   existing "Two escape hatches remain in reserve..." line, which undersold how immediate and
   platform-level this limit is. Suggested content: Cloudflare cancels outstanding work
   (including subrequests, not just the Worker's own execution) on client disconnect, with only
   `ctx.waitUntil()`'s capped 30-second grace as an exception — applies to blocking handlers
   exactly the same as streaming ones. `/check` and phase 2 of the session flow both have this
   gap for a check running longer than ~30s past disconnect; accepted, not fixed, as of S5-2
   (2026-09-02). The real fix (Cloudflare Queues) is deferred, not scheduled.
2. **New architecture note: the SSE event vocabulary.** `search`/`search_results`/`fetch`/
   `fetch_result`/`text`/`error`/`done` is this project's own design (not an Anthropic wire
   format) for what phase 1 relays to the browser. Worth documenting alongside decision 17's
   rendering notes, since S5-4 will build the firehose display against this exact vocabulary.
3. **New architecture note: `progress:<sessionId>` KV key.** Alongside `session:<id>`,
   `spend:<yyyy-mm>`, `durations:<yyyy-mm>`. Holds `{ events: [...], done, result_id? }` for a
   phase-2 check in progress; written throttled (~1/sec) during the check, `expirationTtl: 600`
   while running, `expirationTtl: 60` once done. Best-effort only — a lost write only affects the
   live-watching display, never correctness.
4. **Measured, worth noting somewhere:** Cloudflare KV's real eventual-consistency propagation lag
   (observed up to roughly a minute between a write and a read reflecting it, on production,
   across different requests) is a real characteristic to design around for anything polling KV
   for near-real-time feel — not just theoretical, actually observed repeatedly during this
   story's testing.
5. **`web_fetch` pricing, confirmed live and via docs (2026-09-02, carried from S5-1 but worth
   Lila cross-checking it landed):** no per-use charge, token cost only — unlike `web_search`'s
   $10/1000. `computeCostUsd()` has no fetch line item by design, not by oversight.

## Sprint / story

Sprint 5, S5-2: done, deployed, verified for the connected-client path; disconnect gap found,
escalated to Luke twice, and accepted/documented per his explicit decisions. Continuing to S5-3 in
this session.

---

## Prompt for Next Assistant

Addressed to **Cody** (`claude-sonnet-5`) — continuing the same chained session.

```
You are Cody, continuing Sprint 5 in the same session. S5-1 and S5-2 are done, committed,
deployed, and verified live -- see AMS/HANDOFF/handoff-2026-09-02-s5-2-stream-phases-cody.md for
what S5-2 built and the disconnect-guarantee finding (accepted as a known gap, not fixed this
sprint -- do not attempt to re-litigate or re-fix it in S5-3/S5-4 without a reason to revisit).
Next: S5-3 (site: design 1b, the form page).

Read first (if not already in context): AMS/SPRINTS/sprint-5.md (S5-3's scope and acceptance
criteria), INCOMING/Form design feedback/Fact-check directions.dc.html (design 1b's markup,
palette, and logic -- a Claude Design canvas export using a proprietary DCLogic/sc-if framework
tied to that tool's runtime; adapt the visual design and layout into plain HTML/CSS/vanilla JS,
don't try to reuse the DC framework machinery itself), the assets in
INCOMING/Form design feedback/assets/ (mascot-builder.png etc.).

S5-3 scope: rebuild site/index.html's idle state as design 1b -- two-column card, mascot side
panel with speech-bubble annotation, warm paper palette (Inter + Caveat via Google Fonts),
example-claim chip, invite word that collapses to "Invited as ****· change" once remembered.
Copy needed assets into site/assets/; commit the design export itself under design/ for
provenance; INCOMING/ is Luke's to clean up afterward. Mascot art is a placeholder -- reference
it from one place so swapping the character later is a one-file change; no character name in any
copy. The form should submit to the NEW session flow (POST /session), not the old /check --
S5-4 builds the choose-step/firehose UI that actually drives the rest of the flow, so S5-3's job
is the idle-state visual rebuild and wiring the submit to kick off phase 1; a minimal placeholder
for what happens after submit is fine for now if S5-4 needs to build the real chooser/firehose UI
anyway (use your judgment on how much of the post-submit flow to stub vs. build now, given S5-4
depends on S5-3).

Constraints: AGENTS NEVER PUSH; wrangler/deploy commands are also blocked by this session's Bash
classifier -- ask Luke to run them, same pattern as S5-1/S5-2. DOC/LEARNINGS are Lila's only --
hand over findings in your handoff, don't edit those files. Write a full handoff for S5-3 same as
S5-1/S5-2, with a "Prompt for Next Assistant" addressed to yourself for S5-4.
```

**Mission summary:** built phase 1's SSE streaming as scoped, then found via live production
testing that phase 2's SSE+ctx.waitUntil design didn't actually survive a client disconnect
(Cloudflare's 30-second waitUntil cap), redesigned it to poll-based progress with Luke's input,
then discovered the deeper issue that Cloudflare cancels outstanding subrequests on disconnect
regardless of blocking vs. streaming — a gap that likely also affects the existing `/check`
endpoint and was never actually verified before. Escalated both findings to Luke, who chose to
accept and document the disconnect-survival gap rather than add new infrastructure this sprint.
Continuing to S5-3 (site redesign) next in this same session.
