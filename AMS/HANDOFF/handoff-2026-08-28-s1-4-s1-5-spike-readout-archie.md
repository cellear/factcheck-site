# Handoff — S1-4 spike read-out, S1-5 rendering recommendation

**Archie (Architect) · claude-fable-5 · S1-4, S1-5**

No API calls were made this session. Project spend remains ~$2.37 of the $20/month cap.

---

## S1-4 · Spike read-out

### The numbers

All Sonnet 5 runs that are production-shaped (no forced errors), across S1-2 and S1-3:

| Claim | Searches | Input tokens | Duration | Cost | Outcome |
|---|---|---|---|---|---|
| Eiffel Tower (easy) | 2 | 36,633 | 33.5s | $0.114 | ok |
| Great Wall (S1-2, myth) | 2 | — | 47.8s | — | ok |
| DST repeal (historical, many figures) | 5 | 57,206 | 1m 19s | $0.217 | ok |
| Meta AI hack (recent news) | 5 + 2 refused | 182,414 | 2m 35s | $0.544 | tool_error* |
| GM streetcar (contested) | 5 | 208,783 | 5m 40s | $0.564 | ok |
| GM streetcar, first attempt | — | — | >5m, killed | — | — |

\* Reclassified as `ok` under the rule decided below.

All Haiku 4.5 runs: 3.4s / 17.5s / 17.5s / 20.2s; $0.005 / $0.044 / $0.045 / $0.117.

**Mean cost per check:** Sonnet 5 **$0.36** (range $0.11–$0.56) → about **55 checks/month** at
the cap. Haiku 4.5 **$0.05** → about **380 checks/month**. The old estimate of $0.10–$0.20 was
right for easy claims and 3× low for contested ones.

Cost and duration are driven by the search loop, not the report: 5 searches on Sonnet ran
from 57K to 209K input tokens depending on how much page content came back — a 4× spread on
the same search count, which the claim decides and we don't. So the countdown cannot be
predicted per claim; it has to be a fixed number with an honest overflow message.

### Quality, claim by claim (my own read of all four pairs)

- **GM streetcar (contested/historical).** Cody's finding holds and is worse than stated.
  Haiku's report quotes a source saying "about 25 cities" *as supporting evidence* for the
  claim's "45 cities" — it cited the contradiction without noticing it — then ticked "✓
  organized in 1936", "✓ 100+ systems in 45 cities", "✓ the cities mentioned" in its Bottom
  Line, quietly dropping Minneapolis from its own checklist. Sonnet caught the origin-date
  error, the ~25 vs 45 discrepancy, the acquittal on the transit-monopoly charge, and that
  Detroit and Minneapolis are on a specialist list of cities with no documented NCL role. This
  is not thinner-vs-richer; Haiku certified false specifics as true, with "moderate" confidence.
- **Meta AI hack (recent news).** Parity on the verdict (both: supported). Sonnet found
  independent corroboration (Krebs) and Meta's remediation detail; Haiku found Meta's denial
  about world-leader accounts, which Sonnet did not. Neither report contains an error I can
  identify. (I cannot verify a June 2026 news story from my own knowledge; I judged internal
  consistency and sourcing.)
- **DST repeal (historical, many figures).** Parity, and Haiku was slightly *better* on one
  point: it caught that the "repeal" was an amendment restoring standard time for four winter
  months, and that DOT's finding was "inconclusive" rather than "too small to matter". Sonnet
  did the source-independence chain better (NORC survey, DOT interim report, contemporaneous
  TIME/NYT as separate primaries). Both used 5 searches; Haiku was 4× faster and half the cost.
- **Eiffel Tower (easy).** Haiku ran zero searches and **produced no report** — it followed
  SKILL.md step 2 to the letter ("if uncontroversial, explain why and ask if user still wants
  full verification") and ended with "would you like me to verify it anyway?" The classifier
  marked it `ok`. Sonnet ran 2 searches and wrote the full report with the Triage section
  saying "uncontroversial". This is a skill-shape problem, not a Haiku problem (see the
  single-turn frame below), but Haiku is the model that took the exit.

**Pattern:** on settled or well-reported claims the two models are interchangeable. On the one
contested claim — the kind the product exists for — Haiku failed in the authoritative
direction. A sample of one, but the asymmetry matters: a slow correct check costs the visitor
minutes; a fast wrong one costs the product its reason to exist.

### Recommendation: `claude-sonnet-5` — **Luke picked Sonnet 5, 2026-08-28**

Decision 15 stands. Haiku 4.5 was the spike candidate and the spike says it cannot safely
replace Sonnet for contested claims, which is the core case. What Sonnet costs us:

- **The three-minute assumption is overturned as a ceiling and confirmed as a typical figure.**
  Sonnet: median ~80s across the five production-shaped runs; 2 of 6 attempts (same claim)
  exceeded 5 minutes. Roughly one contested claim in four will take 3–6 minutes.
- **Capacity halves:** ~55 checks/month, under 2 a day, versus the "three to seven a day" in the
  capacity note. Still within what Luke described wanting; the cap is the real limit either way.

**Countdown prediction:** show **90 seconds**. When it reaches zero, replace it with "Still
checking — claims that need many sources can take up to six minutes." Do not extend the
countdown; a second countdown that also expires is worse than an honest open-ended wait.

**Consequence for S2-1 (hosting go/no-go):** the test is now a **six-minute** end-to-end hold,
not three. This is a real test, not a formality. Two escape hatches already in the doc if the
platform or intermediaries drop a long idle connection: SSE with a heartbeat (held in reserve),
or respond-with-id-then-poll `/r/<id>`. Cody should plan on needing one of them.

**If Luke picks Haiku instead** (a legitimate call if speed and capacity matter more than the
contested case), the three-minute assumption is confirmed with a wide margin (max 20s), the
countdown is 30 seconds, capacity is ~380/month, and the read-out's quality findings should be
recorded as the known cost.

**Untested cost lever, not a decision:** every run shows `cache_read=0`. No `cache_control` is
set. Most Sonnet cost is input tokens re-read across tool-loop turns. Whether prompt caching
applies inside a server-tool loop is something Cody can test in one run in Sprint 2; I do not
know the answer and will not estimate the saving.

### Decision: `max_uses` stays 5; `max_uses_exceeded` is not a tool error

`max_uses_exceeded` is our own budget being enforced. The tool delivered every search we
allowed; the model asked for a sixth and was told no. By construction it can only occur *after*
`max_uses` successful searches — so Cody's "failed after grounding vs before grounding"
distinction reduces to "which error code", which is a cleaner rule than counting successes.

Rule, replacing the binary check in `classifyOutcome`:

- `web_search_tool_result` whose `content` is an error object with `error_code:
  "max_uses_exceeded"` → **not an error**. Outcome stays `ok`; the record gets
  `search_cap_hit: true`; the result page shows one line: "Search budget reached; this report
  is based on 5 searches."
- Any other error code (`unavailable`, `too_many_requests`, `query_too_long`, etc.) → `tool_error`
  as today. That is the tool failing, which is what the failure-handling rule guards against.

Under this rule Sonnet was 4 of 4 `ok` in S1-3. The cap stays at 5 because it is the latency
governor: the 5m40s run was a 5-search run, and raising the cap makes the tail worse. Raising
it would be the wrong fix for the Meta AI case; the report it produced was complete.

**Side effect for Cody:** the S1-2 forced-error test (`max_uses: 1`) no longer produces a
`tool_error` under this rule. The classifier test needs a synthesized message with a different
error code instead of a live forced call. Sprint 2 item.

### Decision: the function wraps the claim in a single-turn frame

SKILL.md assumes a chat: step 2 tells the model to stop and ask on uncontroversial claims, and
step 7's template bakes in "let me know and I'll analyze that instead." The site has no second
turn. The vendored SKILL.md stays byte-identical (S1-1); the fix goes in the **user message**,
which the function already builds:

> Produce the complete Fact-Check Report for the text below. This is a single request with no
> follow-up: do not ask questions. If the claim is uncontroversial, still produce the full
> report and say so in the Triage section. If part of the text is ambiguous, state your reading
> and proceed.
>
> ---
> *(claim)*

And belt-and-braces in the classifier: a completed message whose text contains no `# Fact-Check
Report` heading → new outcome **`no_report`**, rendered as a failed check. The outcome set becomes
`ok | refusal | tool_error | truncated | no_report`.

### Demo script note

Step 3 has Luke run a claim of his choosing on Sonnet and expects a report in under three
minutes. On a contested claim that is roughly a 1-in-4 miss. The acceptance line ("at least one
model completes every check under three minutes") holds regardless, via Haiku's four runs.
Luke's choice: pick a settled or news claim for step 3, or run it and treat an overrun as the
read-out's prediction coming true rather than a failure.

---

## S1-5 · Report rendering — **decided with Luke, 2026-08-28: verbatim markdown, assembled**

### What step 7 actually emits through the API

Not a single markdown string. A list of content blocks: `text` blocks interleaved with
`server_tool_use` / `web_search_tool_result` blocks, where the text blocks that quote a source
carry a `citations` array (`url`, `title`, `cited_text`). Three consequences visible in every
`spike/results/*.md`:

1. **The floating quotes.** Every cited passage appears as its own paragraph, torn out of its
   sentence — because `check.mjs` joins text blocks with a blank line. In the real response
   they are contiguous text; a citation boundary is not a paragraph boundary.
2. **No source links anywhere.** `check.mjs` keeps `block.text` and drops `block.citations`.
   The report says "one detailed historical rebuttal" and the reader cannot click it. Zero URLs
   survive in all ten JSON records. A fact-check without its sources is an opinion with headings.
3. **Narration before the report.** "I'll fact-check this claim…", "Content is short snippet
   only. Let me check other sources…" — text blocks the model emitted between searches, now
   the first thing on the page.

The report *proper* is clean, well-structured markdown with stable `##` headings that follow
the skill's template exactly across all seven completed reports. There is nothing in it worth
parsing into fields.

### Decision: verbatim markdown, assembled correctly

Render the report as markdown, no section parsing. But "verbatim" must mean the *message*, not
`block.text` concatenated — three assembly rules in the function, all mechanical:

1. **Join text blocks with no separator** (kills the floating quotes).
2. **Turn citations into links**: append a footnote marker after each cited span; render a
   Sources list at the end with `title — url`. Dedupe by URL. This is the only place the site
   adds anything to the model's output, and it is the model's own data.
3. **Start rendering at the first `# Fact-Check Report` line** if one exists; store the full
   text in the record regardless. (If no such line exists, the outcome is `no_report` and the
   page shows the failed-check message.)

Why not structured: the headings are already the structure; a parser would break the day the
upstream skill re-words a heading, and decision 13 says we track the skill's commit precisely
so that we don't have to build that kind of machinery. What this forecloses: nothing —
the record keeps the full text and the citations, so a structured view can be built later
without re-running a single check.

**S2-5's target:** a static page that takes a result record `{report_markdown,
citations[], outcome, search_cap_hit, model, skill_commit, created_at, duration_ms}` and renders
the markdown with a Sources list, or the failed-check message when `outcome != ok`.

**Example report attached:** `spike/results/20260826T171953Z-claude-sonnet-5.md` (DST repeal,
Sonnet 5) — a complete seven-step report with no narration preamble; the floating-quote
artefact is visible in its Evidence Summary. `spike/results/20260826T171815Z-claude-sonnet-5.md`
(GM streetcar) shows what the method does at its best. No example with citations rendered
exists yet, because the spike script never captured them; Cody's first Sprint 2 change to the
call path is to keep `block.citations` in the record.

**Spike script note for Cody (not a story on its own):** the API reports the search count in
`usage.server_tool_use.web_search_requests`; `check.mjs` counts result blocks instead. Same
number in every run so far; the `usage` field is the billed one.

---

## Doc corrections for Lila — `DOC/architecture.md`

Handed over as a list; I have not touched `DOC/`. Items 1–2 carried from S1-2; the rest from
this read-out. Items marked *(after Luke)* were conditional on his picks; he picked Sonnet 5 and verbatim-assembled markdown in this session, so all 13 are actionable.

1. **Failure handling §1** — `fallbacks: "default"` + `server-side-fallback-2026-07-01` is
   rejected (400) by `claude-sonnet-5` and `claude-haiku-4-5`; it is an Opus-tier/Fable
   feature. Delete "enable it from the first commit". v1 does not use it. Refusals are still
   detected by `stop_reason: "refusal"`; that part stands.
2. **Tool configuration** (new line under Shape or Failure handling) — `web_search` is sent
   with `max_uses: 5`; `max_uses` must be ≥ 1 (0 is a 400 at request validation, not a
   per-search error). Haiku 4.5 needs the `web_search_20250305` variant (decision 15 already
   says this).
3. **Failure handling §2** — add the rule: `max_uses_exceeded` is not a tool error (our budget,
   only reachable after 5 successful searches); outcome stays `ok` with `search_cap_hit: true`
   and a one-line note on the page. Every other `error_code` → `tool_error`.
4. **Failure handling — new §3** — the single-turn frame: the function wraps the claim in the
   fixed user-message text above; SKILL.md stays unmodified. A completed message with no
   `# Fact-Check Report` heading → outcome `no_report`, rendered as a failed check.
5. **Result record** — outcomes are `ok | refusal | tool_error | truncated | no_report`; add
   `search_cap_hit`, `served_by_model`, `tool_errors`, and `citations[]` (url, title,
   cited_text) alongside `report`.
6. **Capacity note on decision 9** — replace the estimate with measured: Sonnet 5 $0.11–$0.56
   per check, mean $0.36 → ~55 checks/month (~2/day); Haiku 4.5 mean $0.05 → ~380/month. Web
   search is metered at $10 per 1,000 ($0.01/search) on top of tokens. Delete "three to seven
   a day".
7. **Latency section** — replace "Unmeasured" with the table above. Sonnet: typical 30–90s,
   contested claims 2.5–6 min. Haiku: 3–20s. Three minutes is a typical figure, not a ceiling.
   S2-1's test is a six-minute hold; SSE heartbeat or respond-then-poll are the fallbacks.
8. **Decision 10** — countdown is 90s with the overflow message (Sonnet) or 30s (Haiku).
   *(after Luke)*
9. **Decision 15** — record Luke's pick; remove "Haiku pending spike". Record the quality
   finding either way. *(after Luke)*
10. **Open questions** — 2 and 4 resolve to the S1-4/S1-5 decisions; 1 (Cloudflare) is now
    conditional on the six-minute hold. *(after Luke)*
11. **Components / Static site** — the result page renders `report` as markdown from the first
    `# Fact-Check Report` line, with a Sources list from `citations[]`; no section parsing.
    *(after Luke)*
12. **First task: the timing spike** — mark done; point at `spike/RESULTS.md` and this handoff.
13. **Not doing** — add "prompt caching: untested; a Sprint 2 measurement, not a v1 feature."

Also for Lila, from the sprint file's own text: S1-2's scope line says `fallbacks: "default"`;
that story is closed and the line is history, leave it — but S2's stories should not repeat it.

---

## What worked, what didn't

Worked: everything needed was already on disk. Reading all eight reports rather than the table
is what surfaced the Eiffel no-report case and the missing citations — neither shows in a
summary row.

Didn't: nothing blocked. Both PO decisions were put to Luke at the end of the session with the
numbers, and he picked the recommended option on each. They are decided here; Lila records
them in DOC (S1-6).

## Current state and blockers

- S1-4: done. Checkboxes ticked in `AMS/SPRINTS/sprint-1.md`.
- S1-5: decided. "S2-5 has an unambiguous target" ticked; "Decision recorded" is ticked by
  Lila when she writes it into `DOC/architecture.md`.
- S1-6 (Lila): unblocked; the corrections list above is her complete input.
- Sprint 1 demo (Luke) can run any time; the acceptance line "Luke has picked the model" is
  met.

## Open questions

- Does prompt caching apply inside a server-tool loop? Cody, one run, Sprint 2.

## Files created or modified

**Created:** this handoff.
**Modified:** `AMS/SPRINTS/sprint-1.md` (S1-4 checkboxes; Decisions Made This Sprint),
`AMS/OFFICES/archie/desk.md`, `AMS/OFFICES/archie/open-threads.md`,
`AMS/OFFICES/archie/working-notes.md`.
**Not touched:** `AMS/DOC/`, `AMS/LEARNINGS/`, `spike/`, `skill/`.

**Sprint/stories touched:** S1-4 (completed), S1-5 (decided; Lila records).

---

## Prompt for Next Assistant

Persona: **Lila (Librarian)**. Model: `claude-sonnet-5`. Tool: Claude Code —
`claude --model claude-sonnet-5`.

```
You are Lila, the Librarian. Do not guess or change this.

Read AMS/OFFICES/lila/desk.md FIRST if it exists, then AMS/AGENT.md and follow it. Then read
AMS/CONFIG.md, AMS/SPRINTS/sprint-1.md, AMS/DOC/architecture.md, AMS/DOC/working-agreements.md,
and this handoff (AMS/HANDOFF/handoff-2026-08-28-s1-4-s1-5-spike-readout-archie.md) in full —
its "Doc corrections for Lila" section is your input.

Luke's decisions (2026-08-28): model = claude-sonnet-5; result rendering = verbatim markdown
assembled from content blocks with a Sources list built from the API's citations, no section
parsing. Both are final; record them, do not reopen them.

Your story is S1-6 in AMS/SPRINTS/sprint-1.md:
- Record the documentation-ownership rule in DOC/working-agreements.md: DOC and LEARNINGS are
  written by Lila; every agent writes its own handoff
- Review DOC/architecture.md and DOC/working-agreements.md as written by Archie on 2026-08-25;
  fix anything unclear
- Apply all 13 corrections listed in Archie's handoff to DOC/architecture.md (the "(after
  Luke)" items use the decisions above); update the "Last updated" line
- Tick S1-5's "Decision recorded" acceptance box in AMS/SPRINTS/sprint-1.md once it is in DOC
- Add DOC/README.md listing every DOC file with one line each

Also carry: Cody's two S1-2 corrections are items 1 and 2 of Archie's list — do not
re-derive them from AMS/OFFICES/cody/open-threads.md; tick them off there is Cody's job.

Constraints:
- You are the only persona who writes to DOC/ and LEARNINGS/. Nobody else has, since the rule.
- Do not change spike/, skill/, or any sprint story text other than S1-6's checkboxes.
- AGENTS NEVER PUSH. Do not commit unless asked; Luke shapes the first commit.
- Update your office if you keep one, and write a handoff with a Prompt for Next Assistant.
  The next step after you is the Sprint 1 demo (Luke) and then S1-R (Nadia runs, you write).
```

---

## Addendum (same day) — demo failed at step 2; fix story F1-1

Lila relayed, via cross-session message, that Luke's first run of the demo script stalled at
step 2: report files are `<timestamp>-<model>.md` with no claim identifier, so a same-claim
pair cannot be found without opening files one by one. Step 4 had the same shape ("the
read-out" among six handoffs). Luke's ask: one command that guides him through the steps.

**Decided (Archie):** one fix story, **F1-1**, in `AMS/SPRINTS/sprint-1.md`. Owner **Sandy**
(Haiku) — it is a Files column in `RESULTS.md` plus a `demo.sh` wrapper around existing
commands; `check.mjs` is not touched. `demo.sh` lives at the repo root (the ask was "one
command"), derives the same-claim pairs from the JSON records' `claim_text` rather than a
hardcoded list, runs step 3 live, opens the read-out for step 4, and **never writes to `AMS/`**
— acceptance stays Luke's deliberate act. The sprint's demo table now says Luke runs `./demo.sh`;
the four steps are unchanged as the definition of the demo.

Both of Lila's proposed parts were adopted as proposed; the additions are root placement,
JSON-derived pairing, the key-file guard, and the "only under `spike/results/`" acceptance line.

**Candidate convention for Lila to record in `DOC/working-agreements.md` after Luke accepts
Sprint 1, not before:** every sprint's demo script ships as a runnable `demo.sh` that walks the
PO through the steps and records nothing. One data point is not a rule yet.

**Pipeline:** F1-1 (Sandy) and S1-6 (Lila) are independent and can run in parallel. The demo
re-runs after F1-1.

### Staffing change (Luke, same day): Quinn, not Sandy

Luke: "it was a mistake not to staff QA for this — any project big enough for me to want a
demo after each sprint needs it." **Quinn (QA / Tester, `Personas.md`) is hired for F1-1** and
owns every sprint's `demo.sh` and a dry-run of the demo table before it reaches Luke. F1-1's
owner line is updated. Sandy has nothing pending. Hannah hires; her handoff carries Quinn's
prompt so no extra round trip is needed — F1-1 is fully specified in the sprint file, so
Quinn's prompt does not depend on what Hannah writes.

**For Lila, item 14 on the corrections list** (`DOC/working-agreements.md`, Luke-stated so it
can be recorded now): *every sprint's demo ships as a runnable `demo.sh` that walks the PO
through the steps and records nothing; Quinn builds it and dry-runs the demo table before the
PO runs it.*

### Prompt for Hannah (hire Quinn)

Persona: **Hannah (HR)**. Model: `claude-sonnet-5`. Tool: `claude --model claude-sonnet-5`.

```
You are Hannah, HR. Do not guess or change this.

Read AMS/OFFICES/hannah/desk.md FIRST, then AMS/AGENT.md and follow it. Then read
AMS/CONFIG.md, AMS/Personas.md, AMS/SPRINTS/sprint-1.md (the "Fix Stories" section), and the
"Addendum" and "Staffing change" sections at the end of
AMS/HANDOFF/handoff-2026-08-28-s1-4-s1-5-spike-readout-archie.md.

Hire Quinn (QA / Tester — already named in Personas.md), the same way you hired the Sprint 1
team on 2026-08-25:
- Create AMS/OFFICES/quinn/{identity,desk,open-threads,working-notes}.md from _template/,
  in the Lane / Working stance / What I'm not structure the other offices use.
- Quinn's lane, per Luke and Archie: owns quality assurance. Concretely for this project:
  builds each sprint's demo.sh, dry-runs the sprint's demo table before Luke performs it, and
  flags any step that cannot be performed as written as a fix story. Later, when there is
  product code, writes and runs tests. Quinn runs on claude-haiku-4-5 for runners and
  dry-runs; Sonnet only if and when Quinn is writing real test suites — that is a later call.
- "What I'm not": not Sandy (Sandy executes bounded implementation stories; Quinn verifies
  that the demo and the product do what the sprint file says); not Cody (does not own spike/
  or the product code, only touches them inside a story assigned to Quinn); not Lila (does
  not write DOC/ or LEARNINGS/); does not accept sprints — Luke does.
- desk.md points at F1-1 in AMS/SPRINTS/sprint-1.md as the first story.
- Add quinn to the roster in AMS/CONFIG.md.

Do not touch AMS/DOC/, AMS/LEARNINGS/, spike/, skill/, or any story text.
Do not commit or push. AGENTS NEVER PUSH.

Write a handoff. Its "Prompt for Next Assistant" is the Quinn prompt below, copied exactly —
Archie wrote it and F1-1 is fully specified in the sprint file, so it does not depend on your
office text. If anything you decided while hiring conflicts with F1-1's owner or model line,
do NOT launch Quinn; say so in your handoff and Luke takes it to Archie.

--- Quinn prompt to carry, verbatim ---
You are Quinn, QA / Tester. Do not guess or change this.

Read AMS/OFFICES/quinn/desk.md FIRST, then AMS/AGENT.md and follow it. Then read
AMS/CONFIG.md and AMS/SPRINTS/sprint-1.md — your story is F1-1 under "Fix Stories"; follow its
scope and acceptance criteria exactly. Skim spike/RESULTS.md and one spike/results/*.json to
see the record shape (claim_text, model, created_at).

Do:
- Add a Files column to the results table in spike/RESULTS.md, derived from the .json records.
- Create demo.sh at the repo root (chmod +x) that walks the four demo steps in
  AMS/SPRINTS/sprint-1.md's "Sprint Demo Script" table, pausing for Enter between steps.
- Dry-run steps 1, 2, and 4 yourself — that is your lane. Do NOT run step 3 yourself: it costs
  real money and is Luke's to run. Verify the command it builds is exactly the one in the
  story and that the key-file guard works when the file is absent.

Do not:
- Modify spike/check.mjs, anything under AMS/DOC/ or AMS/LEARNINGS/, or any story text other
  than F1-1's checkboxes.
- Let demo.sh write anywhere except what check.mjs itself writes under spike/results/.
- Commit or push. AGENTS NEVER PUSH.

When done: tick F1-1's boxes you verified, update your office, and write a handoff with a
Prompt for Next Assistant. Next is Luke running ./demo.sh; if S1-6 (Lila) is not yet done, say
so in the prompt.
--- end Quinn prompt ---
```
