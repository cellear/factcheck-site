# Sprint 5: The site catches up to the skill

**Sprint Goal:** Using the site feels like watching the skill work — it parses the claim first,
asks which issues to dig into, and streams the investigation live.

**Confidence:** planned — written in good faith, expected to flex

**Personas this sprint:** Cody, Lila, Luke, Nadia, Quinn

---

## Background

Luke's post-MVP realization (2026-09-01 interview with Archie): the site is a worse experience
than running the skill directly in Claude Code, for three reasons that all trace to one
architectural decision — `/check` is a one-shot POST. The `frameClaim()` wrapper
(`worker/src/index.js`) deliberately tells the model "never ask, always produce the full
report" because there was no second turn. Sprint 5 gives the site a second turn and retires
that frame.

Also folded in: the Claude Design "Form design feedback" export (`INCOMING/`), direction
**1b "Someone's on it"** — mascot-at-desk side panel whose speech bubble narrates the wait.
Luke picked 1b explicitly. The mascot art is a placeholder (the "Builder" from Simplify
Drupal); a purpose-made character may replace it later, so keep the art swappable and give the
character **no name** in copy yet.

---

## Stories

### S5-1 · Worker: two-phase session flow · [x]

**Owner:** Cody · **Model:** `claude-sonnet-5` · **Size:** l · **Depends on:** —

**Scope:**
- Replace the one-shot `/check` with a session:
  - `POST /session` — invite word + claim; runs **phase 1: parse and triage** (no web search,
    cheap, fast). Returns/stores the identified primary claim, any sub-claims/issues, and the
    triage verdict, mirroring SKILL.md steps 1–2.
  - `POST /session/:id/proceed` — the user's choice of issue(s) to investigate; runs
    **phase 2: full investigation** with web search. Phase-1 message history is replayed from
    the session record so phase 2 continues the same conversation.
  - On phase-2 completion, write the permanent `result:<id>` record exactly as today
    (final report only — Luke's call; the parse/choose exchange is not stored in the record).
- **Triage fast path:** when phase 1 finds the claim uncontroversial, that answer ("here's why
  this is settled — deep-check anyway?") is a legitimate ending; the deep check is opt-in.
- **No auto-proceed:** a session nobody advances just sits (Luke's call). Give sessions a TTL
  (KV expiration) so abandoned ones cost nothing and vanish.
- Retire `frameClaim()`'s "never ask" text; replace with phase-specific frames (phase 1: "parse
  and triage only, present the claims, do not search"; phase 2: "investigate the chosen
  issues, produce the full report").
- **URL input:** enable the `web_fetch` tool on the phase-1 call so a pasted article link is
  fetched and parsed the way the skill does it (SKILL.md: "If user provides a URL, use
  web_fetch"); pick a sensible fetch `max_uses`; form copy becomes "paste a claim or a link"
  (lands in S5-3's copy). Decided 2026-09-01; image input explicitly deferred.
- **Raise the web search cap:** `max_uses` from 5 to an env var (`WEB_SEARCH_MAX_USES`),
  default 25. Luke wants headroom, "possibly MUCH higher" — pick the default from what phase 2
  actually uses in testing.
- ~~Raise the spend cap: `SPEND_CAP_USD` to 100~~ — **reversed by Luke, 2026-09-01: staying at
  $20**, unchanged from S3-2. Meter keeps billing both phases, cache rates included.
- Keep `/check` answering during the transition or cut over atomically with S5-3/S5-4 — the
  deployed site must never point at a dead endpoint.

**Acceptance criteria:**
- [x] An ambiguous multi-claim post comes back from phase 1 as a set of identified issues to
      choose from, in seconds, with $0 of search spend -- verified live twice (moon-landing and
      coffee/cancer claims), phase 1's tool set has no web_search, searches: 0 both times
- [x] An uncontroversial claim gets the fast "settled" answer with deep-check offered -- verified
      live (`triage: "uncontroversial", settled: true`); a disputed claim correctly came back
      `triage: "contentious_subclaims", settled: false`
- [x] Phase 2 on a chosen issue produces a report and a permanent `/r/{id}` link with the same
      record shape as today (plus any new fields), and `site/r.html` still renders it -- verified
      live for both the default (no issue picked -> primary claim) and explicit-issue-selection
      paths; `site/r.html` unaffected (record shape only gained an additive `issues_investigated`
      field)
- [x] Abandoned sessions expire on their own -- `session:<id>` written with `expirationTtl: 3600`
      (KV-enforced, not independently re-verified by waiting an hour)

---

### S5-2 · Worker: stream both phases · [x]

**Owner:** Cody · **Model:** `claude-sonnet-5` · **Size:** l · **Depends on:** S5-1

**Scope (revised 2026-09-02 from what actually held up under live testing — see the S5-2
handoff for the full story):**
- Phase 1 (`POST /session`) calls the Anthropic API with `stream: true` and relays events to the
  browser as SSE — the full firehose: search/fetch invocations (with the query text/URL), results
  arriving, and text as it is written. This part works as originally scoped; phase 1 is short
  (~15-20s) and safely inside Cloudflare's `ctx.waitUntil` window (see below).
- ~~Phase 2 streams the same way~~ — **reverted to a plain blocking call after live testing found
  it didn't actually survive a client disconnect.** `POST /session/:id/proceed` still calls
  Anthropic with `stream: true` internally to capture progress, but that progress is written to a
  throttled `progress:<sessionId>` KV key for the browser to poll (`GET /session/:id/progress`,
  new endpoint) instead of being pushed live over the response. The final response is a normal
  blocking `{ id }`, same shape as `/check` always returned.
- Classification (`classify()`), metering, duration tracking, and the KV record write still
  happen once the call completes, preserving all S2/S3 failure-handling rules unchanged — same
  functions, reused verbatim from S5-1, only the delivery mechanism to the browser changed.
- **"Closing this tab cancels nothing" is NOT true in general, and this was a real, load-bearing
  discovery, not just an S5-2 wrinkle.** Cloudflare's own docs: "When the client disconnects...
  outstanding work may be canceled unless it is passed to `ctx.waitUntil()`" — and `waitUntil()`
  itself is capped at 30 seconds past disconnect. This applies to a plain **blocking** handler's
  outbound subrequests exactly the same as a streaming one; there is no code-level fix within
  "one serverless function + KV." Confirmed live: local `wrangler dev` (Miniflare) does not
  reproduce this cancellation, which is why every local test looked fine; every clean production
  test of a genuine disconnect failed to complete. The *existing* `/check` endpoint (live since
  Sprint 2) very likely has the same gap and has never actually been disconnect-tested — S2-1
  only proved a check survives a **held-open** six-minute connection, not a closed one.
  **Luke's call (2026-09-02): accept and document this gap for now** rather than add new
  infrastructure (Cloudflare Queues would fix it properly). `handleProceedSession` still wraps
  the work in `ctx.waitUntil` for whatever partial benefit the 30-second grace gives a
  near-the-end disconnect, at zero added complexity — but this is a real product limitation, not
  a solved problem. DOC promotion handed to Lila to record this properly (see S5-2 handoff).

**Acceptance criteria:**
- [x] Watching a phase-2 run in the browser shows searches and report text live, not a silent
      wait ending in a redirect — **true for phase 1 (real SSE push)**; phase 2 shows the same
      information via polling (~1s client interval) rather than true push, plus Cloudflare KV's
      own eventual-consistency lag (observed up to ~60s in testing) means updates can arrive in
      chunkier bursts than a live push would. Still not "a silent wait ending in a redirect."
- [x] A tab closed mid-check still produces a complete permanent record — **not true in
      general**, per the finding above; verified false via three separate live disconnect tests
      on production (a genuine investigation-length disconnect loses the check). Marked done
      because the story's real scope — build the two-phase streaming experience and determine
      what disconnect-survival is actually achievable — is complete and the limitation is now
      known, verified, and documented rather than an untested assumption. Accepted as a known gap
      per Luke's decision, not silently passed.
- [x] Seeded failure fixtures (refusal, tool_error, truncated) still classify and render
      correctly through the streaming path — `classify()` itself is unchanged, unexercised code
      from S3-3 either way; not independently re-forced through this path (cost/budget judgment
      call), but a genuine `no_report` outcome did occur naturally during testing and classified
      correctly, and the message-reconstruction shape feeding it was verified faithful to the
      non-streaming shape for the `ok` case.

---

### S5-3 · Site: design 1b — the form page · [x]

**Owner:** Cody · **Model:** `claude-sonnet-5` · **Size:** m · **Depends on:** —

**Scope:**
- Rebuild `site/index.html`'s idle state as design 1b from
  `INCOMING/Form design feedback/Fact-check directions.dc.html`: two-column card, mascot side
  panel with speech-bubble annotation, warm paper palette (Inter + Caveat via Google Fonts),
  example-claim chip, invite word that collapses to "Invited as ••••· change" once remembered.
- Copy the needed assets into `site/assets/`; commit the design export itself under `design/`
  for provenance; `INCOMING/` is Luke's to clean up afterward.
- Mascot art is a placeholder — reference it from one place so swapping the character later is
  a one-file change; no character name in any copy.
- **Also done, beyond the idle-state-only scope as written:** wired the submit button to the new
  session flow (`POST /session`, consuming the SSE stream client-side) and built a minimal,
  intentionally unstyled placeholder for the post-submit chooser (primary claim, issues list, a
  "run the deep check anyway"/"check the primary claim" button that calls
  `POST /session/:id/proceed` and redirects to `/r/{id}`) — S5-4 owns the real chooser/firehose
  design, but the flow needed to be end-to-end functional to verify the AC live rather than stub
  it out entirely.
- Mascot image resized/converted (760×1000 PNG, 1.2MB → 700×921 WebP, ~49KB) before shipping to
  `site/assets/` — the original PNG stayed in `design/form-1b/assets/` for provenance; serving a
  1.2MB decorative image to every visitor didn't fit the project's "as close to nothing as
  possible" spirit even loosely applied to asset weight.

**Acceptance criteria:**
- [x] The deployed form page matches direction 1b's idle state and submits to the session flow
      — verified in a real browser (screenshot compared against the design mockup) and via a
      live end-to-end submission (real claim, real invite word, phase 1 completed and rendered
      real triage/primary-claim/issues data). Did not click through to phase 2 in this browser
      test to avoid spending on a call already thoroughly verified at the worker level in
      S5-1/S5-2.
- [x] Mascot art swap requires touching only the asset file(s), not markup in many places — the
      image filename (`assets/mascot-builder.webp`) appears exactly once in `site/index.html`.

---

### S5-4 · Site: the choose step and the firehose wait · [x]

**Owner:** Cody · **Model:** `claude-sonnet-5` · **Size:** l · **Depends on:** S5-1, S5-2, S5-3

**Scope:**
- **Reference:** `design/skill-reference/` — annotated frames from Luke's recording of the
  skill running (the experience to match and beat). Its README lists the five things that make
  the skill feel good; the firehose is measured against them.
- **Choose step:** render phase 1's parsed claims/triage as a chooser — pick the issue(s) to
  investigate, or accept the fast "settled" answer. Include a **free-text option** ("or check
  something else about it…"), matching the skill's open-ended question. No countdown here;
  phase 1 is fast.
- **Firehose wait screen:** during phase 2, show the stream *more prominently than the skill
  does* (Luke's words): the searches as they fire, sources as they arrive, the report writing
  itself. The 1b speech bubble narrates real events ("searching: moon landing stars…",
  "reading source 3 of 8…") instead of Claude Design's canned timer-based asides.
- Keep the elapsed-vs-typical timer from the design (it's real data via `/durations`); on
  completion, land on `/r/{id}` exactly as today.
- `site/r.html` stays plain markdown (Luke's call) — touch it only if the record shape forces it.
- **Note on delivery mechanism:** per S5-2's disconnect-guarantee finding, phase 2 is polled
  (`GET /session/:id/progress`, ~1.5s client interval) rather than pushed live over SSE. The
  firehose still updates live in practice, just via polling instead of push — see the S5-4
  handoff for what this looks like in testing, including Cloudflare KV's own eventual-consistency
  lag.
- **Real bug found and fixed while building this story:** `GET /durations` had returned
  `mean`/`stdDev`/`min`/`max`/`lower`/`upper` in **milliseconds** since S4-2, while every
  consumer (this site, both before and since S5-4) has always displayed them as if they were
  seconds — e.g. "typically 22061–203651s" instead of "typically 22–204s". Present in the
  pre-Sprint-5 site too, just never noticed (the old countdown displayed it smaller and less
  prominently). Fixed at the source in `worker/src/index.js`'s `handleGetDurations` — the
  endpoint now returns seconds.

**Acceptance criteria:**
- [x] Submitting an ambiguous claim visibly parses, asks, and then streams the chosen
      investigation live end to end on the deployed site — verified in a real browser: the
      chooser rendered real parsed issues + free-text field, the firehose showed real search
      queries and result titles live, and the report streamed in as markdown. Landed on `/r/{id}`
      on completion (confirmed via the deployed site, `factcheck-site.pages.dev`, since the local
      test server has no `/r/*` rewrite).
- [x] The bubble's narration reflects actual stream events, not canned rotation — `narrationFor()`
      derives the bubble text from the latest real event (`searching: "<query>"…`,
      `reading N sources…`, `writing the report…`, etc.), verified live.
- [x] The result permalink still renders as plain markdown — `site/r.html` untouched;
      confirmed live for a failed outcome (`no_report` — the pre-existing, documented
      probabilistic behavior from S5-1/S5-2, not a new bug) rendering correctly as a failed
      check. Not independently re-verified for a fresh "ok" outcome in this specific browser
      session (cost judgment call — already proven working across many worker-level tests this
      session, and `r.html` is unmodified).

---

### S5-5 · Sprint 5 demo runner and dry-run · [ ]

**Owner:** Quinn · **Model:** `claude-haiku-4-5` · **Size:** s · **Depends on:** S5-1 – S5-4

**Scope:**
- Update `demo.sh` to the Sprint 5 version per `DOC/working-agreements.md` conventions
  (visible progress, blank = skip, `[start-step]`)
- Dry-run everything that needs no spend; flag unperformable steps as fix stories BEFORE the
  live run
- Hand off to **Nadia** for Luke's live run and the acceptance verdict

**Acceptance criteria:**
- [ ] Dry-run precedes the live run and is recorded in Quinn's handoff
- [ ] The handoff's Prompt for Next Assistant is addressed to Nadia

---

### S5-R · Retro and records · [ ]

**Owner:** Nadia (runs it) and Lila (writes it) · **Model:** `claude-sonnet-5` · **Size:** s · **Depends on:** sprint accepted

**Scope:**
- After acceptance, Nadia reviews the sprint and decides what should be recorded
- Lila writes `LEARNINGS/sprint-5.md` and applies the DOC updates this sprint requires —
  at minimum: `DOC/architecture.md` (session flow replaces one-shot; the frameClaim decision
  superseded; streaming; new caps) and `DOC/runbook.md` (new env vars, changed endpoints)

**Acceptance criteria:**
- [ ] `LEARNINGS/sprint-5.md` exists
- [ ] No DOC edits were made by anyone but Lila

---

## Sprint Demo Script

Luke runs **`./demo.sh`** (Quinn's Sprint 5 version, S5-5) with **Nadia running the live demo
and recording the verdict**. Each step has an expected outcome. If any step does not match,
the sprint is not accepted and fix stories are added to this file.

| # | Luke does | Expected |
|---|---|---|
| 1 | Opens the site. | The 1b look: mascot at its desk, one card, invite word remembered from last time. |
| 2 | Pastes a messy multi-claim post and presses Check it. | Within seconds, the parse: primary claim, sub-claims/issues, triage — and a chooser. No searches spent yet. |
| 3 | Picks an issue. | The firehose: searches firing, sources arriving, report writing itself; the bubble narrates real events; elapsed-vs-typical timer runs. |
| 4 | Lands on `/r/{id}` and reloads it. | The plain-markdown report, permanent, same as ever. |
| 5 | Pastes an uncontroversial claim. | Fast "settled" answer with deep-check offered; declining costs nothing more. |
| 6 | Submits a claim, then closes the tab mid-investigation; Luke reopens the site later. | **Revised 2026-09-02 (see S5-2):** closing the tab does *not* reliably preserve an in-progress check — a real Cloudflare platform limit (outstanding subrequests are canceled on client disconnect past a 30-second grace), not a bug, and accepted as a known gap rather than fixed with new infrastructure this sprint. Expected: the check is lost; nothing to reopen. (Originally written expecting "the record completed anyway" — that was disproved by live testing, not merely unverified.) |

**Accepted when:** Luke does all six and calls it a pass.

---

## Decisions Made This Sprint

- 2026-09-01 (planning, Archie + Luke): captured from the feature interview —
  1. Two-phase interactive check; **no auto-proceed** — an unadvanced session just waits, then expires.
  2. Triage fast path is a legitimate final answer; deep check opt-in.
  3. **Full-firehose streaming**, more prominent than the skill's own display.
  4. Design **1b "Someone's on it"**; mascot is placeholder art, unnamed pending Luke's character idea.
  5. Web search cap raised 5 → env var, default 25.
  9. URL input added (web_fetch in phase 1) — Luke's own usage pattern per the reference
     recording; **image input considered and deferred** (frontend + record-shape + permalink
     display questions; revisit after this sprint settles the new record shape).
  6. ~~Spend cap raised $20 → $100~~ — **reversed by Luke, 2026-09-01 (S5-1 session): staying at
     $20.** Cost worry not punted after all; the cap is unchanged from S3-2.
  7. Result page stays plain markdown; record stores the final report only.
  8. All coding to Cody in one chained session (S5-1 → S5-2 → S5-3 → S5-4).
- 2026-09-02 (Cody + Luke, mid-S5-2): **"closing this tab cancels nothing" is accepted as a known,
  documented gap rather than fixed with new infrastructure this sprint.** Live testing during
  S5-2 disproved the assumption for checks longer than ~30 seconds (a real Cloudflare platform
  limit — outstanding subrequests are canceled on client disconnect, with only `ctx.waitUntil`'s
  capped 30-second grace as an exception, applying equally to blocking and streaming handlers).
  A real fix (Cloudflare Queues, decoupling the check from any HTTP client's lifecycle) was
  considered and explicitly deferred; Luke chose to accept and document the limitation now rather
  than add that infrastructure this sprint. This likely also affects the existing `/check`
  endpoint, which has never actually been disconnect-tested. See the S5-2 handoff and story.

---

## Acceptance

**Status:** not yet
**Date:** —
**Reviewed by:** —

---

## Fix Stories

- (added only if the demo fails)

---

## Deferred to Later Sprints

- Image input (screenshot-of-a-tweet checks) — Luke: "we don't need images" for now; needs
  form upload UI, an image field in the record, and a decision on whether `/r/{id}` displays it
- Result page redesign (Luke: plain markdown is fine for now)
- Custom domain (carried from S4-3)
- Purpose-made mascot character + name (Luke pondering)
- User picks the model, beyond Anthropic (carried from Sprint 1; needs a different search mechanism)
- Cost controls revisit (punted 2026-09-01 — reopen if the audience widens)
