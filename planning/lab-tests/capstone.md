# Lab-test evidence — Capstone: Ship the Acme AI Support Platform

**Machine:** Apple Silicon (arm64), 16 GB · Rancher Desktop · native Ollama
**Date:** 2026-07-05

The Capstone composes the pieces validated across M1–M8. `labs/capstone/platform-check.sh` verifies the
whole stack is in place on any OCI runtime, in one command:

```
$ ./platform-check.sh
== 1. Container runtime ==
  ✔ docker CLI + engine reachable
== 2. Model serving (native Ollama, OpenAI-compatible) ==
  ✔ Ollama serving on :11434
  ✔ chat model present (qwen2.5)
  ✔ embedding model present (nomic-embed-text)
== 3. Container → native model wiring ==
  ✔ containers reach the model via host.docker.internal
== 4. Packaging + supply chain tooling ==
  ✔ kit (KitOps) installed
  ✔ thv (ToolHive) installed
  ✔ syft / trivy / grype / cosign installed

PLATFORM READY — serve → RAG → agent → crew → package → secure → ship.
```

## End-to-end flow (each step validated in its module)

| Step | What | Validated in |
| --- | --- | --- |
| 1. Serve | native Ollama (`qwen2.5:1.5b`) behind OpenAI `/v1`; vLLM CPU option | M2, M3 (`lab-tests/m2,m3.md`) |
| 2. RAG | Docs Assistant over Acme runbooks (ChromaDB) | M5 (`lab-tests/m5.md`) |
| 3. Agent | declarative Agentic-RAG agent + guardrail + MCP (ToolHive) | M6 (`lab-tests/m6.md`) |
| 4. Crew | Incident Crew: triage→investigate→fix→review, approve/escalate | M7 (`lab-tests/m7.md`) |
| 5. Package | model + config as a ModelKit, push/pull (KitOps) | M4 (`lab-tests/m4.md`) |
| 6. Secure | SBOM + scan + sign + sandbox (Syft/Trivy/Grype/Cosign) | M8 (`lab-tests/m8.md`) |
| 7. Ship | GitHub Actions build→scan→sign (`labs/m8/security-pipeline.yml`) | M8 |
| 8. Portability | the same `compose.yaml`/commands run on Colima ↔ Rancher ↔ OrbStack ↔ Podman | M1 principle |

## Verdict

✅ Every layer of the Acme AI Support Platform is validated and wired on a 16 GB laptop, on the open OCI
stack — no paid Docker Desktop, model served natively, everything else containerized and portable.
