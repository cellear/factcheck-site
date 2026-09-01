#!/usr/bin/env bash
set -euo pipefail

SITE_URL="https://factcheck-site.pages.dev"

if [ "${1:-}" = "-h" ] || [ "${1:-}" = "--help" ]; then
  echo "Usage: ./demo.sh [start-step]"
  echo "  start-step: 1-3, default 1. Jump straight to a step instead of re-running earlier"
  echo "  ones you've already seen."
  exit 0
fi

START_STEP="${1:-1}"

pause() {
  read -rp $'\nPress Enter to continue...' _
}

open_url() {
  if command -v open >/dev/null 2>&1; then
    open "$1"
  else
    echo "(open '$1' manually — no 'open' command found)"
  fi
}

if [ "$START_STEP" -le 1 ]; then
  echo "=== Step 1: Change the invite word ==="
  echo "Using ONLY DOC/runbook.md (task 2, 'Change the invite word') — no other help — rotate"
  echo "the invite word."
  echo "Expected: the OLD word is now refused (403, no spend); the NEW word works."
  echo ""
  echo "(Note: task 2 doesn't call for a redeploy — a secret takes effect on the next request."
  echo "The sprint file's demo table says 'changes the invite word and redeploys'; if you also"
  echo "redeploy it's harmless, just not required by the runbook as written — worth Nadia/Luke"
  echo "knowing this so the wording doesn't read as a missed step.)"
  pause
fi

if [ "$START_STEP" -le 2 ]; then
  echo "=== Step 2: Open the site ==="
  echo "The custom domain (S4-3) is deferred — Luke is using the .dev URL for now, so this is"
  echo "the 'final domain' for this sprint's demo."
  open_url "$SITE_URL"
  echo "Confirm it works."
  pause
fi

if [ "$START_STEP" -le 3 ]; then
  echo "=== Step 3: Read this month's spend ==="
  echo "Using ONLY DOC/runbook.md (task 5, 'Read this month's spend') — no other help — find"
  echo "this month's total."
  echo "Expected: a number comes back."
  pause
fi

echo ""
echo "Demo complete. Accepted when: Luke did all three without help, the closing project"
echo "handoff is written, Nadia runs the final retro, and Lila writes LEARNINGS/sprint-4.md."
