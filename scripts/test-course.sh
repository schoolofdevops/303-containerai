#!/usr/bin/env bash
# Pre-workshop smoke test: run every module's checks sequentially (memory budget!).
# Usage: scripts/test-course.sh [module ...]   e.g. scripts/test-course.sh m3 m5
set -u
export PATH="$HOME/.rd/bin:$PATH"
export DOCKER_HOST="${DOCKER_HOST:-unix://$HOME/.rd/docker.sock}"
cd "$(dirname "$0")/.."

mods=("$@")
if [ ${#mods[@]} -eq 0 ]; then
  mods=(m1 m2 m3 m3b m4 m5 m6 m7 m8 capstone)
fi

declare -a failed=()
for mod in "${mods[@]}"; do
  checks="labs/$mod/checks.json"
  [ -f "$checks" ] || { echo "SKIP $mod (no checks.json)"; continue; }
  echo ""
  echo "════════ $mod ════════"
  [ -x "labs/$mod/up.sh" ] && { "labs/$mod/up.sh" || { echo "FAIL $mod (up.sh)"; failed+=("$mod"); continue; }; }
  if node scripts/run-checks.mjs "$checks"; then
    echo "PASS $mod"
  else
    echo "FAIL $mod"
    failed+=("$mod")
  fi
  [ -x "labs/$mod/down.sh" ] && "labs/$mod/down.sh"
done

echo ""
echo "════════ SUMMARY ════════"
if [ ${#failed[@]} -eq 0 ]; then
  echo "ALL MODULES PASS"
  exit 0
else
  echo "FAILED: ${failed[*]}"
  exit 1
fi
