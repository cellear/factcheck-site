# Handoff — S2-R: Lila's half (LEARNINGS + DOC promotions)

**Lila (Librarian) · claude-sonnet-5 · S2-R**

No API calls made. No change to project spend.

---

## What was attempted and the outcome

Ran Lila's half of S2-R per Nadia's handoff (`AMS/HANDOFF/handoff-2026-08-31-s2-r-retro-nadia.md`).

1. **`AMS/LEARNINGS/sprint-2.md`** — created. Six dated findings from Nadia's list: the S1-R
   checkbox fix holding, the foreground-network-call classifier gotcha (S2-1), the Cloudflare
   Pages `.html` canonicalization/`_redirects` trap (S2-4), the undeclared `code_execution`
   sandbox eating citations (S2-2), no-cost unit tests for failure-path logic (S2-2/S2-6), and
   live instructions from Luke needing to be written down in full, not just referenced (twice
   this sprint).
2. **`DOC/working-agreements.md`**:
   - Renamed "Luke shapes the first commit" to "Commits," kept the original as history, and
     added the standing instruction: each persona commits their own story's work locally at
     session end, without waiting to be asked. "Agents never push" is untouched.
   - Added a new rule under the demo-acceptance section: Quinn builds and dry-runs each sprint's
     demo, then hands off to Nadia for the live run and acceptance verdict — Quinn doesn't stay
     in the loop for either. Both Sprint 1 and Sprint 2 drifted the other way before this.
   - Updated the "Last updated" line.
3. **`DOC/architecture.md`**:
   - Open question 1 (Cloudflare/six-minute hold) marked resolved, per S2-1's real confirmation.
   - Added a "Citations note on decision 17" explaining the `code_execution`-sandbox finding:
     `citations[]` comes from raw search results (sources consulted, url+title), not inline model
     citations (sources quoted); `cited_text` is `null` under current, measured behavior. Cross-
     referenced from the Result record section too.
   - **Beyond the two items handed to me**, a re-read surfaced three more places that would have
     gone stale once open question 1 was marked resolved and stayed silently inconsistent
     otherwise: decision 14's table status was still "recommended" (now "decided, confirmed by
     S2-1"), and the Latency and Hosting-rationale sections both still said "S2-1 must confirm" in
     the future tense. Updated all three to reflect the same, already-confirmed fact. Same pattern
     as the S1-6 cleanup — a numbered list is not guaranteed to be exhaustive against everything
     it touches indirectly.
   - Updated the "Last updated" line.

Ticked S2-R's story checkbox and both acceptance criteria in `AMS/SPRINTS/sprint-2.md`.

**Not applied, per Nadia's explicit flag:** S2-7's prompt-caching enable/disable decision — she
was clear that's Archie's call, not mine to make unilaterally. No DOC edit made for it.

## What worked, what didn't

Worked: Nadia's list was concrete; only one thing needed checking rather than transcribing
as-is (see below). The now-standard "re-read the whole file after applying a list" pass caught
three stale cross-references the numbered list didn't (and couldn't) anticipate, since they were
consequences of the change rather than separately-flagged items.

Didn't: nothing blocked. I checked both of Nadia's file citations (the S2-1 and S2-2 handoffs)
against `AMS/HANDOFF/` and both exist and say what she said they say — unlike S1-R, no citation
error this time.

## Current state and blockers

- Sprint 2: **fully closed.** Every story (S2-1 through S2-8, S2-R) is `[x]`.
- `DOC/architecture.md`, `DOC/working-agreements.md`, `DOC/README.md`, `LEARNINGS/sprint-1.md`,
  `LEARNINGS/sprint-2.md` are all current as of 2026-08-31.
- Sprint 3 planning is open next (Archie's lane) — `AMS/SPRINTS/sprint-3.md` already exists.

## Open questions

- The S2-7 prompt-caching enable/disable decision is still open — Archie's, not mine. Flagging
  again so it doesn't get lost between sprints.
- Whether the standing per-story commit instruction extends to my own DOC/LEARNINGS edits — I
  did not commit anything this session; Nadia's handoff said to check with Luke if unsure, and I
  am unsure, so I left it uncommitted rather than guess either way.

## Files created or modified

**Created:** `AMS/LEARNINGS/sprint-2.md`, this handoff.
**Modified:** `AMS/DOC/working-agreements.md`, `AMS/DOC/architecture.md`,
`AMS/SPRINTS/sprint-2.md` (S2-R's three boxes only).
**Not touched:** `spike/`, `skill/`, `worker/`, `site/`, `demo.sh`, any other sprint story text,
`AMS/HANDOFF/handoff-2026-08-31-s2-r-retro-nadia.md`.
**Not committed:** nothing in this session was git-committed — see the open question above.

**Sprint/stories touched:** S2-R (completed). Sprint 2 is now fully closed.

---

## Addendum (same day) — the commit question, and the prompt this handoff was missing

Luke answered the open commit question directly: yes, commit DOC/LEARNINGS updates. Done —
`AMS/DOC/architecture.md`, `AMS/DOC/working-agreements.md`, and `AMS/LEARNINGS/sprint-2.md` are
committed as `bc41134` ("S2-R: DOC promotions and LEARNINGS/sprint-2.md"). Nothing else from this
session is committed.

Luke also asked whether I'd written a handoff prompt for Archie. I hadn't — the original version
of this section below said "no prompt needed," which is a gap against `AGENT.md`'s own rule that
every handoff carries a ready-to-paste prompt. Corrected below.

## Prompt for Next Assistant

**Addressed to Archie.**

```
You are Archie, the Site Architect. Read AMS/AGENT.md, your office
(AMS/OFFICES/archie/desk.md, open-threads.md), and this handoff
(AMS/HANDOFF/handoff-2026-08-31-s2-r-learnings-lila.md) — Sprint 2 is fully closed and committed.

Sprint 3 planning is open (AMS/SPRINTS/sprint-3.md already exists, confidence "planned").
Three things worth your attention before or during that pass, none decided for you:

1. S2-7's prompt-caching decision is still open and is explicitly yours (Cody's S2-7 handoff,
   Nadia's S2-R handoff, and your own open-threads.md all point here) - whether to enable
   cache_control on the system prompt by default in S2-2's real handler. Measured: 58% cheaper
   per check with a warm cache, $0.044 vs $0.106.
2. Sprint 3's "Personas this sprint" line lists Cody, Luke, Nadia, Sandy - no Quinn, and no
   demo-runner story like S2-8. Sprint 2 shipped one; Sprint 3 doesn't have one yet. Worth
   deciding whether Sprint 3 needs its own demo.sh pass or can reuse Sprint 2's runner with new
   steps.
3. S3-6 (per-IP rate limit) is already flagged in the story itself as something "Luke may
   strike" - worth confirming with him rather than assuming either way.

Not flagging story reassignments - Nadia already resolved directly with Luke that Cody covering
S3-3/S3-6-adjacent Sandy stories in Sprint 2 was a one-night convenience only; Sprint 3's
assignments (Sandy: S3-1, S3-5, S3-6) stand as written.

Constraints: AGENTS NEVER PUSH. Luke's standing instruction (2026-08-30/31,
DOC/working-agreements.md "Commits") is that each persona commits their own story's work
locally at session end without waiting to be asked - that now applies to you too. Write a
handoff with a Prompt for Next Assistant when you're done; update your office.
```
