# Module 3B — Customizing Models with LoRA/QLoRA · Explainer Deck Sequence

<!-- CourseSmith sequence spec — authored and approved BEFORE the deck HTML is built.
     Convention: whiteboard-style-guide.md §5. One row per slide; every slide needs
     purpose + visual + takeaway. NO slide-count cap (§0): one idea per slide, every
     lesson concept gets a slide — the coverage table below is a hard gate. -->

This companion doc maps the 18-slide explainer deck (`site/static/decks/03b-finetuning.html`) to the
Module 3B lesson (`site/docs/m3b-finetuning/lesson.md`). The deck teaches **concepts**, not commands —
it turns each of the lesson's analogies into a hand-drawn whiteboard visual a learner walks through
before opening the lab. The visual language follows the CourseSmith whiteboard style contract
(`templates/deck/whiteboard-style-guide.md`): Patrick Hand cursive, `#1e1e1e` primary / `#757575`
secondary strokes on white paper with the five semantic pastel fills (§1: green good · red bad/full ·
blue data · orange caution · purple meta), the `#rough` wobble filter on shapes only, and the shared
`#ah`/`#ahg` arrowhead markers. The arc moves — **the behaviour gap no prompt closes → the three-way
decision (prompt/RAG/fine-tune) → LoRA as sticky notes on a frozen textbook → QLoRA squeezing the base
to 4-bit → the open-source toolchain split by hardware → the same GPU-reality constraint from earlier
modules → why the frozen container is the reproducibility unit → the tiny adapter you actually ship →
the pipeline it feeds → the two lab tracks that converge on one adapter.**

**2026-08-05 divider-contract regen.** Per the current `deck-author` SKILL.md + style-guide §3a, every
lesson `##` section now gets its own title-only divider slide (numbered in DECK presentation order,
placed immediately before that section's first content slide), every subtitle was rewritten to a
SHORT anchoring phrase (≤10 words, ≤60 chars — all landed at 32–50 chars / 5–9 words; slide 2 "What
you'll learn" had its subtitle omitted because the four numbered rows in the visual already carry the
same four points verbatim), and all on-slide text was run through the `gourav-voice` skill.

**Divider-order decision (read before the slide table):** the deck's existing 12-slide sequence
(round-3 skeleton regen, 2026-07-26) was checked slide-by-slide against the lesson's six numbered
sections and found to **already visit them in lesson order** (§1 → slides 3–4, §2 → slides 5–6, §3 →
slide 7, §4 → slide 8, §5 → slide 9, §6 → slides 10–11). **No slide reordering was needed.** The six
dividers were inserted directly in front of each section's first content slide and numbered 1→6 in
that same order, which is simultaneously lesson order and deck-presentation order — the two never
diverge in this deck, so there is no "deck teaches out of lesson order" case to flag here (contrast the
305-llmops defect this rule exists to prevent). The "What you'll learn" objectives slide (old slide 2)
and the closing lab-lead-in slide (old slide 12) are not lesson `##` sections — no divider precedes the
former (it is the module's framing slide, not a numbered section) and none is needed after the latter.

**Slide-count math:** 12 old content/title/closing slides + 6 new divider slides = **18 slides**, same
pagenos scheme (`M3B·01`–`18`), renumbered sequentially once the dividers were spliced in. Zero content
was dropped, re-taught, or restructured — every SVG scene, every fact/number, and every non-subtitle
label carries over verbatim from the round-3 skeleton, per the content-parity requirement.

## Slide table

| # | Slide | Purpose | Visual | Takeaway |
|---|-------|---------|--------|----------|
| 1 | Customizing Models with LoRA / QLoRA (title) | Module framing: fine-tuning makes the model yours, reproducibly, in a container | Title sketch: a frozen base-model box with a small clip-on adapter box, connector nub between them | credit line: Gourav Shah · School of DevOps & AI · GPU-gated · Hands-on |
| 2 | What you'll learn | Set the four objectives: when to fine-tune, what LoRA does, which tool, why the container matters | Numbered rows (circles 1–4), one objective per row | The output is a small LoRA adapter that plugs straight into serving (M2/M3) and packaging (M4). |
| 3 | **Divider 1** — When to fine-tune — and when not to | Opens §1 of the lesson | — (divider) | n/a |
| 4 | The problem: a behaviour gap | Establish the motivating problem — a generalist model that occasionally breaks format is a behaviour gap, not a knowledge gap | Two-panel comparison: dashed gray "generalist + prompt" box (occasionally breaks format) → arrow "fine-tune" → solid ink "specialist" box (always valid JSON) | Fine-tuning teaches new behaviour — style, dialect, reliable output structure — not new facts. |
| 5 | Prompt vs RAG vs fine-tune | The three-way decision: match the tool to the kind of gap, reach for the cheapest one that closes it | Three-column comparison: Prompting (instruction gap) · RAG (knowledge gap) · Fine-tune (behaviour gap) | Knowledge problem → RAG. Reasoning problem → better prompt or bigger base. Behaviour problem → fine-tune. |
| 6 | **Divider 2** — LoRA — sticky notes on a textbook | Opens §2 of the lesson | — (divider) | n/a |
| 7 | LoRA — sticky notes on a textbook | The core analogy: freeze the expensive textbook, add small trainable Post-it notes in the margins instead of rewriting it | Big-box anatomy: frozen base-weight box `W` + two small low-rank matrix boxes `A`/`B` → arrow → effective weight box `W + A×B` at inference | Freeze the base, train two tiny matrices, add them at inference. The adapter is ~1–3% of the model. |
| 8 | QLoRA — squeeze the base to 4-bit | Extend LoRA: quantizing the frozen base to 4-bit halves memory again so a 7B model fits one consumer GPU | Before/after: large gray "base in 16-bit" box (too big for one GPU) → arrow "quantize to 4-bit" → compact 4-bit base box + hi-precision adapter box, "7B fits ~24 GB" | QLoRA = LoRA + a 4-bit frozen base — half the memory again, with the adapter kept high-precision. |
| 9 | **Divider 3** — The toolchain | Opens §3 of the lesson | — (divider) | n/a |
| 10 | The open-source toolchain | Map the toolchain split by hardware: NVIDIA gets containerized Axolotl/Unsloth/LLaMA-Factory, Apple Silicon gets native MLX-LM | Two-panel comparison: "NVIDIA (containerized)" box listing three tools over TRL/PEFT vs "Apple Silicon (native)" box listing MLX-LM + unified memory | Axolotl's YAML config is the interface; the pinned Docker image is what makes the run reproducible. |
| 11 | **Divider 4** — The GPU reality | Opens §4 of the lesson | — (divider) | n/a |
| 12 | The same GPU reality — again | Reinforce the course's defining constraint in this new context: MLX runs native on Mac, Axolotl runs in a container on NVIDIA, never the reverse | Two-panel: dashed Mac boundary with MLX-LM (native, solid box) above a dashed "container = CPU only" box, vs NVIDIA boundary with Axolotl container box → arrow `--gpus all` → GPU box | A 7B QLoRA fits ~24 GB. On Mac, MLX is the accelerated path — CUDA tools simply don't run in a Mac container. |
| 13 | **Divider 5** — Reproducibility — the frozen container is the experiment | Opens §5 of the lesson | — (divider) | n/a |
| 14 | The frozen container is the experiment | Reproducibility: scripts rot as dependencies drift, but a pinned OCI image does not | Before/after: dashed gray "bare script" box (deps drift, defaults change silently) → arrow "freeze it" → solid ink "pinned image + YAML" box (every dep version locked, tag in GHCR) | YAML in git + image tag in your registry = an immutable, repeatable experiment record. |
| 15 | **Divider 6** — What you produce — and where it fits | Opens §6 of the lesson | — (divider) | n/a |
| 16 | What you produce: a tiny adapter | Show the concrete artifact — a 50–200 MB adapter directory with two files — and its three destinations | Fan-out: adapter directory box (two file rows) → three gray arrows to three destination boxes: Merge, Hot-load, Package | One adapter, three exits — merge for portability, hot-load for flexibility, package to ship. |
| 17 | The pipeline, end to end | Place fine-tuning as one rung in the pipeline the learner already knows — it feeds serving and packaging | Pipeline with five hop boxes: fine-tune (M3B) → adapter (tiny) → serve (M2/M3) → package (M4) → ship (GHCR) | Nothing new downstream — a fine-tune just adds a custom-behaviour adapter to the pipeline you own. |
| 18 | Two tracks, one destination: a working adapter (closing) | Lab hand-off: both tracks converge on the same measurable outcome | Fan-in: Track A (MLX-LM native · Apple Silicon) and Track B (Axolotl container · NVIDIA) both arrow into one "LoRA adapter" box | Fine-tune the behaviour · keep the base · ship the tiny adapter.; credit + optional-module note + lab hand-off |

<!-- Visual pattern vocabulary (reuse before inventing):
     fan-out · two-panel comparison · big-box anatomy · numbered rows ·
     pipeline with hop-by-hop fragments · hub-and-spoke · staircase/ladder ·
     crossed-out-old → boxed-new -->

## Subtitle rewrites (2026-08-05, voice-passed via `gourav-voice`)

| # | Slide | Old subtitle (chars) | New subtitle (chars / words) |
|---|-------|----|----|
| 1 | Title | "Make the model yours — reproducibly, in a container" (53) | "Make the model yours, reproducibly, in a container" (50 / 8) |
| 2 | What you'll learn | "Four ideas: when to fine-tune, what LoRA does, which tool to use" (67) | *omitted — visual already carries all four points* |
| 4 | The problem: a behaviour gap | "No prompt reliably fixes this. That's not a knowledge gap." (60, two sentences) | "A behaviour gap, not a knowledge gap" (36 / 7) |
| 5 | Prompt vs RAG vs fine-tune | "Three tools, three gaps. Reach for the cheapest one that closes yours." (72) | "Pick the cheapest tool that closes the gap" (42 / 8) |
| 7 | LoRA — sticky notes on a textbook | "Can't rewrite the expensive textbook — so add Post-it notes in the margins" (76) | "Freeze the textbook, add sticky notes" (37 / 6) |
| 8 | QLoRA — squeeze the base to 4-bit | "Quantize the frozen base to 4-bit and a 7B fits one consumer GPU" (67) | "Quantize the base so a 7B fits one GPU" (38 / 9) |
| 10 | The open-source toolchain | "A handful of mature stacks cover almost every fine-tuning job" (63) | "One toolchain, split by hardware" (32 / 5) |
| 12 | The same GPU reality — again | "Native on Apple Silicon, containerized on NVIDIA — never the reverse" (70) | "Native on Mac, containerized on NVIDIA" (38 / 6) |
| 14 | The frozen container is the experiment | "Scripts rot — Python, PEFT, bitsandbytes drift. An OCI image does not." (72, two sentences) | "Scripts rot — a pinned image doesn't" (36 / 7) |
| 16 | What you produce: a tiny adapter | "A 50–200 MB adapter directory — two small files, ready to serve" (66) | "One tiny adapter, three ways to use it" (38 / 8) |
| 17 | The pipeline, end to end | "Fine-tuning is one rung — it feeds serving and packaging you know" (67) | "One more step in the pipeline you own" (37 / 8) |
| 18 | Closing | "Fine-tune the behaviour · keep the base · ship the tiny adapter" (65) | "Fine-tune the behaviour, keep the base" (38 / 6) |

Every old subtitle exceeded the current ≤60-char cap (several were full sentences); every new subtitle
is a short anchoring phrase within the cap. One SVG label was also aligned to the lesson's own word
choice during the voice pass: slide 7's "billions of params" → "billions of weights" (the lesson says
"billions of weight matrices" — "params" was never used there, so the deck had drifted from the
lesson's vocabulary; propagation rule, style-guide §8/SKILL.md §8).

## Recommended presentation order

Present strictly 1 → 18. Open on slide 1 to frame this as an optional, GPU-gated module — say so out
loud before slide 2's objectives. Divider 1 (slide 3) hands off into the conceptual hinge of the
module: slides 4–5 are where you linger, because the three-way decision (prompt/RAG/fine-tune) is what
stops learners reaching for a fine-tune when a better prompt or RAG would do. Divider 2 (slide 6) opens
a continuous build across slides 7–8 ("first freeze and add sticky notes, now squeeze the frozen
part") — keep momentum, don't stop between them. Divider 4 (slide 11) leads into slide 12, which
deliberately echoes the GPU-reality slide from earlier modules (M2/M3) — call that back explicitly,
it's the course's running through-line, not a new idea. Under time pressure, compress slide 14
(reproducibility) to one sentence and slide 16 to "you get a small adapter, three ways to use it" —
never compress slides 5, 7, or 12, which carry the module's three load-bearing decisions. Use the
dividers as your section markers if you need to jump straight to a topic mid-session.

## Fragment map

All 18 slides are static — none build up hop by hop, including the six new divider slides (title-only
by definition, style-guide §3a). This is a concept-comparison deck (three-way decision, before/after
quantization, two-panel toolchain, fan-out destinations, fan-in tracks); every content slide reads
better as one coherent picture than as a staged reveal, and the lesson's own diagrams (the Mermaid
graphs) are already static comparisons, not causal sequences. No slide warrants a fragment build under
style-guide §6 ("comparison slides, contract/rule slides, and anatomy slides stay static").

## Coverage check (HARD GATE — §0)

Every lesson section/concept maps to a slide, including the six divider slides that now mark each
lesson `##` section's entry point. Close the table with an explicit "no orphans" statement.

| Lesson section / concept | Slide(s) | Notes (analogy used, echoes/forward pointers) |
|---|---|---|
| Module framing + optional/GPU-gated status | 1 | Title sketch: base model + clip-on adapter; kicker carries "OPTIONAL · DAY 1" |
| Module goal / four learning objectives | 2 | Numbered rows 1–4, mirrors the module-goal blockquote; subtitle omitted (visual carries it) |
| §1 divider — "When to fine-tune — and when not to" | 3 | Title-only divider, verbatim lesson header, no visual/subtitle/kicker |
| §1 When to fine-tune — the behaviour gap (not knowledge/reasoning) | 4 | Two-panel: generalist+prompt vs specialist, "occasionally breaks format" → "always valid JSON" |
| §1 Prompt vs RAG vs fine-tune three-question decision table | 5 | Three-column comparison, one column per gap type |
| §2 divider — "LoRA — sticky notes on a textbook" | 6 | Title-only divider, verbatim lesson header |
| §2 LoRA — sticky-notes-on-a-textbook analogy, frozen base + two low-rank matrices, ~1–3% adapter size | 7 | Big-box anatomy: `W` frozen + `A`/`B` trained → `W + A×B`; label aligned to lesson's "weights" wording |
| §2 QLoRA — 4-bit quantized base, halves memory again, fits 7B on one consumer GPU | 8 | Before/after: 16-bit base → quantize → 4-bit base + hi-precision adapter |
| §3 divider — "The toolchain" | 9 | Title-only divider, verbatim lesson header |
| §3 The toolchain — Axolotl, Unsloth, LLaMA-Factory (NVIDIA, wrap TRL/PEFT) vs MLX-LM (Apple Silicon, native, unified memory) | 10 | Two-panel comparison box per hardware track |
| §4 divider — "The GPU reality" | 11 | Title-only divider, verbatim lesson header |
| §4 The GPU reality — bitsandbytes/CUDA won't install on macOS, no Mac container accelerates fine-tuning, `--gpus all` on NVIDIA | 12 | Two-panel: Mac (MLX native + dashed disabled container) vs NVIDIA (Axolotl container + GPU) |
| §5 divider — "Reproducibility — the frozen container is the experiment" | 13 | Title-only divider, verbatim lesson header |
| §5 Reproducibility — scripts rot, pinned OCI image doesn't, YAML in git + image tag in GHCR | 14 | Before/after: bare script (drift) → freeze it → pinned image + YAML |
| §6 divider — "What you produce — and where it fits" | 15 | Title-only divider, verbatim lesson header |
| §6 What you produce — 50–200 MB adapter directory, two files, merge/hot-load/package destinations | 16 | Fan-out: adapter dir → Merge / Hot-load / Package |
| Summary table's pipeline framing — fine-tune → adapter → serve → package → ship | 17 | Pipeline with five hop boxes, each tagged with its module (M3B/M2·M3/M4/GHCR) |
| Closing lab lead-in — Track A (MLX-LM native) / Track B (Axolotl container), both converge on one adapter | 18 | Fan-in: two track boxes → one "LoRA adapter" box |

**No orphans.** Every lesson section (§1–§6) now has both a divider slide and its content slide(s), the
module-goal blockquote, the summary table's pipeline framing, and the closing lab lead-in each have a
slide. No slide lacks a lesson anchor. 18 rows above = 18 sections in the built HTML.
