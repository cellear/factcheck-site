# Handoff — Sprint 2 planning pass

**Archie (Architect) · claude-fable-5 · Sprint 2 planning**

No API calls made. Project spend unchanged (~$2.37 + Luke's three live demo checks).

---

## What was attempted and the outcome

Revised `AMS/SPRINTS/sprint-2.md` against what Sprint 1 actually taught us, with Luke's
go-ahead. Sprint 1 closed fully (accepted 2026-08-29; retro and LEARNINGS done). Changes:

1. **S2-1** renamed to the **six-minute** go/no-go. Reordered: a free artificial six-minute
   hold test (throwaway Worker that waits before responding) proves the platform before any
   API spend; then one real check (~$0.36). Fallback order named: SSE heartbeat →
   respond-then-poll → Netlify/Vercel.
2. **S2-2** now states explicitly the three rules the spike script does NOT implement, so
   nobody copies `check.mjs` verbatim: keep `block.citations` (join text blocks with no
   separator), the single-turn frame + `no_report` outcome, and `max_uses_exceeded → ok +
   search_cap_hit`. New acceptance line: a searched claim's record has non-empty `citations[]`.
3. **S2-4** countdown concretized: 90s, replaced at zero by the up-to-six-minutes message,
   never restarts.
4. **S2-5** scope names the Sources list from `citations[]`, the `no_report` failure render,
   and the one-line `search_cap_hit` note.
5. **S2-6** fixtures grew `no_report` and `search_cap_hit`; the seeded `tool_error` fixture
   (non-`max_uses_exceeded` error code) replaces S1-2's forced-error mechanism, which the
   reclassification broke.
6. **S2-7 (new, Cody, s):** prompt-caching measurement — one flag in `check.mjs`, one
   multi-search claim, read `cache_read_input_tokens`, ≤ $1.50 budget, numbers to the handoff,
   decision to Archie, recording to Lila.
7. **S2-8 (new, Quinn, s):** Sprint 2 `demo.sh` + dry-run before Luke's live run, per the
   conventions now in `DOC/working-agreements.md`. Personas line gained Quinn and Lila; the
   demo table says Luke runs `./demo.sh`.

## Current state

- Sprint 1: closed. Sprint 2: planned and revised; **S2-1 (Cody) is the only unblocked story**
  (S2-7 is also dependency-free but spends money for a nice-to-have — run it when Cody is
  already in session, not first).
- **Blocker for S2-1:** Luke creates the Cloudflare account before Cody's session; Cody needs
  to be able to authenticate `wrangler` (Luke logs in when prompted, or provides an API token
  his own way — the key never enters the repo).

## Open questions

- Whether S2-7 runs inside Cody's S2-1 session (cheap, he's warm) or separately — Cody/Nadia's
  call, not blocking.

## Files created or modified

**Created:** this handoff. **Modified:** `AMS/SPRINTS/sprint-2.md`,
`AMS/OFFICES/archie/{desk,open-threads}.md`.
**Not touched:** `AMS/DOC/`, `AMS/LEARNINGS/`, `spike/`, `skill/`, `demo.sh`, sprint-1.md.

**Sprint/stories touched:** Sprint 2 planning (all story text); nothing implemented.

---

## Prompt for Next Assistant

Persona: **Cody (Coder)**. Model: `claude-sonnet-5`. Tool: `claude --model claude-sonnet-5`.
Precondition: Luke has created the Cloudflare account.

```
You are Cody, the Coder. Do not guess or change this.

Read AMS/OFFICES/cody/desk.md FIRST, then AMS/AGENT.md and follow it. Then read AMS/CONFIG.md,
AMS/SPRINTS/sprint-2.md (your story is S2-1), DOC/architecture.md (Hosting rationale, Latency,
and Failure handling sections — all updated since you last read them), and
AMS/HANDOFF/handoff-2026-08-30-sprint-2-planning-archie.md.

Your story is S2-1: Cloudflare project and the six-minute go/no-go. Follow its scope exactly:
- Luke has created the Cloudflare account; ask him to run interactive auth (wrangler login)
  himself when needed
- Set up Pages project, Worker, KV namespace; the API key goes in as a Worker secret via
  wrangler secret put, read from /Users/lukemccormick/Sites/CLAUDE/fact-check-key.key at the
  moment of setting it — never written into any file in the repo
- FIRST the free test: a throwaway Worker that waits six minutes before responding; call it
  from a browser and confirm it returns normally (AC: >= 360s held)
- THEN one real check end to end on the platform (~$0.36) returning the report
- If six minutes cannot be held: stop, do not build workarounds — report which fallback
  (SSE heartbeat / respond-then-poll / other platform) looks right and hand the decision to
  Archie via your handoff
- Hand the decision-14 confirmation (or overturn) to Lila as a list item; do not edit DOC/

Also clear your own carried items in AMS/OFFICES/cody/open-threads.md: the two S1-2 doc
corrections were applied by Lila in S1-6 — verify in DOC/architecture.md and tick them off.

Constraints: AGENTS NEVER PUSH. Do not commit unless asked. Record actual spend in your
handoff. Tick S2-1's boxes you verified. Update your office; write a handoff with a Prompt
for Next Assistant (S2-2 is yours next and depends on S2-1; S2-7, the cheap prompt-caching
measurement, can ride along in the same session if the budget allows — Nadia's call if
unsure).
```
