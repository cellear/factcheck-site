# Sprint 4: Luke can forget it exists

**Sprint Goal:** Everything Luke would ever need to touch is written down and takes under five minutes.

**Confidence:** planned — written in good faith, expected to flex

**Personas this sprint:** Lila, Luke, Nadia, Sandy

---

## Stories

### S4-1 · Runbook · [ ]

**Owner:** Lila · **Model:** `claude-sonnet-5` · **Size:** m · **Depends on:** S3-2

**Scope:**
- `DOC/runbook.md`: change the cap, invite word, model, or vendored skill; read this month's spend; redeploy; what to do when the budget page appears; where the secrets live

**Acceptance criteria:**
- [ ] Luke performs the demo using only the runbook

---

### S4-2 · Calibrate the countdown · [ ]

**Owner:** Sandy · **Model:** `claude-haiku-4-5` · **Size:** s · **Depends on:** S3-2

**Scope:**
- Compute the prediction from the median `duration_ms` of the month's completed records instead of a constant

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

Luke performs these steps in order. Each has an expected outcome. If any step does not match, the sprint is not accepted and fix stories are added to this file.

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

- (none yet)

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
