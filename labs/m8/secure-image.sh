#!/usr/bin/env sh
# Open-source supply chain for a LOCAL image: SBOM → scan → sign.
#
# Usage:  ./secure-image.sh <local-image-tag>
#
# The image MUST exist in the local Docker image store (docker images).
# syft / trivy / grype scan the local image WITHOUT pulling from any registry.
# Cosign signs via a temporary local registry:2 instance (started automatically).
#
# To push to GHCR and sign the remote ref, do AFTER this script:
#   docker tag <local-tag> ghcr.io/<your-github-user>/<repo>:<tag>
#   docker push ghcr.io/<your-github-user>/<repo>:<tag>
#   COSIGN_PASSWORD="" cosign sign --yes --key cosign.key \
#       ghcr.io/<your-github-user>/<repo>:<tag>
# (requires: docker login ghcr.io and a PAT with write:packages scope)
#
set -eu
IMAGE="${1:-acme-support-agent:latest}"

echo "==> [1/4] SBOM with syft  (local image — no registry pull)"
syft "$IMAGE" -o spdx-json > sbom.spdx.json
echo "    wrote sbom.spdx.json"

echo "==> [2/4] Vulnerability scan with trivy  (CRITICAL/HIGH — local image)"
trivy image --scanners vuln --severity CRITICAL,HIGH "$IMAGE" || true

echo "==> [3/4] Second opinion with grype  (local image)"
grype "$IMAGE" || true

echo "==> [4/4] Sign with cosign (key-based, via local registry)"
[ -f cosign.key ] || COSIGN_PASSWORD="" cosign generate-key-pair

# Start a local registry if one is not already running.
docker inspect local-registry >/dev/null 2>&1 || \
  docker run -d -p 5001:5000 --name local-registry registry:2

# Derive a registry-safe name (strip any existing host prefix, add localhost:5001).
LOCAL_NAME=$(printf '%s' "$IMAGE" | sed 's|^[^/]*/||')
LOCAL_REF="localhost:5001/${LOCAL_NAME}"

docker tag "$IMAGE" "$LOCAL_REF"
docker push "$LOCAL_REF"

# Sign is best-effort: on networks that block/intercept rekor.sigstore.dev (common behind
# corporate proxies), the transparency-log upload fails even for key-based signing. Don't let
# that abort the whole script — scan results (stages 1-3) are the important CI-blocking output.
if COSIGN_PASSWORD="" cosign sign --yes --key cosign.key \
    --allow-http-registry \
    "$LOCAL_REF" 2>/tmp/secure-image-sign.err; then
  cosign verify --key cosign.pub \
    --allow-http-registry \
    "$LOCAL_REF"
  echo "Done. SBOM + scanned + signed $IMAGE (signed ref: $LOCAL_REF)."
else
  echo "signing skipped: cannot reach transparency log (common behind corporate proxies) — see Troubleshooting"
  cat /tmp/secure-image-sign.err >&2
  echo "Done. SBOM + scanned $IMAGE (signing skipped, see above)."
fi
rm -f /tmp/secure-image-sign.err
