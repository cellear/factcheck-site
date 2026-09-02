# Skill-run reference frames

Extracted from Luke's screen recording `fact-check-skill-example.mov` (80s, 2026-09-01,
provided in `INCOMING/`; not committed — 26MB). Frames are 1fps stills, `fNNN` = seconds in.
This is the baseline S5-4's firehose must match and beat ("more prominently than the skill
normally does" — Luke).

The recorded run is the skill in a claude.ai Project ("Fact checks"), checking an LPM.org
**article URL** — note: a URL, not pasted text; see the open question in
`AMS/SPRINTS/sprint-5.md`.

## Timeline

| Frame | t | What the user sees |
|---|---|---|
| f001 | 0s | URL pasted into the project chat, submitted |
| f010 | ~10s | Acknowledgment text streams immediately; status line "Reviewing fact-check skill instructions"; spinner. **Never a silent moment.** |
| f020 | ~20s | Status "Viewed a file, searched the web"; the parse begins streaming: "Here are the claims from this WEKU/LPM piece, ranked by centrality:" |
| f030 | ~30s | Full parse visible: Claim 1 (PRIMARY), Claim 2, Claim 3, each a self-contained sentence — then the open question: "Which would you like me to verify — or should I check something else about the piece (e.g., whether this is a live/current bill status given the article date)?" |
| f048 | ~48s | User has chosen; phase 2 starts: status verb "Fathoming" + "Searching the web" |
| f050 | ~50s | The search **query text is shown verbatim** ("Kentucky Senate budget Imagination Library 33% match funding 2026") with a result list: favicon + title + domain per row |
| f060 | ~60s | Search complete; "# Fact-Check Report" heading appears, body starts streaming |
| f070 | ~70s | Report streams in readable chunks (Source Independence, Rhetorical Issues sections) |
| f080 | ~80s | Bottom Line streaming; done shortly after |

## What makes it feel good (for S5-4)

1. **Phase 1 is genuinely fast** — claims presented ~20s in, most of which was fetching the
   article. No search spend before the user chooses.
2. **Something is always moving**: streamed prose, or a named status verb ("Reviewing…",
   "Fathoming", "Searching the web"). The silence never exceeds ~a second.
3. **Searches are shown verbatim** — the actual query string, then results as favicon/title/
   domain rows. This is the single most "watchable" element; the site should show it bigger.
4. **The choose step is open-ended**, not only a pick-list: "or should I check something
   else…" with a suggested alternative. The site's chooser needs a free-text option alongside
   the parsed claims.
5. **The report streams as formatted markdown**, headings render as they arrive — not a text
   dump at the end.

Last updated: 2026-09-01 by Archie
