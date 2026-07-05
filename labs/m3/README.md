# M3 · Serving with vLLM (CPU track)

Runnable assets for the Module 3 lab. You serve `SmolLM2` on a **patched CPU
vLLM** image and hit the same OpenAI-compatible `/v1` endpoint your M2 client
already speaks — only the engine behind the contract changes.

## What's here

| File | Purpose |
|------|---------|
| `Dockerfile` | `openeuler/vllm-cpu` base + the one-line NUMA patch + CPU env defaults |
| `compose.yaml` | The `vllm-cpu` service: SmolLM2 command, resource caps, health check, `hf-cache` volume, port `8009:8000` |
| `.env.example` | Model presets (135M / 360M / 1.7B) + CPU/memory tuning knobs |

## Prerequisites

- Rancher Desktop (or Docker Desktop) running, with `docker` and `docker compose` on PATH.
- ~10 GB free disk (base image + model weights) and 8 GB+ RAM.
- Internet on first run: it pulls a multi-GB image and downloads the model.
  Both are cached afterward.

## Usage

```bash
cp .env.example .env        # optional — defaults work as-is
docker compose build        # builds the patched image (first time only)
docker compose up -d        # starts the server on host port 8009

# Wait for the model to load, then:
curl http://localhost:8009/health
curl http://localhost:8009/v1/models

curl http://localhost:8009/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"model":"HuggingFaceTB/SmolLM2-360M-Instruct",
       "messages":[{"role":"user","content":"Explain containers in one sentence."}],
       "max_tokens":64}'

docker compose down         # stop and free RAM
```

CPU inference is intentionally slow — throughput isn't the point here;
understanding the engine, the batcher, and the tuning knobs is. Tune with the
variables in `.env` (start with `OMP_THREADS` and `MAX_NUM_SEQS`).

See `site/docs/m3-vllm/lab.md` for the full walkthrough.
