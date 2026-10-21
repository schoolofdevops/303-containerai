# Module 5 Deep Dive — RAG Parameters Under the Hood · Explainer Deck Sequence

**2026-08-14 narration + rough-filter fix + illustration pass:** wrote the narration package to
`planning/narration/m5-deepdive-narration.md` (8 videos: talking-head intro, §1–§6 as one explainer
each — §6 folds in the §7 chunking experiment — and a summary/lab-bridge; retell measured well under
the 10%/section gate). Fixed the shared `#rough` SVG filter bug: it was still on the default
`objectBoundingBox` region (`x="-5%" y="-5%" width="110%" height="110%"`), which makes any
perfectly axis-aligned line invisible — switched to `filterUnits="userSpaceOnUse" x="-80" y="-80"
width="1300" height="600"`, matching the fix already shipped on the other module decks. Added one
new slide, **M5-DD·01b** ("Every chunking choice is a cut you can't take back"), directly after the
title slide — a Magnific pencil-sketch illustration (`site/static/img/decks/05-deepdive/analogy-
cutting-index-cards.jpg`, scissors mid-cut through paper with uneven resulting cards) for the
index-card analogy that opens §1. Deliberately the ONLY illustration added: every other slide in
this deck already carries a functional technical diagram (distance numbers, chunk-split visuals,
token-budget arithmetic) that IS the teaching payload — adding decorative photos there would
compete with, not support, the content. No divider-slide CSS was needed (this deck has no `.divider`
slides). Slide count 21 → 22; the new slide's pageno (`01b`) is intentionally non-sequential rather
than renumbering all 21 following slides — cosmetic only, not a verify-gate concern.

**2026-07-25 visual rebalance:** applied the founder's deck-rebalance contract to all 21 slides.
Every `.s` subtitle was cut from a multi-sentence paragraph (125–275 chars) to one line (≤ ~85
chars) — the sharpest hook for that slide's idea, not a recap of the takeaway. Every SVG `viewBox`
height was grown toward the 380–420 range (from a compressed 260–380) with internal font sizes and
shape sizes scaled up proportionally so the diagram fills ~55–65% of slide height, matching
`05-naive-rag.html`'s reference proportions. No facts were dropped: numbers and mechanism details
that used to live only in subtitle prose were relocated into SVG `<text>` labels or folded into the
one-line takeaway (see the "Notes" column below and in the coverage table for where each landed).
Slide 21 (closing) had no `.s` subtitle before or after — its title already states the caveat
directly — so only its SVG viewBox/fonts were grown (340→380) for consistency with the rest of the
deck. Slide count (21), pagenos (M5-DD·01..21), order, palette, fonts, shared `#rough`/`#ah`/`#ahg`
defs, and the no-fragments policy are all unchanged.

**2026-07-25 round-3 skeleton regen:** rebuilt `05-deepdive.html` byte-for-byte from the turnkey
`templates/deck/deck-skeleton.html.tmpl` (anchored layout, `Reveal.initialize({display:'flex'})`,
`svg{order:2; max-height:68%}`) per `.superpowers/sdd/deck-regen-contract.md`. `p.takeaway` is no
longer rendered on any slide — the exit line for each slide now lives ONLY in this spec's Takeaway
column below (presenter/narration guidance, never on-slide). Two subtitles that had crept to 82–83
chars during the port (slide 4 "Overlap photocopies…" and slide 16 "Naive RAG never asks…") were
re-cut to ≤80 chars without dropping the fact (both facts already live in the SVG). Content parity
otherwise verified against the prior deck: same 21 slides, same order, same pagenos (M5-DD·01..21),
same facts/numbers/SVG scenes, same ~800-char / 823-byte corpus-size correction (both mentions —
slide 5's "~800-char" and slide 21's "823 bytes" — carried through unchanged). No slides split.

<!-- CourseSmith sequence spec — authored and approved BEFORE the deck HTML is built.
     Convention: whiteboard-style-guide.md §5. One row per slide; every slide needs
     purpose + visual + takeaway. NO slide-count cap (§0): one idea per slide, every
     deep-dive.md section gets a slide — the coverage table below is a hard gate.
     Style/structure mirror: site/static/decks/03-deepdive.html (the shipped M3
     deep-dive deck) — same page-number prefix pattern (M5-DD·NN), same shared
     #rough/#ah/#ahg defs declared once in a hidden svg, same full-concept-deck
     treatment (not a 5-6 slide framing deck) because this deep-dive's material is
     dense, numeric, and the learner reasons with it directly (real distances, a
     real norm measurement, a real truncation log line, a real 3-variant table). -->

This companion doc maps the 21-slide explainer deck (`site/static/decks/05-deepdive.html`) to the
Module 5 deep-dive page (`site/docs/m5-naive-rag/deep-dive.md`). Like M3's deep-dive deck, this
page's material is measured evidence the learner needs to reason about directly before touching a
`chunk_size`, `k`, or `num_ctx` value — so the deck follows the **full concept-deck treatment**
(coverage over economy, §0): every deep-dive section gets its own claim-titled slide, not a
compressed highlight reel. The visual language follows the CourseSmith whiteboard style contract
(`templates/deck/whiteboard-style-guide.md`): Patrick Hand cursive, `#1e1e1e` primary / `#757575`
secondary strokes on white paper with the five semantic pastel fills (§1: green good · red
bad/full · blue data · orange caution · purple meta), the `#rough` wobble filter on shapes only,
and the shared `#ah`/`#ahg` arrowhead markers. The arc moves — **why chunk size trades context
completeness against embedding precision (index-card analogy) → why top-k is a context-budget
decision, not a safety dial → what "similar" actually means under ChromaDB's default L2 metric,
and why the embedder — not the LLM — defines retrieval → the real context-window arithmetic,
including the verified truncation mechanism that drops the front of an over-budget prompt → how to
tell a retrieval miss from a generation miss → the raw evidence from querying ChromaDB directly
(confirmed `space: l2`, real distances, measured norm 1.000000) → the real 3-variant chunking
experiment and its honest small-corpus caveat.**

Page numbers are `M5-DD·NN` to distinguish this deck from the lesson concept deck's `M5·NN`
(`05-naive-rag.html`, untouched by this work).

## Slide table

| # | Slide | Purpose | Visual | Takeaway |
|---|-------|---------|--------|----------|
| 1 | The knobs nobody explained (title) | Frame the page: the lab used `chunk_size=500`, `k=3`, `nomic-embed-text` without ever saying why — this deck opens those knobs | Title sketch: four theme boxes (chunking · top-k · similarity metric · context budget) converging on one "what actually changes" box | credit line: Gourav Shah · School of DevOps & AI · Deep Dive (Part 2) |
| 2 | Cut the index card too small and the fact loses its command | The chunking problem, too-small case: a fact and the command that goes with it end up on separate cards, so one card alone reads like half an idea | **Scene** — a hand holding two small index cards, one reading "restart the payments service", the other (separated) holding the actual command; a magnifying glass over the gap between them | A retrieved chunk that's too small hands the model the fact without the command two sentences later — precise, but incomplete |
| 3 | Cut it too large and four procedures blur into one average | The chunking problem, too-large case: an oversized chunk forces the embedding to compress several unrelated procedures into one vector — noise dilution | **Scene** — the same hand holding one oversized index card crammed with four different runbook procedures, each in a smaller cramped handwriting, blurring together | A chunk that swallows several topics forces its embedding to represent the *average* of all of them — a mediocre match for anything specific |
| 4 | Overlap photocopies the tail onto the next card | The overlap mechanism: the last N characters of chunk 1 are repeated at the start of chunk 2, so a fact sitting on the cut boundary is never orphaned | Pipeline diagram: one long document splitting into chunk 1 and chunk 2 with a highlighted shared "overlap band" between them, arrow into two embed boxes into ChromaDB | Overlap exists for facts that land exactly on a chunk boundary — with `overlap=50` a boundary fact still appears whole in at least one chunk |
| 5 | This corpus split into exactly 2 chunks, and that's why | Concrete grounding: `chunk_size=500` on the ~1,000-char Acme corpus packs roughly two runbook sections per chunk — the lab's own ingest reported 2 chunks | Numbered rows: `RecursiveCharacterTextSplitter` separator cascade (`\n\n` → `\n` → ` ` → `""`) then an arrow to "2 chunks, this corpus" in a blue box | The splitter always prefers a paragraph break over a mid-sentence cut — the chunk *count* you get is a direct function of corpus size vs `chunk_size` |
| 6 | Top-k decides how many cards land on the model's desk | The top-k mechanism: `k=3` always retrieves the 3 nearest chunks, regardless of how many exist or how relevant the third one actually is | Fan-out: one query box fanning into 3 ranked chunk slots (1st, 2nd, 3rd by distance), each chunk arrowing into one "model reads all of this" box | Every retrieved chunk is text the model must read before answering — retrieval doesn't just find information, it spends budget |
| 7 | k=3 requested, 2 returned — you're already retrieving everything | The saturation case on this corpus: with only 2 chunks total, `k=3` can't filter anything — ChromaDB just hands back both and stops | Two-panel comparison: "k=3 requested" (red dashed outline, 3 empty slots) vs "2 chunks exist" (blue, filled) — only 2 slots actually fill | On a corpus this small, `k` isn't doing retrieval work at all; on a larger corpus a `k` this generous would start diluting more than helping |
| 8 | Distance, not similarity — and lower means closer | The metric identity: ChromaDB's `documents` collection runs on default squared-L2 distance, not cosine similarity — smaller numbers mean "more relevant" | **Scene** — a librarian holding a ruler up to two books on a shelf, measuring the physical gap between them, with a "closer = smaller number" caption | Every "Found N relevant chunks" line in the lab is ChromaDB returning the *smallest*-distance chunks — a distance, not a percentage score |
| 9 | Same ranking here, but only because the vectors sit on the unit circle | Why L2 and cosine agree for `nomic-embed-text`: its embeddings are close to unit-norm, and `‖a-b‖²=2-2·cos(a,b)` when both vectors have norm 1 | Big-box anatomy: a unit circle with two vectors on its rim, the chord between their tips labeled "L2 distance", the angle between them labeled "cosine angle", an equals sign connecting the two labels | This equivalence is specific to unit-norm vectors — swap in an embedding model that doesn't normalize, and L2 starts rewarding vector length, which cosine ignores entirely |
| 10 | The embedder decides what "similar" means — the LLM never gets a vote | Why retrieval quality is entirely the embedding model's job: the LLM never sees the corpus until after retrieval hands it a slice of text | Pipeline: corpus → `nomic-embed-text` (blue, "defines what's similar") → ChromaDB ranking → retrieved chunks → `qwen3.5:2b` (gray, "never sees the rest") | If the embedding model doesn't distinguish "restart" from "backup" in its vector space, no amount of downstream LLM quality fixes a bad retrieval |
| 11 | Two embedding models never share a coordinate system | Why swapping embedding models means a full re-ingest: two different models place the same sentence at different, incomparable coordinates | Two-panel comparison: model A's space (blue vectors, one sentence plotted) vs model B's space (orange vectors, same sentence plotted at an unrelated point) — a crossed-out arrow between the two spaces | Storing embeddings from one model and querying with another doesn't degrade gracefully — it produces meaningless distances, not just worse ones |
| 12 | Four pieces have to fit inside one 4096-token ceiling | The context-budget anatomy: `num_ctx=4096` caps every prompt this app builds — template scaffolding, retrieved context, the question, and headroom for the answer all compete for it | Big-box anatomy: outer box "4096 tokens" with four labeled inner segments (scaffolding, context, question, answer headroom) stacked to fill it | `num_ctx=4096` is the real ceiling, independent of `qwen3.5:2b`'s larger native training context — the app never gets to use more than this |
| 13 | At this lab's scale, the prompt uses under 15% of the ceiling | Working the real arithmetic: `chunk_size=500` × `k=3` ≈ 300–390 tokens of context, ~350–450 tokens total prompt, ~3,650+ tokens of headroom | Numbered rows: template (~20 tok) → context (~300–390 tok) → question (~15–30 tok) → **total ~350–450 tok** → headroom ~3,650–3,700 tok (green) | There's no pressure on this corpus — but raise `k` to 10 on `chunk_size=1500` and context alone hits ~3,750 tokens, crowding out the answer |
| 14 | Ollama keeps the tail and drops the front, verified live | The truncation mechanism: a 33,742-token oversized prompt got cut to `prompt_eval_count=2050` with `keep=4` — a marker at the front was lost, one at the back survived | Staircase: long prompt bar (red) with a "keep=4" tiny sliver at the very start, a large discarded middle section (hatched/crossed-out), and a surviving tail segment (green) labeled "limit=2050" | On this app's prompt shape — context first, question last — an over-budget prompt loses your earliest retrieved chunks first, not the question |
| 15 | Two answers wrong for two different reasons | The retrieval-miss vs generation-miss split: retrieval miss means the wrong chunk was handed to the model; generation miss means the right chunk was handed over and still misused | Two-panel comparison: "retrieval miss" (red, wrong/no chunk retrieved → correct reasoning on bad input) vs "generation miss" (orange, right chunk retrieved → model still answers wrong) | Confusing the two wastes debugging time — check "View Source Chunks" or query ChromaDB directly before touching the prompt or the model |
| 16 | Naive RAG never asks "is the 2nd-best chunk actually better?" | Why naive top-k retrieval makes retrieval misses more likely: there's no re-ranking step between the vector search and the LLM | Pipeline with one broken link: query → vector search → (crossed-out re-ranker box, dashed) → straight to LLM | A semantically-adjacent-but-wrong chunk can outrank the truly relevant one, and naive RAG has no second look to catch it — that gap is what M6 adds back |
| 17 | ChromaDB's own API confirms the metric, not a guess | The direct-Chroma observation: querying `/api/v1/collections` shows `hnsw_configuration.space: "l2"` and `dimension: 768` straight from the running collection | Numbered rows: `curl .../collections` → highlighted JSON fields `"space": "l2"` and `"dimension": 768` → arrow to "confirms §3's claim, not assumed" | No override was ever set in `app/main.py` — the collection came up on ChromaDB's default, and the API says so directly, not inferred from docs |
| 18 | 0.6956 and 1.0968 — the numbers behind "Found 2 relevant chunks" | The raw distances behind the ranking: querying the payments question directly returns two real L2 distances, lower ranked first, and the collection has no third chunk to return | Numbered rows: query "How do I restart the payments service?" → chunk 1 (blue, `dist 0.6956`) → chunk 2 (blue, `dist 1.0968`) → caption "only 2 print — k=3 requested, 2 chunks exist" | The Streamlit UI never shows you this number — only the resulting text — but this is exactly what ChromaDB's index ranks on to decide what the LLM sees |
| 19 | Three sentences, three vectors, norm 1.000000 every time | Verifying the L2≈cosine claim isn't assumed — three arbitrary sentences through this app's exact `OllamaEmbeddings` code path all measure at L2 norm ≈ 1.000000 | Numbered rows: 3 sentence boxes each arrowing to a "L2norm=1.000000" result (green), one flagged "1.000001 — float rounding, not a real deviation" | This confirms the unit-norm claim through the app's *exact* code path, not a general Ollama guarantee — measured, not assumed |
| 20 | Same corpus, three chunk sizes, three different stories | The 3-variant experiment's real results: baseline (2 chunks) sits in the middle, variant-a (11 chunks) wins on precision, variant-b (1 chunk) loses on every question | Three-column comparison: baseline (blue, "2 chunks · dist 0.6956") · variant-a (green, "11 chunks · dist 0.5146 — best") · variant-b (red, "1 chunk · dist 0.75–1.08 — worst") | variant-a's tiny chunks isolate the exact restart command with nothing diluting the vector; variant-b collapses the whole corpus into one chunk every question retrieves |
| 21 | On a corpus this small, even the worst chunking still works (closing) | The honest caveat + hand-off: small-corpus-masks-dilution — all three variants still answered correctly here, but variant-b's failure mode would bite on a larger corpus; five real-work takeaways | numbered rows (circles 1–5) — the course's takeaway idiom | variant-b's one-chunk-fits-all only looks harmless because this corpus is 823 bytes — the same collapse on a real corpus returns topically wrong chunks, not just imprecise ones; credit + hand-off |

<!-- Visual pattern vocabulary used: title theme-boxes · scene (2, 3, 8) · pipeline/mapping diagram
     (4, 10, 16) · numbered rows (5, 13, 17, 18, 19, 21) · fan-out (6) · two-panel comparison
     (7, 11, 15) · big-box anatomy (9, 12) · staircase (14) · three-column comparison (20). -->

## Recommended presentation order

Present strictly 1 → 21; the deck is one continuous build from "why chunk size trades completeness
for precision" through "the real experiment's honest caveat." Open on slide 1 to name the four
themes. **Slides 2–3 are the conceptual hinge for chunking** — the too-small/too-large index-card
pair has to land before slide 4's overlap mechanism and slide 5's concrete "this corpus made 2
chunks" grounding make sense; give the pair the same unhurried beat M3 gave its hotel-floor scene.
Slides 6–7 are a fast pair — top-k mechanism, then the saturation case where k=3 can't filter a
2-chunk corpus; land the punchline that k isn't doing retrieval work here. Slide 8's librarian-ruler
scene is the second hinge — pause on "lower is better," it inverts the intuition of most similarity
scores students have seen elsewhere. Slide 9 is dense math (`‖a-b‖²=2-2cos`) — read the equation
once, then move straight to its consequence in slide 10 (embedder defines retrieval) and slide 11
(no cross-model comparability) without lingering on the algebra itself. Slides 12–14 are the
context-budget triplet and **slide 14 (the verified truncation mechanism) is the single most
load-bearing slide in the deck** — it's real captured evidence (`keep=4`, `limit=2050`,
`prompt=33742`), not a theoretical claim, and it directly contradicts the intuitive assumption that
truncation just chops off the end; do not compress it. Slide 15 (retrieval miss vs generation miss)
is a quick, clean framing pivot. Slide 16 is a short connective beat naming the gap M6 fills — quick,
then move. Slides 17–19 are the raw-evidence triplet (direct Chroma API, the real distances, the
measured norm) — these are the page's "confirmed, not assumed" backbone; keep the exact numbers on
screen, they're the point. Slide 20 is the deck's other must-not-compress slide: the three-column
real-results comparison is the experiment's payoff and needs its own beat before slide 21's honesty
caveat lands. Under time pressure, compress 6–7 and 16 into single passes — never compress 2–3, 8,
14, 17–19, or 20; those carry the deep dive's actual measured evidence.

## Fragment map

No slide in this deck uses fragments. Every slide here is a comparison, scene, anatomy box, mapping
diagram, or numbered-row sequence — all patterns that read better whole per style-guide §6 (only
hop-by-hop causal diagrams warrant fragments, and this deep dive has no single-iteration mechanism
like M3's scheduler slide that benefits from a staged reveal — even slide 14's staircase is a static
picture of one already-completed truncation event, not a process to walk through step by step).

Static slides (1–21, all): scenes, pipelines, anatomy boxes, comparisons, and numbered rows all show
the full picture at once.

## Coverage check (HARD GATE — §0)

Every deep-dive.md section maps to at least one slide.

| Deep-dive section / concept | Slide(s) | Notes (analogy used, echoes/forward pointers) |
|---|---|---|
| Opening framing — the lab's unexplained knobs (`chunk_size`, `k`, `nomic-embed-text`) | 1 | Title theme boxes name the four arcs (chunking, top-k, metric, budget). 2026-07-25: the four real values (`chunk_size=500`, `k=3`, `nomic-embed-text`, `num_ctx=4096`) moved from the old paragraph subtitle into SVG labels under each theme box; the subtitle is now one line |
| §1 — chunking too small: fact and command split across cards | 2 | Scene: index card pair, illustration-author scene |
| §1 — chunking too large: several procedures blur into one averaged embedding | 3 | Scene: one crammed index card, illustration-author scene |
| §1 — overlap mechanism: last N chars of chunk 1 repeated at start of chunk 2 | 4 | Pipeline diagram with highlighted overlap band |
| §1 — `RecursiveCharacterTextSplitter` separator cascade; this corpus's real 2-chunk count | 5 | Numbered-row arrow chain to the real ingest count |
| §2 — top-k mechanism: always retrieves k nearest, competes for budget and attention | 6 | Fan-out: query → 3 ranked slots → model |
| §2 — k=3 on a 2-chunk corpus retrieves everything indexed, not filtering at all | 7 | Two-panel: 3 requested vs 2 that exist |
| §3 — ChromaDB default index is squared L2 distance, not cosine; lower = more relevant | 8 | Scene: librarian with a ruler, illustration-author scene |
| §3 — L2≈cosine equivalence for unit-norm vectors, `‖a-b‖²=2-2cos(a,b)` | 9 | Anatomy: unit circle with chord (L2) and angle (cosine) labeled |
| §3 — the embedder, not the LLM, defines retrieval quality | 10 | Pipeline: embedder decides similarity, LLM never sees the rest |
| §3 — embedding models are not comparable; swapping requires full re-ingest | 11 | Two-panel: two incomparable coordinate spaces |
| §4 — context-window anatomy: `num_ctx=4096` caps scaffolding + context + question + answer | 12 | Anatomy: four segments filling one 4096-token box |
| §4 — worked arithmetic for this lab's real numbers (~350–450 tokens used, ~3,650+ headroom) | 13 | Numbered rows with the page's actual token estimates |
| §4 — verified truncation mechanism: `keep=4`, `limit=2050`, front dropped / tail survives | 14 | Staircase: kept prefix, discarded middle, surviving tail — real captured log line |
| §5 — retrieval miss vs. generation miss as two structurally different failure causes | 15 | Two-panel: wrong-input-correct-reasoning vs right-input-wrong-reasoning |
| §5 — naive RAG has no re-ranking step; semantically-adjacent-but-wrong chunks can outrank the real answer | 16 | Pipeline with a crossed-out re-ranker stage, forward-pointer to M6 |
| §6 — direct-Chroma observation: `/api/v1/collections` confirms `space: "l2"`, `dimension: 768` | 17 | Numbered rows: curl → highlighted JSON fields → "confirmed, not assumed" |
| §6 — raw distances behind the ranking: `0.6956` and `1.0968`, only 2 print because only 2 chunks exist | 18 | Numbered rows with the page's real measured distances |
| §6 — embedding norm verification: `L2norm=1.000000` across three sentences via the app's exact code path | 19 | Numbered rows with the page's real measured norms |
| §7 — 3-variant re-ingest experiment: baseline (2 chunks), variant-a (11 chunks), variant-b (1 chunk) | 20 | Three-column comparison with the page's real chunk counts and distances |
| §7 — real results: variant-a best (0.5146), baseline middle (0.6956), variant-b worst (0.75–1.08) | 20 | Same slide, the three measured distance ranges labeled directly |
| §7 — honesty: small-corpus-masks-dilution, all three variants still answered correctly here | 21 | Closing slide states the caveat explicitly before the takeaways. 2026-07-25: the caveat row now names the corpus size directly ("this one is 823 bytes") for concreteness |
| "Where you will use this" — 5 real-work triggers | 21 | Closing numbered rows, one per trigger |

**No orphans.** Every deep-dive.md section (§1–§7, the opening framing paragraph, and the closing
"Where you will use this") has at least one slide anchor. The `:::note` guarded re-ingest snippet in
§6 and the `docker exec`/`docker cp` mechanics throughout §6–§7 are deliberately not slides — they
are terminal-output/console detail that belongs in the lab prose, not a concept slide (the concept
deck teaches concepts, never terminal output, per the style guide); the underlying concepts those
commands demonstrate (direct API inspection, live re-ingest under a new collection name) are still
covered by slides 17–20.
