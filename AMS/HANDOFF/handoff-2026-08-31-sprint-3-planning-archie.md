# Handoff — Sprint 3 planning pass

**Archie (Architect) · claude-fable-5 · Sprint 3 planning**

No API calls made.

---

## What was attempted and the outcome

Revised `AMS/SPRINTS/sprint-3.md` with Luke's go-ahead, resolving the three items Lila's S2-R
handoff queued for me plus two stale stories the close read surfaced:

1. **S3-6 struck by Luke** (his call, this session): spend is contained by invite word + hard
   cap + manual submission; a per-IP counter adds administration without a new bound.
2. **Prompt caching: decided, enable by default** — new story **S3-7** (Cody, s). The S2-7
   numbers settle it: even a cold cached call was cheaper than uncached ($0.068 vs $0.106),
   warm 58% cheaper ($0.044), because the 1.25× write premium is outweighed by 0.1× reads
   inside the request's own tool loop — it pays even if the cache is never reused across
   checks. Caveat recorded: measured on an easy claim; the cache covers the ~36K system
   prompt, not search results, so relative savings shrink on heavy claims. Never more
   expensive. **S3-2's meter must bill the cache rates** or the spend cap drifts — added to
   S3-2's scope.
3. **Demo runner: new story S3-8** (Quinn, s), including the new working agreement — Quinn
   dry-runs, then hands to **Nadia** for Luke's live run and the verdict. Secret-flipping demo
   steps (`SPEND_CAP_USD`, invite word) are guided prompts, never automated writes. Personas
   line gained Quinn and Lila.
4. **S3-4 struck as absorbed** — written pre-spike; its premises are stale (`max_uses: 0` is a
   400; `max_uses_exceeded` is not a tool error) and its substance shipped in S2-2 (classifier
   + unit tests, `max_uses: 5`) and S2-6 (fixture). Demo step 4 reworded to use the fixtures.
5. **S3-3's `fallbacks: "default"` line corrected** — Sprint 1 finding, Opus/Fable-only.

Sprint 4 fold-in stays undecided by design: the condition is "if Sprint 3 goes cleanly," which
can only be judged after the Sprint 3 demo.

## Corrections for Lila — `DOC/architecture.md`

Handed as a list; I have not touched DOC. She may prefer to batch these with S3-7's
confirmation numbers when that story lands:

1. **New decision row (18): prompt caching enabled by default** in the handler — rationale and
   measured numbers as in `sprint-3.md`'s "Decisions Made This Sprint" (S2-7 measurement:
   $0.106 uncached / $0.068 cold-cache / $0.044 warm; savings shrink on search-heavy claims;
   never more expensive).
2. **Capacity note (decision 9)**: with caching, mean cost per check drops below the $0.36
   measured in Sprint 1 — exact new mean is unknown until real cached checks accumulate;
   record the direction now and let S3-7's post-deploy record start the real series. The
   ~55 checks/month floor stands as the conservative figure.
3. **Open question 3 (per-IP rate limiting): resolved — struck by Luke 2026-08-31**, spend
   contained by invite word + cap + manual submission. Move to "Not doing" with that rationale.

## Current state

- Sprint 3 is planned and consistent with everything Sprints 1–2 decided. Live stories:
  S3-1, S3-5 (Sandy), S3-2, S3-3, S3-7 (Cody), S3-8 (Quinn), S3-R (Nadia/Lila). S3-4 and
  S3-6 struck.
- **Suggested order** (sequential, since S3-1/S3-2/S3-3/S3-7 all touch the same Worker):
  Sandy S3-1 → Cody S3-2+S3-3+S3-7 in one session → Sandy S3-5 → Quinn S3-8 → Nadia live demo.
- Committed this session per the standing per-story commit rule.

## Open questions

- None for me. Sprint 4 fold-in decision deferred to after the Sprint 3 demo, by design.

## Files created or modified

**Created:** this handoff. **Modified:** `AMS/SPRINTS/sprint-3.md`,
`AMS/OFFICES/archie/{desk,open-threads}.md`. **Not touched:** `AMS/DOC/`, `AMS/LEARNINGS/`,
`worker/`, `site/`, `spike/`, `demo.sh`.

**Sprint/stories touched:** Sprint 3 planning; nothing implemented.

---

## Prompt for Next Assistant

Persona: **Sandy (Junior Engineer)**. Model: `claude-haiku-4-5`. Tool:
`claude --model claude-haiku-4-5`.

```
You are Sandy, the Junior Engineer. Do not guess or change this.

Read AMS/OFFICES/sandy/desk.md FIRST, then AMS/AGENT.md and follow it. Then read
AMS/CONFIG.md, AMS/SPRINTS/sprint-3.md (your story is S3-1; note S3-6 was STRUCK by Luke —
you do not build it), DOC/working-agreements.md (the Commits section — you commit your own
story's work locally at session end; AGENTS NEVER PUSH), and
AMS/HANDOFF/handoff-2026-08-31-sprint-3-planning-archie.md.

Your story is S3-1: invite word. Scope exactly as written:
- POST /check (worker/src/index.js) requires invite_word matching a Worker secret
  (INVITE_WORD, set via wrangler secret put — ask Luke for the word, never write it in a
  file); wrong or missing → 403 with a plain message, BEFORE any API call
- The form page gets the field and remembers it in localStorage (wrap reads/writes in
  try/catch; render fine with no stored value)
- Verify: wrong word refused with nothing spent, right word proceeds (one real check is fine
  — confirm with Luke before spending)

Do not touch: the spend/cap logic (S3-2, Cody's), refusal handling (S3-3), AMS/DOC/,
AMS/LEARNINGS/, spike/, demo.sh, any story text other than S3-1's checkboxes.

When done: tick S3-1's boxes you verified, commit locally, update your office, and write a
handoff whose Prompt for Next Assistant is addressed to Cody (S3-2 + S3-3 + S3-7 in one
session — the sprint file is the spec; S3-2's meter must bill cache rates since S3-7 enables
caching).
```
