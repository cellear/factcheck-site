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

## Commits

Luke composed `factcheck-site`'s first commit himself — as a one-time reconstruction: Cody
rebuilt 19 historical commits from the HANDOFF record, and Luke pushed that history himself.

**Since 2026-08-30/31, this is standing, not one-time.** Luke's instruction: each persona
commits their own story's work locally at the end of their session, without waiting to be asked.
This does not change who pushes — "Agents never push" above is unchanged; Luke remains the only
one who pushes.

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

**Quinn builds and dry-runs the demo; Nadia runs it live with Luke.** Quinn's job stops at a
verified dry-run — build `demo.sh`, exercise every step that doesn't need Luke live, flag
anything that can't be performed as written as a fix story, then hand off (via its own "Prompt
for Next Assistant") to Nadia. Quinn should not stay in the loop to run the demo live with Luke
or transcribe his acceptance verdict — that's Nadia's job. This drifted the other way in both
Sprint 1 and Sprint 2 because nothing in writing said otherwise; Luke asked for it directly,
2026-08-31.

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

## A "Prompt for Next Assistant" gets a one-line mission summary in chat

In the final chat message to Luke, immediately after the literal "Prompt for Next Assistant"
code block (`AGENT.md`'s Ending a Session step 2), add a one-to-two sentence plain-English
summary of the mission the prompt hands off — what the story actually builds or does, not the
persona's standing role or boilerplate identity text — so Luke can confirm it's the right story
before saying "go" without hunting through the prompt for it. The summary doesn't replace the
full prompt; he can still read that for detail. Applies to every persona ending a session with a
handoff. Luke asked for this directly, 2026-08-31.

## Chaining through consecutive same-owner stories

When a persona finishes a story and the next story (or several) in the sprint file are owned by
that same persona, before starting the next one look ahead and, if there's more than one, ask
Luke once: "the next N are all mine — want me to do them all?" If yes, continue directly into
each subsequent story within the same session — no need to stop for a fresh launch prompt
between them. Still write a full handoff for every individual story, including a normal "Prompt
for Next Assistant" with its mission summary, and commit at the end of each one, same as if it
were a separate session. When that next prompt is addressed to itself, the persona says so ("the
next prompt is to me, so I'll continue") and carries on in the same session rather than stopping.
Stop and ask if a story is genuinely blocked on information only Luke can supply — the earlier
yes doesn't cover a real blocker. A single story with no same-owner story right after it is
unaffected; proceed as normal. Luke asked for this directly, 2026-08-31.

**Why both:** without a written convention to follow, a persona chaining through several
same-owner stories will improvise its own shortcut and can drop a real requirement doing it —
this happened in Sprint 3 before either convention made it into this file (see
`LEARNINGS/sprint-3.md`).

---

Last updated: 2026-08-31 by Lila (claude-sonnet-5) — added the mission-summary and same-owner
chaining conventions (overdue from S2-R, applied via S3-R)
