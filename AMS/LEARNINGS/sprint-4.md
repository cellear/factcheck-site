# Sprint 4 Learnings

- 2026-08-31: Checkbox hygiene gapped a third time, a third shape. S1-1 (S1-R) was a
  same-session omission; S1-5 (caught by Luke's Agent Monitor dashboard) was a stale box nobody
  revisited; S4-1 is different again — the persona who wrote the story correctly declined to
  tick an acceptance criterion that only a later live demo could prove, and then nobody ticked it
  once that demo passed, including the session that recorded the sprint's overall acceptance.
  Fixed in this retro. Three recurrences across four sprints, despite two of them being
  individually "fixed," is worth a standing convention rather than a per-sprint catch — see
  `DOC/working-agreements.md`.
- 2026-08-31: The Quinn-hands-off-to-Nadia convention (fixed at S2-R after drifting in Sprints 1
  and 2) has now run clean three sprints running — S2, S3, S4.
- 2026-08-31: The same-owner chaining convention (written into DOC at S3-R, too late to help
  Sprint 3) got its first real exercise this sprint: Sandy ran S4-2 and S4-3 in one session, per
  Archie's suggested order in the planning handoff, no merge or handoff friction. The convention
  worked the first time it was actually available to use.
- 2026-08-31: Writing user-facing documentation by checking the actual code/deployment, not just
  reconstructing from prior handoff prose, catches real gaps. Lila's S4-1 runbook was sourced
  from handoffs but verified against `worker/`, `demo.sh`, and `wrangler.jsonc`, and caught that
  the story's own handed-over prompt assumed a `vendor.mjs` re-vendoring script that doesn't
  exist — the runbook documents the actual manual process instead of a tool that was never built.
  Same habit as the "re-read the whole file" pattern from S1-6/S2-R's DOC corrections — worth
  naming as one general practice, not two separate ones.
- 2026-08-31: A flagged-but-not-fixed discrepancy (Quinn: the demo table said the invite-word
  step "and redeploys," the runbook doesn't call for one) moved cleanly from Quinn → Nadia →
  fixed at acceptance, with nobody editing outside their own lane to get there. The flag-don't-fix
  discipline worked as intended, not just caught a discrepancy.

---

Last updated: 2026-09-01 by Lila (claude-sonnet-5)
