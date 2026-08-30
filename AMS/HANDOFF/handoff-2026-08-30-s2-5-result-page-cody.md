# Handoff — S2-5: Result page

**Cody (Coder) · claude-sonnet-5 · S2-5**

Real API spend: **$0**. Verified entirely against existing KV records from earlier stories (a
real `ok` record from S2-4's test, and a synthetic `tool_error` fixture written directly to KV,
deleted after use) — no new Anthropic API calls.

---

## What was attempted and the outcome

Replaced `site/r.html`'s stub with the real result page, per decision 17 and DOC's Components
section:

- Fetches `GET https://factcheck-worker.lm2000.workers.dev/r/<id>` (the id read from
  `location.pathname`)
- `outcome === "ok"`: renders the claim (quoted), the report as verbatim markdown via
  `marked.js` (CDN-loaded, MIT-licensed, a standard choice) starting from the already-trimmed
  `report` field S2-2 stores (no section parsing, per decision 17), a `search_cap_hit` note when
  set, a Sources list from `citations[]` deduped by URL, and a metadata footer (model, skill
  commit shortened to 7 chars, formatted date, duration in seconds)
- Any other `outcome`: renders a "Check failed" box with a short outcome-specific message and
  **no report, no verdict** — `FAILURE_MESSAGES` maps each of `refusal`/`tool_error`/
  `truncated`/`no_report` to a plain sentence; anything unrecognized falls back to a generic
  message rather than guessing
- Unknown id (404 from the Worker): "No result found for this link."
- Network failure reaching the Worker: a plain message, same pattern as S2-4's form page

**Verified, all free (reused existing/synthetic KV records, no new API calls):**
1. A real `ok` record (from S2-4's test claim, 28 citations) — report renders as proper HTML
   (headings, bold, paragraphs all correct via `marked`), Sources list shows 20 deduped links
   (28 raw citations deduped down, confirming the dedupe logic works), metadata footer shows
   `claude-sonnet-5`, a 7-char skill commit, a formatted date, and `44.4s` duration.
2. A synthetic `tool_error` fixture (hand-written JSON, put directly into KV, deleted after
   this test) — renders the "Check failed" box with "A search tool error interrupted this check
   before it could finish." and nothing else; no report, no verdict, exactly per DOC's rule.
3. An unknown id — "No result found for this link."

**Not literally tested "in a private window on a second device."** The page is fully stateless
— no cookies, no localStorage, no auth, every load does a fresh fetch to the public JSON API —
so cross-device/cross-window identical rendering holds by construction, not by anything that
needs per-device testing. Worth a real second-device pass before the demo anyway, same as
S2-4's phone caveat, since "holds by construction" isn't the same as "looked right on Luke's
actual phone."

## What worked, what didn't

- Writing a synthetic KV record by hand (`wrangler kv key put --path`) to test the failure
  render was fast and free — same pattern S2-6 (Sandy's failure-fixture story) will formalize
  properly. I deleted the test key after use since S2-6 owns building the real fixture set,
  not me improvising one that lingers in KV.
- `marked.js` from cdnjs rendered the report's headings, bold text, and paragraph breaks
  correctly with zero configuration.

## Current state

- S2-5: **done**, both acceptance criteria met (with the caveats above).
- `site/r.html` is now the real result page — no stub content remains.
- `site/` is now feature-complete for the demo's core loop (form → countdown → redirect →
  rendered result), pending S2-6's fixtures and S2-8's demo runner.

## Open questions

- None blocking. Both S2-4 and S2-5 carry the same "verify on a real phone/second device before
  the demo" caveat — worth Luke doing that pass once, covering both stories at once, rather than
  twice separately.

## Files created or modified

**Modified:** `site/r.html` (replaced the S2-4 stub with the real result page),
`AMS/SPRINTS/sprint-2.md` (S2-5 checkbox and ACs).
**Not committed:** nothing git-committed this session.

**Sprint/stories touched:** Sprint 2, S2-5 (complete).

---

Moving on to S2-6 next (failure fixtures — Sandy's story per the sprint file, continuing as
Cody per Luke's direction).
