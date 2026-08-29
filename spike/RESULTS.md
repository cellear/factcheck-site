# Spike Results — S1-3

**Story:** `AMS/SPRINTS/sprint-1.md` S1-3. Ran 4 claims (Luke supplied 3; Cody added a 4th — see
below) across `claude-sonnet-5` and `claude-haiku-4-5` using `spike/check.mjs`, no code changes
to the script.

**Total spend this story: $1.649618** (8 runs). Combined with S1-2's ~$0.72, project-to-date
spend is ~$2.37 against Luke's $20/month cap.

## Claims

1. **GM streetcar conspiracy** (contested/historical) — "In 1936, General Motors organized a
   front company called National City Lines whose purpose was to buy up and dismantle America's
   streetcar systems. By 1947, National City Lines had acquired and destroyed more than 100
   light-rail networks in 45 cities, including Los Angeles, Detroit, Baltimore, and Minneapolis."
2. **Meta AI Instagram hack** (recent news) — "Hackers gained access to high-profile Instagram
   accounts simply by asking Meta AI to give them access, according to a 404 Media report titled
   'Hackers Simply Asked Meta AI to Give Them Access to High-Profile Instagram Accounts. It
   Worked.'"
3. **1973–74 DST repeal** (historical, specific figures) — "In December 1973, 79% of Americans
   supported permanent daylight saving time and President Nixon signed it into law. By February
   1974, eight weeks into the experiment, support had collapsed to 42%. When Congress moved to
   repeal it, members cited the deaths of eight Florida schoolchildren in the first weeks of the
   change, and the Department of Transportation concluded the fuel savings were too small to
   matter. Ten months after Nixon signed it, Congress repealed the law and President Ford put the
   country back on standard time."
4. **Eiffel Tower** (easy/uncontested) — added by Cody after claim 2 on Sonnet 5 hit a natural
   `tool_error` (see below), to guarantee 3 clean `ok` reports per model rather than re-rolling
   claim 2 and hoping for a different outcome. "The Eiffel Tower was completed in 1889 in Paris,
   built as the entrance arch for that year's World's Fair (Exposition Universelle), and was
   originally intended to be a temporary structure."

## Results

| Claim | Model | Duration | Tokens (in/out) | Searches | Cost (USD) | Outcome | Files |
|---|---|---|---|---|---|---|---|
| 1. GM streetcar | claude-sonnet-5 | 5m 40s | 208,783 / 9,611 | 5 | $0.563676 | ok | `20260826T171815Z-claude-sonnet-5.md` |
| 1. GM streetcar | claude-haiku-4-5 | 17.5s | 17,000 / 1,394 | 2 | $0.043970 | ok | `20260826T171847Z-claude-haiku-4-5.md` |
| 2. Meta AI hack | claude-sonnet-5 | 2m 35s | 182,414 / 10,914 | 7 | $0.543968 | **tool_error** | `20260826T172106Z-claude-sonnet-5.md` |
| 2. Meta AI hack | claude-haiku-4-5 | 17.5s | 18,265 / 1,382 | 2 | $0.045175 | ok | `20260826T171850Z-claude-haiku-4-5.md` |
| 3. DST repeal | claude-sonnet-5 | 1m 19s | 57,206 / 5,267 | 5 | $0.217082 | ok | `20260826T171953Z-claude-sonnet-5.md` |
| 3. DST repeal | claude-haiku-4-5 | 20.2s | 58,607 / 1,668 | 5 | $0.116947 | ok | `20260826T171856Z-claude-haiku-4-5.md` |
| 4. Eiffel Tower | claude-sonnet-5 | 33.5s | 36,633 / 2,069 | 2 | $0.113956 | ok | `20260826T172236Z-claude-sonnet-5.md` |
| 4. Eiffel Tower | claude-haiku-4-5 | 3.4s | 3,749 / 219 | 0 | $0.004844 | ok | `20260826T172208Z-claude-haiku-4-5.md` |

Full reports and JSON records: `spike/results/<timestamp>-<model>.{md,json}`, one pair per row
above (matched by claim text and `created_at`).

## Observations for the S1-4 read-out (Archie)

- **Haiku 4.5 is dramatically faster and cheaper than Sonnet 5 on every claim run**, often by an
  order of magnitude in both duration and cost (e.g. claim 1: 17.5s/$0.044 vs. 5m40s/$0.564). But
  speed/cost is not the whole story — see the quality gap below found on claim 1. Full quality
  comparison across all four claim pairs is Archie's call for S1-4; Cody looked closely at only
  one pair.
- **Quality gap found on claim 1 (GM streetcar), and it favors Sonnet 5 substantively, not just
  stylistically.** Both reports were `ok`. Sonnet 5 (5 searches) found that GM did *not* organize
  National City Lines in 1936 — a Tennessee bus operator founded it 16 years earlier, GM's
  investment came in 1938 — and found a specialist source placing **Detroit and Minneapolis**
  (two of the four cities the claim names) on a list of cities with *no documented NCL
  involvement at all*, plus that the "100+ systems/45 cities" figure traces to one advocacy
  source (Bradford Snell's 1974 testimony) against a mainstream figure closer to ~25 cities.
  Haiku 4.5 (2 searches) never surfaced any of this — it accepted the 1936 origin story and the
  100+/45 figure as "largely accurate," and its Bottom Line checked off all four named cities,
  including Detroit and Minneapolis, as ✓ correct. On this claim, Haiku's report isn't just
  thinner — it lets a materially wrong framing through as fact-checked-true where Sonnet caught
  the error. Compare `spike/results/20260826T171815Z-claude-sonnet-5.md` (Sonnet) against
  `spike/results/20260826T171847Z-claude-haiku-4-5.md` (Haiku) directly. Whether this pattern
  holds across the other three claim pairs is worth Archie's own read before recommending a
  model on speed/cost alone.
- **Sonnet 5 badly missed the 3-minute demo target on claim 1** (5m40s) and came close on claim 2
  before erroring at 2m35s. Only claim 3 (1m19s) and claim 4 (33.5s) landed comfortably under
  3 minutes on Sonnet 5. Haiku 4.5 was under 3 minutes on all 4 runs, several by a wide margin.
  The demo script's acceptance line ("At least one model completes every check under three
  minutes") holds for Haiku 4.5 in this sample, not for Sonnet 5.
- **A natural (not forced) `tool_error` occurred**: claim 2 on Sonnet 5 hit `max_uses_exceeded`
  twice after 5 successful searches on a claim needing broad, recent-news sourcing. The model's
  own text shows it noticed the tool failures, said "I've gathered enough background
  information," and then wrote a full, well-sourced seven-step report anyway (citing 404 Media,
  Krebs on Security, and Meta's own public statement) — see
  `spike/results/20260826T172106Z-claude-sonnet-5.md`. The classifier is doing exactly what
  `DOC/architecture.md`'s failure-handling rule says (never fold a tool error into a completed
  verdict), and Cody did not change that. But this is a different failure shape than S1-2's
  forced-error case, where the model had no real grounding and fabricated a confident answer:
  here the report looks substantively complete and well-sourced despite being classified as
  failed. Worth an explicit call from Archie/Lila on whether `max_uses: 5` is too low for
  claims needing broad sourcing, and/or whether the binary ok/tool_error classification should
  ever account for "search failed after N successes, not before any."
- **Search counts and token usage vary a lot by claim, not just by model** — the DST claim (3)
  pulled 5 searches and ~57-59k input tokens on both models, while the Eiffel Tower claim (4)
  needed 0-2 searches and far less context. Cost is claim-dependent as much as model-dependent.
