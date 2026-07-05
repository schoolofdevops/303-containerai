---
sidebar_position: 2
title: 'Lab: Prove the Wiring'
---

# Lab: Prove the Wiring

**Goal:** Confirm that a throwaway container can reach the natively-served Ollama model on your Mac, get a real inference response back, and understand exactly why this wiring exists.

**Time:** ~20 minutes  
**Prerequisites:** Rancher Desktop (or Colima / OrbStack / Podman) installed and running; Ollama installed natively; `qwen2.5:1.5b` pulled.

---

## Step 1 — Start your container runtime

**Rancher Desktop** (recommended): open the app; wait for the green "Running" status in the menu bar.

:::note Other runtimes — same commands, different start step
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
 ...
Server: Docker Engine - Community
 Engine:
  Version:          29.5.2
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
NAME            ID              SIZE      MODIFIED
qwen2.5:1.5b    65ec06548149    986 MB    About an hour ago
```

`qwen2.5:1.5b` should appear. If it doesn't, pull it:

```bash
ollama pull qwen2.5:1.5b
```

Also confirm the native API responds:

```bash
curl -s http://localhost:11434/api/tags
```

**Expected output** (abbreviated):
```json
{"models":[{"name":"qwen2.5:1.5b","model":"qwen2.5:1.5b",...}]}
```

:::info Why native on Mac?
macOS containers have no GPU access — the Metal GPU is only reachable by native processes. A model inside a container falls back to CPU and runs 3–6x slower. Ollama runs natively and uses Metal; everything else is containerised. See [Lesson §3](./lesson#3-the-apple-silicon-gpu-reality) for the full explanation.
:::

---

## Step 3 — The core move: call the model from inside a container

This is the heart of the lab. A throwaway `curlimages/curl` container will POST a request to `host.docker.internal:11434` — the bridge hostname that every container runtime exposes to reach the host machine.

```bash
docker run --rm curlimages/curl:latest -s \
  http://host.docker.internal:11434/api/generate \
  -d '{"model":"qwen2.5:1.5b","prompt":"Say hi in 5 words.","stream":false}'
```

**Expected output:**
```json
{"model":"qwen2.5:1.5b","created_at":"...","response":"Hello there! How can I help you today?","done":true,...}
```

You should see a `"response"` field with a short reply. The exact wording varies — the model is generative. What proves the wiring works is any non-error JSON with a `"response"` key.

**Breaking down the command:**

| Part | What it does |
|------|-------------|
| `docker run --rm` | Spin up a container; delete it when done |
| `curlimages/curl:latest` | Minimal image that contains `curl` and nothing else |
| `http://host.docker.internal:11434` | The host machine's Ollama, reachable from inside the container |
| `/api/generate` | Ollama's generate endpoint (OpenAI-like shape) |
| `"stream":false` | Get the full response in one JSON object, not a stream |

---

## Step 4 — Wrap it in a script

Download and run the convenience script from the `labs/m1/` directory of this repository:

```bash
chmod +x labs/m1/call-ollama.sh
```

Run it with the default prompt:

```bash
./labs/m1/call-ollama.sh
```

**Expected output:**
```json
{"model":"qwen2.5:1.5b","created_at":"...","response":"A container is a lightweight virtualization technology that allows you to package an application and all its dependencies into a single unit, which can then be easily deployed across different computing environments.","done":true,...}
```

Run it with a custom prompt:

```bash
./labs/m1/call-ollama.sh "What is a container registry in one sentence?"
```

**Expected output:**
```json
{"model":"qwen2.5:1.5b","created_at":"...","response":"A container registry is an online repository for storing and managing Docker images.","done":true,...}
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

:::warning `Could not resolve host: host.docker.internal`

Your container runtime isn't injecting the `host.docker.internal` hostname into the container's DNS.

- **Rancher Desktop:** this works by default — make sure you're on v1.9 or later
- **Colima:** start with `colima start --network-address` or add `--add-host host.docker.internal:host-gateway` to your `docker run` command
- **OrbStack / Podman Desktop:** supported by default
:::

:::warning `Connection refused` on port 11434

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

:::warning `model "qwen2.5:1.5b" not found`

Pull the model:

```bash
ollama pull qwen2.5:1.5b
```
:::

:::warning Container pull is slow (first run)

`curlimages/curl:latest` is ~3 MB — it downloads once and is cached. Subsequent runs start in under a second.
:::

---

## What you built — what's next

You proved the container → native-model wiring: a containerised process reached the natively-served Ollama and received a real AI response. This is the foundation every later module uses:

- **M2** wraps Ollama behind an OpenAI-compatible proxy service and puts *that* endpoint in the `compose.yaml`
- **M5** adds a containerised RAG app that uses the same `host.docker.internal:11434` call to generate answers over Acme's runbooks
- **M6** adds an agent container that calls the same endpoint as a reasoning tool

The one line — `http://host.docker.internal:11434` — is the thread that connects everything.
