# Course Introduction — Containers for GenAI & Agentic AI

## Recommended video structure

| # | Video title | Format | Estimated duration | Central idea |
|---|-------------|--------|--------------------|--------------|
| 1 | Welcome — What You'll Build and Why | Talking head | 2 min | The course builds one system, module by module, on open standards |
| 2 | The Build Ladder — From a Bare Model Call to a Shipped Multi-Agent Platform | Slides + voiceover | 5 min | Two connected use cases, walked module by module |
| 3 | The 16 GB Budget — Running Every Lab Without a GPU Server | Slides + voiceover | 4 min | How the labs stay small, plus what you need before you start |
| 4 | Before You Start — Container-Native, Not Docker-Native | Slides + voiceover | 2 min | The one design principle behind the whole course, bridging into Setup |

## Video 1: Welcome — What You'll Build and Why

**Format:** Talking head
**Estimated duration:** 2 minutes
**Learning objective:** By the end, learners can explain what the course builds and why it is organized as one growing system.

### Narration script

Hello, and welcome to Containers for GenAI and Agentic AI — the open source way.

Let's say you've built a small AI demo before. You called a model, you got a response back, and it worked fine on your laptop. But the moment you try to actually ship that as a product — something a team can run, scale, and trust — you run into a completely different set of problems. How do you serve the model so more than one request can hit it at once? How do you package it so someone else can run the exact same thing you built? And once you move from a single model call to an agent, or a crew of agents working together, how do you keep the whole thing inside a laptop you already own?

That is exactly what this course builds, one module at a time. You are not going to do eight disconnected labs. You are going to build one system — a Docs Assistant first, and then a Support Agent that grows into a full Incident Crew — and every module adds one real piece: serving, packaging, retrieval, agent skills, multi-agent coordination, and finally security and shipping.

And here is the one design decision that shapes everything: this course is built on the open OCI standard and the Compose spec, not on any one vendor's tool. So by the end, you will be able to build, package, and ship an AI system that runs identically on any container runtime you choose.

Let's get started.

### Suggested visuals / slide beats

1. Title card — course name, author, duration, level.
2. The two use cases side by side (Docs Assistant → Incident Crew), with an arrow showing the tool-boundary connection.
3. Closing card — "container-native, not Docker-native" as the one line to remember.

---

## Video 2: The Build Ladder — From a Bare Model Call to a Shipped Multi-Agent Platform

**Format:** Slides + voiceover
**Estimated duration:** 5 minutes
**Learning objective:** By the end, learners can name both use cases, explain the intelligence progression between them, and map each module to what it adds.

### Narration script

In the last video I told you that this course builds one system, one module at a time. Now let's look at exactly what that system is, and how it grows.

There are two connected use cases here, and they are not separate projects — the second one actually uses the first one as a tool. Let's start with the first.

Use Case A is the Docs Assistant. On Day 1, you take a set of runbooks from a fictional company, Acme Engineering, and turn them into a retrieval-augmented assistant, or what is also called as a RAG system. It is containerized from the start, so it is portable and fully open source, and it is the foundation everything else in Day 2 builds on top of.

Use Case B is the Support Agent, and it grows into what we call the Incident Crew. On Day 2, you build a separate agentic system, and this agent uses the Docs Assistant you already built as one of its tools. It starts as a single agent that can decide, on its own, whether it needs to retrieve information — that is what makes it Agentic RAG, rather than the naive version you built on Day 1. And then it grows further, from one agent into a full crew of agents working together. The two use cases connect at exactly one point, the tool boundary, so you get to see clearly when each pattern actually earns its keep, instead of just being told about it.

Now, why this particular order? Because it mirrors how teams actually adopt AI in the real world. You would rarely jump straight to a multi-agent crew. Teams usually move from naive RAG, to agentic RAG, to a tool-using agent, and only then to a multi-agent crew — and each pattern gets introduced only when it becomes necessary, not as some abstract theory you memorize upfront.

Let's now walk the actual build ladder, step by step. In Module 1, you set up the runtime and get a model responding to a basic call — that is container-native serving. Module 2 turns that into a proper model endpoint, one that is OpenAI-compatible, so you would learn model serving and how to swap engines underneath it. Module 3 scales that same endpoint for throughput, using vLLM, batching, and quantization. Module 3B is optional, and it is where you build a customized model adapter using LoRA or QLoRA fine-tuning, all inside containers. Module 4 takes the model you have been serving and makes it versioned and distributable, using OCI and ModelKit packaging.

Then Module 5 is where the Docs Assistant actually comes together — ingest, embed, retrieve, and generate, that is naive RAG in practice. Module 6 turns that into the Support Agent, using an AGENTS.md file, Agent Skills, and MCP tools — that is your first agentic system. Module 7 grows it into the Incident Crew, using declarative profiles and LangGraph orchestration. Module 8 hardens the whole platform with guardrails, an SBOM, scanning, signing, and evaluation. And the Capstone is where you ship it — a real end-to-end CI pipeline, and a platform that stays portable across runtimes.

That is the full ladder. Every step assumes only the step before it, and by the end, you will have built and shipped the whole thing yourself.

### Suggested visuals / slide beats

1. Two-panel diagram: Use Case A (Docs Assistant) and Use Case B (Support Agent → Incident Crew), joined at a labeled "tool boundary".
2. The intelligence progression as a staircase: Naive RAG → Agentic RAG → tool-using agent → multi-agent crew.
3. The full build-ladder table, module 1 through Capstone, revealed row by row as each is narrated.

---

## Video 3: The 16 GB Budget — Running Every Lab Without a GPU Server

**Format:** Slides + voiceover
**Estimated duration:** 4 minutes
**Learning objective:** By the end, learners can explain the five design choices that keep every lab inside a 16 GB laptop, and can check they have every prerequisite in place.

### Narration script

Now here's a question you might be asking already: do I need a GPU server, or some expensive cloud setup, to actually do these labs? And the answer is no. Every lab in this course is engineered to run on a sixteen gigabyte Apple Silicon or Windows laptop, without your machine grinding to a halt.

Let's look at how that is actually possible, because it comes down to a few deliberate design choices, not luck.

First, is the model size. You would only use small, quantized models — one billion to four billion parameters, in a format called Q4 — models like Qwen3 1.7B or Llama 3.2 3B. These are small enough to run comfortably on a laptop, and quantization means the model's numbers are stored in a more compact form, so it takes up less memory without losing much accuracy.

Second, is a shared model endpoint. Every component you build — the RAG app, the agent, the crew — points at the same running model server. You would never spin up one model per agent, because that is exactly what would blow past your memory budget fast.

Third, are resource caps in your Compose file. Every service gets an explicit memory limit and CPU limit, and each module's profile only starts the services that step actually needs.

Fourth, is a build-up, tear-down discipline. Each module starts from where the previous one left off, and stops any services it no longer needs, so your peak memory usage stays flat instead of climbing module after module.

And fifth, the genuinely heavy labs — the vLLM GPU benchmark, and the QLoRA fine-tune — are opt-in. They have CPU and tiny-model paths for your laptop, and cloud VM fallbacks if you want to try the full-size version.

Put all of that together, and your target peak footprint across any lab is about four to six gigabytes of RAM, running two to three containers at a time.

Before you start, here is what you would need in place. On the knowledge side: you should be comfortable with basic container commands — build, run, volumes, networks — and with the Compose file format. You should know Git and GitHub, and the basic ideas behind CI/CD. You should be comfortable on the command line, on macOS or Windows. Basic Python helps, but you do not need any machine learning background at all.

On the system side, all free and open source: a container runtime — OrbStack, Colima, Rancher Desktop, or Podman, Docker Desktop is optional. Apple Silicon, M1 through M4, or Windows 11 with WSL2 is recommended, though an Intel Mac would work fine for the lighter labs. Ollama installed natively, for GPU-accelerated serving on Mac. Sixteen gigabytes of RAM at minimum, four cores, and thirty gigabytes of free disk. And VS Code, an active GitHub account, and an account on a container registry — Docker Hub, GHCR, or Quay.

### Suggested visuals / slide beats

1. A memory-budget bar filling up module by module, capped at 4–6 GB, with the five design choices as labels along the way.
2. Two-column checklist: Knowledge prerequisites | System prerequisites.
3. Closing card: "Target peak footprint: 4–6 GB RAM, 2–3 containers."

---

## Video 4: Before You Start — Container-Native, Not Docker-Native

**Format:** Slides + voiceover
**Estimated duration:** 2 minutes
**Learning objective:** By the end, learners can state the course's one design principle and know where to go next.

### Narration script

Before you jump into Module 1, there is one design principle you need to know, because it shapes every single lab in this course.

Docker Desktop is now paid for larger organizations — if your company has more than two hundred fifty staff, or more than ten million dollars in revenue, you would need a paid license just to keep using it. And that single pricing change broke an assumption a lot of teams had been quietly relying on for years: that container basically means Docker.

So this course is built on the OCI standard and the Compose spec instead — the actual open standards underneath containers, not any one vendor's product. And that is exactly why the same lab you run on Colima, or OrbStack, or Rancher Desktop, or Podman, would also run identically on Docker Desktop if that is what you already have. You are learning container-native, not Docker-native.

That is the one idea to carry into every module from here. Now let's get your environment set up, so you are ready for Module 1.

### Suggested visuals / slide beats

1. Old assumption crossed out ("container = Docker Desktop") next to the new one ("container = the open OCI standard").
2. The same container icon shown running unchanged on four runtime logos: Colima, OrbStack, Rancher Desktop, Podman.
3. Closing card pointing to Setup: Prerequisites.

---

## Coverage map

| Source idea | Video | Treatment |
|-------------|-------|-----------|
| Course framing (one system, one module at a time, 16 GB laptop, open source) | 1 | Explained |
| Use Case A — Docs Assistant (Naive RAG) | 2 | Explained |
| Use Case B — Support Agent → Incident Crew (Agentic) | 2 | Explained |
| Intelligence progression (Naive RAG → Agentic RAG → tool-using agent → multi-agent crew) | 2 | Explained |
| Build ladder table, all 9 rows (M1–Capstone) | 2 | Explained |
| 16 GB budget — five design choices (model size, shared endpoint, resource caps, build-up/tear-down, opt-in heavy labs) | 3 | Explained |
| Target peak footprint (4–6 GB, 2–3 containers) | 3 | Explained |
| Prerequisites — knowledge | 3 | Explained |
| Prerequisites — system | 3 | Explained |
| Day 1 / Day 2 program-at-a-glance table | 2 | Explained (folded into the build-ladder walk-through — same module groupings, not repeated as a separate table) |
| The one design principle (Docker Desktop pricing, OCI + Compose spec, container-native not Docker-native) | 4 | Explained |
| Bridge to Setup: Prerequisites | 4 | Explained |

## Verification flags

- Docker Desktop's paid-tier threshold ("250 staff or $10M revenue") is stated as of the source lesson's writing — Docker's licensing terms have changed before and could change again; re-check before recording if this module is re-recorded far from its authoring date.
- Named model versions (Qwen3-1.7B, Llama 3.2 3B) are current defaults in the source — confirm they still match `course.config.json` / the labs before recording, in case a later module swapped the default model.
