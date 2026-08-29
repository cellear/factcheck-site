# Working notes

Standing observations about how the human and the team like this persona's work done.
Preferences, not facts about the current sprint — those belong in a sprint file or a handoff.

- **Luke wants one command, not a checklist he executes by hand.** F1-1 exists because the first
  demo attempt required him to open files one by one to find a same-claim pair. A demo runner
  should do the finding and opening for him.
- **Agents never push.** Standing project rule. Commit locally only if asked; do not push.
- **To dry-run a money-costing step without spending money:** if the real guard file (e.g. an API
  key) exists on this machine, don't touch it. Make a throwaway `sed`-substituted copy of the
  script with the guarded path pointed at something that doesn't exist, run that copy instead,
  and delete it after. Verifies the guard fires correctly without risking an accidental live call
  through the real script.
