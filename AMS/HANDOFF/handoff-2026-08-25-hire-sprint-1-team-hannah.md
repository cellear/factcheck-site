# Handoff — Sprint 1 team hired

**Hannah (HR) · claude-sonnet-5 · staffing (pre-sprint)**

---

## What was attempted, and the outcome

Hired the four people Archie's sprint plan needs to start Sprint 1: **Nadia** (Scrum Master),
**Cody** (Coder), **Sandy** (Junior Engineer — new persona), **Lila** (Librarian). All four now
have an office at `OFFICES/<persona>/` and are in the `CONFIG.md` roster. Nothing else touched.

Note on locating the work: the prompt described paths (`AMS/project.yaml`,
`AMS/SPRINTS/sprint-1.md`, the named handoff) that don't exist at the repo root — the actual
project lives one level down, at `factcheck/AMS/`. Confirmed via `grep -r factcheck` before
proceeding; all reads and writes below are under `factcheck/AMS/`, not the top-level `AMS/` that
also exists in this workspace (a different, unrelated AMS install).

### For each hire

- **`identity.md`** — role, lane, working stance, and "what I'm not" written specifically for
  factcheck-site, cross-referencing the other personas so lanes stay legible to each other (e.g.
  Sandy's identity states explicitly she isn't "Cody on Haiku").
- **`desk.md`** — points at the first actionable story, or explains why there isn't one yet
  (Nadia's S1-R depends on sprint acceptance, so her desk says to wait and watch).
- **`open-threads.md` / `working-notes.md`** — seeded from what's already known: dependencies,
  standing conventions (model IDs, the DOC-ownership rule, Luke's definition of a sprint) pulled
  forward from `DOC/working-agreements.md`, `DOC/architecture.md`, and Archie's handoff so each
  new persona starts oriented rather than blank.

### Personas.md and CONFIG.md

- Added Sandy to `AMS/Personas.md` under a new "Engineering" subsection of Proposed Personas —
  **local copy only**, matching how Nadia and Archie were added previously. Did not touch any
  upstream repo.
- Updated `roster` in `CONFIG.md` from `hannah, archie` to
  `hannah, archie, nadia, cody, sandy, lila`.

## What worked, what didn't

- The path mismatch in the prompt (top-level `AMS/` vs. `factcheck/AMS/`) was caught before any
  writes happened — `grep -r factcheck` across the workspace found the real project directory
  by its content, not its position. Worth flagging in case it recurs: this workspace has more
  than one `AMS/` tree on disk, and only one is this project's.
- Mirroring Archie's `identity.md` structure (Lane / Working stance / What I'm not) for the four
  new hires kept them consistent with his and made cross-references between personas
  (Cody↔Sandy, Nadia↔Lila) easy to write without inventing new conventions.
- Seeding `open-threads.md`/`working-notes.md` at hire time, rather than leaving them at the
  template's `(none)`, means the next session for each persona doesn't have to re-derive
  dependency chains from the sprint file — the desk already states them.

## Current state

- Team: **hired.** Offices exist for `hannah, archie, nadia, cody, sandy, lila`, all in
  `CONFIG.md`'s roster.
- Sprint 1: staffed, not started. **S1-1 (Sandy)** and **S1-6 (Lila)** are unblocked. S1-2/S1-3
  (Cody) wait on S1-1. S1-4/S1-5 (Archie) wait on S1-3. S1-R (Nadia runs, Lila writes) waits on
  sprint acceptance.
- Git: still initialized, `origin` set, **no commits.** This session added office files and two
  small edits (`CONFIG.md`, `Personas.md`) but did not commit them — Luke shapes the first
  commit, per `DOC/working-agreements.md`.
- `factcheck-rescue/` still on disk, one level up from the real project directory; deletable
  once Luke says so.

**Blockers:** none for S1-1 or S1-6. **S1-3 needs an Anthropic API key in the environment** —
Luke provides it; not yet confirmed present.

## Open questions

1. Should Sandy go into the *upstream* `Personas.md`, alongside the same unresolved question for
   Nadia and Archie? Luke has declined that commit once. (Carried from Archie's handoff.)
2. First commit scope and timing — Luke's call.
3. `factcheck-rescue/` deletion — Luke's call.

Nothing found this session that belongs in `DOC/` or `LEARNINGS/` — staffing work stayed inside
`OFFICES/` and `CONFIG.md`, which are HR's to write directly.

## Files created or modified

**Created:** `OFFICES/nadia/{identity,desk,open-threads,working-notes}.md`,
`OFFICES/cody/{identity,desk,open-threads,working-notes}.md`,
`OFFICES/sandy/{identity,desk,open-threads,working-notes}.md`,
`OFFICES/lila/{identity,desk,open-threads,working-notes}.md`, this handoff.

**Modified:** `CONFIG.md` (roster), `Personas.md` (Sandy added locally),
`OFFICES/hannah/desk.md` (overwritten).

**Not touched:** `DOC/`, `LEARNINGS/`, `SPRINTS/`, `project.yaml`, `MARKETING/`, `SECURITY/`,
`AMS-INSTALL/`.

**Sprint/stories touched:** none started. Staffing only, ahead of S1-1 and S1-6.

---

## Prompt for Next Assistant

Persona: **Sandy (Junior Engineer)**. Model: `claude-haiku-4-5` — S1-1 is a small, bounded copy
task, exactly the shape her persona exists for. Tool: Claude Code —
`claude --model claude-haiku-4-5`.

```
You are Sandy, Junior Engineer. Do not guess or change this. You handle small,
well-scoped implementation tasks with clear acceptance criteria.

Read AMS/OFFICES/sandy/desk.md and identity.md FIRST (note: the real project is
at factcheck/AMS/ in this workspace, not the top-level AMS/ — confirm you're in
the right one before reading further). Then read AMS/AGENT.md and follow it.
Then read AMS/CONFIG.md and the most recent file in AMS/HANDOFF/.

Your story is S1-1 in AMS/SPRINTS/sprint-1.md:
- Copy SKILL.md from https://github.com/cellear/claude-fact-check-skill into
  skill/SKILL.md, byte-identical to the version at the commit you vendor.
- Write skill/SOURCE.md naming the upstream repo URL, the commit hash, and the
  date vendored.

Acceptance criteria (from the sprint file):
- skill/SKILL.md is byte-identical to the upstream file at the recorded commit
- skill/SOURCE.md names the commit hash

This unblocks Cody's S1-2 (the spike script), which depends on S1-1.

Constraints:
- AGENTS NEVER PUSH. See DOC/working-agreements.md. Do not offer it.
- Do not commit unless asked. Luke shapes the first commit; nothing is
  committed yet, and that is expected.
- Do not write to DOC/ or LEARNINGS/ — that is Lila's. If you find something
  that belongs there, list it in your handoff for her.
- MARKETING/ and SECURITY/ exist on disk but are NOT in components — ignore them.
- Never edit AMS-INSTALL/.
- Update AMS/OFFICES/sandy/desk.md and write a handoff before the session ends.
```

---

*Written 2026-08-25 by Hannah (claude-sonnet-5).*
