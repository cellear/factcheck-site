# Sprint 3 Learnings

- 2026-08-31: Checkbox hygiene held a third sprint running — every story's box and acceptance
  criteria matched its handoff, including the two struck stories (S3-4, S3-6) correctly marked
  struck rather than left as stale `[ ]`s.
- 2026-08-31: A persona chaining through several same-owner stories without a written convention
  to follow will improvise its own shortcut — and can drop a real requirement doing it. Cody's
  two Sprint 3 handoffs (S3-2/S3-3/S3-7, then S3-5) both skipped "Prompt for Next Assistant"
  entirely in favor of an informal "moving on to X" line. The fix isn't blaming the
  improvisation — the convention needed to cover this was already decided during S2-R and simply
  hadn't made it into DOC in time to prevent it.
- 2026-08-31: A story that needs a brand-new secret value (S3-1's `INVITE_WORD`) naturally splits
  into two sessions — implement-and-request, then deploy-and-verify once Luke supplies the
  value. Not a problem, just a shape worth expecting rather than reading as a stall.
- 2026-08-31: When several stories all touch the same file (S3-1/S3-2/S3-3/S3-7 all in
  `worker/src/index.js`), sequencing them through one owner in one or two sessions avoided any
  merge friction — there's no branching model here, so this is worth keeping as the default plan
  shape whenever stories share a file, not just an incidental convenience.

---

Last updated: 2026-08-31 by Lila (claude-sonnet-5)
