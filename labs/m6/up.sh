#!/usr/bin/env bash
# M6 · Declarative Agent — start ChromaDB, build the agent image, and start the
# ToolHive-managed `fetch` MCP server. Requires native Ollama (qwen3.5:2b + nomic-embed-text)
# and a container runtime for both compose and ToolHive (DOCKER_HOST pinned to Rancher Desktop's
# socket — do not rely on a session-exported DOCKER_HOST).
set -euo pipefail
export PATH="$HOME/.rd/bin:$PATH"
export DOCKER_HOST="unix://$HOME/.rd/docker.sock"

cd "$(dirname "$0")"

TIMEOUT=30
ELAPSED=0
until curl -sf http://localhost:11434/api/tags >/dev/null 2>&1; do
  if [ "$ELAPSED" -ge "$TIMEOUT" ]; then
    echo "FAIL: native Ollama not reachable on :11434 after ${TIMEOUT}s. Start it with 'ollama serve'." >&2
    exit 1
  fi
  sleep 5
  ELAPSED=$((ELAPSED + 5))
done

docker compose up -d --build chromadb

PORT="${M6_CHROMA_PORT:-8000}"
TIMEOUT=60
ELAPSED=0
until curl -sf "http://localhost:${PORT}/api/v2/heartbeat" >/dev/null 2>&1; do
  if [ "$ELAPSED" -ge "$TIMEOUT" ]; then
    echo "FAIL: chromadb did not become ready within ${TIMEOUT}s." >&2
    docker compose logs --tail 50 chromadb >&2 || true
    exit 1
  fi
  sleep 3
  ELAPSED=$((ELAPSED + 3))
done

docker compose build agent

# ToolHive-managed MCP fetch server (isolated container, not a compose service).
if ! thv list 2>/dev/null | grep -q '^fetch '; then
  thv run fetch
fi

TIMEOUT=60
ELAPSED=0
until thv list 2>/dev/null | grep -q 'fetch.*running'; do
  if [ "$ELAPSED" -ge "$TIMEOUT" ]; then
    echo "FAIL: ToolHive fetch server did not reach 'running' within ${TIMEOUT}s." >&2
    exit 1
  fi
  sleep 3
  ELAPSED=$((ELAPSED + 3))
done

echo "m6 ready: chromadb healthy, agent image built, ToolHive fetch server running."
