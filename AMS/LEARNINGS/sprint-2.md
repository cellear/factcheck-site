# Sprint 2 Learnings

- 2026-08-30: Sprint 1's checkbox-hygiene fix held — no story shipped with a stale `[ ]` this
  sprint. Worth confirming a process fix actually stuck, not just logging new findings.
- 2026-08-30: A long-running foreground network call (a `curl`/`fetch` held open for minutes,
  e.g. a six-minute hold test) can get silently killed by the session's own auto-mode tool
  classifier. Workaround: drive the real request through an actual browser tool and wait on
  wall-clock time instead of polling a foreground call.
- 2026-08-30: Cloudflare Pages auto-canonicalizes `.html` paths (`/r.html` → `/r`, a 308). A
  `_redirects` rewrite whose *destination* is the `.html` path can leak that canonicalization out
  as an extra external redirect on the original request. Point rewrite destinations at the
  already-canonical (extensionless) path.
- 2026-08-30: `claude-sonnet-5` can invoke `web_search` from inside an automatic, undeclared
  `code_execution` sandbox. In that mode, text blocks carry no `citations` field at all — the
  documented auto-citation mechanism silently doesn't fire, even though nothing about the request
  asked for code execution. Don't assume a documented API behavior holds without checking the raw
  response shape on a real call.
- 2026-08-30: A no-cost unit test of pure classifier/extraction logic — copy the function into a
  throwaway script, run synthetic message shapes through it — reliably covers failure branches
  that are expensive or nondeterministic to force via a real paid API call. Worth keeping as the
  default way to test failure-path logic.
- 2026-08-30/31: Twice this sprint a live instruction from Luke got under-recorded by the persona
  who received it: a handoff said "per Luke's direction" without saying what the direction was,
  and a session ended without a "Prompt for Next Assistant" until Luke asked for one directly.
  When Luke gives a live instruction that changes who does what or what happens next, write the
  instruction itself into the handoff, not just a pointer to the fact that one was given.

---

Last updated: 2026-08-31 by Lila (claude-sonnet-5)
