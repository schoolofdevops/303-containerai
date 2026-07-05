# M1 Lab Assets — Container-Native GenAI

Assets for the Module 1 lab: **"Prove the Wiring"**.

## What's here

| File | Purpose |
|------|---------|
| `call-ollama.sh` | Throwaway-container client — calls the native Ollama server via `host.docker.internal:11434` |

## Prerequisites

- A container runtime installed and running:
  - **Rancher Desktop** (recommended) — or Colima / OrbStack / Podman Desktop
  - `docker` (or `nerdctl` / `podman`) on your PATH
- **Ollama** running natively (not in a container):
  ```bash
  ollama serve   # or: brew services start ollama
  ```
- Model pulled:
  ```bash
  ollama pull qwen2.5:1.5b
  ollama list    # verify it appears
  ```

## Usage

```bash
chmod +x call-ollama.sh

# Default prompt
./call-ollama.sh

# Custom prompt
./call-ollama.sh "What is a container registry?"

# Different model
MODEL=qwen2.5:3b ./call-ollama.sh "Explain RAG in one sentence."
```

Expected output: a JSON object with a `"response"` field containing the model's answer.

## How it works

`call-ollama.sh` runs `curlimages/curl` as a throwaway container and POSTs to
`http://host.docker.internal:11434/api/generate`. The hostname `host.docker.internal`
resolves to the macOS host IP from inside the container, reaching the natively-served
Ollama process. No GPU is needed inside the container — Ollama handles inference natively
using Metal.

This is the foundational pattern every later module builds on: native model server +
containerised everything else.

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| `curl: (6) Could not resolve host: host.docker.internal` | Check your runtime's network mode; Rancher Desktop supports this by default |
| `connection refused` on port 11434 | Run `ollama serve` or `brew services start ollama` |
| Model not found error | Run `ollama pull qwen2.5:1.5b` |
