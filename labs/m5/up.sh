#!/usr/bin/env bash
# M5 · Docs Assistant (naive RAG) — build + start ChromaDB and the Streamlit app,
# poll both until ready. Requires native Ollama serving qwen3.5:2b + nomic-embed-text.
set -euo pipefail
export PATH="$HOME/.rd/bin:$PATH"

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

docker compose up -d --build

PORT="${M5_CHROMA_PORT:-8000}"
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

APP_PORT="${M5_APP_PORT:-8501}"
TIMEOUT=60
ELAPSED=0
until curl -sf "http://localhost:${APP_PORT}/_stcore/health" >/dev/null 2>&1; do
  if [ "$ELAPSED" -ge "$TIMEOUT" ]; then
    echo "FAIL: genai-app did not become ready within ${TIMEOUT}s." >&2
    docker compose logs --tail 50 genai-app >&2 || true
    exit 1
  fi
  sleep 3
  ELAPSED=$((ELAPSED + 3))
done

echo "m5 ready: chromadb + genai-app healthy."
