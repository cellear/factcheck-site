#!/usr/bin/env bash
set -euo pipefail

SITE_URL="https://factcheck-site.pages.dev"
WORKER_URL="https://factcheck-worker.lm2000.workers.dev"

if [ "${1:-}" = "-h" ] || [ "${1:-}" = "--help" ]; then
  echo "Usage: ./demo.sh [start-step]"
  echo "  start-step: 1-5, default 1. Jump straight to a step instead of re-running earlier"
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
  echo "=== Step 1: Wrong invite word ==="
  echo "On the site below, submit a claim with the WRONG invite word."
  echo "Expected: refused immediately, no spend."
  open_url "$SITE_URL"
  pause
fi

if [ "$START_STEP" -le 2 ]; then
  echo "=== Step 2: Spend cap ==="
  echo "This flips a production secret. Run this yourself — this script never writes to"
  echo "production config for you:"
  echo ""
  echo "  cd worker && npx wrangler secret put SPEND_CAP_USD"
  echo "  (enter 0.01 when prompted)"
  pause
  echo ""
  echo "Now submit a claim with the CORRECT invite word on the site below."
  echo "Expected: 'Monthly budget reached' page, no new spend."
  open_url "$SITE_URL"
  pause
  echo ""
  echo "Restore the cap:"
  echo ""
  echo "  cd worker && npx wrangler secret put SPEND_CAP_USD"
  echo "  (enter 20 when prompted)"
  pause
  echo ""
  echo "Submit one more claim with the correct invite word — it should complete normally."
  pause
fi

if [ "$START_STEP" -le 3 ]; then
  echo "=== Step 3: /spend ==="
  read -rp $'\nEnter your invite word to build the /spend link (or press Enter to skip): ' WORD
  if [ -z "$WORD" ]; then
    echo "No word entered — skipping."
  else
    open_url "$WORKER_URL/spend?invite_word=$WORD"
    echo "Confirm the total matches your records."
  fi
  pause
fi

if [ "$START_STEP" -le 4 ]; then
  echo "=== Step 4: tool_error and refusal fixtures ==="
  echo "Both should render as a failed check — no verdict."
  for id in fixture-tool-error fixture-refusal; do
    echo ""
    echo "--- $id ---"
    open_url "$SITE_URL/r/$id"
    pause
  done
  read -rp $'\nDid a real refusal happen this sprint? Paste its /r/<id> or id to view it too (or press Enter to skip): ' REAL_REFUSAL
  if [ -n "$REAL_REFUSAL" ]; then
    if [[ "$REAL_REFUSAL" == http* ]]; then
      REAL_URL="$REAL_REFUSAL"
    else
      REAL_URL="$SITE_URL/r/$REAL_REFUSAL"
    fi
    open_url "$REAL_URL"
    pause
  fi
fi

if [ "$START_STEP" -le 5 ]; then
  echo "=== Step 5: Send to three people ==="
  echo "Send $SITE_URL and the invite word to three people. Each should complete a check and"
  echo "forward a permalink back to you."
  pause
fi

echo ""
echo "Demo complete. Accepted when: all five steps happened as written, and the site is now in"
echo "use."
