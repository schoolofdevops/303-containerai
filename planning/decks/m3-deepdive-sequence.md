# Module 3 Deep Dive — vLLM Internals Under the Hood · Explainer Deck Sequence

<!-- CourseSmith sequence spec — authored and approved BEFORE the deck HTML is built.
     Convention: whiteboard-style-guide.md §5. One row per slide; every slide needs
     purpose + visual + takeaway. NO slide-count cap (§0): one idea per slide, every
     deep-dive.md section gets a slide — the coverage table below is a hard gate.
     Style/structure mirror: site/static/decks/03b-deepdive.html (the shipped M3B
     deep-dive deck) — same page-number prefix pattern, same shared #rough/#ah/#ahg
     defs declared once, same full-concept-deck treatment (not a 5-6 slide framing
     deck) because this deep-dive's material is dense mechanics the learner reasons
     with directly, same as 3B's. -->

This companion doc maps the 18-slide explainer deck (`site/static/decks/03-deepdive.html`) to the
Module 3 deep-dive page (`site/docs/m3-vllm/deep-dive.md`). Like 3B's deep-dive deck, this page's
material is dense mechanics (paged memory allocation, scheduler internals, a real flag-by-flag
memory inequality, a live metrics reading, and a real two-server experiment) the learner needs to
reason about directly before touching a `compose.yaml` flag or a `/metrics` reading — so the deck
follows the **full concept-deck treatment** (coverage over economy, §0): every deep-dive section
gets its own claim-titled slide, not a compressed highlight reel. The visual language follows the
CourseSmith whiteboard style contract (`templates/deck/whiteboard-style-guide.md`): Patrick Hand
cursive, `#1e1e1e` primary / `#757575` secondary strokes on white paper with the five semantic
pastel fills (§1: green good · red bad/full · blue data · orange caution · purple meta), the
`#rough` wobble filter on shapes only, and the shared `#ah`/`#ahg` arrowhead markers. The arc
moves — **why contiguous per-request KV reservation wastes memory and fragments (PagedAttention)
→ why a static batch stalls on its slowest member (continuous batching) → what the lab's four
flags actually buy against that machinery, including the swap-space-is-inert-on-CPU finding →
how to read `/metrics` to know which flag to move → when this machinery is worth the cost at all
vs. Ollama → the real experiment's numbers, absolute and scaling.**

Page numbers are `M3-DD·NN` to distinguish this deck from the lesson concept deck's `M3·NN`
(`03-vllm.html`, untouched by this work) and from the M3B deep-dive deck's own `M3B-DD·NN` prefix.

## Slide table

| # | Slide | Purpose | Visual | Takeaway |
|---|-------|---------|--------|----------|
| 1 | The swap that made this worth doing (title) | Frame the page: the lab did a two-variable swap onto vLLM — this deck opens the machinery that made that swap pay off | Title sketch: three theme boxes (paged memory · continuous batching · the lab's flags) converging on one "why the swap was worth it" box | credit line: Gourav Shah · School of DevOps & AI · Deep Dive (Part 2) |
| 2 | A naive server books the whole floor for a maybe | The naive-allocation problem: reserving `max_model_len` tokens of contiguous KV cache per request, worst case, every time | **Scene** — a hotel front desk reserving an entire floor to a guest who might stay one night or a month; most of the floor sits empty and locked | Reserving worst-case space per request wastes memory even when the aggregate free space would technically fit another guest |
| 3 | PagedAttention runs the hotel by the room, not the floor | The paged-allocation fix: guests get one room at a time, checked in as needed, freed on checkout | **Scene** — the same front desk now handing out single rooms on demand from a shared pool, a front-desk ledger (block table) tracking who's in which room | A short stay uses one room and frees it; a long stay just gets the next free room — never a whole floor reserved up front |
| 4 | Block tables map logical tokens to scattered physical blocks | The actual mechanism: fixed-size KV blocks (16 tokens), a per-sequence block table mapping logical position → physical block, free blocks returned to a shared pool | Two sequences' logical token runs (A, B) mapping through per-sequence block tables to non-contiguous physical blocks in a shared pool, one block still free | No sequence needs a contiguous span — free blocks can be scattered anywhere and still get handed out immediately |
| 5 | 98% reserved, unused, and still unavailable to anyone else | Naive contiguous reservation's concrete waste: a 20-token answer inside a 1024-token reservation | Big outer box (red, "1024 reserved") with a small filled sliver inside (blue, "20 used") and the rest hatched/empty | A server that reserves the worst case per request pays for it on every request, whether or not it happens |
| 6 | 40% free in aggregate, but no single gap big enough | The fragmentation problem: contiguity requirement blocks admission even when total free space would fit | Three scattered small free gaps (blue, labeled with sizes) next to one big pending request (red, needs a bigger contiguous span than any single gap) with a "blocked" red X | Contiguity — not total free memory — is what naive allocation actually runs out of; paging removes the requirement entirely |
| 7 | A static-batch table waits for the slowest guest to leave | The static-batching problem: the whole dining room reseats only once every table has finished | **Scene** — a restaurant with one table still lingering over dessert while several already-finished tables sit uncleared, and a "closed" sign on the front door | One unrelated party finishing late blocks every other finished table from leaving and every new customer from being seated |
| 8 | vLLM reseats the moment a table clears | The continuous-batching fix: the instant a table finishes, it's cleared and reseated — no correlation to any other table | **Scene** — the same restaurant, one table being cleared and a new party seated at it immediately while the other tables keep eating undisturbed | The dining room is never blocked by the slowest table — clearing and reseating happen table by table, continuously |
| 9 | The scheduler checks every slot, every single step | The scheduling mechanism: per-decoding-step (not per-batch) checks for finished sequences, frees their slot+blocks, admits a waiting request into it | Running-batch box with several sequence slots, **2 fragments**: one slot's sequence hits a stop token and is freed → a waiting sequence is admitted into that same slot, same iteration | A new request waits, at most, one scheduling iteration — there is no "batch boundary" for it to wait behind |
| 10 | Continuous batching helps throughput; static batching hurts short jobs twice | The two-sided throughput/latency effect: static batching pads to the slowest member AND makes a 1-token answer wait behind nine 500-token ones | Two-panel comparison: static batch (red, padded-length bar + short job trapped behind long ones) vs continuous batch (green, every slot always doing useful work, short job returns immediately) | Continuous batching isn't just a throughput trick — it's also what lets a short request finish without waiting on unrelated long ones |
| 11 | Paging is what makes admitting a request every step affordable | Why the two features ship together: continuous batching's constant admission only works if allocating KV cache per admission is cheap | Two boxes (paged memory, continuous batching) with a two-way ink arrow between them labeled "makes admission cheap enough to do every iteration" | These aren't two features that happen to ship together — paging is the enabling mechanism continuous batching depends on |
| 12 | Two flags spend the same memory two different ways | `--dtype float32` (2x KV bytes/token vs bf16, no CPU kernel for bf16) and `--max-model-len` (blocks-per-sequence × max-num-seqs must fit the cache) as the two levers on the real budget | Big-box anatomy: `VLLM_CPU_KVCACHE_SPACE` budget box with two feed-in arrows labeled `--dtype` (2x cost per token) and `--max-model-len` × `--max-num-seqs` (blocks reserved) | float32's 2x memory cost is exactly why this lab keeps `--max-model-len` and `--max-num-seqs` deliberately small on a CPU path |
| 13 | `--swap-space` is accepted, validated, and does nothing here | The swap-space-inert-on-CPU finding — verified against the image's own `cpu_worker.py` source and this run's own `/metrics`, not inferred | Two-panel comparison: GPU path (green, VRAM full → spills to swap-space RAM tier, sequence survives) vs this CPU path (red/dashed, swap-space accepted at startup, `num_cpu_blocks="0"` on live `/metrics`, zero blocks ever come from it) | On this CPU backend `--swap-space` is dead weight, not a second budget line — raise `VLLM_CPU_KVCACHE_SPACE` instead when you need more headroom |
| 14 | The engine log already did the arithmetic for you | `MAX_NUM_SEQS` as the continuous-batching concurrency cap made concrete, tied to the real startup numbers this lab captured | Numbered rows: `VLLM_CPU_KVCACHE_SPACE=1 GiB` → `1456 blocks of 16 tokens` → `"Maximum concurrency for 1024 tokens: 22.75x"` — one arrow chain, real numbers from this run | Raising `MAX_NUM_SEQS` without raising the KV budget just moves the queue from "waiting on a batch slot" to "waiting on cache space" |
| 15 | Three gauges tell you which lever to pull | Reading `/metrics`: `num_requests_running`, `num_requests_waiting`, `gpu_cache_usage_perc` (CPU pool, historically GPU-named) together as a diagnosis, not three separate numbers | Big-box anatomy: three gauge dials in a row, with two diagnosis arrows below pointing to "raise MAX_NUM_SEQS" (low cache + queue) and "raise KV budget" (full cache + queue) | A growing waiting queue with cache usage already near 100% needs more memory, not a higher concurrency cap — and vice versa |
| 16 | One developer at a time never creates the problem this machinery solves | The vLLM-vs-Ollama decision: paging and continuous batching only pay for themselves when requests overlap in time and compete for memory | Decision tree (static): "serving a model to..." → one dev, one request at a time → Ollama-class server is enough; → many concurrent users/services → vLLM-class serving pays for itself | Ask whether requests actually overlap in time before reaching for vLLM — a single-user tool has nothing to page around or batch continuously |
| 17 | Ollama wins the scoreboard; vLLM wins the scaling curve | The real experiment's headline: Ollama faster in absolute tok/s at this toy CPU scale, but vLLM-CPU's concurrent run scales 3.13x vs Ollama's 1.10x off their own sequential baselines | Two-panel comparison: left "absolute speed" bar pair (Ollama taller/faster, green) — right "sequential → concurrent scaling" pair of arrows (vLLM 3.13x steep, Ollama 1.10x nearly flat) | A mature single-stream runtime can out-run a toy vLLM setup in absolute terms and still lose on the metric that actually matters at scale: how far concurrent load bends the curve |
| 18 | What to carry into a real deployment (closing) | Five takeaways from the "Where you will use this" close; hand off back to the module | numbered rows (circles 1–5) — the course's takeaway idiom | Every knob on this page has a real-work trigger — blocks-per-sequence arithmetic, admission-every-iteration reasoning, gauge-first diagnosis, swap-space skepticism, overlap-before-vLLM judgment; credit + hand-off |

<!-- Visual pattern vocabulary used: title theme-boxes · scene (2, 3, 7, 8) · big-box anatomy
     (5, 12, 15) · pipeline/mapping diagram (4) · fan-out/blocked (6) · two-panel comparison
     (10, 13, 17) · hub-and-spoke (11) · numbered rows (14, 18) · decision tree (16) ·
     fragment build-up (9). -->

## Recommended presentation order

Present strictly 1 → 18; the deck is one continuous build from "why naive allocation wastes
memory" through "what the real experiment showed." Open on slide 1 to name the three themes.
**Slides 2–3 are the conceptual hinge** — the hotel-floor-vs-hotel-room scene pair has to land
before slide 4's block-table mechanics makes sense, so give the scene pair the same unhurried
beat 3B gave its notepad scene. Slides 5–6 are a fast pair making the waste and fragmentation
concrete with real numbers (98%, 40%-free-but-blocked) — say each takeaway crisply. Slides 7–8
are the second scene hinge (restaurant pair) and deserve the same treatment as 2–3 — don't rush
the analogy to get to the scheduler mechanics in slide 9. Slide 9's fragment build-up is the
payoff of that analogy; slide 10 lands the two-sided throughput/latency effect right after. Slide
11 is a short connective beat (why the two features ship together) — quick, then move. Slides
12–14 are the flags triplet and the load-bearing evidence slide of the whole deck: **slide 13
(swap-space-inert) is the single most counter-intuitive claim here** — it contradicts what anyone
who has run vLLM on a GPU would assume, and it is verified against source + live `/metrics`, not
inferred — pause on it, don't compress it. Slide 15 (the three gauges) is the practical payoff of
12–14; give it real time since it's literally "what to do next" advice. Slide 16 is the framing
pivot — quick, decisive. Slides 17 is the deck's other must-not-compress slide: the fact that
Ollama wins on absolute speed but loses on scaling shape is the whole experiment's teaching point,
and it is easy to accidentally undersell by rushing past the "Ollama is faster" half before
landing on the scaling-factor half. Slide 18 lands the takeaways and hands off. Under time
pressure, compress 5–6 and 11 into single passes — never compress 2–3, 7–8, 13, or 17; those carry
the deep dive's actual new information and its one counter-intuitive finding.

## Fragment map

Fragments are used only where a diagram builds up hop by hop; comparison, scene, and decision-tree
slides stay static because they read better whole:

- **Slide 9** — 2 fragments: a running sequence hits its stop token and its slot/blocks are freed →
  a waiting sequence is admitted into that same now-free slot, same scheduling iteration.

Static slides (1, 2, 3, 4, 5, 6, 7, 8, 10, 11, 12, 13, 14, 15, 16, 17, 18) show the full picture at
once — scenes, mapping diagrams, comparisons, anatomy boxes, numbered rows, and the decision tree
all read better whole; slide 9 is the deck's only hop-by-hop build because it is the one place the
*sequence of events within a single scheduling iteration* is the actual point being taught.

## Coverage check (HARD GATE — §0)

Every deep-dive.md section maps to at least one slide.

| Deep-dive section / concept | Slide(s) | Notes (analogy used, echoes/forward pointers) |
|---|---|---|
| Opening framing — the lab's swap, what this page opens up | 1 | Title theme boxes name the three arcs (paging, batching, flags) |
| §1 — naive contiguous per-request KV reservation, worst-case sizing | 2 | Scene: hotel books an entire floor for a maybe, illustration-author scene |
| §1 — PagedAttention: rooms handed out on demand, front desk = block table | 3 | Scene: same hotel, rooms on demand, illustration-author scene |
| §1 — fixed-size KV blocks (16 tokens), per-sequence block table, physical mapping, free-pool return | 4 | Mapping diagram: two sequences' block tables to scattered physical blocks, one free |
| §1 — concrete waste: 20-token answer inside a 1024-token reservation, ~98% unused | 5 | Big-box anatomy with real percentage from the page |
| §1 — fragmentation: 40% free in aggregate but no single span big enough, admission blocked | 6 | Fan-out of scattered gaps vs one blocked pending request |
| §2 intro — static-batch server reseats only once the whole room finishes | 7 | Scene: restaurant, one lingering table blocks everyone, illustration-author scene |
| §2 — continuous batching: reseat the instant a table clears, no batch-boundary correlation | 8 | Scene: same restaurant, immediate reseat, illustration-author scene |
| §2 — scheduling mechanism: per-decoding-step check, free slot+blocks, admit waiting request same iteration | 9 | Fragment build-up: slot frees → new sequence admitted |
| §2 — throughput effect (no idle slots) and tail-latency effect (short job doesn't queue behind long ones) | 10 | Two-panel: static (padded + trapped short job) vs continuous (always busy + immediate short-job return) |
| §2 close — paging and continuous batching are not separable features; paging enables cheap per-step admission | 11 | Hub-and-spoke: two-way arrow, "makes admission cheap enough to do every iteration" |
| §3 — `--dtype float32`: no bf16 CPU kernel, 2x KV bytes/token vs bf16 | 12 | Anatomy: dtype feeds the shared budget box |
| §3 — `--swap-space`: inert on this CPU backend, verified against `cpu_worker.py` source and live `/metrics` (`num_cpu_blocks="0"`) | 13 | Two-panel: GPU role (real overflow tier) vs this CPU build (accepted, validated, zero blocks) — the deck's one counter-intuitive, most-verified claim |
| §3 — `--max-model-len`: direct KV-cache budget line, worked backward from the container's 5 GB cap | 12 | Same anatomy box, second feed-in arrow |
| §3 — real startup-log arithmetic: `VLLM_CPU_KVCACHE_SPACE=1 GiB` → 1456 blocks → "22.75x concurrency for 1024 tokens" | 14 | Numbered-row arrow chain with this run's real captured numbers |
| §3 — `--max-num-seqs`: continuous-batching concurrency cap; raising it without cache budget just moves the queue | 14 | Same slide, closing takeaway line |
| §4 — `/metrics` Prometheus endpoint; three gauges (`num_requests_running`, `num_requests_waiting`, `gpu_cache_usage_perc`) | 15 | Anatomy: three gauge dials |
| §4 — reading gauges together to decide which §3 flag to move (raise `MAX_NUM_SEQS` vs raise KV budget) | 15 | Same slide, two diagnosis arrows |
| §5 — PagedAttention/continuous batching only pay off under overlapping, competing requests; Ollama is the right call for single-user | 16 | Decision tree mirroring the page's own mermaid diagram |
| §6 — sequential run: Ollama visibly faster in absolute wall time than vLLM-CPU at this toy scale | 17 | Left panel: absolute-speed bars |
| §6 — concurrent run + scaling factor: vLLM-CPU 3.13x sub-linear vs Ollama 1.10x near-linear off matched-set sequential baselines | 17 | Right panel: scaling-factor arrows with the exact numbers from the page's results table |
| §6 — headline: absolute scoreboard vs scaling shape are two different questions, both real | 17 | Slide takeaway line states both halves explicitly |
| "Where you will use this" — 5 real-work triggers | 18 | Closing numbered rows, one per trigger |

**No orphans.** Every deep-dive.md section (§1–§6, plus the opening framing paragraph and the
closing "Where you will use this") has at least one slide anchor. The `/metrics` idempotent-check
prose at the top of the page and the live `docker stats` / teardown commands in §6 are deliberately
not slides — they are terminal-output/console detail that belongs in the lab prose, not a concept
slide (the concept deck teaches concepts, never terminal output, per the style guide); the
underlying concepts those commands demonstrate (server coexistence, live experiment methodology)
are still covered by slides 1 and 17.
