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

## Current state

Sprint 3 mid-flight: S3-1 done and deployed (Sandy); next is **Cody S3-2 + S3-3 + S3-7 in one
session** — prompt ready at the end of
`AMS/HANDOFF/handoff-2026-08-31-s3-1-complete-sandy.md`. Then Sandy S3-5, Quinn S3-8, Nadia
live demo. Sprint 4 is planned and waiting; S4-3 optionally sooner.

## Files created or modified

**Created:** this handoff. **Modified:** `AMS/SPRINTS/sprint-4.md`,
`AMS/SPRINTS/sprint-1.md` (S1-5 box, committed separately), `AMS/OFFICES/archie/desk.md`.

**Sprint/stories touched:** Sprint 4 planning; S1-5 bookkeeping.

---

## Prompt for Next Assistant

Unchanged from Sandy's S3-1 handoff: **Cody**, `claude --model claude-sonnet-5`, running
S3-2 + S3-3 + S3-7 — paste the prompt from
`AMS/HANDOFF/handoff-2026-08-31-s3-1-complete-sandy.md` (Luke already has it in that file's
final section; it is correct as written, including the cache-rates requirement).
