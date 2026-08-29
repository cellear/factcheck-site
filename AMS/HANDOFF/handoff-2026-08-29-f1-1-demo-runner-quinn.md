Quinn · claude-haiku-4-5 · F1-1

## What was attempted

F1-1 ("The demo runs from one command, and same-claim reports are findable") from
`AMS/SPRINTS/sprint-1.md`'s Fix Stories section.

## What was done

- Added a **Files** column to the results table in `spike/RESULTS.md`. Derived each filename by
  reading every `spike/results/*.json`, matching on `claim_text` + `model` + `created_at` (not
  guessed from timestamps). All 8 rows now carry the correct `.md` filename; verified every
  filename actually exists on disk.
- Created `demo.sh` at the repo root (`chmod +x`), walking the four Sprint 1 demo steps in order
  with a pause between each:
  1. Prints and opens `spike/RESULTS.md`.
  2. Groups `spike/results/*.json` by `claim_text`, lists only claims with one
     `claude-sonnet-5` and one `claude-haiku-4-5` record (numbered, short excerpt), opens the
     pair Luke picks.
  3. Refuses with a one-line message if the key file is missing; otherwise prompts for a claim
     and runs `ANTHROPIC_API_KEY="$(cat /Users/lukemccormick/Sites/CLAUDE/fact-check-key.key)" node spike/check.mjs "<claim>" --model claude-sonnet-5`,
     prints elapsed seconds and whether it was under 180, opens the new report.
  4. Prints and opens the S1-4 read-out handoff.
- Dry-ran steps 1, 2, and 4 myself. For step 3, the key file exists on this machine, so I could
  not exercise the "missing key" branch against the real path without moving the user's key —
  instead I made a throwaway `sed`-substituted copy of `demo.sh` with the key path pointed at
  `/tmp/does-not-exist.key`, ran that copy end to end, and deleted it afterward. Confirmed: the
  guard fires with exactly the one-line refusal, the script does not crash, and it continues
  cleanly into step 4. Also confirmed on the real `demo.sh` (piped input, then EOF at the claim
  prompt) that step 3 builds and would run the exact command from the story — I stopped before
  the command executes, so no live API call was made and no `spike/results/` file was created
  by me.
- Verified step 2 lists exactly the four S1-3 claim pairs — the two S1-2 Great Wall runs (both
  `claude-sonnet-5`, no Haiku record) are correctly excluded by the "needs both models" rule.

## Outcome

3 of 4 F1-1 acceptance criteria ticked:
- [x] `spike/RESULTS.md` Files column, every filename verified to exist
- [x] `./demo.sh` performs steps 1, 2, 4 without Luke opening a file himself; step 3 needs only
      a typed claim
- [x] Step 2 lists exactly the four S1-3 claims
- [ ] "`git status` after a full run shows changes only under `spike/results/`" — left unticked
      on purpose. This can only be proven by an actual step-3 run (spends real money), which
      stays Luke's to trigger. Whoever watches him run `./demo.sh` for real should confirm this
      box afterward.

`git status` right now shows only `demo.sh` (new) and `spike/RESULTS.md` (modified) beyond the
pre-existing untracked project files — nothing written outside what the story allowed.

## Files created or modified

- `demo.sh` (new, executable)
- `spike/RESULTS.md` (Files column added)
- `AMS/SPRINTS/sprint-1.md` (F1-1 acceptance boxes ticked, one left open with a note)
- `AMS/OFFICES/quinn/desk.md`, `AMS/OFFICES/quinn/working-notes.md` (updated)

Not touched: `spike/check.mjs`, `AMS/DOC/`, `AMS/LEARNINGS/`, any story text beyond F1-1's
checkboxes. Nothing committed or pushed.

## Open questions

None new.

## Sprint / story

Sprint 1, F1-1 (Quinn) — functionally complete; one acceptance box deliberately deferred to
Luke's live run.

---

## Prompt for Next Assistant

F1-1 is done except for one box only provable by a live run. Next up: **Luke runs `./demo.sh`
himself** from the repo root — no persona needed for that. When he's done:

1. He (or whoever's narrating, likely Archie) should confirm `git status` shows changes only
   under `spike/results/` after the run, and tick that last F1-1 box in
   `AMS/SPRINTS/sprint-1.md` if true.
2. If the demo goes cleanly end to end, Sprint 1's "Accepted when" criteria in the same file are
   ready for Luke's acceptance call — S1-6 (Lila, DOC ownership) is already done, so nothing
   else in Sprint 1 is blocking.
3. If accepted, S1-R (Nadia runs retro, Lila writes `LEARNINGS/sprint-1.md`) is the remaining
   Sprint 1 story.

No code or doc work is queued for me right now. Read `AMS/AGENT.md`, this handoff, and
`AMS/SPRINTS/sprint-1.md` before picking up the next QA-lane story (Sprint 2's demo runner, once
it exists).
