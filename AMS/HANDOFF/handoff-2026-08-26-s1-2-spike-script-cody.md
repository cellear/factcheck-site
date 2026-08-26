# Handoff — S1-2 complete

**Cody (Coder) · claude-sonnet-5 · S1-2**

---

## What was attempted, and the outcome

Built `spike/check.mjs` per the S1-2 scope in `AMS/SPRINTS/sprint-1.md`, then live-tested it
against the real Anthropic API (Luke provided a funded key). Both acceptance criteria are
verified against real API responses, not just code review:

- Normal run on `claude-sonnet-5` → `outcome: ok`, full report + JSON populated
  (`spike/results/20260826T071257Z-claude-sonnet-5.{md,json}`).
- Forced tool-error run → `outcome: tool_error`, not `ok`
  (`spike/results/20260826T071736Z-claude-sonnet-5.{md,json}`).
- API key read only via `new Anthropic()` (env), confirmed nowhere in the repo.

S1-2 acceptance criteria and story checkbox are checked off in `AMS/SPRINTS/sprint-1.md`.

## What worked, what didn't

**Worked:** the tool-runner/streaming/`finalMessage()` pattern from the claude-api skill applied
directly; the failure-handling classifier (check `web_search_tool_result.content` shape before
trusting `stop_reason: end_turn`) worked exactly as `DOC/architecture.md` specifies — see below,
it caught a real case a naive check would have missed.

**Didn't work as scoped — two real findings, both fixed in the script:**

1. **`fallbacks: "default"` 400s on `claude-sonnet-5` and `claude-haiku-4-5`** —
   `"'claude-sonnet-5' does not support the `fallbacks` parameter."` It's Opus-tier/Fable only.
   `DOC/architecture.md` currently says to enable it "from the first commit" without qualifying
   by model — that's a doc correction for Lila (I don't own `DOC/`). The script now has a
   `MODELS_SUPPORTING_FALLBACKS` set (currently empty — neither sprint model qualifies) and only
   takes the `client.beta.messages` path with the beta header when a model is in it.
2. **`max_uses: 0` is a 400 at request-validation time**, not a per-search error as the story
   scope's example implied (`"tools.0.web_search_20260209.max_uses: Input should be greater
   than 0"`). `max_uses: 1` is the right way to force it — but the model won't reliably attempt
   a *second* search just because the claim is disputed (confirmed nondeterministic: one run
   with `max_uses: 1` needed only one search and returned `ok`). With `--force-tool-error`, the
   script now appends a steering line to the user message ("run at least two separate web
   searches...") to make the second call — and therefore the cap violation — actually happen.

**The failure-handling rule earned its keep in the tool_error test run**: with the search tool
capped, the model transparently said the search failed, then wrote a full, fluent "Bottom Line:
false" report from prior knowledge anyway, with high stated confidence. `stop_reason` was
`end_turn` — a naive check would have logged this as a completed verdict. The classifier caught
it via the `web_search_tool_result` content shape and correctly returned `tool_error`.

## Current state

- `spike/check.mjs` — complete, live-tested, no known issues
- `package.json` — added at repo root, `@anthropic-ai/sdk` `^0.71.0` (installed: `0.71.2`)
- `.gitignore` — added `node_modules/`
- `spike/results/` — two verification runs left in place as evidence (see above); nothing else
  committed to git yet (Luke shapes the first commit)
- Spend this session: ~$0.72 across three completed API calls (one `ok`, one accidental
  `max_uses:1`-without-steering run I deleted the output of, one `tool_error`) — small relative
  to the $20/month cap, but worth Luke knowing since S1-3 adds several more real calls.
- API key lives at `/Users/lukemccormick/Sites/CLAUDE/fact-check-key.key` — outside this repo,
  outside `~/.claude`, confirmed funded by Luke. Not read into any file this session controls;
  only referenced by path when invoking `node`.

## Open questions

- None blocking S1-3. The two findings above are doc-correction items for Archie/Lila
  (S1-4/S1-6), not blockers to running the spike.

## Files created or modified

**Created:** `spike/check.mjs`, `package.json`, `spike/results/20260826T071257Z-claude-sonnet-5.{md,json}`, `spike/results/20260826T071736Z-claude-sonnet-5.{md,json}`

**Modified:** `.gitignore` (added `node_modules/`), `AMS/SPRINTS/sprint-1.md` (S1-2 checkboxes,
Decisions Made This Sprint), `AMS/OFFICES/cody/desk.md`, `AMS/OFFICES/cody/open-threads.md`,
this handoff.

**Not touched:** `AMS/DOC/`, `AMS/LEARNINGS/` (Lila's) — the two findings above are listed here
for her to pick up, not applied by me.

**Sprint/stories touched:** S1-2 (completed).

---

## Prompt for Next Assistant

Persona: **Cody (Coder)**. Model: `claude-sonnet-5`. Tool: Claude Code — `claude --model claude-sonnet-5`.

```
You are Cody, the Coder. Do not guess or change this.

Read AMS/OFFICES/cody/desk.md FIRST, then AMS/AGENT.md and follow it. Then read AMS/CONFIG.md
and this handoff (AMS/HANDOFF/handoff-2026-08-26-s1-2-spike-script-cody.md).

Your story is S1-3 in AMS/SPRINTS/sprint-1.md:
- Run 3-5 claims (Luke supplies them, or propose five spanning easy/contested/stale if he
  doesn't) across BOTH claude-sonnet-5 and claude-haiku-4-5 using spike/check.mjs
- Commit results and a summary table to spike/RESULTS.md: one row per run — claim, model,
  duration, tokens, searches, USD, outcome
- At least three completed reports per model must land in spike/results/
- Record total spend for the story

Acceptance criteria (from the sprint file):
- [ ] spike/RESULTS.md has one row per run: claim, model, duration, tokens, searches, USD, outcome
- [ ] At least three completed reports per model are in spike/results/
- [ ] Total spend for the story is recorded

Known constraints from S1-2 (read the full handoff for detail):
- spike/check.mjs works and is live-verified — use it as-is, no need to touch it unless
  something new breaks
- claude-haiku-4-5 uses the basic web_search_20250305 variant automatically (handled in the
  script); claude-sonnet-5 uses web_search_20260209
- fallbacks: "default" is NOT sent for either model (both 400 on it) — don't re-add it
- The API key is at /Users/lukemccormick/Sites/CLAUDE/fact-check-key.key — invoke like:
  ANTHROPIC_API_KEY="$(cat /Users/lukemccormick/Sites/CLAUDE/fact-check-key.key)" node spike/check.mjs "<claim>" --model <id>
- Luke's spend cap is $20/month hard, silent refusal past it — 6-10 real checks this story
  should stay well under $2-3 total based on S1-2's measured costs (~$0.12-0.23/check), but
  watch it and report actual total in the handoff
- AGENTS NEVER PUSH. Do not offer it.
- Do not commit unless asked. Luke shapes the first commit.
- Do not write to DOC/ or LEARNINGS/ — that's Lila's. Carry forward the two doc-correction
  items already flagged in AMS/OFFICES/cody/open-threads.md rather than re-discovering them.
- Update AMS/OFFICES/cody/desk.md and write a handoff before the session ends.
```
