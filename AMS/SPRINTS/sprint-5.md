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

### S5-1 · Worker: two-phase session flow · [ ]

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
- **Raise the spend cap:** `SPEND_CAP_USD` to 100 (Luke's account has no auto-reload; the
  Console balance is the real backstop now). Meter keeps billing both phases, cache rates
  included.
- Keep `/check` answering during the transition or cut over atomically with S5-3/S5-4 — the
  deployed site must never point at a dead endpoint.

**Acceptance criteria:**
- [ ] An ambiguous multi-claim post comes back from phase 1 as a set of identified issues to
      choose from, in seconds, with $0 of search spend
- [ ] An uncontroversial claim gets the fast "settled" answer with deep-check offered
- [ ] Phase 2 on a chosen issue produces a report and a permanent `/r/{id}` link with the same
      record shape as today (plus any new fields), and `site/r.html` still renders it
- [ ] Abandoned sessions expire on their own

---

### S5-2 · Worker: stream both phases · [ ]

**Owner:** Cody · **Model:** `claude-sonnet-5` · **Size:** l · **Depends on:** S5-1

**Scope:**
- Call the Anthropic API with `stream: true` for both phases and relay events to the browser
  as SSE from the Worker — the full firehose: search invocations (with the query text), search
  results arriving (source titles/URLs), and report text as it is written.
- Classification (`classify()`), metering, duration tracking, and the KV record write happen
  at stream end, preserving all S2/S3 failure-handling rules (stop_reason checked first,
  refusal category stored, tool_error vs. search-cap distinction).
- If the client disconnects mid-stream, finish the check and write the record anyway
  (`ctx.waitUntil`) — "closing this tab cancels nothing" must stay true.

**Acceptance criteria:**
- [ ] Watching a phase-2 run in the browser shows searches and report text live, not a silent
      wait ending in a redirect
- [ ] A tab closed mid-check still produces a complete permanent record
- [ ] Seeded failure fixtures (refusal, tool_error, truncated) still classify and render
      correctly through the streaming path

---

### S5-3 · Site: design 1b — the form page · [ ]

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

**Acceptance criteria:**
- [ ] The deployed form page matches direction 1b's idle state and submits to the session flow
- [ ] Mascot art swap requires touching only the asset file(s), not markup in many places

---

### S5-4 · Site: the choose step and the firehose wait · [ ]

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

**Acceptance criteria:**
- [ ] Submitting an ambiguous claim visibly parses, asks, and then streams the chosen
      investigation live end to end on the deployed site
- [ ] The bubble's narration reflects actual stream events, not canned rotation
- [ ] The result permalink still renders as plain markdown

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
| 6 | Submits a claim, then closes the tab mid-investigation; Luke reopens `/r/{id}` from the record later. | The record completed anyway. |

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
  6. Spend cap raised $20 → $100; cost worry formally punted (no auto-reload; Console balance is the backstop).
  7. Result page stays plain markdown; record stores the final report only.
  8. All coding to Cody in one chained session (S5-1 → S5-2 → S5-3 → S5-4).

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
