Lila · claude-sonnet-5 · monitor feedback (not sprint-scoped)

## What was attempted

Luke's new `ams-agent-monitor` dashboard showed S4-1 and S4-R as "not completed" even though
both are `[x]` in `AMS/SPRINTS/sprint-4.md` on `origin/main`. He asked me to help interpret it;
this handoff relays what came out of that, for Archie to consult on with Luke — not something I
should decide or fix myself.

## What was done

**The initial puzzle.** I confirmed both stories were genuinely `[x]` on `origin/main` (no
unpushed-commit explanation) and, from `git log`, noticed S4-1's and S4-R's ticks each landed in
a commit *after* the commit that recorded Sprint 4's "Accepted" status, while S4-2's and S4-4's
ticks landed at-or-before it — a correlation that lined up with what the dashboard showed. I
proposed that as the mechanism (comparing checkbox state to an accept-time snapshot) and flagged
it to Luke as a guess about someone else's code, not a confirmed fact.

**The actual root cause, from the monitor's author.** Wrong guess — there is no commit
comparison anywhere in the app; story state comes from a single source, the checkbox in the
fetched file body. The real cause: the monitor diffs file *identity* via the GitHub API's
immutable blob sha, but fetches file *bodies* from `raw.githubusercontent.com/<repo>/HEAD/<path>`
— a mutable ref, cached (`max-age=300`, plus a Fastly POP) independently per file. My commits
landed inside that cache's window; `sprint-5.md` had no problem because its cache had already
turned over. Fixed by appending the blob sha as `?v=<sha>` to every fetch, so each version of a
file gets its own URL and a stale cache can no longer alias onto it. Fix is on branch
`worktree-fix-stale-body-fetch`, commit `dc772bf`, 178 tests passing (3 new) — **not live yet**,
needs merge to `main` since Pages serves from there. My correlation was real (the cache TTL
happened to line up with my commit timing) but not causal — worth remembering as a case where a
plausible-looking mechanism, inferred purely from timing, turned out wrong; I don't have
visibility into that app's code and should have said so more plainly rather than presenting a
specific mechanism as my best read.

**An unrelated gap the author found while in there, not something I can act on myself.** Three
stories in this repo's sprint files are invisible to the monitor because their headings don't end
in a checkbox — the parser's heading regex requires `· [ ]` at the end of the line, and these use
free-text status markers instead:

- `S3-4 · Search-tool error detection · **STRUCK — absorbed by S2-2/S2-6**`
- `S3-6 · Per-IP rate limit · **STRUCK by Luke, 2026-08-31**`
- `S4-3 · Custom domain · **BLOCKED — using .dev domain for now**`

Sprint 3's board renders 7 stories when the file actually has 9. The author called this
arguably spec-compliant on the monitor's side but said a blocked story vanishing without a trace
is the opposite of the point, and left the question of how struck/blocked should render to Luke.

## Why this is Archie's, not mine

This is a sprint-file *format* question — whether our STRUCK/BLOCKED convention should carry a
checkbox-parseable marker so tooling built against this repo can see those stories — not a DOC
correction I've been handed to apply. `SPRINTS/PROTOCOL.md` (the format Archie and Luke set) is
where a decision like this would land. I'm handing it over rather than picking a marker myself.

## Current state and blockers

Nothing broken in this repo. `sprint-4.md`'s record was correct the entire time; no DOC or
SPRINTS edit is needed from the cache bug itself. The open item is purely the STRUCK/BLOCKED
heading format, pending a decision from Archie and Luke.

## Open questions

- Should STRUCK/BLOCKED stories carry some checkbox-compatible marker (e.g. a bracket form the
  monitor's regex can match) so they don't disappear from tooling, while still reading clearly
  as "not a normal open/done story" to a human? Or should the monitor's parser be taught to
  handle free-text status markers instead of asking every sprint file to conform to it? Not my
  call — the monitor's author left it with Luke, and Luke asked that Archie weigh in too.

## Files created or modified

- This handoff.

Nothing in `DOC/`, `LEARNINGS/`, or any `SPRINTS/*.md` file touched — there was nothing to fix
there.

## Sprint / story

Not sprint-scoped. Sprint 5 is in progress under Cody (per the dashboard: S5-1 through S5-4
committed, S5-5 in progress) — unaffected by this handoff.

---

## Prompt for Next Assistant

Addressed to **Archie**.

```
You are Archie, the Site Architect. Read AMS/AGENT.md and this handoff
(AMS/HANDOFF/handoff-2026-09-02-monitor-parsing-gap-lila.md).

Luke wants to consult with you on one open question surfaced by the ams-agent-monitor
author: three struck/blocked stories in this repo's sprint files (S3-4, S3-6, S4-3) are
invisible to that monitor because their headings don't end in a checkbox — only Luke's own
free-text status markers ("STRUCK", "BLOCKED") mark them. Decide with Luke whether
SPRINTS/PROTOCOL.md's story-heading convention should change to stay tooling-parseable, and
if so what the new form looks like. If you land on a convention, hand it to Lila as a DOC/
SPRINTS/PROTOCOL.md promotion in your handoff — I don't write it myself until it's decided.

The unrelated dashboard bug that started this (S4-1/S4-R showing "not completed") was a stale
CDN cache in the monitor's own fetch logic, already fixed on its own branch, unrelated to this
repo's records. No action needed here for that part.
```

**Mission summary:** relayed what the monitor's author found after Luke's dashboard showed S4-1
and S4-R as incomplete — a stale-cache bug in the monitor itself (already fixed, not yet merged,
nothing wrong with our records) — and handed Archie the one real, unrelated finding: three
struck/blocked sprint stories are invisible to that tooling because their headings don't end in
a checkbox, which needs a format decision with Luke, not a unilateral fix from me.
