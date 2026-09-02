# Working notes

Standing observations about how the human and the team like this persona's work done.
Preferences, not facts about the current sprint — those belong in a sprint file or a handoff.

- Rule, as of this sprint: DOC/ and LEARNINGS/ are written only by Lila. Everyone else hands over
  a list rather than editing directly. Archie wrote two DOC files before this rule existed
  (`architecture.md`, `working-agreements.md`); reviewing them is part of S1-6, not a rewrite
  from scratch.
- When applying a numbered corrections list to a DOC file, read the whole file again afterward
  rather than trusting the list was exhaustive — S1-6 found two stale cross-references
  (a "three-minute ceiling" phrase, a missing outcome in a diagram) that weren't on Archie's
  13-item list but were now inconsistent with sections the list did touch. Confirmed again at
  S4-R: Nadia's promotion list named only the "Components" section as having a stale
  fixed-90s countdown description, but decision 10's table row in the same file said the same
  stale thing — caught only by re-reading the whole file, not on the list.
- When a handoff hands me a source citation for a finding, verify the citation before writing —
  S1-R's handed-over list attributed a finding to the wrong handoff filename (right content,
  wrong pointer). Cheap to check, and the finding is only as trustworthy as its source.
- Luke: communication between persona sessions must route through him — never message another
  persona's live session directly, even when asked to "pass along" a complaint or proposal.
  Write the text and hand it to him to deliver. Corrected 2026-08-29 after I sent one directly.
- Don't let a real finding from a past sprint (S1-R's citation error) bleed into how I describe
  the current one — I drafted a "What didn't work" line in S2-R's handoff describing a citation
  error that hadn't actually happened this time, before checking. Caught and fixed it before
  finalizing, but the lesson is to verify a claim about *this* session's own work before writing
  it, the same way I verify citations from other personas.
- A handoff I've already applied and committed against can still change later (S2-R's handoff
  got two more DOC promotions slipstreamed in after I'd committed the first four) — when Luke
  says there's more work queued, re-check the actual current file rather than assuming my last
  read of it is still the whole story.
- I now practice the two conventions I helped write into DOC (mission summary after every
  "Prompt for Next Assistant"; ask-once before chaining same-owner stories) — recorded here so a
  future me doesn't forget to apply its own rule.
- When explaining anomalous behavior in a system I don't have code visibility into (2026-09-02:
  Luke's `ams-agent-monitor` dashboard), a correlation in timing can look exactly like the
  mechanism and still be wrong — I inferred a commit-comparison rule from matching dates; the
  real cause was an unrelated stale-cache bug, confirmed only once the tool's actual author
  checked its code. I did hedge it as a guess at the time, but the lesson is to say so even more
  plainly, and to prefer checking a live system's actual behavior over inferring its internals
  from correlated data whenever that's actually available to me.
