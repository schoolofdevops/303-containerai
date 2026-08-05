# Module 6 — The Declarative Agent · Explainer Deck Sequence

<!-- CourseSmith sequence spec — authored and approved BEFORE the deck HTML is built.
     Convention: whiteboard-style-guide.md §5. One row per slide; every slide needs
     purpose + visual + takeaway. NO slide-count cap (§0): one idea per slide, every
     lesson concept gets a slide — the coverage table below is a hard gate.

     2026-08-05 divider regen: this revision adds one divider slide per lesson §1–§8
     section (style-guide §3a) and reorders two content slides into strict lesson
     order, per the newest coursesmith deck-author contract. The prior round-3 spec
     (14 slides, no dividers) is the content-parity baseline — every fact/diagram/
     scene below is unchanged from that baseline; only structure (dividers +
     reorder), subtitle length, and on-slide wording were touched.

     Reorder note: the old deck taught slide order 4 (onboarding analogy) → 5 (agent
     anatomy / three files) → 6 (declarative vs hand-coded) as one narrative build-up
     (see the superseded "Recommended presentation order" section below). But slide 6's
     content — the hand-coded-robot-vs-declarative-Markdown contrast — is lesson
     material that belongs to §2 (it's the second half of "The analogy: a job
     description and a rulebook", read the lesson text: the hand-coded/declarative
     contrast comes directly after the three-document analogy and BEFORE §3 "The
     three files that define Aria" begins). Old slide 5 (agent anatomy) is §3
     material. Mapped strictly in lesson order, slide 6 must sit before slide 5, not
     after. Reordered: 4 → 6 → [divider 3] → 5. This is the one structural swap in
     this revision; every other slide already sat in lesson order. -->

This companion doc maps the 22-slide explainer deck (`site/static/decks/06-declarative-agent.html`) to
the Module 6 lesson (`site/docs/m6-declarative-agent/lesson.md`). The deck teaches **concepts**, not
commands — it turns each of the lesson's analogies into a hand-drawn whiteboard visual a learner walks
through before opening the lab, now with a divider slide marking each of the lesson's eight `##`
sections so the deck doubles as a navigable map. The visual language follows the CourseSmith whiteboard
style contract (`coursesmith/templates/deck/whiteboard-style-guide.md`): Patrick Hand cursive, `#1e1e1e`
primary / `#757575` secondary strokes on white paper with the five semantic pastel fills (§1: green good
· red bad/full · blue data · orange caution · purple meta), the `#rough` wobble filter on shapes only,
and the shared `#ah`/`#ahg` arrowhead markers. The arc moves from problem to proof — naive RAG's blind
retrieval → the onboarding-a-new-hire analogy and its hand-coded-vs-declarative contract → an agent's
anatomy in five Markdown/tool parts → the decide-first agentic-RAG loop → routing proven on a small
model → real tools wired in through an isolated MCP gateway → hard guardrails that fire before the
model runs → long-term memory reused from M5 → the whole agent packaged as one container → hand-off to
the lab.

## Slide table

| # | Slide | Purpose | Visual | Takeaway |
|---|-------|---------|--------|----------|
| 1 | The Declarative Agent (title) | Module framing: an agent you write down, not code up | title scene: container boundary holding a labelled "Aria" core box, fed by SOUL.md/AGENTS.md on one side and SKILL.md/MCP tools on the other | credit line: Gourav Shah · School of DevOps & AI |
| 2 | What you'll learn | Preview the five things this module locks in before the lab | numbered rows (circles 1–5) | the agent IS Markdown + skills + tools — minimal glue, shipped inside a container |
| 3 | **Divider — "1 · From a docs assistant to an agent"** | Opens §1 | — (divider) | — |
| 4 | Naive RAG is passive, it always retrieves | M5's pipeline has no judgment: every question takes the same road | two-panel-style fan-out: an ops question and a trivia question both forced through the same embed→retrieve→generate pipe to "answer" | naive RAG can't decide, can't route, can't use tools — it only ever retrieves-then-generates |
| 5 | **Divider — "2 · The analogy: a job description and a rulebook"** | Opens §2 | — (divider) | — |
| 6 | Onboard an engineer, don't script a robot | The analogy: you hand a new hire three documents, not a flowchart | big-box anatomy: job-desc / rulebook / skill-guides boxes converging into a "model = engineer" box | write the three documents as Markdown; the model reads them and becomes the engineer |
| 7 | Declarative Markdown vs a hand-coded robot | Changing tone or adding a guardrail is an edit, not a code change — the §2 analogy's payoff | two-panel comparison: dashed "hand-coded robot" box vs solid "declarative agent" box | declarative vs framework is decided up front — one agent + clear rules stays Markdown; frameworks wait for M7 |
| 8 | **Divider — "3 · The three files that define Aria"** | Opens §3 | — (divider) | — |
| 9 | The anatomy of a 2026 agent | Five labelled parts — persona, instructions, skill, tools, guardrails — plus minimal glue | fan-out: 5 stacked file boxes → `agent.py` glue box → "Aria runs" box | no framework, no class hierarchy — just Markdown read at startup and stitched into the system prompt |
| 10 | **Divider — "4 · Agentic RAG versus naive RAG"** | Opens §4 | — (divider) | — |
| 11 | Agentic RAG, decide first, then act | The agent routes each question before retrieving | decision loop diagram: guardrail check → route YES/NO → retrieve+ground or answer directly → answer | routing at temperature 0 is deterministic — whether, what, multi-hop, self-correct — before any embedding call |
| 12 | A 1.5B model can route reliably | Two classes, temperature 0 — the decision is simple enough for a laptop model | table/row pattern: 3 example queries each labelled YES/NO route | route deterministically at temp 0; generate the nuanced answer at higher temp, grounded in evidence |
| 13 | **Divider — "5 · MCP tools via ToolHive"** | Opens §5 | — (divider) | — |
| 14 | Real tools through an MCP gateway | ToolHive at the hub; each MCP server an isolated container on a spoke | hub-and-spoke: ToolHive circle at center, 5 tool-server boxes on spokes | per-request Cedar policy, per-server network isolation, no local creds — the agent points at one endpoint URL |
| 15 | Each tool server in its own sandbox | `thv run fetch` wraps a server in proxy + DNS containers | big-box anatomy inside a dashed isolation boundary: fetch server + ingress/egress/DNS boxes, arrow out to "public internet", crossed-out arrow to host | you never install a tool server on your laptop — IDE mode for dev, stack mode for headless compose runs |
| 16 | **Divider — "6 · Guardrails"** | Opens §6 | — (divider) | — |
| 17 | Guardrails refuse before the model runs | A hard regex gate in application code, not a soft plea in the system prompt | fan-out: unsafe/safe query boxes → regex-guardrail box → refused/routed-to-model outcome boxes | a clever prompt can't bypass a gate that fires before any text reaches the model |
| 18 | **Divider — "7 · Memory"** | Opens §7 | — (divider) | — |
| 19 | Memory, a librarian who shelves by meaning | ChromaDB is Aria's long-term semantic memory, reused unchanged from M5 | pipeline: query box → embed arrow → shelved-chunks box (ChromaDB) → grounded-answer box | same HTTP API, same collection — scales from five chunks to millions of vectors unchanged |
| 20 | **Divider — "8 · Declarative versus framework"** | Opens §8 | — (divider) | — |
| 21 | The whole agent ships in a container | Markdown + skills + MCP config bundled — portable, reproducible, one image | big-box anatomy: dashed agent-container boundary with 5 inner file/glue boxes, wired out to 3 native/service boxes | build the image once; the same agent runs identically on any laptop, CI, or headless compose stack; the closing counter-case for §8's "when a framework is enough" is M7's CrewAI |
| 22 | The agent IS Markdown + skills + tools (closing) | Hand off to the lab: read the three files, run the agent, wire in a tool | pipeline scene: 3 Markdown files → Aria box → 3 routed outcomes (retrieve, answer, refuse) | read the three files that are Aria, start ChromaDB + the agent, then wire in a live MCP tool; credit + lab hand-off |

<!-- Visual pattern vocabulary used above (reuse before inventing):
     fan-out (2 as numbered rows, 4, 9, 14, 17, 22) · two-panel comparison (7) ·
     big-box anatomy (6, 15, 21) · numbered rows (2) · pipeline (19, 22) · decision loop (11) ·
     table/rows (12) · hub-and-spoke (14) -->

## Recommended presentation order

Present strictly 1 → 22; each divider is a scene break for the presenter as much as a map marker for
the learner. Open on the title scene (1) and the five-idea preview (2) to set expectations, then hit
divider 1 and land on slide 4 — the motivating problem. Linger on slide 4, because "naive RAG can't
decide" is the gap every later section fills; make the wasted-embed-call-on-2+2 fact land before moving
on. Divider 2 opens the onboarding analogy: slides 6–7 are one continuous build-up — slide 6 lands the
three-document analogy, slide 7 turns it into the hand-coded-vs-declarative contract — present these two
back to back without a break, and be explicit at slide 7 that the declarative-vs-framework choice is
made *up front*, not by accident (this pays off again at slide 21 / divider 8). Divider 3 opens the
concrete anatomy (slide 9) — the five Markdown/tool/glue parts. Divider 4 opens the conceptual hinge of
the whole module — the decide-first loop (slide 11) — slow down here; slide 12 immediately proves the
hinge with a concrete example, present 11 and 12 as a matched pair. Divider 5 opens the tool-access pair:
slides 14–15 (the gateway, then its isolation mechanics) — compress slide 15 under time pressure if
needed (it is mechanics, not a new concept) but never compress 11 or 14. Divider 6 (guardrails, slide 17)
and divider 7 (memory, slide 19) are independent single-concept sections — present at normal pace, no
special lingering required. Divider 8 opens the zoom-out: slide 21 shows the whole packaged agent and is
where the declarative-vs-framework decision resolves (M7 preview); slide 22 hands off to the lab — say
the closing line and stop talking, let the lab do the proving.

## Fragment map

This deck carries no build-ups — every content slide (2, 4, 6, 7, 9, 11, 12, 14, 15, 17, 19, 21, 22) and
every divider is presented as a single static, already-complete picture. This matches the prior
baseline's construction (no `fragment` classes existed) and suits the content: slide 7 is a comparison
pair that reads better whole, slide 11 is a decision-loop diagram meant to be read at a glance, and
6/9/14/15/21 are anatomy/hub-and-spoke layouts intended to be read as one complete picture rather than
revealed hop-by-hop. Dividers are inherently static (title-only, no build-up applicable). A future
revision could fragment slide 11 (question → guardrail → route → retrieve/answer) or slide 14 (ToolHive
hub → each spoke added one at a time) if a presenter wants a build; the current spec keeps parity with
the approved content baseline.

Static slides (all of 1–22): read in full on entry — no reveal-in-steps behavior in this deck.

## Coverage check (HARD GATE — §0)

Every lesson section/concept maps to a slide, plus every lesson `##` section now also gets its own
divider slide (style-guide §3a). Baseline = the prior 14-slide deck (all content preserved, only
structure/wording changed); confirming no orphans against both the lesson and the prior deck.

| Lesson section / concept | Slide(s) | Notes (analogy used, echoes/forward pointers, divider) |
|---|---|---|
| Module framing / what you'll learn | 1, 2 | title scene (Aria assembled from Markdown + tools inside a container) + numbered-rows preview of all five learning objectives — no divider (not a lesson `##` section) |
| §1 From a docs assistant to an agent — naive RAG always retrieves, no judgment about *when* | **divider 3** (opens §1), 4 | divider title "1 · From a docs assistant to an agent" verbatim; slide 4 = fan-out: an ops question and a trivia question both forced through the same embed→retrieve→generate pipe |
| §1 Aria, same model/vector-store/network pattern as M5, Acme runbooks reused | 4, 19 | carried as narration/labels rather than a separate slide — reuse-from-M5 is echoed again at slide 19 (ChromaDB memory) to avoid an orphan without adding a redundant slide |
| §2 The analogy: a job description and a rulebook — job description, operating procedures, skill guides, hand-coded robot vs declarative | **divider 5** (opens §2), 6, 7 | divider title "2 · The analogy: a job description and a rulebook" verbatim; slide 6 = big-box anatomy of the three onboarding documents converging on "model = engineer"; slide 7 = two-panel comparison (hand-coded robot vs declarative agent), the analogy's own contract-making payoff — reordered before slide 9 (§3) to keep strict lesson order, since this content precedes "the three files" in the lesson text |
| §3 The three files that define Aria — SOUL.md, AGENTS.md, SKILL.md, agent.py glue | **divider 8** (opens §3), 9 | divider title "3 · The three files that define Aria" verbatim; slide 9 = fan-out: 5 stacked file/rule boxes → `agent.py` glue box → "Aria runs" |
| §4 Agentic RAG vs naive RAG — decide first (route YES/NO at temp 0), then retrieve if needed, then ground | **divider 10** (opens §4), 11 | divider title "4 · Agentic RAG versus naive RAG" verbatim; slide 11 = decision-loop diagram: guardrail check → route → retrieve+ground or answer directly → answer |
| §4 The routing table proven on a 1.5B model at temp 0 | 12 | table/rows pattern with 3 example queries and their YES/NO route |
| §5 MCP tools via ToolHive — MCP as a standard tool interface, `web.fetch`, IDE vs Stack connection modes | **divider 13** (opens §5), 14 | divider title "5 · MCP tools via ToolHive" verbatim; slide 14 = hub-and-spoke: ToolHive circle at center, 5 tool-server spokes (web.fetch, GitHub, filesystem, HTTP, database) |
| §5 ToolHive per-server isolation — `thv run fetch`, ingress/egress/DNS containers, cannot touch host or other containers | 15 | big-box anatomy inside a dashed isolation boundary; explicit "cannot touch host filesystem or other containers" label |
| §6 Guardrails — hard regex gate in application code before the model is ever called | **divider 16** (opens §6), 17 | divider title "6 · Guardrails" verbatim; slide 17 = fan-out: unsafe/safe queries → regex-guardrail box → refused (LLM never called) / routed-to-model outcomes |
| §7 Memory — ChromaDB as long-term semantic memory, same collection reused from M5, scales unchanged | **divider 18** (opens §7), 19 | divider title "7 · Memory" verbatim; slide 19 = pipeline: query → embed → shelved chunks (ChromaDB) → grounded answer |
| §8 Declarative vs framework — when Markdown+skill is enough vs when you need an orchestration framework (M7 preview) | **divider 20** (opens §8), 7, 21 | divider title "8 · Declarative versus framework" verbatim; slide 7's contract carries the "declarative is enough" side of the decision (echoed forward from §2); slide 21's packaged-container view plus its takeaway is where the M7 forward-pointer (CrewAI, multi-agent) lives, avoiding a redundant slide while keeping the concept covered |
| Summary table — the whole agent ships as one container image | 21 | big-box anatomy: dashed container boundary with 5 inner file/glue boxes wired to native Ollama + ChromaDB + ToolHive |
| Closing hand-off — read the 3 files, start the agent, route 3 queries, wire in a live MCP tool | 22 | pipeline scene: 3 Markdown files → Aria → 3 routed outcomes (retrieve, answer, refuse) |

**No orphans.** All 14 prior-deck content slides and all lesson §1–§8 concepts (naive RAG's blind
retrieval, the onboarding-a-new-hire analogy and its hand-coded-vs-declarative payoff, the three
Markdown files + minimal glue, agentic RAG's decide-first loop, the proven routing table, MCP tools via
the ToolHive gateway and its per-server isolation, hard application-layer guardrails, ChromaDB long-term
memory reused from M5, and the declarative-vs-framework decision that sets up M7) are covered above with
an explicit slide mapping, and every lesson `##` section additionally has its own divider slide (§1–§8,
dividers at slides 3, 5, 8, 10, 13, 16, 18, 20 — numbered in strict presentation order, which equals
lesson order here since only slides 6/7↔9 were reordered internal to §2/§3, not across divider
boundaries). Slide count: 14 content slides + 8 dividers = **22**, pagenos `M6·01`–`M6·22`, sequential
with no gaps.

**Structural change from the prior baseline (2026-08-05):** old slide 5 (agent anatomy, §3 material) and
old slide 6 (declarative vs hand-coded, §2 material) are swapped — old slide 6 now runs immediately after
old slide 4 (both §2), and old slide 5 now sits after the new divider 3 (§3 alone). This is the one
reorder required to put every content slide in strict lesson order 1→8; it was flagged and applied per
the "reorder is the default, even across a matched build-up" rule (two prior modules shipped
out-of-order dividers as a real defect — this revision does not repeat it). All facts/diagrams/scenes are
otherwise unchanged from the prior baseline; only structure (dividers + the one reorder), subtitle
length (rewritten to ≤10 words / ≤60 chars, §0), and on-slide wording (em dashes stripped from every
non-divider title/subtitle, run through `gourav-voice`) were touched.
