---
sidebar_position: 2
title: 'Lab: Prove the Wiring'
---

# Lab: Prove the Wiring

**Goal:** Confirm that a throwaway container can reach the natively-served Ollama model on your Mac, get a real inference response back, and understand exactly why this wiring exists.

**Time:** ~20 minutes  
**Prerequisites:** Rancher Desktop (or Colima / OrbStack / Podman) installed and running; Ollama installed natively; `qwen3.5:2b` pulled.

---

## Step 1 — Start your container runtime

**Rancher Desktop** (recommended): open the app; wait for the green "Running" status in the menu bar.

:::note[Other runtimes — same commands, different start step]

- **Colima:** `colima start`
- **OrbStack:** launch the app from Applications
- **Podman Desktop:** `podman machine start`

Everything from Step 2 onward is identical across all runtimes.
:::

Verify your runtime is up:

```bash
docker version
```

**Expected output:**
```
Client:
 Version:           29.5.3-rd
 API version:       1.54
 ...
Server:
 Engine:
  Version:          29.5.2
  API version:      1.54 (minimum version 1.41)
  ...
```

The exact version numbers will vary; what matters is that both `Client` and `Server` sections appear (server = the runtime is running).

---

## Step 2 — Confirm the model server is native

Ollama must be running natively on your Mac — **not** inside a container. Verify:

```bash
ollama list
```

**Expected output:**
```
NAME                         ID              SIZE      MODIFIED       
...
qwen3.5:2b                   dfaf2605162e    3.1 GB    55 minutes ago    
...
```

`qwen3.5:2b` should appear. Other models you have pulled will be listed too; the digest `dfaf2605162e` and the 3.1 GB size are what to match. If it doesn't, pull it:

```bash
ollama pull qwen3.5:2b
```

Also confirm the native API responds:

```bash
curl -s http://localhost:11434/api/tags
```

**Expected output** (abbreviated):
```json
{"models":[...,{"name":"qwen3.5:2b","model":"qwen3.5:2b","modified_at":"2026-10-21T12:47:14.064227372+05:30","size":3117475695,"digest":"dfaf2605162e689c8cac330dc4a190c4c50ad30aa47814a8fe9b79fa5127e97e","details":{"parent_model":"","format":"safetensors","family":"","families":null,"parameter_size":"","quantization_level":"mxfp8","runner":"mlx"},"capabilities":["completion","vision","thinking","tools"]},...]}
```

:::info[Why native on Mac?]

macOS containers have no GPU access — the Metal GPU is only reachable by native processes. A model inside a container falls back to CPU and runs 3–6x slower. Ollama runs natively and uses Metal; everything else is containerised. See [Lesson §3](./lesson#3-the-apple-silicon-gpu-reality) for the full explanation.
:::

---

## Step 3 — The core move: call the model from inside a container

This is the heart of the lab. A throwaway `curlimages/curl` container will POST a request to `host.docker.internal:11434` — the bridge hostname that every container runtime exposes to reach the host machine.

```bash
docker run --rm curlimages/curl:latest -s \
  http://host.docker.internal:11434/api/generate \
  -d '{"model":"qwen3.5:2b","prompt":"Say hi in 5 words.","stream":false,"think":false}'
```

**Expected output:**
```json
{"model":"qwen3.5:2b","created_at":"2026-10-21T08:12:43.555791Z","response":"Hello there! How can I help you today?","done":true,"done_reason":"stop","context":[...],"total_duration":2304532417,"load_duration":51407917,"prompt_eval_count":19,"prompt_eval_cached_count":3,"prompt_eval_duration":1906853750,"eval_count":10,"eval_duration":221278167}
```

You should see a `"response"` field with a short reply. The exact wording and the nanosecond timings vary — the model is generative. What proves the wiring works is any non-error JSON with a `"response"` key.

:::warning[Why `"think": false` is in every call]

`qwen3.5:2b` is a reasoning model: by default it writes a long hidden "thinking" monologue before it answers. On this same prompt, without `"think": false`, the call ran for **4 minutes 49 seconds** on the reference Mac and returned a `"thinking"` field full of drafts next to a one-line answer. With the switch off, it answers in about two seconds. Every Ollama call in this course carries the switch-off, and each endpoint spells it differently — `"think": false` on `/api/generate` and `/api/chat`, `"reasoning_effort": "none"` on `/v1/chat/completions`. The `/no_think` prompt suffix does not work on this model, and a Modelfile cannot set it.
:::

**Breaking down the command:**

| Part | What it does |
|------|-------------|
| `docker run --rm` | Spin up a container; delete it when done |
| `curlimages/curl:latest` | Minimal image that contains `curl` and nothing else |
| `http://host.docker.internal:11434` | The host machine's Ollama, reachable from inside the container |
| `/api/generate` | Ollama's generate endpoint (OpenAI-like shape) |
| `"stream":false` | Get the full response in one JSON object, not a stream |
| `"think":false` | Switch off the model's hidden reasoning so it answers directly |

---

## Step 4 — Wrap it in a script

The `labs/m1/` directory of this repo already includes a convenience script, `call-ollama.sh`, that runs
the exact command from Step 3. (You cloned the repo in Setup — run this from its root.) Make it
executable:

```bash
chmod +x labs/m1/call-ollama.sh
```

Run it with the default prompt:

```bash
./labs/m1/call-ollama.sh
```

**Expected output** (the response wording varies — the model is generative; the JSON *shape* is what matters):
```json
{"model":"qwen3.5:2b","created_at":"2026-10-21T08:17:46.325765Z","response":"In computer science, a container is an abstract data structure used to store or organize various data types, such as arrays, lists, or sets of items.","done":true,"done_reason":"stop","context":[...],"total_duration":2045381875,"load_duration":18176917,"prompt_eval_count":22,"prompt_eval_cached_count":3,"prompt_eval_duration":1375506125,"eval_count":31,"eval_duration":598958416}
```

A 2B-parameter model can answer off-target — here it gave the programming-language sense of "container". That is normal for a small model; the wiring is what you are proving, not the quality of the answer.

Run it with a custom prompt:

```bash
./labs/m1/call-ollama.sh "What is a container registry in one sentence?"
```

**Expected output** (wording will differ):
```json
{"model":"qwen3.5:2b","created_at":"2026-10-21T08:17:48.345199Z","response":"A container registry is a secure, centralized repository designed to store and serve container images for software deployment.","done":true,"done_reason":"stop","context":[...],"total_duration":790359208,"load_duration":9939042,"prompt_eval_count":21,"prompt_eval_cached_count":3,"prompt_eval_duration":361985333,"eval_count":20,"eval_duration":396444542}
```

The script is a thin wrapper around the `docker run` command from Step 3. Open it and read it — there are no surprises:

```bash
cat labs/m1/call-ollama.sh
```

---

## Step 5 — Portability proof (concept)

You just ran the same `docker run` command that works on Colima, OrbStack, Rancher Desktop, and Podman. Here is why: `host.docker.internal` is part of the de-facto standard that every major OCI runtime implements. The `curlimages/curl` image is an OCI image — it runs on any compliant runtime. The `compose.yaml` equivalent of this call would also be portable.

You have proved the foundational wiring. Every later module builds on this exact pattern: your app code (containerised) talks to Ollama (native) through `host.docker.internal:11434`. The model endpoint looks like OpenAI's API, so swapping it later requires only a URL change.

---

## Troubleshooting

:::warning[`Could not resolve host: host.docker.internal`]
Your container runtime isn't injecting the `host.docker.internal` hostname into the container's DNS.

- **Rancher Desktop:** this works by default — make sure you're on v1.9 or later
- **Colima:** start with `colima start --network-address` or add `--add-host host.docker.internal:host-gateway` to your `docker run` command
- **OrbStack / Podman Desktop:** supported by default
:::

:::warning[`Connection refused` on port 11434]
Ollama isn't running or isn't bound to all interfaces.

```bash
# Start Ollama
ollama serve

# Or via Homebrew services
brew services start ollama

# Confirm it's listening
curl http://localhost:11434/api/tags
```
:::

:::warning[`model "qwen3.5:2b" not found`]
Pull the model:

```bash
ollama pull qwen3.5:2b
```
:::

:::warning[Container pull is slow (first run)]
`curlimages/curl:latest` is ~20 MB compressed (~37 MB on disk) — it downloads once and is cached. Subsequent runs start in under a second.
:::

---

## What you built — what's next

You proved the container → native-model wiring: a containerised process reached the natively-served Ollama and received a real AI response. This is the foundation every later module uses:

- **M2** builds a containerized client that speaks Ollama's OpenAI-compatible `/v1` endpoint and puts *that client* in the growing `compose.yaml` (the model stays native)
- **M5** adds a containerised RAG app that uses the same `host.docker.internal:11434` call to generate answers over Acme's runbooks
- **M6** adds an agent container that calls the same endpoint as a reasoning tool

### Try the Container X-Ray

Want to *watch* this wiring live instead of just running the one-shot command? `labs/tools/container-xray/` is a small local tool that polls your real docker state and native Ollama every few seconds — its Wiring lens shows running containers, Ollama's status and pulled models, and a live `host.docker.internal` reachability check. Run `bash labs/tools/container-xray/serve.sh` and open the printed URL; see `labs/tools/container-xray/README.md` for details. It grows a lens per later module (Stack at M5–M7, Platform at the capstone).

The one line — `http://host.docker.internal:11434` — is the thread that connects everything.
