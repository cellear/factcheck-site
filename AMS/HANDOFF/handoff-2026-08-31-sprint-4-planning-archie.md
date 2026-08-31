# Handoff — Sprint 4 planning pass

**Archie (Architect) · claude-fable-5 · Sprint 4 planning**

No API calls made.

---

## What was done

Revised `AMS/SPRINTS/sprint-4.md` (written 2026-08-25, before anything was built) against
Sprints 1–3's decisions, at Luke's direction, while Sprint 3 is mid-flight:

- **S4-4 added** (Quinn, s): Sprint 4 `demo.sh` + dry-run, live run handed to Nadia. Quinn
  joins the personas line.
- **S4-1 (runbook, Lila)** expanded into a concrete task list — commands per procedure, and
  the **cap-reached vs. Anthropic-Console-balance-empty** distinction (the S2-7 session hit
  the balance-empty state at $1.01; the runbook is where that lesson lives). Fixtures and
  `demo.sh` usage included.
- **S4-2 (countdown calibration, Sandy)** pinned to `outcome: ok` records, overflow message
  unchanged, KV-listing implementation freedom noted.
- **Fold-into-Sprint-3 question closed:** Sprint 3 is mid-flight as planned; Sprint 4 stays
  its own short sprint.
- **S4-3 (custom domain, Sandy) is unblocked today** — depends only on S2-1. Everything else
  waits for Sprint 3 acceptance (S4-1/S4-2 depend on S3-2).

## Also this session (bookkeeping)

- Ticked S1-5's story-level checkbox — caught by Luke's AMS Agent Monitor dashboard, which
  renders unticked-but-done stories distinctly (`bcac7ff`). Same gap class as S1-1.
- Known dangling work: six untracked handoffs and several office/sprint-file edits from the
  Quinn/Nadia/Lila/Sandy sessions of 2026-08-31 are uncommitted on disk. Luke decides who
  commits them; flagged, not fixed.

## Current state — amended same session

The "mid-flight" framing above was stale within the hour it was written: **Sprint 3 closed
completely on 2026-08-31** (Cody S3-2/3/5/7, Quinn S3-8, Nadia ran the live demo and recorded
acceptance — first end-to-end run of the Quinn→Nadia convention — retro and S3-R done, all my
held DOC corrections applied by Lila including decision 18). The site is in use: invite word,
spend cap, caching, page copy all live.

**Therefore all of Sprint 4 is unblocked** (S4-1/S4-2 depended on S3-2, which is done).
Suggested order, using the new same-owner chaining convention:
**Sandy S4-2 + S4-3 in one session** → **Lila S4-1** (runbook last so it names the final
domain) → **Quinn S4-4** → **Nadia live demo**. Sprint 4 is the closing sprint; its
acceptance includes the project-level handoff and final retro.

## Files created or modified

**Created:** this handoff. **Modified:** `AMS/SPRINTS/sprint-4.md`,
`AMS/SPRINTS/sprint-1.md` (S1-5 box, committed separately), `AMS/OFFICES/archie/desk.md`.

**Sprint/stories touched:** Sprint 4 planning; S1-5 bookkeeping.

---

## Prompt for Next Assistant

Persona: **Sandy (Junior Engineer)**. Model: `claude-haiku-4-5`. Tool:
`claude --model claude-haiku-4-5`.

```
You are Sandy, the Junior Engineer. Do not guess or change this.

Read AMS/OFFICES/sandy/desk.md FIRST, then AMS/AGENT.md and follow it. Then read
AMS/CONFIG.md, AMS/SPRINTS/sprint-4.md (your stories are S4-2 and S4-3),
DOC/working-agreements.md (Commits; the same-owner chaining convention — you run both
stories in this one session), and
AMS/HANDOFF/handoff-2026-08-31-sprint-4-planning-archie.md.

S4-2 · Calibrate the countdown:
- Prediction = median duration_ms of the month's completed (outcome: ok) records, replacing
  the constant 90s; overflow message behavior unchanged
- If listing result:* KV keys is awkward, keep a small running-durations key alongside
  spend:<yyyy-mm> — your call, note it in the handoff
- Acceptance: countdown shown matches the median of stored durations within 10%

S4-3 · Custom domain:
- Write the steps for attaching Luke's domain to the Pages project; Luke performs them (ask
  him which domain). Acceptance: the site answers on the final domain over HTTPS
- If Luke isn't ready with a domain, do S4-2, write the S4-3 steps anyway, and mark S4-3
  blocked-on-Luke in your handoff rather than waiting

Constraints: do not touch AMS/DOC/, AMS/LEARNINGS/, spike/, demo.sh, or story text beyond
your own checkboxes. Commit your work locally at session end. AGENTS NEVER PUSH. Update your
office. Write a handoff whose Prompt for Next Assistant is addressed to Lila (S4-1, the
runbook — she should write it against the final domain), with a mission-summary line after
it per DOC/working-agreements.md.
```
