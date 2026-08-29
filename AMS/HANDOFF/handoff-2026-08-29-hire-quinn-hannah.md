Hannah · claude-sonnet-5 · staffing (F1-1 unblocked)

## What was attempted

Hired **Quinn (QA / Tester)**, per Archie's staffing decision in the "Addendum" /
"Staffing change" sections at the end of
`AMS/HANDOFF/handoff-2026-08-28-s1-4-s1-5-spike-readout-archie.md`: Luke decided QA was missing
from the team after the first Sprint 1 demo attempt stalled at step 2, and reassigned F1-1
(the demo-runner fix story) from Sandy to a new QA persona.

## What was done

- Created `AMS/OFFICES/quinn/{identity,desk,open-threads,working-notes}.md` from `_template/`,
  in the Lane / Working stance / What I'm not structure the other offices use. Quinn's lane:
  builds each sprint's `demo.sh`, dry-runs the sprint's demo table before Luke performs it,
  flags any step that can't be performed as written as a fix story; later writes/runs tests
  once there's product code. Runs on `claude-haiku-4-5` for runners and dry-runs; Sonnet only
  if and when Quinn is writing real test suites.
- Added `quinn` to the roster in `AMS/CONFIG.md`.
- `desk.md` points Quinn at F1-1 in `AMS/SPRINTS/sprint-1.md` as the first story.

## Outcome

Nothing I decided while hiring conflicts with F1-1's owner (Quinn) or model line
(`claude-haiku-4-5`) in `AMS/SPRINTS/sprint-1.md` — both already named Quinn before I started.
Cleared to launch. The Quinn prompt below is Archie's, copied verbatim as instructed; it does
not depend on my office text since F1-1 is fully specified in the sprint file.

## Files created or modified

- `AMS/OFFICES/quinn/identity.md` (new)
- `AMS/OFFICES/quinn/desk.md` (new)
- `AMS/OFFICES/quinn/open-threads.md` (new)
- `AMS/OFFICES/quinn/working-notes.md` (new)
- `AMS/CONFIG.md` (roster line)
- `AMS/OFFICES/hannah/desk.md` (updated)

Not touched: `AMS/DOC/`, `AMS/LEARNINGS/`, `spike/`, `skill/`, any story text. Nothing
committed or pushed — AGENTS NEVER PUSH, and Luke shapes commits himself.

## Open questions

None new. Carried items are unchanged in `AMS/OFFICES/hannah/open-threads.md`.

## Sprint / story

Sprint 1, unblocks **F1-1** (Quinn).

---

## Prompt for Next Assistant

Persona: **Quinn (QA / Tester)**. Model: `claude-haiku-4-5`. Tool: Claude Code —
`claude --model claude-haiku-4-5`.

```
You are Quinn, QA / Tester. Do not guess or change this.

Read AMS/OFFICES/quinn/desk.md FIRST, then AMS/AGENT.md and follow it. Then read
AMS/CONFIG.md and AMS/SPRINTS/sprint-1.md — your story is F1-1 under "Fix Stories"; follow its
scope and acceptance criteria exactly. Skim spike/RESULTS.md and one spike/results/*.json to
see the record shape (claim_text, model, created_at).

Do:
- Add a Files column to the results table in spike/RESULTS.md, derived from the .json records.
- Create demo.sh at the repo root (chmod +x) that walks the four demo steps in
  AMS/SPRINTS/sprint-1.md's "Sprint Demo Script" table, pausing for Enter between steps.
- Dry-run steps 1, 2, and 4 yourself — that is your lane. Do NOT run step 3 yourself: it costs
  real money and is Luke's to run. Verify the command it builds is exactly the one in the
  story and that the key-file guard works when the file is absent.

Do not:
- Modify spike/check.mjs, anything under AMS/DOC/ or AMS/LEARNINGS/, or any story text other
  than F1-1's checkboxes.
- Let demo.sh write anywhere except what check.mjs itself writes under spike/results/.
- Commit or push. AGENTS NEVER PUSH.

When done: tick F1-1's boxes you verified, update your office, and write a handoff with a
Prompt for Next Assistant. Next is Luke running ./demo.sh; if S1-6 (Lila) is not yet done, say
so in the prompt.
```
