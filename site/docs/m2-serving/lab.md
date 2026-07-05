---
sidebar_position: 2
title: 'Lab: Speak the Universal Contract'
---

# Lab: Speak the Universal Contract

**Goal:** Hit Ollama's OpenAI-compatible endpoint directly, write a containerized Python client
that speaks the `/v1` contract, wire it to Ollama via a `compose.yaml`, and prove that swapping
the engine behind the contract requires zero code changes.

**Time:** ~30 minutes  
**Prerequisites:** M1 complete — Rancher Desktop running, Ollama serving `qwen2.5:1.5b` natively
at `:11434`. `docker` and `docker compose` on your PATH.

---

## Step 1 — Hit the OpenAI-compatible endpoint directly

In M1 you called Ollama's native `/api/generate` endpoint from inside a container. Ollama also
exposes a fully OpenAI-compatible `/v1` API on the same port. Let's poke it directly so you
understand exactly what the contract looks like before you write a client against it.

### 1a — List available models (from the host)

```bash
curl -s http://localhost:11434/v1/models | python3 -m json.tool
```

**Expected output:**
```json
{
    "object": "list",
    "data": [
        {
            "id": "qwen2.5:1.5b",
            "object": "model",
            "created": 1783237329,
            "owned_by": "library"
        }
    ]
}
```

> The `created` value is an epoch timestamp set when Ollama loaded the model; it will differ on your machine.

This is the standard OpenAI `GET /v1/models` response shape. Any tool, SDK, or framework that
expects OpenAI will accept this.

### 1b — Chat completions (from the host)

```bash
curl -s http://localhost:11434/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "qwen2.5:1.5b",
    "messages": [{"role": "user", "content": "Explain containers in one sentence."}]
  }' | python3 -m json.tool
```

**Expected output:**
```json
{
    "id": "chatcmpl-184",
    "object": "chat.completion",
    "created": 1783249846,
    "model": "qwen2.5:1.5b",
    "system_fingerprint": "fp_ollama",
    "choices": [
        {
            "index": 0,
            "message": {
                "role": "assistant",
                "content": "Containers are lightweight, portable executable packages that include all necessary components (code and dependencies) to run software independently."
            },
            "finish_reason": "stop"
        }
    ],
    "usage": {
        "prompt_tokens": 36,
        "completion_tokens": 23,
        "total_tokens": 59
    }
}
```

> The `id` suffix is a counter that increments with each request; `created` is a live epoch timestamp. The `system_fingerprint` field (`"fp_ollama"`) is always present in Ollama's `/v1` responses. The model's reply wording varies — what matters is the shape of the response.

Compare this to M1's `/api/generate` response. The `/api/generate` format is Ollama-specific — a
flat JSON object with a `"response"` string. The `/v1/chat/completions` format is the OpenAI
contract: `choices[0].message.content`. The Python `openai` SDK, LangChain, LlamaIndex, and every
other major framework speak this second format.

### 1c — Same calls from inside a throwaway container

The `/v1` endpoint is also reachable via `host.docker.internal` from inside a container — the
same bridge you proved in M1:

```bash
docker run --rm curlimages/curl:latest -s \
  http://host.docker.internal:11434/v1/models
```

**Expected output:**
```json
{"object":"list","data":[{"id":"qwen2.5:1.5b","object":"model","created":1783237329,"owned_by":"library"}]}
```

```bash
docker run --rm curlimages/curl:latest -s \
  http://host.docker.internal:11434/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"model":"qwen2.5:1.5b","messages":[{"role":"user","content":"Say hi in 5 words."}]}'
```

**Expected output:**
```json
{"id":"chatcmpl-460","object":"chat.completion","created":1783249856,"model":"qwen2.5:1.5b","system_fingerprint":"fp_ollama","choices":[{"index":0,"message":{"role":"assistant","content":"Hello there! Ready to chat now."},"finish_reason":"stop"}],"usage":{"prompt_tokens":36,"completion_tokens":9,"total_tokens":45}}
```

> The `id`, `created`, and reply text all vary per request. `system_fingerprint` will always be `"fp_ollama"`.

The routing is identical to M1's `/api/generate` call, but the shape is now the universal
OpenAI-compatible contract. That's the only difference — and it is the difference that lets you
swap engines without touching code.

---

## Step 2 — Write the client

Create `labs/m2/client.py` with the following content:

```python title="labs/m2/client.py"
import os
from openai import OpenAI
client = OpenAI(base_url=os.environ.get("OPENAI_BASE_URL", "http://host.docker.internal:11434/v1"),
                api_key=os.environ.get("OPENAI_API_KEY", "ollama"))
resp = client.chat.completions.create(
    model=os.environ.get("MODEL", "qwen2.5:1.5b"),
    messages=[{"role": "user", "content": "Explain containers in one sentence."}])
print(resp.choices[0].message.content)
```

A few things worth noting:

- `base_url` is read from the environment with a sensible default pointing at
  `host.docker.internal:11434` — the address Ollama is reachable at from inside a container.
- `api_key="ollama"` is a dummy value. The `openai` SDK requires the field to be non-empty; Ollama
  ignores whatever you pass. When you later swap to a real OpenAI endpoint, set the actual key.
- Everything — `base_url`, `api_key`, and `model` — is configurable via environment variables.
  The script itself never changes.

---

## Step 3 — Containerize it

Create `labs/m2/Dockerfile`:

```dockerfile title="labs/m2/Dockerfile"
FROM python:3.12-slim
RUN pip install --no-cache-dir openai
WORKDIR /app
COPY client.py .
CMD ["python", "client.py"]
```

Build it:

```bash
docker build -t m2-client labs/m2/
```

**Expected output:**
```
#0 building with "rancher-desktop" instance using docker driver

#1 [internal] load build definition from Dockerfile
#1 DONE 0.0s

#2 [internal] load metadata for docker.io/library/python:3.12-slim
#2 DONE 2.7s

#5 [1/4] FROM docker.io/library/python:3.12-slim@sha256:423ed6ab...
#5 DONE 10.3s

#6 [2/4] RUN pip install --no-cache-dir openai
#6 0.780 Collecting openai
#6 0.851   Downloading openai-2.44.0-py3-none-any.whl.metadata (34 kB)
#6 ...
#6 3.757 Successfully installed ... openai-2.44.0 ...
#6 DONE 4.0s

#7 [3/4] WORKDIR /app
#7 DONE 0.0s

#8 [4/4] COPY client.py .
#8 DONE 0.0s

#9 exporting to image
#9 naming to docker.io/library/m2-client:latest done
#9 DONE 0.9s
```

> Docker uses BuildKit's `#N` step notation. The build has **4 steps** (FROM, RUN, WORKDIR, COPY).
> The first build pulls `python:3.12-slim` (~50 MB compressed) and installs `openai` (~2 MB) plus
> its dependencies. Expect ~10–30 seconds on a typical connection. Subsequent builds use the layer
> cache and finish in under a second.

Run it directly to verify the wiring before we add Compose:

```bash
docker run --rm m2-client
```

**Expected output:**
```
Containers are lightweight, portable executable packages that include everything needed to run software independently.
```

The model's exact wording will vary — what matters is that a sentence comes back, not an error.

---

## Step 4 — Start the growing `compose.yaml`

The `compose.yaml` in `labs/m2/` is the *start* of a file that grows across modules. Each module
adds one or more services. By M5 it will contain the full Acme stack. You author it service by
service so you understand every block.

This module's version has one service: the client.

Create `labs/m2/compose.yaml`:

```yaml title="labs/m2/compose.yaml"
services:
  client:
    build: .
    environment:
      OPENAI_BASE_URL: http://host.docker.internal:11434/v1
      MODEL: qwen2.5:1.5b
    # extra_hosts not needed on Rancher Desktop/Docker Desktop; note it for plain Linux:
    # extra_hosts: ["host.docker.internal:host-gateway"]
```

What each block does:

| Block | Purpose |
|-------|---------|
| `services:` | Top-level key; every container is a service |
| `client:` | The service name — `docker compose run client` targets this |
| `build: .` | Build the image from the `Dockerfile` in the same directory |
| `environment:` | Inject env vars into the running container |
| `OPENAI_BASE_URL` | Points the client at Ollama's `/v1` endpoint on the host |
| `MODEL` | Selects the model; override on the CLI without editing the file |
| `# extra_hosts` | Commented out — not needed on Rancher/Docker Desktop; see Troubleshooting |

Run it:

```bash
docker compose -f labs/m2/compose.yaml run --rm client
```

**Expected output:**
```
Containers are lightweight virtualizations that allow applications to run isolated from each other on a single machine.
```

> On first run you will also see two lines like `Network m2_default Created` before the model reply — Compose creates the default network. These disappear on subsequent runs.

`docker compose run --rm client` builds the image if needed, starts the container, prints the
model's reply, and removes the container. No ports are mapped, no long-running daemon — the
client is ephemeral by design.

:::info The model stays native and shared
Ollama is not in this `compose.yaml`. It lives natively on your Mac and serves Metal-accelerated
inference. The `compose.yaml` only contains the *consumer* of the model API, not the model itself.
This is Pattern A from the lesson: native model, containerized everything else.

As the `compose.yaml` grows across modules — RAG stack (M5), agent (M6), crew (M7) — the model
never moves into Compose. The `OPENAI_BASE_URL` environment variable is the only seam between the
containerized application and the native model server.
:::

---

## Step 5 — Prove engine-swappability

The client code you wrote has no knowledge of Ollama. It speaks the `/v1` contract. Any
OpenAI-compatible engine works — and swapping one requires changing only `OPENAI_BASE_URL`.

To illustrate: if you ran LocalAI on port 8080 instead of Ollama on 11434, the only change is:

```bash
OPENAI_BASE_URL=http://host.docker.internal:8080/v1 \
  docker compose -f labs/m2/compose.yaml run --rm client
```

:::note Illustration only — don't run this now
There is no engine listening on `:8080` in this lab, so the command above is a *demonstration of the seam*, not a step to execute. If you did run it with nothing at that address, you'd get a `Connection error` from the SDK — proof that the only thing that changed was the target URL, not a single line of code. You perform this swap for real against a live engine in M3.
:::

Or in a `compose.override.yaml`:

```yaml
services:
  client:
    environment:
      OPENAI_BASE_URL: http://host.docker.internal:8080/v1
```

The `Dockerfile` does not change. `client.py` does not change. The image does not rebuild. Only
the env var changes.

This is the wall-socket analogy in practice. The power company (the engine) can change; the
socket (the `/v1` contract) stays the same; your appliance (the client) keeps working.

In M3 you will perform this swap for real: Ollama is replaced by **vLLM** behind the same endpoint.
The `client.py` from this lab is the code that works on both sides of that swap — no modifications.

---

## Troubleshooting

:::warning `Connection refused` on port 11434

Ollama is either not running or is bound only to `localhost`, which is not reachable from inside
a container.

```bash
# Check if Ollama is running
curl http://localhost:11434/api/tags

# If it is running but containers can't reach it, restart with all-interfaces binding:
OLLAMA_HOST=0.0.0.0 ollama serve
```

On macOS with Ollama installed via the app, you can set this in the app's environment by adding
`OLLAMA_HOST=0.0.0.0` to your shell profile and relaunching. Rancher Desktop routes
`host.docker.internal` to the Mac host IP, so once Ollama binds to `0.0.0.0` it becomes
reachable from containers.
:::

:::warning `Could not resolve host: host.docker.internal` (plain Linux)

On a plain Linux host (no Docker Desktop, no Rancher Desktop), the `host.docker.internal` hostname
is not automatically injected. Uncomment the `extra_hosts` line in `compose.yaml`:

```yaml
services:
  client:
    build: .
    environment:
      OPENAI_BASE_URL: http://host.docker.internal:11434/v1
      MODEL: qwen2.5:1.5b
    extra_hosts: ["host.docker.internal:host-gateway"]
```

`host-gateway` is a Docker special value that resolves to the host's gateway IP — effectively the
host machine. This is not needed on Rancher Desktop or Docker Desktop, where the hostname is
injected automatically.
:::

:::warning `AuthenticationError` or API key validation error

The `openai` SDK requires `api_key` to be set to a non-empty string. Ollama does not actually
validate the key — it ignores it — but the SDK enforces the field client-side.

`api_key="ollama"` (any non-empty string) is the correct approach. If you see an
`AuthenticationError`, check that you have not accidentally set `OPENAI_API_KEY=""` (empty string)
in your environment.
:::

:::warning First build is slow

The first `docker compose run` (or `docker build`) pulls `python:3.12-slim` from Docker Hub and
installs the `openai` package. Expect ~1–2 minutes on a fresh machine. Subsequent builds hit the
layer cache and finish in seconds.
:::

---

## What you built — what's next

You have a containerized Python client that speaks the OpenAI `/v1` contract and reaches Ollama
natively via `host.docker.internal`. Key results:

- `labs/m2/client.py` — a tiny Python script that works against any OpenAI-compatible engine
- `labs/m2/Dockerfile` — packages it as a portable, minimal image
- `labs/m2/compose.yaml` — the first entry in the growing multi-module Compose file

**In M3** you will swap Ollama for **vLLM** running on a CPU VM. The same `client.py` and the
same `Dockerfile` from this lab will work without modification — only `OPENAI_BASE_URL` changes.
That's the contract paying off.
