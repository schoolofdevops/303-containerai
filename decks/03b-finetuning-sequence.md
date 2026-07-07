# Module 3B — Fine-Tuning with LoRA/QLoRA · Explainer Deck Sequence

**Deck:** `decks/03b-finetuning.html` (reveal.js, 12 slides, B&W hand-drawn style matching `00-introduction.html`)
**Module:** 3B · Optional · GPU-gated · Day 1
**Source:** `site/docs/m3b-finetuning/lesson.md` (+ `lab.md`)

This deck is the pre-lab walk-through: it turns the lesson's analogies into visuals so a learner
arrives at the lab already carrying the mental model — when to fine-tune, what LoRA/QLoRA do, which
tool fits their hardware, and why the container is the reproducibility unit. It is optional and only
runs for cohorts that need custom model adapters.

## Slide table

| # | Title | Core concept | Analogy / visual device |
|---|---|---|---|
| 1 | Customizing Models with LoRA / QLoRA | Title + framing | Base model with a small clip-on adapter |
| 2 | What you'll learn | Four objectives | Numbered rows |
| 3 | The problem: a behaviour gap | Motivation — behaviour, not knowledge | Generalist "usually valid" vs specialist "always valid" JSON |
| 4 | Prompt vs RAG vs fine-tune | The three-way decision | Three columns, one gap each (instruction / knowledge / behaviour) |
| 5 | LoRA — sticky notes on a textbook | What LoRA does to the weights | Frozen W + two Post-it matrices A×B |
| 6 | QLoRA — squeeze the base to 4-bit | Why QLoRA fits a consumer GPU | Big 16-bit base shrinking to a compact 4-bit base + hi-precision adapter |
| 7 | The open-source toolchain | Axolotl / Unsloth / LLaMA-Factory / MLX-LM on TRL/PEFT | Two-column table split by hardware |
| 8 | The same GPU reality — again | NVIDIA container vs Apple MLX native | Mirror of the course's defining constraint |
| 9 | The frozen container is the experiment | Reproducibility | Rotting script vs pinned image + YAML |
| 10 | What you produce: a tiny adapter | The adapter directory + three exits | Two-file dir fanning to merge / hot-load / package |
| 11 | The pipeline, end to end | Fine-tune feeds serve → package → ship | Left-to-right flow tagged with module numbers |
| 12 | Two tracks, one destination | Closing + lab lead-in | Track A + Track B converging on one adapter |

## Recommended presentation order

Present 1 → 12 in order; the deck is built as a single narrative arc:

1. **Frame (1–3):** title, objectives, then the *motivating problem* — establish that this is a
   behaviour gap, not a knowledge gap, before any mechanism.
2. **Decision (4):** the three-way prompt/RAG/fine-tune choice — the "when" that gates everything.
   Pause here; this is the slide learners will actually reuse at work.
3. **Mechanism (5–6):** LoRA (sticky notes) then QLoRA (4-bit squeeze). Slide 5 is the conceptual
   anchor; slide 6 is the "why it fits your GPU" payoff.
4. **Practice (7–9):** toolchain, the GPU-reality split, and reproducibility — the operational trio.
   Slide 8 deliberately echoes the M1 native-server constraint; call that callback out loud.
5. **Payoff (10–12):** the adapter you produce, where it flows in the pipeline, and the two lab
   tracks. Slide 12 hands straight off to `lab.md`.

## Gemini image-generation briefs

Optional photographic/illustrative alternates for the three "hero" concepts, if you want a richer
slide than the inline sketch. Keep the deck's B&W restraint.

**Brief A — Sticky notes on a textbook (slide 5).**
A black-and-white, hand-drawn whiteboard-style illustration: one thick, heavy hardcover textbook lying
open, its printed pages clearly untouched, with several small square Post-it sticky notes stuck into the
margins carrying tiny hand-written annotations. Ink-on-white sketch aesthetic, loose confident strokes,
no color, no shading fills beyond light gray. The composition should read instantly as "the big book is
frozen; only the little notes are new." Leave the upper third clear for a title. 16:9. No text baked in
other than faint squiggles standing in for handwriting.

**Brief B — The GPU-reality split (slide 8).**
A clean black-and-white technical illustration, split down the middle. Left half: a MacBook labelled
Apple Silicon with a glowing chip inside it, an arrow going *directly* from the chip to a small "MLX"
box (native), and a faded, dashed, greyed-out container icon marked "CPU only". Right half: a Linux/cloud
server rack with an NVIDIA GPU card, and a solid container box labelled "Axolotl" sitting *on top of* the
GPU with a "--gpus all" arrow between them. The visual contrast: native path on Mac, containerized path
on NVIDIA. Minimal, sketch/whiteboard style, no color except black ink on white, light gray for the
faded elements. 16:9, upper third kept clear for a title.

**Brief C — The adapter's three exits (slide 10).**
A black-and-white hand-drawn diagram of a small labelled folder icon ("LoRA adapter") on the left with
three arrows fanning out to the right into three destination boxes: one showing two puzzle pieces merging
into one ("Merge"), one showing a plug slotting into a socket ("Hot-load into Ollama / vLLM"), and one
showing a shipping/OCI box being sealed ("Package as ModelKit"). Loose ink sketch, whiteboard aesthetic,
no color, light gray fills only. Emphasize that one tiny artifact has three downstream homes. 16:9,
title space along the top.

## Coverage check — every lesson concept mapped to a slide

| Lesson concept (source §) | Slide(s) |
|---|---|
| When to fine-tune vs prompt vs RAG (§1) | 3, 4 |
| Behaviour gap vs knowledge gap vs reasoning gap (§1) | 3, 4 |
| Fine-tune signals: 50–5000 examples, reliable structure, dialect (§1) | 3 |
| LoRA = freeze base, train two low-rank matrices, add at inference (§2) | 5 |
| Adapter is ~1–3% of the model / hot-swappable (§2) | 5, 10 |
| QLoRA = LoRA + 4-bit quantized base; fits 7B on one GPU (§2) | 6, 8 |
| Axolotl (YAML, Docker image) (§3) | 7 |
| Unsloth (2x speed, ~60% less VRAM) (§3) | 7 |
| LLaMA-Factory / TRL / PEFT underneath (§3, hint) | 7 |
| MLX-LM native, unified memory, no CUDA (§3) | 7, 8 |
| GPU reality: bitsandbytes/CUDA = Linux/NVIDIA only; Mac containers can't accelerate (§4) | 8 |
| NVIDIA path via `--gpus all` / Container Toolkit (§4) | 8 |
| 7B QLoRA fits ~24 GB (hint) | 6, 8 |
| Reproducibility: frozen image doesn't rot; YAML in git + image tag in GHCR (§5) | 9 |
| Output = small adapter dir (safetensors + config, 50–200 MB) (§6) | 10 |
| Merge / hot-load (Ollama, vLLM) / package as ModelKit (§6) | 10 |
| Pipeline: fine-tune → adapter → serve → package → ship (§6) | 11 |
| Two lab tracks converge on one adapter (lab.md) | 12 |
