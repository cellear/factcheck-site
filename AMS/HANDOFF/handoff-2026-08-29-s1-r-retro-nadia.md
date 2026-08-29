Nadia · claude-sonnet-5 · S1-R (retro, review half)

## What was attempted

S1-R's Nadia half: review the whole of Sprint 1 now that it's accepted, decide what's worth
recording, and hand a list to Lila. I don't write `DOC/` or `LEARNINGS/` myself.

## What was done

Read every Sprint 1 handoff (S1-1 through F1-1), `AMS/SPRINTS/sprint-1.md` in full, and the
current `DOC/working-agreements.md` / `DOC/architecture.md` to see what's already promoted vs.
still sitting only in handoffs.

**Found and fixed one bookkeeping gap:** S1-1's story-level checkbox and both acceptance-criteria
boxes were still `[ ]` in `sprint-1.md`, even though Sandy finished the story same-day
(2026-08-25) and both criteria were met (`skill/SKILL.md` md5-verified byte-identical,
`skill/SOURCE.md` names the commit). Sandy's own handoff didn't list `sprint-1.md` as modified —
the boxes were simply never ticked, and it went unnoticed through five more stories, S1-6's
cross-read, and sprint acceptance. I verified the files on disk against Sandy's handoff and ticked
S1-1's three boxes myself. This is sprint-file bookkeeping, not a DOC/LEARNINGS edit, so it's mine
to do.

I did not touch anything else in `sprint-1.md`, and made no DOC or LEARNINGS edits.

## Outcome

Findings below, handed to Lila. Nothing else outstanding on my end — S1-R's remaining acceptance
criteria (`LEARNINGS/sprint-1.md` exists; no DOC edits by anyone but Lila) are hers to close.

## Files created or modified

- `AMS/SPRINTS/sprint-1.md` (S1-1's three checkboxes only)
- `AMS/OFFICES/nadia/desk.md`, `AMS/OFFICES/nadia/open-threads.md`
- This handoff

Not touched: `AMS/DOC/`, `AMS/LEARNINGS/`, any story text beyond S1-1's checkboxes, `spike/`,
`skill/`. Nothing committed or pushed.

## Open questions

None of my own.

## Sprint / story

Sprint 1: Accepted. S1-R: Nadia's half done; Lila's half (writing `LEARNINGS/sprint-1.md` and any
DOC promotion) is next.

---

## Prompt for Next Assistant

**Addressed to Lila.**

```
You are Lila, the Librarian. Read AMS/AGENT.md, this handoff
(AMS/HANDOFF/handoff-2026-08-29-s1-r-retro-nadia.md), and AMS/SPRINTS/sprint-1.md (Accepted).

Your half of S1-R: write LEARNINGS/sprint-1.md and apply the one DOC promotion below. You are
the only writer for DOC/ and LEARNINGS/ (DOC/working-agreements.md, "DOC and LEARNINGS have one
writer").
```

**For `LEARNINGS/sprint-1.md`** (durable findings from the sprint — my picks, phrase them your way):

- 2026-08-25: A story can be fully done and still show `[ ]` in the sprint file — S1-1 was
  correct and complete same-day, but the checkboxes were never ticked and nobody caught it for
  the rest of the sprint. Tick your own story's checkboxes before ending a session; don't assume
  a handoff substitutes for it. (Fixed in this session, 2026-08-29.)
- 2026-08-26: A live `claude-sonnet-5` call can hang 5+ minutes with zero output on a foreground
  bash call — a 5-minute timeout killed it with no file written; the identical call succeeded in
  the background in 5m40s. Don't wrap live Sonnet 5 checks in short foreground timeouts; run them
  backgrounded or with a generous one. (Source: S1-3 Cody handoff.)
- 2026-08-26/28: The model pick wasn't decided by the aggregate speed/cost numbers — those showed
  Haiku 4.5 ahead on every measure. What actually decided it was a manual side-by-side read of
  one contested claim (GM streetcar), where Sonnet 5 caught inaccuracies Haiku 4.5 missed and
  certified as true. Future model spikes should budget for at least one manual side-by-side read
  of a contested/hard claim, not just aggregate benchmarks. (Source: S1-3 Cody handoff, S1-4
  Archie read-out.)
- 2026-08-28: A stalled demo isn't only a fix-story signal — Luke's first `./demo.sh` attempt
  stuck at step 2 (no findable same-claim pairs) turned out to be a missing role, not just a
  missing feature; his fix was hiring Quinn (QA) to dry-run every sprint's demo before he runs it,
  not just patching the one gap. Worth remembering as a pattern for future stalls.

**DOC promotion to apply** (in `DOC/working-agreements.md`, near the demo-acceptance rule):

- Every sprint's `demo.sh` (Quinn's, going forward) should (a) give visible progress — a
  heartbeat or explicit "this is expected to be silent for N minutes" message — for any step that
  can run silently for more than a few seconds, and (b) let Luke skip a step already confirmed via
  empty input at a prompt, not read an empty answer as an error. Both came from real friction in
  Quinn's F1-1 session (2026-08-29): Luke's first live attempt at step 3 looked hung during the up
  -to-6-min API call, and there was no way to skip a step already confirmed. Source:
  `AMS/HANDOFF/handoff-2026-08-29-f1-1-demo-runner-quinn.md`, flagged there as a candidate, not
  decided by Quinn.

**After writing LEARNINGS/sprint-1.md and applying the DOC promotion:** tick S1-R's two remaining
acceptance criteria in `AMS/SPRINTS/sprint-1.md` and its story-level box. Then Sprint 2 planning
is open (Archie's lane, `AMS/SPRINTS/sprint-2.md` already exists starting with Cody's S2-1).

Constraints: AGENTS NEVER PUSH. Do not commit unless asked. Write your own handoff when done.
