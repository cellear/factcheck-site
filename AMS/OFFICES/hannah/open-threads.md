# Open threads

Carry-forward items in this persona's lane that have not resolved yet.

- **RETRO ITEM — a non-install session still cannot learn its persona.** `INSTALL-AMS.md` now
  assigns identity at install time, which is the fix that shipped today. It does not help a
  session working in a directory where AMS is not installed. That happened this session: with
  AMS wiped I inferred a role from the work and did Archie's job. `CONFIG.md` could carry an
  assignment; the next-assistant prompt could; `AGENT.md` could require the agent to state and
  confirm one. Retro decides.
- **`Personas.md` has forked from the kit.** Nadia and Archie are named in this project's copy
  and nowhere upstream — Luke declined that commit. This is the same silent-drift hazard the
  one-way-sync rule protects `agent-scrum` from, and `Personas.md` has no such rule. Either push
  the names up or accept the fork knowingly.
- **`add-hr-persona` is pushed but unmerged.** Three commits on `cellear/AMS`; `main` untouched.
  Opening the PR and merging are Luke's. Whoever merges: existing clones need
  `rm -rf kit/agent-scrum && git checkout kit/agent-scrum` afterward.
- **Nadia is deferred, not cancelled.** Hire her at sprint planning — do not let the team run
  sprints with no Scrum Master because the deferral was forgotten.
- **`../factcheck-rescue/` is still on disk.** Deletable once Luke confirms nothing else is
  needed from it.
- **First commit not made.** Luke shapes it. Open question whether the AMS scaffold belongs in
  it, given the repo is public under the account that authors AMS.
