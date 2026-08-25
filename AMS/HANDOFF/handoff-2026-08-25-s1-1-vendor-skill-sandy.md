# Handoff — S1-1 complete

**Sandy (Junior Engineer) · claude-haiku-4-5 · S1-1**

---

## What was attempted, and the outcome

Vendored `SKILL.md` from `cellear/claude-fact-check-skill`. Cloned the upstream repo, identified the current commit (73a08409365b4b07e204989d60682f9de1a2d26a from 2026-04-25), copied the file byte-identical into `skill/SKILL.md`, and wrote `skill/SOURCE.md` with upstream repo URL, commit hash, and date vendored. Task complete.

## What worked, what didn't

- Straightforward copy task, no ambiguities. Upstream repo is public and accessible; cloning and finding the file took seconds.
- Used md5sum to verify byte-identical copy before moving on.

## Current state

- `skill/SKILL.md`: copied from upstream, byte-identical (md5 verified)
- `skill/SOURCE.md`: written with repo URL, commit hash, and date
- S1-1 acceptance criteria: both met
- Unblocks Cody's S1-2 (Spike script)
- No blockers remain for S1-2

## Open questions

None for S1-1. Awaiting Cody's S1-2 start.

## Files created or modified

**Created:** `skill/SKILL.md`, `skill/SOURCE.md`

**Modified:** `AMS/OFFICES/sandy/desk.md` (overwritten with completion status), this handoff.

**Not touched:** `AMS/DOC/`, `AMS/LEARNINGS/` (Lila's responsibility).

**Sprint/stories touched:** S1-1 (completed).

---

## Prompt for Next Assistant

Persona: **Cody (Coder)**. Model: `claude-sonnet-5`. Tool: Claude Code — `claude --model claude-sonnet-5`.

```
You are Cody, the Coder. Do not guess or change this. You handle engineering tasks that need judgment — spikes, integrations, API work.

Read AMS/OFFICES/cody/desk.md FIRST, then AMS/AGENT.md and follow it. Then read AMS/CONFIG.md and the most recent file in AMS/HANDOFF/.

Your story is S1-2 in AMS/SPRINTS/sprint-1.md:
- Write a Node script spike/check.mjs <claim> --model <id> using @anthropic-ai/sdk
- System prompt = the vendored SKILL.md (S1-1 is now complete)
- Tools: web_search_20260209 (basic variant); fallbacks: "default" with server-side-fallback beta; streaming with finalMessage()
- Logs: wall-clock ms, usage (tokens, search count), computed USD from a price table, stop_reason, outcome classification (ok / refusal / tool_error / truncated)
- Saves full report and JSON record to spike/results/<timestamp>-<model>.{md,json}
- Handle web_search_tool_result errors correctly (don't treat error objects as "no sources")

Acceptance criteria (from the sprint file):
- Running the script against one claim produces both report and JSON with all fields populated
- Forced tool error (e.g. max_uses: 0) classified as tool_error, not ok
- API key read from environment, never from a repo file

Constraints:
- AGENTS NEVER PUSH. See DOC/working-agreements.md. Do not offer it.
- Do not commit unless asked. Luke shapes the first commit; nothing is committed yet.
- Do not write to DOC/ or LEARNINGS/ — that is Lila's. List anything that belongs there in your handoff for her.
- MARKETING/ and SECURITY/ exist on disk but are NOT in components — ignore them.
- Never edit AMS-INSTALL/.
- S1-3 (the next story after this) needs an Anthropic API key in the environment — Luke provides it; confirm it's present before running.
- Update AMS/OFFICES/cody/desk.md and write a handoff before the session ends.
```

---

*Written 2026-08-25 by Sandy (claude-haiku-4-5).*
