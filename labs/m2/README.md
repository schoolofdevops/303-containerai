# M2 Lab Assets — Speak the Universal Contract

Assets for the Module 2 lab: **"Speak the Universal Contract"**.

## What's here

| File | Purpose |
|------|---------|
| `client.py` | Python client — calls any OpenAI-compatible endpoint via the `openai` SDK |
| `Dockerfile` | Containerizes `client.py` on `python:3.12-slim` with the `openai` package |
| `compose.yaml` | The start of the growing Compose file; one `client` service that reaches the native Ollama server via `host.docker.internal` |

## Prerequisites

- M1 complete: Rancher Desktop running, Ollama serving `qwen3.5:2b` natively at `:11434`
- `docker` and `docker compose` on your PATH

## Usage

```bash
# Build and run the client (one-shot, container is removed after)
docker compose run --rm client

# Override model
MODEL=qwen3:4b docker compose run --rm client

# Point at a different OpenAI-compatible engine (engine-swap demo)
OPENAI_BASE_URL=http://host.docker.internal:8080/v1 docker compose run --rm client
```

Expected output: a single sentence from the model answering "Explain containers in one sentence."

## How it works

`client.py` uses the official `openai` Python SDK with `base_url` pointing at Ollama's
OpenAI-compatible `/v1` endpoint (`http://host.docker.internal:11434/v1`). The dummy
`api_key="ollama"` satisfies the SDK's required field — Ollama ignores it.

The `Dockerfile` packages the script as a minimal `python:3.12-slim` image with only the
`openai` package installed. `compose.yaml` wires the environment variables so the container
finds Ollama on the host without any code changes.

The same `client.py` code (and image) works against vLLM, LocalAI, or any other
OpenAI-compatible engine — only `OPENAI_BASE_URL` changes.

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| `Connection refused` on port 11434 | Set `OLLAMA_HOST=0.0.0.0` and restart Ollama so it binds to all interfaces |
| `Could not resolve host: host.docker.internal` (plain Linux) | Uncomment the `extra_hosts` line in `compose.yaml` |
| `AuthenticationError` or API key error | The SDK requires a non-empty `api_key`; `"ollama"` (any non-empty string) is correct |
