# Working Agreements

Standing rules for every persona on this project. Not preferences — rules. They apply
regardless of which agent is at the desk or what the task is.

---

## Agents never push

**No agent pushes to any remote, ever.** Not to `origin`, not to a branch, not "just to back it
up," not after asking. There is no phrasing of the request that makes it the agent's action.

The furthest an agent goes is:

1. Make the commit locally.
2. **Print the exact push command** for Luke to run himself.

That is the end of the agent's involvement. He runs it.

**Why:** pushing is the moment work leaves the machine and becomes public and hard to retract —
particularly here, where `cellear/factcheck-site` is a public repo and `cellear/AMS` is a
published framework other people install. The person accountable for what appears under that
account is the one who types the command. Asking permission does not transfer that
accountability; it just moves the mistake one step later.

**This is not a per-case approval to seek.** Do not offer pushing as an option, do not present
it in a menu of choices, and do not ask "want me to push?" Commit, print the command, stop.

Example of the correct ending to a piece of work:

    git -C AMS-INSTALL push -u origin add-hr-persona

**Related:** the same reasoning applies to anything outward-facing — creating repos, opening
PRs, posting comments, changing repo visibility. Ask first, and prefer handing over the command.

## Luke shapes the first commit

He asked to compose the initial commit of `factcheck-site` himself. Do not commit on his behalf
without being asked, and do not treat "the work is finished" as authorization to commit it.

## A sprint is accepted by demo, or it isn't over

Luke's definition, stated 2026-08-25:

> The team presents the PO with a demo script, and what the demo should show, and then the PO
> says whether the sprint is accepted. If it isn't, we write fix stories until it passes.

Consequences:

- Every sprint file carries a **demo script** — the literal steps Luke performs — and an
  **expected outcome** for each step. "Demo checkpoint" in `SPRINTS/PROTOCOL.md` means this.
- A sprint has two end states: *accepted* or *fix stories added*. There is no "mostly done."
- Fix stories are written into the same sprint, not deferred to the next one, until the demo
  passes.
- Stories are drafted by the Architect; Luke does not have to write them. He accepts the sprint,
  not the story list.

**A demo script gives visible progress and lets Luke skip a confirmed step.** Added after Sprint
1's `demo.sh` (Quinn, 2026-08-29): a step that can run silently for more than a few seconds must
say so up front and show a heartbeat while it runs, and a blank answer at a prompt for a step
Luke has already confirmed must be treated as an intentional skip, not an invalid answer. Source:
Luke's first live run of `./demo.sh` looked hung during the ~6-minute live API call, and had no
way to move past a step already checked off. Applies to every sprint's demo runner going forward,
not just this one.

## DOC and LEARNINGS have one writer

**Lila (the Librarian) is the only persona who writes to `DOC/` or `LEARNINGS/`.** Every other
persona — Archie, Cody, Sandy, Nadia, and Luke's future hires — writes only its own session
handoff in `HANDOFF/`. When a session produces something that belongs in DOC or LEARNINGS (an
architecture correction, a measured number, a decision), it goes into that persona's handoff as
a list handed to Lila, not directly into the file.

**Why:** DOC/LEARNINGS is meant to be a single, coherent record of current truth
(`DOC/PROTOCOL.md`); several hands editing it independently is how that record drifts and
duplicates. One owner keeps it consistent and findable.

**Consequence:** if you are not Lila and you think something belongs in DOC or LEARNINGS, hand
it over as a list in your handoff. Do not edit the file yourself, even to fix something small.

---

Last updated: 2026-08-30 by Lila (claude-sonnet-5) — added the demo-script visible-progress /
skip-confirmed-step convention (S1-R)
