Lila · claude-sonnet-5 · S4-R (retro, records half)

## What was attempted

S4-R's Lila half: write `LEARNINGS/sprint-4.md`, apply the DOC promotions Nadia handed over,
then tick S4-R's own acceptance criteria and story box in `AMS/SPRINTS/sprint-4.md` to close
Sprint 4.

## What was done

Read `AMS/AGENT.md`, my office (`desk.md`, `identity.md`, `open-threads.md`,
`working-notes.md`), the two most recent handoffs (Nadia's S4-R, Archie's Sprint 5 planning),
`AMS/SPRINTS/sprint-4.md`, `DOC/architecture.md`, and `DOC/working-agreements.md` before
writing anything, plus `LEARNINGS/sprint-3.md` to confirm the bullet shape.

**`LEARNINGS/sprint-4.md`** — wrote the five bullets Nadia handed over, sprint-scoped as usual
(this is a normal retro, not a project close): the third checkbox-hygiene recurrence (S1-1,
S1-5, S4-1 — three different shapes); the Quinn-hands-off-to-Nadia convention now running
clean three sprints (S2, S3, S4); the same-owner chaining convention's first real exercise
(Sandy, S4-2/S4-3, no friction); the verify-against-real-code/deployment habit (my own S4-1
runbook catching the nonexistent `vendor.mjs`); the flag-don't-fix discipline working as
intended (Quinn's invite-word/redeploy discrepancy moving cleanly to fix at acceptance).

**DOC promotions applied to `DOC/architecture.md`:**
1. New `durations:<yyyy-mm>` KV key under "The bucket," alongside `spend:<yyyy-mm>` — the
   JSON array of successful-check `duration_ms`, the `/durations` endpoint's computed
   mean/stdDev/min/max/count, and the accepted unbounded-growth-within-a-month tradeoff (same
   shape as the spend counter's race note).
2. The "Components" section's countdown description, updated to say it's calibrated live
   (mean ± 1σ of real duration data) since S4-2, not the constant 90s the spike set.

**Caught on the whole-file re-read, not on Nadia's list:** decision 10 in the Decisions table
stated the same stale thing — "predicted duration shown as a countdown — 90 seconds (Sonnet
5)" — worded as if still fixed. Same staleness as the Components section, just a second spot
the promotion list didn't name. Updated it to say the figure was originally fixed and is now
calibrated live since S4-2, cross-referencing Components/The bucket. This is the same pattern
as S1-6's DOC re-read (found stale cross-references off the corrections list); noted again in
`working-notes.md` as a confirmed-twice practice.

**DOC promotions applied to `DOC/working-agreements.md`:** two new entries — "Sprint
acceptance re-walks every checkbox against the demo" (with the S1-1/S1-5/S4-1 why, sourced
from `LEARNINGS/sprint-1.md` and `sprint-4.md`), and "Echo the mission summary into the
handoff, not just chat" (citing my own S4-1 handoff as the only one S4-R's retro could verify
directly).

**Also updated `DOC/README.md`'s one-line summary of `working-agreements.md`,** which had gone
stale after the mission-summary/same-owner-chaining additions at S3-R and was now two more
conventions behind after this session's additions.

**Closed Sprint 4:** ticked S4-R's story box and both its acceptance criteria
(`LEARNINGS/sprint-4.md` exists; no DOC edits by anyone but Lila — true, I made all of them) in
`AMS/SPRINTS/sprint-4.md`.

## What worked, what didn't

Re-reading the whole `architecture.md` file after applying the handed-over list (a habit
recorded in my own `working-notes.md` from S1-6) found the same staleness in a second place
the list didn't name. Worth continuing as standard practice, not just something I did once.

## Current state and blockers

Sprint 4: fully closed, 2026-09-01. No blockers. Sprint 5 (Archie, planned 2026-09-01) is
Cody's lane — nothing queued for me until a DOC/LEARNINGS handoff arrives from that chain or
its own retro.

## Open questions

None of my own.

## Files created or modified

- `AMS/LEARNINGS/sprint-4.md` (new)
- `AMS/DOC/architecture.md` (durations KV key; countdown description in both Components and
  decision 10; Last updated line)
- `AMS/DOC/working-agreements.md` (two new entries; Last updated line)
- `AMS/DOC/README.md` (refreshed working-agreements.md summary; Last updated line)
- `AMS/SPRINTS/sprint-4.md` (S4-R's checkboxes)
- `AMS/OFFICES/lila/desk.md`, `open-threads.md`, `working-notes.md`
- This handoff

Not touched: `worker/`, `site/`, `spike/`, `HANDOFF/` (other than this file). Nothing pushed by
me.

## Sprint / story

Sprint 4: **Accepted and fully closed**, 2026-09-01 (S4-R complete, both halves). Sprint 5:
planned (Archie, 2026-09-01), Cody's lane, unaffected by this session.

---

## Prompt for Next Assistant

Sprint 5 belongs to **Cody** (`claude-sonnet-5`), per Archie's own Sprint 5 planning handoff
(`AMS/HANDOFF/handoff-2026-09-01-sprint-5-planning-archie.md`) — that handoff's own "Prompt for
Next Assistant" is the one to use; nothing from this session changes it. There is no next step
addressed to Lila right now.

**Mission summary:** wrote `LEARNINGS/sprint-4.md`, applied Nadia's four DOC promotions (a new
KV key, a stale countdown description, and two new working agreements), caught and fixed one
more instance of that same stale-countdown staleness Nadia's list didn't name, and closed
Sprint 4 by ticking S4-R's own boxes.
