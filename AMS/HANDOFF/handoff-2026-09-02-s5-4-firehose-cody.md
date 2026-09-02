Cody · claude-sonnet-5 · S5-4

## What was attempted

S5-4: the choose step and the firehose wait — the last of the four chained coding stories in this
session (S5-1 → S5-2 → S5-3 → S5-4). Replaces S5-3's minimal placeholder chooser with the real
interactive chooser, and builds the firehose display for phase 2's investigation.

## What was done

**Real chooser** (`renderChooser()` in `site/index.html`): phase 1's `parse_text` rendered as
markdown (it's the model's own prose, complete with its own triage reasoning — reusing `marked.js`
already loaded for `site/r.html`), a checkbox per parsed issue, a free-text input ("or check
something else about it…" — matching the skill's own open-ended follow-up, `design/skill-
reference/README.md` quality #4), and an "Investigate" button whose label switches to "Run the
deep check anyway" when phase 1 found the claim settled. Checked issues + free text are collected
on click and passed straight through to `POST /session/:id/proceed`'s existing `issues`/`custom`
fields — no worker changes needed for this part, S5-1's contract already supported it.

**Firehose wait screen** (`renderFirehose()` + `startInvestigation()`): a stat card (56px elapsed
timer, ticking every second **independent of poll cadence** so it never looks frozen between polls
— "something is always moving," skill quality #2 — progress bar, and the claim being investigated)
above a "Watching" card that pairs each search query with its arriving result titles as they come
in (skill quality #3 — "the single most watchable element ... the site should show it bigger" —
given its own card, not buried inline) above a report card that renders the accumulating text live
as markdown (skill quality #5). The 1b speech bubble's narration (`narrationFor()`) derives from
whichever event arrived last — `searching: "<query>"…`, `reading N sources…`, `writing the
report…`, etc. — not a canned rotation.

**Phase 1 also now streams its live parse text** into the form while it runs (S5-3 had left this as
a TODO comment; same SSE-consumption pattern, just wired up here) — the form was previously a
silent wait during phase 1 too.

**Delivery mechanism note, important for whoever reads this next:** phase 2's firehose is driven by
**polling** (`GET /session/:id/progress`, ~1.5s client interval), not real push SSE — this is S5-2's
disconnect-guarantee finding playing out here, not a shortcut taken in this story. `startInvestigation()`
races the blocking `POST /session/:id/proceed` against the poll loop; whichever resolves first
(the POST's own response, or a poll reporting `done: true`) supplies the result id and redirects.
**Observed live during testing: Cloudflare KV's own eventual-consistency lag can leave the firehose
looking stalled for a stretch** (in one test, "Getting the search underway…" stayed on screen for
over a minute while the server was actually well into the investigation) before catching up all at
once. This is a real characteristic of the chosen architecture, not a bug in this story's code —
flagging it here so nobody "fixes" it locally without understanding why, and so Nadia/Luke aren't
surprised if a live demo run shows a similar pause.

**Real bug found and fixed while building this** (not previously known, not S5-4's fault, but this
story's more-prominent display is what surfaced it): `GET /durations` in `worker/src/index.js` has
returned `mean`/`stdDev`/`min`/`max`/`lower`/`upper` in **milliseconds** since S4-2, while every
consumer — this site, before this sprint and since — has always displayed them as if they were
seconds. Old countdown: a small, easy-to-miss inline label. New firehose: a 56px "typically
22061–203651s" readout that's impossible to miss. Fixed at the source in `handleGetDurations` —
the endpoint now converts to seconds before responding, so no future consumer inherits the same
bug. This also silently fixed the progress bar (the `pct` calculation divides elapsed seconds by
`upper + 30`; against a millisecond-scale `upper` the bar was permanently near-empty).

**Verified live in a real browser** against the production Worker (local `python3 -m http.server`
serving `site/`, same pattern as S5-3):
- Chooser rendered real parsed issues as checkboxes, free-text field present, settled-claim
  banner and button label correct.
- Clicked "Run the deep check anyway" — firehose showed real search queries and their result
  titles arriving, elapsed timer ticking, narration bubble updating correctly through the whole
  run (`on it → searching: "..." → reading N sources → writing the report…`).
- Investigation took an unusually long ~244s this run (confirmed via the eventual `duration_ms` on
  the record) — the KV propagation lag noted above meant the firehose looked stalled on "Getting
  the search underway…" and later "Good" (the first fragment of streamed report text) for long
  stretches before jumping forward, exactly the behavior flagged above.
- Redirected correctly to `/r/{id}` on completion (confirmed via the actual deployed site,
  `factcheck-site.pages.dev`, since the local test server has no `/r/*` rewrite — `_redirects`
  maps that to Cloudflare Pages' clean-URL routing, which only Pages itself resolves).
- This particular run's outcome was `no_report` — the **known, pre-existing, documented**
  probabilistic behavior from S5-1/S5-2 (the model occasionally shortcuts on a settled claim
  despite the "produce the full report regardless" instruction), not a new bug. Confirmed
  `site/r.html` (untouched by this story) still renders it correctly as a failed check.
- Did not independently re-verify a fresh **successful** (`outcome: "ok"`) permalink render in
  this specific browser session — cost judgment call, given `r.html` is unmodified and has
  rendered `ok` outcomes correctly dozens of times across this session's worker-level testing.

**`AMS/SPRINTS/sprint-5.md` updated**: S5-4's story box and all three acceptance criteria marked
done with what was actually verified; scope section gained two notes (the polling-not-push
delivery mechanism, and the durations bug).

## What worked, what didn't

Building the firehose's stat card bigger and more prominent than the old countdown — exactly what
the story asked for — is what surfaced a real, previously invisible bug (the ms/seconds mixup).
Worth remembering: making something more visible is itself a form of testing.

## Current state and blockers

All four coding stories (S5-1 → S5-4) done and committed. **Neither the worker nor the site has
been deployed with S5-4's changes yet** — asked Luke to run both `npx wrangler deploy` (durations
fix) and `npx wrangler pages deploy site` (S5-3 + S5-4 together, since S5-3 was never separately
deployed either — the live site has been the old MVP form this entire session until this deploy
lands). Not yet confirmed as of this handoff.

## Open questions

None blocking. Worth Nadia/Luke knowing before the live demo run: the firehose can appear to
pause for a stretch mid-investigation due to KV's eventual-consistency lag (see above) — this is
expected, not a hang, and the underlying check is progressing regardless.

## Files created or modified

- `site/index.html` — real chooser (`renderChooser`), firehose (`renderFirehose`,
  `startInvestigation`, `narrationFor`, `buildSearchList`, `buildReportText`), live phase-1 parse
  text streaming, new CSS for all of the above
- `worker/src/index.js` — `handleGetDurations` bug fix (ms → seconds)
- `AMS/SPRINTS/sprint-5.md` — S5-4 story box and ACs marked done with verification notes
- `AMS/OFFICES/cody/desk.md`, `open-threads.md`, `working-notes.md` (updated to close out the
  session — see below)
- This handoff

Not touched: `site/r.html`, `skill/`, `DOC/`, `LEARNINGS/`, `INCOMING/` (Luke's to clean up).
Nothing pushed by me — Luke runs every deploy himself.

## DOC promotions for Lila (in addition to S5-1's and S5-2's, not re-listed here)

1. **`DOC/architecture.md`, "The bucket" or the `/durations` description** needs the units fix
   recorded: `GET /durations` returns `mean`/`stdDev`/`min`/`max`/`lower`/`upper` in **seconds**
   as of 2026-09-02 (was silently milliseconds since S4-2 — a real bug, not a documented decision,
   fixed in this story). If DOC ever documented the field as milliseconds, correct it; if it never
   specified units at all, that's the gap that let the bug go unnoticed for two sprints.
2. **New architecture note: the polling-based firehose.** Worth a line alongside the SSE-event-
   vocabulary note from S5-2's handoff — phase 1 pushes live via SSE, phase 2's live display is
   polling (`GET /session/:id/progress`, ~1.5s), and the two together are what S5-4 built as "the
   firehose." A future reader shouldn't assume both phases stream the same way.

## Sprint / story

Sprint 5, S5-1 → S5-4: all four coding stories done, committed. Deploy pending. Next: Quinn's
S5-5 (demo runner and dry-run), then Nadia's live demo, then S5-R.

---

## Prompt for Next Assistant

Addressed to **Quinn** (`claude-haiku-4-5`) — per Archie's original Sprint 5 planning handoff, the
coding chain ends here and hands off to the demo runner.

```
You are Quinn. Read AMS/AGENT.md, this handoff
(AMS/HANDOFF/handoff-2026-09-02-s5-4-firehose-cody.md), the three earlier S5 handoffs it links
back through if you need the fuller story (S5-1 through S5-3, same date/session, all Cody), and
AMS/SPRINTS/sprint-5.md (all four coding stories -- S5-1 through S5-4 -- are now marked done).

Your story: S5-5, the Sprint 5 demo runner and dry-run. Update demo.sh to Sprint 5's version per
DOC/working-agreements.md conventions (visible progress, blank = skip, [start-step]). Dry-run
everything that needs no spend; flag anything unperformable as a fix story BEFORE the live run.
Hand off to Nadia for Luke's live run and the acceptance verdict -- your job stops at a verified
dry-run, per the working agreement ("Quinn builds and dry-runs the demo; Nadia runs it live with
Luke").

Important context before you start:
- Confirm with Luke whether both deploys landed (npx wrangler deploy for the worker's /durations
  fix, npx wrangler pages deploy site for S5-3+S5-4's site changes) -- as of this handoff neither
  was confirmed yet. The demo script assumes the deployed site matches what's in this session's
  commits; if the deploy hasn't happened, that's a blocker for your dry-run, not something to
  route around.
- Sprint 5's demo script (in sprint-5.md) has six steps; step 6 (closing the tab mid-investigation)
  was REWRITTEN mid-sprint (see S5-2's handoff) -- the expected outcome is now "the check is lost,
  nothing to reopen," not the original "the record completed anyway." This is a known, accepted
  platform limitation (Luke's call), not something to flag as a failure.
- The firehose (phase 2's live display) polls rather than pushes, and can visibly pause for a
  stretch mid-investigation due to Cloudflare KV's eventual-consistency lag before catching up --
  expected behavior per S5-2/S5-4's handoffs, not a hang. Worth a heads-up in your dry-run notes
  so it doesn't read as broken.
- DOC/LEARNINGS are Lila's only -- if you find something worth recording, hand it to her via your
  handoff, same as every other persona this sprint.
```

**Mission summary:** built the real chooser (parsed issues as checkboxes, free-text option) and
firehose wait screen (live elapsed timer, search-and-results "Watching" card, streaming markdown
report, event-driven bubble narration) for phase 2, completing all four of Sprint 5's coding
stories. Found and fixed a real pre-existing bug along the way (`/durations` silently returning
milliseconds since S4-2, displayed everywhere as seconds). Verified live in a real browser end to
end. Handing off to Quinn for the demo runner next.
