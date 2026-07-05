# Capstone — Ship the Acme AI Support Platform

The end-to-end platform, composed from every module. Runs on any OCI runtime, on a 16 GB laptop.

## Readiness check

```bash
./platform-check.sh
```

Verifies: container runtime, native Ollama + models, `host.docker.internal` wiring, and the
packaging/supply-chain tools (`kit`, `thv`, `syft`, `trivy`, `grype`, `cosign`). Prints
**PLATFORM READY** when every layer is in place.

## The flow (each step lives in its module's `labs/`)

| Step | Command | Module |
| --- | --- | --- |
| Serve | native Ollama (`ollama serve`) or vLLM CPU (`labs/m3`) | M2 / M3 |
| Docs Assistant (RAG) | `docker compose up -d` in `labs/m5` | M5 |
| Support Agent | `docker compose run --rm agent "..."` in `labs/m6` | M6 |
| Incident Crew | `docker compose run --rm crew "..."` in `labs/m7` | M7 |
| Package the model | `kit pack` / `kit push` (`labs/m4`) | M4 |
| Secure the images | `./secure-image.sh <image>` (`labs/m8`) | M8 |
| Ship (CI) | `labs/m8/security-pipeline.yml` | M8 |
| Portability | swap runtime (Colima ↔ Rancher ↔ OrbStack ↔ Podman), re-run | M1 |

The model stays **native** (Metal on Apple Silicon); everything else is a container. Because it's OCI +
the Compose Spec, the same commands run unchanged on any runtime.
