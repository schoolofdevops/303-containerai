# Containers for GenAI & Agentic AI — The Open-Source Way

### (formerly "Next Level Docker for GenAI & Agentic")

**Version:** 20260705a (revised — open-source, runtime-agnostic, one use case built step-by-step; prior-asset reuse mapped)
**Author and Trainer:** Gourav Shah
**Duration:** 2 Full Days
**Level:** Intermediate to Advanced
**Format:** One real use case, decomposed — each module builds one step, from a served model to a shipped multi-agent system

---

## The Big Pivot in This Edition

The 2025 program assumed Docker Desktop and Docker's own AI toolchain. This edition removes that assumption. Docker Desktop is now **paid for larger organizations**, and most teams run open alternatives — **Colima, OrbStack, Rancher Desktop, Podman**. So the entire course is built on **the open container standard (OCI) + the Compose Spec**, which run identically on any of these runtimes.

Four more design principles drive this edition:

1. **Container-native, not Docker-native** — Docker is one option, never a requirement.
2. **One use case, decomposed** — we take a single realistic system and build it one step per module, so tools are learned in service of shipping something real.
3. **Resource-friendly by design** — every lab is engineered to run on an average 16 GB laptop without overloading it (see the Resource Budget below).
4. **Write the stack, don't paste it** — learners **hand-author the `compose.yaml` service by service** across the modules (model → vector DB → embeddings → app → MCP gateway → agents), understanding every block, rather than copy-pasting a finished file. There's *one growing compose file* that tells the whole story by the end.

| What was Docker-proprietary in 2025 | Open-source, universal replacement used here |
| --- | --- |
| Docker Desktop | **Colima / OrbStack / Rancher Desktop / Podman** (Docker Engine optional) |
| Docker Model Runner (serving) | **Ollama, vLLM (GPU + CPU), llama.cpp, LocalAI** — all OpenAI-compatible |
| `docker model package` (model artifacts) | **KitOps / ModelKit** (CNCF) + **ORAS** — OCI artifacts to any registry |
| Docker MCP Catalog / Gateway | **ToolHive** (Stacklok, Apache-2.0) — MCP servers as isolated containers |
| Docker Scout (security) | **Trivy, Syft, Grype, Cosign** (SBOM, scan, sign) |
| Docker Offload (cloud GPU) | Any NVIDIA machine / cloud GPU VM — **GPU labs kept optional** |
| `cagent`, Dagger / `container-use` | **Declarative agents** (AGENTS.md/SOUL.md + Agent Skills + MCP) with **LangGraph** for deterministic orchestration |

> Docker Model Runner is itself open source and runs in Docker CE, so it appears as an *optional* alternative — but the course leads with tools that work on every runtime.

---

## Two Connected Use Cases, Built Step by Step

We build across the two days with **two use cases that connect** — a clean GenAI app *and* a real agentic system — so nothing becomes one giant tangle:

- **Use Case A — the Docs Assistant (GenAI / naive RAG).** Day 1 stands up the model and turns it into a retrieval assistant over Acme's runbooks and docs. We reuse the proven **`lightweight-genai-stack`** (Ollama + ChromaDB + Streamlit, 6–8 GB) as this app.
- **Use Case B — the Support Agent → Incident Crew (Agentic).** Day 2 builds a *separate* agentic app that **reuses the Docs Assistant as one of its tools**: a single **Agentic-RAG** agent that calls real **MCP tools through an MCP Gateway**, then grows into a **multi-agent crew**. We reuse the existing **CrewAI compose lab** as the ready-made multi-agent scaffold.

The two connect at the tool boundary — the agent *uses* the assistant — so skills compound without forcing everything into a single monolith. The intelligence still progresses the way teams really adopt it: **naive RAG (UC-A) → Agentic RAG → tool-using agent → multi-agent crew (UC-B)** — so learners see not just *how* but *when* each pattern is right.

### The build ladder (each module = one step)

| Step | Module | What we build | AI-workflow pattern learned |
| --- | --- | --- | --- |
| 0 | M1 | Runtime + a model responding to a call | Container-native serving |
| 1 | M2 | The model endpoint (OpenAI-compatible) | Model serving, engine swap |
| 2 | M3 | The endpoint scaled for throughput | vLLM serving, batching, quantization |
| 2.5 | M3B *(optional)* | A customized model adapter | LoRA/QLoRA fine-tuning in containers |
| 3 | M4 | The model versioned & distributable | Model packaging (OCI/ModelKit) |
| 4 | M5 | Docs Assistant — **naive RAG** | Ingest → embed → retrieve → generate |
| 5 | M6 | Support Agent — **declarative Agentic RAG** | AGENTS.md/SOUL.md + Agent Skills + MCP tools + guardrails + memory |
| 6 | M7 | Incident Crew — **multi-agent** | Declarative agent profiles; LangGraph orchestration when deterministic control is needed |
| 7 | M8 | The platform hardened | Guardrails, sandboxing, SBOM/scan/sign, evaluation |
| 8 | Capstone | The platform shipped | End-to-end CI + portability |

### AI-workflow patterns covered along the way

Naive RAG and **Agentic RAG** (query rewriting, routing, multi-hop, self-correction); **declarative agent definition** (AGENTS.md / SOUL.md + Agent Skills/SKILL.md); **tool-calling** agents via MCP; **short- and long-term memory**; **multi-agent** (declarative profiles and, when deterministic control is needed, orchestration frameworks like LangGraph); **parameter-efficient fine-tuning** (LoRA/QLoRA, optional); **guardrails and human-in-the-loop**; **evaluation and observability/tracing** — each introduced at the step where it becomes necessary, not as abstract theory.

### Optional second use case (take-home)

To reinforce transfer, learners get an optional parallel track: apply the same ladder to a **different domain** (e.g., a customer-support or research-assistant corpus of their choice), reusing the identical stack. Great for post-workshop practice.

---

## The One Constraint That Shapes Every Lab: GPU on Apple Silicon

The most important practical lesson of the course, taught explicitly and early.

- **Apple Silicon Macs cannot expose the Metal GPU to a container.** macOS virtualization (Hypervisor.framework) provides no virtual GPU, so a model *inside* a container falls back to **CPU and runs 3–6x slower**.
- **The universal pattern:** on Mac, run the model server **natively** (Ollama uses Metal + unified memory) and **containerize everything else** — app, agent, tools, vector DB — connecting at `http://host.docker.internal:11434`.
- **On Windows (WSL2) + NVIDIA**, the model server **can** run in a container with full GPU via the NVIDIA Container Toolkit.
- **For *learning* vLLM specifically**, we use its **prebuilt CPU images** (`vllm/vllm-openai-cpu:latest-x86_64` / `:latest-arm64`), which run entirely in a container on any machine — slow, but perfect for understanding the OpenAI API, batching, and quantization mechanics before adding a GPU.

Every serving lab ships behind the **same OpenAI-compatible endpoint**, so application and agent code never changes when the backend does.

---

## Resource Budget — Runs on an Average Laptop

Non-negotiable design rule: **the whole course runs on a 16 GB laptop** (Apple Silicon or Windows) without thrashing. We achieve this deliberately:

- **Small quantized models only.** Labs standardize on **1B–4B** models in **Q4** (e.g., Qwen3-1.7B/4B, Llama 3.2 3B, `gpt-oss` small). Big models are discussed, not required.
- **One shared model endpoint.** Every component — RAG app, single agent, and *all* crew agents — points at the **same** model server. We never run one model per agent; agents are cheap Python services, the model is shared.
- **Lightweight, right-sized dependencies.** Qdrant (or SQLite-backed Chroma/pgvector) with **small corpora**; slim base images; tools pulled once and reused.
- **Compose resource caps.** Lab `compose.yaml` files set explicit `mem_limit` / `cpus` so nothing runs away, and stacks scale profiles (`--profile`) to start only what a step needs.
- **Build up, tear down.** Each module starts from the previous step and **stops services it no longer needs**, so peak footprint stays flat instead of accumulating.
- **Heavy work is opt-in and offloadable.** The GPU vLLM benchmark and QLoRA fine-tune are the only heavy labs — both have a CPU/tiny-model path and a cloud-VM path, so no laptop is forced to carry them.
- **Instructor-hosted fallback.** A shared model endpoint (and optional shared vector DB) can be provided so any struggling machine can point remote and keep pace.

**Target peak footprint per running lab: ≈ 4–6 GB RAM, 2–3 containers.** The multi-agent lab stays within budget because the agents share one small model.

---

## Objectives

By the end of this workshop, participants — a mix of **DevOps and application/AI developers** — will be able to:

- Run any GenAI/agentic stack on **any OCI runtime** (Colima, OrbStack, Rancher Desktop, Podman), free of paid Docker Desktop
- Serve local LLMs with **open-source engines** — **Ollama** for dev, **vLLM (CPU for learning, GPU for throughput)** for production — behind a common OpenAI-compatible API
- Handle the **Apple Silicon vs Windows GPU reality** with the native-server / containerized-app pattern
- *(Optional)* **Customize a model** with **LoRA/QLoRA** in a reproducible training container
- **Package and version models** (and adapters) **as OCI artifacts** with **KitOps/ModelKit** on any registry
- Build the intelligence progression teams actually use — **naive RAG → Agentic RAG → tool-using agent → multi-agent crew** — defining agents **declaratively** (AGENTS.md/SOUL.md + Agent Skills + MCP + guardrails), and reaching for an **orchestration framework (LangGraph)** only when deterministic control is required — all containerized
- Run **MCP servers as isolated containers** with **ToolHive**, with per-tool access control
- **Secure and govern** it with open tools — **Trivy/Syft/Grype** for SBOM & scanning, **Cosign** for signing, sandboxed code execution, and CI

---

## Prerequisites

### Knowledge

- Comfortable with container basics (build, run, volumes, networks) and the Compose file format
- Git and GitHub; basic CI/CD concepts
- Command-line fluency on macOS or Windows
- Basic Python helps (agent/app labs are Python-first); no ML background required

### System (all free / open source)

- **A container runtime — any one of:** OrbStack *(Mac)*, Colima *(Mac/Linux)*, Rancher Desktop *(Mac/Windows/Linux)*, or Podman. **Docker Desktop optional.**
- **Apple Silicon (M1–M4)** *or* **Windows 11 + WSL2** recommended; Intel Mac works for the lighter (CPU/small-model) labs
- **Ollama** installed natively (GPU-accelerated local serving on Mac)
- **Windows + NVIDIA GPU** unlocks the full local vLLM-GPU lab; without one, the CPU-vLLM track covers the learning, and a cloud GPU VM is optional for throughput
- 16 GB RAM min (32 GB comfortable), 4 cores, **30 GB** free disk
- **VS Code**, active **GitHub**, and a container registry account (Docker Hub / GHCR / Quay — any works)

---

## Program at a Glance

| Day | Theme | Modules | Build steps |
| --- | --- | --- | --- |
| **Day 1** | Serve & Package the Model (open source) | M1 – M4 | Steps 0–3 |
| **Day 2** | RAG → Agentic RAG → Multi-Agent, then Ship | M5 – M8 + Capstone | Steps 4–8 |

### Open-Source Tool Map (one tool per job)

| Job | Tool(s) taught |
| --- | --- |
| Container runtime | OrbStack / Colima / Rancher Desktop / Podman |
| Orchestration | Compose Spec (`docker compose` / `podman compose` / `nerdctl compose`) |
| Dev-time serving | **Ollama**, llama.cpp |
| Production serving | **vLLM** (CPU + GPU), TGI (alt), LocalAI (universal OpenAI hub) |
| Fine-tuning *(optional)* | **Axolotl / Unsloth** (NVIDIA), **MLX-LM** (Apple Silicon) |
| Model packaging | **KitOps / ModelKit**, ORAS |
| Vector store | Qdrant / pgvector / Chroma |
| MCP tools | **ToolHive** (alt: Docker MCP Gateway OSS, Obot) |
| Agent definition | **AGENTS.md / SOUL.md + Agent Skills (SKILL.md)** + MCP + guardrails |
| Orchestration *(when needed)* | **LangGraph** for deterministic multi-agent (alt: CrewAI) |
| Security / supply chain | **Trivy, Syft, Grype, Cosign**, Dockle |

---

## Proven Assets From Your Prior Workshops (reuse map)

Several labs learners already loved map directly onto this outline — we reuse them, updated for the open-source/runtime-agnostic stack rather than rebuilding.

| Prior asset | Maps to | Reuse plan |
| --- | --- | --- |
| **`vllm-cpu-example`** (CPU vLLM) | **M3** | Direct anchor — SmolLM2 135M/360M/1.7B, resource presets (2/4/10 GB), NUMA patch + Apple Silicon/Intel thread tuning, Compose CPU/mem caps |
| **`lightweight-genai-stack`** (GenAI apps) | **M5** | Direct anchor — Ollama + **ChromaDB** + Streamlit, 6–8 GB, incl. the **"Learning Mode"** that visualizes the RAG pipeline live |
| **`compose-for-agents/crew-ai`** (agentic) | **M7** | Reuse the multi-agent crew; **port it off** the Docker-proprietary `models:` block + DMR to a portable model service, and **upgrade its supergateway bridge to the ToolHive gateway** |
| Running Local LLMs w/ **Docker Model Runner** | **M2** | Keep DMR as one taught (it's OSS, runs in CE) alongside Ollama/vLLM |
| **Configuring MCPs with VS Code** | **M6** | Fold in as the dev-time MCP setup segment |
| **AI-Augmented CI** (GitHub Actions) | **M8** | Reuse as the CI hands-on |
| Advanced Image Building & Security | — | Dropped per the pure-AI focus; its security ideas live in M8 (SBOM/scan/sign) |
| **`tech-stack-advisor`** | optional | Base app for a "containerize → push → deploy to HF Spaces" on-ramp, if a gentler start is wanted |

> The `crew-ai` lab is also the course's best **teaching hook**: it currently needs Docker Desktop (`models:` block + a DMR-bound gateway). Rebuilding it to run on Colima/Rancher/Podman *is* the through-line of this edition — "here's the lab you liked; now let's make it run anywhere."

---

## Day 1 — Serve & Package the Model *(Steps 0–3)*

### Module 1: Container-Native (not Docker-Native) GenAI

*Framing + the GPU reality + a quick win. ~75 min.*

- Why "container-native": OCI + Compose Spec run identically on Colima, OrbStack, Rancher Desktop, Podman
- Containers as the **package / serve / isolate / ship** layer for AI
- **The Apple Silicon GPU limitation** and the native-server / containerized-app pattern — taught up front
- A quick 2026 map: **declarative agents (AGENTS.md/SOUL.md + Agent Skills + MCP + guardrails) vs. orchestration frameworks** — so learners know what they're building, and when to reach for each
- Meet the Acme use case and the build ladder
- **Hands-on:** Stand up your runtime (learner's choice), run the model that will power the Docs Assistant with Ollama, and call it from a throwaway container — proving the `host.docker.internal` wiring

### Module 2: Serving Local Models the Universal Way

*The core cross-platform serving skill. ~2 hrs.*

- **Demo first, then the open path:** show **Docker Model Runner** (the slick Docker-native `docker model run`) as a short demo — then pivot to the open, runtime-agnostic engines we actually use in the labs, so nothing depends on Docker Desktop
- Open-source engines compared: **Ollama** (dev standard, used throughout the labs), **llama.cpp**, **LocalAI** (multi-backend OpenAI hub)
- The **OpenAI-compatible endpoint** as the universal contract — swap engines without touching app code
- **GGUF** and model selection for laptops: `gpt-oss`, Qwen3, Llama 3.x, Mistral (quantized)
- Two wiring patterns, one app: model-native (Mac) vs model-in-container (Windows/NVIDIA/Linux)
- **Hands-on:** Serve the Docs Assistant's model and containerize a small Python client. Mac learners run Ollama natively; Windows learners run the engine in a container with GPU — both hit the identical API

### Module 3: Production-Grade Serving with vLLM (CPU *and* GPU)

*Throughput and real serving — for everyone, GPU or not. ~2 hrs.*

- Why **vLLM** for production: PagedAttention, continuous batching, ~3x throughput over Ollama under load
- **CPU track (universal):** run vLLM entirely in a container to learn the OpenAI server, batching, and quantization mechanics on any laptop — anchored on the proven **`vllm-cpu-example`** (SmolLM2 135M/360M/1.7B, resource presets, the NUMA-node patch, and Apple Silicon/Intel thread tuning)
- **GPU track (throughput):** the `vllm/vllm-openai` image with the NVIDIA Container Toolkit; **safetensors**; **TGI** as an alternative
- **Quantization** in practice: AWQ vs GPTQ vs **FP8** — the accuracy/throughput trade-off
- Operational gotchas: `--ipc=host`, shared memory, VRAM sizing, and the CPU thread/`KVCACHE` tuning that keeps a laptop responsive
- **Hands-on:** Everyone runs the CPU vLLM stack (with a Gradio/curl client) and hits it from the Docs Assistant; GPU-equipped learners then run the GPU image and **benchmark CPU vs GPU vs Ollama**

### Module 3B *(Optional, GPU-gated)*: Customizing Models with LoRA / QLoRA in Containers

*Make the model *yours* — reproducibly. ~1.5–2 hrs. Best when the cohort cares about model customization; can extend the program toward 2.5 days or swap in for lighter multi-agent depth.*

- When to fine-tune vs RAG vs prompt — and why **LoRA/QLoRA** (parameter-efficient) is the practical choice
- Open-source toolchain: **Axolotl** (YAML-driven, ships a Docker image), **Unsloth** (fast, low-VRAM), **TRL/PEFT**, LLaMA-Factory
- **The same GPU reality applies:** containerized QLoRA needs **NVIDIA** (Windows WSL2 or a cloud GPU VM) — e.g., a 7B model QLoRA fits in ~24 GB. On **Apple Silicon**, fine-tune **natively with MLX-LM** (unified memory) since CUDA tools (bitsandbytes/PEFT) don't run in Mac containers
- Reproducibility is the point: a frozen training container = a repeatable run
- The output is a small **LoRA adapter** — which then plugs into serving (Ollama/vLLM load adapters) and packaging (bundled in a ModelKit)
- **Hands-on:** Run a small QLoRA fine-tune of Acme's model on a support-ticket dataset — in a container on NVIDIA/cloud, or natively via MLX on Mac — then serve the adapter and confirm the behavior change. Feeds directly into Module 4

### Module 4: Packaging & Distributing Models as OCI Artifacts (KitOps)

*Ship models like images, on any registry. ~1.5 hrs.*

- Why models belong in **OCI artifacts** — versioned, layered, registry-native
- **KitOps / ModelKit** (CNCF): bundle model + **LoRA adapter (from M3B)** + config + prompts into one `ModelKit`; **ORAS** for low-level control
- Selective pull (grab weights without the dataset); works with Docker Hub, GHCR, Quay, Harbor, Artifactory
- Contrast with `docker model package` (Docker-specific) — why the CNCF path is portable
- **Hands-on:** Package the Docs Assistant's tuned model + prompt config as a ModelKit, push to a registry, then pull and run it on a clean environment to prove portability

---

## Day 2 — RAG → Agentic RAG → Multi-Agent, then Ship *(Steps 4–8)*

### Module 5: Step 4 — The Docs Assistant with Naive RAG

*From a model to a real application. ~1.5 hrs.*

- Anatomy of a GenAI app: LLM endpoint + **embedding model** + **vector DB** + application
- Open-source vector stores in containers: **ChromaDB** (lightest, default for the ≤8 GB budget) with **Qdrant / pgvector** as scale-up options
- The **naive RAG** pipeline: ingest → chunk → embed → retrieve → generate; wiring via environment variables, portable across runtimes
- **Teaching move — "Learning Mode":** visualize the pipeline live (query embedding → similarity search → context → generation, with timings) so learners *see* RAG, not just run it
- Where naive RAG breaks down (weak queries, wrong chunks, no follow-up) — motivating the next step
- **Compose, authored by hand:** learners **write the `compose.yaml` service by service** — model → embeddings → ChromaDB → app — understanding each block, not pasting a finished file
- **Hands-on:** Guided by the proven **`lightweight-genai-stack`** — ingest Acme's docs and stand up the **RAG Docs Assistant** (Ollama/`tinyllama`–`qwen3:4b` + `nomic-embed-text` + ChromaDB + Streamlit) in **6–8 GB**, running on Colima / OrbStack / Rancher Desktop

### Module 6: Step 5 — The Declarative Agent (Agentic RAG + Skills + Tools)

*Define the agent — don't hand-code it. ~2 hrs.*

- The modern shape of an agent in 2026: **AGENTS.md** (instructions) + **SOUL.md** (identity/behavior) + **Agent Skills (SKILL.md)** + **MCP tools** + **guardrails** — minimal glue code
- Declarative vs framework, decided up front: when "the agent *is* markdown + skills + tools" is enough vs. when you need an orchestration framework (that's M7)
- **Agentic RAG as a skill:** the agent decides *whether* and *what* to retrieve — query rewriting, source routing, multi-hop, self-correction — vs. naive retrieve-then-generate
- **Real tools through an MCP Gateway:** wire real MCP servers — **web search (DuckDuckGo)**, **GitHub**, **filesystem / HTTP / DB** — each as an **isolated container**, aggregated behind **ToolHive** (its virtual-MCP endpoint, per-request Cedar policy, no local credentials, no Docker Desktop internals)
- **Two ways learners will actually run MCP:** (1) **in the IDE** — configuring MCP servers in **VS Code** for dev-time use (reusing the popular "Configuring MCPs with VS Code" lab); (2) **in the stack** — behind the **ToolHive** gateway as the default; **supergateway** shown only as the minimal stdio→SSE bridge (what the legacy lab used) so learners understand the upgrade
- **Guardrails** (input/output validation, tool-use approval) and **memory** (short- and long-term)
- Why this is a container story: the agent's AGENTS.md/SOUL.md + skills + MCP config ship *inside* a container (and bundle into a ModelKit)
- **Compose grows:** learners **add the ToolHive gateway + tool services to the same `compose.yaml` by hand**, extending Day 1's file rather than starting over
- **Hands-on:** Build the **Support Agent** declaratively — an `AGENTS.md` + `SOUL.md`, an Agentic-RAG **skill** over Acme's docs, ToolHive-managed MCP tools, and a guardrail — running in a container that resolves a failing ticket with a safe action. *Almost no framework code.*

### Module 7: Step 6 — Multi-Agent (Declarative Crew, Orchestration When Needed)

*Grow a team, portably. ~2 hrs.*

- Why multi-agent: specialization, separation of concerns, review loops — and when a single declarative agent is already enough
- **Two ways to go multi-agent:** (1) **declarative** — multiple agent profiles, each its own SOUL.md + skills sharing one model (Hermes-style); the default. (2) **Orchestration framework** — **LangGraph** (supervisor/graph, checkpointing, audit trails) when you need deterministic control; **CrewAI** as a role-based alternative
- How the standards converge: skills + MCP tools + guardrails are the same whether declarative or framework-driven — you're swapping the *orchestrator*, not the tools
- Wiring the crew with the **Compose Spec**: each agent a lightweight service sharing one model endpoint + ToolHive tools + vector memory — same file under `docker compose` / `podman compose` / `nerdctl compose`
- **Reuse + upgrade:** start from your proven **`compose-for-agents/crew-ai`** lab (CrewAI: Analyst → Strategist → Content Creator + MCP web search) and **make it portable** — swap the Docker-proprietary `models:`/DMR binding for a plain Ollama/vLLM service and **upgrade its supergateway bridge to the ToolHive gateway** (real container isolation + policy), so it runs on Colima/Rancher/Podman
- **Compose completes:** learners **add each agent as its own service** to the growing `compose.yaml` (all sharing one model endpoint) — the finished file now tells the whole story end to end
- **Hands-on:** Grow the agent into the **Incident Crew** (Triage → Investigator → Fixer → Reviewer) — built **declaratively** as agent profiles/skills, with **CrewAI** as the concrete framework example and **LangGraph** optional for a deterministic review/approval gate — reusing the Agentic-RAG assistant as a shared knowledge tool, launched with one command

### Module 8: Securing & Governing AI Workloads (Open Source)

*Make the crew safe to ship. ~2 hrs.*

- **Sandboxing** agent, tool, and generated-code execution in ephemeral/isolated containers (gVisor, ToolHive's per-server isolation)
- Supply chain with open tools: **Syft** (SBOM) → **Grype/Trivy** (scan) → **Cosign** (sign & verify) for model and agent images
- Hardening: least privilege, read-only rootfs, health checks, secrets handling
- **Guardrails & evaluation:** input/output guardrails, human-in-the-loop, and lightweight **evals + tracing/observability** for the crew (open-source options)
- **Governance without a vendor:** policy on what agents may reach, which credentials and MCP tools they may use
- **Hands-on:** Add a guardrail and a small eval, generate + sign an SBOM for the crew's images, scan and fix a CVE, sandbox the Fixer's code-execution tool, and wire a **GitHub Actions** pipeline that builds → scans → signs → serves

### Final Capstone: Ship the Acme AI Support Platform End-to-End *(Steps 7–8)*

*Guided integration, runs on any runtime. ~1.5 hrs.*

1. **Serve** the model (Ollama native on Mac, or vLLM-in-container CPU/GPU)
2. **Run** the full **Incident Crew** — multi-agent, MCP tools via ToolHive, Docs Assistant as shared knowledge
3. **Package** the model as a **ModelKit** and push to a registry
4. **Secure** it — SBOM + scan + sign, sandboxed tool execution
5. **Ship** it — a CI pipeline that builds, scans, signs, and publishes
6. *Portability proof:* swap the runtime (Colima ↔ Rancher ↔ OrbStack) and re-run unchanged

---

## Suggested Time Allocation

| Block | Content | Approx. |
| --- | --- | --- |
| Day 1 AM | M1 + M2 | 3.25 hrs |
| Day 1 PM | M3 + M4 | 3.5 hrs |
| Day 2 AM | M5 + M6 | 3.5 hrs |
| Day 2 PM | M7 + M8 + Capstone | 5.5 hrs |
| *Optional* | M3B (LoRA/QLoRA) | +1.5–2 hrs — extends toward 2.5 days, or swaps in for a customization-focused cohort |

---

## Open Design Questions (for the lab build)

- Standardize on which 2–3 models? (Suggest `gpt-oss` + Qwen3 quantized — run well on Apple Silicon and modest NVIDIA, and are small enough for the CPU-vLLM lab.)
- Default vector DB for the Docs Assistant — **Qdrant** vs **pgvector**?
- Declarative agent runtime to standardize on for M6/M7 — **Hermes Agent** (SOUL.md + skills + profiles) vs a lighter skills-runner? And confirm **LangGraph** as the deterministic-orchestration option introduced in M7.
- The Acme domain — do we use a real open docs set (e.g., a popular OSS project's docs) or a small synthetic runbook corpus for the RAG labs?
- Which container registry to standardize instructions on — Docker Hub, GHCR, or Quay?