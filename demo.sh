#!/usr/bin/env bash
set -euo pipefail

RESULTS_DIR="spike/results"
RESULTS_MD="spike/RESULTS.md"
READOUT="AMS/HANDOFF/handoff-2026-08-28-s1-4-s1-5-spike-readout-archie.md"
KEY_FILE="/Users/lukemccormick/Sites/CLAUDE/fact-check-key.key"

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

open_file() {
  if command -v open >/dev/null 2>&1; then
    open "$1"
  else
    echo "(open '$1' manually — no 'open' command found)"
  fi
}

if [ "$START_STEP" -le 1 ]; then
  echo "=== Step 1: spike/RESULTS.md ==="
  cat "$RESULTS_MD"
  open_file "$RESULTS_MD"
  pause
fi

if [ "$START_STEP" -le 2 ]; then
  echo "=== Step 2: Same-claim pairs (claude-sonnet-5 vs claude-haiku-4-5) ==="
  PAIRS_JSON=$(node -e '
const fs = require("fs");
const dir = "spike/results";
const files = fs.readdirSync(dir).filter(f => f.endsWith(".json"));
const byClaim = new Map();
for (const f of files) {
  const data = JSON.parse(fs.readFileSync(dir + "/" + f, "utf8"));
  const key = data.claim_text;
  if (!byClaim.has(key)) byClaim.set(key, {});
  byClaim.get(key)[data.model] = f.replace(/\.json$/, ".md");
}
const pairs = [];
for (const [claim, models] of byClaim.entries()) {
  if (models["claude-sonnet-5"] && models["claude-haiku-4-5"]) {
    pairs.push({ claim, sonnet: models["claude-sonnet-5"], haiku: models["claude-haiku-4-5"] });
  }
}
console.log(JSON.stringify(pairs));
')

  PAIR_COUNT=$(node -e "console.log(JSON.parse(process.argv[1]).length)" "$PAIRS_JSON")

  if [ "$PAIR_COUNT" -eq 0 ]; then
    echo "No same-claim pairs found."
  else
    node -e '
  const pairs = JSON.parse(process.argv[1]);
  pairs.forEach((p, i) => {
    const excerpt = p.claim.length > 60 ? p.claim.slice(0, 60) + "..." : p.claim;
    console.log(`${i + 1}. ${excerpt}`);
  });
  ' "$PAIRS_JSON"

    read -rp $'\nPick a pair number (or press Enter to skip): ' PICK

    if [ -z "$PICK" ]; then
      echo "No pair selected — skipping."
    else
      SONNET_FILE=$(node -e "const pairs=JSON.parse(process.argv[1]); const i=parseInt(process.argv[2],10)-1; console.log(pairs[i] ? pairs[i].sonnet : '')" "$PAIRS_JSON" "$PICK")
      HAIKU_FILE=$(node -e "const pairs=JSON.parse(process.argv[1]); const i=parseInt(process.argv[2],10)-1; console.log(pairs[i] ? pairs[i].haiku : '')" "$PAIRS_JSON" "$PICK")

      if [ -z "$SONNET_FILE" ] || [ -z "$HAIKU_FILE" ]; then
        echo "Invalid selection."
      else
        open_file "$RESULTS_DIR/$SONNET_FILE"
        open_file "$RESULTS_DIR/$HAIKU_FILE"
      fi
    fi
  fi
  pause
fi

if [ "$START_STEP" -le 3 ]; then
  echo "=== Step 3: Run a new check on claude-sonnet-5 ==="
  if [ ! -f "$KEY_FILE" ]; then
    echo "Key file not found at $KEY_FILE — refusing to start."
  else
    read -rp $'\nEnter a claim to fact-check (or press Enter to skip): ' CLAIM
    if [ -z "$CLAIM" ]; then
      echo "No claim entered — skipping step 3."
    else
      echo "Running claude-sonnet-5 on this claim now."
      echo "check.mjs prints nothing until it's fully done — there's no partial progress to"
      echo "show, it is genuinely just waiting on the API the whole time. Past runs ranged from"
      echo "~15s (easy claims) to ~6 min (contested claims needing many searches; see the S1-4"
      echo "read-out). A heartbeat below every 20s just confirms the process is still alive."
      START=$(date +%s)

      (
        while true; do
          sleep 20
          echo "... still working ($(( $(date +%s) - START ))s elapsed, no output to show yet)"
        done
      ) &
      TICKER_PID=$!
      trap 'kill "$TICKER_PID" >/dev/null 2>&1 || true' EXIT

      set +e
      ANTHROPIC_API_KEY="$(cat "$KEY_FILE")" node spike/check.mjs "$CLAIM" --model claude-sonnet-5
      STATUS=$?
      set -e

      kill "$TICKER_PID" >/dev/null 2>&1 || true
      wait "$TICKER_PID" 2>/dev/null || true
      trap - EXIT

      if [ "$STATUS" -ne 0 ]; then
        echo "check.mjs exited with an error (status $STATUS)."
      else
        END=$(date +%s)
        ELAPSED=$((END - START))
        echo "Elapsed: ${ELAPSED}s"
        if [ "$ELAPSED" -lt 180 ]; then
          echo "Under three minutes."
        else
          echo "Over three minutes."
        fi
        NEW_REPORT=$(ls -t "$RESULTS_DIR"/*.md | head -n 1)
        open_file "$NEW_REPORT"
      fi
    fi
  fi
  pause
fi

echo "=== Step 4: S1-4 spike read-out ==="
cat "$READOUT"
open_file "$READOUT"
