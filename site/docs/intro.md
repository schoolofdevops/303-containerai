---
sidebar_position: 1
title: Introduction
---

import Slides from '@site/src/components/Slides';

# Containers for GenAI & Agentic AI — The Open-Source Way

**Author/Trainer:** Gourav Shah | **Duration:** 2 Full Days | **Level:** Intermediate to Advanced

This is a hands-on course where you build **one realistic system, one step per module** — from a bare model call to a shipped multi-agent platform. Every lab runs on a standard 16 GB laptop using open-source tools that work identically on any OCI runtime.

## Course overview slides

Prefer to see the whole map first? Click through this short whiteboard deck before you dive in — or open it fullscreen.

<Slides src="decks/00-introduction.html" title="Course Introduction — 15 slides" />

---

## What You'll Build

Two connected use cases, constructed step by step across eight modules:

**Use Case A — The Docs Assistant (GenAI / Naive RAG)**
Day 1 takes the Acme Engineering team's runbooks and turns them into a retrieval-augmented assistant — containerized, portable, and fully open source.

**Use Case B — The Support Agent → Incident Crew (Agentic)**
Day 2 builds a separate agentic system that *uses* the Docs Assistant as one of its tools, growing from a single Agentic-RAG agent to a full multi-agent crew. The two connect at the tool boundary, so you see exactly when each pattern earns its keep.

The intelligence progression mirrors how teams actually adopt AI: **Naive RAG → Agentic RAG → tool-using agent → multi-agent crew** — each pattern introduced when it becomes necessary, not as abstract theory.

---

## The Build Ladder

| Step | Module | What you build | AI pattern learned |
|------|--------|---------------|-------------------|
| 0 | M1 | Runtime + a model responding to a call | Container-native serving |
| 1 | M2 | The model endpoint (OpenAI-compatible) | Model serving, engine swap |
| 2 | M3 | The endpoint scaled for throughput | vLLM serving, batching, quantization |
| 2.5 | M3B *(optional)* | A customized model adapter | LoRA/QLoRA fine-tuning in containers |
| 3 | M4 | The model versioned & distributable | Model packaging (OCI/ModelKit) |
| 4 | M5 | Docs Assistant — **Naive RAG** | Ingest → embed → retrieve → generate |
| 5 | M6 | Support Agent — **Agentic RAG** | AGENTS.md + Agent Skills + MCP tools |
| 6 | M7 | Incident Crew — **multi-agent** | Declarative profiles; LangGraph orchestration |
| 7 | M8 | The platform hardened | Guardrails, SBOM/scan/sign, evaluation |
| 8 | Capstone | The platform shipped | End-to-end CI + portability |

---

## The 16 GB Budget

Every lab is engineered to run on a 16 GB Apple Silicon or Windows laptop without thrashing:

- **Small quantized models only** — 1B–4B parameters in Q4 (Qwen3-1.7B, Llama 3.2 3B)
- **One shared model endpoint** — every component (RAG app, agent, crew) points at the same server; never one model per agent
- **Compose resource caps** — explicit `mem_limit` / `cpus` per service; profiles start only what each step needs
- **Build up, tear down** — each module starts from the previous step and stops unneeded services, so peak footprint stays flat
- **Heavy labs are opt-in** — the vLLM GPU benchmark and QLoRA fine-tune have CPU/tiny-model paths and cloud VM fallbacks

**Target peak footprint: ≈ 4–6 GB RAM, 2–3 containers per lab.**

---

## Prerequisites

**Knowledge:**
- Comfortable with container basics (build, run, volumes, networks) and the Compose file format
- Git and GitHub; basic CI/CD concepts
- Command-line fluency on macOS or Windows
- Basic Python helps; no ML background required

**System (all free / open source):**
- A container runtime: OrbStack, Colima, Rancher Desktop, or Podman (Docker Desktop optional)
- Apple Silicon (M1–M4) *or* Windows 11 + WSL2 recommended; Intel Mac works for lighter labs
- Ollama installed natively (for GPU-accelerated local serving on Mac)
- 16 GB RAM minimum, 4 cores, 30 GB free disk
- VS Code, active GitHub account, container registry account (Docker Hub / GHCR / Quay)

---

## Program at a Glance

| Day | Theme | Modules |
|-----|-------|---------|
| **Day 1** | Serve & Package the Model | M1 – M4 |
| **Day 2** | RAG → Agentic RAG → Multi-Agent → Ship | M5 – M8 + Capstone |

---

## The One Design Principle You Need to Know First

Docker Desktop is now **paid for larger organizations**. This course is built on the **OCI standard + Compose Spec**, which run identically on Colima, OrbStack, Rancher Desktop, Podman, and Docker Desktop. You learn container-native, not Docker-native — the open standard is the through-line.

Start with [Setup: Prerequisites](./setup/prerequisites) to get your environment ready.
