# Architecture

Current truth for what factcheck-site is made of and why. Decisions here were reached in the
2026-08-25 discovery conversation between Luke (Product Owner) and Archie (Site Architect).
Anything marked **recommended** is Archie's call awaiting confirmation; anything marked
**decided** is Luke's.

---

## What it is

A website that lets people Luke sends it to run a fact-check on pasted text, using the
methodology in [`cellear/claude-fact-check-skill`](https://github.com/cellear/claude-fact-check-skill).
The skill is a prompt, not code; the site is a delivery mechanism for it. The result is a
permanent, shareable page.

## Governing principle

**As close to nothing as physically possible.** Nothing Luke has to administer: no OS, no
process, no database, no accounts. Every structural choice below is measured against this.

"No server" was clarified to mean *nothing I administer*, not *no code runs anywhere but the
browser*. A fully static page would have to ship the API key to every visitor, which makes the
spend cap unenforceable. The alternative — visitors bring their own key — contradicts the
audience and the "site runs the check" decision. One serverless function is the floor.

---

## Decisions

| # | Decision | Status | Forecloses |
|---|---|---|---|
| 1 | The site runs the check server-side (visitors bring nothing) | decided | Bring-your-own-key; zero-cost-to-Luke operation |
| 2 | Audience is people Luke sends the URL to; not a growth play | decided | Anything built for scale or discovery |
| 3 | Completed checks get shareable permalinks — "that's the point" | decided | Ephemeral results |
| 4 | Input is pasted text only; no URL fetching | decided | Link-checking; article-checking by URL |
| 5 | No Drupal, no Pantheon | decided | Reuse of Luke's home stack |
| 6 | Static HTML + one serverless function + one key-value bucket | decided | Any framework with a runtime; any real database |
| 7 | Results live in a **key-value bucket**, addressed by short unguessable id (`/r/<id>`) | decided | Zero-storage (result-in-URL) design; links were judged too long for email/SMS |
| 8 | Access: **shared invite word** + hard monthly spend cap | decided | Accounts, personal data, per-user anything |
| 9 | Spend cap: **$20/month**, hard shutdown when reached | decided | See capacity note below |
| 10 | Visitors wait on the page; predicted duration shown as a countdown — **90 seconds** (Sonnet 5), then an honest overflow message; up to three minutes was the original acceptance bar, confirmed by the spike as typical rather than a ceiling (see Latency) | decided | Nothing — streaming remains available if waiting feels broken |
| 11 | A wrong result is what the method produced that day; no retraction, editing, or supersession | decided | Moderation tooling; result versioning |
| 12 | No privacy assumed; the page tells users not to paste anything they want kept quiet | decided | Retention/deletion machinery |
| 13 | Skill version: record the skill's git commit in every result; do not build version-tracking beyond that | decided | Nothing; preserves the option |
| 14 | Hosting: **Cloudflare Pages + Workers + KV** | decided (confirmed by the S2-1 six-minute hold test, 2026-08-30) | Nothing hard; see rationale |
| 15 | Model: **`claude-sonnet-5`**, confirmed after the spike (S1-4, 2026-08-28) — Luke: "we don't need Opus for this; Sonnet does it just fine." One API call per check, `web_search_20260209` as the tool (Haiku 4.5 would need the older `web_search_20250305` variant — moot, not selected). The spike found the two models at parity on settled and news claims, but Haiku certified false specifics as true on the one contested claim tested — the product's core case | decided | Haiku 4.5 as the shipped model |
| 16 | Shutdown is a silent refusal with a plain "monthly budget reached" message; no notification to Luke in v1 | decided | — |
| 17 | Result rendering: **verbatim markdown**, assembled from content blocks — join text blocks with no separator, turn `citations` into a Sources list, start at the first `# Fact-Check Report` line — decided with Luke, 2026-08-28 (S1-5) | decided | Structured/parsed rendering; a template keyed to specific headings |

### Capacity note on decision 9

At Sonnet 5 pricing plus per-query web search metering ($10 per 1,000 searches, i.e.
$0.01/search, on top of tokens), a full seven-step check is **measured** (S1-3/S1-4 spike, four
production-shaped runs) at $0.11–$0.56, mean **$0.36** — about **55 checks/month** at the $20
cap, under 2 a day. Haiku 4.5 measured mean $0.05 — about **380 checks/month**. The cap remains
the real capacity figure regardless of which model is picked; the site will visibly hit it if a
link lands. See `spike/RESULTS.md` and the S1-4 handoff for the full numbers.

### Citations note on decision 17

Measured in S2-2 (2026-08-30): `claude-sonnet-5` invokes `web_search` from inside an automatic,
undeclared `code_execution` sandbox — not requested, not documented as the default. In that mode
text blocks carry no `citations` field at all, so the classic auto-citation mechanism (inline
`block.citations`, with a `cited_text` excerpt) never fires. `citations[]` is built instead from
the raw `web_search_tool_result` content (url + title per result), deduped by URL at render time
as already planned. This means the Sources list is a "sources consulted" list, not a "sources
actually quoted" list — `cited_text` is `null` under current, measured behavior. Decision 17's
rendering choice (verbatim markdown, Sources list from `citations[]`) is unaffected; only the
data backing `citations[]` differs from what was assumed when it was written. Implementation:
`worker/src/index.js`'s `extractTextAndCitations()` checks for inline `block.citations` first (in
case it ever appears) and falls back to raw search-result content. Source:
`AMS/HANDOFF/handoff-2026-08-30-s2-2-post-check-cody.md`.

---

## Shape

```
browser (static page)
   │  POST { claim, invite_word }
   ▼
one function ──────────────▶ Anthropic Messages API
   │   system prompt = SKILL.md          tools = [web_search]
   │   model = claude-sonnet-5           one call; the seven steps happen inside it
   │
   ├─ check invite word; refuse if wrong
   ├─ check spend counter; refuse if ≥ cap
   ├─ read `usage` from the response → convert to dollars → add to monthly counter
   ├─ classify the outcome (report / refusal / tool error / truncated / no report)
   └─ write result record to KV → respond with /r/<id>

browser → GET /r/<id> → static page reads the record and renders it
```

The site never orchestrates the seven steps. That is the model's job inside one call. The
function is a key-holder, a meter, and a mailbox.

**Tool configuration.** `web_search` is sent with `max_uses: 5` — the latency governor (see
Failure handling). `max_uses` must be ≥ 1; `0` is rejected at request validation (400), not
delivered as a per-search error. Sonnet 5 uses `web_search_20260209`; Haiku 4.5 (not selected)
would need the older `web_search_20250305` variant.

## Components

**Static site.** Two pages: the form, and the result view. No framework required; plain HTML
with enough JS to POST, wait, and render. The predicted-duration countdown lives here. The
result view renders `report` as markdown starting at the first `# Fact-Check Report` line, plus
a Sources list built from `citations[]` (deduped by URL); no section parsing (decision 17). A
non-`ok` outcome renders the failed-check message instead.

**The function.** One HTTP handler. Holds the API key as a secret. Responsibilities are exactly
the branches in the diagram above and nothing else. Target: small enough to read in one sitting.

**The bucket.** Two kinds of keys:
- `result:<id>` — write once, never updated. Public to anyone with the id.
- `spend:<yyyy-mm>` — running dollar total for the calendar month. The function refuses when
  it is at or above the cap. Monthly reset is implicit (new key, new month).

**The skill.** `SKILL.md` from the upstream repo, vendored into this repo with its source
commit recorded. It is the system prompt. When it changes upstream, someone updates the vendored
copy deliberately; there is no automatic sync.

## Result record

Sketch, not a schema:

```
id, created_at, claim_text, report (verbatim assembled markdown, from the first
`# Fact-Check Report` line), citations [{url, title, cited_text}],
model, served_by_model, skill_commit, usage {input_tokens, output_tokens, searches},
cost_usd, outcome (ok | refusal | tool_error | truncated | no_report),
search_cap_hit, tool_errors, duration_ms
```

`outcome` exists because of the failure-handling rule below. `cost_usd` and `duration_ms` exist
so the spend counter and the countdown prediction are grounded in real numbers over time.
`citations` is what makes the result page's Sources list possible (decision 17) — **as measured
in S2-2, `cited_text` is always `null`**: the current API behavior gives no per-result excerpt in
this mode, so `citations[]` is a list of sources consulted (url + title), not sources actually
quoted from. See the citations note under decision 17 below.
`search_cap_hit` flags the one-line search-budget note. `served_by_model` records the model that
actually generated the report, distinct from the requested `model` (relevant if a fallback is
ever added later — none is used in v1). `tool_errors` records what the tool layer reported, if
anything, before the check settled into its final outcome.

## Failure handling — a rule, not a preference

Three API behaviours matter specifically for a fact-checker, verified against current docs or
measured in the S1-2/S1-3 spike:

1. **Refusals return HTTP 200** with `stop_reason: "refusal"`. Contentious political and health
   claims are this tool's normal input, so this is a live case. Check `stop_reason` before
   reading content. The server-side fallback (`fallbacks: "default"` with the
   `server-side-fallback-2026-07-01` beta) is **not used**: it is rejected with a 400 on both
   `claude-sonnet-5` and `claude-haiku-4-5` (an Opus-tier/Fable feature only), so v1 does not
   send it. Refusal detection via `stop_reason` stands regardless.
2. **Web search errors return HTTP 200** with an error object where the results list should be.
   A naive implementation reads that as "no sources found" and reports the claim as unverified —
   wrong, and wrong in the authoritative direction. One exception: `error_code:
   "max_uses_exceeded"` is not a tool error — it is our own search budget (`max_uses: 5`) being
   enforced, only reachable after 5 successful searches. That case keeps outcome `ok`, sets
   `search_cap_hit: true`, and the result page shows one line: "Search budget reached; this
   report is based on 5 searches." Every other `error_code` (`unavailable`,
   `too_many_requests`, `query_too_long`, etc.) is `tool_error` as before.
3. **The function wraps the claim in a single-turn frame.** `SKILL.md` assumes a chat: it tells
   the model to stop and ask on uncontroversial claims, and its final-step template invites a
   follow-up turn. The site has no second turn. The fix lives in the user message the function
   builds, not in the vendored skill (which stays byte-identical): it tells the model this is a
   single request with no follow-up, to produce the full report even for uncontroversial claims
   (saying so in the Triage section), and to state its reading and proceed if any part of the
   text is ambiguous. Belt-and-braces: a completed message whose text contains no
   `# Fact-Check Report` heading is outcome **`no_report`**, rendered as a failed check.

Therefore: **a check that did not complete cleanly is rendered as a failed check, never as a
verdict.** The `outcome` field is how the result page knows the difference. This is the one
place the "as close to nothing" principle yields to correctness.

## Latency

**Measured** in the S1-2/S1-3/S1-4 spike (four production-shaped Sonnet 5 runs plus four Haiku
4.5 runs; see `spike/RESULTS.md`):

| Model | Typical | Contested claims |
|---|---|---|
| Sonnet 5 | 30–90s | 2.5–6 min (about 1 in 4 runs) |
| Haiku 4.5 | 3–20s | — (no run exceeded 20s) |

Three minutes is confirmed as a **typical figure, not a hard ceiling**, for Sonnet 5. The
**hosting filter** (decision 14) is now a **six-minute** end-to-end hold, not three: most
function platforms cap synchronous requests well under that. Cloudflare Workers does not count
time awaiting an upstream response against its CPU limit, which is why it is recommended — S2-1
confirmed a real check survives the six-minute hold end to end (2026-08-30). Two escape hatches
remain in reserve if the platform or an intermediary ever drops a long idle connection: SSE with
a heartbeat, or respond-with-id-then-poll `/r/<id>`.

## Hosting rationale (decision 14)

Cloudflare: static hosting (Pages), the function (Workers), the bucket (KV), secrets, and a
free tier that covers a dozen checks a day, all under one account. The **six-minute** hold (see
Latency) was the deciding constraint; S2-1 confirmed a real check survives it end to end
(2026-08-30). Netlify and Vercel remain the fallbacks if that ever stops being true.

---

## Not doing (and why)

- **Accounts, login, personal data** — nothing to breach; the invite word plus cap is the
  whole access model.
- **A history or "all checks" page** — nobody needs it (decision 2). The bucket makes it
  possible later without a redesign.
- **URL fetching** — decision 4.
- **Retraction / re-run / supersede** — decision 11.
- **Streaming the steps live** — deferred pending the spike. Would be a demonstration of the
  method's differentiator (step 4, source independence), which is the argument for revisiting it.
- **Automatic sync with the upstream skill** — deliberate vendoring instead.
- **Prompt caching** — untested; a Sprint 2 measurement, not a v1 feature.

## Open questions

1. ~~Confirm decision 14 (Cloudflare) — six-minute hold~~ — resolved by S2-1: confirmed
   2026-08-30, a real browser held a Cloudflare Workers request open the full six minutes and
   returned normally. Decision 14 stands.
2. ~~Sonnet 5 or Haiku 4.5~~ — resolved by S1-4: `claude-sonnet-5` (decision 15).
3. Per-IP rate limiting alongside the invite word — cheap, but is it wanted?
4. ~~Does the result page show the model's full report verbatim, or a structured render of it?~~
   — resolved by S1-5: verbatim markdown, assembled (decision 17).

## First task: the timing spike — done

Ran across S1-2 through S1-4. Results, per-claim reports, and the summary table are in
`spike/RESULTS.md` and `spike/results/`; the read-out is
`HANDOFF/handoff-2026-08-28-s1-4-s1-5-spike-readout-archie.md`. It replaced the estimates
throughout this document, set the countdown prediction, overturned the three-minute figure as a
ceiling (confirmed as typical), settled the model (`claude-sonnet-5`), and set up the six-minute
hold test that S2-1 later confirmed (2026-08-30), closing out the hosting decision.

## Benchmark

An earlier, out-of-lane stack recommendation exists in
`HANDOFF/handoff-2026-08-25-ams-reinstall-and-project-definition-claude-opus-5.md` under
"Recommendations made out of lane." Luke asked for it to be kept so the two can be compared.
This document was written from the discovery conversation, not from that section.

---

Last updated: 2026-08-31 by Lila (claude-sonnet-5) — resolved open question 1 (S2-1) and added
the citations note under decision 17 (S2-2), both via the S2-R retro
