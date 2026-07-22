#!/usr/bin/env bash
# M3 · vLLM CPU — build + start the SmolLM2 server and poll until /v1/models answers.
# vLLM is slow to start (first run also downloads the model) — never blind-sleep.
set -euo pipefail
export PATH="$HOME/.rd/bin:$PATH"

cd "$(dirname "$0")"

MIN_CPU=4
MIN_MEM_GB=6
NCPU=$(docker info --format '{{.NCPU}}')
MEM_BYTES=$(docker info --format '{{.MemTotal}}')
MEM_GB=$(( MEM_BYTES / 1024 / 1024 / 1024 ))

if [ "$NCPU" -lt "$MIN_CPU" ] || [ "$MEM_GB" -lt "$MIN_MEM_GB" ]; then
  echo "FAIL: runtime VM has ${NCPU} CPU / ${MEM_GB} GB — this lab needs >= ${MIN_CPU} CPU / >= ${MIN_MEM_GB} GB." >&2
  echo "Raise Rancher Desktop's VM allocation (Preferences -> Virtual Machine) and retry." >&2
  exit 1
fi

docker compose up -d --build

PORT="${VLLM_PORT:-8009}"
TIMEOUT="${VLLM_UP_TIMEOUT:-300}"
ELAPSED=0
until curl -sf "http://localhost:${PORT}/v1/models" >/dev/null 2>&1; do
  if [ "$ELAPSED" -ge "$TIMEOUT" ]; then
    echo "FAIL: vllm-smollm2 did not become ready within ${TIMEOUT}s." >&2
    docker compose logs --tail 50 vllm-cpu >&2 || true
    exit 1
  fi
  sleep 5
  ELAPSED=$((ELAPSED + 5))
done

echo "vllm-smollm2 ready after ~${ELAPSED}s."
