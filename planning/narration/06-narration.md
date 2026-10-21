# Module 6 — Declarative Agent: Agentic RAG

## Recommended video structure

| # | Video title | Format | Estimated duration | Central idea |
|---|-------------|--------|--------------------|--------------|
| 1 | Module 6 Introduction — From a Pipeline to an Agent | Talking head | 2 min | Why Module 5's always-retrieve pipeline needs a routing brain |
| 2 | Writing an Agent in Markdown — SOUL.md, AGENTS.md, and Skills | Slides + voiceover | 6 min | The onboarding-packet analogy and the three files that define Aria |
| 3 | Naive RAG vs Agentic RAG — Why Aria Decides Before She Retrieves | Slides + voiceover | 6 min | The routing step and why it beats always-retrieve |
| 4 | MCP and ToolHive — Giving Aria a Real Tool Without the Risk | Slides + voiceover | 7 min | MCP as a standard tool interface, ToolHive as an isolated gateway, stateless MCP in 2026 |
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

1. Title slide: Module 6, The Declarative Agent, with Aria assembled from Markdown files and tools inside a container.
2. What you'll learn: five numbered objectives.
3. Divider 1, then "Naive RAG is passive, it always retrieves": an ops question and a 2+2 question forced down the same embed, retrieve, generate road.

---

## Video 2: Writing an Agent in Markdown — SOUL.md, AGENTS.md, and Skills

**Format:** Slides + voiceover
**Estimated duration:** 6 minutes
**Learning objective:** By the end, learners can describe the three Markdown files that define a declarative agent and explain why this beats hand-coding behaviour in Python.

### Narration script

Let's say you're onboarding a new support engineer at a company, someone who's never worked there before. Would you hand them a giant flowchart with every possible conversation scripted out in advance? Of course not, that's not how you actually train a person. Instead, you'd give them three things: a job description, so they know who they are and how they're expected to communicate. A set of operating procedures, so they know when to check the documentation and when they can just answer from what they already know, and which actions are completely off-limits. And a few skill guides, step-by-step instructions for the specific tasks they'll run most often.

A declarative agent works exactly the same way, and that's not a loose comparison, it's literally how Aria is built. You write those three things down as Markdown files, and a small glue script reads them at startup and hands them to the model as its system prompt. The model becomes the engineer. The Markdown is the onboarding packet.

So let's walk through the three files that actually make up Aria. The first is SOUL.md, and this is her identity and her values, who she is, her communication style, calm and precise, no guessing, and her core commitments. The second is AGENTS.md, and this is her operating instructions, how to handle an incoming question, which skills and tools she's allowed to reach for, and the hard guardrail rules she must never break. And the third is a skill file, `skills/agentic-rag/SKILL.md`, which is the actual procedure for agentic RAG: route yes or no, retrieve if needed, then ground the answer in what was retrieved.

When you look at the anatomy slide, you will count five parts, not three. The three files are there, and next to them are the MCP tools that AGENTS.md declares and the hard guardrail rules. One thin script, agent.py, joins all five, and that is what runs as Aria.

All three of these get pulled together by `agent.py`, and I want you to notice something about this file: it's about a hundred and thirty lines, using nothing but the Python standard library. There's no framework here, there's no class hierarchy, there's no decorator soup sitting between you and what's actually happening. It just reads the three Markdown files at startup, joins them together into one system prompt, and runs a simple route, retrieve, ground loop using plain `urllib.request` calls to Ollama and to ChromaDB.

And here's why that matters so much in practice. The alternative, the way most people would first think to build this, is to hand-code the behaviour directly in Python: an if-tree of conditions, system prompts baked into string literals, explicit tool-call chains wired together by hand. That works, but it's fragile, and it's hard to read, and worse, you can't change it without touching the application code itself. With the declarative approach, changing Aria's tone, or adding a new guardrail, or extending what skills she has, is just a Markdown edit. You're not touching Python at all. The model is Aria. The Markdown is her brain. And that's what makes her genuinely easy to evolve.

### Suggested visuals / slide beats

1. Divider 2 (onboarding handoff illustration), then "Onboard an engineer, don't script a robot": job description, rulebook and skill guides mapped to SOUL.md, AGENTS.md and SKILL.md.
2. "Declarative Markdown vs a hand-coded robot": the if-tree column against the Markdown column.
3. Divider 3, then "The anatomy of a 2026 agent": five parts feeding the agent.py glue, then Aria runs.

---

## Video 3: Naive RAG vs Agentic RAG — Why Aria Decides Before She Retrieves

**Format:** Slides + voiceover
**Estimated duration:** 6 minutes
**Learning objective:** By the end, learners can explain the routing decision that separates agentic RAG from naive RAG, and why making that decision at temperature zero matters.

### Narration script

Let's go back to what Module 5 actually built. It was a pipeline, and a pipeline, by definition, doesn't think. Every question goes through the same three steps: embed the question, search the vector store, hand the results to the model. It doesn't matter if the question is "how do I restart the payments service", which genuinely needs the runbooks, or "what is two plus two", which needs nothing at all. Both questions walk the exact same path. And that's the core limitation we're fixing in this module: naive RAG has no judgment about when to retrieve.

Module 6 adds exactly one new step in front of that pipeline, and it's a routing decision. The agent reads the question first, and it asks itself: does answering this actually require Acme's internal runbooks, or can I answer this from what I already know? If the answer is yes, it retrieves, and then it grounds its answer in what it found. If the answer is no, it just answers directly, and it skips retrieval altogether. That decide-first, then-act step is the entire difference between a pipeline and an agent.

Now here's the important part: this routing decision has to be reliable, and the way you get reliability out of a small model is by asking it a very narrow question, and asking it at temperature zero. Temperature zero means the model isn't being creative here, it's not sampling multiple possible answers, it's giving you the single most likely answer every single time. So the same input always produces the same output. That's what makes routing dependable, even on a laptop-sized model like qwen3.5, 2B parameters.

Let's look at how that plays out with a few real examples. "How do I restart the payments service" routes yes, retrieve, because that's an Acme-specific operational fact sitting in the runbooks. "Where are database backups stored" also routes yes, for the same reason. But "what is two plus two" routes no, answer directly, because that's general knowledge, not something in Acme's documentation. And "what's the weather in Paris today" also routes no, even though the agent can't actually answer it well, because the point isn't whether it knows the answer, it's whether the runbooks would help.

So why does this actually matter in practice? Well, every retrieval you skip is an embedding call you didn't make, and a search you didn't run, and more importantly, it's context you didn't waste on evidence the model didn't need. And there's a second, quieter benefit here too: when you retrieve for a question the runbooks can't actually help with, you risk pulling back something irrelevant and having the model generate an answer grounded in the wrong evidence. That's hallucination by bad match, and skipping retrieval when it isn't needed avoids that failure mode entirely. Generation itself, the more open-ended part where the model actually writes the answer, still runs at a higher temperature, because that part benefits from some flexibility. It's only the routing decision that needs to be locked down cold.

### Suggested visuals / slide beats

1. Divider 4 (fork-in-the-road illustration).
2. "Agentic RAG, decide first, then act": question, guardrail check, route YES to retrieve and ground, route NO to answer directly.
3. "A 2B model can route reliably": the four-row routing table (restart payments, database backups, 2+2, weather in Paris) with YES/NO routes.

---

## Video 4: MCP and ToolHive — Giving Aria a Real Tool Without the Risk

**Format:** Slides + voiceover
**Estimated duration:** 7 minutes
**Learning objective:** By the end, learners can explain what MCP standardizes, what ToolHive isolates, the two ways to connect an MCP server into a workflow, and why the stateless 2026 version of MCP makes tool servers easy to scale.

### Narration script

Module 5's docs assistant had no way to reach outside itself. It only knew what was sitting in ChromaDB, and that was fine for a first pipeline, but Aria needs more than that. AGENTS.md declares a tool called `web.fetch`, and that's the first time in this course an agent gets a real capability, one that connects it out to the live web when the runbooks simply don't cover something.

So let's talk about how that actually gets wired in safely, and it starts with MCP, the Model Context Protocol. MCP is a standard interface for giving a model access to tools, file systems, APIs, databases, web fetchers, without baking credentials or tool-specific logic directly into your application. A tool server exposes an MCP endpoint, the agent asks it, at startup, what tools are available, and then it calls them by name whenever it needs to.

Now, exposing a tool server is one thing, but running it safely is a separate problem, and that's exactly what ToolHive solves. ToolHive is an MCP gateway, and it runs each tool server as its own isolated Docker container. So when you run `thv run fetch`, ToolHive would pull the fetch server image, start it, and then wrap it in two proxy containers, one for ingress and one for egress, plus a DNS container, and together those enforce network isolation per server. The fetch server can reach the public internet, because that's its job, but it cannot touch your host filesystem, and it cannot touch any other container's network. And ToolHive never stores any credentials on the host either, Aria's AGENTS.md just points at the ToolHive endpoint URL, and ToolHive manages that server's entire lifecycle for you.

There are two ways you'd actually connect an MCP server into your workflow. The first is IDE mode, where you configure the ToolHive endpoint inside something like VS Code's MCP settings, and that's what you'd use for interactive development, testing a tool right there in your editor. The second is stack mode, where the containerized agent's AGENTS.md points directly at the ToolHive endpoint, and that's what you'd use for production runs, or CI, or any headless compose stack. Either way, you never install the MCP tool server directly on your laptop. ToolHive is the one thing standing between Aria and the open internet, and that's exactly where you want that isolation to live.

One more thing changed in 2026, and this time it is the protocol itself. Before, an MCP client opened with a handshake called initialize. The server answered with a session ID, in a header called Mcp-Session-Id, and the client sent that header back on every call after that. So the server had to remember you, and a gateway in front of several copies of that server had to send you to the same copy every time. The 2026-07-28 revision of MCP removes all of that. The Streamable HTTP transport is now stateless, so there is no handshake and no session ID. Instead, every request carries the protocol version and the client's capabilities in a field called _meta. That means any replica can answer any request, and there is nothing to pin. For ToolHive, a tool server now scales like any stateless microservice: several replicas behind a plain load balancer, with no sticky sessions.

Here is an easy way to picture it. Think of a counter where you keep a running tab. Only the clerk who opened your tab knows what you ordered, so you have to wait for that one clerk. Now think of a ticket counter instead. Every person brings a complete ticket that says who they are, what they want, and which version of the form they used. So any free clerk can serve the next person in the line. That ticket is the _meta on every MCP request, and the clerks are the replicas behind ToolHive. The same revision also moved tasks out of the core into an extension, deprecated sampling and roots, and put the standard under the Agentic AI Foundation.

### Suggested visuals / slide beats

1. Divider 5 (tool in a glass case illustration).
2. "Real tools through an MCP gateway": ToolHive hub with web.fetch, GitHub, filesystem, HTTP and database on the spokes. The MCP mechanism is spoken over this slide.
3. "Each tool server in its own sandbox": fetch server with ingress, egress and DNS containers, public internet reachable, host not. The IDE vs Stack modes are spoken over this slide.
4. "Stateless MCP: every request stands alone": before, initialize then Mcp-Session-Id on every call; now, every call carries _meta and any of three replicas answers.
5. "Analogy — a ticket counter, not a tab": one clerk with a running tab against three clerks serving customers who each hold a complete ticket.

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

1. Divider 6 (guard at a turnstile illustration).
2. "Guardrails refuse before the model runs": an unsafe and a safe query hit the regex guardrail; one is refused with the LLM never called, the other goes to the model. The soft-prompt contrast is spoken, not drawn.
3. Divider 7 (librarian illustration).
4. "Memory, a librarian who shelves by meaning": query, embed, the acme_runbooks shelves in ChromaDB, grounded answer. Ingestion and scaling are spoken over this slide.

---

## Video 6: Declarative Agent or Framework — When Markdown Is Enough

**Format:** Slides + voiceover
**Estimated duration:** 4 minutes
**Learning objective:** By the end, learners can state the three conditions where a declarative agent is sufficient, recognize the point where a framework becomes necessary, and explain how the whole agent ships as one container image.

### Narration script

So after building Aria, the obvious question is: when is this declarative approach actually enough, and when does it stop being enough? Look at the slide. On the left, there are three conditions. If all three hold, Markdown plus a skill plus a little glue code is the right tool for the job.

The first condition is that one agent handles one use case, and the routing rules for that use case are simple enough that you could list them out. Aria fits this well. She has exactly one job and exactly one routing decision. The second condition is that the skills are single-step procedures, not several agents coordinating with each other. And the third is that your tools come from standard MCP servers, without complex, stateful chains between them. Aria passes all three, so she needs no framework at all.

Now look at the right side of the slide. The moment any one of those conditions breaks, you are in different territory. If you need multiple specialised agents, or shared state that has to live across those agents, or complex tool chains, or retry logic that spans agent boundaries, you want a framework to coordinate all of that. Trying to hand-roll it in plain Markdown would get painful fast. And that is where the next module picks up. In Module 7, you grow Aria into a crew of four agents. The default stays declarative: four Markdown profiles and one small Python pipeline. CrewAI comes in as the framework alternative, for when the crew needs dynamic task assignment. Because you built one agent by hand first, you will see exactly which piece of complexity forces the move from Markdown to a framework.

Whichever way you go, the agent ships the same way. Everything that defines Aria, SOUL.md, AGENTS.md, the skill file, the MCP config and the agent.py glue, goes into one container image. The model stays native on the host, and the container reaches it at host.docker.internal on port 11434, next to ChromaDB and ToolHive. Build that image once, and the same agent runs on any laptop, in CI, or in a headless compose stack.

### Suggested visuals / slide beats

1. Divider 8, "Declarative versus framework".
2. "When a declarative agent is enough": three conditions in the green box, four framework triggers in the orange box, with "Module 7: grow Aria into a crew of four" underneath.
3. "The whole agent ships in a container": SOUL.md, AGENTS.md, SKILL.md, MCP config and agent.py glue inside the container, wired to native Ollama, ChromaDB and ToolHive.

---

## Video 7: Module 6 Summary and Lab Bridge

**Format:** Slides + voiceover
**Estimated duration:** 2 minutes
**Learning objective:** By the end, learners can recap the module's core ideas and know exactly what the lab will prove.

### Narration script

To summarize, in this module you learned that a declarative agent is just behaviour defined in Markdown, a persona, a set of instructions, and a skill, all read and run by a small glue script. You saw the three files that make that real: SOUL.md for identity, AGENTS.md for operating instructions, and a SKILL.md for the actual agentic-RAG procedure. You learned what makes agentic RAG different from Module 5's naive pipeline, deciding first, at temperature zero, and only retrieving when the decision says yes. You saw how MCP and ToolHive give Aria a real tool, isolated in its own container, without ever putting credentials on your host. You saw that the 2026 version of MCP is stateless, so any replica behind ToolHive can answer any request. You saw both halves of what keeps her safe and useful: a hard, application-layer guardrail that runs before the model is ever called, and ChromaDB as her long-term memory, reused directly from Module 5. And you saw the whole agent, Markdown, skill, MCP config and glue, packaged as one container image.

In the lab, you're going to read the three Markdown files that are Aria, start ChromaDB and the agent container, and watch her route three different queries live: retrieving for the operational question, answering the math question directly, and refusing a credential request outright. Then you'll wire in a live MCP tool through ToolHive yourself. I'll see you in the lab.

### Suggested visuals / slide beats

1. Closing slide: "The agent IS Markdown + skills + tools", with three Markdown files feeding Aria and three routed outcomes (retrieve, answer, refuse).

---

## Coverage map

| Source idea | Video | Treatment |
|-------------|-------|-----------|
| M5's pipeline always retrieves, no judgment | 1, 3 | Explained |
| Aria reuses M5's model, ChromaDB, network pattern | 1 (implied), 5 | Explained |
| Routing decision: decide first, then act | 1, 3 | Explained |
| Agentic RAG vs naive RAG definition | 3 | Explained |
| Temperature zero for deterministic routing | 3 | Explained |
| Routing table (4 example queries) | 3 | Explained |
| Hallucination-by-bad-match avoidance | 3 | Explained |
| Onboarding/job-description analogy | 2 | Explained |
| Declarative vs hand-coded Python if-tree | 2 | Explained |
| SOUL.md, AGENTS.md, SKILL.md roles, five-part anatomy | 2 | Explained |
| agent.py — ~130 lines, stdlib only, route/retrieve/ground loop | 2 | Explained |
| MCP definition and mechanism | 4 | Explained |
| ToolHive isolation (ingress/egress/DNS containers) | 4 | Explained |
| No credentials stored on host | 4 | Explained |
| IDE mode vs Stack mode | 4 | Explained |
| MCP 2026-07-28: stateless Streamable HTTP, `_meta`, no session pinning, ticket-counter analogy | 4 | Explained |
| Tasks as an extension, sampling and roots deprecated, Agentic AI Foundation governance | 4 | Mentioned |
| Guardrail regex, application-layer, before model call | 5 | Explained |
| Why a soft system-prompt refusal is bypassable | 5 | Explained |
| Layered guardrails in production (mentioned) | 5 | Explained |
| ChromaDB as semantic memory, idempotent ingestion | 5 | Explained |
| 5 chunks, one collection, scales without API changes | 5 | Explained |
| Three conditions where declarative is enough | 6 | Explained |
| When a framework becomes necessary | 6 | Explained |
| Bridge to Module 7 (a crew of four, declarative by default, CrewAI as the alternative) | 6 | Explained |
| The whole agent ships as one container image | 6, 7 | Explained |
| Lab: three routed queries + live MCP tool wiring | 7 | Explained (preview only, not demonstrated) |

## Verification flags

- Guardrail keyword list ("password", "secret", "credential", "reveal", "drop table", `rm -rf`, "wipe", "exfiltrate", "and a few others") is stated as-is from the lesson; the exact regex may be broader in `agent.py` — verify against the actual source file before treating the list as exhaustive on camera.
- `agent.py` line count ("about 130 lines") is an approximation per the lesson source; confirm against the current file if it's cited as an exact number in the final script.
- Model name/parameter count (`qwen3.5:2b`, "2B") should be re-checked against the lab's actual `.env`/compose config at recording time in case the pinned model changes.
