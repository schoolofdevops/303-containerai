# Capstone: Ship the Acme AI Support Platform

## Recommended video structure

| # | Video title | Format | Estimated duration | Central idea |
|---|-------------|--------|--------------------|--------------|
| 1 | Capstone — Bringing Eight Modules Together | Talking head | 2 min | Why this module exists and what it proves |
| 2 | The Acme AI Platform, One Piece at a Time | Slides + voiceover | 6 min | The dispatch-centre analogy and the container boundary |
| 3 | Running the Platform End to End | Slides + voiceover | 7 min | Walking Steps 0 through 7 as one continuous run |
| 4 | Why Nothing Changes When You Swap the Runtime | Slides + voiceover | 4 min | The five portability layers, proved live |
| 5 | What You Built, and Where You Can Take It | Talking head / Slides | 3 min | The ladder, the arc of intelligence, and the lab bridge |

## Video 1: Capstone — Bringing Eight Modules Together

**Format:** Talking head
**Estimated duration:** 2 minutes
**Learning objective:** By the end, learners understand what the capstone proves and why it is the natural close to the course.

### Narration script

Hello and welcome back. Over the last eight modules, you have built one piece at a time. You served a model, you wrapped it behind an OpenAI-compatible endpoint, you ran it on the CPU with vLLM, you packaged it into a ModelKit, you built a Docs Assistant with retrieval, you gave it a declarative agent that decides when to retrieve, you split that agent into a whole crew of specialists, and you scanned and signed the image before shipping it. Each of those was a self-contained lab, and each one worked on its own.

This capstone is where we stop treating them as separate labs and snap them together into one thing, the Acme AI Support Platform. You are not learning anything new about any individual piece here. What you are proving instead is that the pieces actually fit, that the model server, the vector store, the agent, the crew, and the supply chain tooling all wire up into a single running product, and that this product ships without a single change on whichever container runtime you happen to be using, Rancher Desktop, Colima, OrbStack, or Podman.

So by the end of this module, you will have run the full Acme platform end to end on your own machine, and you will have watched the same platform-check pass on more than one runtime, with nothing in your commands or your config changed. That is the whole promise of container-native, proven one last time, at the scale of a real product. Let's get started.

### Suggested visuals / slide beats

1. Title slide: the Acme AI Support Platform, course logo, "Module 9 — Capstone"
2. A simple ladder graphic, M1 through M8, each rung lighting up as it is named
3. Closing beat: the eight rungs merging into one platform box

---

## Video 2: The Acme AI Platform, One Piece at a Time

**Format:** Slides + voiceover
**Estimated duration:** 6 minutes
**Learning objective:** By the end, learners can explain the platform's architecture using the dispatch-centre analogy and state the one rule the whole course is built on.

### Narration script

In the last video, I talked about snapping eight modules together into one platform. Now let's actually look at what that platform is made of.

Let's say you are picturing a well-run emergency dispatch centre. There is one dispatcher sitting at the desk, and that dispatcher is our native Ollama model. Every team in the building has its own job and its own phone line into that desk, the Docs Assistant on one line, the Support Agent on another, the Incident Crew on a third, but all three lines ring the same dispatcher. The dispatcher itself never moves from that desk. Behind the dispatcher are filing cabinets, and that is ChromaDB, our semantic memory, organized by meaning rather than by alphabetical order. Next to the desk is a locked key cabinet, and that is ToolHive. Any agent that needs to reach an external tool has to sign out a key from that cabinet first, so no rogue process reaches into a tool unsupervised. And when a release is finally ready to go out, it gets sealed into a tamper-evident courier box, checked by a set of supply chain tools, and shipped out. That box is the ModelKit.

Now here's the important part, and this is the one rule the entire course has been building toward: the model stays native, and everything else runs in a container. Let's walk through why that rule holds the whole platform together.

On the host machine, running natively, you have Ollama on port 11434, serving qwen2.5:1.5b for chat and nomic-embed-text for embeddings. Everything else, the Docs Assistant, the Support Agent, the Incident Crew, ChromaDB, and ToolHive, runs inside containers, on whatever OCI runtime you have chosen. Each of those three apps reaches the native model the exact same way, at the address `host.docker.internal:11434`. That single address is what makes the whole wiring work, and it is not a Docker-specific trick. It resolves on Colima, it resolves on Rancher Desktop, it resolves on OrbStack, and it resolves on Podman, because it is part of the OCI runtime contract, not something one vendor invented.

On the packaging side, a separate flow runs alongside the live platform. The model gets sealed into a ModelKit, that is weights, config, and prompts in one signed artifact from Module 4. That artifact then goes through an SBOM, a vulnerability scan, and a signing step using Syft, Trivy, Grype, and Cosign from Module 8. And GitHub Actions is what runs that whole build, scan, and sign sequence automatically, every time you push.

So to summarize, you have three containerized apps, all talking to one native model over one fixed address, all sharing one vector store, all reaching tools through one locked gateway, and one packaging pipeline sealing and shipping the model on the side. That is the Acme AI Support Platform in one picture. In the next video, we are going to actually run every piece of it, end to end, on your own machine.

### Suggested visuals / slide beats

1. Dispatch-centre scene: dispatcher desk, three phone lines, filing cabinets, locked key cabinet, courier box
2. The Mermaid architecture diagram: host box (Ollama) versus container box (three apps + ChromaDB + ToolHive) versus supply-chain box (ModelKit, SBOM/scan/sign, CI)
3. Callout on `host.docker.internal:11434` with the four runtime names ticking past it
4. Closing recap slide: the one-line rule in large text — "the model stays native, everything else runs in a container"

---

## Video 3: Running the Platform End to End

**Format:** Slides + voiceover (with terminal/demo cutaways)
**Estimated duration:** 7 minutes
**Learning objective:** By the end, learners can narrate what each of the seven capstone steps proves, and run them in order themselves.

### Narration script

We just looked at the platform as a picture. Now let's actually bring it up, step by step, from `labs/capstone/`.

Before touching any module, you run a readiness check, `platform-check.sh`. It goes through four checks in order: is the container runtime reachable, is Ollama serving both the chat model and the embedding model, can a container actually reach that model over `host.docker.internal`, and are the packaging and supply chain tools, `kit`, `thv`, `syft`, `trivy`, `grype`, and `cosign`, all installed. Every single green tick there maps back to something you already built in an earlier module, and if you ever see a red cross, it tells you exactly which module to go back and fix.

With readiness confirmed, Step 1 is serving the model, which is already running natively if you followed Module 2, so there is nothing new to start here. Step 2 brings up the persistent part of the platform, ChromaDB and the Docs Assistant, from one consolidated compose file. This matters because each module's own compose file used to bind ChromaDB to the same port, so running them one after another would fail with a "container name already in use" error. The capstone compose file solves that by starting exactly one shared ChromaDB that all three apps use from here on. Once that is up, you can open the Docs Assistant in your browser, ask it how to restart the payments service, and you get back a grounded answer with the exact `kubectl` command, pulled straight from the Acme runbook, not guessed.

Step 3 runs the Support Agent, Aria, from Module 6, as a one-shot command against that same shared ChromaDB. Aria reads the question first and decides whether it actually needs to retrieve anything before answering, which is what makes this agentic RAG rather than naive RAG, the agent routes first, and only then acts. One thing worth calling out here: because the routing decision comes from a small model, `qwen2.5:1.5b`, the way you phrase the question actually matters. A vague question can cause it to skip retrieval and answer directly from a guess. So keep your questions close to how the runbook itself is phrased, and always check the decision marker in the output before you trust the answer.

Step 4 fires the Incident Crew from Module 7, again as a one-shot command, this time against a real incident description. Four specialized agents run one after another here: Triage classifies how serious the incident is, Investigator queries the runbook for the relevant procedure, Fixer proposes the exact command to run, and Reviewer either approves that command or escalates it to a human. And here's the part worth noticing: all four of those agents are still calling the one same native model endpoint. Specialization did not mean four separate models, it meant four separate roles talking to the same brain.

Steps 5 through 7 move from running the platform to shipping it. Step 5 packages the model weights from Module 4 into a ModelKit and pushes it to a registry. Step 6 secures the crew image from Module 7, building an SBOM with Syft, scanning it with Trivy and Grype, and signing it with Cosign, all against the local image, so nothing needs to leave your machine to do this. And Step 7 is what happens the moment you push to `main`: the GitHub Actions pipeline from Module 8 runs that same build, scan, and sign sequence automatically, and a failed scan blocks the push before a bad image ever reaches the registry.

So that is the full run, readiness check, serve, retrieve, route, coordinate, package, secure, and ship. Every one of those words maps to exactly one module you already completed. In the next video, we are going to prove that this entire sequence runs identically no matter which container runtime you are on.

### Suggested visuals / slide beats

1. `platform-check.sh` terminal output, four checks highlighted one at a time
2. Compose-up cutaway: `docker compose up -d chromadb genai-app`, then the Docs Assistant browser screenshot with a grounded answer
3. Aria's decision-marker output, `[decision: RETRIEVE ...]`, highlighted
4. Incident Crew pipeline diagram: Triage → Investigator → Fixer → Reviewer, one native model icon behind all four
5. Three-icon row for Steps 5–7: ModelKit seal, SBOM/scan/sign badges, CI pipeline arrow to GHCR
6. Closing beat: all seven steps as a single numbered strip, "readiness → serve → retrieve → route → coordinate → package → secure → ship"

---

## Video 4: Why Nothing Changes When You Swap the Runtime

**Format:** Slides + voiceover
**Estimated duration:** 4 minutes
**Learning objective:** By the end, learners can name the five things that make the platform portable and can verify that portability themselves.

### Narration script

We have now run the whole platform on one runtime. So the real question is, what happens if you switch to a different one? Let's look at why the answer is, nothing.

There are five things doing that work for you. First is the OCI image format itself, which means any compliant runtime can pull and run any image, because the specification defines the contract, not any one vendor. Second is the Compose Spec, an open standard, which means `compose.yaml` reads the same whether you are on Podman Compose, Rancher Desktop, OrbStack, or Colima. Third is `host.docker.internal`, which resolves to the host machine on all four of those runtimes, so the native model is always reachable at the same address no matter which one you picked. Fourth is the ModelKit itself, which is just an OCI artifact, so `kit push` and `kit pull` work against any OCI-compliant registry, with no lock-in to one vendor's registry. And fifth are the Cosign signatures, which get stored as OCI referrers, so they travel with the image across registries and can be verified by any Cosign client, again, not tied to one vendor.

If you want to actually verify this yourself rather than just take my word for it, stop Rancher Desktop, start Colima or OrbStack instead, and run `platform-check.sh` again. The output stays identical. Every one of Steps 1 through 7 runs without a single change. And that is the Module 1 principle you learned right at the start of this course, container-native, not runtime-native, still holding true at every layer of a full product, not just a single container.

One small note if you are on Podman specifically: `host.docker.internal` works out of the box on Rancher Desktop, OrbStack, and Colima, but on Podman you may need to add one line, `--add-host host.docker.internal:host-gateway`, to your service definitions, once. After that, every command you run stays exactly the same as on any other runtime.

### Suggested visuals / slide beats

1. Five-row table: OCI image format, Compose Spec, `host.docker.internal`, ModelKit, Cosign signatures, each with a one-line payoff
2. Split-screen or swap animation: Rancher Desktop logo transitioning to Colima logo, same terminal output underneath, unchanged
3. Podman callout card with the single `--add-host` flag

---

## Video 5: What You Built, and Where You Can Take It

**Format:** Talking head / Slides
**Estimated duration:** 3 minutes
**Learning objective:** By the end, learners can summarize the full course arc and identify how to reuse the platform for a second use case.

### Narration script

To summarize, you started this course with a single container making a raw call to a local model. And you are ending it with a signed, CI-shipped, multi-agent platform. Let's quickly walk the ladder you climbed to get here. Module 1 gave you the container-native pattern itself, the OCI image format, the Compose spec, and the `host.docker.internal` wiring. Module 2 gave you OpenAI-compatible serving, the wall socket that lets any app swap the model engine behind it without touching a line of code. Module 3 gave you production-grade serving on the CPU with vLLM, for machines without a GPU or Apple's Metal. Module 4 gave you the ModelKit, weights, config, and prompts sealed into one signed artifact. Module 5 gave you naive RAG, the Docs Assistant retrieving from your own runbooks. Module 6 gave you a declarative agent that adds a routing judgment and guardrails on top of that retrieval. Module 7 split that single agent into a crew, with specialization, separation of concerns, and a reviewer approval gate. And Module 8 gave you the supply chain, SBOM, vulnerability scanning, image signing, and a CI pipeline tying it all together.

Notice the shape of that progression, because it tells one coherent story. The Docs Assistant always retrieves, which is useful but wastes effort on questions that already have a known answer. The Support Agent decides when to retrieve, which makes it more efficient and more reliable, because it routes before it acts. And the Incident Crew splits the problem across specialized roles entirely, which is the only approach of the three that scales to a multi-step task, where each step carries a risk that one single agent cannot catch on its own. Naive RAG, to agentic RAG, to a crew, that is the arc every one of these platforms tends to follow as it matures.

And here is the part I want you to take away with you: none of this is tied to IT operations specifically. The same architecture, native Ollama, ChromaDB, a declarative agent, ToolHive as the MCP gateway, ModelKit packaging, and the Module 8 supply chain, applies to any domain that has a knowledge base and needs reliable, auditable answers. A code review assistant, a compliance checker, a customer onboarding guide, these are structurally the same platform. You would swap the Acme runbooks for your own documents, rename the agents, and adjust the guardrails, and the container wiring underneath would not change at all.

If your own use case ever needs a model trained on your own proprietary data rather than the public `qwen2.5:1.5b` we used throughout this course, the Module 3B extension covers LoRA and QLoRA fine-tuning, which produces a new GGUF file that packages straight into a ModelKit and ships through the same Module 8 pipeline. The wall socket stays exactly the same, you would just be swapping the power station behind it.

Now it's your turn. Open `labs/capstone`, run `platform-check.sh`, and take the whole platform through its paces yourself. I will see you in the next course.

### Suggested visuals / slide beats

1. Eight-rung ladder, each rung labelled with its module and its one contribution, building up rung by rung
2. Three-stage arc diagram: Naive RAG → Agentic RAG → Crew, with the one-line reason for each transition
3. "Same architecture, different domain" slide: Acme runbooks crossed out, replaced by code repo / compliance policy / onboarding doc icons
4. Closing credit slide with the lab-bridge call to action

---

## Coverage map

| Source idea | Video | Treatment |
|---|---|---|
| Capstone snaps 8 modules into one platform | 1 | Explained |
| Dispatch-centre analogy (dispatcher, filing cabinets, key cabinet, courier box) | 2 | Explained |
| Container boundary rule (model native, rest containerized) | 2 | Explained |
| Architecture diagram (host vs containers vs supply chain) | 2 | Explained |
| `host.docker.internal:11434`, runtime-agnostic | 2, 4 | Explained |
| Step 0 — platform-check.sh, four checks | 3 | Explained |
| Container X-Ray tool tip | 3 | Deferred (mentioned as a suggested visual/demo aside, not narrated in depth — optional live-tool, not core to the run) |
| Step 1 — serve model (M2/M3) | 3 | Explained |
| Step 2 — shared ChromaDB, port-conflict rationale | 3 | Explained |
| Step 3 — Support Agent, agentic RAG routing, small-model phrasing note | 3 | Explained |
| Step 4 — Incident Crew, four roles, one shared model | 3 | Explained |
| Teardown after Steps 2–4 | 3 | Deferred (operational detail, left for the written lab page) |
| Step 5 — package model (M4) | 3 | Explained |
| Step 6 — secure crew image (M8), local SBOM/scan/sign, optional GHCR push | 3 | Explained |
| Step 7 — ship via CI (M8) | 3 | Explained |
| Full teardown note | 3 | Deferred (operational detail, left for the written lab page) |
| Portability proof — 5 layers (OCI image, Compose Spec, host.docker.internal, ModelKit, Cosign) | 4 | Explained |
| Verify-yourself runtime swap | 4 | Explained |
| Podman `--add-host` caveat | 4 | Explained |
| The ladder (M1–M8 table) | 5 | Explained |
| Arc of intelligence (Naive RAG → Agentic RAG → Crew) | 5 | Explained |
| Take-home second use case | 5 | Explained |
| M3B fine-tuning extension | 5 | Explained |

## Verification flags

- The exact wording/format of `platform-check.sh` output, the Incident Crew's severity scale, and the routing decision marker are version-dependent — confirm against the current script before recording, since the lesson itself notes "exact scale/wording varies by run."
- The GHCR push step requires a classic PAT with `write:packages` — confirm this is still current GitHub auth guidance at recording time.
- Runtime names (Colima, Rancher Desktop, OrbStack, Podman) and their current `host.docker.internal` behavior should be spot-checked against their latest release notes before recording, since this is exactly the kind of claim that drifts with tool versions.
