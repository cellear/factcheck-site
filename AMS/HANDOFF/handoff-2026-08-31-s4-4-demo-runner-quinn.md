Quinn · claude-haiku-4-5 · S4-4

## What was attempted

S4-4 ("Sprint 4 demo runner and dry-run") from `AMS/SPRINTS/sprint-4.md`. Built the Sprint 4
`demo.sh`, dry-ran it, then handed off to Nadia per `DOC/working-agreements.md`'s standing
Quinn-hands-off-to-Nadia rule.

## What was done

- **Rewrote `demo.sh`** for Sprint 4's three-step demo table. Unlike Sprints 1–3, two of the
  three steps are explicitly testing whether `DOC/runbook.md` is self-sufficient ("Luke, reading
  only DOC/runbook.md... He asked nobody"), so `demo.sh` deliberately does **not** restate the
  actual commands the way Sprint 3's version did — it points at the runbook task number ("task
  2", "task 5") and stops there, per S4-4's scope ("showing where in DOC/runbook.md to look,
  never automated secret changes"). Spelling out the command myself would have defeated the
  point of the test.
  1. Change the invite word — points at runbook task 2; expects old word refused, new word
     works.
  2. Open the site — opens `https://factcheck-site.pages.dev` directly (this step isn't a
     runbook-lookup test, just "does the current, non-custom domain work" since S4-3 is
     deferred).
  3. Read this month's spend — points at runbook task 5; expects a number back.
  - Kept `./demo.sh [start-step]`, `--help`, and the blank-answer-is-a-skip convention.
- **Verified the runbook itself matches what I'm pointing Luke at**: read `DOC/runbook.md` in
  full — task 2 ("Change the invite word") and task 5 ("Read this month's spend") both exist,
  are numbered as I reference them, and each already states its own "how you know it worked"
  check, so `demo.sh` doesn't need to duplicate that either.
- **Spot-checked the live deployment** before finalizing (zero spend): site returns 200,
  a fixture permalink returns 200, `/spend` with a wrong invite word returns 403 — all as
  expected, confirming nothing regressed since Sprint 3.
- **Dry-ran the script's own mechanics**: full-run with piped blanks (clean exit), `./demo.sh 3`
  jump, `--help`. All clean; `git status` showed only `demo.sh` modified.
- **Found and flagged, did not fix**: the sprint file's demo table says step 1 "changes the
  invite word **and redeploys**," but `DOC/runbook.md` task 2 doesn't call for a redeploy — a
  Worker secret takes effect on the next request, no code changes involved. Not a blocking
  failure (redeploying anyway is harmless, just unnecessary), so not a fix story — but flagged
  in `demo.sh`'s own step 1 output so the discrepancy doesn't read as Luke having missed a step,
  and flagged here for Nadia/Luke.

## Outcome

S4-4: both acceptance criteria met.
- [x] Dry-run happened before the live run; documented above.
- [x] This handoff's Prompt for Next Assistant is addressed to Nadia.

## Files created or modified

- `demo.sh` (fully rewritten for Sprint 4)
- `AMS/SPRINTS/sprint-4.md` (S4-4 checkboxes)
- `AMS/OFFICES/quinn/desk.md`

Not touched: `DOC/runbook.md`, `worker/`, `site/`, `AMS/DOC/`, `AMS/LEARNINGS/`, any story text
beyond S4-4. Nothing committed or pushed by me this session.

## Open questions

The redeploy-wording discrepancy above — worth a one-line correction to the sprint file's demo
table by whoever's next through it, though it doesn't block the demo.

## Sprint / story

Sprint 4, S4-4: done. Remaining: the live demo (Nadia + Luke), and after acceptance, S4-R —
which per the sprint file is also this project's closing retro.

---

## Prompt for Next Assistant

Persona: **Nadia (Scrum Master)**. Model: `claude-sonnet-5`. Tool: `claude --model claude-sonnet-5`.

```
You are Nadia, the Scrum Master. Do not guess or change this.

Read AMS/OFFICES/nadia/desk.md FIRST, then AMS/AGENT.md and follow it. Then read
AMS/SPRINTS/sprint-4.md in full and this handoff:
AMS/HANDOFF/handoff-2026-08-31-s4-4-demo-runner-quinn.md.

Quinn's dry-run of `./demo.sh` is done and clean (see that handoff). Per
DOC/working-agreements.md's standing rule, your job is to run the live demo with Luke and
record the verdict — Quinn's session ends at the dry-run, not the live run.

Run `./demo.sh` with Luke from the repo root. It walks through Sprint 4's three demo steps:
changing the invite word using only DOC/runbook.md (task 2), confirming the site works on its
current .dev domain (S4-3/custom domain is deferred), and reading this month's spend using only
DOC/runbook.md (task 5). Two of the three steps are deliberately silent on the exact command —
that's the point: they're testing whether the runbook alone is enough, per the sprint's own
framing ("he asked nobody").

One thing to know going in: the sprint file's demo table says step 1 "changes the invite word
and redeploys," but the runbook's own task 2 doesn't call for a redeploy (secrets take effect
immediately). Not a failure if Luke skips a redeploy — `demo.sh` already notes this so it
doesn't look like a missed step. Worth a one-line fix to the sprint file's demo-table wording if
you want to tidy it, not required for acceptance.

If every step matches its expected outcome, record acceptance in AMS/SPRINTS/sprint-4.md's
Acceptance section (Status/Date/Reviewed by), same pattern as Sprints 1–3. If any step doesn't
match, write a fix story into the same file's Fix Stories section instead.

After acceptance: S4-R is next — per the sprint's "Accepted when" line, this is also the
project's closing retro (final project handoff, you run the retro, Lila writes
LEARNINGS/sprint-4.md and any project-level learning).

Constraints: AGENTS NEVER PUSH. Do not commit unless asked. Update your office (desk.md is
stale, still describing Sprint 3). Write a handoff with a Prompt for Next Assistant.
```
