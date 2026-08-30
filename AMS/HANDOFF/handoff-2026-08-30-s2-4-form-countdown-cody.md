# Handoff — S2-4: Form page with predicted countdown

**Cody (Coder) · claude-sonnet-5 · S2-4**

Real API spend: **$0.15327** (one real `/check` call through the deployed form, 48,440 input
tokens, 2,639 output tokens, 3 searches, 44.4s duration). Anthropic Console balance after this
session's spend so far (S2-1 through S2-4): roughly $1.16 − $0.15 ≈ **$1.01 estimated** — not
re-checked in the Console this time; will confirm before S2-7 (the story that actually needs a
real budget).

---

## What was attempted and the outcome

Built `site/index.html`: a form with a textarea and submit button, a 90-second countdown that
replaces itself with "Still checking — claims that need many sources can take up to six
minutes" at zero (never restarts), a POST to the deployed Worker's `/check` endpoint, and a
redirect to `/r/<id>` on success. Also added a privacy note per decision 12 ("don't paste
anything you wouldn't want someone else to see") since this is the page that collects the
claim.

Set up routing for `/r/<id>` ahead of S2-5: a `site/_redirects` rule and a placeholder
`site/r.html` stub (S2-5 replaces the stub with real rendering).

**Bug found and fixed:** the first real end-to-end test (claim submitted through the actual
deployed form, countdown ran, check completed in 44s) redirected to `https://factcheck-site.
pages.dev/r` — missing the id entirely, even though the JS correctly received a real id from
the API and correctly built the URL. Root cause: Cloudflare Pages auto-canonicalizes `.html`
files to their extensionless form (`/r.html` → 308 → `/r`, a default Pages behavior), and my
`_redirects` rule's destination (`/r.html`) triggered that canonicalization *during* the
rewrite's internal resolution — the internal redirect leaked out as an external 308 on the
original `/r/<id>` request instead of staying invisible. Fixed by pointing the rewrite
destination at the already-canonical path (`/r/* /r 200` instead of `/r/* /r.html 200`).
Verified via curl (`/r/<id>` now returns 200 directly, address bar unaffected) and via browser
navigation to the same URL — no further spend needed to confirm the fix since the JS side was
already proven correct in the buggy run.

**Verified, in order:**
1. Real submission through the deployed form: countdown displayed and counted down correctly
   ("Checking... about 88s"), textarea/button disabled during the wait, real check completed,
   redirect fired — target URL was wrong (see bug above) at this point.
2. After the fix: `curl -D -` on `/r/<real-id>` returns `200` directly (no redirect), and
   navigating there in the browser keeps the full `/r/<id>` in the address bar. This confirms
   the redirect target is now correct without needing to re-run the costly full form submission.
3. Network-error path: overrode `window.fetch` in the page to reject (no real request made, no
   spend), submitted the form, confirmed the error message ("Something went wrong reaching the
   checker — please try again.") displays and the form re-enables — not a blank page.

**Not literally verified on a phone.** I resized the browser automation tool's window to
390×844 (a phone-sized viewport) before testing, but the screenshot came back at the window's
actual/larger size regardless — the resize didn't visibly take effect through this tool. The
page uses a fluid, single-column layout with a proper viewport meta tag and no fixed-width
elements, so it should be phone-safe, but this wasn't confirmed on an actual device. Worth a
real phone pass before accepting the sprint demo.

## What worked, what didn't

- The Cloudflare Pages routing bug (see above) was the only real surprise — cost one real API
  call to discover (the first test run), but the fix itself was free to verify.
- Simulating a network failure via `javascript_tool` overriding `window.fetch` was a clean,
  free way to test the error path without spending on a real call that then has to fail somehow.

## Current state

- S2-4: **done**, both acceptance criteria met, with the phone-viewport caveat noted above.
- `site/` now has `index.html` (the real form page), `_redirects` (the `/r/*` rewrite rule,
  fixed), and `r.html` (still a stub — S2-5 replaces it next in this same session).
- The Worker's CORS headers (from S2-2/S2-3) made the cross-origin POST from
  `factcheck-site.pages.dev` to `factcheck-worker.lm2000.workers.dev` work with no changes
  needed on the Worker side.

## Open questions

- None blocking. The phone-viewport verification gap is worth Luke's attention before the
  sprint demo, not before continuing to S2-5.

## Files created or modified

**Created:** `site/_redirects`, `site/r.html` (stub), this handoff.
**Modified:** `site/index.html` (replaced S2-1's placeholder with the real form page — twice,
once for the form and once implicitly via the `_redirects` fix), `AMS/SPRINTS/sprint-2.md`
(S2-4 checkbox and ACs).
**Not committed:** nothing git-committed this session.

**Sprint/stories touched:** Sprint 2, S2-4 (complete).

---

Moving on to S2-5 next (depends on S2-3, done, and S1-5) — its job is to replace the `r.html`
stub with the real result rendering.
