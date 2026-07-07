# Module 7 — Multi-Agent Incident Crew · Explainer Deck Sequence

Companion sequencing notes for `07-multi-agent.html` (reveal.js, 13 slides, black-and-white
hand-drawn style matching `00-introduction.html`). Module 7, Day 2 of **Containers for GenAI &
Agentic AI — The Open-Source Way**, Gourav Shah, School of DevOps & AI.

This deck walks a learner from "why grow one agent into a crew" through the hospital analogy, the
Triage → Investigator → Fixer → Reviewer pipeline, the declarative-vs-framework choice, the
shared-model budget, and the Compose wiring — before the hands-on lab.

---

## Slide table

| # | Title | Type | Core concept | Analogy / visual |
|---|-------|------|--------------|------------------|
| 1 | The Multi-Agent Incident Crew | Title | Kicker MODULE 7 · DAY 2; the crew of four | Four-box Triage→Investigate→Fix→Review pipeline |
| 2 | What you'll learn | Objectives | Why / when / two paths / Compose | Four numbered rows |
| 3 | One agent doing everything gets unfocused | Problem | Overloaded single agent vs clean split | One big circle → four clean boxes |
| 4 | A hospital, not a superhero | Analogy | Roles map onto crew | Hospital roles above crew roles |
| 5 | Three things a single agent can't replicate | Concept | Specialisation · separation · review loop | Three pillars |
| 6 | When is a single agent enough? | Concept | Decision: consequential action → crew | Yes/no decision fork |
| 7 | The Incident Crew pipeline | Concept | Sequential pipeline + relevance gate | Flow with diamond gate → APPROVED / ESCALATE |
| 8 | Two paths to multi-agent | Concept | Declarative default vs framework | Two panels: declarative / LangGraph+CrewAI |
| 9 | Swap the orchestrator, not the tools | Concept | Shared skills+MCP+guardrails layer | Three orchestrators over one shared layer |
| 10 | One model, four agents | Concept | Shared model, 16 GB budget | Hub-and-spokes: 4 agents → 1 Ollama hub |
| 11 | Wire the crew with the Compose Spec | Concept | Each agent a service on one endpoint | Compose box → native model over host.docker.internal |
| 12 | The Reviewer — human-in-the-loop proxy | Concept | Approve/reject → human decides | Reviewer → APPROVED/REJECTED → Human |
| 13 | Swap the orchestrator, keep the crew | Closing | Lab lead-in: 503 APPROVED, Kafka ESCALATE | Pipeline → two outcomes |

---

## Recommended presentation order

Present in file order (1 → 13). The arc is deliberate:

1. **Hook (1–2):** name the crew and set the four learning goals.
2. **Motivate (3):** show the pain of one overloaded agent before offering the fix.
3. **Anchor with analogy (4):** the hospital makes the four roles intuitive and justifies the
   review step — deliver this slowly, it carries the whole module.
4. **Justify + bound (5–6):** the three properties that earn multi-agent, then the discipline of
   *not* using it when a single M6 agent suffices. Slide 6 is the "when" — do not skip it.
5. **Build the mental model (7):** the pipeline and the non-optional relevance gate. Tell the
   Kafka-picks-payments story here.
6. **The two paths + convergence (8–9):** declarative default, framework when needed, then the big
   idea — you swap the orchestrator, never the tools. Slide 9 is the module's thesis.
7. **Ground it in resources (10–11):** shared model (16 GB budget) and the Compose wiring that
   reuses everything built in M5/M6.
8. **The safety story (12):** the Reviewer as human proxy — the reason a crew is trustworthy.
9. **Land in the lab (13):** the two concrete incidents they'll run.

If short on time, the minimum spine is 1, 4, 7, 9, 13. Slides 5, 6, 12 are the highest-value adds
back in.

---

## Gemini image-generation briefs

Three concepts where a photographic or richer illustration could replace or complement the sketch.

### Brief A — Hospital roles (slide 4)
> A clean, minimal black-and-white line illustration of a hospital patient journey shown as four
> stations left to right: a triage nurse at an intake desk, a doctor examining a chart, a pharmacist
> at a dispensing counter, and an attending physician reviewing and signing a document. Above all
> four, a single shared electronic health-record screen they all connect to with thin lines. Flat,
> uncluttered, hand-drawn whiteboard aesthetic, no color, generous white space, no text labels.
> Wide 16:9 composition suited to a presentation slide.

### Brief B — Hub-and-spokes shared model (slide 10)
> A minimalist black-and-white diagram of a central glowing compute core labeled as a single AI
> model, with four thin spokes radiating to four small identical worker nodes arranged around it.
> Emphasize that the center is large and heavy while the four workers are tiny and light, conveying
> "one expensive shared brain, four cheap helpers." Hand-drawn sketch style, no color, white
> background, plenty of negative space, 16:9, no text.

### Brief C — Reviewer gate as a safety checkpoint (slide 12)
> A black-and-white sketch of a quality-control checkpoint: a proposed action on a conveyor arrives
> at an inspector who stamps it either APPROVED (green-free, just a check mark) onto one lane or
> REJECTED onto a diverging lane that leads to a human at a desk making the final call. Convey
> "machine vets, human decides." Clean hand-drawn whiteboard style, monochrome, uncluttered, wide
> 16:9 framing, minimal or no text.

---

## Coverage check — every lesson concept mapped to a slide

| Lesson concept (lesson.md) | Slide(s) |
|---|---|
| Hospital-not-superhero analogy | 4 |
| Grow M6 single agent into a crew of four | 1, 4 |
| Roles: Triage / Investigator / Fixer / Reviewer | 1, 4, 7, 13 |
| Why multi-agent — specialisation | 5 |
| Why multi-agent — separation of concerns | 5 |
| Why multi-agent — review loops | 5, 12 |
| When a single agent is enough | 6 |
| Reach for a crew when action is consequential | 6 |
| Sequential pipeline | 7, 13 |
| Relevance gate (Kafka-picks-payments failure) | 7 |
| Short-circuit → ESCALATE when no runbook | 7, 13 |
| Declarative path (profiles + one pipeline) | 8 |
| Framework: LangGraph (graph, checkpointing, audit) | 8 |
| Framework: CrewAI (role-based, agents/tasks.yaml) | 8 |
| Standards converge — swap orchestrator not tools | 2, 9 |
| Shared skills / MCP tools / guardrails layer | 9 |
| One model, four agents (agents are cheap) | 10 |
| 16 GB budget / ~1.3 GB total | 10 |
| Native model over host.docker.internal | 10, 11 |
| Compose wiring — each agent a service | 11 |
| Reuse Agentic-RAG assistant + ToolHive + vector memory | 11 |
| Reviewer as human-in-the-loop proxy; APPROVE/REJECT | 12 |
| Human retains final authority | 12 |
| Lab: 503 → APPROVED, Kafka → ESCALATE | 13 |

All lesson concepts are covered. No slide introduces material absent from the lesson/lab.
