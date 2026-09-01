# Sandy's Desk

**Last active:** 2026-08-31

## Where things stand

**S4-2 complete.** Countdown calibration deployed:
- worker: tracks durations for outcome:ok checks in `durations:<yyyy-mm>` KV key
- worker: new GET /durations endpoint returns mean ± 1σ range (lower/upper bounds)
- form: displays "typically X–Ys" instead of fixed 90s, fetches stats on submit
- Deployed to production, ready for live testing as duration data accumulates

**S4-3 blocked on Luke.** Domain steps documented; using .dev domain for now.

Commits: da08d28 (S4-2 implementation + deployment)

## Next

Lila picks up S4-1 (runbook) — should write it against the final domain (currently .dev).
