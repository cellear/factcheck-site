# Handoff — S3-5: Page copy

**Cody (Coder) · claude-sonnet-5 · S3-5**

Taking this over from Sandy per Luke's direction. Real API spend: **$0**.

---

## What was attempted and the outcome

**Form page (`site/index.html`)** — privacy line updated to state the two things S3-5's scope
calls for plainly: don't paste anything you want kept private, and results are public to
anyone with the link.

> "Paste a claim below. Don't paste anything you want kept private — every completed check
> gets a permanent link, and that link is public to anyone who has it."

**Result page (`site/r.html`)** — two things:
1. A static method caveat, added structurally rather than left to the model to remember to
   include in every report (SKILL.md's own instruction: "Always remind users that AI can make
   mistakes and they should verify important claims"). Renders on every `outcome: ok` result,
   right before the metadata footer:

   > "This check was produced by an AI model and can contain mistakes. For anything
   > decision-critical, verify against primary sources directly."

2. Model and date were already shown plainly in the metadata footer (from S2-5) — confirmed
   still correct, no changes needed there.

**Failed-check wording per outcome** — already existed (from S2-5), reviewed and left as is;
already met the "no verdict, name what failed" bar decided in Sprint 1:
- `refusal`: "The model declined to check this claim." (+ category, from S3-3)
- `tool_error`: "A search tool error interrupted this check before it could finish."
- `truncated`: "The check was cut off before it finished."
- `no_report`: "The check completed but did not produce a report."

Deployed both pages. Verified visually: the updated privacy line on the form, and the caveat
rendering correctly on a real result page (right before the Model/Skill commit/Checked/Duration
footer).

## What worked, what didn't

No surprises. Most of what S3-5 asked for already existed from S2-4/S2-5 and just needed a
review pass; the two real gaps were the "public to anyone with the link" phrase (implied but
never stated) and the static method caveat (previously only present when the model happened to
include it in its own report text, not guaranteed).

## Current state

- S3-5: **copy drafted, reviewed, and deployed.** The acceptance criterion itself — "Luke reads
  both pages and accepts the wording" — is explicitly his to tick, not something I can verify
  myself. Not checked off in `sprint-3.md`; flagged there as pending his read.
- Both pages are live at `https://factcheck-site.pages.dev/` and any `/r/<id>` permalink.

## Open questions

Whether the wording lands right with Luke — that's the whole point of this story's AC. Nothing
else outstanding.

## Files created or modified

**Modified:** `site/index.html` (privacy line), `site/r.html` (method caveat),
`AMS/SPRINTS/sprint-3.md` (S3-5 scope note; AC left unticked, pending Luke).
**Not touched:** `AMS/DOC/`, `AMS/LEARNINGS/`, `worker/`, `spike/`, `demo.sh`.

**Sprint/stories touched:** Sprint 3, S3-5 (implementation complete, acceptance pending Luke).

---

That's all four stories Luke asked me to take (S3-2, S3-3, S3-5, S3-7) — done, verified, and
committed. Next in the sprint is S3-8 (Quinn, demo runner), same as Sprint 2's handoff pattern.
