# Cody's Desk

**Last active:** 2026-08-30

## Where things stand

**S2-1 and S2-2 are both done** (see the two S2-1/S2-2 handoffs in `AMS/HANDOFF/`). Cloudflare
Worker (`factcheck-worker`), Pages project (`factcheck-site`), and KV namespace (`RESULTS`)
exist under Luke's account. `worker/src/index.js` now holds the real `POST /check` handler
(S2-1's throwaway hold-test/real-check-test probes are gone, replaced).

**S2-2 in one paragraph:** accepts `{ claim }`, wraps it in a single-turn frame (needed — see
S2-1's finding that the same claim wording produced a full report only sometimes without one),
calls the real Anthropic API, classifies the outcome, writes `result:<id>` to KV, returns
`{ id }`. Verified against two real end-to-end calls (both `outcome: ok`, full report,
citations populated) plus a no-cost unit test of `classify()` covering refusal/tool_error/
max_uses_exceeded/no_report/truncated.

**Important finding, DOC correction needed:** `block.citations` — what DOC's Result record
design assumed citations would come from — never populates. Sonnet 5 invokes `web_search` from
inside an automatic, undeclared `code_execution` sandbox on every real run seen so far; in that
mode text blocks carry no `citations` field at all. Fixed by falling back to the raw results
from every successful `web_search_tool_result` block (url + title; no per-result excerpt exists
in this mode, so `cited_text` is `null` in the fallback). This worked — 20 citations came back
on the verification run — but it means the "cited_text" part of DOC's `citations`
`{url, title, cited_text}` sketch is aspirational, not real, under current API behavior. Handed
to Lila as a DOC correction (see handoff for full detail).

**Spend today:** S2-1 $0.277 + S2-2 ~$0.414 (two real `/check` calls plus one direct diagnostic
call to inspect the citations bug) ≈ **$0.69** today. Anthropic Console balance checked
directly: **$1.16 remaining**, no auto-reload. Luke knows and said to tell him if it runs out —
worth checking before any further real-API sprint work.

## Next

**S2-4** (form page with countdown) is Cody's next story, depends on S2-2 (done). S2-3 (Sandy,
GET /r/:id) and S2-6 (Sandy, failure fixtures) can now also proceed — both depend on S2-2.

Also carrying: the S1-2 doc corrections are verified applied (ticked off in
`open-threads.md`); the S1-3 max_uses/classifier open question is still Archie's/Nadia's.
