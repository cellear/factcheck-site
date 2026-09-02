Archie · claude-fable-5 · Sprint 5 planning

## What was attempted

Luke came back post-MVP wanting to keep going ("one shouldn't stop at MVP"). Interviewed him
on features, resolved the Claude Design question, planned Sprint 5, and prepared the Nadia
S4-R go-ahead and Cody kickoff prompts.

## What was done

- **Established the Claude Design export was never integrated.** `INCOMING/Form design
  feedback/` holds the canvas; the live site is still the plain MVP form. Luke picked
  direction **1b "Someone's on it"** (mascot at desk, speech-bubble narrator). Mascot art is
  placeholder (the "Builder" from Simplify Drupal); no name yet — keep it swappable.
- **Feature interview.** The big one: the site is a worse experience than the skill. All
  three complaints (slower, silent, never asks) trace to `/check` being one-shot — the
  `frameClaim()` "never ask" wrapper suppresses the skill's own parse/triage/ask steps.
  Sprint 5's move: give the site a second turn.
- **Wrote `AMS/SPRINTS/sprint-5.md`** — goal "the site catches up to the skill." Cody chains
  S5-1 (two-phase session flow, web_fetch URL input, caps raised) → S5-2 (SSE streaming both
  phases) → S5-3 (1b form page) → S5-4 (choose step + firehose). Then Quinn S5-5 demo
  runner → Nadia live demo → S5-R.
- **Processed Luke's skill recording** (`INCOMING/fact-check-skill-example.mov`, 26MB, not
  committed): extracted 1fps frames, curated nine annotated keyframes into
  `design/skill-reference/` with a README naming the five qualities the firehose must beat.
  The recording surfaced URL input (added to S5-1) and the open-ended chooser (added to S5-4).
- **Decisions from Luke this session:** no auto-proceed (sessions sit, then expire); triage
  fast path is a real ending; full firehose "more prominent than the skill"; record stores
  final report only; result page stays plain markdown; search cap 5 → env var default 25;
  spend cap $20 → $100 (no auto-reload — Console balance is the backstop; cost worry punted);
  image input deferred; all coding to Cody in one chained session.
- **Handed Luke the Nadia S4-R prompt** (retro reframed: sprint retro, project continues —
  wider four-sprint pass still wanted).

## Current state and blockers

- Sprint 5 planned and Luke-reviewed; no blockers. Cody can start on Luke's go.
- S4-R runs in parallel in Nadia's existing conversation; no dependency either way.
- `INCOMING/` remains Luke's to clean up after S5-3 commits the design assets.

## Open questions

- Mascot character and name — Luke pondering; sprint proceeds with placeholder, unnamed.
- Phase-2 search-cap default (25) to be tuned from what real runs use.

## Files created or modified

- `AMS/SPRINTS/sprint-5.md` (new)
- `design/skill-reference/` (new — 9 frames + README)
- `AMS/OFFICES/archie/desk.md`, `open-threads.md` (updated)
- This handoff

## Sprint / story

Sprint 5: planned. Sprint 4: accepted; S4-R pending in Nadia's thread.

---

## Prompt for Next Assistant

Addressed to **Cody** (claude-sonnet-5), delivered via Luke — see the chat message
accompanying this handoff for the paste-ready version. Work S5-1 → S5-2 → S5-3 → S5-4 in
order, committing per story. Constraints: AGENTS NEVER PUSH; DOC/LEARNINGS are Lila's only.
