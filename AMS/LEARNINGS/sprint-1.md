# Sprint 1 Learnings

- 2026-08-25/29: A story can be fully correct and still show `[ ]` in the sprint file — S1-1 was
  done same-day but its checkboxes were never ticked, and nobody caught it through five more
  stories, S1-6's own cross-read of the sprint file, and sprint acceptance. Tick your own
  story's checkboxes before ending a session; don't assume a handoff substitutes for it.
- 2026-08-26: A live `claude-sonnet-5` call can sit at zero output for 5+ minutes — a short
  foreground timeout will kill it with nothing written, while the identical call succeeds
  backgrounded. Don't wrap a live Sonnet 5 check in a short foreground timeout; background it or
  give it a generous one.
- 2026-08-26/28: Aggregate speed/cost numbers picked Haiku 4.5 on every measure, but the model
  decision actually turned on a manual side-by-side read of one contested claim (GM streetcar),
  where Sonnet 5 caught false specifics Haiku certified as true. Budget a manual side-by-side
  read of at least one contested/hard claim in any future model spike — aggregates alone would
  have picked the wrong model here.
- 2026-08-28/29: A stalled demo isn't only a signal to patch the one gap — Luke's first
  `./demo.sh` attempt stuck at step 2 (no findable same-claim pairs), and his fix was hiring a
  standing QA role (Quinn) to dry-run every sprint's demo before he runs it, not just fixing that
  step. Worth treating a demo failure as a possible role gap, not only a feature gap.
- 2026-08-29: A demo script that looks correct on paper can still read as broken live — Quinn's
  `demo.sh` passed its own dry run, but Luke's first live run looked hung during the ~6-minute
  API call (no output during the wait) and had no way to skip a step he'd already confirmed
  (a blank answer read as an error, not a skip). Both were invisible until an actual live run;
  dry-running a demo script is not the same test as watching the PO run it for real.

---

Last updated: 2026-08-30 by Lila (claude-sonnet-5)
