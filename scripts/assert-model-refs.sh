#!/usr/bin/env bash
# Fails if any learner-facing file still names the retired models.
set -euo pipefail
cd "$(dirname "$0")/.."
if rg -n "qwen2\.5:(1\.5b|3b)" labs site/docs site/static/decks planning/decks planning/narration course.config.json labs/tools CLAUDE.md; then
  echo "FAIL: retired model names found"; exit 1
fi
echo "OK: no retired model names"
