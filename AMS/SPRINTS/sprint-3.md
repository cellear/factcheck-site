# Sprint 3: It's safe to send to people

**Sprint Goal:** The guardrails in the architecture are real: invite word, hard spend cap, and honest failure on refusal or search error.

**Confidence:** planned — written in good faith, expected to flex

**Personas this sprint:** Cody, Luke, Nadia, Sandy

---

## Stories

### S3-1 · Invite word · [ ]

**Owner:** Sandy · **Model:** `claude-haiku-4-5` · **Size:** s · **Depends on:** S2-2

**Scope:**
- `POST /check` requires `invite_word` matching a Worker secret; wrong or missing → 403 with a plain message; the form has the field and remembers it in localStorage

**Acceptance criteria:**
- [ ] Wrong word is refused before any API call; right word proceeds

---

### S3-2 · Spend meter and hard cap · [ ]

**Owner:** Cody · **Model:** `claude-sonnet-5` · **Size:** m · **Depends on:** S2-2

**Scope:**
- After each API response, convert `usage` to USD with a price table (input, output, per-search) and add to KV key `spend:<yyyy-mm>`
- Before each call, refuse if the month's total ≥ `SPEND_CAP_USD` (secret/var, default 20) with a "monthly budget reached" page
- Read-only `GET /spend` (invite word required) returns the month's total

**Acceptance criteria:**
- [ ] Setting the cap to 0.01 makes the next check refuse with the budget page; setting it back to 20 restores service
- [ ] `GET /spend` matches the sum of `cost_usd` across the month's records within rounding

---

### S3-3 · Refusal handling · [ ]

**Owner:** Cody · **Model:** `claude-sonnet-5` · **Size:** s · **Depends on:** S2-2

**Scope:**
- `fallbacks: "default"` with the server-side-fallback beta on every call; check `stop_reason` before reading content; `stop_reason: refusal` → `outcome: refusal` with the `stop_details` category stored

**Acceptance criteria:**
- [ ] The refusal fixture path and a real refusal (if one can be provoked) both render as a failed check naming the category

---

### S3-4 · Search-tool error detection · [ ]

**Owner:** Cody · **Model:** `claude-sonnet-5` · **Size:** s · **Depends on:** S2-2

**Scope:**
- Any `web_search_tool_result` whose `content` is an error object → `outcome: tool_error`, error code stored, no report rendered as a verdict
- `max_uses` set on the search tool so a runaway check has a ceiling

**Acceptance criteria:**
- [ ] Forcing `max_uses` to 0 produces `outcome: tool_error` and the failed-check page, not "no sources found"

---

### S3-5 · Page copy · [ ]

**Owner:** Sandy · **Model:** `claude-haiku-4-5` · **Size:** s · **Depends on:** S2-4, S2-5

**Scope:**
- Form page: "don't paste anything you want kept private; results are public to anyone with the link"
- Result page: the method caveat from `SKILL.md`, model and date shown plainly; failed-check wording for each `outcome`

**Acceptance criteria:**
- [ ] Luke reads both pages and accepts the wording

---

### S3-6 · Per-IP rate limit · [ ]

**Owner:** Sandy · **Model:** `claude-haiku-4-5` · **Size:** s · **Depends on:** S3-1

**Scope:**
- Simple KV counter per IP per hour; over N → 429. Luke may strike this story.

**Acceptance criteria:**
- [ ] N+1 checks from one IP in an hour: the last is refused with a plain message

---

### S3-R · Retro and records · [ ]

**Owner:** Nadia (runs it) and Lila (writes it) · **Model:** `claude-sonnet-5` · **Size:** s · **Depends on:** sprint accepted

**Scope:**
- After acceptance, Nadia reviews the sprint and decides what should be recorded
- Lila writes `LEARNINGS/sprint-3.md` and applies any DOC updates Nadia or Archie handed over

**Acceptance criteria:**
- [ ] `LEARNINGS/sprint-3.md` exists
- [ ] No DOC edits were made by anyone but Lila

---

## Sprint Demo Script

Luke performs these steps in order. Each has an expected outcome. If any step does not match, the sprint is not accepted and fix stories are added to this file.

| # | Luke does | Expected |
|---|---|---|
| 1 | Luke submits a claim with the wrong invite word. | Refused; nothing spent. |
| 2 | Luke sets `SPEND_CAP_USD` to 0.01 and submits a claim with the right word. | "Monthly budget reached" page. He sets it back to 20 and the next check runs. |
| 3 | Luke opens `/spend` with the invite word. | The month's total, matching the records. |
| 4 | Luke runs the forced search-error path and the refusal fixture. | Both render as failed checks — no verdict. |
| 5 | Luke sends the URL and invite word to three people. | They each complete a check and forward a permalink. |

**Accepted when:**
- All five steps happen as written.
- The site is now in use.

---

## Decisions Made This Sprint

- (none yet)

---

## Acceptance

**Status:** Pending
**Date:**
**Reviewed by:** Luke

---

## Fix Stories

- (added only if the demo fails)

---

## Deferred to Later Sprints

- (none yet)
