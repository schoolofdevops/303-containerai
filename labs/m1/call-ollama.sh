#!/usr/bin/env sh
# call-ollama.sh
# Calls the natively-served Ollama model from *inside* a throwaway container,
# proving the host.docker.internal wiring that every later lab relies on.
#
# Usage:
#   ./call-ollama.sh                              # uses default prompt
#   ./call-ollama.sh "Your prompt here"           # custom prompt
#   MODEL=qwen2.5:3b ./call-ollama.sh "Prompt"   # custom model
#
# Prerequisites:
#   - A container runtime on PATH (docker / nerdctl / podman)
#   - Ollama running natively on :11434
#   - The target model already pulled (ollama pull qwen2.5:1.5b)

set -eu

MODEL="${MODEL:-qwen2.5:1.5b}"
PROMPT="${1:-Explain what a container is in one sentence.}"

docker run --rm curlimages/curl:latest -s \
  http://host.docker.internal:11434/api/generate \
  -d "{\"model\":\"$MODEL\",\"prompt\":\"$PROMPT\",\"stream\":false}"
