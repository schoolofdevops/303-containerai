# Module 3 — vLLM Explainer Deck · Sequencing Doc

Companion to `03-vllm.html`. This deck walks learners through **why vLLM is the production
serving workhorse** before they build it in the lab. It turns the lesson's café / virtual-memory /
furnished-apartment analogies into black-and-white hand-drawn visuals, keeps the container angle
central, and lands on the same `/v1` contract from M2 so learners see the engine swap is free.

Source: `site/docs/m3-vllm/lesson.md` (skim of `lab.md`). Style/scaffold copied verbatim from
`decks/00-introduction.html` (head, `#rough` filter + `#ah`/`#ahg` markers, Reveal.initialize).

---

## Slide table

| # | Slide | Concept | Source | Visual pattern |
|---|-------|---------|--------|----------------|
| 01 | Production Serving with vLLM | Title · café machine framing | Lesson §1 | Hand-drawn commercial coffee machine serving many cups; kicker "MODULE 3 · DAY 1" |
| 02 | What you'll learn | 4 module objectives | Lesson goal + §1–5 | Numbered circles + rows (template objectives pattern) |
| 03 | Ollama is great — until the crowd arrives | Motivating problem: single-slot server backs up under load | Lesson §1 (home espresso analogy) | Queue of gray request boxes → single Ollama slot → clock/"throughput stalls" |
| 04 | Continuous batching | Token-level scheduling refills idle slots mid-flight | Lesson §1 | Two-panel: static batch (gray, idle slot filled `#f5f5f5`) → continuous batch (ink, refilled) |
| 05 | PagedAttention | Virtual-memory paging for the KV cache | Lesson §1 "PagedAttention" | Two-panel: naive reserved slab (mostly empty) → grid of small on-demand pages |
| 06 | The payoff: ~3x throughput | The throughput win lands on a GPU | Lesson §1 + summary | Bar chart: 1x gray bar vs ~3x tall `#f5f5f5` bar with rough axis |
| 07 | Same contract, bigger engine | vLLM behind M2's `/v1`; one-line swap | Lesson §2 | Client → `/v1` socket → branches to Ollama :11434 / vLLM :8009 |
| 08 | The CPU track | Containerized vLLM runs on CPU; learn the machinery | Lesson §3 | Dashed container boundary holding CPU image + SmolLM2 + /v1 server, arrow to "study the engine" |
| 09 | Why containers report 0 NUMA nodes | NUMA patch — division-by-zero guard | Lesson §3 | Host "building" of NUMA boxes vs container "apartment" seeing 0 → one-line patch box |
| 10 | CPU tuning knobs | OMP_NUM_THREADS, KVCACHE_SPACE, BLAS=1 | Lesson §3 | 2×2 grid of env-var cards |
| 11 | CPU track vs GPU track | Side-by-side comparison table | Lesson §4 table | Two-column ruled comparison table (template tool-map pattern) |
| 12 | GPU operational gotchas | `--gpus all` toolkit · `--ipc=host` · VRAM sizing | Lesson §4 + §6 | Three ruled cards |
| 13 | Quantization | AWQ vs GPTQ vs FP8 trade-offs | Lesson §5 table | Three ruled cards (JPEG analogy in subtitle) |
| 14 | Same socket. Bigger engine. | Closing big idea + lab lead-in | Lesson §2 + closing line, lab.md goal | Build → Serve → Point-client pipeline, 3 boxes + arrows |

14 slides total.

---

## Recommended presentation order

Present in file order (01 → 14) — it follows the lesson's own arc:

1. **Hook (01–03):** frame vLLM as the busy café, restate objectives, then make learners *feel* the
   problem — Ollama stalling under concurrent load. Don't reveal the solution yet.
2. **The two innovations (04–06):** continuous batching first (the "why it's fast"), then
   PagedAttention (the "what makes batching possible"), then cash it out as the ~3x payoff. Slide 05
   explicitly ties back to 04 ("feeds continuous batching enough work") — say that out loud.
3. **The contract bridge (07):** the emotional payoff of M2 — the engine swaps for free. Pause here;
   this is the course's spine.
4. **CPU reality (08–10):** what learners actually run today, and the signature NUMA-patch teaching
   moment. Slide 09 is the single best "why we build a custom image" moment — linger on it.
5. **Production picture (11–13):** GPU track, its gotchas, and quantization — documented, not run.
   Frame as "here's what changes on a real GPU box; your client doesn't."
6. **Close (14):** collapse everything into Build → Serve → Point-client and hand off to the lab.

If short on time, the minimum spine is **01 · 03 · 04 · 05 · 07 · 09 · 14**.

---

## Gemini image-generation briefs

Three concepts where a richer illustration could optionally replace or supplement the inline SVG.
All must stay **black ink on white, hand-drawn / whiteboard-sketch, no color, no photorealism** to
match the deck's aesthetic.

**Brief 1 — Café vs home espresso (Slide 01 / 03).**
A black-and-white hand-drawn whiteboard sketch contrasting two coffee setups. On the left, a small
single-head home espresso machine pulling one cup, with a short queue of stick-figure customers
waiting impatiently. On the right, a large commercial café machine with four group heads, each
filling a cup simultaneously, customers being served in parallel. Loose ink linework, visible
sketch strokes, no shading fills, no color — pure black on white, in the style of an Excalidraw
whiteboard drawing. Label the left "one shot at a time" and the right "never idle." Uncluttered,
generous whitespace, legible hand-lettered labels.

**Brief 2 — PagedAttention as OS virtual memory (Slide 05).**
A black-and-white hand-drawn diagram explaining virtual memory paging applied to a KV cache. Show
one big rectangular memory slab mostly empty with a tiny used portion (labelled "naive — reserved
for worst case, wasted"), then an arrow to a grid of many small equal-sized pages scattered and
mapped by a lookup table with dotted pointer lines (labelled "paged — allocated on demand"). Sketchy
hand-drawn rectangles, dotted mapping arrows, black ink on white only, no color, Excalidraw
whiteboard style, plenty of whitespace, clear hand-lettered labels. Small and legible, at most a
dozen shapes.

**Brief 3 — Container as a furnished apartment inside a building (Slide 09).**
A black-and-white hand-drawn illustration of the NUMA analogy. On the left, a cutaway of a multi-floor
building whose floor plan shows four rooms labelled NUMA 0–3 (the host's memory-and-core layout). On
the right, a single furnished apartment (a bed, a chair, a lamp) drawn inside a dashed box labelled
"container — sees floor plan as 0 nodes." A small speech bubble reads "numa_size = 0 → divide by
zero". Loose ink linework, no shading, no color, black on white, Excalidraw whiteboard sketch style,
uncluttered with hand-lettered labels.

---

## Coverage check — every lesson concept mapped to a slide

| Lesson concept | Slide(s) |
|----------------|----------|
| Why vLLM / café vs home espresso analogy | 01, 03 |
| Continuous batching (token-level scheduling, no idle slots) | 04 |
| PagedAttention = virtual memory for KV cache; <4% waste | 05 |
| ~3x throughput under load (lands on GPU) | 06 |
| Same OpenAI-compatible `/v1` contract; one-line swap (M2 tie-in) | 07 |
| CPU track: `openeuler/vllm-cpu`, multi-arch/arm64, SmolLM2, slow-on-purpose | 08 |
| NUMA patch: 0 NUMA nodes → division-by-zero → sed guard; "why a custom image" | 09 |
| CPU tuning: OMP_NUM_THREADS, VLLM_CPU_KVCACHE_SPACE, single-threaded BLAS | 10 |
| GPU track: `vllm/vllm-openai`, NVIDIA Container Toolkit, `--gpus all`, TGI alt, safetensors | 11 |
| GPU gotchas: `--ipc=host`/shared memory, VRAM sizing, `--max-model-len`/`--max-num-seqs` | 11, 12 |
| Quantization: AWQ vs GPTQ vs FP8 trade-offs; JPEG analogy; 4-bit AWQ ≈ ¼ VRAM | 13 |
| Lab lead-in: build patched image → serve SmolLM2 → point M2 client | 14 |

All major lesson concepts are covered. Operational knobs `--max-model-len` / `--max-num-seqs` are
folded into slide 12's takeaway rather than given a dedicated slide, keeping the deck at 14.
