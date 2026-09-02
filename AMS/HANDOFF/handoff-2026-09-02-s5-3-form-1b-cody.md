Cody · claude-sonnet-5 · S5-3

## What was attempted

S5-3: rebuild `site/index.html`'s idle state as Claude Design direction 1b ("Someone's on it").
Third of four chained stories in this session (S5-1 → S5-2 → S5-3 → S5-4), its own handoff per
Luke's direction this sprint.

## What was done

**Read the design source** — `INCOMING/Form design feedback/Fact-check directions.dc.html` — a
Claude Design canvas export using a proprietary `DCLogic`/`sc-if` framework tied to that tool's
own runtime (`support.js`, not committed). Adapted the visual design (markup structure, palette,
fonts, copy, interaction states) into plain HTML/CSS/vanilla JS rather than trying to reuse any of
the DC framework machinery — the export isn't meant to run standalone.

**Rebuilt `site/index.html`** matching direction 1b's idle state: 268px/1fr two-column card, mascot
side panel (image + bottom gradient fade + a Caveat-font speech bubble with the mockup's
"one claim at a time" line), warm paper palette (`#EFE6DA` page bg, `#F7E7D3` card, `#FFFCF6`/
`#FCF2E2` inner panels, `#D26A3F`/`#B5482A` orange accent, `#1F4D2E` green pill), Inter + Caveat
via Google Fonts. Added a small `@media (max-width: 620px)` fallback (stack to one column) — not
an explicit AC, just avoided a broken layout on a phone since the mockup itself is a fixed
760px-wide desktop card.

**Invite word collapses as scoped**: `renderInviteState()` shows "Invited as ••••••· change" when
`localStorage` has a stored word, otherwise the open input — new behavior, the pre-S5-3 site
always showed the open input. Same `localStorage` key (`invite_word`) as before, so existing
visitors' stored word carries over.

**Copy updated for URL input** (S5-1 scope: "form copy becomes 'paste a claim or a link'"):
placeholder and intro paragraph now say "Paste a claim below — or a link to an article," matching
what phase 1's `web_fetch` tool actually supports.

**Submit wired to the new session flow, not `/check`.** `POST /session` is called and its SSE
response consumed client-side via a small `readEvents()` generator (mirrors the Worker's own
`parseAnthropicSSE` — reads the `data: {...}\n\n` wire format, no real `EventSource` since that
can't do POST bodies). On the stream's `done` event, `renderChoices()` shows a **deliberately
minimal, unstyled placeholder** — triage line, primary claim, issues list, a single button
("run the deep check anyway" if settled, else "check the primary claim") that calls
`POST /session/:id/proceed` and redirects to `/r/{id}` on completion. This goes beyond S5-3's
literal "idle state only" scope, but the alternative (stub it out with nothing) would leave the
form dead-ended after submit with no way to verify the AC ("submits to the session flow") live —
judged worth the small overreach. **S5-4 replaces this whole placeholder** with the real chooser
UI and firehose display; it's clearly marked as such in the code comments.

**Mascot image compressed before shipping.** The source PNG was 760×1000, 1.2MB — resized to
700×921 and converted to WebP (`magick ... -resize 700x -quality 82`), landing at ~49KB, a 96%
reduction. The full-resolution original stays in `design/form-1b/assets/` for provenance; only the
compressed version ships in `site/assets/`. Referenced from exactly one place in
`site/index.html` (`src="assets/mascot-builder.webp"`), satisfying the mascot-swap AC directly.

**Design export committed for provenance** — `design/form-1b/`: the `.dc.html` source file and its
three source images (not `support.js`, the generic ~68KB canvas-editor runtime script, and not
`uploads/`/`.thumbnail/`, which looked like earlier-draft/build artifacts, not source). `INCOMING/`
itself left untouched — Luke's to clean up.

**Verified in a real browser** (local `python3 -m http.server` serving `site/`, pointed at the real
production Worker — no local Worker needed since only the client side changed):
- Screenshot compared against the design mockup: matches (pill title, mascot panel, gradient,
  bubble, textarea, example chip, orange button, invite field).
- Clicked the example chip — fills the textarea correctly.
- Typed a wrong invite word and submitted — correctly showed "Invite word is incorrect.", the
  word still saved to `localStorage` (matches the pre-S5-3 site's existing behavior of saving on
  attempt regardless of correctness — not a new bug, an existing pattern).
- Set the correct invite word via `localStorage` directly (to avoid a throwaway real API call) and
  reloaded — the collapsed "Invited as ••••••" view rendered correctly.
- **One real end-to-end submission** with the example claim and the real invite word: phase 1
  completed in ~18-20s, `renderChoices()` correctly displayed the real triage/primary-claim/issues
  data from the live API response. Did not click through to phase 2 in the browser (would trigger
  a real paid investigation already thoroughly verified at the worker level in S5-1/S5-2 — not
  worth re-spending on here).
- Caught and fixed a real bug during this test: the speech bubble stayed on "reading…" after the
  parse finished instead of updating to reflect the new state. Fixed (`renderChoices()` now sets
  it to "settled — dig deeper?" or "which one first?").
- No console errors across the whole test session.

## What worked, what didn't

Testing in a real browser against the real production Worker (rather than mocking or skipping
straight to "looks right in a screenshot") caught a real bug the screenshot alone wouldn't have
— the stale bubble text only shows up once you actually watch the state transition, not in a
static image comparison.

## Current state and blockers

S5-3 done, committed (`2e130e3`). **Not yet deployed** — `npx wrangler pages deploy site` still
needs to run (from the repo root, not `worker/`) before S5-3's first acceptance criterion is fully
verified against the actual deployed URL rather than a local server. Continuing directly into S5-4
in this session per the chained plan; will ask Luke to deploy the site alongside whatever S5-4
needs deployed, rather than asking for a deploy after every single story.

## Open questions

None blocking.

## Files created or modified

- `site/index.html` — full rewrite as design 1b's idle state, wired to the new session flow, with
  a placeholder post-submit chooser (S5-4 replaces it)
- `site/assets/mascot-builder.webp` (new) — compressed mascot image
- `design/form-1b/` (new) — design export + source assets, for provenance
- `AMS/SPRINTS/sprint-5.md` — S5-3 story box and ACs marked done with verification notes
- `AMS/OFFICES/cody/desk.md`, `open-threads.md`, `working-notes.md` (updated at session end)
- This handoff

Not touched: `worker/`, `skill/`, `DOC/`, `LEARNINGS/`, `INCOMING/` (Luke's to clean up). Nothing
pushed by me.

## Sprint / story

Sprint 5, S5-3: done, committed, not yet deployed. Continuing to S5-4 in this session.

---

## Prompt for Next Assistant

Addressed to **Cody** (`claude-sonnet-5`) — continuing the same chained session.

```
You are Cody, continuing Sprint 5 in the same session -- the last of the four chained coding
stories. S5-1, S5-2, and S5-3 are done and committed -- see
AMS/HANDOFF/handoff-2026-09-02-s5-3-form-1b-cody.md for what S5-3 built, including the minimal
placeholder chooser UI it left behind for you to replace. Next: S5-4 (the choose step and the
firehose wait) -- the last coding story before Quinn's S5-5 demo runner.

Read first (if not already in context): AMS/SPRINTS/sprint-5.md (S5-4's scope and acceptance
criteria), design/skill-reference/README.md and its frames (the experience to match and beat --
the five things that make the skill feel good, per Archie's annotations), the S5-3 handoff above
(the readEvents() SSE-consumption helper and renderChoices() placeholder in site/index.html --
replace renderChoices() and add a firehose display for the phase-2 wait; phase 2 is polled via
GET /session/:id/progress?invite_word=<word>, not pushed live -- see the S5-2 handoff for why
(a real Cloudflare platform limit, accepted and documented, not something to try to fix here)).

S5-4 scope: build the real choose step (parsed claims/triage as a chooser, free-text option
alongside the parsed issues, no countdown since phase 1 is fast) and the firehose wait screen
(shows searches firing and sources arriving via polling GET /session/:id/progress every ~1-2s,
report text streaming in as accumulated so far -- note Cloudflare KV's own eventual-consistency
lag, observed up to roughly a minute in S5-2's testing, means updates can arrive in chunkier
bursts than true live push; design the polling UI to tolerate that gracefully rather than assume
smooth per-second updates). Keep the elapsed-vs-typical timer (real data via /durations, already
live). On completion, land on /r/{id} exactly as today. site/r.html stays plain markdown --
touch it only if the record shape forces it (it shouldn't; issues_investigated is additive and
r.html doesn't read it).

Constraints: AGENTS NEVER PUSH; wrangler/deploy commands are also blocked by this session's Bash
classifier -- ask Luke to run them (both `npx wrangler pages deploy site` for S5-3+S5-4's site
changes together, and `npx wrangler deploy` from worker/ if anything in the worker needs to
change). DOC/LEARNINGS are Lila's only -- hand over findings in your handoff, don't edit those
files. This is the last of the four coding stories -- after S5-4, write its handoff addressed to
Quinn (S5-5, the demo runner), not to yourself, per Archie's original Sprint 5 planning handoff.
```

**Mission summary:** rebuilt the site's idle-state form page as Claude Design direction 1b (mascot
side panel, warm paper palette, collapsing invite word) and wired it to the new two-phase session
flow with a deliberately minimal placeholder for the post-parse chooser. Verified live in a real
browser against the production Worker, including one real end-to-end phase-1 submission, and
compressed the mascot image 96% before shipping it. S5-4 (the real chooser + firehose UI) is next,
the last coding story before Quinn's demo runner.
