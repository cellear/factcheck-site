# Cody's Desk

**Last active:** 2026-08-31

## Where things stand

**S2-1 through S2-7 are all done — every Cody/Sandy story in Sprint 2 except S2-8 (Quinn's).**
Continued as Cody through S2-3, S2-6, and S2-7 per Luke's direction (those three are Sandy's/
nobody's-in-particular stories on paper; ran as Cody instead, noted in each handoff).

The site's core loop works end to end: form (`site/index.html`) → 90s countdown → `POST /check`
(`worker/src/index.js`) → redirect to `/r/<id>` → `GET /r/:id` → `site/r.html` renders the
report (ok) or a failure box (anything else). 5 stable fixture permalinks
(`/r/fixture-refusal`, `-tool-error`, `-truncated`, `-no-report`, `-search-cap-hit`) let anyone
see every failure state and the search-cap-hit case without spending anything.

**S2-7 measured:** prompt caching on the system prompt cuts real cost substantially inside the
server-tool loop — $0.10557/check uncached vs. $0.044284/check with a warm cache (58% cheaper).
`spike/check.mjs` has a `--cache` flag now (off by default, real handler untouched). Whether to
turn caching on in the real `POST /check` handler is Archie's call — numbers are in the S2-7
handoff, not a decision I made.

**Things worth Lila's/Archie's attention, carried from earlier sessions today:**
- `block.citations` never populates on real runs (Sonnet 5 routes `web_search` through an
  undeclared `code_execution` sandbox) — `citations[]` falls back to raw search results
  (url + title, `cited_text: null`). DOC's `citations {url, title, cited_text}` sketch should
  note `cited_text` is null in practice. See S2-2's handoff.
- The single-turn frame in `worker/src/index.js` worked on every real call since it was added —
  but S2-1 measured it failing without a frame, so it's still a small sample against known
  non-determinism.
- S2-7's caching measurement showed cache hits even on a nominal "first" cached call, likely
  because earlier stories today already sent the identical SKILL.md prefix uncached — worth
  Archie knowing the caching mechanics may be more permissive than "identical requests only."

**Spend today (2026-08-31): ~$0.85** (S2-1/S2-2/S2-4 real calls) **+ $0.218094** (S2-7's
measurement) **= ~$1.07** total. S2-3, S2-5, S2-6 cost nothing. Anthropic Console balance ran
down to $1.01 before S2-7 — Luke topped up (Console now shows $11.01, a $10 top-up landed, not
the $20 he intended — worth him checking that).

**Also today:** reconstructed 19 historical commits from the AMS/HANDOFF record, then Luke
pushed. Going forward, committing (never pushing) at the end of each story — done for S2-6 and
will be for S2-7.

## Next

**S2-8** (Quinn, Sprint 2 demo runner + dry-run) is the only story left in Sprint 2, and it's
QA's — not mine. Per Luke's instruction, stopping here rather than running it myself.

Carrying: the S1-2 doc corrections are verified applied; the S1-3 max_uses/classifier open
question is still Archie's/Nadia's; the citations and caching findings above, for whoever picks
up DOC updates or the caching decision.
