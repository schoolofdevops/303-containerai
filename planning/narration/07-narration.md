# Module 7 — Multi-Agent Incident Crew

## Recommended video structure

| # | Video title | Format | Estimated duration | Central idea |
|---|-------------|--------|--------------------|--------------|
| 1 | Multi-Agent Incident Crew — Why One Agent Isn't Enough | Talking head | 2 min | Why the module exists, where it sits in the course |
| 2 | Specialisation, Separation, and the Review Loop — Why Go Multi-Agent | Slides + voiceover | 5.5 min | The three reasons to split one agent into a crew, and when not to |
| 3 | Inside the Incident Crew — Triage, Investigate, and the Relevance Gate | Slides + voiceover | 4 min | The pipeline, hop by hop, and why the relevance gate exists |
| 4 | Declarative vs CrewAI vs LangGraph — Two Paths to Build a Crew | Slides + voiceover | 5.5 min | The three ways to build the crew, and how to choose |
| 5 | One Model, Four Agents — What a Crew Costs and How Compose Wires It | Slides + voiceover | 3 min | Resource cost, the CrewAI comparison, and the two-service compose file |
| 6 | The Reviewer as Human-in-the-Loop Proxy — Recap and Lab Bridge | Slides + voiceover | 3 min | What the Reviewer checks, who keeps the final say, and what the lab will prove |

---

## Video 1: Multi-Agent Incident Crew — Why One Agent Isn't Enough

**Format:** Talking head
**Estimated duration:** 2 minutes
**Learning objective:** By the end, learners understand why this module exists and what capability it produces.

### Narration script

Hello and welcome back. In the previous module, you built a single declarative agent — one Markdown profile, one small script, one job done end to end. Now let's push on that a little.

Let's say you walk into a hospital with a serious complaint. A single doctor does not receive you at the door, diagnose you, write the prescription, and then sign off on their own order. Instead, the hospital runs you through a crew. A triage nurse checks how urgent your case is. A doctor diagnoses it. A pharmacist turns that diagnosis into an exact medicine. And an attending physician reviews the whole thing before it ever reaches you.

Well, that is exactly the problem with a single agent doing everything. Ask one small model to triage, investigate, fix, and review, all in one prompt, and you overload it. The context gets messy, the roles blur into each other, and you lose the one thing you actually want from a review step — a second, independent pair of eyes.

So in this module, we are going to grow your single agent from Module 6 into a crew of four specialised agents — Triage, Investigator, Fixer, and Reviewer — all sharing the one model endpoint you already have running. You will learn why you'd reach for a crew instead of one agent, when a single agent is still the right call, and the two different paths to actually build one — writing it yourself, or reaching for a framework like CrewAI or LangGraph.

By the end of this module, you will be able to design a multi-agent pipeline with a real safety review built in, and know exactly when that extra complexity is worth it. In the next video, let's look at why specialisation and review actually matter.

### Suggested visuals / slide beats

1. Title slide — "Multi-Agent Incident Crew"
2. Divider — hospital scene: triage nurse, doctor, pharmacist, attending physician in a row
3. Divider/diagram — single agent overloaded with four jobs at once vs four agents each with one job
4. Closing beat — "Coming up: why go multi-agent"

---

## Video 2: Specialisation, Separation, and the Review Loop — Why Go Multi-Agent

**Format:** Slides + voiceover
**Estimated duration:** 5.5 minutes
**Learning objective:** By the end, learners can explain the three reasons to split an agent into a crew, and recognise when a single agent is still the better choice.

### Narration script

Let's now look at three different things a single agent cannot give you, and why each one actually matters.

The first is specialisation. Let's say your triage agent's only job is to read an incident report and classify it. You would set its temperature to zero, which just means it gives you the same, most predictable answer every time, and it outputs a single line. Now compare that to an investigator agent — its only job is to query a vector store and report back exactly what it finds, word for word, no extra commentary. A fixer agent proposes one exact command. A reviewer agent checks that command for safety. Each prompt stays small, so the context stays small, and a 2 billion parameter model running on your laptop can handle each of these jobs reliably. Now ask one agent to do all four jobs in a single prompt, and you would overload its context, blur every role together, and make the final output much harder to check.

The second reason is separation of concerns — that is, keeping each agent's job separate from every other agent's job. The triage agent never sees the runbook. The fixer never checks safety. That's not just tidier design for its own sake. It directly cuts down the chance of a small model hallucinating — that is, making something up with confidence — across a task boundary it was never actually built for.

The third, and really the most important one, is the review loop. Think of the reviewer as a stand-in for the human who would normally be in the loop. Its only job is to check the fixer's output against the runbook and refuse anything that looks destructive or ungrounded. Without a review loop, a fix that sounds confident but is actually wrong would ship straight to production. With it, a human gets a clear APPROVED recommendation, or a clear REJECTED — escalate to on-call — signal, and makes the final call themselves.

Now, multi-agent does add real overhead. More prompts, more latency, more moving parts to manage. So don't reach for it by default. A single declarative agent, the pattern from Module 6, is still the right tool when one agent can handle one use case end to end — question in, answer out, or query in, retrieve and ground out — when there's no need for a separate safety review on the output, and when the task doesn't produce an action, a command, a deployment, an API call, that needs a second signature.

You'd reach for a crew instead when the task produces a consequential action, when reviewing that action is really a job of its own, or when specialisation genuinely makes a small model more reliable at each individual step. In the next video, let's walk through exactly how this incident crew's pipeline runs, stage by stage.

### Suggested visuals / slide beats

1. Divider — "Why go multi-agent?"
2. Diagram — specialisation: four small boxes (triage/investigator/fixer/reviewer), each with a narrow single-line job description
3. Diagram — separation of concerns: triage box crossed out from seeing the runbook; fixer box crossed out from seeing safety rules
4. Diagram — review loop: fixer output flowing through reviewer gate before reaching a human
5. Two-column comparison — "single agent is enough" vs "reach for a crew"

---

## Video 3: Inside the Incident Crew — Triage, Investigate, and the Relevance Gate

**Format:** Slides + voiceover
**Estimated duration:** 4 minutes
**Learning objective:** By the end, learners can trace an incident through every stage of the crew's pipeline and explain why the relevance gate is not optional.

### Narration script

The crew runs as a pipeline, one stage after another. And here is the important part: the pipeline stops early if no runbook actually matches the incident.

Let's say an incident report comes in. It first goes to Triage, which classifies the area and how severe it is. Triage prints that label for you, the human, to read. But the label does not travel on. The Investigator searches the runbook store with the original incident text, and pulls back whatever passage looks closest to this incident.

Now this is where a lot of naive systems go wrong, so let's slow down. Look at the next slide. Vector search always returns the closest match it can find, the nearest neighbour, even when that neighbour has nothing to do with the incident. During validation of this exact crew, a Kafka outage came in. The nearest chunk was the payments runbook, only because the Kafka query had no better match. And without a check, the crew confidently proposed a payments restart for a Kafka outage.

So between the Investigator and the Fixer, there is a relevance gate. It asks the model one plain yes-or-no question: does this passage actually address this incident? If the answer is yes, the Fixer takes over and proposes the exact command to run. If the answer is no, the crew skips straight to REJECTED and escalates to on-call. A badly wrong fix never reaches the output.

In the next video, let's look at the two different ways you can build this pipeline: writing it yourself, or reaching for a framework.

### Suggested visuals / slide beats

1. Divider 3, "The incident crew's pipeline".
2. "The Incident Crew pipeline": Triage, Investigate, gate, Fixer, Reviewer, then APPROVED or ESCALATE.
3. "The relevance gate: nearest isn't relevant": Kafka incident, nearest chunk is the payments runbook, the gate asks "covers this incident?", NO, REJECTED and escalate.

---

## Video 4: Declarative vs CrewAI vs LangGraph — Two Paths to Build a Crew

**Format:** Slides + voiceover
**Estimated duration:** 5.5 minutes
**Learning objective:** By the end, learners can describe the declarative, CrewAI, and LangGraph approaches to building a crew, and choose between them based on the task.

### Narration script

Let's talk about how you would actually build this crew — and there are two broad paths here, the declarative way, and the framework way.

In Module 6, you defined one agent as a Markdown profile plus a small glue script. The crew grows that exact same pattern — four Markdown profiles, one Python pipeline, all sharing one Ollama endpoint. No framework, no extra dependency beyond the standard library. Each agent is really just a Python function that reads its own profile, calls the model once, and returns a string.

This is the right default for most crews you'll build. The flow is predictable and it runs in sequence, there's no state machine to manage, and there's no retry logic to coordinate across agent boundaries. And with the declarative approach, changing an agent's behaviour is a Markdown edit, not a code change. It's the same principle from Module 6, now applied across four agents working together instead of one.

Now, two frameworks add more structure when the declarative approach isn't enough on its own.

CrewAI hands out roles explicitly — agents are defined in an agents.yaml file, tasks in a tasks.yaml file, and CrewAI itself handles the message routing, the delegation, and the retry logic between them. You'd reach for it when your crew needs dynamic task assignment, or when agents need to work together in patterns that aren't strictly one-after-another.

LangGraph, on the other hand, draws the crew as an explicit graph, with checkpointing built in, so you can save progress at every step. Every edge in that graph is a conditional branch, every node is a function. You can pause execution at any node, look at exactly what its state is, and resume from there. You'd reach for LangGraph when you need control that is deterministic and auditable over a genuinely complex workflow — when a question like "what happened between step three and step four?" needs a real, verifiable answer, not a guess.

And here's the part worth remembering. Both frameworks work with the same building blocks you already know — MCP for tools, ChromaDB for memory, Ollama for the model. Only the orchestrator changes; the tools and the model underneath stay exactly the same. So you could swap CrewAI for LangGraph, or for the declarative approach, without touching how your agents call tools, or how they reach the knowledge base. It's the same idea as the OpenAI-compatible endpoint from the earlier modules — build against the standard, and you can swap out the implementation underneath it, any time you need to.

In the next video, let's put an actual number on what this crew costs to run, and then head into the lab.

### Suggested visuals / slide beats

1. Divider 4, "Two paths to multi-agent".
2. "Two paths to multi-agent": the declarative box (four Markdown profiles, one per agent, one Python pipeline) against the framework box (LangGraph, CrewAI).
3. "Swap the orchestrator, not the tools": Declarative, LangGraph and CrewAI above one shared layer of MCP tools, ChromaDB memory and the Ollama model.

---

## Video 5: One Model, Four Agents — What a Crew Costs and How Compose Wires It

**Format:** Slides + voiceover
**Estimated duration:** 3 minutes
**Learning objective:** By the end, learners know the resource cost of the crew, how it compares with a framework crew, and how the lab's compose file wires it.

### Narration script

Let's do the math on what this crew actually costs to run, on a 16 gigabyte laptop running qwen3.5:2b. The model itself needs about three and a half gigabytes of memory, as Ollama reports it. The small embedding model adds about a third of a gigabyte. ChromaDB needs only around 15 megabytes. And the crew container, all four agents together, needs about 15 megabytes too. That's a total of roughly 4 gigabytes.

And here's the interesting part: agents themselves are cheap. A crew is really just four Python functions with four different system prompts. The model is the expensive part, and it's shared across all four. Running four separate copies of the model, one per agent, would need four times the memory for no real gain. So all four agents call the same Ollama endpoint, one after another, exactly the same idea you used back in Module 6.

Look at the second line under the diagram. If you reached for a framework crew instead, say CrewAI running gemma3:4B, you'd need a model of about 4 gigabytes, so roughly four and a half in total. The declarative 2 billion parameter crew stays the laptop-friendly default. You'd only reach for a bigger model when the framework's more complex coordination actually demands it.

Now, how does this run as containers? The lab's compose file has just two services. One is ChromaDB, version 1.5.9, with a volume for its data. The other is the crew, which you run one shot at a time with docker compose run. The model is not in the compose file at all. It stays native on the host, and the crew reaches it at host.docker.internal on port 11434. ToolHive also stays outside compose, and only the CrewAI variant in the lab uses it.

### Suggested visuals / slide beats

1. Divider 5, "One model, four agents".
2. "One model, four agents": Ollama hub with four agent spokes, the 4 GB total, and the CrewAI on gemma3:4B ≈ 4.5 GB line.
3. "Wire the crew with the Compose Spec": crew, ChromaDB 1.5.9 and its volume inside compose.yaml, the native model server outside.

---

## Video 6: The Reviewer as Human-in-the-Loop Proxy — Recap and Lab Bridge

**Format:** Slides + voiceover
**Estimated duration:** 3 minutes
**Learning objective:** By the end, learners can explain what the Reviewer checks and why a human keeps the final say, and they know what they will run and observe in the lab.

### Narration script

The last member of the crew is the Reviewer, and its job is subtle. It does not decide whether to fix the incident. That is the Fixer's job. It decides whether the proposed fix is safe to show a human. To do that, it gets two things: the Fixer's proposed command, and the runbook passage that command came from. So it can check the fix against the real evidence, word for word.

The Reviewer's rules are simple. Approve if the command is non-destructive and comes word for word from the runbook. Reject if the command destroys data, touches secrets, or was never in the runbook. And when in doubt, reject.

Think of the Reviewer as a stand-in for the human review that would normally happen in a real incident-response workflow. The crew never applies fixes on its own. It produces a checked recommendation and a clear outcome, APPROVED, or REJECTED and escalate, that a human engineer reads and then acts on. The automation earns its place by doing the triage, the retrieval, and that first safety check. The human keeps the final say.

To summarize: you've learned why a crew beats a single agent for consequential actions, how the pipeline runs with a relevance gate protecting the Fixer, the two paths to build a crew, what it costs, and how the Reviewer hands a checked result to a human. In the lab, you're going to read all four agent profiles yourself, run the crew against a real 503 incident and watch it get APPROVED, and then run it against a Kafka incident and watch the relevance gate catch a bad match and send it to REJECTED and escalate. I'll see you in the lab.

### Suggested visuals / slide beats

1. Divider 6 (senior physician signing off a note).
2. "The Reviewer, human-in-the-loop proxy": Reviewer gets the fix plus the runbook passage, APPROVED or REJECTED, then the human decides.
3. Closing/lab-bridge slide: "Swap the orchestrator, keep the crew", with 503 → APPROVED and Kafka → ESCALATE.

---

## Coverage map

| Source idea | Video | Treatment |
|-------------|-------|-----------|
| Hospital analogy (triage/doctor/pharmacist/attending) | 1 | Explained |
| Why single-agent overloads context | 1, 2 | Explained |
| Specialisation (small, focused prompts per agent) | 2 | Explained |
| Separation of concerns | 2 | Explained |
| Review loops / reviewer as human-in-the-loop proxy | 2, 6 | Explained |
| When a single agent is enough | 2 | Explained |
| Pipeline stages (Triage → Investigator → Gate → Fixer → Reviewer); Triage's label is printed, not passed on | 3 | Explained |
| Relevance gate + the Kafka/payments mismatch incident | 3 | Explained (real validation story) |
| Reviewer's APPROVE/REJECT rules; it gets the fix plus the runbook passage | 6 | Explained |
| Declarative crew (4 Markdown profiles + 1 pipeline) | 4 | Explained |
| CrewAI (agents.yaml/tasks.yaml, delegation) | 4 | Explained |
| LangGraph (explicit graph, checkpointing) | 4 | Explained |
| Standards converge (MCP/ChromaDB/Ollama unchanged across orchestrators) | 4 | Explained |
| Resource budget table (model/ChromaDB/crew container) | 5 | Explained |
| Declarative vs CrewAI+gemma3:4B cost comparison | 5 | Explained |
| Compose wiring: two services (crew, ChromaDB), model native, ToolHive outside compose | 5 | Explained |
| Lab preview (503 → APPROVED, Kafka → REJECTED/escalate) | 6 | Explained (bridge only, not demonstrated on-video) |

## Verification flags

- Resource figures (model ~3.5 GB, embedding model ~0.3 GB, ChromaDB ~15 MB, crew container ~15 MB, total ~4 GB; CrewAI+gemma3:4B ~4.5 GB) were re-measured on 2026-10-21 with `ollama ps` and `docker stats` while the crew ran (the CrewAI figure is an estimate, not measured); they depend on the exact model build and OS memory accounting, and may drift with model/runtime versions.
- The Kafka/payments relevance-gate mismatch is stated in the lesson as something that happened "during validation" — kept as a real incident, not invented for narration.
