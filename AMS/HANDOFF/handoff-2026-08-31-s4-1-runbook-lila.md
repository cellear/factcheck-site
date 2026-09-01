# Handoff — S4-1: The runbook

**Lila (Librarian) · claude-sonnet-5 · S4-1**

No API calls made. No change to project spend.

---

## What was attempted and the outcome

Wrote `DOC/runbook.md` per Sandy's handoff and `AMS/SPRINTS/sprint-4.md`'s S4-1 scope. Ten
tasks, each in "symptom or intent → exact commands → how you know it worked" form, sourced from
the actual handoffs and code rather than re-derived from memory:

1. Change the spend cap (`SPEND_CAP_USD`)
2. Change the invite word (`INVITE_WORD`)
3. Change the model — including the easy-to-miss part: `PRICES_USD_PER_MTOK` needs a matching
   entry or cost computation silently produces `NaN`, and switching to Haiku 4.5 needs the older
   `web_search_20250305` tool variant
4. Re-vendor the skill — there is no `vendor.mjs` script (Sandy's prompt assumed one; none
   exists), so this is written as the manual process it actually is: copy `SKILL.md`, update
   `skill/SOURCE.md`'s commit hash and date, redeploy
5. Read this month's spend (`GET /spend`)
6. Redeploy worker and site — including which directory each command runs from (`worker/` vs.
   the repo root) and which of `wrangler pages deploy`'s two printed URLs is the stable one
7. Budget-cap-reached vs. Console-balance-empty — the two-cause distinction the story called
   out, with the actual S2-7 numbers ($1.01 balance, a $10 top-up that looked like $20) as a
   concrete example of what to check twice
8. Where all three Worker secrets live and how each was originally set
9. All five fixture permalinks and what each proves, with the actual URLs
10. `demo.sh` conventions (`[start-step]`, blank = skip, visible progress)

Added a one-line entry for `runbook.md` to `DOC/README.md`'s index — the exception in my
constraints for touching DOC beyond the runbook itself ("except to cross-link from runbook").

**Did not touch `AMS/SPRINTS/sprint-4.md`.** S4-1's acceptance criterion ("Luke performs the
demo using only the runbook") can't be verified by me — it needs Luke's live run, same shape as
S3-5's copy-acceptance box last sprint. Leaving that tick to whoever records the live demo
verdict (Quinn's dry-run, then Nadia's live-run record), not assuming it myself.

## What worked, what didn't

Worked: every command in the runbook is one I could point at an actual handoff or the live code
(`worker/src/index.js`, `worker/wrangler.jsonc`, `worker/fixtures/seed.mjs`, `demo.sh`) rather
than reconstructing from the story text alone — caught the missing `vendor.mjs` script this way
before writing a procedure around a tool that doesn't exist.

Didn't: nothing blocked.

## Current state and blockers

- S4-1: **written**, not yet accepted — acceptance is Luke's live-demo call (task for S4-4).
- `DOC/runbook.md` exists, indexed in `DOC/README.md`.
- Next: **S4-4** (Quinn) — dry-run the Sprint 4 demo (including the runbook-only invite-word
  change), then hand off to Nadia for Luke's live run.

## Open questions

None of my own.

## Files created or modified

**Created:** `AMS/DOC/runbook.md`, this handoff.
**Modified:** `AMS/DOC/README.md` (one new index line).
**Not touched:** `AMS/DOC/architecture.md`, `AMS/DOC/working-agreements.md`,
`AMS/LEARNINGS/`, `spike/`, `demo.sh`, `AMS/SPRINTS/sprint-4.md`, `worker/`, `site/`.

**Sprint/stories touched:** S4-1 (written; acceptance pending Luke's live demo).

---

## Prompt for Next Assistant

**Addressed to Quinn.**

```
You are Quinn, QA/Tester. Read AMS/AGENT.md, your office, this handoff, DOC/runbook.md (the
document your dry-run has to prove works), and AMS/SPRINTS/sprint-4.md.

Your story is S4-4: update demo.sh to the Sprint 4 version, dry-run every step that needs no
spend and no domain purchase, and flag anything that can't be performed as written as a fix
story BEFORE the live run. Per DOC/working-agreements.md: runbook-driven steps (spend cap,
invite word) are guided prompts showing exactly where in DOC/runbook.md to look and what command
to run — never automated writes to production secrets. When your dry-run is clean, hand off to
Nadia for Luke's live run and the acceptance verdict; your session ends there.

The Sprint 4 demo script (3 steps, from AMS/SPRINTS/sprint-3.md's pattern):
1. Luke, reading only DOC/runbook.md, changes the invite word and redeploys — new word works,
   old word refused, no help asked.
2. Luke opens the site on its current domain (factcheck-site.pages.dev — S4-3/custom domain is
   deferred, Luke chose to stay on .dev for now) — it works.
3. Luke reads this month's spend via the runbook — a number comes back.

Constraints: AGENTS NEVER PUSH. Commit your own work locally at session end. Update your office.
Write a handoff with a Prompt for Next Assistant (and its mission-summary line in chat)
addressed to Nadia.
```

**Mission summary:** wrote the Sprint 4 runbook (`DOC/runbook.md`) — the one document Luke needs
to run every routine task (secrets, redeploys, spend checks, fixtures) without asking anyone;
next up is Quinn dry-running the demo that proves the runbook actually works standalone.
