# Module 3 — Production Serving with vLLM · Explainer Deck Sequence

<!-- CourseSmith sequence spec — authored and approved BEFORE the deck HTML is built.
     Convention: whiteboard-style-guide.md §5. One row per slide; every slide needs
     purpose + visual + takeaway. NO slide-count cap (§0): one idea per slide, every
     lesson concept gets a slide — the coverage table below is a hard gate. -->

<!-- 2026-07-25 round-3 skeleton regen (ADDENDUM for original decks, sdd/deck-regen-contract.md):
     this deck was authored pre-coursesmith (03-vllm.html loaded reveal.js 4.6.1 + Patrick Hand
     from CDNs) and had NO sequence spec — this file is the first one, authored from the shipped
     deck as the approved coverage baseline. All 14 old slides carried real hand-drawn SVGs already
     (no text-only defects to fix), so every SVG scene ports verbatim onto the new skeleton with no
     viewBox changes. Content parity: same 14 slides, same order, same pagenos (M3·01–14), same
     facts/numbers. The only structural changes: (1) every `p.takeaway` (12 of them, slides 2–13;
     slides 1 and 14 never had one) was REMOVED from the rendered HTML — none deleted as content,
     all relocated into this spec's Takeaway column below; (2) the two longer old subtitles that
     exceeded 80 chars (slides 3 and 5) were cut to one line ≤80 chars — the relocated clauses were
     already present as in-SVG labels/gray captions on those slides, so no fact was lost; (3) zero
     external refs — reveal.js 5.2 runtime + Patrick Hand woff2 are now inlined via the skeleton,
     killing the old cdnjs/fonts.googleapis.com loads. -->

<!-- 2026-08-05 divider + subtitle-tightening + voice-pass regen (this pass):
     Deck grew from 14 to 20 slides — 6 new §3a section-divider slides (title-only, no
     kicker/subtitle/svg), one per lesson `##` section, inserted immediately before that
     section's first content slide, IN LESSON ORDER 1→6. All 14 pagenos renumbered
     M3·01–M3·20 sequentially.

     REORDER DECISION (the ordering gate this pass exists to catch): mapping the 14
     original content slides against the lesson's 6 numbered sections found that the
     original deck visited them almost-but-not-quite in lesson order. The mismatch:
     old slide 12 "GPU operational gotchas" (--gpus all / --ipc=host / VRAM sizing —
     content lifted near-verbatim from lesson §4's own GPU-track prose) sat BEFORE old
     slide 13 "Quantization" in the deck, but the lesson's own document order is
     §4 GPU track → §5 Quantization → §6 Operational gotchas — i.e. old slide 12's
     GPU-specific facts are also the closest thing this deck has to an anchor for §6,
     and §6 comes AFTER quantization in the lesson, not before it.

     Chose option (i) from the regen brief: reorder cleanly, no matched pair broken.
     Slide 11 ("CPU track vs GPU track") already independently mirrors lesson §4's own
     5-row comparison table (image / hardware / enable GPU / shared memory / goal) — it
     is the natural, self-sufficient §4 anchor on its own. That freed old slide 12 to
     move to AFTER quantization, where it now anchors §6 "Operational gotchas": its
     facts (--ipc=host, VRAM sizing) are the same two gotchas the lesson's own §6 prose
     restates almost word-for-word from §4 ("--ipc=host / shared memory (GPU)" and
     "VRAM/RAM sizing" are literally §6's opening bullets). The presentation-order
     guidance in the prior version of this spec ("slide 11 is a quick comparison beat
     before slides 12–13") never asserted 11-12 as a locked build-up/matched pair the
     way slides 4-5 (continuous batching → PagedAttention) are — so moving 12 past 13
     broke no fragment build-up, no problem→fix pair, nothing.

     COVERAGE CAVEAT (flagged, not silently dropped): §6 "Operational gotchas" in the
     lesson also covers `--max-model-len`, `--max-num-seqs`, and "first run is slow" —
     none of these are drawn in old slide 12's SVG (which is scoped to --gpus all /
     --ipc=host / VRAM, i.e. GPU-track specifics). This gap pre-dates this pass — the
     original 14-slide deck never had a slide visualizing those three facts either; the
     prior spec's coverage table papered over it with "folded into the takeaway" (a
     presenter-narration note, not on-slide content). This restructuring pass did not
     invent a new slide/SVG for them (out of scope: no new content, only reorder +
     divider + subtitle + voice pass per the regen brief) — the divider for §6 still
     ships (mandatory per style-guide §3a, no skip — the skip exception is narrow and
     scoped to a lab-bridge closing section, which §6 is not), anchored to the nearest
     matching content slide (old 12). `--max-model-len`/`--max-num-seqs`/"first run is
     slow" remain lesson-only until a future content pass adds a dedicated visual.

     Also: every subtitle rewritten to a ≤10-word/≤60-char SHORT anchoring phrase
     (was full sentences, several near the old 80-char ceiling) — see subtitle table
     below. Three raw "~3x"/"3x" shorthand occurrences (title-slide numbered-row label,
     the payoff slide's h2.t, and the CPU-vs-GPU table cell) replaced with the lesson's
     own spelled-out phrasing "roughly three times (the) throughput" — the lesson never
     uses bare "3x" for this number, so the deck now matches (propagation rule, deck-
     author SKILL.md §8). The payoff bar chart's own numeric tick labels ("1×"/"3×")
     were left as compact chart annotations, not prose — paired with the now-spelled-out
     h2.t title, that's the equivalent of an axis tick next to a labeled title, not an
     unexplained developer shorthand standing alone. All on-slide text run through
     gourav-voice; no unexplained jargon found (NUMA/KV cache/AWQ/GPTQ/FP8/PagedAttention
     are course vocabulary already explained in the lesson body, kept as-is). -->

This companion doc maps the 20-slide explainer deck (`site/static/decks/03-vllm.html`) to the
Module 3 lesson (`site/docs/m3-vllm/lesson.md`). The deck teaches **concepts**, not commands — it
turns the lesson's coffee-machine and virtual-memory analogies into hand-drawn whiteboard visuals a
learner walks through before opening the lab. The visual language follows the CourseSmith
whiteboard style contract (`templates/deck/whiteboard-style-guide.md`): Patrick Hand cursive,
`#1e1e1e` primary / `#757575` secondary strokes on white paper with the five semantic pastel fills
(§1: green good · red bad/full · blue data · orange caution · purple meta — this deck uses the
neutral ink/gray palette throughout, no pastel fills), the `#rough` wobble filter on non-flat elements only,
and the shared `#ah`/`#ahg` arrowhead markers. The arc moves — **the crowd problem with single-shot
serving (Ollama) → the two engine tricks that fix it (continuous batching, PagedAttention) → the
throughput payoff → the unchanged client contract → how to run it on this laptop (CPU track + the
NUMA patch + tuning) → the documented GPU track → quantization → the gotchas recap → hand-off to
the lab.** Six section-divider slides now mark the six lesson `##` sections in lesson order, so a
learner can map deck ↔ lesson section at a glance.

## Slide table

| # | Slide | Purpose | Visual | Takeaway |
|---|-------|---------|--------|----------|
| 1 | Production Serving with vLLM (title) | Module framing: vLLM is the commercial machine behind the counter — many shots at once, heads never idle | Title sketch: a commercial multi-group espresso machine pulling four cups at once, ink protagonist box | credit line: Gourav Shah · School of DevOps & AI · Containers for GenAI & Agentic AI |
| 2 | What you'll learn | Set the four learning objectives: batching+paging throughput, same `/v1` contract, CPU track, GPU+quantization | numbered rows (circles 1–4) | Same client, bigger engine — you swap the backend, your application code never notices |
| 3 | **§1 divider** — Why vLLM: from one cup at a time to a busy café | Opens lesson §1 | — (divider) | — |
| 4 | Ollama is great — until the crowd arrives | The motivating problem: a single-slot server queues requests one at a time while slots could be idle | fan-out: a queue of waiting requests (R1–R4) feeding one single-slot server box, a clock signaling stalled throughput | Perfect for a developer at a laptop. Under concurrent load, finished slots sit idle and the queue backs up |
| 5 | Continuous batching — never let a head sit idle | The core fix: token-level scheduling refills a finished slot mid-flight instead of waiting for the whole batch | two-panel comparison: static batch (idle slot, waits for laggard) vs continuous batch (mid-flight refill, no idle slots) | As soon as a sequence emits its final token and leaves, a waiting request takes its place — the single biggest reason vLLM wins under load |
| 6 | PagedAttention — virtual memory for the KV cache | The memory trick that makes continuous batching affordable: page the KV cache like an OS pages RAM | two-panel comparison: naive reserved-contiguous-slab (60–80% wasted) vs paged on-demand allocation with a lookup table (<4% waste) | Near-zero memory waste means far more concurrent sequences fit — which is exactly what feeds continuous batching enough work to stay busy |
| 7 | The payoff: roughly three times the throughput | Quantify the combined effect of both tricks on the same hardware; the three times shows up on a GPU, not on the CPU track the lab runs | bar chart: naive server (1×) vs vLLM (3×) | Continuous batching + PagedAttention together give roughly three times the throughput of a naive server on the same hardware |
| 8 | **§2 divider** — Same contract, bigger engine | Opens lesson §2 | — (divider) | — |
| 9 | Same contract, bigger engine | The M2 payoff: the client speaks to the `/v1` contract, not the engine — swapping engines is a config change | hub-and-spoke: one client → `/v1` contract socket → branches to Ollama (:11434, dev) and vLLM (:8009, production) | Swapping Ollama for vLLM is a one-line change — point OPENAI_BASE_URL at the new address. No code, no SDK, no image change |
| 10 | **§3 divider** — The CPU track (what you'll run) | Opens lesson §3 | — (divider) | — |
| 11 | The CPU track — learn the machinery anywhere | Frame why this module runs on CPU: Apple Silicon exposes no GPU to containers, so it's slow on purpose, for learning | big-box anatomy: a dashed container boundary holding the `openeuler/vllm-cpu` image, SmolLM2, and the `/v1` server, arrow out to "study the engine" | Throughput isn't the lesson on CPU — understanding the OpenAI server, the batcher, and quantization mechanics is |
| 12 | Why containers report 0 NUMA nodes | The signature teaching point: containers abstract away the host's NUMA floor plan, causing a division-by-zero crash, fixed by a guard patch | two-panel: host building with 4 NUMA-node rooms (dashed, gray) vs a container "apartment" (dashed, ink) that sees `numa_size = 0` and crashes, arrow to the one-line patch box | The signature teaching point: a surgical sed patch guards the division so an upstream image behaves in a containerized world |
| 13 | CPU tuning knobs that keep the laptop usable | The environment dials that keep the machine usable: thread caps, KV cache size, single-threaded BLAS | big-box anatomy: four boxes — `OMP_NUM_THREADS`, `VLLM_CPU_KVCACHE_SPACE`, `OPENBLAS/MKL=1`, "why leave cores free" | Multi-threaded BLAS and multi-threaded OpenMP thrash the cache and slow everything down — keep BLAS at one thread |
| 14 | **§4 divider** — The GPU track (throughput — documented, not run here) | Opens lesson §4 | — (divider) | — |
| 15 | CPU track vs GPU track | Compare the two tracks side by side across image, hardware, GPU enablement, shared memory, and goal — mirrors lesson §4's own 5-row table | two-panel comparison table: CPU track (this module) vs GPU track (production) | Both speak the identical /v1 contract — your M2 client wouldn't change moving from CPU to GPU |
| 16 | A GPU launch is one docker run | Show the one representative GPU launch command from lesson §4, read-only in the lab | code-in-a-box: the `docker run --gpus all --ipc=host -p 8000:8000 vllm/vllm-openai:latest --model mistralai/Mistral-7B-Instruct-v0.3` command with three gray captions (GPU, shared memory, port) | The GPU launch is one command, and the M2 client talks to it unchanged |
| 17 | **§5 divider** — Quantization in practice | Opens lesson §5 | — (divider) | — |
| 18 | Quantization — trade a little precision for a lot of room | Compare the three quantization formats by bits, best use, and trade-off, using the JPEG-compression analogy | big-box anatomy: three format boxes — AWQ 4-bit, GPTQ 4-bit, FP8 8-bit, each with best-for + trade-off | Rule of thumb: 4-bit AWQ roughly quarters VRAM vs FP16 for a small accuracy cost — often how a 7B model fits a consumer 8 GB card |
| 19 | **§6 divider** — Operational gotchas | Opens lesson §6 | — (divider) | — |
| 20 | GPU gotchas: toolkit, ipc, VRAM | Name the two flags and one sizing rule that separate a working GPU server from cryptic crashes — the GPU half of lesson §6 (the CPU half is slide 21) | big-box anatomy: three boxes — `--gpus all` (NVIDIA Container Toolkit), `--ipc=host` (shared memory), VRAM sizing (7B model ≈14GB + headroom) | The GPU needs three things: the toolkit, shared memory, and enough VRAM |
| 21 | CPU gotchas: two flags, a patch, a wait | Cover lesson §6 bullets on `--max-model-len`, `--max-num-seqs` (OOM fix: drop one), the NUMA patch that is not optional, and the slow first run | big-box anatomy: four boxes, one per gotcha, each with a gray fix line | Most CPU failures are memory sizing or the missing patch, and a slow first run is not a hang |
| 22 | Same socket. Bigger engine. (closing) | Hand off to the lab: build the patched image, serve SmolLM2, point the unchanged M2 client at it | pipeline: Build → Serve → Point client, three boxes with arrows | credit + lab hand-off: Next — Lab: Serve SmolLM2 on CPU vLLM · Gourav Shah · School of DevOps & AI |

<!-- Visual pattern vocabulary used: title scene (1) · numbered rows (2) · dividers (3, 8, 10, 14, 17, 19)
     · fan-out (4) · two-panel comparison (5, 6, 12, 15) · bar chart (7) · hub-and-spoke (9) ·
     big-box anatomy (11, 13, 18, 20, 21) · code-in-a-box (16) · pipeline (22). -->

## Subtitle table (≤10 words / ≤60 chars, short anchoring phrase — style-guide §0)

| Slide | Subtitle | Words | Chars |
|---|---|---|---|
| 1 | Continuous batching + PagedAttention, same /v1 API | 7 | 50 |
| 2 | Batching, the contract, the CPU track, quantization | 7 | 51 |
| 4 | One espresso shot at a time | 6 | 27 |
| 5 | A finished slot refills mid-flight | 5 | 34 |
| 6 | Paging the KV cache like your OS pages RAM | 9 | 42 |
| 7 | On a GPU: same hardware, heads never idle | 8 | 41 |
| 9 | The wall socket idea from M2, again | 7 | 35 |
| 11 | No GPU passthrough — slow on purpose | 7 | 36 |
| 12 | The container can't see the floor plan | 7 | 38 |
| 13 | A few dials, not all your cores | 7 | 31 |
| 15 | Learn here, scale on an NVIDIA box | 7 | 34 |
| 16 | Read-only here: the command for a Linux GPU box | 10 | 48 |
| 18 | Like a JPEG, but for model weights | 7 | 34 |
| 20 | Two flags, one sizing rule | 5 | 26 |
| 21 | What goes wrong on a laptop, and the fix | 9 | 40 |
| 22 | Serve SmolLM2 on CPU vLLM, same /v1 API | 8 | 39 |

Dividers (3, 8, 10, 14, 17, 19) carry no subtitle by design (style-guide §3a: title-only, no
subtitle/kicker/svg). All 16 content-slide subtitles pass the ≤60-char target with margin; none
approach the 80-char hard fail.

## Recommended presentation order

Present strictly 1 → 22; each slide's vocabulary is used by the next. Open on slide 1 to set the
café framing, move through 2 (the roadmap), then the §1 divider opens the throughput story proper.
Don't over-explain slide 4's queue picture, it's intuitive. **Slides 5 and 6 are the conceptual
hinge of the whole deck** — continuous batching and PagedAttention are the two mechanisms
everything else depends on, so give both diagrams real time and land each takeaway crisply before
moving on; slide 7's payoff bar chart is the fast reward right after. The §2 divider then slide 9
(same contract) is a callback to M2 — say it plainly, it should feel obvious once shown. The §3
divider opens one continuous CPU-track build-up across slides 11–13 (why CPU → the NUMA crash →
the tuning knobs) — keep momentum across the three, with slide 12 (the NUMA patch) as the single
most memorable teaching point in the module; don't rush it. The §4 divider + slides 15 and 16 are a quick
GPU-track comparison and launch-command beat before the §5 divider + slide 18 covers quantization at a similar brisk
pace (documented, not run). The §6 divider + slides 20 and 21 close with the gotchas (GPU half, then the CPU half the
lab hits) before handing off to the lab on slide 22. Under time pressure, compress 15/16/18/20 to
a single pass each — never compress 5, 6, or 12.

## Fragment map

This deck has no hop-by-hop build-ups — every content slide is a static comparison, anatomy,
fan-out, or pipeline diagram that reads better whole, and divider slides are title-only (nothing to
fragment). No fragments are used.

Static slides (1, 2, 4, 5, 6, 7, 9, 11, 12, 13, 15, 16, 18, 20, 21, 22) show the full picture at once.
Divider slides (3, 8, 10, 14, 17, 19) are title-only by definition.

## Coverage check (HARD GATE — §0)

Every lesson section/concept maps to a slide, IN LESSON ORDER. No orphans.

| Lesson section / concept | Slide(s) | Notes (analogy used, echoes/forward pointers) |
|---|---|---|
| Module roadmap ("what you'll learn") | 2 | Numbered rows, four objectives — precedes the §1 divider, not itself a lesson `##` section |
| **§1 divider** | 3 | Title-only, verbatim lesson header |
| §1 opener — Ollama as home espresso machine, one shot at a time | 4 | Fan-out: queue backs up behind a single-slot server |
| §1 — vLLM as the commercial café machine, continuous batching intro | 1, 5 | Title scene sets the café framing; slide 5 is the mechanism |
| §1 — continuous batching: token-level scheduling, no idle slots | 5 | Two-panel: static batch (idle, waits for laggard) vs continuous batch |
| §1 — PagedAttention: virtual memory for the KV cache | 6 | Two-panel: naive reserved slab (60–80% waste) vs paged on-demand (<4% waste) |
| §1 — roughly three times throughput payoff | 7 | Bar chart: naive (1×) vs vLLM (3×); h2.t and subtitle spell out "roughly three times", matching lesson wording |
| **§2 divider** | 8 | Title-only, verbatim lesson header |
| §2 — same `/v1` OpenAI-compatible contract, one-line engine swap | 9 | Hub-and-spoke: client → contract → Ollama/vLLM branches |
| **§3 divider** | 10 | Title-only, verbatim lesson header |
| §3 — CPU track: Apple Silicon no GPU passthrough, slow on purpose | 11 | Big-box anatomy: container with image, SmolLM2, /v1 server |
| §3 — why containers report 0 NUMA nodes, division-by-zero crash, the sed patch | 12 | Two-panel: host NUMA floor plan vs container apartment, arrow to patch |
| §3 — CPU tuning knobs: OMP_NUM_THREADS, VLLM_CPU_KVCACHE_SPACE, single-threaded BLAS | 13 | Big-box anatomy: four env-var boxes |
| **§4 divider** | 14 | Title-only, verbatim lesson header |
| §4 — GPU track: image, hardware, NVIDIA Container Toolkit, --ipc=host, VRAM sizing | 15, 16 | Comparison table mirrors lesson §4's own 5-row table exactly (reordered from the original deck to sit as §4's sole, self-sufficient anchor — see regen note above) |
| **§5 divider** | 17 | Title-only, verbatim lesson header |
| §5 — quantization: AWQ, GPTQ, FP8 — bits, best-for, trade-off | 18 | Big-box anatomy: three format boxes (moved earlier, ahead of the gotchas slide, to match lesson order) |
| **§6 divider** | 19 | Title-only, verbatim lesson header |
| §6 — operational gotchas: --ipc=host (GPU), VRAM/RAM sizing | 20 | GPU half of §6, shares facts with slide 15 |
| §6 — operational gotchas: --max-model-len, --max-num-seqs, OOM fix, NUMA patch not optional, slow first run | 21 | Four-box slide, one per gotcha. Added 2026-10-21 (closes the old coverage caveat) |
| Lab hand-off — build patched image, serve SmolLM2, point client | 22 | Pipeline: Build → Serve → Point client |

**No orphans.** Every lesson section (§1–§6) has its own divider (in lesson order 1→6) plus at
least one content-slide anchor, and the roadmap intro / closing lab hand-off are covered by slides
2 and 22 respectively. The Summary table at the end of the lesson is a recap of concepts already
covered by slides 1–21 and is narration-only (Video 6), not a separate slide anchor. The 2026-10-21
fix pass added slide 16 (GPU launch command, lesson §4) and slide 21 (CPU gotchas, lesson §6), which
closes the old coverage caveat.

<!-- 2026-08-14 narration + rough-filter fix + illustration pass:

     NARRATION: full 6-video voiceover package written to planning/narration/03-narration.md
     via the lesson-to-video-narration skill (talking-head intro, "batching+PagedAttention"
     explainer, "/v1 contract swap" explainer, "CPU track/NUMA" explainer, "GPU track +
     quantization" explainer, summary/lab-bridge). No lesson section dropped — see that file's
     own coverage map. Slide beats suggested per-video are noted inline in the narration file.

     ROUGH-FILTER BUG FIX: the shared `#rough` SVG wobble filter was still on the default
     `objectBoundingBox` region (`x="-5%" y="-5%" width="110%" height="110%"`), which renders
     any perfectly horizontal/vertical line invisible (zero-height/width bounding box). Fixed
     to `filterUnits="userSpaceOnUse" x="-80" y="-80" width="1300" height="600"`, matching the
     fix already applied across the rest of the course's decks.

     ILLUSTRATIONS: 3 Magnific pencil-sketch scenes added, narration-driven, kept deliberately
     modest (this deck's content slides are mostly labeled diagrams/tables that should stay as
     SVG per the style contract — photos can't carry text):
       - Slide 1 (title) — replaced the old plain SVG icon-diagram with a fuller scene: small
         home espresso machine + one waiting customer vs. a busy multi-barista café counter.
         `site/static/img/decks/03-vllm/title-espresso-vs-cafe.jpg`
       - Slide 3 (§1 divider, "one cup at a time to a busy café") — busy café counter from the
         customer's POV, everyone in motion, nobody idle. Divider now uses image-on-top/
         text-below via the new `.divider.illustrated` CSS (order-flip + taller autofit
         ceiling), added to this deck for the first time.
         `site/static/img/decks/03-vllm/divider1-busy-cafe.jpg`
       - Slide 10 (§3 divider, "the CPU track") — hotel guest standing in a single room, door
         open to a hallway, rest of the building only implied — the NUMA "container can't see
         the host's full memory map" analogy.
         `site/static/img/decks/03-vllm/divider3-hotel-room.jpg`

     NOT USED: a 4th image (wall-socket + plug, for the closing "Same socket. Bigger engine."
     slide) was generated and verified but deliberately not inserted — that slide's existing SVG
     (Build → Serve → Point-client pipeline with real labels) carries information a text-free
     photo can't reproduce; replacing it would have deleted content, not added to it. Kept as-is.

     All fixes verified: DOCTYPE at position 0, 20/20 section tags balanced, zero external refs,
     `display: 'flex'` present, rendered headless (title + illustrated divider) — image-on-top
     layout confirmed correct. -->
