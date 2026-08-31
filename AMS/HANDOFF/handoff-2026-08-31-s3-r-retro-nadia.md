Nadia · claude-sonnet-5 · S3-R (retro, review half)

## What was attempted

S3-R's Nadia half: review all of Sprint 3 now that it's accepted (2026-08-31), decide what's
worth recording, and hand a list to Lila. I don't write `DOC/` or `LEARNINGS/` myself.

## What was done

Read `AMS/SPRINTS/sprint-3.md` in full and every Sprint 3 handoff (planning, S3-1 ×2, S3-2/S3-3
/S3-7, S3-5, S3-8, and my own Sprint 3 acceptance handoff), plus the current
`DOC/architecture.md` to check what Archie's and Cody's DOC corrections still need applying.

**Checkbox hygiene:** clean again — every story's box and acceptance criteria match its handoff
(including S3-4 and S3-6, correctly marked struck rather than left as stale `[ ]`s). The S1-R fix
continues to hold.

**A real gap, and it's the same shape as last time:** Cody's two chained-story handoffs
(S3-2/S3-3/S3-7, then S3-5 — four stories in two sessions, all "per Luke's direction" and clearly
documented as such, no issue there) both **skip the "Prompt for Next Assistant" section
entirely**. Each ends with a one-line "moving on to X next" instead of the `## Prompt for Next
Assistant` heading and code block `AGENT.md` requires. This is exactly the situation the
mission-summary and same-owner-chaining conventions from S2-R were meant to cover — and they
still aren't in `DOC/working-agreements.md`. Without a written convention to follow, Cody
improvised his own informal version and dropped a real requirement along the way. Folded into
both the LEARNINGS findings and the DOC list below — the DOC promotion is now overdue, not new.

## Outcome

Findings and DOC-promotion candidates below, handed to Lila. I made no DOC or LEARNINGS edits.

## Files created or modified

- `AMS/OFFICES/nadia/desk.md`, `AMS/OFFICES/nadia/open-threads.md`
- This handoff

Not touched: `AMS/DOC/`, `AMS/LEARNINGS/`, `AMS/SPRINTS/sprint-3.md` (no checkbox gap to fix),
`worker/`, `site/`, `spike/`. Nothing committed or pushed by me.

## Open questions

None of my own.

## Sprint / story

Sprint 3: Accepted, 2026-08-31. S3-R: Nadia's half done; Lila's half next.

---

## Prompt for Next Assistant

**Addressed to Lila.**

```
You are Lila, the Librarian. Read AMS/AGENT.md, this handoff
(AMS/HANDOFF/handoff-2026-08-31-s3-r-retro-nadia.md), and AMS/SPRINTS/sprint-3.md (Accepted).

Your half of S3-R: write LEARNINGS/sprint-3.md and apply the DOC promotions below. You are the
only writer for DOC/ and LEARNINGS/.
```

**Mission:** write Sprint 3's retro and apply the DOC corrections below (Archie's three, Cody's
three, and two overdue items carried from S2-R) — no engineering, pure documentation.

**For `LEARNINGS/sprint-3.md`** (same short-bullet shape as Sprints 1 and 2):

- 2026-08-31: Checkbox hygiene held a third sprint running — worth a short confirmation line,
  same as before.
- 2026-08-31: A persona chaining through several same-owner stories without a written convention
  to follow will improvise its own shortcut — and can drop a real requirement doing it. Cody's
  two Sprint 3 handoffs (S3-2/S3-3/S3-7, then S3-5) both skipped "Prompt for Next Assistant"
  entirely in favor of an informal "moving on to X" line. The fix isn't blaming the improvisation
  — it's that the convention needed to cover this was already decided (S2-R, 2026-08-31) and
  didn't make it into DOC in time to prevent it.
- 2026-08-31: A story that needs a brand-new secret value (S3-1's `INVITE_WORD`) naturally splits
  into two sessions — implement-and-request, then deploy-and-verify once Luke supplies the
  value. Not a problem, just a shape worth expecting rather than reading as a stall.
- 2026-08-31: When several stories all touch the same file (S3-1/S3-2/S3-3/S3-7 all in
  `worker/src/index.js`), sequencing them through one owner in one or two sessions (Archie's
  explicit suggested order in the planning handoff) avoided any merge friction — there's no
  branching model here, so this is worth keeping as the default plan shape when stories share a
  file, not just an incidental convenience.

**DOC promotions to apply:**

1. **`DOC/architecture.md` — new decision row 18: prompt caching enabled by default.** Handed by
   Archie during Sprint 3 planning, confirmed post-deploy by Cody. Rationale: S2-7 measured a
   cold cached call at $0.068 vs. $0.106 uncached, warm at $0.044 (−58%) — cheaper even on a
   single use because the 1.25× write premium is outweighed by 0.1× reads inside the request's
   own tool loop; savings shrink on search-heavy claims but it's never more expensive. Post-
   deploy confirmation (Cody, S3-2/S3-3/S3-7 handoff): a live check showed
   `cache_creation_input_tokens: 11815`, `cache_read_input_tokens: 27334`,
   `cost_usd: 0.09046` — live and billing correctly in production.
2. **`DOC/architecture.md` — capacity note (decision 9).** With caching live, mean cost per
   check is now below Sprint 1's measured $0.36; exact new mean unknown until real cached checks
   accumulate — record the direction, keep the ~55 checks/month figure as the conservative floor
   per Archie's handoff.
3. **`DOC/architecture.md` — Open question 3 resolved.** "Per-IP rate limiting alongside the
   invite word" — struck by Luke, 2026-08-31 (S3-6): spend is already contained by the invite
   word, the hard cap, and manual per-check submission; a per-IP counter adds administration
   without a new bound. Mark resolved/struck like items 1, 2, and 4 already are; move to "Not
   doing" with that rationale.
4. **`DOC/architecture.md` — Result record sketch: new field `refusal_category`** (string or
   `null`) — the `stop_details.category` from a refusal (S3-3), so the result page can name it
   instead of a bare "declined." Source: Cody's S3-2/S3-3/S3-7 handoff.
5. **`DOC/architecture.md` — optional, your call:** the `spend:<yyyy-mm>` KV counter is a
   read-modify-write with no compare-and-swap — a known, accepted race under concurrent traffic
   at this project's volume (a dozen checks/day), not fixed in S3-2. Cody flagged it as worth a
   line in the bucket description if you think it's load-bearing enough to record; deferring to
   your judgment rather than mine.
6. **Overdue from S2-R — `DOC/working-agreements.md`, mission-summary convention.** In the final
   chat message to Luke, immediately after the literal "Prompt for Next Assistant" code block,
   add a one-to-two sentence plain-English summary of the mission the prompt hands off — what
   the story actually builds, not the persona's boilerplate identity text — so Luke can confirm
   it's the right story before saying "go." Applies to every persona ending a session with a
   handoff. Luke asked for this directly, 2026-08-31 (slipstreamed into S2-R, never applied).
7. **Overdue from S2-R — `DOC/working-agreements.md`, same-owner chaining convention.** When a
   persona finishes a story and the next story (or several) in the sprint file are owned by that
   same persona, look ahead and, if there's more than one, ask Luke once: "the next N are all
   mine — want me to do them all?" If yes, continue directly into each subsequent story within
   the same session — no need to stop for a fresh launch prompt. Still write a full handoff,
   including the normal "Prompt for Next Assistant," and commit at the end of every individual
   story. When that next prompt is addressed to itself, the persona says so ("the next prompt is
   to me, so I'll continue") and carries on rather than stopping. Stop and ask if a story is
   genuinely blocked on information only Luke can supply. A single story with no same-owner
   story right after it is unaffected. Luke asked for this directly, 2026-08-31 (slipstreamed
   into S2-R, never applied — see the LEARNINGS finding above for what happened without it).

**After writing `LEARNINGS/sprint-3.md` and applying the DOC promotions:** tick S3-R's two
acceptance criteria and its story-level box in `AMS/SPRINTS/sprint-3.md`. Then Sprint 4 (already
referenced as a possible fold-in decision in Archie's planning handoff) is open — Archie's
planning lane.

Constraints: AGENTS NEVER PUSH. Commit your own work locally at session end per the standing
per-story commit instruction (this now explicitly covers DOC/LEARNINGS, per Luke's answer during
S2-R). Write your own handoff, with a "Prompt for Next Assistant" and its mission-summary line,
when done — this is the first Lila handoff where that convention should actually be visible.
