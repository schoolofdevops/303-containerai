---
sidebar_position: 1
title: Prerequisites
---

# Prerequisites

Everything you need to install and verify before the first lab. Read this before Day 1.

---

## Knowledge Prerequisites

You don't need an ML background — the course teaches every AI concept from scratch. You do need to be comfortable with the following:

| Area | What you need |
|------|--------------|
| **Containers** | Build, run, volumes, networks; reading and writing a `compose.yaml` |
| **Git & GitHub** | Clone, commit, push; basic CI/CD concepts |
| **Command line** | Fluent on macOS Terminal or Windows PowerShell/WSL2 terminal |
| **Python** | Basic reading and editing of Python scripts (agent/app labs are Python-first) |

---

## System Requirements

All tools used in this course are **free and open source**. Docker Desktop is *not* required.

| Requirement | Details |
|-------------|---------|
| **Container runtime** | Any one of: **Rancher Desktop** *(cross-platform)*, **OrbStack** *(Mac)*, **Colima** *(Mac/Linux)*, or **Podman**. Docker Desktop works too but is not required. |
| **Operating system** | Apple Silicon (M1–M4) *or* Windows 11 + WSL2 recommended. Intel Mac works for the lighter labs. |
| **Ollama** | Installed **natively** on your host — not in a container. This is critical; see [The GPU Reality](./gpu-reality). |
| **RAM** | 16 GB minimum. 32 GB is comfortable for running multiple services simultaneously. |
| **Disk** | 30 GB free (models + images + layer cache). |
| **CPU** | 4 cores minimum. |
| **VS Code** | With the Docker or Dev Containers extension. |
| **GitHub account** | Active account for pushing images to GHCR. |
| **Container registry** | Docker Hub, GHCR, or Quay — any one works. |

:::note[Windows + NVIDIA GPU]

If you have a Windows machine with an NVIDIA GPU, the NVIDIA Container Toolkit lets you run the model server *inside* a container with full GPU acceleration. The course covers this path in the GPU track. Without a GPU, the CPU-vLLM track covers the same learning at lower throughput.
:::

---

## Quickstart: Install Rancher Desktop + Ollama

If you're starting from scratch on macOS, these steps get you to a working environment.

### 0. Get the course code

```bash
git clone https://github.com/schoolofdevops/303-containerai.git && cd 303-containerai
```

:::note[labs/ ships finished files too]

The labs hand-author almost every file service by service — type them yourself as you go, that's
how the material sticks. The `labs/` directory in this clone already contains finished versions of
those same files; treat them as your reference or fallback, not a shortcut to skip typing.
:::

### 1. Install Rancher Desktop (the container runtime)

```bash
brew install --cask rancher
```

Launch Rancher Desktop from Applications, wait for it to finish initializing (the tray icon turns green), then verify:

```bash
docker version
```

Expected output (versions may differ):

```
Client:
 Version:           29.x.x
 ...
Server: Docker Engine - Community
 Engine:
  Version:          29.x.x
```

:::note[Runtime output varies]

On Rancher Desktop the `Server:` section has no `Docker Engine - Community` heading — you'll just
see `Server:` followed by the `Engine:` block. What matters is that both a `Client:` and a `Server:`
section appear; the exact heading text depends on the runtime.
:::

### 2. Install Ollama (the model server — natively on the host)

```bash
brew install ollama
```

Start the Ollama service:

```bash
ollama serve &
```

:::note[Already running?]

If the Ollama app or a background service auto-started it for you, this prints `Error: listen tcp
127.0.0.1:11434: bind: address already in use`. That's harmless — it just means Ollama is already
serving. Move on to the next command.
:::

Verify it's running:

```bash
curl http://localhost:11434/
```

Expected output:

```
Ollama is running
```

### 3. Pull the course dev model

```bash
ollama pull qwen3.5:2b
```

Expected output (model is ~3.1 GB; digest varies per release):

```
pulling manifest
pulling 183715c43589: 100% ▕██████████████████▏ 3.1 GB
pulling 66b9ea09bd5b: 100% ▕██████████████████▏   68 B
pulling eb4402837c78: 100% ▕██████████████████▏ 1.5 KB
pulling 832dd9e00a68: 100% ▕██████████████████▏  11 KB
pulling 377ac4d7aeef: 100% ▕██████████████████▏  487 B
verifying sha256 digest
writing manifest
success
```

If the model is already pulled, you'll just see `success` — no download progress.

### 4. Verify the end-to-end wiring

Run a quick container that calls the natively-running Ollama — this proves the `host.docker.internal` bridge that every lab depends on:

```bash
docker run --rm curlimages/curl \
  curl -s http://host.docker.internal:11434/api/generate \
  -d '{"model":"qwen3.5:2b","prompt":"Say hello in one sentence.","stream":false}' \
  | grep -o '"response":"[^"]*"'
```

If you see a `"response":"..."` line, your environment is ready. If the request times out, see the troubleshooting note below.

:::tip[Troubleshooting: Ollama not reachable from container]

By default Ollama listens only on `127.0.0.1:11434`. For containers to reach it you need it to listen on all interfaces. Stop Ollama, set the environment variable, and restart:

```bash
pkill ollama
OLLAMA_HOST=0.0.0.0 ollama serve &
```

Or add `OLLAMA_HOST=0.0.0.0` to your shell profile and restart Ollama.
:::

---

## What's Next

Before the first lab, read **[The GPU Reality](./gpu-reality)** — it explains why the model server runs natively on Mac and how containers reach it. This is the single most important setup concept in the course.
