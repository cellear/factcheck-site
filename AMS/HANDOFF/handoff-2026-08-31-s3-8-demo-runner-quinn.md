Quinn · claude-haiku-4-5 · S3-8

## What was attempted

S3-8 ("Sprint 3 demo runner and dry-run") from `AMS/SPRINTS/sprint-3.md`. Built the Sprint 3
`demo.sh`, dry-ran everything possible without spending or needing other people, then handed off
to Nadia per `DOC/working-agreements.md`'s standing rule — I do not run the live demo myself.

## What was done

- **Rewrote `demo.sh`** for Sprint 3's five-step demo table:
  1. Wrong invite word — guided (opens the site, asks Luke to submit with the wrong word).
  2. Spend cap — prints the exact `cd worker && npx wrangler secret put SPEND_CAP_USD` command
     for both the 0.01 flip and the restore to 20, rather than running it; guides Luke through
     submit-with-wrong-cap, restore, submit-again.
  3. `/spend` — asks for the invite word to build the link (blank = skip), opens it.
  4. `fixture-tool-error` and `fixture-refusal` (S2-6) — opens both automatically; also offers
     to open a real refusal's permalink if S3-3 provoked one this sprint (blank = skip, since
     none was deliberately provoked — see Cody's S3-2/S3-3/S3-7 handoff).
  5. Send the link + invite word to three people — guided.
  - Kept the standing conventions: `./demo.sh [start-step]`, `--help`, blank = skip wherever a
    value is actually requested.
- **Independently re-verified**, zero spend:
  - `fixture-tool-error` and `fixture-refusal` via both the Worker's JSON (`outcome` fields
    correct; `fixture-refusal` now carries `refusal_category: "fixture_category"` from S3-3) and
    the actual rendered site pages (browser automation) — both show "Check failed", no verdict,
    and the refusal fixture now shows "Category: fixture_category".
  - The form page shows S3-5's updated privacy copy ("Don't paste anything you want kept
    private...").
  - `GET /spend?invite_word=<wrong>` returns 403 with no spend, confirming the gate — did not
    attempt the real invite word (not mine to know or spend against).
- **Dry-ran the script's own mechanics** with piped input: full-skip path (all five steps,
  clean exit), `--help`, `./demo.sh 3` and `./demo.sh 4` (start-step continues through the
  remaining steps, as designed — confirmed this needs proportionally more input, not a bug),
  and the real-refusal id-vs-URL normalization at step 4. All clean once given enough input; a
  couple of early non-zero exits during testing were my own test scripts under-supplying blank
  lines, re-confirmed clean with more headroom.

## Outcome

S3-8: both acceptance criteria met.
- [x] Dry-run happened before the live run; documented above.
- [x] This handoff's Prompt for Next Assistant is addressed to Nadia.

## Files created or modified

- `demo.sh` (fully rewritten for Sprint 3)
- `AMS/SPRINTS/sprint-3.md` (S3-8 checkboxes)
- `AMS/OFFICES/quinn/desk.md`

Not touched: `worker/`, `site/`, `AMS/DOC/`, `AMS/LEARNINGS/`, any story text beyond S3-8.
Nothing committed or pushed by me this session (`git status` showed only `demo.sh` modified).

## Open questions

None from me. S3-5's acceptance box (Luke reading/accepting the page copy) is still open in the
sprint file — not blocking my dry-run, but worth Nadia/Luke closing during the live run since
there's no dedicated demo step for it.

## Sprint / story

Sprint 3, S3-8: done. Remaining: the live demo (Nadia + Luke) and, after acceptance, S3-R.

---

## Prompt for Next Assistant

Persona: **Nadia (Scrum Master)**. Model: `claude-sonnet-5`. Tool: `claude --model claude-sonnet-5`.

```
You are Nadia, the Scrum Master. Do not guess or change this.

Read AMS/OFFICES/nadia/desk.md FIRST, then AMS/AGENT.md and follow it. Then read
AMS/SPRINTS/sprint-3.md in full and this handoff:
AMS/HANDOFF/handoff-2026-08-31-s3-8-demo-runner-quinn.md.

Quinn's dry-run of `./demo.sh` is done and clean (see that handoff). Per
DOC/working-agreements.md's standing rule, your job is to run the live demo with Luke and
record the verdict — Quinn's session ends at the dry-run, not the live run.

Run `./demo.sh` with Luke from the repo root. It walks through Sprint 3's five demo steps:
wrong invite word, the spend-cap flip (two `wrangler secret put` commands Luke runs himself —
the script prints them, doesn't run them), `/spend`, the tool_error/refusal fixtures, and
sending the link to three people.

Also worth closing during this session, not a separate demo step: S3-5's acceptance box ("Luke
reads both pages and accepts the wording") is still open in AMS/SPRINTS/sprint-3.md — the copy
is drafted and deployed (Cody's handoff), just needs Luke's read and a tick.

If every step matches its expected outcome in the sprint file's demo table, record acceptance
in AMS/SPRINTS/sprint-3.md's Acceptance section (Status/Date/Reviewed by), same pattern as
Sprints 1 and 2. If any step doesn't match, write a fix story into the same file's Fix Stories
section instead — a sprint is accepted by demo or it isn't over.

After acceptance: S3-R (retro) is next — you run it, Lila writes LEARNINGS/sprint-3.md.

Constraints: AGENTS NEVER PUSH. Do not commit unless asked. Update your office (desk.md is
stale, still describing Sprint 2). Write a handoff with a Prompt for Next Assistant.
```
