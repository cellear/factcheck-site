# Handoff — S1-3 complete

**Cody (Coder) · claude-sonnet-5 · S1-3**

---

## What was attempted, and the outcome

Ran the S1-2 spike script (`spike/check.mjs`, unchanged) across 4 claims × 2 models — Luke
supplied 3 claims (GM streetcar conspiracy, Meta AI Instagram hack, 1973-74 DST repeal), Cody
added a 4th (Eiffel Tower) to guarantee 3 clean `ok` reports per model. All 8 runs completed
against the real API. `spike/RESULTS.md` has the full summary table and narrative observations
for Archie's S1-4 read-out. S1-3's story checkbox and all three acceptance criteria are checked
off in `AMS/SPRINTS/sprint-1.md`.

- `spike/RESULTS.md`: one row per run — claim, model, duration, tokens, searches, USD, outcome. ✅
- Completed (`ok`) reports per model: Sonnet 5 has 3 (claims 1, 3, 4), Haiku 4.5 has 4 (all). ✅
- Total spend recorded: **$1.649618** for S1-3, ~$2.37 project-to-date against the $20/month cap. ✅

## What worked, what didn't

**Worked:** the script needed zero changes from S1-2. Running claims fully in parallel via
background bash tasks (after confirming the API path was healthy with one foreground-then-
background run first) got all 8 real API calls done without serializing ~20+ minutes of
sequential wall-clock time.

**Didn't work as scoped:**

1. **The very first run (claim 1, Sonnet 5) hung for 5+ minutes with zero output** on a
   foreground call with a 5-minute Bash timeout — it was killed with no file written and no
   error. Re-running the identical call in the background (no artificial timeout on my end)
   succeeded in 5m40s. This looks like normal Sonnet 5 variance on a claim needing 5 searches,
   not a bug — but it's a real data point that Sonnet 5's tail latency on some claims exceeds
   simple foreground timeouts, worth knowing if anything downstream wraps these calls with a
   short timeout.
2. **A natural (unforced) `tool_error`**: claim 2 (Meta AI Instagram hack) on Sonnet 5 hit
   `max_uses_exceeded` twice after 5 successful searches, with no `--force-tool-error` flag set.
   The model's own text shows it registered the tool failures ("I've gathered enough background
   information") and then wrote a full, well-sourced seven-step report anyway — see
   `spike/results/20260826T172106Z-claude-sonnet-5.md`. The classifier correctly marked this
   `tool_error`, per `DOC/architecture.md`'s failure-handling rule (never fold a tool error into
   a completed verdict) — Cody made no change to that logic. But this is a materially different
   failure shape than S1-2's forced-error case, where the model had zero real grounding and
   fabricated a confident answer. Here the report looks substantively complete and well-sourced.
   Flagged in `spike/RESULTS.md` and `AMS/OFFICES/cody/open-threads.md` as a question for
   Archie/Lila, not something Cody decided unilaterally.
3. **Sonnet 5 missed the demo's 3-minute target on 2 of 4 claims** (5m40s on claim 1, 2m35s
   before erroring on claim 2). Haiku 4.5 was under 3 minutes on all 4 runs, several dramatically
   so (3.4s–20.2s vs. Sonnet 5's 33.5s–5m40s).
4. **Speed/cost is not the whole story — added after Luke asked a follow-up question and Cody
   looked closely at one report pair.** On claim 1 (GM streetcar), both models returned `ok`, but
   Sonnet 5's report (5 searches) caught that GM didn't actually organize National City Lines in
   1936 (a Tennessee bus operator did, 16 years earlier) and that Detroit and Minneapolis — two
   of the four cities the claim names — appear on a specialist source's list of cities with *no
   documented NCL involvement at all*. Haiku 4.5's report (2 searches) missed both and checked
   off all four cities as ✓ correct. This is a real accuracy gap on this claim, not just a
   quality-of-prose difference — see `spike/RESULTS.md`'s "Observations for the S1-4 read-out"
   for the full comparison and both report paths. Cody only looked closely at this one pair;
   whether the pattern holds across the other three is for Archie to check before recommending a
   model on speed/cost alone.

## Current state

- `spike/RESULTS.md` — created, complete, all 8 rows populated from real JSON records
- `spike/results/` — 8 new `.md`/`.json` pairs from this story, plus the 2 pre-existing S1-2
  verification pairs (untouched, not part of S1-3's table)
- `AMS/SPRINTS/sprint-1.md` — S1-3 checkboxes checked, a new bullet added to "Decisions Made This
  Sprint" summarizing the timing and tool_error findings
- Spend this story: $1.649618 across 8 completed API calls (7 `ok`, 1 `tool_error`). Combined
  with S1-2's ~$0.72, project-to-date is ~$2.37 — well under the $20/month cap, but Archie/Nadia
  should know the running total heading into S1-4/S1-5 which don't call the API themselves.

## Open questions

- For Archie (S1-4): is `max_uses: 5` too low for claims needing broad/recent sourcing? Should
  the classifier ever distinguish "search failed after substantial successful grounding" from
  "search failed before any grounding" (S1-2's case)? Not Cody's call — script logic follows
  `DOC/architecture.md` as written.
- The two pre-existing doc corrections from S1-2 (`fallbacks: "default"` model support,
  `max_uses: 0` behavior) are still owed to Lila — carried forward again in
  `AMS/OFFICES/cody/open-threads.md`, not re-explained here.

## Files created or modified

**Created:** `spike/RESULTS.md`, 8 new `spike/results/*.{md,json}` pairs (claims 1-4 × 2 models),
this handoff.

**Modified:** `AMS/SPRINTS/sprint-1.md` (S1-3 checkboxes, Decisions Made This Sprint),
`AMS/OFFICES/cody/desk.md`, `AMS/OFFICES/cody/open-threads.md`.

**Not touched:** `AMS/DOC/`, `AMS/LEARNINGS/` (Lila's), `spike/check.mjs` (no changes needed).

**Sprint/stories touched:** S1-3 (completed).

---

## Prompt for Next Assistant

Persona: **Archie (Architect)**. Model: `claude-opus-5`.

```
You are Archie, the Architect. Do not guess or change this.

Read AMS/AGENT.md and follow it (check AMS/OFFICES/archie/ first if it exists). Then read
AMS/CONFIG.md, AMS/SPRINTS/sprint-1.md, and this handoff
(AMS/HANDOFF/handoff-2026-08-26-s1-3-spike-results-cody.md), plus spike/RESULTS.md in full —
it has the summary table and Cody's detailed observations.

Your stories are S1-4 and S1-5 in AMS/SPRINTS/sprint-1.md:

S1-4 (spike read-out):
- Read spike/RESULTS.md and the underlying reports in spike/results/ (open at least one Sonnet 5
  and one Haiku 4.5 report for the same claim side by side, per the sprint demo script)
- Recommend a model, state a predicted duration, confirm or overturn the three-minute assumption
- IMPORTANT: don't recommend on speed/cost alone. Cody found a real accuracy gap on the claim 1
  (GM streetcar) pair — Sonnet 5 caught two factual errors (a wrong origin date, two named cities
  with no documented involvement) that Haiku 4.5's report missed and let through as correct. Cody
  only checked this one pair closely; check the other three (claims 2-4) before deciding.
- Decide on the max_uses:5 / tool_error question Cody flagged: Sonnet 5 hit a natural tool_error
  on one of four claims after 5 successful searches, with a substantively complete report
  produced anyway — is 5 the right cap, and should the classifier ever treat "failed after
  grounding" differently from "failed before grounding"? This is an architecture decision, not
  Cody's to make.
- List doc corrections needed in DOC/architecture.md for Lila — both the two carried over from
  S1-2 (fallbacks: "default" is Opus/Fable-only; max_uses:0 is a 400 not a per-search error) and
  anything new from S1-4's own read-out
- Write the read-out into the Sprint 1 handoff (a new handoff file, or append per your own
  practice)

S1-5 (report rendering decision):
- Look at what the seven-step report actually renders as (spike/results/*.md has real examples
  now, including one full high-quality report even on the tool_error run)
- Decide with Luke: render verbatim markdown, or parse into a structured page
- Record the decision (Lila writes it into DOC/architecture.md) with an example report attached

Known constraints:
- Total spend so far: ~$2.37 of Luke's $20/month cap (S1-2: ~$0.72, S1-3: $1.649618). Neither
  S1-4 nor S1-5 should need new API calls — they read existing results.
- Luke raised a possible future enhancement during S1-3: let the user pick which model runs the
  check, not limited to Anthropic models. Already logged in sprint-1.md's "Deferred to Later
  Sprints" — deliberately out of MVP scope, not something to act on in S1-4/S1-5, just noting it
  exists for when you scope future sprints.
- AGENTS NEVER PUSH. Do not offer it.
- Do not commit unless asked. Luke shapes the first commit.
- Do not write to DOC/ or LEARNINGS/ yourself if OFFICES/PROTOCOL.md or your own working
  agreement assigns that to Lila — hand corrections to her as a list, per S1-4's acceptance
  criteria ("Any doc corrections are handed to Lila as a list, not applied by Archie").
- Update your office (if you maintain one) and write a handoff before the session ends.
```
