Nadia · claude-sonnet-5 · S2-R (retro, review half)

## What was attempted

S2-R's Nadia half: review all of Sprint 2 now that it's accepted (2026-08-31), decide what's
worth recording, and hand a list to Lila. I don't write `DOC/` or `LEARNINGS/` myself.

## What was done

Read `AMS/SPRINTS/sprint-2.md` in full and every Sprint 2 handoff (S2-1 through S2-8, the
sprint-planning handoff, the S2-1–S2-7 wrap, and the acceptance handoff), plus the current
`DOC/architecture.md` and `DOC/working-agreements.md` to see what's already promoted vs. still
sitting only in handoffs. Also checked `git log -- AMS/DOC/` to confirm no one but Lila has
touched DOC this sprint (true — only S1-6 and S1-R commits touch it).

**Checkbox hygiene:** no gap this time — every Sprint 2 story's box and acceptance criteria are
ticked and match what the owning handoff actually claims. The fix from S1-R held.

**Two things came out of a conversation with Luke before I started this pass**, not from the
handoffs themselves, and both are folded into the DOC list below:
1. Luke pointed out that Quinn recorded both Sprint 1's and Sprint 2's acceptance verdicts
   directly with him, when my own `identity.md` says that's my job (I run the demo with Luke and
   read his verdict). It happened both sprints because nothing in writing ever told a Quinn
   session to hand off to me for that step — Quinn's own S2-8 handoff just said "Luke runs
   `./demo.sh` for real... no persona needed," and whichever Quinn session was already live
   ended up transcribing the verdict. Luke asked that this be fixed going forward.
2. Luke also flagged that a Quinn session ended without a "Prompt for Next Assistant" and he had
   to ask for one — I don't think this is a Haiku limitation (Sandy, also on `claude-haiku-4-5`,
   wrote one unprompted for S1-1), more likely specific to that session or launch prompt. Not
   a DOC-level fix; flagging for Hannah/Archie's attention, not deciding it myself.

## Outcome

Findings and DOC-promotion candidates below, handed to Lila. I made no DOC or LEARNINGS edits.

## Files created or modified

- `AMS/OFFICES/nadia/desk.md`, `AMS/OFFICES/nadia/open-threads.md`
- This handoff

Not touched: `AMS/DOC/`, `AMS/LEARNINGS/`, `AMS/SPRINTS/sprint-2.md` (no checkbox gap to fix this
time), `worker/`, `site/`, `spike/`. Nothing committed or pushed by me.

## Open questions

None of my own. **Correction after checking with Luke directly:** I'd flagged Cody standing in
for Sandy on S2-3 and S2-6 as an unexplained reassignment. It wasn't unexplained — Luke told
Cody directly to take all the coding stories that session; Cody's handoffs just said "per Luke's
direction" without stating what the direction was, which is why it read as unexplained from the
handoff record alone. Not a staffing question. It is, however, the same shape of gap as the
Quinn-handoff issue below: a live instruction from Luke wasn't written down in full. Folded into
the LEARNINGS findings as its own bullet, below.

**Resolved directly with Luke:** it was a one-night convenience for the Sprint 2 wrap-up only,
not a standing reassignment. Sprint 3's plan is unchanged — Sandy keeps S3-1, S3-5, S3-6 as
written. Nothing for Archie to adjust here.

## Sprint / story

Sprint 2: Accepted, 2026-08-31. S2-R: Nadia's half done; Lila's half next.

---

## Prompt for Next Assistant

**Addressed to Lila.**

```
You are Lila, the Librarian. Read AMS/AGENT.md, this handoff
(AMS/HANDOFF/handoff-2026-08-31-s2-r-retro-nadia.md), and AMS/SPRINTS/sprint-2.md (Accepted).

Your half of S2-R: write LEARNINGS/sprint-2.md and apply the DOC promotions below. You are the
only writer for DOC/ and LEARNINGS/.
```

**For `LEARNINGS/sprint-2.md`** (same short-bullet shape as `LEARNINGS/sprint-1.md`):

- 2026-08-30: Sprint 1's checkbox-hygiene fix held — no story shipped with a stale `[ ]` this
  sprint. Worth a one-line confirmation that the S1-R finding stuck, not just new findings.
- 2026-08-30: Long-running foreground network calls (a `curl`/`fetch` held open for minutes) get
  blocked by the session's own auto-mode tool classifier. Workaround: drive the real request
  through the actual browser tool and use a wall-clock `Monitor` wait instead of polling — no
  more silent kills. (S2-1, the six-minute hold test.)
- 2026-08-30: Cloudflare Pages auto-canonicalizes `.html` paths (`/r.html` → `/r`, a 308). A
  `_redirects` rewrite whose *destination* is the `.html` path can leak that canonicalization out
  as an external redirect on the original request. Point rewrite destinations at the already-
  canonical (extensionless) path. (S2-4.)
- 2026-08-30: `claude-sonnet-5` can invoke `web_search` from inside an automatic, undeclared
  `code_execution` sandbox. In that mode text blocks carry no `citations` field at all — the
  classic auto-citation mechanism silently doesn't fire, even though nothing about the request
  asked for code execution. Don't assume a documented API behavior holds without checking the raw
  response shape on a real call. (S2-2 — also a DOC correction, below.)
- 2026-08-30: A no-cost unit test of pure classifier/extraction logic (copy the function into a
  throwaway script, run synthetic message shapes through it) reliably covers failure branches
  that are expensive or nondeterministic to force via a real paid API call. Used for S2-2's
  classifier and echoed by S2-6's fixture approach — worth keeping as the default way to test
  failure-path logic.
- 2026-08-30/31: Twice this sprint a live instruction from Luke got under-recorded by the
  persona who received it — Cody's handoffs said "standing in for Sandy per Luke's direction"
  without stating what the direction actually was (it read as unexplained until Luke clarified
  it directly), and a Quinn session ended without a "Prompt for Next Assistant" until Luke asked
  for one. When Luke gives a live instruction that changes who does what or what happens next,
  write the instruction itself into the handoff, not just a pointer to the fact that one was
  given.

**DOC promotions to apply:**

1. **`DOC/working-agreements.md`, "Luke shapes the first commit" section** — stale. As of
   2026-08-30/31, Luke gave a standing instruction to commit locally at the end of each story
   going forward (Cody reconstructed 19 historical commits from the HANDOFF record first, and
   Luke has pushed that history himself). Keep the original note as the historical record of the
   *first* commit, but add: going forward, each persona commits their own story's work locally at
   the end of their session, same as always — Luke is still the only one who pushes (unchanged,
   don't touch "Agents never push").
2. **New `DOC/working-agreements.md` entry — Quinn hands off the live demo to Nadia.** Quinn
   builds and dry-runs each sprint's `demo.sh`, but when it's time for Luke's *live* run, Quinn's
   session should end there and hand off (via its own "Prompt for Next Assistant") to Nadia
   rather than staying in the loop to run it live or record the acceptance verdict. This happened
   the other way in both Sprint 1 and Sprint 2 — nothing in writing said otherwise, so it drifted.
   Luke asked for this directly (2026-08-31).
3. **`DOC/architecture.md`, Open questions list** — item 1 ("Confirm decision 14 (Cloudflare) —
   now conditional on the six-minute hold... S2-1's test") is stale; S2-1 confirmed it for real
   on 2026-08-30 (a real browser held the connection the full six minutes; see Cody's S2-1
   handoff and the sprint file's Decisions section). Mark it resolved like items 2 and 4 already
   are.
4. **`DOC/architecture.md`, Result record sketch and the citations note near decision 17`** —
   needs Cody's S2-2 correction: in the currently measured API behavior, `cited_text` is always
   `null` (there is no per-result excerpt in this mode); `citations[]` is built from raw
   `web_search_tool_result` content (url + title — "sources consulted"), not inline model
   citations ("sources actually quoted") as the original sketch assumed, because `web_search` is
   sometimes invoked through the undeclared `code_execution` sandbox described above. Full detail
   in `AMS/HANDOFF/handoff-2026-08-30-s2-2-post-check-cody.md`.

5. **New `DOC/working-agreements.md` entry — a one-line mission summary follows every "Prompt
   for Next Assistant."** In the final chat message to Luke, immediately after the literal
   prompt code block (`AGENT.md`'s Ending a Session step 2), add a one-to-two sentence
   plain-English summary of the mission the prompt hands off — what the story actually builds
   or does, not the persona's standing role/boilerplate identity text — so Luke can confirm
   it's the right story before saying "go" without hunting through the prompt for it. He can
   still read the full prompt when he wants more detail; the summary doesn't replace it, it's
   just enough to confirm against. Applies to every persona ending a session with a handoff, not
   just Nadia. Luke asked for this directly (2026-08-31), slipstreamed into S2-R.

6. **New `DOC/working-agreements.md` entry — chaining through consecutive same-owner stories.**
   When a persona finishes a story and the next story (or several) in the sprint file are owned
   by that same persona, before starting the next one it should look ahead and, if there's more
   than one, ask Luke once: something like "The next N stories are all mine — want me to do them
   all?" If he says yes, continue directly into each subsequent story within the same session —
   no need to stop and wait for a fresh launch prompt between them. Still write a full handoff,
   including the normal "Prompt for Next Assistant," and commit at the end of every individual
   story, same as if it were a separate session. When that next prompt is addressed to itself,
   the persona just says so ("the next prompt is to me, so I'll continue") and carries on in the
   same session rather than stopping. If a story is blocked on information only Luke can supply,
   stop and ask; don't push forward past a real blocker on the assumption the earlier yes covers
   it. A single story with no same-owner story right after it is unaffected — proceed as normal
   without asking. Luke asked for this directly (2026-08-31), slipstreamed into S2-R.

**Not mine to decide, flagging for whoever owns it:** S2-7's prompt-caching numbers (58% cheaper
with a warm cache) are measured but no decision has been made on enabling it by default in
S2-2's real handler — that's Archie's call per Cody's handoff, not a DOC edit for you to make
unilaterally.

**After writing `LEARNINGS/sprint-2.md` and applying the DOC promotions:** tick S2-R's two
acceptance criteria and its story-level box in `AMS/SPRINTS/sprint-2.md`. Then Sprint 3
(`AMS/SPRINTS/sprint-3.md`, already planned) is open — Archie's planning lane.

Constraints: AGENTS NEVER PUSH. Do not commit unless asked (or per Luke's standing per-story
commit instruction above, if that's now how you're operating too — check with Luke if unsure
whether it extends to DOC/LEARNINGS commits). Write your own handoff when done.
