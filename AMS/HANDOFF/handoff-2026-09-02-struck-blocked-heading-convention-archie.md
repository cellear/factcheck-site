Archie · claude-fable-5 · sprint-file format decision (not sprint-scoped)

## What was attempted

Consultation with Luke on the open question from Lila's monitor-parsing-gap handoff
(`handoff-2026-09-02-monitor-parsing-gap-lila.md`): three struck/blocked stories (S3-4, S3-6,
S4-3) are invisible to the `ams-agent-monitor` dashboard because their headings carry free-text
status markers instead of the checkbox the monitor's heading regex anchors on. Decide whether
`SPRINTS/PROTOCOL.md`'s story-heading convention should change to stay tooling-parseable, and if
so, what the form is.

## What was decided (by Luke, with my recommendation)

**Story headings always end in a bracket state marker — the vocabulary grows from two states to
four:**

| Marker | State |
|---|---|
| `[ ]` | open |
| `[x]` | done |
| `[-]` | struck |
| `[!]` | blocked |

**The reason and attribution move out of the heading to the first line of the story body**, e.g.:

```
### S3-6 · Per-IP rate limit · [-]

**STRUCK** by Luke, 2026-08-31.
```

Rationale: the contract between sprint files and tooling stays a closed vocabulary (any parser
extends by one character class instead of chasing prose); `[-]` for cancelled is already
quasi-standard in task-list dialects; nothing human-readable is lost — the reason moves one line
down, where there's room to say more than a heading allows. The alternatives considered and
rejected: teaching the monitor to parse free text (fragile, and every future tool inherits the
guessing game), and keeping the reason in the heading alongside a trailing marker (clunky,
double-separated).

## What was done

- **Retrofitted the three existing headings** (Luke chose retrofit-now over new-sprints-only):
  - `AMS/SPRINTS/sprint-3.md` — S3-4 (`[-]`, reason line: "STRUCK — absorbed by S2-2/S2-6
    (Archie, 2026-08-31)."), S3-6 (`[-]`, "STRUCK by Luke, 2026-08-31.")
  - `AMS/SPRINTS/sprint-4.md` — S4-3 (`[!]`, "BLOCKED — using .dev domain for now (Luke,
    2026-08-31).")
- **Did not touch `SPRINTS/PROTOCOL.md`** — that's Lila's promotion, per her handoff ("I don't
  write it myself until it's decided"). It's decided now; see the promotion below.

## Current state and blockers

Nothing broken, nothing blocked. Sprint 3 and 4 files now conform to the new convention; sprint 5
has no struck/blocked stories. The monitor side of the change (accepting `[-]`/`[!]` and
rendering them distinctly — struck-through / flagged rather than silently dropped or shown as
merely unchecked) is with the monitor's author, outside this repo; Luke relays.

## Open questions

None on this thread. (Sprint 5 continues separately under the S5-4 handoff's prompt to Quinn —
S5-5 demo runner — unaffected by this.)

## Files created or modified

- `AMS/SPRINTS/sprint-3.md` — S3-4 and S3-6 headings retrofitted
- `AMS/SPRINTS/sprint-4.md` — S4-3 heading retrofitted
- `AMS/OFFICES/archie/desk.md`, `open-threads.md` — session close-out
- This handoff

Not touched: `DOC/`, `LEARNINGS/`, `SPRINTS/PROTOCOL.md` (all Lila's), any product code.
Nothing pushed — Luke pushes.

## DOC promotion for Lila

**`AMS/SPRINTS/PROTOCOL.md`** — update the story-heading convention (currently line 18's
`### S{n}-{m} · {title} · [ ]` and line 24's "Stories use checkbox status in their heading
(`[ ]` → `[x]`)"):

1. The heading always ends in a bracket state: `[ ]` open, `[x]` done, `[-]` struck, `[!]`
   blocked.
2. For struck/blocked stories, the reason and attribution go on the first line of the story
   body (`**STRUCK** — reason (who, date).` / `**BLOCKED** — reason (who, date).`), not in the
   heading.
3. Decided by Luke with Archie, 2026-09-02, after the ams-agent-monitor gap (three stories
   invisible to tooling because their headings ended in free text).

Also a candidate for the upstream AMS kit itself (alongside the commit-subject-line convention
Luke already wants carried up) — Luke's call on when.

## Sprint / story

Not sprint-scoped. Sprint 5 in progress elsewhere (S5-1 → S5-4 done, S5-5 with Quinn next).

---

## Prompt for Next Assistant

Addressed to **Lila** (`claude-sonnet-5`).

```
You are Lila. Read AMS/AGENT.md and this handoff
(AMS/HANDOFF/handoff-2026-09-02-struck-blocked-heading-convention-archie.md).

The struck/blocked heading question you handed to Archie is decided: story headings always
end in a bracket state — [ ] open, [x] done, [-] struck, [!] blocked — with the reason and
attribution moved to the first line of the story body. The three existing headings (S3-4,
S3-6 in sprint-3.md; S4-3 in sprint-4.md) are already retrofitted.

Your job: apply the DOC promotion in this handoff — update AMS/SPRINTS/PROTOCOL.md's
story-heading convention (its "Stories" bullet and the "checkbox status" line) to record the
four-state vocabulary and the reason-in-body rule, with the usual Last-updated line. Nothing
else in PROTOCOL.md changes. Write a handoff when finished, and commit per the
working-agreements subject-line convention.
```

**Mission summary:** decided with Luke that sprint story headings always end in a bracket state
(`[-]` struck, `[!]` blocked join `[ ]`/`[x]`), with reasons moved to the story body; retrofitted
the three affected headings in sprint-3/sprint-4; handed Lila the PROTOCOL.md promotion. The
monitor-side rendering of the new markers rests with its author.
