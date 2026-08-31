# Sprint 4: Luke can forget it exists

**Sprint Goal:** Everything Luke would ever need to touch is written down and takes under five minutes.

**Confidence:** planned — written in good faith, expected to flex

**Personas this sprint:** Lila, Luke, Nadia, Quinn, Sandy

---

## Stories

### S4-1 · Runbook · [ ]

**Owner:** Lila · **Model:** `claude-sonnet-5` · **Size:** m · **Depends on:** S3-2

**Scope:**
- `DOC/runbook.md`, every task in the form "symptom or intent → exact commands → how you know it worked":
  - Change the spend cap (`SPEND_CAP_USD`), the invite word (`wrangler secret put INVITE_WORD`), the model, or the vendored skill (re-vendor + update `skill/SOURCE.md` commit)
  - Read this month's spend (`GET /spend` with the invite word)
  - Redeploy worker and site (`npx wrangler deploy`, `npx wrangler pages deploy site`)
  - **"Budget page but the month isn't spent" vs. "cap actually reached"** — the S2-7 session hit the third state nobody planned for: the Anthropic Console balance itself ran dry ($1.01). The runbook must distinguish cap-reached (KV counter) from balance-empty (Console) and say where to top up
  - Where every secret lives (Worker secrets; the API key file path convention; nothing in the repo)
  - The fixture permalinks and what each proves; `./demo.sh` and its `[start-step]`/skip conventions
- Written by Lila, but sourced from the handoffs — cite the handoff or DOC section each procedure came from

**Acceptance criteria:**
- [ ] Luke performs the demo using only the runbook

---

### S4-2 · Calibrate the countdown · [ ]

**Owner:** Sandy · **Model:** `claude-haiku-4-5` · **Size:** s · **Depends on:** S3-2

**Scope:**
- Compute the prediction from the median `duration_ms` of the month's completed (`outcome: ok`) records instead of the constant 90s; keep the overflow message behavior unchanged
- Implementation freedom: if listing `result:*` KV keys is awkward, keep a small running-durations key alongside `spend:<yyyy-mm>` — owner's call, note it in the handoff

**Acceptance criteria:**
- [ ] The countdown shown matches the median of stored durations within 10%

---

### S4-3 · Custom domain · [ ]

**Owner:** Sandy · **Model:** `claude-haiku-4-5` · **Size:** s · **Depends on:** S2-1

**Scope:**
- Write the steps for attaching Luke's domain to the Pages project; Luke performs them

**Acceptance criteria:**
- [ ] The site answers on the final domain over HTTPS

---

### S4-4 · Sprint 4 demo runner and dry-run · [ ]

**Owner:** Quinn · **Model:** `claude-haiku-4-5` · **Size:** s · **Depends on:** S4-1, S4-2, S4-3

**Scope:**
- Update `demo.sh` to the Sprint 4 version per the `DOC/working-agreements.md` conventions
  (visible progress, blank = skip, `[start-step]`); runbook-driven steps are guided prompts
  showing where in `DOC/runbook.md` to look, never automated secret changes
- Dry-run everything that needs no spend and no domain purchase; flag unperformable steps as
  fix stories BEFORE the live run
- Hand off to **Nadia** for Luke's live run and the acceptance verdict

**Acceptance criteria:**
- [ ] Dry-run precedes the live run and is recorded in Quinn's handoff
- [ ] The handoff's Prompt for Next Assistant is addressed to Nadia

---

### S4-R · Retro and records · [ ]

**Owner:** Nadia (runs it) and Lila (writes it) · **Model:** `claude-sonnet-5` · **Size:** s · **Depends on:** sprint accepted

**Scope:**
- After acceptance, Nadia reviews the sprint and decides what should be recorded
- Lila writes `LEARNINGS/sprint-4.md` and applies any DOC updates Nadia or Archie handed over

**Acceptance criteria:**
- [ ] `LEARNINGS/sprint-4.md` exists
- [ ] No DOC edits were made by anyone but Lila

---

## Sprint Demo Script

Luke runs **`./demo.sh`** (Quinn's Sprint 4 version, S4-4) with **Nadia running the live demo
and recording the verdict** per `DOC/working-agreements.md`. Each step has an expected
outcome. If any step does not match, the sprint is not accepted and fix stories are added to
this file.

| # | Luke does | Expected |
|---|---|---|
| 1 | Luke, reading only `DOC/runbook.md`, changes the invite word and redeploys. | New word works; old word is refused. He asked nobody. |
| 2 | Luke opens the site on its final domain. | It works. |
| 3 | Luke reads this month's spend. | A number, found via the runbook. |

**Accepted when:**
- Luke did all three without help.
- Closing project handoff written; Nadia runs the final retro; Lila writes `LEARNINGS/sprint-4.md` and any project-level learning.

---

## Decisions Made This Sprint

- 2026-08-31 (planning pass, Archie): revised while Sprint 3 is mid-flight. S4-4 (Quinn demo
  runner) added per the standing convention; Quinn joins the personas line. S4-1's runbook
  scope expanded from real incidents — notably the cap-reached vs. Console-balance-empty
  distinction the S2-7 session discovered. Kickoff stays gated on Sprint 3 acceptance
  (S4-1/S4-2 depend on S3-2); **exception: S4-3 (custom domain) depends only on S2-1 and is
  unblocked today** if Luke wants to slipstream it. The old "fold Sprint 4 into Sprint 3"
  question is closed the other way: Sprint 3 is already mid-flight as planned, so Sprint 4
  stays its own short sprint.

---

## Acceptance

**Status:** Pending
**Date:**
**Reviewed by:** Luke

---

## Fix Stories

- (added only if the demo fails)

---

## Deferred to Later Sprints

- (none yet)
