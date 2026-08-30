# Handoff — S2-2: The function, POST /check

**Cody (Coder) · claude-sonnet-5 · S2-2**

Real API spend this session: **~$0.414** — two real `/check` calls through the deployed Worker
($0.13602 + $0.12377) plus one direct diagnostic call to the Anthropic API bypassing the Worker
($0.15442, to debug the citations issue below). Combined with S2-1's $0.277 earlier today, total
spend today ≈ **$0.69**. Checked the Anthropic Console directly after this session: **$1.16
remaining balance, no auto-reload configured.** Luke is aware (told me to flag it, not fix it)
and said he'll buy more if it runs out.

---

## What was attempted and the outcome

Implemented `POST /check` in `worker/src/index.js`, replacing S2-1's throwaway hold-test/
real-check-test probes entirely. Followed the sprint's three explicit corrections to the spike's
behavior:

1. **Single-turn frame** — every claim is wrapped in fixed text telling the model this is a
   single request with no follow-up turn, to state its reading and proceed on ambiguity rather
   than ask, and to produce the full report regardless of how uncontroversial the claim seems
   (noting that fact in the Triage section instead of skipping the report format). This directly
   answers the problem S2-1 found: the same claim wording produced a full report exactly 0 of 2
   times without a frame, and 2 of 2 times with one, in this session's real calls.
2. **Citations preserved, joined with no separator** — text blocks are concatenated with `""`
   (not `"\n\n"` like the spike), and citation data is pulled from the response into
   `citations[]`. See the finding below — this did not work as DOC assumed and needed a fallback.
3. **`max_uses_exceeded` classified as `ok` + `search_cap_hit: true`**, every other search
   `error_code` as `tool_error`, verified with a no-cost unit test (below) since forcing a real
   tool error reliably would need the spike's `max_uses: 1` trick, which costs money and isn't
   worth it for something the classify logic already proves out on paper.

**Unguessable id:** 16 random bytes from `crypto.getRandomValues`, base64url-encoded (128 bits
of entropy, well over the "≥ 16 random bytes" bar).

**skill_commit:** imported `skill/SOURCE.md` as a text module (same `Text` rule in
`wrangler.jsonc` used for `SKILL.md`) and regexed the commit hash out of it at module load —
no filesystem access needed at runtime, matches how the spike reads it from disk.

**CORS:** added minimal CORS headers (`access-control-allow-origin: *` and an OPTIONS
preflight handler) since the Shape diagram has the static Pages site POSTing to this Worker
cross-origin — without this, no browser call would ever succeed. Not explicitly named in S2-2's
scope text, but a POST endpoint nothing can call from a browser doesn't meet the story's own
premise, so I judged it in-scope rather than deferring it to S2-4.

## An important finding: `block.citations` never populates

DOC/architecture.md's Result record design assumed citations arrive as a `citations` field on
text blocks (the classic web_search auto-citation behavior). **Measured on both real S2-2
verification calls: this field is always absent.** Dug into why with a direct diagnostic call
(bypassing the Worker) that dumped the raw response structure — `claude-sonnet-5` invokes
`web_search` from inside an automatic `code_execution` sandbox (Python, running server-side)
that this session never declared or requested as a tool. In that mode:

- Every `web_search_tool_result` block carries a `caller` field pointing at the `code_execution`
  tool_use that invoked it — the search wasn't a top-level, model-initiated tool call in the
  classic sense.
- Text blocks carry no `citations` field at all — the auto-citation-attachment mechanism
  apparently only fires for directly-cited top-level search results, not ones routed through
  code execution.
- The model's Python occasionally errors (saw a real `TypeError: string indices must be
  integers, not 'str'` from a bad dict/string mismatch in one run) — it recovered and still
  produced a full report both times, so this didn't affect the outcome, but it's a sign this
  code-execution path is something the model does unprompted and somewhat unreliably, not a
  documented, stable interface.

**Fix implemented:** `extractTextAndCitations()` in `worker/src/index.js` checks for inline
`block.citations` first (in case this ever appears — a different skill version, different model
behavior, whatever), and falls back to the raw `content` array of every successful
`web_search_tool_result` block (url + title; no per-result excerpt exists in this mode, so
`cited_text: null`) when no inline citations are found. Verified: the second real call returned
20 citations this way. This satisfies S2-2's AC ("non-empty citations[]") but **not** the full
`{url, title, cited_text}` shape DOC sketched — `cited_text` will be `null` under current,
measured API behavior. Dedup by URL is still S2-5's job at render time, per DOC.

**For Lila:** DOC/architecture.md's Result record sketch and decision 17 should note that
`cited_text` is `null` in the current, measured `citations[]` shape, and that citations come
from raw search results (a "sources consulted" list), not inline model citations (a "sources
actually quoted" list) — a real distinction, not just an implementation detail, since it affects
what the Sources list on the result page is claiming.

## What worked, what didn't

- Curl works fine for a single ~40s `/check` call (unlike the 6-minute hold test, this didn't
  trip the session's classifier on long-running network calls).
- A no-cost unit test of `classify()`/`extractReport()` (copied the pure functions into a throwaway
  Node script, ran synthetic message shapes through them) verified refusal, real tool_error,
  `max_uses_exceeded`, `no_report`, and `truncated` cases all classify correctly — cheaper and
  more reliable than trying to force each case via a real, costly API call.

## Current state

- S2-2: **done**, all three acceptance criteria met (see `AMS/SPRINTS/sprint-2.md`).
- `worker/src/index.js` is now the real `POST /check` handler — no leftover S2-1 probe code.
- Both real verification calls used the Eiffel Tower claim from S1-3's spike (proven-good
  wording); neither hit `search_cap_hit` or a real `tool_error` for real (only unit-tested).
- Balance: $1.16 remaining, no auto-reload. Luke's aware.

## Open questions

- Whether the single-turn frame is reliable enough on a larger sample — 2 real runs with a
  frame both worked, but S2-1 measured non-determinism on this exact model/claim without one.
  Not blocking S2-2 acceptance (the AC is met), but worth Nadia/Archie keeping an eye on as more
  real checks run through S2-3/S2-4/S2-5's demo.
- Whether the citations DOC correction changes anything about decision 17's rendering plan for
  S2-5 (probably not — url+title is enough for a Sources list link — but Lila/Archie's call).

## Files created or modified

**Created:** this handoff.
**Modified:** `worker/src/index.js` (replaced S2-1 probes with the real handler; then a second
edit to fix the citations fallback), `AMS/SPRINTS/sprint-2.md` (S2-2 checkboxes, Decisions Made
This Sprint), `AMS/OFFICES/cody/{desk,open-threads}.md`.
**Not touched:** `AMS/DOC/`, `AMS/LEARNINGS/`, `spike/`, `skill/`, `site/`, `demo.sh`.
**Not committed:** nothing in this session was git-committed, per "Luke shapes the first
commit" and the do-not-commit-unless-asked instruction.

**Sprint/stories touched:** Sprint 2, S2-1 (complete, from the prior handoff) and S2-2
(complete, this handoff).

---

## Prompt for Next Assistant

Persona: **Cody (Coder)**. Model: `claude-sonnet-5`. Tool: `claude --model claude-sonnet-5`.

```
You are Cody, the Coder. Do not guess or change this.

Read AMS/OFFICES/cody/desk.md FIRST, then AMS/AGENT.md and follow it. Then read AMS/CONFIG.md,
AMS/SPRINTS/sprint-2.md (your story is S2-4), DOC/architecture.md (Components, static site
section, and decision 10 on the 90-second countdown), and this handoff:
AMS/HANDOFF/handoff-2026-08-30-s2-2-post-check-cody.md.

Your story is S2-4: form page with predicted countdown. Follow its scope exactly:
- Static page: textarea, submit; on submit POST to the deployed Worker's /check endpoint and
  show a 90-second countdown; on response redirect to /r/<id>
- At zero the countdown is replaced with "Still checking — claims that need many sources can
  take up to six minutes"; it never restarts, and reaching zero does not fail the request
- Deploy to the factcheck-site Pages project (already exists, currently a placeholder
  site/index.html) via `wrangler pages deploy site`

The Worker endpoint is https://factcheck-worker.lm2000.workers.dev/check (POST { claim },
returns { id }) - CORS is already set up on the Worker side (access-control-allow-origin: *),
so a fetch() from the Pages-hosted page should just work. Verify this for real once you have a
page built - a check from S2-2 took 24-41 seconds in this session's real runs, all well under
the 90s countdown, but S2-1 measured Sonnet 5 spike runs up to 5m40s, so don't assume every
check finishes before the countdown reaches zero.

/r/<id> (S2-3, Sandy's story) does not exist yet - your redirect target's GET handler won't
resolve to anything real until S2-3 lands, so you can't fully demo this story end-to-end alone
yet. Build and verify what you can (the form, the countdown, the POST, the redirect
happening), and note in your handoff what's blocked on S2-3.

Before spending on real API calls: check the Anthropic Console credit balance first (Luke said
tell him if it's running low, he'll buy more) - it was $1.16 at the end of the S2-2 session.
Prefer testing the countdown/UI behavior without triggering a real check where you can (e.g. a
mocked/delayed response), and save real checks for final end-to-end verification.

Constraints: AGENTS NEVER PUSH. Do not commit unless asked. Record actual spend in your
handoff. Tick S2-4's boxes you verified. Update your office; write a handoff with a Prompt for
Next Assistant.
```
