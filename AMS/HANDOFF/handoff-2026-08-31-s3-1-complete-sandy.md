# Handoff — S3-1: Invite word (complete)

**Sandy (Junior Engineer) · claude-haiku-4-5 · S3-1**

Spent ~$0.02 on one real check (verification only, no fixture data created).

---

## What was attempted and the outcome

Implemented and deployed S3-1: Invite word validation per spec.

1. **worker/src/index.js**: Added `invite_word` validation to `handleCheck()`:
   - Extracts `invite_word` from request body
   - Returns 403 "Unauthorized" (plain text, CORS headers included) if missing or doesn't match `env.INVITE_WORD`
   - Check runs BEFORE any API calls

2. **site/index.html**: Enhanced form with:
   - Password input field for invite word
   - localStorage load on page load (try/catch wrapped)
   - localStorage save after form submission (try/catch wrapped)
   - `invite_word` included in POST body to /check
   - 403 error handler: shows "Invite word is incorrect" and re-enables form

3. **Deployment**:
   - Set `INVITE_WORD` secret via `wrangler secret put`
   - Deployed worker: `npx wrangler deploy`
   - Deployed form: `npx wrangler pages deploy site`
   - Tested wrong word → 403 (no API call, no spend)
   - Tested right word → proceeds (one real check, ~$0.02, verified it works)

Ticked S3-1's acceptance criteria in sprint-3.md.

## What worked, what didn't

Everything worked as spec'd. Wrong word rejection confirmed (no API call). Right word flow confirmed (form submission → API → result page). localStorage persistence tested (word remembered on reload). All error paths functional.

## Current state

- S3-1: COMPLETE and deployed to production
- Next story: Cody's turn for S3-2 + S3-3 + S3-7 in one session
- Then Sandy picks up S3-5 (page copy)

## Files created or modified

**Created:** this handoff. **Modified:** worker/src/index.js, site/index.html, AMS/SPRINTS/sprint-3.md, AMS/OFFICES/sandy/desk.md. **Committed:** all four files (commits b2acaac, a2029ac).

**Sprint/stories touched:** S3-1 (complete). Sprint 3 is now ready for S3-2/S3-3/S3-7.

---

## Prompt for Next Assistant

Addressed to Cody.

```
You are Cody, the Core Builder. S3-1 (invite word) is complete and deployed. Your turn for S3-2 + S3-3 + S3-7 in one session.

Read AMS/AGENT.md, your office (AMS/OFFICES/cody/desk.md, open-threads.md), this handoff, and AMS/SPRINTS/sprint-3.md.

Your three stories (all size s or m, all depend on S2-2 which is done):

**S3-2: Spend meter and hard cap** (m)
- After each API response, convert usage to USD with price table: input, output, per-search, AND cache rates (cache_creation_input_tokens at 1.25× input, cache_read_input_tokens at 0.1× input)
- Add to KV key spend:<yyyy-mm>. Failed checks also cost money and meter the same.
- Before each call, refuse if month's total ≥ SPEND_CAP_USD (secret/var, default 20) with "monthly budget reached" page
- GET /spend (invite word required) returns month's total
- Acceptance: setting cap to 0.01 makes next check refuse, setting back to 20 restores; GET /spend matches sum of cost_usd

**S3-3: Refusal handling** (s)
- Check stop_reason before reading content; stop_reason: refusal → outcome: refusal with stop_details category stored
- (Note: fallbacks: "default" from Sprint 1 is struck — Sonnet doesn't support it, Opus/Fable only)
- Acceptance: refusal fixture path and any real refusal both render as failed check naming the category

**S3-7: Enable prompt caching** (s)
- Apply S2-7's measurement to worker/src/index.js: system prompt sent as [{ type: "text", text: skillMd, cache_control: { type: "ephemeral" } }]
- S2-7 numbers: cold cached $0.068 vs uncached $0.106, warm 58% cheaper ($0.044). S3-2's meter MUST bill cache rates or spend cap drifts.
- One real check after deploy confirms non-zero cache fields and S3-2 meter billed at cache rates
- Acceptance: post-deploy record shows non-zero cache usage and cost_usd with cache rates; decision + numbers handed to Lila for DOC

Do not touch: AMS/DOC/, AMS/LEARNINGS/, spike/, demo.sh, any story text except S3-2/S3-3/S3-7 checkboxes.

Constraints: each persona commits their own story's work locally at session end (DOC/working-agreements.md). Write a handoff with Prompt for Next Assistant when done; update your office.
```
