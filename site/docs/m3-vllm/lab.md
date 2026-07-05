---
sidebar_position: 2
title: 'Lab: Serve SmolLM2 on CPU vLLM'
---

# Lab: Serve SmolLM2 on CPU vLLM

**Goal:** Build a patched CPU vLLM image, serve `SmolLM2-135M` behind the OpenAI-compatible `/v1` API, prove it's the *same contract* your M2 client speaks by pointing that client at it with a one-line change, then tune the CPU knobs.

**Time:** ~30 minutes (plus a one-time multi-GB image pull + model download on first run)
**Prerequisites:** Rancher Desktop (or Docker Desktop) running; `docker` and `docker compose` on your PATH; the M2 lab's `client.py` handy. Lab assets live in `labs/m3/`.

:::danger[Allocate resources first — vLLM is heavier than Ollama]

Unlike M1/M2 (where the model ran natively), vLLM runs **inside a container**, so it needs real CPU and RAM allocated to your container runtime's VM. **Give your runtime at least 4 CPUs and 6 GB of memory** before this lab:

- **Rancher Desktop:** Preferences → **Virtual Machine** → set **CPUs = 4**, **Memory = 6 GB**, then apply (it restarts the VM).
- **Colima:** `colima start --cpu 4 --memory 6`
- **Docker Desktop / OrbStack:** Settings → Resources.

The `compose.yaml` caps the container at `cpus: 4.0` / `memory: 5G`. A cap **must not exceed** what the VM has — if it does, the container refuses to start (see Troubleshooting).

:::

:::warning[First run is slow — this is expected]

The first `docker compose build` pulls a **multi-GB** base image, and the first `docker compose up` **downloads the model** from Hugging Face. Both are cached afterward. On top of that, **CPU inference is slow** — a chat completion can take tens of seconds. Nothing is hung; the machine is just doing real work without a GPU. Throughput isn't the point of this lab — understanding the engine is.

:::

---

## Step 1 — The image and the NUMA patch

Change into the lab directory and look at the `Dockerfile`.

```bash
cd labs/m3
cat Dockerfile
```

**Expected output:**
```dockerfile
FROM openeuler/vllm-cpu:0.9.1-oe2403lts

RUN sed -i 's/cpu_count_per_numa = cpu_count \/\/ numa_size/cpu_count_per_numa = cpu_count \/\/ numa_size if numa_size > 0 else cpu_count/g' \
    /workspace/vllm/vllm/worker/cpu_worker.py

ENV VLLM_TARGET_DEVICE=cpu \
    VLLM_CPU_KVCACHE_SPACE=1 \
    OMP_NUM_THREADS=2 \
    OPENBLAS_NUM_THREADS=1 \
    MKL_NUM_THREADS=1
```

That single `sed` line is the whole reason we build a custom image. Inside a container the kernel reports **0 NUMA nodes**, so vLLM's `cpu_count // numa_size` becomes a division by zero and the worker crashes on startup. The patch guards the division: if there are no NUMA nodes, use the full CPU count. (See the lesson's CPU track for the full story.)

Build the image:

```bash
docker compose build
```

**Expected output:**
```
[+] Building 41.2s (8/8) FINISHED
 => [internal] load build definition from Dockerfile
 => => transferring dockerfile: 512B
 => [internal] load metadata for docker.io/openeuler/vllm-cpu:0.9.1-oe2403lts
 => [1/2] FROM docker.io/openeuler/vllm-cpu:0.9.1-oe2403lts
 => [2/2] RUN sed -i 's/cpu_count_per_numa = .../g' /workspace/vllm/vllm/worker/cpu_worker.py
 => exporting to image
 => => naming to docker.io/library/vllm-cpu-optimized:latest
```

---

## Step 2 — Serve SmolLM2 on CPU vLLM

Look at `compose.yaml`. The `vllm-cpu` service runs the patched image, passes the model and serving args, caps resources (cpus 4 / mem 5G) so it can't eat the laptop, mounts an `hf-cache` volume so weights survive restarts, and maps host port **8009** to the container's **8000**. Four of its settings are exactly what it takes to make CPU vLLM run in a container — each one fixes a real startup/inference failure:

```bash
cat compose.yaml
```

**Expected output (excerpt):**
```yaml
services:
  vllm-cpu:
    build: {context: ., dockerfile: Dockerfile}
    image: vllm-cpu-optimized:latest
    container_name: vllm-smollm2
    # (2) SYS_NICE + unconfined seccomp let vLLM migrate NUMA pages; without them
    #     startup dies with "numa_migrate_pages failed. errno: 1".
    cap_add: [SYS_NICE]
    security_opt: ["seccomp:unconfined"]
    command:
      - --model
      - ${MODEL_NAME:-HuggingFaceTB/SmolLM2-135M-Instruct}
      - --host
      - "0.0.0.0"
      - --port
      - "8000"
      - --dtype
      - ${DTYPE:-float32}      # (3) CPU has no bf16 kernel — float32 or inference 500s
      - --swap-space
      - "${SWAP_SPACE:-1}"     # (4) default 4 GiB > container RAM; keep it small
      - --max-model-len
      - "${MAX_MODEL_LEN:-1024}"  # smaller context => smaller KV cache => fits RAM
    ports:
      - "8009:8000"
    deploy:
      resources:
        limits: {cpus: "4.0", memory: 5G}   # (1) must be <= your runtime VM's allocation
```

Those four numbered settings are the difference between "vLLM CPU works" and a wall of tracebacks. They're covered in Troubleshooting below and in the lesson's CPU-track section.

Start it:

```bash
docker compose up -d
```

**Expected output:**
```
[+] Running 2/2
 ✔ Volume "m3_hf-cache"      Created
 ✔ Container vllm-smollm2    Started
```

Watch it load — on first run this includes the model download:

```bash
docker compose logs -f vllm-cpu
```

**Expected output (tail):**
```
INFO ... Starting vLLM API server on http://0.0.0.0:8000
INFO ... Available routes: /health, /v1/models, /v1/chat/completions, /v1/completions
INFO ... Application startup complete.
INFO ... Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
```

Press `Ctrl+C` to stop following the logs (the container keeps running). Now wait for health to go green:

```bash
curl http://localhost:8009/health
```

**Expected output:**
```
```

`/health` returns **HTTP 200 with an empty body** once the model is loaded and the server is ready. If you get a connection refused, the model is still loading — give it a minute and retry.

---

## Step 3 — It's the same OpenAI contract

### 3a — List models

```bash
curl -s http://localhost:8009/v1/models | python3 -m json.tool
```

**Expected output:**
```json
{
    "object": "list",
    "data": [
        {
            "id": "HuggingFaceTB/SmolLM2-135M-Instruct",
            "object": "model",
            "created": 1783253768,
            "owned_by": "vllm",
            "max_model_len": 1024
        }
    ]
}
```

Same shape as the M2 `GET /v1/models` you hit against Ollama — only the `id` and `owned_by` differ.

### 3b — Chat completion

```bash
curl -s http://localhost:8009/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "HuggingFaceTB/SmolLM2-135M-Instruct",
    "messages": [{"role": "user", "content": "In one sentence, what is a Linux container?"}],
    "max_tokens": 48
  }' | python3 -m json.tool
```

**Expected output** (this is a real capture — a 135M model is tiny, so the wording will be rough but the *shape* is a standard OpenAI response):
```json
{
    "id": "chatcmpl-1c1ec4302bee44089339020eb932ba36",
    "object": "chat.completion",
    "created": 1783253771,
    "model": "HuggingFaceTB/SmolLM2-135M-Instruct",
    "choices": [
        {
            "index": 0,
            "message": {
                "role": "assistant",
                "content": "Linux containers are virtualized environments that run applications and services without requiring network connections or additional hardware, allowing for efficient application running on minimal infrastructure."
            },
            "finish_reason": "stop"
        }
    ],
    "usage": {
        "prompt_tokens": 40,
        "completion_tokens": 29,
        "total_tokens": 69
    }
}
```

:::note[Slow first token is normal]

On CPU this call can take tens of seconds — the first token is the slowest. That's the machine without a GPU, not a bug. The *response shape* is what matters: `choices[0].message.content`, identical to what your M2 client already parses.

:::

### 3c — Point your M2 client at vLLM (one-line change)

This is the through-line of the whole course. Your M2 `client.py` reads `OPENAI_BASE_URL` and `MODEL` from the environment. Change **only the base URL** — from the Ollama address to the vLLM address — and the exact same client, image, and code talk to a completely different engine.

```bash
OPENAI_BASE_URL=http://host.docker.internal:8009/v1 \
MODEL=HuggingFaceTB/SmolLM2-135M-Instruct \
  python3 client.py "In one sentence, what is a Linux container?"
```

**Expected output** (135M is tiny — expect rough wording; the point is that the *same client* got an answer from a different engine):
```
Linux containers are virtualized environments that run applications and services
without requiring network connections or additional hardware.
```

No code changed. No SDK changed. No image rebuilt. One environment variable swapped the engine behind the `/v1` wall socket — exactly the point M2 made, now proven against a real production engine.

---

## Step 4 — Tuning knobs

Copy the example env file and experiment. These map straight to the lesson's CPU knobs.

```bash
cp .env.example .env
```

**Expected output:**
```
```

Try the **lightest model** (135M) for faster startup on constrained machines, and adjust threading and concurrency. Edit `.env`:

```bash
# in .env
MODEL_NAME=HuggingFaceTB/SmolLM2-135M-Instruct
OMP_THREADS=4        # more OpenMP threads (try up to ~75% of your cores)
MAX_NUM_SEQS=4       # fewer concurrent sequences = less memory
```

Recreate the service to apply:

```bash
docker compose up -d
```

**Expected output:**
```
[+] Running 1/1
 ✔ Container vllm-smollm2    Recreated
```

Re-run the Step 3b `curl`. With the 135M model you'll notice faster startup and first-token latency. Watch live resource use while a request runs:

```bash
docker stats vllm-smollm2 --no-stream
```

**Expected output:**
```
CONTAINER      CPU %     MEM USAGE / LIMIT     MEM %
vllm-smollm2   180.4%    2.1GiB / 8GiB         26.3%
```

`OMP_THREADS` is the main dial: raising it uses more cores (higher CPU %) and can lower latency up to a point, then thermal throttling and cache thrashing take over. Find the value with the best latency, not the highest CPU.

---

## Step 5 — The GPU track (read-only)

You won't run this on the Mac — Apple Silicon exposes no GPU to containers — but this is exactly what you'd run on an NVIDIA Linux box or cloud VM. **Do not execute these here.**

```bash
# Requires the NVIDIA Container Toolkit installed on the host.
docker run --gpus all --ipc=host -p 8000:8000 \
  vllm/vllm-openai:latest \
  --model mistralai/Mistral-7B-Instruct-v0.3
```

- `vllm/vllm-openai:latest` is the official CUDA image (not the CPU one).
- `--gpus all` exposes the GPU (needs the NVIDIA Container Toolkit).
- `--ipc=host` gives vLLM the large shared memory its multi-process attention needs.

The served endpoint is the *same* `/v1` contract — your M2 client would point at `http://<gpu-host>:8000/v1` and work unchanged. To fit a 7B model on a smaller card, add a quantized checkpoint (e.g. an AWQ 4-bit model); vLLM detects the method automatically.

---

## Troubleshooting

:::warning[Common failure modes]

- **`range of CPUs is from 0.01 to 2.00, as there are only 2 CPUs available`** (or similar) — your compose `cpus`/`memory` cap is larger than what your runtime VM has. Raise the VM's allocation (4 CPUs / 6 GB — see the setup note at the top), or lower `CPU_LIMIT` / `MEMORY_LIMIT` in `.env` to fit.
- **`numa_migrate_pages failed. errno: 1`** on startup — the container lacks permission to migrate memory across NUMA nodes. The compose already grants `cap_add: [SYS_NICE]` and `security_opt: ["seccomp:unconfined"]`; if you stripped those, add them back.
- **`Too large swap space. 4.00 GiB out of the ... total CPU memory`** — vLLM's `--swap-space` defaults to 4 GiB, bigger than this container's RAM. The compose sets `--swap-space 1`; lower it further if needed.
- **HTTP 500 with `rms_norm_impl not implemented for 'BFloat16'`** — `--dtype auto` picked the model's bf16, which CPU kernels (especially arm64) can't run. The compose forces `--dtype float32`. Don't set it back to `auto` on CPU.
- **Connection refused on `/health`** — the model is still downloading/loading on first run. Follow `docker compose logs -f vllm-cpu` and wait for `Application startup complete`.
- **Slow first token** — expected on CPU. The first token is slowest; subsequent tokens stream faster. Not a bug.
- **Container killed / out of memory** — lower `MAX_MODEL_LEN` (e.g. 1024), lower `MAX_NUM_SEQS`, or switch to `SmolLM2-135M-Instruct` in `.env`, then `docker compose up -d`.
- **Model download stalls** — first download can take several minutes; `docker compose restart vllm-cpu` to resume. Check your internet connection.
- **`ZeroDivisionError` / worker crash on startup** — the NUMA patch is missing or the base image tag changed. Confirm the `sed` line in the `Dockerfile` and rebuild with `docker compose build --no-cache`.

:::

---

## Step 6 — Tear down

Free the RAM before the next module.

```bash
docker compose down
```

**Expected output:**
```
[+] Running 1/1
 ✔ Container vllm-smollm2    Removed
```

To also clear the cached model weights (frees disk, but the next run re-downloads):

```bash
docker compose down -v
```

**Expected output:**
```
[+] Running 2/2
 ✔ Container vllm-smollm2    Removed
 ✔ Volume m3_hf-cache        Removed
```

---

**What's next:** In M4 you'll package models and their configuration as **OCI artifacts** — shipping a model the same way you ship a container image.
