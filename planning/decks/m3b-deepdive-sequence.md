# Module 3B Deep Dive — Fine-Tuning Parameters Under the Hood · Explainer Deck Sequence

<!-- CourseSmith sequence spec — authored and approved BEFORE the deck HTML is built.
     Convention: whiteboard-style-guide.md §5. One row per slide; every slide needs
     purpose + visual + takeaway. NO slide-count cap (§0): one idea per slide, every
     deep-dive.md section gets a slide — the coverage table below is a hard gate. -->

> **2026-08-14 update:** deck was 20 slides; the 2026-10-21 pass made it 23 (added slides 17, 20, 22) (was 19). Added slide 2, a Magnific pencil-sketch
> illustration ("A notepad clipped to a frozen textbook" — `site/static/img/decks/03b-deepdive/analogy-rank-notepad-width.jpg`)
> ahead of the existing rank/notepad-width diagram slide (now slide 3); all pagenos M3B-DD·02→19
> renumbered to ·03→20. Fixed the shared `#rough` filter (was default objectBoundingBox, now
> `filterUnits="userSpaceOnUse"` — axis-aligned lines were invisible). Narration script for this
> deep-dive: `planning/narration/m3b-deepdive-narration.md`. No other slides changed; the rest of
> this doc (below) describes the original 19-slide sequence and is otherwise still accurate.

This companion doc maps the 19-slide explainer deck (`site/static/decks/03b-deepdive.html`) to the
Module 3B deep-dive page (`site/docs/m3b-finetuning/deep-dive.md`). Unlike a short framing-only
deep-dive deck, this page's material is dense mechanics the learner needs to actually reason about
rank, quantization, and training dynamics before they touch a config file — so the deck follows the
**full concept-deck treatment** (coverage over economy, §0): every major deep-dive section gets its
own claim-titled slide, not a compressed highlight reel. The visual language follows the CourseSmith
whiteboard style contract (`templates/deck/whiteboard-style-guide.md`): Patrick Hand cursive,
`#1e1e1e` primary / `#757575` secondary strokes on white paper with the five semantic pastel fills
(§1: green good · red bad/full · blue data · orange caution · purple meta), the `#rough` wobble
filter on non-flat elements only, and the shared `#ah`/`#ahg` arrowhead markers. The arc moves — **what the
adapter's size controls (rank/alpha/target modules/dropout) → why shrinking the frozen base to
4 bits doesn't wreck it (NF4/QLoRA) → what the loss curve is actually telling you (lr, overfitting,
batch/grad-accum) → the silent failure mode (chat-template mismatch) → how to decide fine-tune vs.
RAG vs. prompt → the real three-run experiment and its numbers.**

Page numbers are `M3B-DD·NN` to distinguish this deck from the lesson concept deck's `M3B·NN`
(`03b-finetuning.html`, untouched by this work).

**2026-07-25 visual rebalance.** Per `sdd/deck-rebalance-contract.md`, every slide's
`.s` subtitle was rewritten from a multi-line paragraph (130–196 chars) down to a single line
(≤74 chars, all ≤80). No load-bearing fact was dropped — every number, term, and comparison the
old subtitles stated was already present as a label inside that slide's SVG (e.g. slide 17's
"0.200 / 0.449" loss values, slide 5's `q_proj`/`v_proj` "default target" labels), so shortening
the prose text required no relocation into the SVGs or takeaways. SVG sizing, viewBoxes, palette,
fragments, slide count, and pagenos are unchanged — the deck's `max-height:58%` SVG rule already
matched the style-guide contract before this pass. The "Purpose" column below is descriptive prose
(not a verbatim quote of the old `.s` text), so the coverage table's claims remain truthful
unchanged.

**2026-07-25 round-3 skeleton regen.** Per `sdd/deck-regen-contract.md`, the deck was
rebuilt byte-for-byte from `templates/deck/deck-skeleton.html.tmpl` (round-3): anchored layout
(title anchored TOP, subtitle anchored BOTTOM as a caption, visual centered in the flex band via
`Reveal.initialize({display:'flex'})` + `svg{order:2; max-height:68%}`), and the on-slide
`p.takeaway` line **removed from every slide that had one** (slides 2–18; slides 1 and 19 never
carried one — title/closing use `.kicker`/`.credit` instead). Content parity is exact: same 19
slides, same order, same pagenos (`M3B-DD·01`–`19`), same facts/numbers, same SVG scenes reused
verbatim (no viewBox changes were needed). The removed on-slide takeaway text is preserved below —
every differing wording is appended inline to its row as *"(on-slide wording removed 2026-07-25:
…)"*; rows where the on-slide line already matched the spec's authored Takeaway carry no such note.
Zero splits. Self-gates (subtitle ≤80 chars, zero `.takeaway` elements, zero external refs, tag
balance, section count = 19, `display:'flex'`/`svg{order:2}` present, headless-Chrome render) all
passed — see the regen's own report for the full gate output.

## Slide table

| # | Slide | Purpose | Visual | Takeaway |
|---|-------|---------|--------|----------|
| 1 | The flags you didn't touch (title) | Frame the page: the lab ran `mlx_lm.lora` on copied flags — this deck opens each one | Title sketch: four theme boxes (rank/alpha · NF4 · loss curves · chat template) converging on a training-run box | credit line: Gourav Shah · School of DevOps & AI · Deep Dive (Part 2) |
| 2 | **A notepad clipped to a frozen textbook** (divider) | Section opener with a full-bleed illustration before the rank slides | Magnific illustration divider | n/a |
| 3 | `r` is how wide the correction notepad is | LoRA analogy: frozen textbook + clipped-on notepad; rank = notepad width | **Scene** — frozen book (ink) with a narrow notepad (r=4) and a wide notepad (r=64) clipped to the same page, side by side | A wider notepad captures more complex corrections, but it's more paper to carry — and more room to overfit |
| 4 | Two thin matrices instead of one fat one | The actual math: `W` frozen, `A`(d×r) and `B`(r×d) trained instead of the full d×d update | Big frozen `W` box (blue, dashed = untouched) → **2 fragments**: `A` matrix appears → `B` matrix appears, both feeding into `A×B` | Trainable parameters scale with `r`, not with `d²` — r=4→r=64 is a 16x jump in that layer's trainable weights. *(on-slide wording removed 2026-07-25: "Trainable parameters scale with r, not with d² — this is why rank is the primary memory/capacity dial.")* |
| 5 | `alpha/r` is a ratio, not two knobs | The effective update is `(alpha/r) × (A×B)` — alpha rescales what the matrices already learned | Two config cards side by side: `r=8, alpha=16` and `r=16, alpha=32`, both circling the same "ratio = 2" label | Bump the rank without rescaling alpha and you've silently changed every adapted layer's step size too |
| 6 | Not every layer gets a notepad | `target_modules` — which weight matrices get adapted at all; q_proj/v_proj is the default starting point | Transformer layer anatomy box with q_proj/v_proj (green, notepad clipped) vs k_proj/output/FFN (gray, untouched) | Attention's query/value projections steer *what the model attends to* — the highest-leverage place to start, not the only place. *(on-slide wording removed 2026-07-25: "Attention's query/value projections are the highest-leverage place to start — not the only place.")* |
| 7 | Dropout stops the notepad leaning on one path | Dropout zeroes a fraction of adapter activations per step so no one path is over-relied on | Adapter path with several routes, **2 fragments**: a route lights up → gets randomly crossed out (dashed red X) | Matters little on 8 toy examples — it's what keeps a 500–2000-example real adapter from memorizing order instead of the pattern. *(on-slide wording removed 2026-07-25: "Matters little on 8 toy examples — it's what keeps a real 500–2000-example adapter from memorizing example order instead of the pattern.")* |
| 8 | 16 buckets, placed where the weights actually live | QLoRA/NF4 analogy: sorting warehouse parts into a fixed number of size buckets | **Scene** — warehouse shelf with 16 buckets drawn dense in the middle, sparse at the edges, parts (dots) clustering near the dense buckets | Weights are normally distributed, so NF4 spends its 16 values where the data is — that's why 4-bit survives here |
| 9 | Double quantization: quantizing the quantizer's own numbers | The per-block scaling constants NF4 needs also cost memory — DQ quantizes those too | Small "scale constants" box (orange) feeding into the main NF4 bucket box, with a second dashed pass labeled "8-bit" wrapping the constants | Small per-weight, but it adds up — roughly another 0.4 bits per parameter at 7B+ scale |
| 10 | Storage in 4-bit, math in 16-bit | Frozen base sits in NF4 at rest; dequantized on the fly to bf16/fp16 for the actual matmul; adapter never quantized | Two-panel comparison: "at rest" (4-bit blue box) vs "during compute" (bf16 box) with a dashed dequant arrow between; small adapter box stays fp16 throughout, never touching the 4-bit path | The part that needs gradient precision — the adapter — never touches 4-bit; that's why QLoRA trains stably instead of collapsing into quantization noise. *(on-slide wording removed 2026-07-25: "The part that needs gradient precision — the adapter — never touches 4-bit; that's why QLoRA trains stably.")* |
| 11 | The learning rate is the optimizer's step size | Too high oscillates/diverges, too low doesn't move in 50 iterations; `mlx_lm.lora`'s default is deliberately conservative | Staircase/ladder diagram: three step sizes descending toward a loss-minimum floor — tiny steps stall, huge steps overshoot past the floor, right-sized steps land | Production configs run 10–30x higher than the lab default, but pair it with a decay schedule to start fast and settle gently. *(on-slide wording removed 2026-07-25: "Production configs run higher than the lab default, but pair it with a decay schedule to start fast and settle gently.")* |
| 12 | Falling train loss can still mean the adapter is memorizing | The overfitting signature: train loss keeps falling while validation loss stalls or rises | Two-panel comparison: "healthy" (both curves falling together, green) vs "overfitting" (train falls, val stalls/rises, red) | Before trusting "loss went to near-zero," ask for the validation curve and a held-out generation — not just the train number |
| 13 | Bigger batch costs memory; more accumulation steps don't | Batch size vs. gradient accumulation on a 16 GB machine | Two-panel comparison: "bigger batch" (stacked examples box, memory gauge climbing, red zone) vs "grad accumulation" (several small passes accumulating into one step, memory gauge flat, green) | On a memory-constrained machine, reach for gradient accumulation before a bigger `--batch-size` — that's the lever that actually blows your budget |
| 14 | Same JSON layout, wrong token boundaries — and it still trains | Chat-template mismatch: training data's format must match the base model's tokenizer template | **Scene** — a training-data page being fed through a "translator" stamped with the wrong template icon, coming out mismatched on the other side, no error/warning sign anywhere | A format mismatch doesn't error — it silently trains the adapter on the wrong signal, and it "worked" in training but underperforms in the field. *(on-slide wording removed 2026-07-25: "A format mismatch doesn't error — it silently trains the adapter on the wrong signal, and it underperforms in the field.")* |
| 15 | One fixed prompt set, reused every time you change a knob | Evaluation methodology: side-by-side generations across every variant, not a one-off vibe check | Numbered rows: a fixed prompt set (blue) fanning out to three variant outputs (baseline / rank-4 / high-lr) lined up for comparison | Generation is stochastic — one good-looking output proves nothing; only a repeated fixed comparison does. *(on-slide wording removed 2026-07-25: "Only a repeated fixed comparison shows a real behavior change — a single generation proves nothing.")* |
| 16 | Missing knowledge or missing behavior — the fork before you fine-tune | The fine-tune vs. RAG vs. prompt decision tree, now with the cost-of-being-wrong column | Decision tree (static): "model gets it wrong" → knowledge gap → RAG; behavior gap → better prompt works? → prompting; else → fine-tune | A bad prompt costs an edit; a bad fine-tune costs a training run and a re-evaluation — reach for fine-tuning only after prompting and RAG are exhausted. *(on-slide wording removed 2026-07-25: "A bad prompt costs an edit; a bad fine-tune costs a training run — exhaust prompting and RAG first.")* |
| 17 | mlx-lm: rank and scale live in YAML | Porting trap: no `--lora-rank` flag in mlx-lm 0.31.3, rank and scale sit in `lora_parameters`, and `scale` is already the alpha/r composite | Three boxes: crossed-out flag, YAML block, scale = alpha/r, with the 4x porting warning | Carry the effective multiplier across frameworks, not the raw number |
| 18 | Same lab, three adapters, one comparison table | Experiment setup: baseline (r=8, lr=1e-5), Variant A (r=4), Variant B (lr=1e-4) — same data, distinct adapter dirs | Three labeled adapter-directory boxes (blue) branching from one shared training-data box (purple) | Every variant trains on the identical eight rows — only the rank or the learning rate changes, so the comparison isolates one knob at a time. *(on-slide wording removed 2026-07-25: "Every variant trains on the identical eight rows — only the rank or the learning rate changes, isolating one knob at a time.")* |
| 19 | Cutting rank in half measurably raises the floor | Real result: rank 4 converges to a higher final loss than rank 8, even on 8 toy examples | Two-panel comparison: rank-8 loss curve landing at 0.200 (green) vs rank-4 landing at 0.449 (orange), same starting point 3.721 | The capacity cut is real and visible even on eight examples — confirms rank is the primary capacity dial, not a minor tuning knob. *(on-slide wording removed 2026-07-25: "The capacity cut is real and visible even on eight examples — confirms rank is the primary capacity dial.")* |
| 20 | Half the rank, half the trainable parameters | Rank 8 trains 0.733M of 494.033M (0.148%), rank 4 trains 0.367M (0.074%), peak memory about 1.29 GB | Two boxes with parameter counts and a memory caption | Parameters scale linearly with rank |
| 21 | 10x the learning rate, and no instability shows up | Real result: Variant B converged faster and lower, smooth monotonic curve — theory meets an 8-example toy set | Loss curve comparison: baseline (0.200) vs 10x-lr (0.054), both smooth, with a gray annotation "instability needs a harder, noisier dataset to show up" | A suspiciously good loss curve on a trivial dataset tells you about the dataset's easiness, not the learning rate's safety at production scale |
| 22 | A held-out prompt is the real test | All three adapters give the same JSON on the training prompt (memorization only); a prompt none saw is the real test | Training-prompt box arrow to held-out-prompt box | Never judge an adapter on a prompt it trained on |
| 23 | What to carry into a real adapter (closing) | Five takeaways from the "Where you will use this" close; hand off to the module's live-tool / next steps | numbered rows (circles 1–5) — the course's takeaway idiom | Every knob on this page has a real-work trigger — ratio discipline, NF4 trust, validation-curve skepticism, template verification, grad-accum first; credit + module hand-off |

<!-- Visual pattern vocabulary used: title theme-boxes · scene (2, 7, 13) · big-box anatomy (5) ·
     two-panel comparison (9, 11, 12, 17, 18) · staircase/ladder (10) · numbered rows (14, 19) ·
     hub-and-spoke-ish branching (16) · decision tree (15) · fragment build-ups (3, 6, 8). -->

## Recommended presentation order

Present strictly 1 → 19; the deck is one continuous build from "what sets the adapter" through
"what the real experiment showed." Open on slide 1 to name the four themes. **Slides 2–3 are the
conceptual hinge** — the notepad scene (2) has to land before the matrix-math slide (3) makes sense,
so don't rush past the analogy to get to the formula. Slides 4–6 are a fast triplet (alpha ratio,
target modules, dropout) — say each takeaway crisply and move; none needs more than ~20 seconds.
Slide 7 (NF4 warehouse scene) is the second hinge — it's the least intuitive claim in the whole deep
dive ("4 bits shouldn't work, but it does") and deserves the same unhurried treatment as slide 2.
Slides 8–9 follow directly from it. Slides 10–12 are the loss-curve triplet; slide 11 (overfitting
signature) is worth a beat because it's the one learners misread most often in the wild. Slide 13
(chat-template scene) is a standalone gut-punch slide — pause after the takeaway; it's the "silent
failure" the whole page warns about. Slide 14 sets up the methodology before slide 15's decision
tree, which is the practical fork most learners came for — don't compress it. Slides 16–18 are one
continuous build (experiment setup → result A → result B); keep momentum, the numbers are the
payoff. Slide 19 lands the takeaways and hands off. Under time pressure, compress 4–6 into a single
pass ("ratio matters, q/v is the default, dropout matters more at scale") — never compress 2, 7, 13,
or 17–18; those are the slides carrying the deep dive's actual new information.

## Fragment map

Fragments are used only where a diagram builds up hop by hop; comparison, scene, and decision-tree
slides stay static because they read better whole:

- **Slide 3** — 2 fragments: matrix `A` appears next to frozen `W` → matrix `B` appears, both feeding `A×B`.
- **Slide 6** — 2 fragments: an adapter path lights up → gets randomly crossed out by dropout.
- **Slide 8** — 2 fragments: the scale-constants box appears next to the NF4 buckets → the dashed "8-bit" pass wraps around it.

Static slides (1, 2, 4, 5, 7, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19) show the full picture at
once — scenes, comparisons, anatomy boxes, and the decision tree all read better whole; the two
result slides (17, 18) present the finished loss-curve comparison rather than building it hop by hop,
since the "hop" here is a full training run, not a single reveal step.

## Coverage check (HARD GATE — §0)

Every deep-dive.md section maps to at least one slide.

| Deep-dive section / concept | Slide(s) | Notes (analogy used, echoes/forward pointers) |
|---|---|---|
| §1 intro — LoRA freezes base weights, trains two small matrices | 1, 4 | Title theme boxes name it; slide 4 is the actual A/d×r, B/r×d mechanics |
| §1 — rank `r` = notepad width analogy | 3 | Scene: frozen textbook + notepad clipped on, narrow vs wide, illustration-author scene |
| §1 — trainable params scale with `r` not `d²`; 16x jump r=4→r=64 | 4 | Fragment build-up on the matrix diagram |
| §1 — `alpha` scaling factor; `alpha/r` ratio, not independent knobs | 5 | Two config cards, same ratio at two widths |
| §1 — `target_modules`; q_proj/v_proj as the default starting point | 6 | Transformer-layer anatomy box, green (adapted) vs gray (untouched) |
| §1 — `dropout` on the LoRA path | 7 | Fragment build-up: path lights up → randomly zeroed |
| §2 intro — QLoRA quantizes frozen base to 4-bit | 8 | Bridges from title theme box 2 |
| §2 — NF4 (4-bit NormalFloat) matches the normal distribution of weights | 8 | Scene: warehouse buckets dense in the middle, sparse at the edges, illustration-author scene |
| §2 — double quantization of the scaling constants | 9 | Fragment build-up: constants box → 8-bit wrap |
| §2 — storage dtype (4-bit) vs compute dtype (bf16/fp16); adapter never quantized | 10 | Two-panel: at-rest vs during-compute, adapter box stays outside the 4-bit path |
| §2 note — MLX vs bitsandbytes/NF4 hardware distinction | 10 (caption added 2026-10-21) | Deliberately not a separate slide — a hardware-routing caveat belongs in the deep-dive prose/lab, not a concept slide; the deck teaches the *mechanism*, the page's admonition teaches *which hardware invokes it* |
| §3 — learning rate as step size; too high/low; default vs production configs | 11 | Staircase/ladder — three step sizes vs the loss floor |
| §3 — epochs/iters vs overfitting; the memorization signature | 12 | Two-panel: healthy vs overfitting curve patterns |
| §3 — batch size vs gradient accumulation memory trade-off | 13 | Two-panel: memory gauge climbing vs flat |
| §4 — chat template; format mismatch trains silently on the wrong signal | 14 | Scene: training data through mismatched-template translator, no error sign, illustration-author scene |
| §5 — evaluation methodology: fixed held-out prompts, side by side | 15 | Numbered-rows fan-out: one prompt set → three variant outputs |
| §5 — fine-tune vs. RAG vs. prompt decision tree; cost of being wrong | 16 | Decision tree, static, cost-of-being-wrong in the takeaway |
| §6 — experiment setup: baseline + Variant A (rank) + Variant B (lr), distinct adapter dirs | 18 | Branching boxes from one shared training-data box |
| §6 — flags pinned: no `--lora-rank`, rank and scale in YAML, scale is the alpha/r composite | 17 | Added 2026-10-21 |
| §6 — Variant A result: rank 4 → higher final loss (0.449 vs 0.200) | 19 | Two-panel loss-curve comparison with real numbers |
| §6 — trainable parameters 0.733M vs 0.367M, peak memory about 1.29 GB | 20 | Added 2026-10-21 |
| §6 — Variant B result: 10x lr → faster/lower, no instability signature | 21 | Loss-curve comparison with real numbers + gray caveat annotation |
| §6 — held-out generation check; all three variants generalize correctly | 15 (methodology), 22 (held-out is the real test) | The generation output itself is lab-console detail (no terminal output on slides, per style guide); the deck teaches *why* you check held-out prompts (14) and *what the numbers showed* (17–18), not the raw generation transcript |
| "Where you will use this" — 5 real-work triggers | 23 | Closing numbered rows, one per trigger |

**No orphans.** Every deep-dive.md section (§1–§6) has at least one slide anchor; the two rows above
marked "framing only" are intentional omissions of console/hardware-routing detail that belongs in
the page's prose and admonitions, not a concept slide (concept deck teaches concepts, never terminal
output, per the style guide) — the underlying concept each of those details supports is still
covered by an adjacent slide.
