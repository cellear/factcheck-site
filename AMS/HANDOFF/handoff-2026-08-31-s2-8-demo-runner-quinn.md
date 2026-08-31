Quinn · claude-haiku-4-5 · S2-8

## What was attempted

S2-8 ("Sprint 2 demo runner and dry-run") from `AMS/SPRINTS/sprint-2.md`. Replaced `demo.sh`
with the Sprint 2 version and dry-ran everything possible before Luke's live run.

## What was done

- **Rewrote `demo.sh`** for Sprint 2's demo table (four steps, per the sprint file):
  1. Live check on Luke's phone at `https://factcheck-site.pages.dev` — guided prompt only
     (can't automate a phone); asks for the resulting `/r/<id>` URL or bare id afterward.
  2. Same permalink in a private/incognito window on the laptop — guided (can't reliably force
     a private window open across browsers); reuses the URL from step 1 if already entered,
     otherwise asks again.
  3. Texting the link to one person — guided; reuses the same URL, waits for confirmation.
  4. The five S2-6 failure fixtures — fully automated: opens each via `open`, with a header
     stating what should render, pausing between.
  - Kept the `DOC/working-agreements.md` conventions from Sprint 1: `./demo.sh [start-step]` to
    jump to a step, `--help`, and every prompt treats a blank answer as an explicit skip
    (steps 1–3 all skip cleanly with no URL).
- **Independently re-verified all 5 S2-6 fixtures myself**, not just taking Cody's handoff on
  faith — via `curl` against the Worker's `GET /r/:id` JSON (confirmed each `outcome` field:
  `refusal`, `tool_error`, `truncated`, `no_report`, and `ok` + `search_cap_hit: true`) and via
  browser automation against the actual rendered site pages for all 5, plus the base form page
  and an unknown id. All five render exactly as expected: the four failure fixtures show "Check
  failed" with no report and no verdict; `fixture-search-cap-hit` shows a full report, a Sources
  list, and the search-budget note together; unknown id shows "No result found for this link.";
  no console errors on any page. Zero spend — all reads against already-deployed, already-seeded
  data.
- **Dry-ran `demo.sh`'s own mechanics** with piped input, no phone, no spend: full-skip path
  (all four steps skipped, clean exit), a bare-id entered at step 1 correctly reused (not
  re-prompted) at steps 2 and 3 and correctly normalized into a full URL, a full URL entered
  directly passed through without double-prefixing, `--help`, and `./demo.sh 4` jumping straight
  to the fixtures step alone. All exits clean (0) once given enough input; the two non-zero
  exits during testing were my own test scripts under-supplying blank lines for `pause`, not
  script bugs — confirmed by recounting and re-running.

## Outcome

S2-8: both acceptance criteria met.
- [x] Dry-run happened before Luke's live run; documented above.
- [x] `./demo.sh` covers all four demo steps; it writes nothing locally at all this sprint (no
  local check runs — the live check happens through the deployed site on Luke's phone), so the
  "writes nothing outside what a check itself writes" bar is trivially met. `git status` after
  the full dry-run showed only `demo.sh` itself as modified.

Steps 1–3 could not be fully dry-run for real — they need Luke's phone and, for step 3, a second
person — consistent with Sprint 1's pattern of leaving the genuinely-live, human-only parts to
Luke.

## Files created or modified

- `demo.sh` (fully rewritten for Sprint 2)
- `AMS/SPRINTS/sprint-2.md` (S2-8 checkboxes)
- `AMS/OFFICES/quinn/desk.md`

Not touched: `worker/`, `site/`, `AMS/DOC/`, `AMS/LEARNINGS/`, any story text beyond S2-8.
Nothing committed or pushed by me this session (`git status` shows only `demo.sh` modified,
tracked from an earlier commit).

## Open questions

None from me. Sprint 2 acceptance itself is Luke's call once he's run the live demo — I have
not touched the Acceptance section in `AMS/SPRINTS/sprint-2.md`.

## Sprint / story

Sprint 2, S2-8: done. Remaining before acceptance: Luke's live run of steps 1–3 (phone +
private window + a second person); step 4 is already fully proven.

---

## Prompt for Next Assistant

S2-8 is done. Next: **Luke runs `./demo.sh` for real** from the repo root — no persona needed
for that part. Once he's done:

1. Confirm all three views of one permalink match (phone → private window → texted link) and
   all five fixtures rendered as expected (four failures, one verdict-with-note) — if anything
   doesn't match, a fix story goes into `AMS/SPRINTS/sprint-2.md`'s Fix Stories section per
   `DOC/working-agreements.md`'s "a sprint is accepted by demo, or it isn't over" rule.
2. If it passes, Luke records acceptance in `AMS/SPRINTS/sprint-2.md`'s Acceptance section
   (Status/Date/Reviewed by), same as Sprint 1.
3. After acceptance, **S2-R** (retro — Nadia runs it, Lila writes `LEARNINGS/sprint-2.md`) is
   the one remaining Sprint 2 story.

Read `AMS/AGENT.md`, this handoff, and `AMS/SPRINTS/sprint-2.md` before picking up whichever of
those is next.
