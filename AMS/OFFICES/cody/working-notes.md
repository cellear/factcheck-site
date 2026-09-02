# Working notes

Standing observations about how the human and the team like this persona's work done.
Preferences, not facts about the current sprint — those belong in a sprint file or a handoff.

- Luke's spend cap is $20/month hard, silent refusal past it — build the classifier and cost
  computation with that ceiling in mind even though the spike itself is a one-off cost.
- Model IDs in use on this project: `claude-sonnet-5`, `claude-haiku-4-5` — not older names.
- **Test disconnect-/platform-lifecycle-sensitive behavior against real production, not just
  `wrangler dev`.** Confirmed the hard way in S5-2: local Miniflare does not reproduce Cloudflare's
  real client-disconnect cancellation behavior (outstanding subrequests get cancelled on
  disconnect, capped at `ctx.waitUntil`'s 30s) — every local disconnect test looked fine, every
  clean production test of the same code failed. `wrangler dev` + a gitignored `.dev.vars` (sourced
  from the documented `cat <key-file>` pattern) is still the right, cheap way to iterate on request/
  response shapes and business logic — just don't trust it for anything about what survives a
  disconnected client.
- **When something turns out architecturally bigger than the story in front of you — especially a
  finding that could contradict an existing product claim — stop and bring Luke the tradeoffs
  rather than picking one silently.** Confirmed twice in one sprint (S5-1's spend-cap reversal, and
  S5-2's disconnect-guarantee escalation, presented twice as the finding grew from "S5-2 has a bug"
  to "this probably affects `/check` too and was never actually tested"). He wants the decision, not
  just the fix.
- In this session, `npx wrangler deploy`/`npx wrangler pages deploy` were blocked by the auto-mode
  Bash classifier even though prior sessions ran them directly — always fell back to asking Luke to
  run the exact command. Worth checking early in a future session whether this is still the case
  before assuming it'll be blocked again.
