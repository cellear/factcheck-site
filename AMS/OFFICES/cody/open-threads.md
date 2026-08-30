# Open threads

Carry-forward items in this persona's lane that have not resolved yet.

- ~~Doc corrections owed to Archie/Lila~~ — **applied**, verified 2026-08-30 in
  `DOC/architecture.md` lines 84-85 (max_uses 0 → 400, not a per-search error) and 136-139
  (`fallbacks: "default"` rejected on Sonnet 5 / Haiku 4.5, Opus-tier/Fable only).
- New from S1-3, for Archie's S1-4 read-out: whether `max_uses: 5` is too low for claims needing
  broad sourcing (Sonnet 5 hit it naturally on one of four claims), and whether the classifier
  should ever distinguish "search failed after N successes with a complete report anyway" from
  "search failed before any real grounding" (S1-2's forced-error case). Not Cody's call — see
  `spike/RESULTS.md`.
- S1-3, S2-1, S2-2 all done. Next up for Cody: S2-4 (form page with countdown).
- Resolved by S2-2: the single-turn frame implemented there worked on both real verification
  calls (2 for 2 with a frame, vs. 0 for 2 without one in S2-1). Still worth Nadia/whoever
  reviewing S2-2 running it against a couple more "obviously uncontroversial" claims before
  fully trusting it — 2 real runs is a small sample for something measured to be
  non-deterministic.
- New from S2-2, for Lila (DOC correction): `block.citations` never populates on real runs —
  Sonnet 5 invokes `web_search` from inside an automatic, undeclared `code_execution` sandbox,
  and text blocks carry no `citations` field in that mode. `worker/src/index.js` falls back to
  raw `web_search_tool_result` content (url + title, `cited_text: null`) instead. DOC's
  `citations [{url, title, cited_text}]` sketch and decision 17's rendering plan should note
  `cited_text` is usually null in practice. Full detail in the S2-2 handoff.
- Flagged, not mine to fix: Anthropic Console credit balance is $1.16 (checked directly,
  2026-08-30), no auto-reload. Luke knows and will buy more if needed — worth checking before
  further real-API sprint work (S2-7, more S2-2 verification, demo runs).
