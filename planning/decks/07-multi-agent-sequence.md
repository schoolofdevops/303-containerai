# Module 7 — The Multi-Agent Incident Crew · Explainer Deck Sequence

<!-- CourseSmith sequence spec — authored and approved BEFORE the deck HTML is built.
     Convention: whiteboard-style-guide.md §5. One row per slide; every slide needs
     purpose + visual + takeaway. NO slide-count cap (§0): one idea per slide, every
     lesson concept gets a slide — the coverage table below is a hard gate.

     2026-08-05 divider regen note: this revision adds one divider slide (§3a) per
     lesson `##` section — 1 The analogy: a hospital, not a superhero · 2 Why
     multi-agent? · 3 The incident crew's pipeline · 4 Two paths to multi-agent ·
     5 One model, four agents · 6 The Reviewer as human-in-the-loop proxy — in
     lesson order, renumbers every `.pageno` M7·01–M7·19, and tightens every `p.s`
     subtitle to ≤10 words/≤60 chars (hard fail 80) per the current whiteboard-style-
     guide.md §0/§3. It also strips the three em dashes that had crept into non-
     divider `h2.t`/`p.s` text (title subtitle, slide 10/now-15 subtitle, and the
     Reviewer slide's title) — comma or period instead, per the voice pipeline (SKILL
     §8). No content slide was reordered: the existing slide sequence already walked
     the lesson's six `##` sections in document order, so dividers slot in ahead of
     each section's first content slide with no reshuffling. 13 content slides + 6
     dividers = 19 slides total, up from the round-3 baseline's 13. -->

This companion doc maps the 19-slide explainer deck (`site/static/decks/07-multi-agent.html`) to the
Module 7 lesson (`site/docs/m7-multi-agent/lesson.md`). The deck teaches **concepts**, not commands — it
turns each of the lesson's analogies into a hand-drawn whiteboard visual a learner walks through before
opening the lab. The visual language follows the CourseSmith whiteboard style contract
(`coursesmith/templates/deck/whiteboard-style-guide.md`): Patrick Hand cursive, `#1e1e1e` primary /
`#757575` secondary strokes on white paper with the five semantic pastel fills (§1: green good · red
bad/full · blue data · orange caution · purple meta), the `#rough` wobble filter on shapes only, and the
shared `#ah`/`#ahg` arrowhead markers. The arc grows the single M6 agent into a crew — one agent doing
everything → **divider 1** → the hospital analogy → **divider 2** → the three properties a single agent
can't replicate → the boundary where a single agent is still the right call → **divider 3** → the
Incident Crew's sequential pipeline and its relevance gate → **divider 4** → the two ways to build a crew
(declarative vs framework) → the standard that lets you swap the orchestrator → **divider 5** → the
shared model and its real resource cost → wiring the crew into the growing Compose file → **divider 6** →
the Reviewer as human-in-the-loop proxy → hand-off to the lab.

## Slide table

| # | Slide | Purpose | Visual | Takeaway |
|---|-------|---------|--------|----------|
| 1 | The Multi-Agent Incident Crew (title) | Module framing: one agent grows into a crew of four sharing one model | title scene: Triage → Investigate → Fix → Review pipeline of four boxes | credit line: Gourav Shah · School of DevOps & AI |
| 2 | What you'll learn | Preview the four things this module locks in before the lab | numbered rows (circles 1–4) | the orchestrator changes — the skills, MCP tools, and model stay exactly the same |
| 3 | **1 · The analogy: a hospital, not a superhero** (divider) | Opens lesson §1 — the hospital analogy | — (divider) | — |
| 4 | One agent doing everything gets unfocused | The motivating problem: one overloaded agent vs a clean four-way split | fan-out: one "does everything" circle vs four tight-job boxes | a 1.5B laptop model handles four tight tasks reliably — but not one giant task blindly |
| 5 | A hospital, not a superhero | The analogy: no single doctor greets, diagnoses, prescribes, and countersigns | big-box anatomy: 4 hospital-role boxes (triage nurse/doctor/pharmacist/attending) mapped down onto 4 crew-role boxes | four staff share one health record; four agents share one model endpoint |
| 6 | **2 · Why multi-agent?** (divider) | Opens lesson §2 — specialisation, separation, review loops, and the single-agent boundary | — (divider) | — |
| 7 | Three things a single agent can't replicate | The three properties that earn the extra prompts and latency | three-panel row: specialisation / separation / review loop | specialisation, separation of concerns, and a review loop — especially for consequential actions |
| 8 | When is a single agent enough? | The decision boundary — multi-agent adds real overhead, don't reach for it by default | decision diagram: consequential-action question → NO/YES branches to two contract boxes | the M6 single agent is the right tool until an action needs a countersign |
| 9 | **3 · The incident crew's pipeline** (divider) | Opens lesson §3 — the crew's sequential pipeline and relevance gate | — (divider) | — |
| 10 | The Incident Crew pipeline | The crew's sequential flow and its relevance gate that can short-circuit | pipeline with a diamond gate: Triage → Investigate → gate? → Fixer → Reviewer → APPROVED/ESCALATE | the gate asks one yes/no question so a catastrophically wrong fix never reaches the output |
| 11 | **4 · Two paths to multi-agent** (divider) | Opens lesson §4 — declarative vs framework, and the standards that converge | — (divider) | — |
| 12 | Two paths to multi-agent | Declarative profiles vs an orchestration framework | two-panel comparison: declarative box vs framework (LangGraph/CrewAI) box | reach for a framework when you need deterministic, auditable control over a complex workflow |
| 13 | Swap the orchestrator, not the tools | Three interchangeable orchestrators sit above one shared standards layer | hub/stack: 3 orchestrator boxes → one shared layer of Skills/MCP tools/Guardrails | build against the standard, swap the implementation — the same lesson as the OpenAI-compatible endpoint |
| 14 | **5 · One model, four agents** (divider) | Opens lesson §5 — the resource budget and the Compose wiring | — (divider) | — |
| 15 | One model, four agents | Agents are cheap Python calls; the model is the expensive, shared part | hub-and-spoke: Ollama hub center, 4 agent boxes on spokes | four separate model instances would cost 4× the memory for zero gain — all four call one endpoint |
| 16 | Wire the crew with the Compose Spec | Each agent a lightweight service, all sharing one endpoint, tools, and memory | big-box anatomy: dashed compose.yaml boundary with crew/ToolHive/ChromaDB boxes, arrow out to native Ollama | one growing compose file gains a crew service — reusing the tools and memory you already built |
| 17 | **6 · The Reviewer as human-in-the-loop proxy** (divider) | Opens lesson §6 — the Reviewer's role and final human authority | — (divider) | — |
| 18 | The Reviewer, human-in-the-loop proxy | The Reviewer decides if the fix is safe to show a human, not whether to fix it | fan-out: Reviewer box → APPROVED/REJECTED outcome boxes → Human decides box | the crew produces a vetted recommendation; the human engineer retains final authority |
| 19 | Swap the orchestrator, keep the crew (closing) | Hand off to the lab: run both incidents, watch the relevance gate work | pipeline scene: Triage → Investigate → Fix → Review, branching to 503→APPROVED and Kafka→ESCALATE | read the four profiles, run both incidents, watch the relevance gate work; credit + lab hand-off |

<!-- Visual pattern vocabulary used above (reuse before inventing):
     fan-out (4, 7, 18) · two-panel comparison (12) ·
     big-box anatomy (5, 16) · numbered rows (2) · pipeline (1, 10, 19) ·
     decision diagram (8) · hub-and-spoke (13, 15) · divider (3, 6, 9, 11, 14, 17) -->

## Recommended presentation order

Present strictly 1 → 19; each slide's vocabulary is used by the next. Open on the title scene (1) and the
four-idea preview (2) to set expectations. Divider 3 ("1 · The analogy: a hospital, not a superhero")
hands off to slide 4, the motivating problem — linger on it, because "one agent gets unfocused" is the gap
every later slide fills. Slides 4–5 are one continuous build-up on the analogy: slide 4 names the problem,
slide 5 lands the hospital scene — present these two back to back, right after divider 3. Divider 6 opens
"Why multi-agent?"; slide 7 turns the analogy into the concrete three properties (specialisation,
separation, review loop), and slide 8 is the conceptual hinge worth slowing down on — the boundary between
"M6 is enough" and "reach for a crew" is the decision every learner must internalize before the lab; do
not rush it. Divider 9 opens the Incident Crew's own pipeline (slide 10) — the second hinge; walk it hop
by hop verbally even though the slide is static, and make the "NO runbook found → escalate" short-circuit
land explicitly. Divider 11 opens the matched pair on the two build paths (slide 12) and the standard that
makes them interchangeable (slide 13) — present together, and be explicit at slide 13 that this is the
same build-against-the-standard lesson as the OpenAI-compatible endpoint from earlier modules. Divider 14
opens the mechanics pair: slide 15 (resource budget) and slide 16 (Compose wiring) — compress under time
pressure if needed, but keep the "4× memory for zero gain" number audible. Divider 17 opens slide 18 (the
Reviewer), an independent single-concept slide — present at normal pace. Slide 19 hands off to the lab —
say the closing line and stop talking, let the lab do the proving.

## Fragment map

This deck carries no build-ups — every content slide (3–19, excluding the six title-only dividers) is
presented as a single static, already-complete picture, matching the original authoring. This suits the
content: slide 8 is a decision contract that reads better whole, slide 10 is a pipeline diagram meant to
be read at a glance, and 5/13/15/16 are anatomy/hub-and-spoke layouts intended to be read as one complete
picture rather than revealed hop-by-hop. No fragments were added in this divider regen — a future revision
could fragment slide 10 (Triage → Investigate → gate → Fixer/Reviewer → outcome) or slide 15 (Ollama hub →
each agent spoke added one at a time) if a presenter wants a build.

Divider slides (3, 6, 9, 11, 14, 17): title-only, read in full on entry, no visual to reveal.
Static content slides (1, 2, 4, 5, 7, 8, 10, 12, 13, 15, 16, 18, 19): read in full on entry — no
reveal-in-steps behavior in this deck.

## Coverage check (HARD GATE — §0)

Every lesson section/concept maps to a slide, including its own divider. No orphans against the lesson.

| Lesson section / concept | Slide(s) | Notes (analogy used, echoes/forward pointers) |
|---|---|---|
| Module framing / what you'll learn | 1, 2 | title scene (four-role pipeline sharing one model) + numbered-rows preview of all four learning objectives |
| §1 The hospital analogy — triage nurse, doctor, pharmacist, attending physician; no single doctor does everything; one shared health record | 3 (divider), 4, 5 | divider 3 opens the section verbatim; slide 4 = the motivating "one agent gets unfocused" problem; slide 5 = big-box anatomy mapping the four hospital roles onto the four crew roles |
| §2 Why multi-agent — specialisation, separation of concerns, review loops | 6 (divider), 7 | divider 6 opens the section verbatim; slide 7 = three-panel row, one box per property |
| §2 When is a single agent enough — one use case end-to-end, no separate safety review, no consequential action | 8 | decision diagram: consequential-action question branching to a single-agent contract box or a reach-for-a-crew contract box |
| §3 The incident crew's pipeline — sequential stages, the relevance gate, the Kafka/payments-runbook near-miss, the NO-runbook escalate short-circuit | 9 (divider), 10 | divider 9 opens the section verbatim; slide 10 = pipeline with a diamond gate: Triage → Investigate → gate? → Fixer → Reviewer → APPROVED/ESCALATE |
| §4 Two paths — declarative (four Markdown profiles + one Python pipeline, stdlib only) vs framework (CrewAI role-based, LangGraph graph + checkpointing) | 11 (divider), 12 | divider 11 opens the section verbatim; slide 12 = two-panel comparison: declarative box (profiles + pipeline) vs framework box (LangGraph/CrewAI) |
| §4 The standards converge — MCP, ChromaDB, Ollama are the same across declarative and framework crews; build against the standard, swap the implementation | 13 | hub/stack: three interchangeable orchestrator boxes sitting above one shared Skills/MCP tools/Guardrails layer |
| §5 One model, four agents — the resource table (~1 GB model, ~200 MB ChromaDB, ~50 MB crew container, ~1.3 GB total); agents are cheap, the model is shared; four separate instances would cost 4× | 14 (divider), 15 | divider 14 opens the section verbatim; slide 15 = hub-and-spoke: Ollama hub at center (native, ~1 GB), four agent boxes on spokes, resource total as a caption |
| §5 The crew wired as Compose services — reuses the tools and memory already built, model server stays native, containers reach it over host.docker.internal | 16 | big-box anatomy: dashed compose.yaml boundary holding crew/ToolHive/ChromaDB boxes, arrow out to the native Ollama model-server box across `:11434` |
| §6 The Reviewer as human-in-the-loop proxy — decides if the fix is safe to show a human (not whether to fix); APPROVE if non-destructive + verbatim runbook, REJECT if destructive/secrets/ungrounded, when in doubt REJECT; human retains final authority | 17 (divider), 18 | divider 17 opens the section verbatim; slide 18 = fan-out: Reviewer box → APPROVED/REJECTED outcome boxes → Human-decides box |
| Summary table — multi-agent crew, why multi-agent, when one agent is enough, declarative crew, CrewAI, LangGraph, one shared model, relevance gate, Reviewer, standards converge | 7, 8, 10, 12, 13, 15, 18 | the summary table's ten rows are each already covered by their own dedicated slide above — no separate summary slide needed, avoiding a redundant orphan-free repeat |
| Closing hand-off — read the four profiles, run the 503 incident to APPROVED, run the Kafka incident to ESCALATE, watch the relevance gate | 19 | pipeline scene: Triage → Investigate → Fix → Review, branching to 503→APPROVED and Kafka→ESCALATE. No dedicated divider — the lesson's closing hand-off is an unheaded paragraph, not a `##` section, and this closing slide already carries the hand-off (style-guide §3a skip exception) |

**No orphans.** All 13 original content slides, all six lesson `##` sections (each with its own
divider, in lesson order, verbatim title text), and all lesson §1–§6 concepts (the hospital analogy, why
multi-agent, the single-agent boundary, the Incident Crew's pipeline and relevance gate, the two build
paths and their converging standards, the one-model resource budget, the Compose wiring, and the
Reviewer's human-in-the-loop role) are covered above with an explicit slide mapping. Slide count is 19
(13 content + 6 dividers), pagenos `M7·01`–`M7·19`, renumbered sequentially in final presentation order —
no content slide reordering was required since the existing sequence already walked the lesson's six
sections in document order.

## Narration + illustrations (2026-08-14 pass)

- **Narration**: `planning/narration/07-narration.md` — 5 videos (talking-head intro, specialisation/
  separation/review-loop, pipeline walkthrough, declarative-vs-framework, recap/lab-bridge), authored via
  `lesson-to-video-narration`.
- **Rough-filter bug fixed**: the shared `#rough` SVG wobble filter used the default `objectBoundingBox`
  region (`x="-5%" y="-5%" width="110%" height="110%"`), which silently makes any perfectly horizontal/
  vertical line invisible. Switched to `filterUnits="userSpaceOnUse" x="-80" y="-80" width="1300"
  height="600"`.
- **Magnific illustrations added** (2 images, pencil-sketch style-locked, white-level corrected,
  `site/static/img/decks/07-multi-agent/`):
  - Slide 3 (divider 1, "The analogy: a hospital, not a superhero") →
    `hospital-crew-four-roles.jpg` — triage nurse, doctor, pharmacist, attending physician each doing
    one job. New `divider-img` class (image-on-top via CSS `order`, text below, taller autofit ceiling)
    added scoped to only these two illustrated dividers — the other four dividers stay text-only.
  - Slide 17 (divider 6, "The Reviewer as human-in-the-loop proxy") →
    `reviewer-human-in-loop-signoff.jpg` — a senior physician reviewing and signing a colleague's note,
    approve/reject stamp tray on the desk.
