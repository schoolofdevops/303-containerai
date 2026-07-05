#!/usr/bin/env sh
# Acme AI Support Platform — end-to-end readiness check.
# Verifies every layer the course built is in place and wired, on ANY OCI runtime.
# Usage:  ./platform-check.sh
set -u
ok()   { printf "  \033[32m✔\033[0m %s\n" "$1"; }
bad()  { printf "  \033[31mX\033[0m %s\n" "$1"; FAIL=1; }
FAIL=0

echo "== 1. Container runtime (OCI: Rancher Desktop / Colima / OrbStack / Podman) =="
docker version >/dev/null 2>&1 && ok "docker CLI + engine reachable" || bad "no container runtime"

echo "== 2. Model serving (native Ollama, OpenAI-compatible) =="
curl -sf http://localhost:11434/api/tags >/dev/null 2>&1 && ok "Ollama serving on :11434" || bad "Ollama not serving"
curl -sf http://localhost:11434/api/tags 2>/dev/null | grep -q qwen2.5 && ok "chat model present (qwen2.5)" || bad "qwen2.5 not pulled"
curl -sf http://localhost:11434/api/tags 2>/dev/null | grep -q nomic-embed && ok "embedding model present (nomic-embed-text)" || bad "nomic-embed-text not pulled"

echo "== 3. Container → native model wiring =="
docker run --rm curlimages/curl:latest -sf http://host.docker.internal:11434/api/tags >/dev/null 2>&1 \
  && ok "containers reach the model via host.docker.internal" || bad "host.docker.internal wiring broken"

echo "== 4. Packaging + supply chain tooling =="
command -v kit    >/dev/null 2>&1 && ok "kit (KitOps) installed"   || bad "kit missing"
command -v thv    >/dev/null 2>&1 && ok "thv (ToolHive) installed" || bad "thv missing"
for t in syft trivy grype cosign; do
  command -v "$t" >/dev/null 2>&1 && ok "$t installed" || bad "$t missing"
done

echo
if [ "$FAIL" = "0" ]; then
  echo "PLATFORM READY — serve → RAG → agent → crew → package → secure → ship."
else
  echo "PLATFORM INCOMPLETE — see the ✗ items above (each maps to a module: M1–M8)."
  exit 1
fi
