# Module 6 — The Declarative Agent (Agentic RAG) · Explainer Deck Sequence

**Deck:** `decks/06-declarative-agent.html` · 14 slides · black-and-white reveal.js (matches `00-introduction.html` template).

This deck walks a learner through Module 6 *before* the hands-on lab: from the limits of naive RAG, through the anatomy of a 2026 declarative agent (AGENTS.md + SOUL.md + Skills + MCP + guardrails), the agentic-RAG decision loop, the ToolHive MCP gateway, guardrails and memory, and finally the container story that leads into the lab.

---

## Slide table

| # | Title | One-line purpose | Visual |
|---|---|---|---|
| 1 | The Declarative Agent | Title — kicker "MODULE 6 · DAY 2"; Aria assembled from files in a container | Container with persona core + 4 file/tool spokes |
| 2 | What you'll learn | Five module objectives | Numbered rows (1–5) |
| 3 | Naive RAG is passive — it always retrieves | Motivating problem: no judgment, no routing, no tools | Two questions forced down one embed→retrieve→generate path |
| 4 | Onboard an engineer — don't script a robot | Analogy: job desc + rulebook + skill guides = SOUL/AGENTS/SKILL | Three documents handed to a model = engineer |
| 5 | The anatomy of a 2026 agent | Five labelled parts + minimal glue | File/format anatomy: 5 parts → agent.py → Aria |
| 6 | Declarative Markdown vs a hand-coded robot | Declarative vs framework decided up front | Left dashed (brittle Python) → right solid (editable Markdown) |
| 7 | Agentic RAG — decide first, then act | The decision loop: whether/what to retrieve | Guardrail → route YES/NO → retrieve+ground / direct → answer |
| 8 | A 1.5B model can route reliably | Routing proven at temp 0, two classes | Query → route table (YES/NO) |
| 9 | Real tools through an MCP gateway | ToolHive hub-and-spoke over isolated tool containers | Hub (ToolHive) + 5 spokes (web/GitHub/fs/HTTP/db) |
| 10 | Each tool server in its own sandbox | `thv run fetch` → proxy + DNS isolation | fetch server boxed by ingress/egress/DNS; reaches net, not host |
| 11 | Guardrails — refuse before the model runs | Hard regex gate in app code, not soft prompt | Unsafe → refused (LLM never called); safe → passes |
| 12 | Memory — a librarian who shelves by meaning | ChromaDB long-term semantic memory reused from M5 | Query → embed → shelved chunks → grounded answer |
| 13 | The whole agent ships in a container | Markdown + skills + MCP config bundled into one image | Agent container → Ollama (native) / ChromaDB / ToolHive |
| 14 | The agent IS Markdown + skills + tools | Closing big idea + lab lead-in | 3 files → Aria → routes 3 queries (retrieve/answer/refuse) |

---

## Recommended presentation order

Present **in file order (1 → 14)** — it is built as a single narrative arc:

1. **Frame (1–2):** title, then what the learner will walk away able to do.
2. **Motivate (3):** show the pain of Module 5's always-retrieve pipeline — this is the "why" the whole module answers.
3. **Reframe with the analogy (4):** onboarding an engineer with documents, not a flowchart — this is the mental model everything else hangs on.
4. **Anatomy + choice (5–6):** the five labelled parts, then why declarative Markdown beats a hand-coded robot (and where the framework line is drawn — M7).
5. **The core mechanism (7–8):** the agentic-RAG decision loop, then proof a tiny model can route.
6. **Tools + safety + memory (9–12):** the MCP gateway (hub-and-spoke), per-server isolation, guardrails, and ChromaDB memory.
7. **Land it (13–14):** it's a container story; then the closing big idea that dissolves straight into the lab.

If time is short, the minimum spine is **3 → 4 → 5 → 7 → 9 → 14** (problem → analogy → anatomy → loop → gateway → close).

---

## Gemini image-generation briefs

A few hero concepts land harder as a warm, hand-drawn illustration than as a schematic. These are optional — the inline SVGs already carry the baseline. Keep all briefs black ink on white, sketchy/whiteboard feel, uncluttered, no color.

**Brief A — Onboarding the engineer (for slide 4).**
A black-and-white hand-drawn whiteboard sketch: a calm new support engineer at a desk receiving three labelled paper documents from an unseen hand — one marked "Job description (SOUL)", one "Rulebook (AGENTS)", one "Skill guides (SKILL)". Above the engineer, a small thought bubble showing a lightbulb. Sketchy pen strokes, hatching for shadow only, no color fills, generous white space. The feeling should be "onboarding a human," not "wiring a machine." Landscape orientation, wide margins for a slide.

**Brief B — ToolHive hub-and-spoke gateway (for slide 9).**
A black-and-white hand-drawn diagram in a clean whiteboard style: a central rounded hub labelled "ToolHive (virtual MCP)" with five spokes radiating outward, each ending in a small shipping-container/box icon labelled respectively "web.fetch", "GitHub", "filesystem", "HTTP", "database". Each box is drawn as a slightly separate, sealed container to convey isolation. Thin hand-drawn arrows along the spokes. Black ink only on white, sketchy strokes, no color, no gradients. Landscape, uncluttered, room for a caption underneath.

**Brief C — The agent as Markdown in a container (for slide 5 or 13).**
A black-and-white hand-drawn illustration: an open shipping container, and inside it a small stack of Markdown files (SOUL.md, AGENTS.md, SKILL.md) plus a tiny gear labelled "agent.py glue" and a plug icon labelled "MCP". A friendly robot-ish figure named "Aria" stands beside the stack, clearly *made of* the files (dotted lines connecting the files to the figure). Sketchy black ink on white, whiteboard aesthetic, no color, plenty of white space. Convey "the agent IS markdown + skills + tools." Landscape orientation.

---

## Coverage check — every lesson concept mapped to a slide

| Lesson concept (lesson.md section) | Slide(s) |
|---|---|
| From docs assistant → agent; naive RAG always retrieves (§1) | 3 |
| Defining limit of naive RAG — no judgment about *when* (§1) | 3 |
| Analogy: job description + operating procedures + skill guides (§2) | 4 |
| Declarative vs hand-coded Python robot (§2) | 4, 6 |
| The three files: SOUL.md / AGENTS.md / SKILL.md + agent.py glue (§3) | 5, 1, 14 |
| "The model IS Aria; the Markdown IS Aria's brain" — minimal glue (§3) | 5, 14 |
| Agentic RAG routing decision before retrieval (§4) | 7 |
| Guardrail check → route YES/NO → retrieve/direct → ground (§4 diagram) | 7 |
| Whether / what to retrieve; deterministic routing at temp 0 (§4) | 7, 8 |
| Routing table proven on 1.5B model (§4) | 8 |
| MCP standard interface for tools, no embedded creds (§5) | 9 |
| ToolHive as MCP gateway; each server an isolated container (§5) | 9, 10 |
| `thv run fetch`; ingress/egress/DNS proxy isolation (§5) | 10 |
| IDE vs Stack connection modes; never install locally (§5) | 10 |
| Guardrail = hard app-layer regex before the model (§6) | 11 |
| Model is not a reliable safety gate; can't bypass a pre-model gate (§6) | 11 |
| Memory: ChromaDB semantic long-term store, reused from M5 (§7) | 12 |
| Idempotent ingest; 1 collection / 5 chunks; scales unchanged (§7) | 12 |
| Declarative enough vs when a framework is needed → M7 CrewAI (§8) | 6 |
| Container story — everything ships inside a container | 1, 13 |
| Objectives / what you'll learn | 2 |
| Lab lead-in: read files, start ChromaDB + agent, route 3 queries, wire MCP | 14 |

All eight lesson sections plus the container framing and objectives are represented. Framework/CrewAI is deliberately referenced (slide 6) but not expanded — it belongs to Module 7.
