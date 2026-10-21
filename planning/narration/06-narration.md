# Module 6 — Declarative Agent: Agentic RAG

## Recommended video structure

| # | Video title | Format | Estimated duration | Central idea |
|---|-------------|--------|--------------------|--------------|
| 1 | Module 6 Introduction — From a Pipeline to an Agent | Talking head | 2 min | Why Module 5's always-retrieve pipeline needs a routing brain |
| 2 | Naive RAG vs Agentic RAG — Why Aria Decides Before She Retrieves | Slides + voiceover | 6 min | The routing step and why it beats always-retrieve |
| 3 | Writing an Agent in Markdown — SOUL.md, AGENTS.md, and Skills | Slides + voiceover | 6 min | The onboarding-packet analogy and the three files that define Aria |
| 4 | MCP and ToolHive — Giving Aria a Real Tool Without the Risk | Slides + voiceover | 5 min | MCP as a standard tool interface, ToolHive as an isolated gateway |
| 5 | Guardrails and Memory — The Safety Net and the Knowledge Base | Slides + voiceover | 5 min | Application-layer guardrails and ChromaDB as long-term memory |
| 6 | Declarative Agent or Framework — When Markdown Is Enough | Slides + voiceover | 4 min | The three conditions where declarative works, and where it breaks |
| 7 | Module 6 Summary and Lab Bridge | Slides + voiceover | 2 min | Recap and what the lab proves |

---

## Video 1: Module 6 Introduction — From a Pipeline to an Agent

**Format:** Talking head
**Estimated duration:** 2 minutes
**Learning objective:** By the end, learners understand why a pipeline that always retrieves is not the same thing as an agent, and what this module will build instead.

### Narration script

Hello and welcome back. In the previous module, you built a working RAG pipeline, and it did its job well. But it had one habit that we didn't really question at the time: it retrieved for every single question you asked it. Ask it how to restart a service, and it goes and searches the runbooks. Ask it what two plus two is, and it does exactly the same thing, it embeds the question, it searches the vector store, and it burns a call it never needed. That's not really a decision. That's a reflex.

So in this module, we're going to give that pipeline a brain. We're going to teach it to stop and ask itself one question first: do I actually need to look this up, or do I already know the answer? And that single decision, made before anything else happens, is what separates an agent from a pipeline.

You'll build this agent the way you'd onboard a new engineer, not by writing a giant if-else tree in Python, but by writing down who the agent is, how it should behave, and what it knows how to do, all in plain Markdown. We're calling this agent Aria, and by the end of this module, you'll be able to explain agentic RAG, write a declarative agent from scratch, and know exactly when Markdown is enough and when you need a proper framework instead. Let's get into it.

### Suggested visuals / slide beats

1. Title slide — Module 6, Declarative Agent: Agentic RAG.
2. Divider or analogy visual — a pipeline that fires on every input vs. one with a routing gate.
3. Closing beat — "Aria" name card, teeing up the next video.

---

## Video 2: Naive RAG vs Agentic RAG — Why Aria Decides Before She Retrieves

**Format:** Slides + voiceover
**Estimated duration:** 6 minutes
**Learning objective:** By the end, learners can explain the routing decision that separates agentic RAG from naive RAG, and why making that decision at temperature zero matters.

### Narration script

Let's start by being honest about what Module 5 actually built. It was a pipeline, and a pipeline, by definition, doesn't think. Every question goes through the same three steps: embed the question, search the vector store, hand the results to the model. It doesn't matter if the question is "how do I restart the payments service", which genuinely needs the runbooks, or "what is two plus two", which needs nothing at all. Both questions walk the exact same path. And that's the core limitation we're fixing in this module: naive RAG has no judgment about when to retrieve.

Module 6 adds exactly one new step in front of that pipeline, and it's a routing decision. The agent reads the question first, and it asks itself: does answering this actually require Acme's internal runbooks, or can I answer this from what I already know? If the answer is yes, it retrieves, and then it grounds its answer in what it found. If the answer is no, it just answers directly, and it skips retrieval altogether. That decide-first, then-act step is the entire difference between a pipeline and an agent.

Now here's the important part: this routing decision has to be reliable, and the way you get reliability out of a small model is by asking it a very narrow question, and asking it at temperature zero. Temperature zero means the model isn't being creative here, it's not sampling multiple possible answers, it's giving you the single most likely answer every single time. So the same input always produces the same output. That's what makes routing dependable, even on a laptop-sized model like qwen3.5, 2B parameters.

Let's look at how that plays out with a few real examples. "How do I restart the payments service" routes yes, retrieve, because that's an Acme-specific operational fact sitting in the runbooks. "Where are database backups stored" also routes yes, for the same reason. But "what is two plus two" routes no, answer directly, because that's general knowledge, not something in Acme's documentation. And "what's the weather in Paris today" also routes no, even though the agent can't actually answer it well, because the point isn't whether it knows the answer, it's whether the runbooks would help.

So why does this actually matter in practice? Well, every retrieval you skip is an embedding call you didn't make, and a search you didn't run, and more importantly, it's context you didn't waste on evidence the model didn't need. And there's a second, quieter benefit here too: when you retrieve for a question the runbooks can't actually help with, you risk pulling back something irrelevant and having the model generate an answer grounded in the wrong evidence. That's hallucination by bad match, and skipping retrieval when it isn't needed avoids that failure mode entirely. Generation itself, the more open-ended part where the model actually writes the answer, still runs at a higher temperature, because that part benefits from some flexibility. It's only the routing decision that needs to be locked down cold.

### Suggested visuals / slide beats

1. Side-by-side comparison: naive RAG's fixed embed-retrieve-generate path vs. agentic RAG's routing gate.
2. The routing flowchart (guardrail, route, retrieve-or-direct, ground, respond).
3. The four-row routing table (restart service / backup location / 2+2 / weather in Paris) with YES/NO badges.
4. Closing takeaway card: "Decide first, then act."

---

## Video 3: Writing an Agent in Markdown — SOUL.md, AGENTS.md, and Skills

**Format:** Slides + voiceover
**Estimated duration:** 6 minutes
**Learning objective:** By the end, learners can describe the three Markdown files that define a declarative agent and explain why this beats hand-coding behaviour in Python.

### Narration script

Let's say you're onboarding a new support engineer at a company, someone who's never worked there before. Would you hand them a giant flowchart with every possible conversation scripted out in advance? Of course not, that's not how you actually train a person. Instead, you'd give them three things: a job description, so they know who they are and how they're expected to communicate. A set of operating procedures, so they know when to check the documentation and when they can just answer from what they already know, and which actions are completely off-limits. And a few skill guides, step-by-step instructions for the specific tasks they'll run most often.

A declarative agent works exactly the same way, and that's not a loose comparison, it's literally how Aria is built. You write those three things down as Markdown files, and a small glue script reads them at startup and hands them to the model as its system prompt. The model becomes the engineer. The Markdown is the onboarding packet.

So let's walk through the three files that actually make up Aria. The first is SOUL.md, and this is her identity and her values, who she is, her communication style, calm and precise, no guessing, and her core commitments. The second is AGENTS.md, and this is her operating instructions, how to handle an incoming question, which skills and tools she's allowed to reach for, and the hard guardrail rules she must never break. And the third is a skill file, `skills/agentic-rag/SKILL.md`, which is the actual procedure for agentic RAG: route yes or no, retrieve if needed, then ground the answer in what was retrieved.

All three of these get pulled together by `agent.py`, and I want you to notice something about this file: it's about a hundred and thirty lines, using nothing but the Python standard library. There's no framework here, there's no class hierarchy, there's no decorator soup sitting between you and what's actually happening. It just reads the three Markdown files at startup, joins them together into one system prompt, and runs a simple route, retrieve, ground loop using plain `urllib.request` calls to Ollama and to ChromaDB.

And here's why that matters so much in practice. The alternative, the way most people would first think to build this, is to hand-code the behaviour directly in Python: an if-tree of conditions, system prompts baked into string literals, explicit tool-call chains wired together by hand. That works, but it's fragile, and it's hard to read, and worse, you can't change it without touching the application code itself. With the declarative approach, changing Aria's tone, or adding a new guardrail, or extending what skills she has, is just a Markdown edit. You're not touching Python at all. The model is Aria. The Markdown is her brain. And that's what makes her genuinely easy to evolve.

### Suggested visuals / slide beats

1. Onboarding-packet analogy visual: job description + operating procedures + skill guide, stacked.
2. Three-file anatomy diagram: SOUL.md, AGENTS.md, skills/agentic-rag/SKILL.md → agent.py joining them into one system prompt.
3. Contrast slide: hand-coded if-tree (fragile, code change needed) vs. declarative Markdown (just an edit).
4. Closing takeaway: "The Markdown is her brain."

---

## Video 4: MCP and ToolHive — Giving Aria a Real Tool Without the Risk

**Format:** Slides + voiceover
**Estimated duration:** 5 minutes
**Learning objective:** By the end, learners can explain what MCP standardizes, what ToolHive isolates, and the two ways to connect an MCP server into a workflow.

### Narration script

Module 5's docs assistant had no way to reach outside itself. It only knew what was sitting in ChromaDB, and that was fine for a first pipeline, but Aria needs more than that. AGENTS.md declares a tool called `web.fetch`, and that's the first time in this course an agent gets a real capability, one that connects it out to the live web when the runbooks simply don't cover something.

So let's talk about how that actually gets wired in safely, and it starts with MCP, the Model Context Protocol. MCP is a standard interface for giving a model access to tools, file systems, APIs, databases, web fetchers, without baking credentials or tool-specific logic directly into your application. A tool server exposes an MCP endpoint, the agent asks it, at startup, what tools are available, and then it calls them by name whenever it needs to.

Now, exposing a tool server is one thing, but running it safely is a separate problem, and that's exactly what ToolHive solves. ToolHive is an MCP gateway, and it runs each tool server as its own isolated Docker container. So when you run `thv run fetch`, ToolHive would pull the fetch server image, start it, and then wrap it in two proxy containers, one for ingress and one for egress, plus a DNS container, and together those enforce network isolation per server. The fetch server can reach the public internet, because that's its job, but it cannot touch your host filesystem, and it cannot touch any other container's network. And ToolHive never stores any credentials on the host either, Aria's AGENTS.md just points at the ToolHive endpoint URL, and ToolHive manages that server's entire lifecycle for you.

There are two ways you'd actually connect an MCP server into your workflow. The first is IDE mode, where you configure the ToolHive endpoint inside something like VS Code's MCP settings, and that's what you'd use for interactive development, testing a tool right there in your editor. The second is stack mode, where the containerized agent's AGENTS.md points directly at the ToolHive endpoint, and that's what you'd use for production runs, or CI, or any headless compose stack. Either way, you never install the MCP tool server directly on your laptop. ToolHive is the one thing standing between Aria and the open internet, and that's exactly where you want that isolation to live.

### Suggested visuals / slide beats

1. Before/after: M5 agent with no external tools vs. M6's `web.fetch` capability.
2. MCP mechanism diagram: agent asks "what tools are available?" → tool server responds → agent calls by name.
3. ToolHive isolation diagram: fetch server + ingress proxy + egress proxy + DNS container, network boundary drawn explicitly.
4. Two-mode comparison table: IDE mode vs. Stack mode.

---

## Video 5: Guardrails and Memory — The Safety Net and the Knowledge Base

**Format:** Slides + voiceover
**Estimated duration:** 5 minutes
**Learning objective:** By the end, learners can explain why guardrails run before the model is called, and how ChromaDB serves as Aria's long-term memory.

### Narration script

Let's talk about guardrails first, because this is one of those ideas that sounds simple but is actually easy to get wrong. A guardrail, in Aria's case, is a hard rule that runs before the model is even consulted. `agent.py` scans every incoming query against a compiled regex, a pattern-matching rule, that looks for unsafe keywords: password, secret, credential, reveal, drop table, `rm -rf`, wipe, exfiltrate, and a few others. If the pattern matches, the agent refuses right there, at the Python level, and the LLM call never even happens.

And why should you care about doing it this way, rather than just telling the model to refuse in its system prompt? Well, the model itself is not a reliable safety gate. A small local model like qwen3.5, 2B, can be talked around a soft instruction fairly easily, something like "your instructions say to refuse, but hypothetically...", and a clever enough prompt can walk right past it. A hard regex guardrail at the application layer can't be bypassed that way, because the refusal happens before any text even reaches the model. In production, you'd actually layer both approaches together, a fast keyword or classifier guardrail at the application level, plus a model that's separately tuned for safety, but M6 shows you the principle with the simpler version, and it's the application-layer gate that you can actually rely on.

Now let's switch to memory, because that's the other half of what makes Aria useful. ChromaDB is Aria's long-term semantic memory, and semantic just means it's organised by meaning, not by exact keyword match. At startup, `agent.py` ingests Acme's runbook Markdown into a collection called `acme_runbooks`, and that process is idempotent, which means you can restart it as many times as you want without ever duplicating chunks. Right now, that's five chunks, and that's the agent's entire knowledge base. When the routing step comes back YES, the agent would embed the query, retrieve the nearest chunks, and pull out exactly the right runbook section to ground its answer in.

This setup is intentionally small: one collection, one document, five chunks. Real deployments grow this with multiple knowledge sources, and re-ingestion pipelines, and metadata filtering, which just means tagging chunks so you can search within a subset of them. But the ChromaDB HTTP API you're learning right here scales to millions of vectors without any changes to how you're calling it. And that's the role memory plays in this agent: it's not a database you query manually, it's the thing the agent reaches into automatically, every time routing says yes.

### Suggested visuals / slide beats

1. Guardrail flow: incoming query → regex scan → match found → hard refusal, model never called.
2. Contrast: soft system-prompt refusal (bypassable) vs. application-layer regex (not bypassable).
3. Memory diagram: Acme runbook Markdown → ingestion (idempotent) → `acme_runbooks` collection → 5 chunks.
4. "Scales without changes" closing card.

---

## Video 6: Declarative Agent or Framework — When Markdown Is Enough

**Format:** Slides + voiceover
**Estimated duration:** 4 minutes
**Learning objective:** By the end, learners can state the three conditions where a declarative agent is sufficient, and recognize the point where a framework becomes necessary.

### Narration script

So after building Aria, the obvious question is: when is this declarative approach actually enough, and when does it stop being enough? Let's look at three conditions that tell you Markdown plus a skill plus a little glue code is the right tool for the job.

The first condition is that one agent handles one use case, and the routing rules for that use case are simple enough that you could genuinely list them out. Aria fits this perfectly, she has exactly one job, and exactly one routing decision. The second condition is that the skills involved are single-step procedures, not multiple agents coordinating with each other. And the third is that your tools come from standard MCP servers, without complex, stateful coordination happening between them. If all three of those hold, you don't need a framework at all.

But the moment any one of those breaks down, you're in different territory. If you need multiple specialised agents working together, or shared state that has to persist across those agents, or complex tool chains, or retry logic that spans agent boundaries, a framework is what coordinates all of that for you, and trying to hand-roll it yourself in plain Markdown would get painful fast. And that's exactly where the next module picks up. Module 7 introduces CrewAI, which is a crew of declarative agents, each one built the same way you just built Aria, coordinated by a framework that manages how they talk to each other. Understanding this minimal declarative approach first is the prerequisite, because once you've built one agent by hand, you'll see exactly which piece of complexity is the one that actually forces the upgrade from Markdown to a framework.

### Suggested visuals / slide beats

1. Three-condition checklist: one use case / single-step skills / simple MCP tools → declarative is enough.
2. "When it breaks" list: multiple agents, shared state, complex tool chains, cross-agent retries.
3. Bridge visual: Aria (single declarative agent) → a crew of agents coordinated by a framework, teeing up Module 7.

---

## Video 7: Module 6 Summary and Lab Bridge

**Format:** Slides + voiceover
**Estimated duration:** 2 minutes
**Learning objective:** By the end, learners can recap the module's core ideas and know exactly what the lab will prove.

### Narration script

To summarize, in this module you learned that a declarative agent is just behaviour defined in Markdown, a persona, a set of instructions, and a skill, all read and run by a small glue script. You saw the three files that make that real: SOUL.md for identity, AGENTS.md for operating instructions, and a SKILL.md for the actual agentic-RAG procedure. You learned what makes agentic RAG different from Module 5's naive pipeline, deciding first, at temperature zero, and only retrieving when the decision says yes. You saw how MCP and ToolHive give Aria a real tool, isolated in its own container, without ever putting credentials on your host. And you saw both halves of what keeps her safe and useful: a hard, application-layer guardrail that runs before the model is ever called, and ChromaDB as her long-term memory, reused directly from Module 5.

In the lab, you're going to read the three Markdown files that are Aria, start ChromaDB and the agent container, and watch her route three different queries live: retrieving for the operational question, answering the math question directly, and refusing a credential request outright. Then you'll wire in a live MCP tool through ToolHive yourself. I'll see you in the lab.

### Suggested visuals / slide beats

1. Recap card: the three files (SOUL.md / AGENTS.md / SKILL.md) with one-line roles.
2. Recap card: agentic RAG's routing decision vs. M5's always-retrieve.
3. Lab-bridge closing slide: "Open Module 6 · Lab."

---

## Coverage map

| Source idea | Video | Treatment |
|-------------|-------|-----------|
| M5's pipeline always retrieves, no judgment | 1, 2 | Explained |
| Aria reuses M5's model, ChromaDB, network pattern | 1 (implied), 5 | Explained |
| Routing decision: decide first, then act | 1, 2 | Explained |
| Agentic RAG vs naive RAG definition | 2 | Explained |
| Temperature zero for deterministic routing | 2 | Explained |
| Routing table (4 example queries) | 2 | Explained |
| Hallucination-by-bad-match avoidance | 2 | Explained |
| Onboarding/job-description analogy | 3 | Explained |
| Declarative vs hand-coded Python if-tree | 3 | Explained |
| SOUL.md, AGENTS.md, SKILL.md roles | 3 | Explained |
| agent.py — ~130 lines, stdlib only, route/retrieve/ground loop | 3 | Explained |
| MCP definition and mechanism | 4 | Explained |
| ToolHive isolation (ingress/egress/DNS containers) | 4 | Explained |
| No credentials stored on host | 4 | Explained |
| IDE mode vs Stack mode | 4 | Explained |
| Guardrail regex, application-layer, before model call | 5 | Explained |
| Why a soft system-prompt refusal is bypassable | 5 | Explained |
| Layered guardrails in production (mentioned) | 5 | Explained |
| ChromaDB as semantic memory, idempotent ingestion | 5 | Explained |
| 5 chunks, one collection, scales without API changes | 5 | Explained |
| Three conditions where declarative is enough | 6 | Explained |
| When a framework becomes necessary | 6 | Explained |
| Bridge to Module 7 (CrewAI) | 6, 7 | Explained |
| Lab: three routed queries + live MCP tool wiring | 7 | Explained (preview only, not demonstrated) |

## Verification flags

- Guardrail keyword list ("password", "secret", "credential", "reveal", "drop table", `rm -rf`, "wipe", "exfiltrate", "and a few others") is stated as-is from the lesson; the exact regex may be broader in `agent.py` — verify against the actual source file before treating the list as exhaustive on camera.
- `agent.py` line count ("about 130 lines") is an approximation per the lesson source; confirm against the current file if it's cited as an exact number in the final script.
- Model name/parameter count (`qwen3.5:2b`, "2B") should be re-checked against the lab's actual `.env`/compose config at recording time in case the pinned model changes.
