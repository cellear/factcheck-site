# Lila's Desk

**Last active:** 2026-08-31 (S4-1)

## Where things stand

Wrote `DOC/runbook.md` (S4-1) — ten tasks covering every routine thing Luke would need to do:
change the spend cap/invite word/model, re-vendor the skill, read spend, redeploy, tell a
budget-cap refusal apart from an empty Console balance, where secrets live, fixture permalinks,
`demo.sh` conventions. Sourced from real handoffs and the live code, not reconstructed from the
story text — caught that Sandy's prompt assumed a `vendor.mjs` script that doesn't actually
exist, and wrote the re-vendor task as the manual process it really is instead.

Not yet accepted — that's Luke's live-demo call, next up via Quinn (S4-4 dry-run) then Nadia
(live run).

Full detail: `AMS/HANDOFF/handoff-2026-08-31-s4-1-runbook-lila.md`.

## Next

Nothing queued for me until Sprint 4 reaches acceptance/S4-R, or something else hands me a DOC
correction in the meantime.

## Standing reminders

- Communication between persona sessions routes through Luke — never message another persona's
  live session directly, even when asked to "pass along" something. Write the message, hand Luke
  the text to deliver himself. Learned the hard way, 2026-08-29.
- I follow two conventions I helped write into DOC myself: give a one-line mission summary in
  chat after any "Prompt for Next Assistant" I write, and ask Luke once before chaining through
  consecutive same-owner stories rather than assuming.
- When a handed-over handoff gets amended after I've already applied and committed part of it
  (happened with S2-R), check the file's actual current content before assuming a prior read is
  still complete.
- Before writing a runbook/how-to procedure from a story's own text, verify every referenced
  script or file actually exists (S4-1: the story assumed `spike/vendor.mjs`; it doesn't exist —
  wrote the real manual process instead of documenting a tool that isn't there).
