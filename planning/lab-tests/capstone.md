# Lab-test evidence — Capstone: Ship the Acme AI Support Platform

**Machine:** Apple Silicon (arm64), 16 GB · Rancher Desktop · native Ollama 0.40.7 (MLX runner) · ChromaDB 1.5.9
**Date:** 2026-10-21

The Capstone composes the pieces validated across M1–M8. Every command in `site/docs/capstone/index.md`
was run as written except Steps 5 and 7 (see the end).

## What changed in this pass

- `labs/capstone/compose.yaml`: shared ChromaDB moved from `0.5.20` to `1.5.9`.
- The ChromaDB healthcheck could not stay as it was. The 1.x image ships no `python3` and no `curl`
  (`docker run --entrypoint sh chromadb/chroma:1.5.9 -c 'which python3 curl bash'` finds only bash), so the old
  Python probe would never turn healthy and the agent and crew `depends_on: service_healthy` would hang.
  The probe now uses bash `/dev/tcp` against `/api/v2/heartbeat`. The stack reports `(healthy)` below.
- The agent (M6 build) and crew (M7 build) use the Chroma v2 routes from Tasks 6 and 7. The crew's Reviewer now
  receives the runbook passage (see `planning/lab-tests/m7.md`).

## Step 0 — platform-check.sh

```
== 1. Container runtime (OCI: Rancher Desktop / Colima / OrbStack / Podman) ==
  ✔ docker CLI + engine reachable
== 2. Model serving (native Ollama, OpenAI-compatible) ==
  ✔ Ollama serving on :11434
  ✔ chat model present (qwen3.5:2b)
  ✔ embedding model present (nomic-embed-text)
== 3. Container → native model wiring ==
  ✔ containers reach the model via host.docker.internal
== 4. Packaging + supply chain tooling ==
  ✔ kit (KitOps) installed
  ✔ thv (ToolHive) installed
  ✔ syft installed
  ✔ trivy installed
  ✔ grype installed
  ✔ cosign installed

PLATFORM READY — serve → RAG → agent → crew → package → secure → ship.
```

## Step 2 — start the platform

```
 Image capstone-genai-app Building
 Image capstone-genai-app Built
 Network capstone_default Creating
 Network capstone_default Created
 Volume capstone_chroma_data Creating
 Volume capstone_chroma_data Created
 Container chromadb Creating
 Container chromadb Created
 Container genai-app Creating
 Container genai-app Created
 Container chromadb Starting
 Container chromadb Started
 Container chromadb Waiting
 Container chromadb Healthy
 Container genai-app Starting
 Container genai-app Started
```

`docker compose ps` after 20 s: `chromadb` `Up (healthy)` on `chromadb/chroma:1.5.9`; `genai-app` `Up` on `:8501`.
`curl -s -o /dev/null -w '%{http_code}' http://localhost:8501/_stcore/health` printed `200`.

## Step 3 — Support Agent (M6)

```
 Container chromadb Running
 Container chromadb Waiting
 Container chromadb Healthy
 Container capstone-agent-run-2cfbbd95481e Creating
 Container capstone-agent-run-2cfbbd95481e Created
[agent] Aria ready — ingested 5 runbook chunks (collection 1d5b6985). Persona from SOUL.md + AGENTS.md + SKILL.md (3503 chars).

USER: How do I restart the payments service?
  [decision: RETRIEVE (top dist=216.7)]
ARIA: Run `kubectl rollout restart deploy/payments -n prod`.
```

## Step 4 — Incident Crew (M7)

````
 Container chromadb Running
 Container chromadb Waiting
 Container chromadb Healthy
 Container capstone-crew-run-a2e06aee6cc6 Creating
 Container capstone-crew-run-a2e06aee6cc6 Created
[crew] Acme Incident Crew: Triage -> Investigator -> Fixer -> Reviewer (4 profiles, one shared model: qwen3.5:2b)

======================================================================
INCIDENT: P1: payments service down, pods in CrashLoopBackOff
======================================================================

[TRIAGE]      AREA: payments | SEV: SEV2 | payments pods crashing with CrashLoopBackOff

[INVESTIGATOR] ## Payments service
To restart the Acme payments service, run:
`kubectl rollout restart deploy/payments -n prod`.
The payments service depends on the Postgres primary in the `prod` namespace.

[FIXER]       Restart the Acme payments deployment to resolve the CrashLoopBackOff state.

```bash
kubectl rollout restart deploy/payments -n prod
```

[REVIEWER]    APPROVED: Command is a non-destructive, runbook-backed remediation for restarting a dependent service.

======================================================================
OUTCOME: APPROVED — ready for a human to apply
````

A second run, `P1: checkout 503`, ended `OUTCOME: APPROVED` as well (this is the `crew-approves-incident` check).

## Memory with the platform up

`docker stats --no-stream`: `chromadb` 30 MiB, `genai-app` 49 MiB. `ollama ps`: `qwen3.5:2b` 4.9 GB (it grows past the
3.4 to 3.8 GB seen in the crew-only runs once the Docs Assistant and agent have used it), `nomic-embed-text` 335 MB.
Peak is about 5.3 GB for the platform, under the 6 GB budget.

## Step 6 — secure the crew image (M8, local image)

`docker build -t acme-incident-crew:latest labs/m7/` then `cd labs/m8 && ./secure-image.sh acme-incident-crew:latest` with
`DOCKER_HOST=unix://$HOME/.rd/docker.sock` (Syft needs the socket path on Rancher Desktop). All four stages ran and the
script ended with:

```
Done. SBOM + scanned + signed acme-incident-crew:latest (signed ref: localhost:5001/acme-incident-crew:latest).
```

The `local-registry` container was removed afterwards, as the page's full-teardown tip says.

## checks.json validation 2026-10-21

```
✅ platform-check-ready — platform-check.sh confirms every layer (runtime, model serving, host wiring, supply-chain tooling) is present
✅ chromadb-healthy — shared ChromaDB answers the v2 heartbeat
✅ genai-app-healthy — Docs Assistant (Streamlit) exposed endpoint returns 200
✅ agent-grounded-answer — the one-shot support agent grounds its answer in the exact runbook command
✅ crew-approves-incident — the one-shot incident crew approves a runbook-backed incident end-to-end
✅ compose-teardown-with-volumes — compose down -v removes containers, network, and volumes cleanly

6/6 checks · score 6/6
```

The last check runs `docker compose down -v`, so the stack is gone afterwards.

## Not re-run

- **Step 5** (`kit push` to GHCR) publishes to an external registry and needs credentials, so it was not run. It does not touch Chroma or the model.
- **Step 7** (GitHub Actions pipeline) runs on push to `main`, so there is nothing to execute locally.

## Verdict

✅ One shared ChromaDB 1.5.9, the Docs Assistant, the declarative agent and the incident crew all come up and answer
on the consolidated compose file with `qwen3.5:2b`, and the local supply-chain step still signs the crew image.
