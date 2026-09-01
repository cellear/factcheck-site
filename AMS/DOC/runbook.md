# Runbook

For Luke. Every task below: **symptom or intent → exact commands → how you know it worked.**
Nothing here should take more than five minutes. If a task ever does, that's a bug in this
runbook — fix the runbook, don't just work around it once.

Two directories matter: `worker/` (the Worker — `worker/src/index.js`, `worker/wrangler.jsonc`)
and `site/` (the two static pages). Worker commands run from `worker/`; the site deploy command
runs from the repo root.

Live URLs: site `https://factcheck-site.pages.dev`, Worker
`https://factcheck-worker.lm2000.workers.dev`.

---

## 1. Change the spend cap

**Intent:** raise or lower the monthly hard limit (`SPEND_CAP_USD`, default `20` if unset).

**Commands:**
```
cd worker
npx wrangler secret put SPEND_CAP_USD
```
It prompts for a value — type the new dollar amount (e.g. `20`) and press Enter. No redeploy
needed; secrets take effect on the next request.

**How you know it worked:**
```
curl -s "https://factcheck-worker.lm2000.workers.dev/spend?invite_word=<your invite word>"
```
returns `{"month":"...","total_usd":...}` either way — this doesn't show the cap itself, only
the running total. To actually confirm the new cap: set it low (e.g. `0.01`), submit one check
with the right invite word, and expect `402 Monthly budget reached` with no new spend. Set it
back afterward. (This is exactly Sprint 3's demo step 2 and Sprint 4's fixture-checking.)

**Source:** `AMS/HANDOFF/handoff-2026-08-31-s3-2-s3-3-s3-7-cody.md` (live-verified), `worker/src/index.js` (`spendCapUsd()`).

---

## 2. Change the invite word

**Intent:** rotate the shared word that gates every check.

**Commands:**
```
cd worker
npx wrangler secret put INVITE_WORD
```
Type the new word when prompted. Then update anyone who needs it — the word is never written to
any file in this repo, so there's nothing else to change on disk.

**How you know it worked:** submit a check on the live site with the **old** word — it should be
refused (`403 Unauthorized`, no spend). Submit with the **new** word — it should proceed
normally. This is Sprint 4's demo step 1.

**Source:** `AMS/HANDOFF/handoff-2026-08-31-s3-1-invite-word-sandy.md`, `AMS/HANDOFF/handoff-2026-08-31-s3-1-complete-sandy.md`.

---

## 3. Change the model

**Intent:** switch which Claude model runs the check (decision 15 in `DOC/architecture.md`).

**Commands:** edit two spots in `worker/src/index.js`:
1. `const MODEL = "claude-sonnet-5";` (line ~17) — change the model id.
2. `PRICES_USD_PER_MTOK` (line ~22) — add an entry for the new model id (`{ input, output }`
   dollars per million tokens), or cost calculation silently breaks (`computeCostUsd()` looks up
   the price by `MODEL` and will produce `NaN` if the id isn't in the table).

If switching to `claude-haiku-4-5`: it needs the older `web_search_20250305` tool variant, not
`web_search_20260209` — also update the `tools` array in `handleCheck()`. See decision 15's
note in `DOC/architecture.md`.

Then redeploy the worker (task 6 below).

**How you know it worked:** run one real check; the result record's `model` and `served_by_model`
fields (visible via `GET /r/<id>`) show the new model, and `cost_usd` is a sane, non-`NaN` number.

**Source:** `DOC/architecture.md` decision 15, `worker/src/index.js`.

---

## 4. Re-vendor the skill

**Intent:** pull in an updated `SKILL.md` from the upstream repo
([`cellear/claude-fact-check-skill`](https://github.com/cellear/claude-fact-check-skill)).
There is no automated re-vendor script — the site deliberately does not auto-sync with upstream
(`DOC/architecture.md`, "Not doing"). This is a manual, deliberate act each time.

**Commands:**
1. Fetch the upstream `SKILL.md` at the commit you want (copy it into `skill/SKILL.md`,
   overwriting the current file byte-for-byte).
2. Update `skill/SOURCE.md` with the new commit hash and today's date — same three-line format
   it already has (`Upstream repo`, `Commit hash`, `Date vendored`).
3. Redeploy the worker (task 6 below) — it reads `skill/SOURCE.md` at build time to compute
   `skill_commit` for every result record (`worker/src/index.js`'s `SKILL_COMMIT` regex).

**How you know it worked:** run one real check; the result record's `skill_commit` field matches
the new commit hash you put in `skill/SOURCE.md`.

**Source:** `AMS/HANDOFF/handoff-2026-08-25-s1-1-vendor-skill-sandy.md` (how it was first
vendored), `skill/SOURCE.md`, `worker/src/index.js`.

---

## 5. Read this month's spend

**Intent:** check how much has been spent so far this calendar month.

**Commands:**
```
curl -s "https://factcheck-worker.lm2000.workers.dev/spend?invite_word=<your invite word>"
```

**How you know it worked:** you get back JSON like `{"month":"2026-08","total_usd":0.523}`. That
total is the KV spend counter — see task 7 for the other place money can run out.

**Source:** `worker/src/index.js` (`handleGetSpend`), `AMS/HANDOFF/handoff-2026-08-31-s3-2-s3-3-s3-7-cody.md`.

---

## 6. Redeploy worker and site

**Intent:** push a code change (worker or site) live after editing it.

**Commands:**
```
cd worker
npx wrangler deploy
```
for the Worker (`worker/src/index.js`). For the site:
```
npx wrangler pages deploy site
```
run from the **repo root** (not from `worker/`) — it deploys the `site/` folder as-is.

**How you know it worked:** each command prints a deployed URL on success. For the worker,
`https://factcheck-worker.lm2000.workers.dev` should reflect the change immediately (no
propagation delay to wait for). For the site, reload
`https://factcheck-site.pages.dev` — the canonical Pages URL, not one of the per-deploy hash
URLs `wrangler pages deploy` also prints — and confirm the change is visible.

**Source:** `AMS/HANDOFF/handoff-2026-08-31-s3-1-complete-sandy.md`, `AMS/HANDOFF/handoff-2026-08-30-s2-2-post-check-cody.md`.

---

## 7. "Budget page but the month isn't spent" vs. "cap actually reached"

**Symptom:** a check comes back as refused / "budget reached," but task 5's `/spend` total looks
nowhere near the cap.

**There are two different, unrelated things that can produce this symptom:**

1. **The KV spend counter is actually at or over `SPEND_CAP_USD`.** This is the "real," intended
   case — task 5 will show a `total_usd` at or above the cap. Fix: raise the cap (task 1) if you
   want more checks this month, or wait for next month (the counter resets implicitly on a new
   `spend:<yyyy-mm>` key).
2. **The Anthropic Console balance itself is empty or low**, independent of this site's own KV
   counter. This happened for real in S2-7 (2026-08-31): the Console balance had quietly dropped
   to $1.01. The site's own spend counter had nothing to do with it — the underlying Anthropic
   API account was just low on prepaid credit. Symptom in that case: the check fails with an
   upstream API error (the worker's `502 upstream API error` response, not the `402 Monthly
   budget reached` response), or the request never completes.

**How to tell them apart:** check `GET /spend` first (task 5). If the total is near or over the
cap, it's case 1. If the total looks fine but checks are still failing, it's almost certainly
case 2 — go check the Console balance directly.

**Where to top up:** [console.anthropic.com](https://console.anthropic.com) — the same account
this project's `ANTHROPIC_API_KEY` belongs to. Double-check the top-up amount actually landed;
in S2-7 a top-up Luke thought was $20 landed as $10 (Console showed $11.01 after, not $21.01) —
worth re-checking the balance after topping up, not just assuming the amount you clicked is the
amount that posted.

**Source:** `AMS/HANDOFF/handoff-2026-08-31-s2-7-prompt-caching-cody.md`, `DOC/architecture.md`
decision 16 (silent refusal, no notification to Luke in v1 — this is why nothing pages you when
either kind of budget runs out).

---

## 8. Where every secret lives

Three Worker secrets, all set via `npx wrangler secret put <NAME>` from `worker/` (never written
to any file in this repo):

- **`ANTHROPIC_API_KEY`** — the Anthropic API key. Sourced from
  `/Users/lukemccormick/Sites/CLAUDE/fact-check-key.key` on this machine when first set; rotate
  it by getting a new key from the Anthropic Console and running `wrangler secret put
  ANTHROPIC_API_KEY` again.
- **`INVITE_WORD`** — see task 2.
- **`SPEND_CAP_USD`** — see task 1. Defaults to `20` in code (`worker/src/index.js`,
  `spendCapUsd()`) if the secret is unset.

Nothing else needs a secret. The KV namespace id (`worker/wrangler.jsonc`) is not sensitive —
it's just an identifier, not a credential.

**Source:** `AMS/HANDOFF/handoff-2026-08-30-s2-1-cloudflare-setup-cody.md`, `worker/wrangler.jsonc`, `worker/src/index.js`.

---

## 9. Fixture permalinks and what each proves

Five seeded, no-cost permalinks exist so you (or anyone) can see what a failed check looks like
without spending anything real. They were written directly to KV by `worker/fixtures/seed.mjs`
(re-run that script — `node worker/fixtures/seed.mjs` from the repo root — if you ever need to
reseed them; it's idempotent, safe to run again):

| Permalink | Proves |
|---|---|
| `https://factcheck-site.pages.dev/r/fixture-refusal` | A refusal renders as a failed check, naming the category (S3-3) |
| `https://factcheck-site.pages.dev/r/fixture-tool-error` | A search-tool error renders as a failed check, never as a false "no sources" verdict |
| `https://factcheck-site.pages.dev/r/fixture-truncated` | A truncated response renders as a failed check |
| `https://factcheck-site.pages.dev/r/fixture-no-report` | A completed message with no report heading renders as a failed check |
| `https://factcheck-site.pages.dev/r/fixture-search-cap-hit` | Hitting the 5-search budget is **not** a failure — it renders as a normal verdict plus one line: "Search budget reached; this report is based on 5 searches" |

Background on why these five outcomes exist at all: `DOC/architecture.md`, "Failure handling."

**Source:** `worker/fixtures/seed.mjs`, `AMS/HANDOFF/handoff-2026-08-31-s3-2-s3-3-s3-7-cody.md`
(refusal category added to the fixture).

---

## 10. `demo.sh` conventions

`./demo.sh` at the repo root walks through the current sprint's demo steps interactively —
opening the right pages, printing the right commands, pausing between steps. Two things worth
knowing before you run it:

- **`./demo.sh [start-step]`** — pass a number to jump straight to that step instead of
  re-running ones you've already seen (e.g. `./demo.sh 3`). `./demo.sh --help` prints the exact
  range for whichever sprint's version is currently checked in.
- **A blank answer (just press Enter) at any prompt means "skip this, I've already confirmed
  it"** — not an error. The script never reads an empty answer as invalid input.
- Any step that can run silently for more than a few seconds says so up front and shows visible
  progress (a heartbeat) while it runs — it should never look hung.
- Steps that flip a production secret (spend cap, invite word) print the exact command for you
  to run yourself; `demo.sh` never writes to production config on its own.

**Source:** `DOC/working-agreements.md` ("A demo script gives visible progress and lets Luke
skip a confirmed step"), `demo.sh` itself.

---

Last updated: 2026-08-31 by Lila (claude-sonnet-5)
