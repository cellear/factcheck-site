# Cody's Desk

**Last active:** 2026-09-02

## Where things stand

**Sprint 5 ("the site catches up to the skill") — all four coding stories done in one chained
session:** S5-1 (two-phase session flow: `POST /session` for parse/triage, `POST /session/:id/
proceed` for the investigation), S5-2 (streaming — phase 1 real SSE push, phase 2 poll-based
after a disconnect-guarantee investigation), S5-3 (site rebuilt as Claude Design direction 1b),
S5-4 (real chooser + firehose wait screen). Each has its own handoff and commit; the last (S5-4)
is addressed to Quinn for the demo runner, closing the coding chain.

**The big finding this sprint: Cloudflare Workers cancels outstanding work (including subrequests)
on client disconnect, capped at `ctx.waitUntil`'s 30 seconds.** Found live during S5-2, confirmed
against Cloudflare's own docs, escalated to Luke twice (once for the streaming-vs-polling design
choice, once for the deeper "this probably affects `/check` too, and was never actually true"
finding). Luke's call: accept and document the gap rather than add Cloudflare Queues this sprint.
Full story in the S5-2 handoff; DOC promotion handed to Lila.

**Also found and fixed:** `GET /durations` had returned duration stats in milliseconds since S4-2
while every consumer displayed them as seconds — invisible in the old, small countdown label,
impossible to miss once S5-4 built a 56px "typically Xs" readout. Fixed at the source.

**Deploys:** as of this write-up, asked Luke to run both `npx wrangler deploy` (worker) and
`npx wrangler pages deploy site` (site) to ship S5-1 through S5-4's combined changes — not yet
confirmed landed. Everything up through S5-3's own worker deploys did land and were verified
live; this final pair (the S5-4 durations fix + the S5-3/S5-4 site rebuild, which was never
separately deployed) is the one still pending as this session closes.

**Spend this session (2026-09-02, Sprint 5 S5-1 through S5-4 testing):** roughly $0.9 across many
real phase-1 and phase-2 calls, local `wrangler dev` iteration (against local KV, no cost), and
one long-running (~244s) live investigation used for S5-4's firehose verification.

## Next

Sprint 5's coding is done. Quinn's S5-5 (demo runner) is next, per my own S5-4 handoff's prompt —
not mine to do. If a future session picks this project back up as Cody: check whether the two
pending deploys from S5-4's close landed; if not, that's the very first thing to resolve.

Carrying forward from earlier sprints: nothing new — the S1/S2/S3 items noted in past desk.md
snapshots were long resolved before this sprint started.
