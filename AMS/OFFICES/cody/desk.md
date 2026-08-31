# Cody's Desk

**Last active:** 2026-08-31

## Where things stand

**S2-1 through S2-6 are all done.** Continuing as Cody through S2-3 through S2-7 in one session
per Luke's direction (S2-3 and S2-6 are Sandy's stories on paper; ran as Cody instead, noted in
each handoff).

The site's core loop works end to end: form (`site/index.html`) → 90s countdown → `POST /check`
(`worker/src/index.js`) → redirect to `/r/<id>` → `GET /r/:id` → `site/r.html` renders the
report (ok) or a failure box (anything else). 5 stable fixture permalinks
(`/r/fixture-refusal`, `-tool-error`, `-truncated`, `-no-report`, `-search-cap-hit`) let anyone
see every failure state and the search-cap-hit case without spending anything — seeded via
`worker/fixtures/seed.mjs`, safe to re-run.

**Two things worth Lila's/Archie's attention, carried from earlier sessions today:**
- `block.citations` never populates on real runs (Sonnet 5 routes `web_search` through an
  undeclared `code_execution` sandbox) — `citations[]` falls back to raw search results
  (url + title, `cited_text: null`). DOC's `citations {url, title, cited_text}` sketch should
  note `cited_text` is null in practice. See S2-2's handoff.
- The single-turn frame in `worker/src/index.js` worked on every real call since it was added
  (2 for 2 in S2-2, 1 for 1 in S2-4) — but S2-1 measured it failing without a frame, so it's a
  small sample against known non-determinism.

**Spend today (2026-08-31): ~$0.69** (S2-1 + S2-2, real API calls) **+ $0.15327** (S2-4's one
real end-to-end verification) **= ~$0.85** total. S2-3, S2-5, S2-6 cost nothing (reused existing
KV records or wrote synthetic fixtures). Anthropic Console balance was **$1.16** after S2-2;
not rechecked since — worth doing before S2-7, which has its own ≤$1.50 budget.

**Also today:** reconstructed 19 historical commits from the AMS/HANDOFF record (Luke's
request, after realizing nothing had ever been committed) — see `git log` on `main`. Luke has
since pushed. Going forward, Luke wants a commit (not a push) at the end of each story.

## Next

**S2-7** (prompt-caching measurement) is next — no dependencies, but check the Console balance
first. After that, S2-8 (Quinn, demo runner) is the last story before the sprint demo.

Carrying: the S1-2 doc corrections are verified applied; the S1-3 max_uses/classifier open
question is still Archie's/Nadia's; the low-balance flag above.
