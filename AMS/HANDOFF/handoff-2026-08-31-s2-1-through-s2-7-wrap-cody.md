# Handoff — S2-1 through S2-7 wrap, handing off to Quinn for S2-8

**Cody (Coder) · claude-sonnet-5 · S2-1–S2-7 wrap**

Individual handoffs for each story already exist and are committed
(`handoff-2026-08-30-s2-1-cloudflare-setup-cody.md` through
`handoff-2026-08-31-s2-7-prompt-caching-cody.md`); this one is the session wrap and the handoff
to Quinn, per Luke's direction to work through S2-3–S2-7 in one session and stop at S2-8.

---

## What was attempted and the outcome

Ran every Cody-lane story left in Sprint 2 — S2-1 (Cloudflare infra, six-minute hold test),
S2-2 (`POST /check`), S2-3 (`GET /r/:id`, standing in for Sandy), S2-4 (form page + countdown),
S2-5 (result page), S2-6 (failure fixtures, standing in for Sandy), S2-7 (prompt-caching
measurement) — all done, all acceptance criteria checked in `AMS/SPRINTS/sprint-2.md`. Only
S2-8 (Quinn) remains before the sprint demo.

Also, mid-session: reconstructed 19 historical commits from the AMS/HANDOFF record (nothing had
ever been committed before today) and started committing at the end of each story going
forward, per Luke's standing instruction — see `git log` on `main`. Luke has pushed the
reconstructed history already.

## Current state — what Quinn needs to know

**The site works end to end, live, right now:**
- Form: `https://factcheck-site.pages.dev/`
- A real check: paste a claim, 90s countdown, redirect to `/r/<id>`, rendered report
- 5 fixture permalinks, no spend required:
  `https://factcheck-site.pages.dev/r/fixture-refusal`,
  `.../r/fixture-tool-error`, `.../r/fixture-truncated`, `.../r/fixture-no-report`,
  `.../r/fixture-search-cap-hit`

**Two verification gaps Cody flagged, not closed:**
- S2-4's "on a phone" acceptance criterion was verified via browser automation, not a literal
  phone — the automation tool's viewport resize didn't visibly narrow the screenshot. The page
  itself is a fluid single-column layout with a proper viewport meta tag, so it should be
  phone-safe, but this wasn't confirmed on a real device.
- S2-5's "same permalink in a private window on a second device" was reasoned through (the page
  is fully stateless — no cookies, no localStorage, fetches fresh every load) rather than
  literally tested on two devices.

Both of these map directly onto demo steps 1 and 2 — Luke's own live run through `./demo.sh`
will be the real test. Worth Quinn's dry-run flagging these as "known not literally verified,
watch for a surprise" rather than assuming they're solid.

**A routing bug was found and fixed in S2-4** (Cloudflare Pages auto-canonicalizes `.html`
files, which broke the `/r/<id>` rewrite until the destination was pointed at the already-
canonical path) — already fixed and verified, not a live risk, but explains why `site/
_redirects` looks the way it does if Quinn reads it.

**Spend today: ~$1.07** across S2-1/S2-2/S2-4/S2-7's real API calls. Anthropic Console balance
is ~$11.01 after Luke's top-up (was down to $1.01 before S2-7) — plenty of room for S2-8's dry
run, which per its own scope should need $0 (dry-run steps that don't need a phone or spend;
step 3, the live check, is explicitly Luke's to trigger, not Quinn's).

## Open questions

None from me. Carrying forward for whoever picks them up later: the citations DOC correction
(Lila) and the prompt-caching enable-or-not decision (Archie) — both detailed in the S2-2 and
S2-7 handoffs, neither blocking S2-8.

## Files created or modified

**Created:** this handoff.
**Not touched this session:** anything beyond what each story's own handoff already lists.

**Sprint/stories touched:** Sprint 2, S2-1 through S2-7 all complete. S2-8 is the only story
left before the sprint demo.

---

## Prompt for Next Assistant

Persona: **Quinn (QA/Tester)**. Model: `claude-haiku-4-5`. Tool: `claude --model claude-haiku-4-5`.

```
You are Quinn, QA/Tester. Do not guess or change this.

Read AMS/OFFICES/quinn/desk.md FIRST, then AMS/AGENT.md and follow it. Then read
AMS/CONFIG.md, AMS/SPRINTS/sprint-2.md (your story is S2-8; also read the "Sprint Demo Script"
table near the bottom of the file), AMS/DOC/working-agreements.md (the demo-script conventions:
visible progress on any step that can run silently for more than a few seconds, and a blank
answer at an already-confirmed step means skip, not error), and this handoff:
AMS/HANDOFF/handoff-2026-08-31-s2-1-through-s2-7-wrap-cody.md.

Your story is S2-8: Sprint 2 demo runner and dry-run. Follow its scope exactly:
- Replace demo.sh with the Sprint 2 version, guiding Luke through the four-step demo table in
  sprint-2.md's "Sprint Demo Script" section, pausing between steps
- Phone/second-device steps (demo steps 1 and 2) are guided prompts, not automation -- you
  cannot literally act as Luke's phone or a second laptop. Print clear instructions for him at
  those steps rather than trying to script around them
- ./demo.sh [start-step] and blank-input-means-skip, matching the conventions above
- Dry-run every step that doesn't need a phone or real spend yourself, before Luke runs it live.
  Step 3 (texting a link to a real person) and the live-check parts of steps 1-2 need Luke; step
  4 (opening the 5 fixture permalinks) needs no spend and you CAN dry-run all of it yourself
- Flag any step that can't be performed as written as a fix story BEFORE Luke runs the real demo

Known from Cody's session (read the wrap handoff above for full detail): the "on a phone" and
"second device" acceptance criteria for S2-4/S2-5 were reasoned through or automation-tested,
not literally verified on real devices -- treat those as live risk points in your dry-run, not
settled facts. The 5 fixture permalinks for step 4 are:
https://factcheck-site.pages.dev/r/fixture-refusal
https://factcheck-site.pages.dev/r/fixture-tool-error
https://factcheck-site.pages.dev/r/fixture-truncated
https://factcheck-site.pages.dev/r/fixture-no-report
https://factcheck-site.pages.dev/r/fixture-search-cap-hit

Do not modify spike/check.mjs, worker/src/index.js, anything under AMS/DOC/ or AMS/LEARNINGS/,
or any story text other than S2-8's checkboxes. Do not let demo.sh write anywhere except what a
real check itself writes.

Constraints: AGENTS NEVER PUSH. Commit your progress at the end of the story (Luke's standing
instruction as of today) -- do not push. Tick S2-8's boxes you verified. Update your office,
and write a handoff with a Prompt for Next Assistant -- next is Luke running ./demo.sh live,
then the sprint's "Accepted when" line about him setting a workspace spend limit in the
Anthropic Console as a stopgap.
```
