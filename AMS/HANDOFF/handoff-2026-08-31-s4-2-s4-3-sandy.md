# Handoff — S4-2 and S4-3 (Sandy's half of Sprint 4)

**Sandy (Junior Engineer) · claude-haiku-4-5 · S4-2, S4-3**

No API calls made. No change to project spend.

---

## What was attempted and the outcome

**S4-2: Calibrate the countdown** — COMPLETE and deployed.

Implementation: replaced the constant 90-second countdown with a dynamic range based on actual check durations.
- Worker tracks `duration_ms` for every successful check (`outcome: ok`) in a `durations:<yyyy-mm>` KV key
- New `GET /durations?invite_word=<word>` endpoint calculates mean and std dev, returns `{ lower, upper, mean, stdDev, min, max, count }`
- `lower/upper` are `mean ± 1 std dev` (the predicted range, ~68% of normal variation)
- Form fetches stats on form submit, displays "Checking... typically X–Ys" instead of "about 90s"
- Countdown timer now runs for `upper + 30s` before showing the overflow message
- Deployed to production; ready for live testing once duration data accumulates

**S4-3: Custom domain** — BLOCKED on Luke.

Documented the steps for attaching `factcheck.cellear.com` to the Pages project:
- Option A: Add `cellear.com` to Cloudflare (migrate nameservers)
- Option B: Add CNAME record at GoDaddy pointing to Pages deployment
- Luke chose to keep using the `.dev` domain for now and defer S4-3

## What worked, what didn't

S4-2 implementation is correct and deployed. Code reviewed; logic verified (mean/std dev calculation, range display, endpoint gating by invite word). Not yet tested with live duration data (requires accumulated successful checks), but ready for that testing.

S4-3: steps documented; blocked by user choice.

## Current state

- S4-2: DEPLOYED, acceptance pending live data accumulation and verification
- S4-3: BLOCKED (documented, deferred to later)
- Site: live on `.dev` domain (https://4349c564.factcheck-site.pages.dev)
- Sprint 4: ready for Lila's S4-1 (runbook) against the current .dev domain

## Files created or modified

**Created:** this handoff, S4-3 domain attachment steps (in this handoff). **Modified:** worker/src/index.js, site/index.html, AMS/SPRINTS/sprint-4.md, AMS/OFFICES/sandy/desk.md. **Committed:** all four files (commits da08d28, bb2ade9).

**Sprint/stories touched:** S4-2 (complete), S4-3 (blocked-on-Luke).

---

## Prompt for Next Assistant

Persona: **Lila (Librarian)**. Model: `claude-sonnet-5`. Tool: `claude --model claude-sonnet-5`.

```
You are Lila, the Librarian. S4-2 (countdown calibration) is deployed. Your turn for S4-1: the runbook.

Read AMS/AGENT.md, your office (AMS/OFFICES/lila/desk.md, open-threads.md), this handoff, and AMS/SPRINTS/sprint-4.md.

S4-1 · Runbook (m):

Create DOC/runbook.md — a task-by-task guide for Luke that says "symptom or intent → exact commands → how you know it worked". Every task takes under five minutes to execute by reading only the runbook (Luke should never have to ask for help).

Tasks to cover (from the story and Sprint 3 incidents):
1. Change the spend cap (SPEND_CAP_USD) — command, what to verify
2. Change the invite word (wrangler secret put INVITE_WORD) — command, what to verify
3. Change the model (edit where, what to verify after deploy)
4. Re-vendor the skill (spike/vendor.mjs steps, update SOURCE.md commit hash)
5. Read this month's spend (GET /spend with invite word, what the response looks like)
6. Redeploy worker and site (npx wrangler deploy, npx wrangler pages deploy site, what success looks like)
7. **"Budget page but the month isn't spent" vs. "cap actually reached"** — distinguish spend cap reached (KV counter) from Anthropic Console balance dry (happened in S2-7 at $1.01). Where to top up the Console. Include this distinction explicitly.
8. Where every secret lives (Worker secrets, API key file path, nothing in repo)
9. Fixture permalinks and what each proves (tool_error, refusal, etc.) — link to S2-6 handoff or DOC failure section
10. demo.sh conventions (./demo.sh [start-step], blank answer = skip, visible progress)

Sourcing: cite the handoff or DOC section each procedure came from (DOC/working-agreements.md, etc.).

Acceptance: Luke performs the demo (S4 demo script, step 1: change invite word and redeploy using ONLY the runbook, no help).

Constraints: do not touch AMS/DOC/, AMS/LEARNINGS/ (except to cross-link from runbook), spike/, demo.sh, any other files. The runbook is your one new DOC file. Commit it locally at session end. Update your office. Write a handoff with Prompt for Next Assistant addressed to Quinn (S4-4, demo runner).
```

---

## Context for Lila

The site is live at https://4349c564.factcheck-site.pages.dev/. Sprint 3 closed (all stories done, demo passed, retro complete). Sprint 4 is the closing sprint; everything Luke needs to know fits in the runbook.

Domain note: currently using Cloudflare Pages .dev domain. S4-3 (custom domain) is deferred; if Luke decides to do it later, the runbook can be updated to point to the final domain. For now, write the runbook for the .dev URL.
