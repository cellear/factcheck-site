# Handoff — AMS reinstall, project defined, architecture handed to Archie

**Hannah (HR) · claude-opus-5 · install**

> Persona assigned by `INSTALL-AMS.md`, not inferred. That is new, and it is the fix from
> earlier today working on its first real install.

---

## What was attempted, and the outcome

The project directory was wiped deliberately (Luke's call — hours had gone into fixing the AMS
installer and none into the project). Four files were rescued to `../factcheck-rescue/` first.
This session rebuilt the workspace, learned what the project actually is, and handed the
architecture to Archie.

1. **Reinstalled AMS** from `cellear/AMS` branch **`add-hr-persona`** — not `main`, which still
   lacks the fixes since no PR is merged.
2. **Verified all three upstream fixes on a real install** (below).
3. **Rebuilt the workspace** — git init, `origin` → `cellear/factcheck-site`, `/AMS-INSTALL`
   excluded, tool stubs, `.gitignore`.
4. **Restored** both offices and `DOC/working-agreements.md` from the rescue directory.
5. **Learned what factcheck-site is** — and overstepped doing it (see below).

## The three fixes, verified in production

Worth recording, because all three were found and fixed the same day and this was their first
real exercise:

| Fix | Verification |
|---|---|
| Vendoring `agent-scrum` | Plain `git clone` — no `--recurse-submodules` — produced a fully populated `agent-scrum/` with `wizard.md`. |
| The `cp -R` booby trap | `find AMS -name .git` returned nothing. No manual cleanup step was needed; last install required one. |
| Persona assignment | `INSTALL-AMS.md` stated the identity before Phase 1. No guessing. |

The second one is the clearest win: the fix isn't a documented workaround, it's the absence of
the problem.

---

## The project — what factcheck-site is

A website that lets people run their own fact-checks, built on Luke's existing skill:
[`cellear/claude-fact-check-skill`](https://github.com/cellear/claude-fact-check-skill) (MIT,
5 stars, created 2025-11-16).

The skill is **methodology, not code** — a structured prompt walking an LLM with web search
through seven steps: claim identification, triage, evidence gathering, **source independence
analysis**, ideological alignment, rhetorical fallacy detection, structured report. Step 4 is
the differentiator; its stated premise is that many "multiple sources" are one source cited in
a circle, and most fact-checking misses this.

**Settled by Luke:**

| Question | Answer |
|---|---|
| Who runs the check | **The site does**, server-side |
| Audience | **People he sends it to** — his own network, not public growth |
| Shareable result links | **Yes — "that's the point"** |
| Input | **Pasted text only**, no URL fetching |

**Not settled:** stack, hosting, access control, cost ceiling, everything downstream.

---

## Where I overstepped

Luke caught this and it belongs in the record.

With AMS wiped, I had **no assigned identity** — `CONFIG.md`, the roster, and the offices were
all gone. So I reverted to inferring a role from the work in front of me. That is exactly the
bug we diagnosed and fixed upstream this morning, reproduced roughly forty minutes after
committing the fix, and it failed the same quiet way: everything produced looked well-formed,
and nothing in it signalled that the wrong role wrote it.

**The fix does not cover this case.** `INSTALL-AMS.md` assigns identity *at install time*. I was
working in a directory where AMS was not installed. The gap that remains — how a non-install
session learns its persona — was already logged as a retro item, and this is a concrete instance
of it rather than a hypothetical.

**In lane:** refusing to staff a team before knowing the project. That is the staffing policy
and it is HR's to hold.

**Out of lane:** running the product discovery conversation, then delivering a stack
recommendation, an access-control decision, and a cost model. All four are the Site Architect's.
I had written into `OFFICES/archie/identity.md` — *"Ask what it's for before proposing how to
build it"* and *"round one is interrogating the problem, not proposing a stack"* — and then, with
Archie deleted, did the thing I had forbidden him from doing, without the conversation that was
supposed to come first.

The recommendations may be sound. They were still delivered by the wrong role, and they
foreclosed by verdict a decision Archie should reason through *with* Luke — who is the one who
has to keep the result running.

---

## Recommendations made out of lane

**Luke asked that these be preserved so he can compare them later against whatever we actually
decide.** They are a benchmark, not a starting point.

**Archie: do not read this section before forming your own view.** Have the discovery
conversation, reach your own conclusions, then Luke can compare. Reading it first defeats the
comparison he asked for.

### The technical finding that shaped everything below

Web search is an **Anthropic server-side tool** (`web_search_20260209`) — declared in `tools`,
executed on Anthropic's infrastructure inside the same request. No search API to integrate, no
scraping, no key to manage. The seven-step methodology collapses to roughly *one API call with
`SKILL.md` as the system prompt*. `web_fetch_20260209` complements it for pulling full source
text, which is what the citation-chain work in step 4 needs. This makes the app far smaller than
it first appears, and it is the load-bearing fact under every recommendation here.

### Stack — TypeScript/Node, small always-on server, SQLite

Explicitly **not Drupal**, despite it being Luke's home turf and Pantheon being available. The
reasoning: the app is one form, one long-running job, and one read-only page. Almost nothing
Drupal is good at gets used, and the thing most needed — streaming a 60-second response to the
browser — is what PHP request handling makes most awkward. Node streams SSE natively; SQLite
means no database to operate.

Deploy always-on (Fly, Render) rather than serverless — a 90-second request fights most function
timeouts.

**The counter-argument, which was acknowledged and overridden:** "boring and maintainable by me"
is a real engineering value, and Luke is the one keeping this patched.

### Latency — stream the steps, don't spin

A check is roughly **30–90 seconds**, not 2. A form POST with a spinner is a broken-feeling page
and a gateway timeout on many hosts. Streaming the steps as they happen turns dead time into a
demonstration of the differentiator: *identifying claim → searching → found 6 sources → tracing
citations…* This is an architecture decision, not styling.

### Access — shared invite code plus a hard monthly spend cap

No accounts, no personal data, nothing to breach. It leaks when someone forwards the URL; the
cap is what makes that a non-event. Note the clean split this enables: **running** a check is
gated, **reading** a result is a public URL. Readers never need accounts, and Luke never pays
for a stranger's check.

### Cost — order of magnitude, unmeasured

Roughly **$0.25–$1.00 per check** on `claude-opus-5` ($5/M input, $25/M output), dominated by
search results accumulating in context. Two direct levers: `max_uses` on the web search tool
caps searches per check; `output_config.effort` trades depth for spend. At "people I send it to"
volume this is a rounding error. **These numbers are estimated, not measured** — take a real
reading on the first live check before optimizing anything.

### Two hazards specific to a fact-checking app

**Refusals are a live case, not an edge case.** This tool will be pointed at contentious
political and health claims. Opus 5 can decline with `stop_reason: "refusal"` — HTTP 200, no
exception raised. Unhandled, that is a blank page. The API has a server-side fallback parameter
that reroutes by refusal category; wire it in from the first commit rather than discover it in
front of a user.

**Server-tool errors also return HTTP 200**, with an error object where results should be. A
naive implementation reads that as "no sources found" and reports a claim as unverified. For a
fact-checker that is the worst available failure: wrong, and wrong in the authoritative
direction.

### The product concern underneath both

A permanent, shareable verdict carries more weight than the underlying technology can always
earn. `SKILL.md` says plainly that AI makes mistakes and users should verify — fine as advice in
a chat window, insufficient on a public permalink someone forwards as *"the fact-check says this
is false."* The recommendation was to make the caveat **structural**: show the citation chain
and the evidence in the artifact, not just a verdict. Then a degraded run looks degraded instead
of sounding confident.

---

## Current state

- AMS installed from branch `add-hr-persona`; components `HANDOFF, DOC, LEARNINGS, SPRINTS,
  OFFICES`; epics off; paths default; roster `hannah, archie`
- Git initialized, `origin` → `cellear/factcheck-site`, **no commits**. Luke shapes the first one
- `DOC/working-agreements.md` restored — agents never push; commit and hand over the command
- `AMS/Personas.md` names Nadia and Archie **locally only**; still not upstream (Luke declined
  that commit)
- `../factcheck-rescue/` still on disk; deletable once Luke is satisfied
- **Nothing of the product exists.** No source, no design, no decisions

**Blockers:** none. Archie has a defined project and an identity.

## Open questions

1. **Stack** — Node or Drupal? Archie's to work through with Luke, not to inherit.
2. **Access control and cost ceiling** — undecided.
3. **Should the Personas naming go upstream?** Luke declined once; the local copy has diverged
   from the kit, which is the drift hazard we wrote a one-way-sync rule about for `agent-scrum`
   and `Personas.md` has no such protection.
4. **PR for `add-hr-persona`?** Pushed, unmerged, `main` untouched.
5. **How does a non-install session learn its persona?** Retro item, with a live instance now.

## Files created or modified

**Project root:** `.git/` (init), `.git/info/exclude` (+`/AMS-INSTALL`), `origin` remote,
`CLAUDE.md`, `AGENTS.md`, `.cursorrules`, `.gitignore`

**AMS:** full tree from the kit. `CONFIG.md` filled in. `HANDOFF/` created (this file).
`Personas.md` — Nadia and Archie reapplied. `DOC/working-agreements.md` restored.
`OFFICES/hannah/` and `OFFICES/archie/` restored from rescue, both `desk.md` rewritten for the
now-defined project.

**Not modified:** every `PROTOCOL.md` as shipped. `MARKETING/` and `SECURITY/` exist on disk but
are absent from `components` — ignore them.

---

## Prompt for Next Assistant

```
You are Archie, the Site Architect. Do not guess or change this. You own technical
structure and design decisions. You do not implement, you do not run process, and
you are not the Product Owner — Luke is, and he represents the stakeholders.

Read AMS/OFFICES/archie/desk.md and identity.md FIRST, then AMS/AGENT.md and follow
it. Then read AMS/CONFIG.md and the most recent file in AMS/HANDOFF/ —
handoff-2026-08-25-ams-reinstall-and-project-definition-claude-opus-5.md.

IMPORTANT: that handoff contains a section titled "Recommendations made out of
lane" — a full stack recommendation produced by the wrong persona. Luke asked for
it to be preserved so he can compare it against what we actually decide. DO NOT
read that section before forming your own view, and do not treat it as a default.
Everything else in the handoff is fair game.

The project: factcheck-site, a website letting people run their own fact-checks,
built on cellear/claude-fact-check-skill — a seven-step methodology whose
distinctive part is step 4, source independence analysis (catching that "multiple
sources" are often one source cited in a circle).

Luke has settled four things: the site runs the check server-side; the audience is
people he sends the URL to, not public growth; completed checks get shareable
permalinks ("that's the point"); input is pasted text only, no URL fetching.

Unsettled: stack, hosting, access control, cost ceiling, and everything downstream.

What to work on: the architecture conversation with Luke. Interrogate before you
propose — ask what he'll actually keep running, what he'll spend, what happens when
a check is wrong. He is a Drupal developer with Pantheon hosting available, so do
not assume a JavaScript stack is obviously right; "boring and maintainable by me"
is a real engineering argument and he is the one who maintains it.

Constraints:
- AGENTS NEVER PUSH. Commit locally, then print the exact push command for Luke.
  See DOC/working-agreements.md. Do not offer pushing as an option.
- Do not commit unless asked. Luke shapes the first commit of this repo.
- Architecture decisions belong in DOC/ (AGENT.md:65-69), which is enabled and has
  exactly one file. Start the habit.
- MARKETING and SECURITY exist on disk but are NOT in components — ignore them.
- Never edit AMS-INSTALL/; it is excluded from git.
- Sprint planning is a SEPARATE step — read AMS/agent-scrum/wizard.md and run it;
  do not improvise sprint files. Staffing the rest of the team belongs there, and
  the Scrum Master (Nadia) is deferred and must be hired at that point.
- Update AMS/OFFICES/archie/desk.md and write a handoff before the session ends,
  and put the next-assistant prompt in the chat as a code block, not just in the
  file.
```

---

*Written 2026-08-25 by Hannah (claude-opus-5).*
