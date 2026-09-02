Nadia · claude-sonnet-5 · S4-R (retro, review half)

## What was attempted

S4-R's Nadia half: review all of Sprint 4 now that it's accepted (2026-08-31), decide what's
worth recording, and hand a list to Lila. **Reframed by Luke via Archie, 2026-09-01: this is a
normal sprint retro, not the project's closing retro** — Luke is extending the project by at
least Sprint 5 ("the site catches up to the skill," already planned, `AMS/SPRINTS/sprint-5.md`).
The wider four-sprint convention pass Sprint 4's plan called for is still wanted, framed as
conventions for the project going forward, not a post-mortem. I don't write `DOC/` or
`LEARNINGS/` myself.

## What was done

Read `AMS/SPRINTS/sprint-4.md` in full and every Sprint 4 handoff (planning, S4-2/S4-3, S4-1,
S4-4, my own acceptance handoff), plus `DOC/architecture.md`, `DOC/working-agreements.md`, and
`worker/src/index.js` (the S4-2 duration-tracking code) to check what's implemented vs. what's
written down. Also read all three prior retro handoffs (S1-R, S2-R, S3-R) for the wider pass.

**Found and fixed one bookkeeping gap, same class as S1-1 (S1-R) and S1-5 (caught by Luke's
dashboard, per Archie's Sprint 4 planning handoff) — a third occurrence, a third shape.** S4-1's
story-level checkbox and its acceptance criterion ("Luke performs the demo using only the
runbook") were still `[ ]` in `sprint-4.md`, even though the live demo verified exactly that —
invite word changed and spend read, both via `DOC/runbook.md` alone, "he asked nobody." This one
has a legitimate reason it slipped: Lila correctly declined to tick it herself in the S4-1
session ("can't be verified by me — needs Luke's live run"), and the criterion's proof only
existed once the live demo ran, in a *later* session than the one that wrote the runbook. But
nobody ticked it afterward either — not Quinn's dry-run, not my own acceptance session. I
verified it against the demo record (my own S4 acceptance handoff, and Quinn's S4-4 handoff
naming the exact tasks) and ticked both boxes myself. This is sprint-file bookkeeping, not a
DOC/LEARNINGS edit, so it's mine to do — same as S1-1 in S1-R.

**Checkbox hygiene otherwise clean:** S4-2 and S4-4 correctly `[x]`; S4-3 correctly marked
BLOCKED/deferred rather than left as a stale `[ ]`, same pattern as S3-4/S3-6.

**My own open-thread question is resolved:** the mission-summary and same-owner-chaining
conventions slipstreamed at S2-R did land in `DOC/working-agreements.md` — applied at S3-R
(2026-08-31), confirmed by reading the file directly. No longer outstanding.

**Wider four-sprint pass:** three things stood out enough to write up below — the checkbox-
hygiene pattern (three recurrences, three shapes, never yet turned into a written convention of
its own), the mission-summary convention being effectively unauditable from the handoff record
alone, and a "verify against the real code/deployment, not just handoff prose" habit that's now
caught a real error twice (S1-6/S2-R's DOC re-read, and S4-1's runbook catching a `vendor.mjs`
script that doesn't exist).

## Outcome

Findings and DOC-promotion candidates below, handed to Lila. I made no DOC or LEARNINGS edits.

## Files created or modified

- `AMS/SPRINTS/sprint-4.md` (S4-1's two checkboxes)
- `AMS/OFFICES/nadia/desk.md`, `AMS/OFFICES/nadia/open-threads.md`
- This handoff

Not touched: `AMS/DOC/`, `AMS/LEARNINGS/`, `worker/`, `site/`, `spike/`. Nothing pushed by me.

## Open questions

None of my own.

## Sprint / story

Sprint 4: Accepted, 2026-08-31. S4-R: Nadia's half done; Lila's half next. Sprint 5 is planned
(Archie, 2026-09-01) and unblocked once this closes — not the project's last sprint.

---

## Prompt for Next Assistant

**Addressed to Lila.**

```
You are Lila, the Librarian. Read AMS/AGENT.md, this handoff
(AMS/HANDOFF/handoff-2026-09-01-s4-r-retro-nadia.md), and AMS/SPRINTS/sprint-4.md (Accepted).

Your half of S4-R: write LEARNINGS/sprint-4.md and apply the DOC promotions below. This is a
normal sprint retro (Luke is extending the project — Sprint 5 is planned), not a project close,
so LEARNINGS/sprint-4.md is sprint-scoped as usual; the working-agreements additions below are
framed as conventions for the project going forward. You are the only writer for DOC/ and
LEARNINGS/.
```

**For `LEARNINGS/sprint-4.md`** (same short-bullet shape as Sprints 1–3):

- 2026-08-31: Checkbox hygiene gapped a third time, a third shape. S1-1 (S1-R) was a same-session
  omission; S1-5 (caught by Luke's Agent Monitor dashboard) was a stale box nobody revisited; S4-1
  is different again — the persona who wrote the story correctly declined to tick an
  acceptance criterion that only a later live demo could prove, and then nobody ticked it once
  that demo passed, including the session that recorded the sprint's overall acceptance. Fixed in
  this retro. Three recurrences across four sprints, despite two of them being individually
  "fixed," is worth a standing convention rather than a per-sprint catch — see DOC promotion
  below.
- 2026-08-31: The Quinn-hands-off-to-Nadia convention (fixed at S2-R after drifting in Sprints 1
  and 2) has now run clean three sprints running — S2, S3, S4. Worth recording that it held, not
  just that it was fixed.
- 2026-08-31: The same-owner chaining convention (written into DOC at S3-R, too late to help
  Sprint 3) got its first real exercise this sprint: Sandy ran S4-2 and S4-3 in one session, per
  Archie's suggested order in the planning handoff, no merge or handoff friction. The convention
  worked the first time it was actually available to use.
- 2026-08-31: Writing user-facing documentation by checking the actual code/deployment, not just
  reconstructing from prior handoff prose, catches real gaps. Lila's S4-1 runbook was sourced from
  handoffs but verified against `worker/`, `demo.sh`, and `wrangler.jsonc`, and caught that the
  story's own handed-over prompt assumed a `vendor.mjs` re-vendoring script that doesn't exist —
  the runbook documents the actual manual process instead of a tool that was never built. Same
  habit as the "re-read the whole file" pattern from S1-6/S2-R's DOC corrections — worth naming as
  one general practice, not two separate ones.
- 2026-08-31: A flagged-but-not-fixed discrepancy (Quinn: the demo table said the invite-word step
  "and redeploys," the runbook doesn't call for one) moved cleanly from Quinn → Nadia → fixed at
  acceptance, with nobody editing outside their own lane to get there. Worth naming as the
  flag-don't-fix discipline working as intended, not just as a discrepancy that got caught.

**DOC promotions to apply:**

1. **`DOC/architecture.md` — "The bucket" section: new key `durations:<yyyy-mm>`.** Alongside
   `spend:<yyyy-mm>`. Stores a JSON array of `duration_ms` for the month's successful
   (`outcome: ok`) checks (S4-2, `worker/src/index.js`). `GET /durations?invite_word=<word>`
   computes `mean`, `stdDev`, `min`, `max`, `count` and returns `lower`/`upper` = mean ± 1 stdDev
   (floored at 0). Same implicit-monthly-reset shape as `spend:<yyyy-mm>`; same kind of accepted
   tradeoff worth one line, same as the spend counter's race note — the array grows unbounded
   within a month (no pruning), accepted at this project's volume (a dozen checks/day), reset
   implicit at the month boundary.
2. **`DOC/architecture.md` — "Components" section, the countdown line is stale.** Currently reads
   as if the predicted-duration countdown is a fixed figure. Since S4-2 it's calibrated live from
   real duration data (mean ± 1σ of the month's completed checks) instead of the constant 90s the
   spike originally set. Update to say so; the spike's own numbers (Latency section) remain useful
   as initial/lower-bound context but are no longer the live source once real data accumulates.
3. **New `DOC/working-agreements.md` entry — sprint acceptance re-walks every checkbox against
   the demo, not just against its own handoff.** When recording a sprint's acceptance, the
   session doing so should check each story's box and acceptance-criteria boxes against what the
   live demo just proved, not only against whether the box already matches its owning handoff —
   an acceptance criterion that can only be verified by the live demo itself (not by the persona
   who implemented it) will otherwise sit unticked indefinitely, because no single session ever
   owns "go back and tick it." This is the third occurrence of the same underlying gap across four
   sprints (S1-1, S1-5, S4-1), in three different shapes; each was caught individually, but none
   of the catches produced a standing rule until now. Source: `LEARNINGS/sprint-1.md`,
   `LEARNINGS/sprint-4.md` (this file).
4. **New `DOC/working-agreements.md` entry — echo the mission summary into the handoff, not just
   chat.** The mission-summary convention (added S3-R, applied from S2-R) only requires the
   summary in the final chat message to Luke, which means a retro reviewing the written handoff
   record can't confirm it happened — Lila's S4-1 handoff is the only Sprint 4 handoff that also
   wrote a "Mission summary" line into the file itself, which is why it's the only one this retro
   could verify directly. Recommend also copying the same one-to-two sentence summary into the
   handoff's "Prompt for Next Assistant" section, as Lila did — no new obligation, just writing
   the existing one down twice so the record is self-verifying.

**After writing `LEARNINGS/sprint-4.md` and applying the DOC promotions:** tick S4-R's two
acceptance criteria and its story-level box in `AMS/SPRINTS/sprint-4.md`. Sprint 4 is then fully
closed. Sprint 5 (`AMS/SPRINTS/sprint-5.md`, already planned by Archie, 2026-09-01) is open next
— Cody's lane, per Archie's own handoff, not yours or mine.

Constraints: AGENTS NEVER PUSH. Commit your own work locally at session end. Write your own
handoff, with a "Prompt for Next Assistant" and its mission-summary line (in both chat and the
handoff itself, per the new convention above).

**Mission summary:** reviewed all of Sprint 4 (reframed mid-sprint from "closing retro" to a
normal retro since Luke is extending the project into Sprint 5), fixed a recurring
checkbox-hygiene gap on S4-1, and handed Lila four LEARNINGS findings plus two DOC promotions —
a new KV key to document, a stale countdown description to fix, and two project-level working
agreements (re-walk checkboxes against the demo at acceptance; echo mission summaries into the
handoff file) meant to close a gap that's now recurred three times across four sprints.
