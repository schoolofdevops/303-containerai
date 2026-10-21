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

<!-- 2026-08-14 narration + illustration pass: added planning/narration/m3-deepdive-narration.md
     (8 videos via lesson-to-video-narration, all sections under the 30% retell-overlap gate).
     Fixed the shared #rough filter (was default objectBoundingBox — invisible on axis-aligned
     lines; now filterUnits="userSpaceOnUse" x="-80" y="-80" width="1300" height="600"). Added TWO
     new Magnific pencil-sketch illustration divider slides — one opening the PagedAttention
     section, one opening the continuous-batching section — sparingly, only at the deck's two
     genuine analogy beats (this is dense advanced material; every other slide stays whiteboard-SVG
     only, no photo illustrations, per "use sparingly" guidance for deep-dive decks). Slide count
     18 → 20. All prior content slides (now shifted by 1-2 positions) are otherwise UNCHANGED —
     same facts, same SVG scenes, same takeaways. See "Old → new slide numbering" below. -->

<!-- 2026-07-25 visual rebalance: per sdd/deck-rebalance-contract.md, all 17
     subtitle (.s) paragraphs were cut to one line (≤80 chars) — the SVG is now the slide,
     not a caption under a paragraph. Every load-bearing fact the old multi-line subtitles
     carried was RELOCATED, not deleted: slide 3's "block table" term now labels the ledger
     directly in-SVG; slide 4's "16 tokens each" now labels the physical-blocks row; slide 15's
     literal Prometheus metric names (`num_requests_running`, `num_requests_waiting`,
     `gpu_cache_usage_perc`) and the "CPU pool, historically GPU-named" note now label the
     gauges themselves in-SVG instead of living only in prose. All other trimmed detail (flag
     names, verification sources, qualifiers like "toy CPU scale" / "3 prompts") was already
     duplicated in-SVG or in the slide's takeaway line before this pass, so no coverage changed.
     Slide count, pagenos, order, palette, fonts, shared defs, and fragments are unchanged. -->

<!-- 2026-07-25 round-3 skeleton regen: per sdd/deck-regen-contract.md, the deck was
     rebuilt on the new turnkey skeleton (templates/deck/deck-skeleton.html.tmpl) for the anchored
     layout (title TOP, visual centered in band, subtitle as bottom caption),
     Reveal.initialize({display:'flex'}) + svg{order:2}, and zero external refs. Content parity:
     all 18 slides, same order, same pagenos (M3-DD·01–18), same facts/numbers, same SVG scenes
     carried over verbatim — no viewBox changes needed. The only structural change from the prior
     file: every `p.takeaway` element was REMOVED from the rendered HTML (17 of them, slides 2–17;
     slides 1 and 18 never had one) — none were deleted as content, all had already been captured
     in this spec's Takeaway column since the 2026-07-25 rebalance pass, so the column below
     already reflects the presenter/narration exit line for every slide. Gates run clean: subtitle
     audit PASS (worst case 80 chars, slide 1), zero `class="takeaway"`, zero external refs, tags
     balanced, section count 18 == spec rows 18 == old deck slide count 18 (no splits), headless
     Chrome `--dump-dom` exit 0 with all 18 pagenos present. -->

This companion doc maps the 21-slide explainer deck (`site/static/decks/03-deepdive.html`) to the
Module 3 deep-dive page (`site/docs/m3-vllm/deep-dive.md`) and to its narration package
(`planning/narration/m3-deepdive-narration.md`). Like 3B's deep-dive deck, this page's material is
dense mechanics (paged memory allocation, scheduler internals, a real flag-by-flag memory
inequality, a live metrics reading, and a real two-server experiment) the learner needs to reason
about directly before touching a `compose.yaml` flag or a `/metrics` reading — so the deck follows
the **full concept-deck treatment** (coverage over economy, §0): every deep-dive section gets its
own claim-titled slide, not a compressed highlight reel. The visual language follows the
CourseSmith whiteboard style contract (`templates/deck/whiteboard-style-guide.md`): Patrick Hand
cursive, `#1e1e1e` primary / `#757575` secondary strokes on white paper with the five semantic
pastel fills (§1: green good · red bad/full · blue data · orange caution · purple meta), the
`#rough` wobble filter on non-flat elements only (now `filterUnits="userSpaceOnUse"` — fixed 2026-08-14), and
the shared `#ah`/`#ahg` arrowhead markers. Two slides also carry a full-bleed Magnific pencil-sketch
scene illustration (image-on-top, title-below, per the divider CSS pattern) at the deck's two
section openers. The arc moves — **why contiguous per-request KV reservation wastes memory and
fragments (PagedAttention) → why a static batch stalls on its slowest member (continuous batching)
→ what the lab's four flags actually buy against that machinery, including the
swap-space-is-inert-on-CPU finding → how to read `/metrics` to know which flag to move → when this
machinery is worth the cost at all vs. Ollama → the real experiment's numbers, absolute and
scaling.**

Page numbers are `M3-DD·NN` to distinguish this deck from the lesson concept deck's `M3·NN`
(`03-vllm.html`, untouched by this work) and from the M3B deep-dive deck's own `M3B-DD·NN` prefix.

## Old → new slide numbering (2026-08-14 pass)

Two new divider slides were inserted; every content slide's facts, SVG scene, and takeaway are
otherwise unchanged from the 2026-07-25 round-3 regen — only its position number shifted.

| Old # | New # | Old # | New # | Old # | New # |
|---|---|---|---|---|---|
| 1 | 1 | 7 | 9 | 13 | 15 |
| — | **2 (NEW divider)** | 8 | 10 | 14 | 16 |
| 2 | 3 | 9 | 11 | 15 | 17 |
| 3 | 4 | 10 | 12 | 16 | 18 |
| 4 | 5 | 11 | 13 | 17 | 19 |
| 5 | 6 | — | **8 (NEW divider)** | 18 | 20 |
| 6 | 7 | 12 | 14 | | |

## Slide table

| # | Slide | Purpose | Visual | Takeaway |
|---|-------|---------|--------|----------|
| 1 | The swap that made this worth doing (title) | Frame the page: the lab did a two-variable swap onto vLLM — this deck opens the machinery that made that swap pay off | Title sketch: three theme boxes (paged memory · continuous batching · the lab's flags) converging on one "why the swap was worth it" box | credit line: Gourav Shah · School of DevOps & AI · Deep Dive (Part 2) |
| 2 | **PagedAttention: one room at a time, not a whole floor** (NEW divider) | Section opener — a full-bleed photo-style illustration before the detailed hotel scenes, giving the analogy room to breathe | **Magnific illustration** (`pagedattention-hotel-one-room-at-a-time.jpg`): split scene, one clerk reserves a whole empty floor for a single suitcase, the other hands out one room key at a time | (no takeaway line — divider slides carry no prose, the title is the claim) |
| 3 | A naive server books the whole floor for a maybe | The naive-allocation problem: reserving `max_model_len` tokens of contiguous KV cache per request, worst case, every time | **Scene** — a hotel front desk reserving an entire floor to a guest who might stay one night or a month; most of the floor sits empty and locked | Reserving worst-case space per request wastes memory even when the aggregate free space would technically fit another guest |
| 4 | PagedAttention runs the hotel by the room, not the floor | The paged-allocation fix: guests get one room at a time, checked in as needed, freed on checkout | **Scene** — the same front desk now handing out single rooms on demand from a shared pool, a front-desk ledger (block table) tracking who's in which room | A short stay uses one room and frees it; a long stay just gets the next free room — never a whole floor reserved up front |
| 5 | Block tables map logical tokens to scattered physical blocks | The actual mechanism: fixed-size KV blocks (16 tokens), a per-sequence block table mapping logical position → physical block, free blocks returned to a shared pool | Two sequences' logical token runs (A, B) mapping through per-sequence block tables to non-contiguous physical blocks in a shared pool, one block still free | No sequence needs a contiguous span — free blocks can be scattered anywhere and still get handed out immediately |
| 6 | 98% reserved, unused, and still unavailable to anyone else | Naive contiguous reservation's concrete waste: a 20-token answer inside a 1024-token reservation | Big outer box (red, "1024 reserved") with a small filled sliver inside (blue, "20 used") and the rest hatched/empty | A server that reserves the worst case per request pays for it on every request, whether or not it happens |
| 7 | 40% free in aggregate, but no single gap big enough | The fragmentation problem: contiguity requirement blocks admission even when total free space would fit | Three scattered small free gaps (blue, labeled with sizes) next to one big pending request (red, needs a bigger contiguous span than any single gap) with a "blocked" red X | Contiguity — not total free memory — is what naive allocation actually runs out of; paging removes the requirement entirely |
| 8 | **Continuous batching: reseat the second a chair opens** (NEW divider) | Section opener — a full-bleed photo-style illustration before the detailed restaurant scenes | **Magnific illustration** (`continuous-batching-restaurant-instant-reseat.jpg`): a lone guest finishes dessert while people wait outside empty chairs; a waiter clears a plate the instant a new guest sits down at another table | (no takeaway line) |
| 9 | A static-batch table waits for the slowest guest to leave | The static-batching problem: the whole dining room reseats only once every table has finished | **Scene** — a restaurant with one table still lingering over dessert while several already-finished tables sit uncleared, and a "closed" sign on the front door | One unrelated party finishing late blocks every other finished table from leaving and every new customer from being seated |
| 10 | vLLM reseats the moment a table clears | The continuous-batching fix: the instant a table finishes, it's cleared and reseated — no correlation to any other table | **Scene** — the same restaurant, one table being cleared and a new party seated at it immediately while the other tables keep eating undisturbed | The dining room is never blocked by the slowest table — clearing and reseating happen table by table, continuously |
| 11 | The scheduler checks every slot, every single step | The scheduling mechanism: per-decoding-step (not per-batch) checks for finished sequences, frees their slot+blocks, admits a waiting request into it | Running-batch box with several sequence slots, **2 fragments**: one slot's sequence hits a stop token and is freed → a waiting sequence is admitted into that same slot, same iteration | A new request waits, at most, one scheduling iteration — there is no "batch boundary" for it to wait behind |
| 12 | Continuous batching helps throughput; static batching hurts short jobs twice | The two-sided throughput/latency effect: static batching pads to the slowest member AND makes a 1-token answer wait behind nine 500-token ones | Two-panel comparison: static batch (red, padded-length bar + short job trapped behind long ones) vs continuous batch (green, every slot always doing useful work, short job returns immediately) | Continuous batching isn't just a throughput trick — it's also what lets a short request finish without waiting on unrelated long ones |
| 13 | Paging is what makes admitting a request every step affordable | Why the two features ship together: continuous batching's constant admission only works if allocating KV cache per admission is cheap | Two boxes (paged memory, continuous batching) with a two-way ink arrow between them labeled "makes admission cheap enough to do every iteration" | These aren't two features that happen to ship together — paging is the enabling mechanism continuous batching depends on |
| 14 | Two flags spend the same memory two different ways | `--dtype float32` (2x KV bytes/token vs bf16, no CPU kernel for bf16) and `--max-model-len` (blocks-per-sequence × max-num-seqs must fit the cache) as the two levers on the real budget | Big-box anatomy: `VLLM_CPU_KVCACHE_SPACE` budget box with two feed-in arrows labeled `--dtype` (2x cost per token) and `--max-model-len` × `--max-num-seqs` (blocks reserved) | float32's 2x memory cost is exactly why this lab keeps `--max-model-len` and `--max-num-seqs` deliberately small on a CPU path |
| 15 | --swap-space is accepted, validated, and does nothing here | The swap-space-inert-on-CPU finding — verified against the image's own `cpu_worker.py` source and this run's own `/metrics`, not inferred | Two-panel comparison: GPU path (green, VRAM full → spills to swap-space RAM tier, sequence survives) vs this CPU path (red/dashed, swap-space accepted at startup, `num_cpu_blocks="0"` on live `/metrics`, zero blocks ever come from it) | On this CPU backend `--swap-space` is dead weight, not a second budget line — raise `VLLM_CPU_KVCACHE_SPACE` instead when you need more headroom |
| 16 | The engine log already did the arithmetic for you | `MAX_NUM_SEQS` as the continuous-batching concurrency cap made concrete, tied to the real startup numbers this lab captured | Numbered rows: `VLLM_CPU_KVCACHE_SPACE=1 GiB` → `1456 blocks of 16 tokens` → `"Maximum concurrency for 1024 tokens: 22.75x"` — one arrow chain, real numbers from this run | Raising `MAX_NUM_SEQS` without raising the KV budget just moves the queue from "waiting on a batch slot" to "waiting on cache space" |
| 17 | Three gauges tell you which lever to pull | Reading `/metrics`: `num_requests_running`, `num_requests_waiting`, `gpu_cache_usage_perc` (CPU pool, historically GPU-named) together as a diagnosis, not three separate numbers | Big-box anatomy: three gauge dials in a row, with two diagnosis arrows below pointing to "raise MAX_NUM_SEQS" (low cache + queue) and "raise KV budget" (full cache + queue) | A growing waiting queue with cache usage already near 100% needs more memory, not a higher concurrency cap — and vice versa |
| 18 | One developer at a time never creates the problem this machinery solves | The vLLM-vs-Ollama decision: paging and continuous batching only pay for themselves when requests overlap in time and compete for memory | Decision tree (static): "serving a model to..." → one dev, one request at a time → Ollama-class server is enough; → many concurrent users/services → vLLM-class serving pays for itself | Ask whether requests actually overlap in time before reaching for vLLM — a single-user tool has nothing to page around or batch continuously |
| 19 | Matched test: one workload, two servers | Set up the experiment before the result: both models named (SmolLM2-135M on vLLM-CPU, qwen3.5:2b with thinking off on Ollama), four prompts in a row, three at once, and the same three in a row as the matched baseline | Two server boxes (blue, green) above three orange run boxes (4 in a row, 3 at once, same 3 in a row) with the ratio rule in gray: not a benchmark, read the direction not the digit | The ratio compares each server to its own matched baseline, so model size does not decide the winner of the scaling question |
| 20 | Ollama wins the scoreboard; vLLM wins the scaling curve | The real experiment's headline: Ollama faster in absolute tok/s at this toy CPU scale, but vLLM-CPU's concurrent run scales 3.42x vs Ollama's 1.17x off their own sequential baselines | Two-panel comparison: left "absolute speed" bar pair (Ollama taller/faster, green) — right "sequential → concurrent scaling" pair of arrows (vLLM 3.42x steep, Ollama 1.17x close to linear) | A mature single-stream runtime can out-run a toy vLLM setup in absolute terms and still lose on the metric that actually matters at scale: how far concurrent load bends the curve |
| 21 | What to carry into a real deployment (closing) | Five takeaways from the "Where you will use this" close; hand off back to the module | numbered rows (circles 1–5) — the course's takeaway idiom | Every knob on this page has a real-work trigger — blocks-per-sequence arithmetic, admission-every-iteration reasoning, gauge-first diagnosis, swap-space skepticism, overlap-before-vLLM judgment; credit + hand-off |

<!-- Visual pattern vocabulary used: title theme-boxes · Magnific illustration divider (2, 8) ·
     scene (3, 4, 9, 10) · big-box anatomy (6, 14, 17) · pipeline/mapping diagram (5) ·
     fan-out/blocked (7) · two-panel comparison (12, 15, 20) · hub-and-spoke (13) ·
     numbered rows (16, 21) · server/run boxes (19) · decision tree (18) · fragment build-up (11). -->

## Narration mapping

| Narration video (`m3-deepdive-narration.md`) | Slides |
|---|---|
| 1 — vLLM Deep Dive: What's Actually Under the Hood (talking head) | 1 |
| 2 — PagedAttention — The KV Cache as Paged Memory | 2, 3, 4, 5, 6, 7 |
| 3 — Continuous Batching — Why Requests Join and Leave Mid-Flight | 8, 9, 10, 11, 12, 13 |
| 4 — What Your vLLM Flags Actually Bought You | 14, 15, 16 |
| 5 — Reading /metrics — Which Lever to Pull | 17 |
| 6 — When vLLM-Class Serving Matters — and When It's Overkill | 18 |
| 7 — The Experiment — vLLM-CPU vs Native Ollama, Same Prompts | 19, 20 |
| 8 — Summary and Lab Bridge | 21 |

## Images added (2026-08-14, Magnific illustration pass)

Used sparingly per the "advanced technical material, only at genuine analogy beats" guidance for
deep-dive decks — 2 illustrations total, both on new divider slides, none on the existing
whiteboard-SVG content slides.

| Slide | File | Scene |
|---|---|---|
| 2 | `site/static/img/decks/03-deepdive/pagedattention-hotel-one-room-at-a-time.jpg` | Split scene: a clerk reserves a whole empty floor for one suitcase vs. a clerk handing out a single room key from a pegboard |
| 8 | `site/static/img/decks/03-deepdive/continuous-batching-restaurant-instant-reseat.jpg` | A lone diner finishes dessert while people wait outside empty chairs; a waiter clears a plate the instant a new guest sits down elsewhere |

Both generated via `mcp__magnific__images_generate` with the standard style-lock prompt, white-level
corrected (`magick -colorspace Gray -level 0%,88% -resize 1600x900 -quality 78`), saved external
(never base64-inlined), verified by content against their prompts before insertion (the first
restaurant attempt was rejected and regenerated — it produced a garbled door-sign word and a solid
gray banner artifact across the bottom third of the frame, both against the style contract).

## Recommended presentation order

Present strictly 1 → 21; the deck is one continuous build from "why naive allocation wastes memory"
through "what the real experiment showed." Open on slide 1 to name the three themes. **Slide 2 is
the new PagedAttention divider — let the illustration sit for a beat before moving into slides 3–4's
detailed hotel-floor-vs-hotel-room scene pair**, which still has to land before slide 5's
block-table mechanics makes sense; give that pair the same unhurried beat 3B gave its notepad scene.
Slides 6–7 are a fast pair making the waste and fragmentation concrete with real numbers (98%,
40%-free-but-blocked) — say each takeaway crisply. **Slide 8 is the new continuous-batching
divider** — same unhurried treatment as slide 2 — before slides 9–10's restaurant scene pair, which
deserves the same care 3–4 got; don't rush the analogy to get to the scheduler mechanics in slide
11. Slide 11's fragment build-up is the payoff of that analogy; slide 12 lands the two-sided
throughput/latency effect right after. Slide 13 is a short connective beat (why the two features
ship together) — quick, then move. Slides 14–16 are the flags triplet and the load-bearing evidence
slide of the whole deck: **slide 15 (swap-space-inert) is the single most counter-intuitive claim
here** — it contradicts what anyone who has run vLLM on a GPU would assume, and it is verified
against source + live `/metrics`, not inferred — pause on it, don't compress it. Slide 17 (the three
gauges) is the practical payoff of 14–16; give it real time since it's literally "what to do next"
advice. Slide 18 is the framing pivot — quick, decisive. Slides 19 and 20 are the deck's other must-not-
compress pair (19 is the setup, 20 the result): the fact that Ollama wins on absolute speed but loses on scaling behavior is the whole
experiment's teaching point, and it is easy to accidentally undersell by rushing past the "Ollama is
faster" half before landing on the scaling-factor half. Slide 21 lands the takeaways and hands off.
Under time pressure, compress 6–7 and 13 into single passes — never compress 2–4, 8–10, 15, or 19–20;
those carry the deep dive's actual new information, its illustrated analogies, and its one
counter-intuitive finding.

## Fragment map

Fragments are used only where a diagram builds up hop by hop; comparison, scene, divider, and
decision-tree slides stay static because they read better whole:

- **Slide 11** — 2 fragments: a running sequence hits its stop token and its slot/blocks are freed →
  a waiting sequence is admitted into that same now-free slot, same scheduling iteration.

Static slides (1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21) show the full
picture at once — dividers, scenes, mapping diagrams, comparisons, anatomy boxes, numbered rows, and
the decision tree all read better whole; slide 11 is the deck's only hop-by-hop build because it is
the one place the *sequence of events within a single scheduling iteration* is the actual point
being taught.

## Coverage check (HARD GATE — §0)

Every deep-dive.md section maps to at least one slide.

| Deep-dive section / concept | Slide(s) | Notes (analogy used, echoes/forward pointers) |
|---|---|---|
| Opening framing — the lab's swap, what this page opens up | 1 | Title theme boxes name the three arcs (paging, batching, flags) |
| §1 opener — PagedAttention section, hotel analogy introduced | 2 | Magnific illustration divider — full-bleed scene before the detailed whiteboard slides |
| §1 — naive contiguous per-request KV reservation, worst-case sizing | 3 | Scene: hotel books an entire floor for a maybe, illustration-author scene |
| §1 — PagedAttention: rooms handed out on demand, front desk = block table | 4 | Scene: same hotel, rooms on demand, illustration-author scene; "block table" now labels the ledger in-SVG (2026-07-25) |
| §1 — fixed-size KV blocks (16 tokens), per-sequence block table, physical mapping, free-pool return | 5 | Mapping diagram: two sequences' block tables to scattered physical blocks, one free; "16 tokens each" now labels the physical-blocks row in-SVG (2026-07-25) |
| §1 — concrete waste: 20-token answer inside a 1024-token reservation, ~98% unused | 6 | Big-box anatomy with real percentage from the page |
| §1 — fragmentation: 40% free in aggregate but no single span big enough, admission blocked | 7 | Fan-out of scattered gaps vs one blocked pending request |
| §2 opener — continuous batching section, restaurant analogy introduced | 8 | Magnific illustration divider — full-bleed scene before the detailed whiteboard slides |
| §2 intro — static-batch server reseats only once the whole room finishes | 9 | Scene: restaurant, one lingering table blocks everyone, illustration-author scene |
| §2 — continuous batching: reseat the instant a table clears, no batch-boundary correlation | 10 | Scene: same restaurant, immediate reseat, illustration-author scene |
| §2 — scheduling mechanism: per-decoding-step check, free slot+blocks, admit waiting request same iteration | 11 | Fragment build-up: slot frees → new sequence admitted |
| §2 — throughput effect (no idle slots) and tail-latency effect (short job doesn't queue behind long ones) | 12 | Two-panel: static (padded + trapped short job) vs continuous (always busy + immediate short-job return) |
| §2 close — paging and continuous batching are not separable features; paging enables cheap per-step admission | 13 | Hub-and-spoke: two-way arrow, "makes admission cheap enough to do every iteration" |
| §3 — `--dtype float32`: no bf16 CPU kernel, 2x KV bytes/token vs bf16 | 14 | Anatomy: dtype feeds the shared budget box |
| §3 — `--swap-space`: inert on this CPU backend, verified against `cpu_worker.py` source and live `/metrics` (`num_cpu_blocks="0"`) | 15 | Two-panel: GPU role (real overflow tier) vs this CPU build (accepted, validated, zero blocks) — the deck's one counter-intuitive, most-verified claim |
| §3 — `--max-model-len`: direct KV-cache budget line, worked backward from the container's 5 GB cap | 14 | Same anatomy box, second feed-in arrow |
| §3 — real startup-log arithmetic: `VLLM_CPU_KVCACHE_SPACE=1 GiB` → 1456 blocks → "22.75x concurrency for 1024 tokens" | 16 | Numbered-row arrow chain with this run's real captured numbers |
| §3 — `--max-num-seqs`: continuous-batching concurrency cap; raising it without cache budget just moves the queue | 14, 16 | Slide 14 carries the "queue just moves to cache space" note (added 2026-10-21) |
| §4 — `/metrics` Prometheus endpoint; three gauges (`num_requests_running`, `num_requests_waiting`, `gpu_cache_usage_perc`) | 17 | Anatomy: three gauge dials, now labeled with the literal metric names + "CPU pool, GPU-named" note in-SVG (2026-07-25) |
| §4 — gauges are instant snapshots, not counters; idle 0.0 means nothing in flight | 17 | Caption added 2026-10-21 |
| §4 — reading gauges together to decide which §3 flag to move (raise `MAX_NUM_SEQS` vs raise KV budget) | 17 | Same slide, two diagnosis arrows |
| §5 — PagedAttention/continuous batching only pay off under overlapping, competing requests; Ollama is the right call for single-user | 18 | Decision tree mirroring the page's own mermaid diagram |
| §6 — setup: both models named, thinking off, 4 sequential, 3 concurrent, matched-set baseline, not a benchmark | 19 | Added 2026-10-21 (setup slide) |
| §6 — sequential run: Ollama visibly faster in absolute wall time than vLLM-CPU at this toy scale | 20 | Left panel: absolute-speed bars |
| §6 — concurrent run + scaling factor: vLLM-CPU 3.42x vs Ollama 1.17x off matched-set sequential baselines | 20 | Right panel: scaling-factor arrows with the numbers from the page's results table |
| §6 — headline: absolute scoreboard vs scaling behavior are two different questions, both real | 20 | Slide takeaway line states both halves explicitly |
| "Where you will use this" — 5 real-work triggers | 21 | Closing numbered rows, one per trigger |

**No orphans.** Every deep-dive.md section (§1–§6, plus the opening framing paragraph and the
closing "Where you will use this") has at least one slide anchor. The `/metrics` idempotent-check
prose at the top of the page and the live `docker stats` / teardown commands in §6 are deliberately
not slides — they are terminal-output/console detail that belongs in the lab prose, not a concept
slide (the concept deck teaches concepts, never terminal output, per the style guide); the
underlying concepts those commands demonstrate (server coexistence, live experiment methodology)
are covered by slides 18–20.

## Verify-gate results (2026-08-14 pass)

- DOCTYPE at byte 0: pass
- `<section>` / `</section>` count: 20 / 20, matches spec row count
- External refs (`src="http`/`href="http`): zero
- `filterUnits="userSpaceOnUse"` present on the shared `#rough` filter: pass (was missing before this pass)
- `display: 'flex'` in `Reveal.initialize`: pass (already present)
- `class="divider"` count: 2, both with image-on-top/title-below CSS + 80% autofit ceiling
- Pagenos: 20, sequential `M3-DD·01`–`M3-DD·20`, renumbered after the two insertions
- File size: 232 KB (well under the 800 KB cap)
- Rendered headless (Chrome `--headless --screenshot`): title slide and slide 2 (PagedAttention
  divider) both confirmed visually correct — illustration on top, title below, pure white
  background, wobble filter intact on axis-aligned lines
