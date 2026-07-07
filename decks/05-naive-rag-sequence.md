# Module 5 — Docs Assistant: Naive RAG — Explainer Deck Sequence

**Course:** Containers for GenAI & Agentic AI — The Open-Source Way · Gourav Shah · School of DevOps & AI
**Module 5 · Day 2** — the first module of the Use Case A (Docs Assistant) arc.
**Deck file:** `decks/05-naive-rag.html` (self-contained reveal.js, black-and-white hand-drawn style).

This deck is the pre-lab explainer: it turns the lesson's concepts and analogies into visuals a learner
walks through before touching the `compose.yaml`. It teaches the *why* and *when*; the lab teaches the *how*.

---

## Slide table

| # | Title | Concept / analogy visualized | Core SVG |
|---|---|---|---|
| 1 | Docs Assistant — Naive RAG | Title. Question → context → grounded answer | three-box linear flow |
| 2 | What you'll learn | Five module objectives | numbered rows |
| 3 | A model alone can't answer about YOUR docs | The motivating problem: raw LLM confidently wrong vs RAG correct | left/right contrast (dashed=wrong) |
| 4 | Anatomy of a GenAI application | The four-part app anatomy | hub-and-spoke around a central app |
| 5 | A vector DB shelves by meaning, not title | **Librarian analogy** — filing cabinet vs meaning-space | left/right contrast + point cloud |
| 6 | Embeddings: text becomes coordinates | Embeddings put similar text near, unrelated far | text → model → 768-dim space |
| 7 | The naive-RAG pipeline | **Centerpiece** — ingest & query flows sharing the embed step | two linear rows + shared dashed link |
| 8 | Where the pieces run | Container boundary — native models vs containerised store/app | two-zone diagram over host bridge |
| 9 | ChromaDB — the lightest vector store | Default vs scale-up (Qdrant / pgvector) | default box → two option boxes |
| 10 | Wired via environment variables | Compose authored service by service; endpoints as env vars | compose file + one-block-per-service |
| 11 | Learning Mode — watch the pipeline run | Four live panels with timings | four numbered panels in sequence |
| 12 | Where naive RAG breaks down | Five failure modes → motivates M6 | five rows → arrow → M6 box |
| 13 | Retrieve, then generate — grounded | Closing big idea + lab lead-in | three-box question→chunk→command |

**Total: 13 slides.**

---

## Recommended presentation order

Present **1 → 13 in order**; the deck is built as a single narrative arc.

- **Open on the problem (1–3):** hook with the concrete failure — a raw model inventing a wrong
  `kubectl` command — before naming any machinery. Objectives (2) sit between so learners know the destination.
- **Build the mental model (4–6):** anatomy first (what the pieces are), then the librarian analogy
  (why a vector DB is different), then embeddings (the mechanism under the analogy). Do not skip 6 —
  the "same model embeds docs and queries" point is what makes slide 7 click.
- **Land the centerpiece (7):** spend the most time here. Walk the two rows and stress the shared
  embedding step. Everything before was setup for this diagram.
- **Ground it in containers (8–10):** where each piece runs, why ChromaDB, and how it's all wired in
  Compose. This is the bridge from concept to the hands-on lab.
- **Set up what's next (11–12):** Learning Mode makes the lab tangible; the failure-modes slide is the
  deliberate cliffhanger into Module 6.
- **Close and hand off (13):** restate the one-line payoff and point straight at the lab.

If short on time, slides 6 and 9 are the safest to compress (fold 6 into 5's takeaway; mention 9 verbally).

---

## Gemini image-generation briefs

Optional photographic/illustrative alternatives for concepts where a richer image beats a sketch. The deck
ships fully with inline SVG; these are enhancement assets only.

### Brief A — The librarian in meaning-space (for Slide 5)
> A single black ink line drawing on a plain white background, hand-sketched whiteboard style, no color.
> A calm librarian stands at the center of a vast circular library whose shelves are arranged not in
> straight rows but in soft clusters, like constellations, with faint dotted lines connecting books that
> share a theme. She holds a slip of paper (a question) and is walking toward the nearest cluster rather
> than reading spine labels. A few floating labels read "meaning," not "title." Loose, confident line
> weight, generous white space, uncluttered. No text blocks, no UI, no photorealism — pure marker sketch.

### Brief B — Grounded vs ungrounded answer (for Slide 3)
> A minimalist black-and-white hand-drawn illustration, whiteboard-marker aesthetic on white paper.
> Split composition: on the left, a robot confidently holding up a sign with a scribbled, crossed-out
> command and a small question-mark cloud above its head (guessing). On the right, the same robot reading
> from an open manual/runbook and holding a clean checkmarked note. A thin arrow labeled "add docs" bridges
> left to right. Simple, sketchy line art, no shading, no color, lots of negative space. No real text —
> keep any writing as suggestive squiggles.

### Brief C — The RAG pipeline as a conveyor (for Slide 7)
> A clean black-ink sketch on white, hand-drawn engineering-diagram style, no color, no fills. A horizontal
> conveyor belt carrying a document that transforms as it travels: whole page → torn into overlapping cards
> (chunks) → each card stamped into a small grid of dots (a vector) → dots dropping into a labeled bin
> ("vector store"). Below, a second shorter belt shows a single question card following the same stamping
> station and then pulling three matching cards out of the bin. Loose, confident lines, sketchy but legible,
> plenty of white space. Minimal labels as light handwriting only.

---

## Coverage check — every lesson concept mapped to a slide

| Lesson concept (source: `site/docs/m5-naive-rag/lesson.md`) | Slide(s) |
|---|---|
| The problem: ungrounded answers; raw LLM confidently wrong | 3 |
| RAG = cheat sheet at query time, no fine-tuning, just wiring | 1, 3 |
| Anatomy: LLM endpoint + embedding model + vector DB + application | 4 |
| Already have LLM + embeddings from M2/M3; compose grows by 2 services | 4 |
| Librarian analogy — shelves by meaning, not title | 5 |
| Embeddings = 768-dim coordinates; similar near, unrelated far | 5, 6 |
| Same embedding model for docs and queries | 6, 7 |
| Naive-RAG pipeline: ingest (load→chunk→embed→store) + query (embed→retrieve→augment→generate) | 7 |
| Container boundary: Ollama native, ChromaDB + app containerised, host.docker.internal | 8 |
| ChromaDB lightest / default (≤2 GB); pinned 0.5.20 | 9 |
| Scale-up: Qdrant / pgvector; near-identical API | 9 |
| Wired via environment variables; portable across runtimes | 10 |
| Compose authored by hand service by service | 10 |
| Learning Mode: query embedding, similarity search, retrieved context, generation + timings | 11 |
| Where naive RAG breaks (query mismatch, chunk boundary, single-pass, no rewrite, stale index) | 12 |
| Motivates Module 6 agentic RAG | 12 |
| Lab lead-in: ingest runbooks, ask "restart payments?", watch retrieval | 1, 13 |

All lesson sections (1–7 + summary) are represented. No concept is unmapped.
