# Module 1: Container-Native GenAI — Video Narration Package

## Recommended video structure

| # | Video title | Format | Estimated duration | Central idea |
|---|-------------|--------|--------------------|--------------|
| 1 | Module 1 Introduction — Why Container-Native, Not Docker-Native | Talking head | 2 min | Why the open standard matters now, and what this module builds |
| 2 | OCI and the Compose Spec — The Open Standard Behind Every Container Tool | Slides + voiceover | 5 min | Container-native vs Docker-native; the pricing change that broke an old assumption |
| 3 | What Containers Actually Buy Your AI Stack | Slides + voiceover | 4 min | Package, serve, isolate, ship — the four jobs a container does for an AI system |
| 4 | The Apple Silicon GPU Reality — Why Your Model Server Must Run Native | Slides + voiceover | 6 min | Hypervisor.framework exposes no GPU to containers; native model server + containerized app is the only pattern that works |
| 5 | Declarative Agents vs Orchestration — The 2026 Map and the Acme Build Ladder | Slides + voiceover | 6 min | AGENTS.md vs LangGraph, and the one growing system you build module by module |
| 6 | The OpenAI-Compatible Endpoint — One Socket, Any Engine | Slides + voiceover | 4 min | `/v1/chat/completions` as a universal contract you never have to rewrite |
| 7 | Module 1 Summary and Lab Bridge | Slides + voiceover | 2 min | What you now understand, and what the lab is about to prove with your own hands |

---

## Video 1: Module 1 Introduction — Why Container-Native, Not Docker-Native

**Format:** Talking head
**Estimated duration:** 2 minutes
**Learning objective:** By the end, learners understand why this course teaches container-native rather than Docker-native, and what Module 1 will get them doing.

### Narration script

Hello and welcome back. In the last video, we looked at the big picture of this course, the eight modules and the capstone, and the one system you are going to build piece by piece. Now let's zoom into Module 1.

Here is something that would have surprised you a year or two back. Docker Desktop, the tool most of us reach for by habit, is now a paid product for any organization with more than two hundred and fifty employees, or ten million dollars in revenue. And that one pricing change quietly broke an assumption a lot of teams had been making without even noticing it, that "container" simply meant "Docker Desktop."

Well, it never meant only that. Underneath Docker sits an open standard, the OCI image format and the Compose Spec, and every serious container tool, Colima, OrbStack, Rancher Desktop, Podman, speaks that exact same standard. So in this module, we are not going to teach you Docker. We are going to teach you container-native, and which tool you personally pick after that is entirely your call.

You will also get the one practical lesson that decides whether every single lab in this course runs fast or painfully slow on a Mac, and you will connect your first container to a natively running model and get a real response back, with your own hands.

So this module gives you five ideas that carry the rest of the course. First, container-native beats Docker-native, thanks to OCI and the Compose Spec. Second, what containers buy an AI stack: package, serve, isolate, and ship. Third, the Apple Silicon GPU limit, and the fix, which is to run the model natively. Fourth, the OpenAI-compatible endpoint, one contract with a swappable engine behind it. And fifth, the 2026 map of declarative agents and orchestration, plus the Acme build ladder you will climb.

### Suggested visuals / slide beats

1. Title card, Module 1: Container-Native GenAI
2. Five ideas as numbered rows (slide 2)
3. Docker Desktop pricing headline, crossed out over a "container = Docker" equation
4. OCI + Compose Spec logo row: Colima, OrbStack, Rancher Desktop, Podman, all running the same compose.yaml
5. Closing frame: "Next — the standard that makes this possible"

---

## Video 2: OCI and the Compose Spec — The Open Standard Behind Every Container Tool

**Format:** Slides + voiceover
**Estimated duration:** 5 minutes
**Learning objective:** By the end, learners can explain why "container-native" is a more durable skill than "Docker-native," and name the open standards that make it so.

### Narration script

Let's say you packed something valuable into a steel shipping container. Would it matter which truck picks it up, or which ship carries it across the ocean, or which crane lifts it onto the dock? Not really. The box has a standard size and standard locking points, and as long as the carrier respects that standard, your cargo travels safely, no matter who is driving.

An OCI image works exactly the same way. Your application code, your model server, your embedding pipeline, all of that is the cargo. The OCI image format is the box. And Docker, Colima, OrbStack, and Rancher Desktop are just different carriers moving that same box. The shipper, that is you, does not really care which carrier shows up, as long as the box opens the same way every time.

Now here is the interesting part. For years, most of us never had to think about this distinction, because Docker Desktop was free, and it was everywhere, so "container" and "Docker Desktop" felt like the same word. Then Docker changed its pricing for larger organizations, and a lot of teams discovered, the hard way, that they had built their entire workflow around one company's desktop app, not around the actual standard underneath it.

But the standard was always there, and it was always open. The OCI image format defines how a container image is built and shipped. The Compose Spec defines how you describe a multi-container application in a single `compose.yaml` file. And every serious runtime, Colima, OrbStack, Rancher Desktop, Podman Desktop, implements both of these exactly the same way. So the same `compose.yaml` file runs, without a single change, on any of them.

That is why this course is built on the open standard, and not on any one vendor's desktop app. We are going to use Rancher Desktop to validate every lab you see in this course, because it is free, cross-platform, and predictable. But every command you type will work, without any changes, on Colima, OrbStack, or Podman Desktop as well. Learn container-native, and the specific carrier becomes a preference, not a dependency.

### Suggested visuals / slide beats

1. Shipping-container analogy: one box, four different carriers (truck, ship, crane, and a generic runtime icon)
2. "The old assumption" crossed out: container = Docker Desktop
3. Diagram: compose.yaml (Compose Spec, open standard) fanning out to Colima, OrbStack, Rancher Desktop, Podman Desktop, all converging on "Your GenAI app, identical OCI containers"
4. Takeaway: one compose.yaml, four runtimes, the same result

---

## Video 3: What Containers Actually Buy Your AI Stack

**Format:** Slides + voiceover
**Estimated duration:** 4 minutes
**Learning objective:** By the end, learners can name and explain the four practical jobs a container does for an AI system.

### Narration script

Now that we know what a container actually is, let's ask a more useful question. What does a container actually buy you, when you are building an AI system with a lot of moving parts?

Think of a container as a tightly sealed shipping crate. The model server goes into one crate. The embedding pipeline goes into another. The vector database gets its own crate. The agent gets its own crate too. And each one of these crates can be opened on any machine, and it behaves exactly the same way it did on your laptop.

In practice, that sealed-crate idea gives an AI system four things, and let's walk through all four one at a time.

First is package. You lock in your Python version, your driver versions, your library versions, all of it, inside the crate. So "it works on my machine" quietly becomes "it works on every machine," because every machine is now running the exact same crate.

Second is serve. Your embedding service, your vector database, your API gateway, they all run behind predictable ports, without cluttering up your actual laptop with a dozen different background processes you have to remember to manage.

Third is isolate. Let's say you have two different AI frameworks with completely conflicting library versions. Instead of juggling virtual environments and hoping nothing breaks, each framework simply lives in its own crate, and they never even know the other one exists.

And fourth is ship. Once your crate is built, you push it to any OCI registry, GHCR, Docker Hub, Quay, and then you can pull it and run it on any other machine, or any cloud VM, without rebuilding anything.

Here is why this matters for you specifically in this course. Every single module adds one more service to a growing `compose.yaml` file. By the time you reach the Capstone, you will have written the entire AI stack line by line, and you will actually understand every block in it, because you are the one who wrote it.

### Suggested visuals / slide beats

1. Divider: four sealed crates stacked in a warehouse, a forklift beside them (slide 6)
2. Four boxes: Package, Serve, Isolate, Ship, one plain-language line each (slide 7)
3. The growing `compose.yaml` is spoken only here; the staircase appears later on slide 16

---

## Video 4: The Apple Silicon GPU Reality — Why Your Model Server Must Run Native

**Format:** Slides + voiceover
**Estimated duration:** 6 minutes
**Learning objective:** By the end, learners can explain why containerized model inference is slow on Apple Silicon, and can describe the native-server-plus-containerized-app pattern that fixes it.

### Narration script

This next one is, honestly, the most important practical lesson in the entire course. Get this wrong, and every single lab you run for the rest of this course would run three to six times slower than it should, and you may not even understand why.

Let's say you are staying at an office building where every guest room looks completely wired for electricity, sockets on the wall, everything in place. But when you actually plug something in, nothing happens. It turns out the building's real electrical system, the wiring, the power, all of it, sits right there behind the wall, but the building manager never actually connected the guest rooms to it. So the guests, that is your containers, quietly fall back to battery power, that is the CPU, without anyone telling you.

Now here is the technical reality behind that story. On a Mac, Apple's own virtualization layer, called Hypervisor.framework, exposes no virtual GPU at all to whatever is running inside it. A container on your Mac actually runs inside a small Linux virtual machine, and that virtual machine has no access to the Metal GPU, or to the Apple Neural Engine, no matter how powerful your actual laptop is.

So if a model runs inside a container on a Mac, it falls back to the CPU, and inference would run three to six times slower than it would if it ran natively. That is not a small difference. That is the difference between a lab that feels instant, and a lab that feels like it is stuck.

So what is the pattern that actually works everywhere on a Mac? You run the model server natively, outside any container, because a tool like Ollama uses Metal and unified memory directly when it runs as a native process. Then you containerize everything else, your app, your agent, your vector database, and you connect the two through one special address, `host.docker.internal:11434`. Every major container runtime resolves that address back to your actual host machine, and that is the bridge between the containerized world and your natively running model.

Now, one useful side note. If you are on Windows with WSL2 and an NVIDIA GPU, this particular limitation does not apply to you, because the NVIDIA Container Toolkit does pass the GPU directly into containers there. So on that setup, the model server actually can run inside a container. But on a Mac, native is the only right answer, and that is exactly the pattern you will use in every remaining lab in this course.

### Suggested visuals / slide beats

1. Divider: a hotel corridor with unplugged appliances in open guest rooms (slide 8)
2. Guest rooms with no power outlets: the Metal GPU is not wired into the containers, so they fall back to CPU (slide 9)
3. Diagram: macOS host with Ollama running natively (Metal-accelerated, port 11434) beside a container runtime box holding the app, agent, and vector DB containers, all pointing to host.docker.internal (slide 10)
4. The 3-6x slowdown and the Windows + WSL2 + NVIDIA exception are spoken only; no slide carries them

---

## Video 5: Declarative Agents vs Orchestration — The 2026 Map and the Acme Build Ladder

**Format:** Slides + voiceover
**Estimated duration:** 6 minutes
**Learning objective:** By the end, learners can describe the difference between declarative agents and orchestration frameworks, and can describe the running Acme case study they will build across the course.

### Narration script

Before we move further, let's take a quick look at where this course is actually heading, because Modules 5 through 7 are going to build two very different kinds of agent, and it helps to know the difference now.

A declarative agent, which you will build in Module 6, defines who the agent is and what tools it has access to, in plain files. That would be an `AGENTS.md` or a `SOUL.md`, plus a `SKILL.md`, plus its MCP tool connections. The runtime simply reads those files and executes them. This is the lightest approach you can take, and also the easiest one to maintain, because if you want to change how the agent behaves, you just change a markdown file.

An orchestration framework, and LangGraph is the current standard here, which you will build in Module 7, adds deterministic control flow on top of that. That means explicit state machines, branching logic, retries, and human-in-the-loop checkpoints. You would reach for this when a task needs a guaranteed order of steps, one that a declarative agent cannot reliably work out entirely on its own.

So here is the rule to actually remember, and it is a simple one. Start declarative, and add orchestration only when your task has hard sequencing requirements that you genuinely cannot express in plain tool descriptions. You will build both patterns yourself in Modules 6 and 7, so you get to feel that trade-off directly, instead of just reading about it.

Now, all of this happens inside one running story, so let's set that up. Across this entire course, you build one real system for a fictional company called Acme Engineering. Their team has runbooks, post-mortems, and architecture documents piling up in a shared drive, and honestly, nobody on their team actually reads any of it. You are going to build two connected AI tools to fix that.

The first is the Docs Assistant, which you build on Day 1. That is retrieval-augmented question answering over Acme's runbooks. Let's say a question comes in, then the relevant documents get retrieved, and then an answer comes out.

The second is the Support Agent, which grows into the full Incident Crew, and you build this on Day 2. This is an agentic system that actually uses the Docs Assistant as one of its own tools, and it grows from a single agent all the way into a full multi-agent incident-response crew.

Every module you complete adds exactly one step to this one growing system, starting from a runtime and a model responding to a call in this very module, all the way to a fully hardened, shipped platform by the Capstone. You hand-author the compose.yaml one service block at a time, module by module, so by the end, it is the full production stack, and you wrote every single line of it yourself.

### Suggested visuals / slide beats

1. Two-panel comparison: Declarative Agent (AGENTS.md, SOUL.md, SKILL.md, MCP) vs Orchestration Framework (LangGraph, state machine, branching, retries), subtitle "Start declarative, add orchestration when needed" (slide 12)
2. Anatomy of a declarative agent: AGENTS.md / SOUL.md, SKILL.md, MCP tool connections, and the agent runtime that reads the files and runs them (slide 13)
3. Acme: runbooks feed the Day 1 Docs Assistant, which the Day 2 Incident Crew uses as a tool (slide 15)
4. Build-ladder staircase: M1 model to M7 crew, then a tall "M8 harden · Capstone" bar (slide 16)

---

## Video 6: The OpenAI-Compatible Endpoint — One Socket, Any Engine

**Format:** Slides + voiceover
**Estimated duration:** 4 minutes
**Learning objective:** By the end, learners can explain what the OpenAI-compatible endpoint is, and why it lets you swap model engines without changing application code.

### Narration script

Let's say you travel to a different country, and you carry an appliance with you. Different countries wire their actual power plants very differently behind the wall, but if the socket at the wall is a standard one, your appliance still works, no matter which country generated that electricity.

The OpenAI API works exactly the same way for your application code. Ollama, vLLM, LocalAI, and llama.cpp are all wired very differently behind the wall, but every one of them exposes the exact same standard socket, the `/v1/chat/completions` interface. So your application code never has to change when you swap out the engine sitting behind it.

Here is what that call actually looks like. You send a POST request to `/v1/chat/completions`, with a model name and a list of messages, and you get a response back. Our labs also add one field, `reasoning_effort` set to none. That is because `qwen3.5:2b` is a reasoning model, and it thinks before it answers by default. Module 2 explains why that matters. And here is the part that would genuinely surprise you the first time you see it work. That exact same call works, without a single change, against `localhost:11434`, which is Ollama running on your dev laptop, or against a vLLM service running on a production GPU VM, or even against `api.openai.com` itself, if you ever needed to fall back to OpenAI's own hosted models.

This shared contract is what lets you swap from a small two billion parameter development model, up to a full production-grade engine, without touching a single line of your application code. And every lab you run in this course, from Module 1 all the way to the Capstone, speaks this exact same request format.

### Suggested visuals / slide beats

1. Divider: one wall socket with many plugs and cords converging into it (slide 17)
2. Ollama, vLLM, and LocalAI · llama.cpp plug into one `/v1/chat/completions` socket; the app plugs in once and its code never changes (slide 18)
3. Footnote on slide 18: `qwen3.5:2b` thinks first, so the labs add `"reasoning_effort": "none"`
4. The request body and the three base URLs are spoken only; no slide shows them

---

## Video 7: Module 1 Summary and Lab Bridge

**Format:** Slides + voiceover
**Estimated duration:** 2 minutes
**Learning objective:** By the end, learners can summarize Module 1 in one pass, and understand exactly what the lab is about to prove.

### Narration script

So let's bring together everything we covered in this module. Container-native means the OCI image format and the Compose Spec, and Docker Desktop is now genuinely optional. Containers give an AI stack four things, package, serve, isolate, and ship. On Apple Silicon, your model server has to run natively, everything else gets containerized, and `host.docker.internal` is the bridge between the two. You start with declarative agents, and you only add orchestration for hard sequencing. And the OpenAI-compatible endpoint is one shared contract that lets you swap engines without touching your application code.

In the lab that follows, you are going to prove one specific piece of that with your own hands, the container-to-native-model wiring. You will spin up a small throwaway container, have it call your natively running Ollama, and get a real response back. Once you see that response land in your own terminal, everything we just talked about stops being theory, and starts being something you actually built.

I'll see you in the lab.

### Suggested visuals / slide beats

1. Lab bridge: a throwaway container calls `host.docker.internal:11434`, the native Ollama on the Metal GPU sends a real response back (slide 19). The deck has no summary table slide; the recap is spoken.

---

## Coverage map

| Source idea | Video | Treatment |
|---|---|---|
| Module goal / why container-native, why now | 1 | Explained |
| Five ideas that carry the course (deck slide 2) | 1 | Explained |
| Shipping-container analogy, OCI image format | 2 | Explained |
| Docker Desktop pricing change, broken assumption | 2 | Explained |
| Compose Spec, same compose.yaml across 4 runtimes | 2 | Explained |
| Package / Serve / Isolate / Ship | 3 | Explained |
| Growing compose.yaml across the course | 3 | Explained |
| Apple Silicon GPU reality, Hypervisor.framework | 4 | Explained |
| Office-building/electrical analogy | 4 | Explained |
| Native model server + host.docker.internal pattern | 4 | Explained |
| Windows/WSL2/NVIDIA exception | 4 | Explained |
| Declarative agents (AGENTS.md/SOUL.md/SKILL.md/MCP) | 5 | Explained |
| Orchestration frameworks (LangGraph) | 5 | Explained |
| Start-declarative rule | 5 | Explained |
| Acme Engineering use case (Docs Assistant, Incident Crew) | 5 | Explained |
| Module-by-module build ladder table | 5 | Explained (staircase visual, not the full table read aloud) |
| Wall-socket analogy, /v1/chat/completions | 6 | Explained |
| Reasoning model note: labs send `reasoning_effort` none (points to M2 §6) | 6 | Explained (brief) |
| Same call works across Ollama/vLLM/OpenAI | 6 | Explained |
| Summary table | 7 | Explained |
| Lab bridge (throwaway container calling native Ollama) | 7 | Explained |

No source section was omitted. The build-ladder table (section 5 of the lesson) is walked as a staircase visual with the two Acme use cases called out by name, rather than reading all nine table rows aloud — full detail stays on screen for reference.

## Verification flags

- Docker Desktop's paid-tier threshold (250 employees / $10M revenue) is a licensing term that can change; verify against Docker's current subscription terms before each cohort.
- The Windows/WSL2/NVIDIA Container Toolkit GPU pass-through claim is hardware- and driver-version-dependent; verify against the current toolkit release notes if teaching this section on a live NVIDIA rig.
