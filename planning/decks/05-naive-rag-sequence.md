# Module 5 — Docs Assistant: Naive RAG · Explainer Deck Sequence

<!-- CourseSmith sequence spec — authored and approved BEFORE the deck HTML is built.
     Convention: whiteboard-style-guide.md §5. One row per slide; every slide needs
     purpose + visual + takeaway. NO slide-count cap (§0): one idea per slide, every
     lesson concept gets a slide — the coverage table below is a hard gate.

     2026-08-05 divider regen note: this revision adds one divider slide per lesson
     `##` section (style-guide §3a) to the approved round-3 13-slide baseline, per the
     newest coursesmith deck-author contract (content slides never carry `.kicker`;
     divider slides mark section boundaries instead). Content-slide order was audited
     against the lesson's own section order 1→7 and found ALREADY IN ORDER — no content
     slides were reordered. Seven dividers were inserted, one per lesson section, and
     every `.pageno` was renumbered sequentially. All subtitles were rewritten to the
     ≤10-word/≤60-char anchoring-phrase rule and every on-slide em dash (h2.t, p.s, SVG
     labels) was replaced with a comma, period, or colon — divider titles are the one
     exception, since they must match the lesson header verbatim (none of the seven
     headers contain an em dash, so no exception was actually needed). Slide count:
     13 → 20 (13 original content slides + 7 new dividers). -->

> **2026-08-14 narration + illustration pass:** narration written to
> `planning/narration/05-narration.md` (7 videos: talking-head intro + 6 concept
> explainers). Fixed the shared `#rough` filter's objectBoundingBox bug (axis-aligned
> lines went invisible) — switched to `filterUnits="userSpaceOnUse"` with an explicit
> bbox. Added a Magnific pencil-sketch illustration to all 7 divider slides (title slide
> kept its existing functional diagram, not replaced): divider 1 → empty-handed shrug at
> a bare desk (the ungrounded-answer problem), divider 2 → four interlocking gears (GenAI
> app anatomy), divider 3 → librarian shelving books by theme (the librarian analogy),
> divider 4 → conveyor belt feeding loose pages in, a bound booklet out (the pipeline),
> divider 5 → a person carrying a small toolbox past a heavy rolling filing cabinet
> (ChromaDB's lightness), divider 6 → a person watching machinery through an observation
> window (Learning Mode), divider 7 → a stack of books toppling, pages scattering (where
> naive RAG breaks). Images at `site/static/img/decks/05-naive-rag/*.jpg`. Dividers use a
> new `.has-illo` modifier class (image-on-top, title 1.1em below) rather than a blanket
> `.divider` override, since not every deck's dividers necessarily get an illustration.

This companion doc maps the 20-slide explainer deck (`site/static/decks/05-naive-rag.html`) to the Module 5 lesson (`site/docs/m5-naive-rag/lesson.md`). The deck teaches **concepts**, not commands — it turns each of the lesson's analogies into a hand-drawn whiteboard visual a learner walks through before opening the lab. The visual language follows the CourseSmith whiteboard style contract (`coursesmith/templates/deck/whiteboard-style-guide.md`): Patrick Hand cursive, `#1e1e1e` primary / `#757575` secondary strokes on white paper with the five semantic pastel fills (§1), the `#rough` wobble filter on shapes only, and the shared `#ah`/`#ahg` arrowhead markers. The arc moves vocabulary forward — a raw LLM answers your ops questions confidently and wrongly → RAG hands it a cheat sheet at query time → the four-part anatomy of every GenAI app → the vector DB as a librarian shelving by meaning → embeddings as coordinates → the two-phase naive-RAG pipeline sharing one embedding step → where each piece runs on Apple Silicon → ChromaDB as the lightest store → env-var wiring in Compose → Learning Mode making the pipeline visible → the five predictable failure modes that motivate M6 → hand-off to the lab. Seven divider slides now mark each lesson section boundary, in lesson order, so the learner (and the deck) can navigate section by section.

## Slide table

| # | Slide | Purpose | Visual | Takeaway |
|---|-------|---------|--------|----------|
| 1 | Docs Assistant, Naive RAG (title) | Module framing: ground an LLM in your own documents with retrieval, no fine-tuning | title sketch: 3-hop pipeline — Question → Retrieved context → Grounded answer, arrows labelled find/generate, "no fine-tuning, just wiring" gloss | credit line: Gourav Shah · School of DevOps & AI |
| 2 | What you'll learn | Preview the five objectives: GenAI-app anatomy, vector DB by meaning, the naive-RAG pipeline, Compose wiring, where naive RAG breaks | numbered rows (circles 1–5) | by the end you have a containerised Docs Assistant that answers grounded questions about Acme's runbooks |
| 3 | **1 · The problem: ungrounded answers** (divider) | Opens lesson §1 | — (divider) | — |
| 4 | A model alone can't answer about YOUR docs | The motivating problem: a raw LLM answers from stale training data and produces a plausible but wrong command; the same question + the runbook produces the correct one | two-panel comparison: dashed "Raw LLM, ungrounded" panel (plausible but WRONG command) vs solid "RAG, grounded" panel (correct kubectl rollout restart), "add docs" arrow between | RAG gives the model a cheat sheet at query time — it generates from context, not from stale weights |
| 5 | **2 · Anatomy of a GenAI application** (divider) | Opens lesson §2 | — (divider) | — |
| 6 | Four parts make every GenAI app | The four parts of every production GenAI app: LLM endpoint, embedding model, vector DB, application — M5 adds the last two | big-box anatomy: central Application box + four surrounding boxes (LLM endpoint · Embedding model · Vector database · "already have it (M2/M3)" note) | LLM endpoint + embedding model + vector DB + application — M5 adds the vector DB and the app layer |
| 7 | **3 · The librarian analogy** (divider) | Opens lesson §3 | — (divider) | — |
| 8 | A vector DB shelves by meaning, not title | The librarian analogy: a filing cabinet needs the exact name; a librarian converts the question into coordinates and walks to the nearest shelf | two-panel comparison: dashed filing-cabinet panel (exact titles, wrong words → nothing found) vs solid librarian panel (dots in meaning-space, ? lands near neighbours) | embeddings are coordinates that encode meaning — similar passages land near each other, so similarity search finds them |
| 9 | Embeddings: text becomes coordinates | Mechanics of the analogy (still lesson §3): an embedding model turns each passage into a 768-dim vector; similar text lands near, unrelated text far | pipeline + space: 3 text boxes ("restart payments" / "bounce the service" / "the moon is round") → Embedding model box → 768-dim space with near/far dots | the same model embeds both your documents and your questions — that shared space is what makes retrieval work |
| 10 | **4 · The naive-RAG pipeline** (divider) | Opens lesson §4 | — (divider) | — |
| 11 | Ingest once, then answer every question | The centerpiece: ingest phase (load → chunk → embed → store, run once) and query phase (embed → retrieve top-3 → augment → generate, every question) share one embedding step | two-row pipeline: INGEST row (4 boxes) over QUERY row (4 boxes), dashed link labelled "same embedding model" | load → chunk → embed → store, then embed → retrieve → augment → generate — the embedding step is shared |
| 12 | Where the pieces run | The Apple-Silicon container boundary (still lesson §4): both models stay in native Ollama for Metal; ChromaDB and the Streamlit app are containers reaching the host over the bridge | two-panel boundary: solid "Native Ollama :11434" box (qwen3.5:2b · nomic-embed-text) vs dashed "Docker containers" box (ChromaDB :8000 · Streamlit app), arrow labelled host.docker.internal | the M2 pattern continues: model servers native, everything else containerised over the host bridge |
| 13 | **5 · ChromaDB: the lightest vector store** (divider) | Opens lesson §5 | — (divider) | — |
| 14 | ChromaDB, the lightest vector store | Why ChromaDB is the default for a 16 GB laptop (zero-config, Python-native, persistent, ≤2 GB, pinned 1.5.9) and when to scale up (Qdrant, pgvector) | fan-out/scale-up: protagonist ChromaDB box (4 detail lines) → "scale up" arrow → Qdrant and pgvector boxes | the API you learn — add_documents, similarity_search — is nearly identical across every alternative |
| 15 | Wired via environment variables | How the stack connects: the learner hand-authors compose.yaml one service block at a time; every endpoint is an env var, so the wiring is configuration. Bridge slide — no dedicated lesson section (mentioned in §2's compose-growth note and the closing lab hand-off); sits here because it naturally follows the store choice and precedes the app that consumes the wiring | big-box anatomy: compose.yaml outer box with 4 service blocks (model → OLLAMA_URL · embeddings → EMBED_MODEL · ChromaDB → CHROMA_HOST · app reads all), "one block at a time" annotation | swap the endpoint values and the same stack runs anywhere — the wiring is configuration, not code |
| 16 | **6 · Learning Mode: watching the pipeline run** (divider) | Opens lesson §6 | — (divider) | — |
| 17 | Learning Mode, watch the pipeline run | The app's Learning Mode panel surfaces each query-phase step live with timings — the invisible parts of RAG become visible | numbered pipeline: 4 panels (1 Query embedding · 2 Similarity search · 3 Retrieved context · 4 LLM generation) with timing/detail captions | trace which sentence in which document produced the answer — the single best tool for building RAG intuition |
| 18 | **7 · Where naive RAG breaks** (divider) | Opens lesson §7 | — (divider) | — |
| 19 | Where naive RAG breaks down | The five predictable failure modes (query mismatch, wrong chunk boundary, single-pass retrieval, no query rewriting, stale index) that motivate M6's agentic RAG | list rows → pointer: 5 failure-mode rows, arrow into a "Module 6 · Agentic RAG · fixes every row" box | an agent can rewrite queries, retry retrieval, and judge sufficiency — understanding these failures motivates M6 |
| 20 | Retrieve, then generate. Stay grounded. (closing) | Hand off to the lab: build the compose, ingest Acme's runbooks, watch Learning Mode reveal the retrieved chunk and the grounded kubectl answer | closing scene: 3-hop pipeline — "restart payments?" → the exact runbook chunk → kubectl rollout restart, arrows labelled retrieve/generate | in the lab you author the stack and watch it ground an answer; credit + lab hand-off |

<!-- Visual pattern vocabulary used above (reuse before inventing):
     pipeline (1, 11, 17, 20) · numbered rows (2, 17) · two-panel comparison (4, 8, 12) ·
     big-box anatomy (6, 15) · fan-out/scale-up (14) · list rows → pointer (19) ·
     divider (3, 5, 7, 10, 13, 16, 18) -->

## Recommended presentation order

Present strictly 1 → 20; each divider announces the section that follows, and each slide's vocabulary is used by the next. Open on the title pipeline (1) and the five-objective preview (2), then divider 3 hands off into the motivating failure: slide 4 (plausible-but-wrong command vs grounded answer) is the hinge that makes RAG worth building — linger here and read both panels aloud. Divider 5 names the section that slide 6 answers — the four parts, so the learner can place everything that follows. Divider 7 opens the librarian analogy; slides 8–9 are one continuous build (librarian → embeddings-as-coordinates) — announce "shelved by meaning" at 8 and formalize it at 9 without breaking stride. Divider 10 opens the centerpiece: slide 11 is the two-row pipeline — walk the ingest row left to right, then the query row, then point at the dashed "same embedding model" link; slide 12 re-anchors the course's Apple-Silicon constraint (models native, everything else containers) — compress it if the audience has M2 fresh, never skip it. Divider 13 opens the engineering-choice pair: slide 14 (which store) and slide 15 (how it's wired, no divider of its own — a bridge slide); under time pressure compress 14's scale-up half but keep the 1.5.9 pin warning. Divider 16 opens Learning Mode: slide 17 previews the exact panel the learner will watch in the lab. Divider 18 opens the bridge to Module 6: slide 19 reads all five failure rows; they are the reason M6 exists. Slide 20 hands off to the lab — say the closing line and stop talking.

## Fragment map

This deck carries no build-ups — every content slide (including the multi-box slides 4, 6, 8, 9, 11, 12, 14, 15, 17, 19) is presented as a single static, already-complete picture, and every divider is a single static title. This matches the approved baseline's construction and suits the content: 4, 8, and 12 are two-panel comparisons that read better whole; 6 and 15 are anatomy layouts; 11's two-row pipeline is scanned as a pair of rows rather than revealed hop-by-hop. No fragments were added in this divider regen — a future revision could fragment slide 11 (ingest row → query row → the shared-embedding link) if a presenter wants a build, but the current spec keeps parity with the approved baseline.

Static slides (all of 1–20): read in full on entry — no reveal-in-steps behavior in this deck.

## Coverage check (HARD GATE — §0)

Every lesson section/concept maps to a slide, including the seven divider slides (one per lesson `##` section, in lesson order, per style-guide §3a).

| Lesson section / concept | Slide(s) | Notes (analogy used, echoes/forward pointers) |
|---|---|---|
| Module framing / five things you'll learn | 1, 2 | title pipeline sketch (Question → Retrieved context → Grounded answer) + numbered-rows preview of all five objectives |
| §1 The problem: ungrounded answers — raw LLM predates your runbooks, RAG = cheat sheet at query time | **3 (divider)**, 4 | divider opens the section; two-panel wrong-vs-grounded comparison, "plausible-sounding but WRONG command" lives in the SVG |
| §2 Anatomy of a GenAI application — LLM endpoint · embedding model · vector DB · application | **5 (divider)**, 6 | divider opens the section; big-box anatomy; the M5 concretes (qwen3.5:2b, nomic-embed-text 768-dim, ChromaDB, Streamlit) are SVG labels |
| §3 The librarian analogy — filing cabinet by title vs librarian by meaning | **7 (divider)**, 8 | divider opens the section; two-panel comparison; "wrong words → nothing found" vs "question → coordinates → nearest shelf" |
| §3 Embeddings — 768-dim vectors, semantic proximity, nearest neighbours | 9 | still lesson §3 (embeddings paragraph is inside "The librarian analogy" section — no separate divider needed); text→model→space pipeline, the 768-dim fact is an SVG label |
| §4 The naive-RAG pipeline — ingest (load → chunk → embed → store) + query (embed → retrieve → augment → generate), shared embedding step | **10 (divider)**, 11 | divider opens the section; two-row pipeline with the dashed "same embedding model" link — the deck's centerpiece |
| §4 The container boundary — native Ollama :11434 for both models; ChromaDB + app in containers via host.docker.internal | 12 | still lesson §4 (the Apple Silicon paragraph closes out the pipeline section, before §5 begins — no separate divider needed); two-region boundary diagram |
| §5 ChromaDB: the lightest vector store — zero-config, Python-native, persistent, ≤2 GB, pinned 1.5.9 | **13 (divider)**, 14 | divider opens the section; protagonist box with the four properties + pin as SVG labels |
| §5 When to scale up — Qdrant (millions of vectors, filtering) · pgvector (already on Postgres) | 14 | scale-up fan-out on the same slide — one decision, one idea: default vs outgrow |
| Module goal / lab bridge — hand-author compose.yaml service by service, endpoints as env vars | 15 | no dedicated lesson section (mentioned in §2's compose-growth note + closing lab hand-off); bridge slide, no divider — sits between §5 and §6 content |
| §6 Learning Mode — four live steps with timings (query embedding, similarity search, retrieved context, generation) | **16 (divider)**, 17 | divider opens the section; numbered 4-panel pipeline; timings ("+ ms taken", "gen time") are SVG labels |
| §7 Where naive RAG breaks — query mismatch, wrong chunk boundary, single-pass retrieval, no query rewriting, stale index → M6 agentic RAG | **18 (divider)**, 19 | divider opens the section; five list rows + arrow into the Module 6 box |
| Closing hand-off — retrieve the exact runbook chunk, generate the grounded kubectl answer | 20 | closing 3-hop scene mirrors the title slide's pipeline with the lab's concrete payload |

**No orphans.** All 13 original content slides, all 7 lesson `##` sections (each with its own divider, in lesson order 1→7: The problem: ungrounded answers · Anatomy of a GenAI application · The librarian analogy · The naive-RAG pipeline · ChromaDB: the lightest vector store · Learning Mode: watching the pipeline run · Where naive RAG breaks), and every lesson §1–§7 concept are covered above with an explicit slide mapping. Divider titles were verified verbatim against the lesson's `##` headers. Slide count: 13 (approved baseline) + 7 (dividers) = **20**, pagenos `M5·01`–`M5·20`, renumbered sequentially after insertion. Content-slide order was audited against lesson order 1→7 before inserting dividers and found already correct — no content slides were reordered, only dividers were added and pagenos renumbered.
