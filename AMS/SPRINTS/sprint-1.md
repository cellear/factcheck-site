# Sprint 1: It runs

**Sprint Goal:** A real fact-check produced by the skill through the Anthropic API, with measured duration and cost, on two candidate models.

**Confidence:** confirmed

**Personas this sprint:** Archie, Cody, Lila, Luke, Nadia, Sandy

---

## Stories

### S1-1 · Vendor SKILL.md with source commit recorded · [x]

**Owner:** Sandy · **Model:** `claude-haiku-4-5` · **Size:** s · **Depends on:** none

**Scope:**
- Copy `SKILL.md` from `cellear/claude-fact-check-skill` into `skill/SKILL.md`
- Write `skill/SOURCE.md` with the upstream repo URL, commit hash, and date vendored

**Acceptance criteria:**
- [x] `skill/SKILL.md` is byte-identical to the upstream file at the recorded commit — md5
      verified by Sandy 2026-08-25; boxes ticked during the S1-R retro (2026-08-29), missed at
      the time
- [x] `skill/SOURCE.md` names the commit hash (`73a08409365b4b07e204989d60682f9de1a2d26a`)

---

### S1-2 · Spike script: one check, one call, measured · [x]

**Owner:** Cody · **Model:** `claude-sonnet-5` · **Size:** m · **Depends on:** S1-1

**Scope:**
- Node script `spike/check.mjs <claim> --model <id>` using `@anthropic-ai/sdk`
- System prompt = vendored `SKILL.md`; tools = `web_search_20260209` (basic variant for Haiku 4.5); `fallbacks: "default"` with the server-side-fallback beta; streaming with `finalMessage()`
- Logs wall-clock ms, `usage` (input/output tokens, search count), computed USD from a price table, `stop_reason`, and classifies outcome (ok / refusal / tool_error / truncated)
- Saves the full report and a JSON record to `spike/results/<timestamp>-<model>.{md,json}`
- Never treats a `web_search_tool_result` whose `content` is an error object as "no sources"

**Acceptance criteria:**
- [x] Running the script against one claim produces a report file and a JSON record with every field above populated
- [x] A forced tool error (e.g. `max_uses: 0`) is classified `tool_error`, not `ok`
- [x] The API key is read from the environment, never from a file in the repo

---

### S1-3 · Run the spike: 3–5 claims × Sonnet 5 × Haiku 4.5 · [x]

**Owner:** Cody · **Model:** `claude-sonnet-5` · **Size:** s · **Depends on:** S1-2

**Scope:**
- Luke supplies the claims (or Cody proposes five spanning easy, contested, and stale)
- Run each claim on both models; commit results and a summary table `spike/RESULTS.md`

**Acceptance criteria:**
- [x] `spike/RESULTS.md` has one row per run: claim, model, duration, tokens, searches, USD, outcome
- [x] At least three completed reports per model are in `spike/results/`
- [x] Total spend for the story is recorded

---

### S1-4 · Spike read-out · [x]

**Owner:** Archie · **Model:** `claude-opus-5` · **Size:** s · **Depends on:** S1-3

**Scope:**
- Read the results; recommend the model; state the countdown prediction; confirm or overturn the three-minute assumption
- List corrections needed in `DOC/architecture.md` for Lila to apply

**Acceptance criteria:**
- [x] A short read-out exists in the sprint handoff with a model recommendation and a predicted duration
- [x] Any doc corrections are handed to Lila as a list, not applied by Archie

---

### S1-5 · Decide report rendering from real output · [ ]

**Owner:** Archie · **Model:** `claude-opus-5` · **Size:** s · **Depends on:** S1-3

**Scope:**
- Look at what step 7 actually emits through the API
- Decide with Luke: render verbatim markdown, or parse into a structured page

**Acceptance criteria:**
- [x] Decision recorded (Lila writes it into `DOC/architecture.md`) with an example report attached — decided 2026-08-28, Lila ticks this in S1-6
- [x] S2-5 has an unambiguous target

---

### S1-6 · Lila takes ownership of DOC · [x]

**Owner:** Lila · **Model:** `claude-sonnet-5` · **Size:** s · **Depends on:** none

**Scope:**
- Record the documentation-ownership rule in `DOC/working-agreements.md`: DOC and LEARNINGS are written by Lila; every agent writes its own handoff
- Review `DOC/architecture.md` and `DOC/working-agreements.md` as written by Archie on 2026-08-25; fix anything unclear; add a `DOC/README.md` index

**Acceptance criteria:**
- [x] The rule is in `DOC/working-agreements.md`
- [x] `DOC/README.md` lists every DOC file with one line each

---

### S1-R · Retro and records · [x]

**Owner:** Nadia (runs it) and Lila (writes it) · **Model:** `claude-sonnet-5` · **Size:** s · **Depends on:** sprint accepted

**Scope:**
- After acceptance, Nadia reviews the sprint and decides what should be recorded
- Lila writes `LEARNINGS/sprint-1.md` and applies any DOC updates Nadia or Archie handed over

**Acceptance criteria:**
- [x] `LEARNINGS/sprint-1.md` exists
- [x] No DOC edits were made by anyone but Lila

---

## Sprint Demo Script

Luke performs these steps in order. Each has an expected outcome. If any step does not match, the sprint is not accepted and fix stories are added to this file.

Luke runs **`./demo.sh`** from the repo root (F1-1) and it walks him through the four steps below,
pausing between each. The steps remain the definition of the demo; the script is how he performs them.

| # | Luke does (via `./demo.sh`) | Expected |
|---|---|---|
| 1 | The script shows `spike/RESULTS.md`. | A table with ≥6 rows (≥3 per model): duration, tokens, searches, USD, outcome, **and the two report filenames per claim**. |
| 2 | The script lists the same-claim pairs and opens the pair Luke picks, Sonnet 5 and Haiku 4.5 side by side. | Both are complete seven-step reports; he can judge quality side by side. |
| 3 | The script asks for a claim and runs `node spike/check.mjs "<claim>" --model claude-sonnet-5`, printing elapsed time. | A report appears; the script says whether it was under three minutes. Per the S1-4 read-out, a contested claim may take 3–6 min — that is the prediction holding, not a failure. |
| 4 | The script prints the path of the S1-4 read-out (`AMS/HANDOFF/handoff-2026-08-28-s1-4-s1-5-spike-readout-archie.md`) and opens it. | A model recommendation and a predicted duration are stated, with the numbers that justify them. |

The script never records acceptance. Accepting or writing fix stories stays a deliberate act
Luke takes in this file.

**Accepted when:**
- At least one model completes every check under three minutes.
- Cost per check is a measured number, not an estimate.
- Luke has picked the model.

---

## Decisions Made This Sprint

- S1-2: `fallbacks: "default"` is rejected (400) on `claude-sonnet-5` and `claude-haiku-4-5` —
  it's an Opus-tier/Fable feature only. The spike script does not send it for either model in
  this sprint. `DOC/architecture.md`'s "enable it from the first commit" line needs correcting
  by Lila (flagged for S1-4/S1-6).
- S1-2: `max_uses: 0` on `web_search_20260209` is a 400 at request-validation time, not a
  per-search error as the story scope assumed. `max_uses: 1` is what actually forces a
  `tool_error`, and needs the request nudged toward a second search — see the S1-2 handoff.
- S1-3: Sonnet 5 missed the 3-minute demo target on 2 of 4 claims (5m40s and 2m35s); Haiku 4.5
  was under 3 minutes on all 4, often by an order of magnitude in both time and cost. Sonnet 5
  also hit a natural (unforced) `tool_error` at `max_uses: 5` on a recent-news claim needing
  broad sourcing — the model wrote a full, well-sourced report anyway after the searches failed,
  but the classifier correctly still marks it failed per the architecture's failure-handling
  rule. See `spike/RESULTS.md` for the full table and Cody's notes for Archie's S1-4 read-out.

---

- S1-4: Archie recommends **`claude-sonnet-5`** (decision 15 stands). Across all four claim pairs
  the models were at parity on settled and news claims, but on the one contested claim (GM
  streetcar) Haiku 4.5 certified false specifics as true; that is the product's core case. Cost
  is measured: Sonnet mean $0.36/check (~55/month at the cap), Haiku $0.05 (~380/month). The
  three-minute figure is **typical, not a ceiling** on Sonnet — about 1 contested claim in 4
  runs 3–6 min; countdown is 90s with an honest overflow message; S2-1 must test a six-minute
  hold. `max_uses` stays 5 and `max_uses_exceeded` is reclassified as **not** a tool error
  (our own budget, only reachable after 5 successes) → Sonnet was 4/4 `ok`. New outcome
  `no_report` and a fixed single-turn frame around the claim, because Haiku followed SKILL.md
  step 2 literally on the Eiffel claim and stopped to ask a question instead of reporting.
  13 doc corrections handed to Lila in the S1-4 handoff. **Luke picked Sonnet 5 (2026-08-28).**
- S1-5 (**decided with Luke, 2026-08-28**): render the report as **verbatim markdown**, assembled
  from content blocks correctly — join text blocks with no separator, turn `citations` into a
  Sources list, start at the first `# Fact-Check Report` line. No section parsing. The spike
  script dropped every citation URL, which is why no report on disk has source links; keeping
  `block.citations` is Cody's first Sprint 2 change.

## Acceptance

**Status:** Accepted
**Date:** 2026-08-29
**Reviewed by:** Luke — ran `./demo.sh` end to end (all four steps, including a live step-3
check on `claude-sonnet-5`) and confirmed it passed.

---

## Fix Stories

Added 2026-08-28 after Luke's first demo attempt failed at step 2 (relayed by Lila; story by Archie).
Luke's call, same day: this is QA's lane — Quinn is hired for it and owns every sprint's demo runner from here on.

### F1-1 · The demo runs from one command, and same-claim reports are findable · [x]

**Owner:** Quinn (QA — hired for this by Hannah) · **Model:** `claude-haiku-4-5` · **Size:** s · **Depends on:** Quinn's office exists

**Why:** report files are named `<timestamp>-<model>.md` with no claim identifier; the only way
to find a same-claim pair was opening files one by one. `RESULTS.md` says pairs are "matched by
claim text and `created_at`" but names no files. Step 4 had the same shape: "the read-out"
names no file among six handoffs. Luke's ask: one command that guides him through the steps.

**Scope:**
- Add a **Files** column to the results table in `spike/RESULTS.md`: for each row, the `.md`
  filename in `spike/results/`. Derive it from each record's `claim_text` and `model` in the
  `.json` files — do not guess from timestamps.
- Add **`demo.sh`** at the repo root. It walks the four demo steps in order, pausing for Enter
  between them:
  1. Prints `spike/RESULTS.md` (or opens it with `open` on macOS).
  2. Reads every `spike/results/*.json`, groups by `claim_text`, lists only claims that have
     one `claude-sonnet-5` and one `claude-haiku-4-5` record, numbered with a short claim
     excerpt; Luke picks a number; the script opens both `.md` files.
  3. Prompts for a claim; runs
     `ANTHROPIC_API_KEY="$(cat /Users/lukemccormick/Sites/CLAUDE/fact-check-key.key)" node spike/check.mjs "<claim>" --model claude-sonnet-5`;
     prints elapsed seconds and whether it was under 180; opens the new report. Refuses to
     start if the key file is missing, with a one-line message.
  4. Prints and opens `AMS/HANDOFF/handoff-2026-08-28-s1-4-s1-5-spike-readout-archie.md`.
- The script does **not** write to `AMS/` or anywhere else. It reads, runs one check, and opens
  files. No acceptance recording.
- Do not modify `spike/check.mjs`.

**Acceptance criteria:**
- [x] `spike/RESULTS.md`'s table has a Files column and every filename in it exists
- [x] `./demo.sh` from the repo root performs steps 1, 2, and 4 without Luke opening a file
      himself, and step 3 with only a claim typed in
- [x] Step 2 lists exactly the four S1-3 claims (the two S1-2 Sonnet-only runs are not offered)
- [x] `git status` after a full run shows changes only under `spike/results/` (the new report) —
      confirmed after Luke's live run 2026-08-29: three new report pairs landed under
      `spike/results/`, nothing else. (The repo has no initial commit yet, so `git status`
      itself can't diff inside the untracked `spike/` tree — verified by inspecting `demo.sh`'s
      writes plus the new files' timestamps/paths instead.)

---

## Deferred to Later Sprints

- **Possible future enhancement:** let the user pick which model runs the check, not limited to
  Anthropic models. Raised by Luke during S1-3. Not MVP — deferred after Cody flagged that
  `spike/check.mjs` currently leans on Anthropic-specific pieces (the server-hosted `web_search`
  tool, `fallbacks`/streaming API shape) that a non-Anthropic provider wouldn't have; supporting
  another provider would mean a different search mechanism (client-side tool calling to a search
  API the project provides), different cost tracking, and possibly skill-prompt changes. An
  architecture decision for Archie to scope, not a config tweak.
