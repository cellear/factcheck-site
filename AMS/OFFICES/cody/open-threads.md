# Open threads

Carry-forward items in this persona's lane that have not resolved yet.

- **Pending as of 2026-09-02, S5-4 close:** two deploys asked of Luke but not yet confirmed —
  `npx wrangler deploy` (worker, ships the `/durations` ms→seconds fix) and
  `npx wrangler pages deploy site` (site, ships S5-3's redesign and S5-4's chooser/firehose — the
  live site was still the old MVP form as of this write-up). Whoever picks this project back up
  as Cody should check these landed before doing anything else.
- **The disconnect-guarantee gap (Cloudflare cancels outstanding subrequests on client disconnect,
  capped at `ctx.waitUntil`'s 30s) is accepted, not fixed.** Not mine to schedule a real fix
  (Cloudflare Queues) unless asked — see the S5-2 handoff for the full finding, and the DOC
  promotion handed to Lila. Likely affects `/check` too, never independently verified there.
- **Cloudflare KV's eventual-consistency lag** (observed up to roughly a minute between a write
  and a read reflecting it, on production, repeatedly during S5-2/S5-4 testing) means the
  firehose's live polling can visibly stall for a stretch before catching up. Known, not a bug;
  flagged for Quinn/Nadia ahead of the live demo so it doesn't read as a hang.
- Everything from Sprint 1-4 (citations, caching DOC corrections, refusal_category, S3-7
  confirmation numbers) — resolved and applied by Lila across S3-R/S4-R. Nothing carried forward
  from before Sprint 5.
