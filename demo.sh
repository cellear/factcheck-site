#!/usr/bin/env bash
set -euo pipefail

SITE_URL="https://factcheck-site.pages.dev"

FIXTURES=(
  "fixture-refusal|Should render: Check failed — the model declined to check this claim. No report, no verdict."
  "fixture-tool-error|Should render: Check failed — a search tool error interrupted this check. No report, no verdict."
  "fixture-truncated|Should render: Check failed — the check was cut off before it finished. No report, no verdict."
  "fixture-no-report|Should render: Check failed — the check completed but did not produce a report. No report, no verdict."
  "fixture-search-cap-hit|Should render: a FULL report with a Sources list, PLUS the note 'Search budget reached; this report is based on 5 searches.' This one IS a verdict."
)

if [ "${1:-}" = "-h" ] || [ "${1:-}" = "--help" ]; then
  echo "Usage: ./demo.sh [start-step]"
  echo "  start-step: 1-4, default 1. Jump straight to a step instead of re-running earlier"
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

normalize_result_url() {
  # Accepts a bare id or a full URL; echoes a full /r/<id> URL.
  local input="$1"
  if [[ "$input" == http* ]]; then
    echo "$input"
  else
    echo "$SITE_URL/r/$input"
  fi
}

if [ "$START_STEP" -le 1 ]; then
  echo "=== Step 1: Live check on your phone ==="
  echo "This step needs your phone — it's not something this script can do for you."
  echo ""
  echo "On your phone, open: $SITE_URL"
  echo "Paste a claim and submit. Watch the countdown run; you should land on a /r/<id>"
  echo "permalink with the report showing (this can take up to ~6 minutes for a contested"
  echo "claim — the countdown itself explains that past 90s)."
  read -rp $'\nOnce you land on the result, paste its URL or id here (or press Enter to skip): ' RESULT_INPUT
  if [ -z "$RESULT_INPUT" ]; then
    echo "No result entered — skipping. Steps 2 and 3 will ask again if you have a link later."
  else
    RESULT_URL=$(normalize_result_url "$RESULT_INPUT")
    echo "Using: $RESULT_URL"
  fi
  pause
fi

if [ "$START_STEP" -le 2 ]; then
  echo "=== Step 2: Same permalink, private window, laptop ==="
  if [ -z "${RESULT_URL:-}" ]; then
    read -rp $'\nEnter the /r/<id> URL or id from step 1 (or press Enter to skip): ' RESULT_INPUT
    if [ -n "$RESULT_INPUT" ]; then
      RESULT_URL=$(normalize_result_url "$RESULT_INPUT")
    fi
  fi
  if [ -z "${RESULT_URL:-}" ]; then
    echo "No URL available — skipping."
  else
    echo "This needs a private/incognito window — not something this script can force open"
    echo "reliably across browsers, so open one yourself and paste in:"
    echo ""
    echo "  $RESULT_URL"
    echo ""
    echo "Confirm it shows the same report and the same metadata (model, date, duration) as"
    echo "step 1."
  fi
  pause
fi

if [ "$START_STEP" -le 3 ]; then
  echo "=== Step 3: Text the link to one person ==="
  if [ -z "${RESULT_URL:-}" ]; then
    read -rp $'\nEnter the /r/<id> URL or id to text (or press Enter to skip): ' RESULT_INPUT
    if [ -n "$RESULT_INPUT" ]; then
      RESULT_URL=$(normalize_result_url "$RESULT_INPUT")
    fi
  fi
  if [ -z "${RESULT_URL:-}" ]; then
    echo "No URL available — skipping."
  else
    echo "Text this link to one person and ask them to open it:"
    echo ""
    echo "  $RESULT_URL"
  fi
  read -rp $'\nPress Enter once they confirm they can see the report (or press Enter to skip this check)...' _
fi

if [ "$START_STEP" -le 4 ]; then
  echo "=== Step 4: Failure fixtures (from S2-6) ==="
  echo "Five stable permalinks. Four should render as a failed check with no verdict; one"
  echo "(search_cap_hit) should render as a real verdict plus a search-budget note."
  for entry in "${FIXTURES[@]}"; do
    id="${entry%%|*}"
    expectation="${entry#*|}"
    url="$SITE_URL/r/$id"
    echo ""
    echo "--- $id ---"
    echo "$expectation"
    open_url "$url"
    pause
  done
fi

echo ""
echo "Demo complete. Accepted when: all three views of one permalink match, every fixture"
echo "renders as expected above, and (per the sprint file) the URL stays undisclosed beyond"
echo "this demo until Sprint 3 is accepted."
