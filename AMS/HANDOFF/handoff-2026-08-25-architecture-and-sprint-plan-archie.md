# Handoff — Architecture decided, four sprints planned, team to hire

**Archie (Site Architect) · claude-fable-5 · planning (pre-sprint)**

---

## What was attempted, and the outcome

Two things, both done: the architecture conversation with Luke, and sprint planning per
`agent-scrum/wizard.md`. Nothing is committed; Luke shapes the first commit.

### 1. Discovery → architecture

Ran discovery first (seven questions), then proposed, then recorded. Luke's answers were
unusually consistent — every one pointed at "as close to nothing as physically possible."
The one real tension was "no server at all" versus "the site runs the check" + "hard spend
cap": a static page would ship the API key to every visitor. Resolved as *nothing Luke
administers* — static HTML + one serverless function + one KV bucket.

Decisions are in **`DOC/architecture.md`** — 16 of them in a table with status and what each
forecloses. Headlines: Cloudflare Pages + Workers + KV (recommended, pending the three-minute
test); `claude-sonnet-5` (Luke: "we don't need Opus for this"); $20/month hard cap, silent
refusal; shared invite word; results at `/r/<id>`; up to three minutes wait with a countdown
("could be totally fake"); refusals and search-tool errors (both HTTP 200) render as failed
checks, never verdicts.

The capacity arithmetic moved the model decision: on Opus 5, $20 bought ~40–80 checks/month;
on Sonnet 5, ~100–200. Luke's ceiling is a dozen a day. All estimates; the spike measures.

### 2. Sprint planning

Ran the wizard phases in chat; wrote files on Luke's converging edits. Luke's definition of a
sprint — **demo script → PO accepts, or fix stories until it passes** — is now in
`DOC/working-agreements.md` and every sprint file carries a literal demo script table.

- `SPRINTS/sprint-1.md` **It runs** — vendor the skill, spike script, run it on Sonnet 5 and
  Haiku 4.5, read-out, rendering decision, Lila takes DOC. *Confirmed.*
- `SPRINTS/sprint-2.md` **It's a website** — Cloudflare go/no-go, the function, `/r/:id`, form
  with countdown, result page, failure fixture. *Planned.*
- `SPRINTS/sprint-3.md` **It's safe to send to people** — invite word, spend meter, refusal
  handling, search-error detection, copy, optional per-IP limit. *Planned.*
- `SPRINTS/sprint-4.md` **Luke can forget it exists** — runbook, countdown calibration, domain.
  *Planned; may fold into 3.*

21 stories + one retro story per sprint. `project.yaml` written. `.scrum/events.csv` seeded
(Luke wants it for a possible demo animation) with a schema in `.scrum/SCHEMA.md` because the
kit's referenced `DOC/event-log-schema.md` does not exist.

**Deviations from the wizard:** epics are off, so stories are sections in sprint files;
model IDs updated to the current generation; the schema file above.

## What worked, what didn't

- Discovery before proposal worked — Luke's answer #1 ("rather have no server at all") killed
  the stack question before it was asked, and the rest followed from it.
- I read the quarantined "Recommendations made out of lane" section by accident (plain `cat` of
  the handoff). Told Luke immediately; he waved it off. For the record, the outcome agrees with
  it on one-call/invite-word/cap/failure-handling and differs on hosting (static + function, not
  an always-on Node server) and streaming (deferred, not structural).
- Luke's sprint definition was not written down anywhere. It is now.
- **Rule arrived after the fact:** Luke decided mid-session that DOC/ and LEARNINGS/ are
  Lila's to write. I had already written `DOC/architecture.md` and extended
  `DOC/working-agreements.md`. Left them in place; recording the rule and reviewing both files
  is Lila's S1-6. From here, Archie hands DOC corrections to Lila as lists.

## Current state

- Architecture: decided and documented. Sprint plan: written. Team: **not yet hired.**
- Git: initialized, `origin` set, **no commits.** Now on disk beyond the AMS kit: `DOC/architecture.md`,
  `DOC/working-agreements.md` (extended), `SPRINTS/sprint-1..4.md`, `project.yaml`, `.scrum/`,
  `OFFICES/archie/*` (updated), this handoff.
- `../factcheck-rescue/` still on disk (from the prior session); deletable when Luke says.

**Blockers:** none. Hannah needs to hire before S1-1 can run.

## Open questions

1. First commit scope — Luke's.
2. Cloudflare survives a three-minute request? (S2-1 answers.)
3. Sonnet 5 vs Haiku 4.5 by report quality (S1-3/S1-4).
4. Verbatim vs structured report rendering (S1-5).
5. Keep S3-6 per-IP rate limit? Fold Sprint 4 into 3?
6. Should Sandy go into upstream `Personas.md`? Same drift question as Nadia/Archie.

## Files created or modified

**Created:** `DOC/architecture.md`, `SPRINTS/sprint-1.md` … `sprint-4.md`, `project.yaml`,
`.scrum/events.csv`, `.scrum/SCHEMA.md`, this handoff.
**Modified:** `DOC/working-agreements.md` (sprint-acceptance section), `OFFICES/archie/desk.md`
(overwritten), `OFFICES/archie/open-threads.md`, `OFFICES/archie/working-notes.md`.
**Sprint/stories touched:** planning only; no story started.

---

## Prompt for Next Assistant

Persona: **Hannah (HR)**. Model: `claude-sonnet-5` — hiring is templated office-writing;
Opus was carried over from her earlier session by habit, not need. Tool: Claude Code —
`claude --model claude-sonnet-5`.

```
You are Hannah, HR. Do not guess or change this. You staff the team and keep the
offices. You do not do product work.

Read AMS/OFFICES/hannah/desk.md FIRST, then AMS/AGENT.md and follow it. Then read
AMS/CONFIG.md, AMS/OFFICES/PROTOCOL.md, AMS/Personas.md, and the two most recent
files in AMS/HANDOFF/ — start with
handoff-2026-08-25-architecture-and-sprint-plan-archie.md. Read AMS/project.yaml
for the team and AMS/SPRINTS/sprint-1.md for what they'll do first.

The project: factcheck-site. Architecture is decided (AMS/DOC/architecture.md) and
four sprints are planned. Your job this session is to hire the working team so
Sprint 1 can start:

1. Nadia — Scrum Master — claude-sonnet-5. Runs the demo → accept-or-fix loop that
   is Luke's definition of a sprint (DOC/working-agreements.md). Decides after each
   sprint what should be recorded; Lila records it.
2. Cody — Coder — ALWAYS claude-sonnet-5.
3. Sandy — Junior Engineer — claude-haiku-4-5. A NEW persona: add her to
   AMS/Personas.md (local copy only; do not touch upstream). The Haiku coder is
   never "Cody on Haiku" — it is Sandy.
4. Lila — Librarian — claude-sonnet-5. Owns EVERY write to DOC/ and LEARNINGS/;
   every other agent writes only its own handoff. Her first story is S1-6.

For each: create AMS/OFFICES/<persona>/ from OFFICES/_template with identity.md
written for this project, a desk.md pointing at their first story, and update the
roster in AMS/CONFIG.md. Then update your own desk.md and write a handoff.

Constraints:
- AGENTS NEVER PUSH. See DOC/working-agreements.md. Do not offer it.
- Do not commit unless asked. Luke shapes the first commit; nothing is committed
  yet, and that is expected.
- Do not write to DOC/ or LEARNINGS/ — that is Lila's from now on. If you find
  something that belongs there, list it in your handoff for her.
- MARKETING/ and SECURITY/ exist on disk but are NOT in components — ignore them.
- Never edit AMS-INSTALL/.

End with a "Next session" block for the first story: S1-1 (Sandy, Haiku) and S1-6
(Lila, Sonnet) both have no dependencies — pick S1-1 and print the paste-ready
prompt as a code block in chat, not just in the handoff file. Note that S1-3 needs
an Anthropic API key in the environment; Luke provides it.
```

---

*Written 2026-08-25 by Archie (claude-fable-5).*
