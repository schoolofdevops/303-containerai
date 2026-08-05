# Module 4 — Packaging Models as OCI Artifacts · Explainer Deck Sequence

<!-- CourseSmith sequence spec — authored and approved BEFORE the deck HTML is built.
     Convention: whiteboard-style-guide.md §5. One row per slide; every slide needs
     purpose + visual + takeaway. NO slide-count cap (§0): one idea per slide, every
     lesson concept gets a slide — the coverage table below is a hard gate. -->

<!-- 2026-07-26 round-3 skeleton regen (ADDENDUM for original decks, .superpowers/sdd/deck-regen-contract.md):
     this deck was authored pre-coursesmith (04-packaging.html loaded reveal.js 4.6.1 + Patrick Hand
     from CDNs) and had NO sequence spec — this file is the first one, authored from the shipped
     deck as the approved coverage baseline. All 12 old slides carried real hand-drawn SVGs already
     (no text-only defects to fix), so every SVG scene ports verbatim onto the new skeleton with no
     viewBox changes. Content parity: same 12 slides, same order, same pagenos (M4·01–12), same
     facts/numbers. The only structural changes: (1) every `p.takeaway` (10 of them, slides 2–11;
     slides 1 and 12 never had one) was REMOVED from the rendered HTML — none deleted as content,
     all relocated into this spec's Takeaway column below; (2) the four old subtitles that exceeded
     80 chars (slides 3, 5, 9, 12) were cut to one line ≤80 chars — the relocated clauses were
     already present as in-SVG labels/gray captions on those slides (or, for slide 12, folded into
     the credit line's lab hand-off), so no fact was lost; (3) zero external refs — reveal.js 5.2
     runtime + Patrick Hand woff2 are now inlined via the skeleton, killing the old
     cdnjs/fonts.googleapis.com loads. -->

<!-- 2026-08-05 divider regen (this pass, coursesmith deck-author contract): the deck grew from
     12 → 20 slides — 8 numbered section-divider slides were inserted, one per lesson `##` header,
     immediately before that section's first content slide, per style-guide §3a. Numbering:
     dividers are numbered by their position IN THE DECK (deck presentation order), which in this
     module happens to equal lesson document order (§3a's warning about deck-order-vs-lesson-order
     applies when a deck teaches sections out of sequence — this deck now walks §1→§8 straight
     through, so divider numeral == lesson section numeral for all 8).
     REORDER: the old 12-slide skeleton visited content in narrative order (crate-reveal right
     after the problem slide), not strict lesson order — slide "A ModelKit is a sealed, labelled
     crate" (typed model/code/config/prompts compartments) sat right after "The problem with loose
     model files" as a problem→fix pair. Its content (the typed-layer anatomy) matches lesson §3
     (KitOps/ModelKit typed layers), not §1, so it was moved to sit under the §3 divider, after
     the §2 (OCI-artifact-mechanism) slide. This breaks the original problem→fix adjacency by
     design — per the coursesmith contract, lesson-section order wins over narrative pairing, and
     the break is being logged here rather than silently made. The "OCI artifact is a layered blob
     store" slide (old #5, lesson §2) now runs immediately after the §1 divider's content slide and
     before §3, restoring strict lesson order 1→2→3→4→5→6→7→8.
     COMPARISON SLIDE NOTE: "ModelKit / ORAS vs docker model package" (old slide 11) is, by its
     literal facts, lesson §3's comparison table (KitOps ModelKit vs docker model package — the
     exact five rows from the lesson's §3 table). The deck has no dedicated slide for lesson §8's
     distinct facts (COPY model.gguf can't skip layers / no layer types / images-are-meant-to-run
     metadata waste / accidental-vs-designed dedup) — that gap already existed in the 12-slide
     baseline, which folded §8 into this same slide's coverage row. This pass preserves that
     editorial call (no new diagram invented, content parity only) and positions the slide under
     the mandatory §8 divider, since it is the deck's only "ModelKit vs. an alternative packaging
     approach" comparison and is the closest existing visual for the question §8 asks. Flagged
     explicitly here per style-guide §3a's rule that any such call must be a visible spec row, not
     a silent decision.
     SUBTITLES: every `p.s` was rewritten to a ≤10-word / ≤60-char anchoring phrase (old subtitles
     ran 38–80 chars and several were full sentences); no subtitle exceeds 51 chars / 9 words now.
     VOICE + EM DASH: every `h2.t`, `p.s`, and on-slide SVG `<text>` label was run through the
     `gourav-voice` pipeline. Em dashes were stripped from every non-divider title/subtitle/label
     (2 titles, 7 subtitles, 6 SVG labels, 1 credit line rewrote the em dash to a comma/colon) —
     divider titles are the sole exception (verbatim lesson header match), and none of the 8 lesson
     headers contain an em dash, so the deck now has zero em dashes anywhere.
     Pagenos renumbered M4·01–20 sequentially; verified in a headless-Chrome DOM dump. -->

This companion doc maps the 20-slide explainer deck (`site/static/decks/04-packaging.html`) to the
Module 4 lesson (`site/docs/m4-packaging/lesson.md`). The deck teaches **concepts**, not commands —
it turns the lesson's shipping-manifest and book-warehouse analogies into hand-drawn whiteboard
visuals a learner walks through before opening the lab. The visual language follows the CourseSmith
whiteboard style contract (`templates/deck/whiteboard-style-guide.md`): Patrick Hand cursive,
`#1e1e1e` primary / `#757575` secondary strokes on white paper with the five semantic pastel fills
(§1: green good · red bad/full · blue data · orange caution · purple meta — this deck uses the
neutral ink/gray palette throughout, no pastel fills in the original slides), the `#rough` wobble
filter on shapes only, and the shared `#ah`/`#ahg` arrowhead markers. The arc moves — **the chaos of
loose model files (Slack links, README hints, drifting versions) → why OCI's layered-blob-store
mechanism is the right fix → the CNCF stack that implements it (KitOps + kit CLI + ORAS) and the
ModelKit's sealed, typed-layer crate → the Kitfile manifest that drives it → the full
pack→push→pull→run lifecycle → the selective-pull payoff → multi-registry portability → how it
compares to a simpler/alternative packaging approach → hand-off to the lab.**

## Slide table

| # | Slide | Purpose | Visual | Takeaway |
|---|-------|---------|--------|----------|
| 1 | Packaging Models as OCI Artifacts (title) | Module framing: a model ships the way a container image ships — versioned, layered, sealed into one artifact | Title sketch: a labelled crate (Kitfile manifest tag on top) holding four inner sections — weights, adapter, config, prompts | credit line: Gourav Shah · School of DevOps & AI · KitOps · ModelKit · ORAS |
| 2 | What you'll learn | Set the four learning objectives: why OCI fits models, packing a Kitfile/ModelKit, multi-registry push/pull, selective pull + KitOps-vs-docker contrast | numbered rows (circles 1–4) | By the end you'll treat a model the way you treat an image: tagged, stored, and shipped |
| 3 | **Divider 1 · The problem with loose model files** | Opens lesson §1 | — (divider) | — |
| 4 | The problem with loose model files | The motivating problem: weights on a shared drive, prompt in Slack, config in a README note — every receiver re-assembles by hand and versions drift | fan-out: three scattered dashed source boxes feeding a confused "Receiver" box that re-assembles manually, arrow out to consequences | Logistics teams solved this decades ago with a shipping manifest and a sealed, labelled crate |
| 5 | **Divider 2 · What is an OCI artifact (and why models fit perfectly)** | Opens lesson §2 | — (divider) | — |
| 6 | An OCI artifact is a layered blob store | Why models fit OCI: the same mechanism that stores container image layers stores any typed byte stream, including model checkpoints | two-panel comparison: container image layer stack vs ModelKit layer stack, "same spec" arrow between them | A layer is just bytes + a digest — registries dedupe, so retraining only the prompt pushes just the config layer |
| 7 | **Divider 3 · KitOps and ModelKit (CNCF + ORAS)** | Opens lesson §3 | — (divider) | — |
| 8 | A ModelKit is a sealed, labelled crate | The typed-layer anatomy: one signed bundle — open it and the contents are exactly what the manifest says | big-box anatomy: outer crate + Kitfile manifest tag on top + four inner sections (model, code, config, prompts) | Model weights + adapter + config + prompts, versioned together — the manifest names every item |
| 9 | KitOps, ModelKit & ORAS | Name the CNCF stack: the `kit` CLI on top, ORAS underneath, the OCI distribution API at the base that every registry speaks | big-box anatomy: three stacked layer boxes (kit CLI → ORAS → OCI distribution API) fanning out to registry names | Because it's plain OCI underneath, the same commands work on every compliant registry |
| 10 | **Divider 4 · The Kitfile: your shipping manifest** | Opens lesson §4 | — (divider) | — |
| 11 | The Kitfile is your shipping manifest | Show the manifest mechanics: a tiny YAML file whose fields each map to one typed OCI layer | two-panel: Kitfile YAML fields on the left, arrows mapping each field to a typed OCI layer box on the right | `kit pack` reads the Kitfile, hashes each file into a layer, and stores it in the local kit cache |
| 12 | **Divider 5 · The full flow: Kitfile → registry → serving node** | Opens lesson §5 | — (divider) | — |
| 13 | The lifecycle: pack → push → pull → run | Walk the full path from a workspace to a serving node, with the registry as the hub in the middle, and clarify OCI ships the crate but doesn't run it | pipeline: workspace → (push) → registry hub (drum) → (pull) → serving node → runtime, left to right | OCI is the distribution mechanism here, not the execution mechanism — the crate ships; a separate runtime opens it |
| 14 | **Divider 6 · Selective pull: the KitOps payoff** | Opens lesson §6 | — (divider) | — |
| 15 | Selective pull grabs only what you need | The KitOps payoff: typed layers let a consumer pull just the layer it needs instead of the whole bundle | fan-out: one ModelKit's three layers (model/code/datasets) filtered out to three different consumers (serving node, CI pipeline, notebook) | The typed-layer manifest is the catalogue — each consumer pulls its box, not the whole book |
| 16 | **Divider 7 · Multi-registry portability** | Opens lesson §7 | — (divider) | — |
| 17 | One artifact, every registry | Multi-registry portability: the same `kit push`/`unpack` syntax targets any OCI-compliant registry, only the reference changes | hub-and-spoke: one ModelKit in the centre radiating out to six registries (GHCR, Docker Hub, Quay, Harbor, Artifactory, local registry:2) | TLS by default; add `--plain-http` for local or air-gapped HTTP-only registries |
| 18 | **Divider 8 · ModelKit vs a plain container image** | Opens lesson §8 | — (divider) | — |
| 19 | ModelKit / ORAS vs docker model package | Compare the two OCI-model-packing paths side by side: CNCF portability vs Docker-Desktop-tied scope. Deck's closest existing visual for "why not something simpler" — see REORDER note above | two-panel comparison table: KitOps ModelKit vs docker model package across five rows | Want portability across registries and runtimes — including Flux into Kubernetes or air-gapped Harbor? Take the CNCF path |
| 20 | Ship your model like an image (closing) | Hand off to the lab: pack SmolLM2 + prompts, push to a registry, pull on a clean dir, then selective-pull the weights | pipeline: sealed ModelKit crate → registry (drum) → serving node | credit + lab hand-off: Next — Lab: Pack & Push a ModelKit with KitOps · Gourav Shah · School of DevOps & AI |

<!-- Visual pattern vocabulary used: title scene (1) · numbered rows (2) · divider (3,5,7,10,12,14,16,18) ·
     fan-out (4, 15) · two-panel comparison (6, 11, 19) · big-box anatomy (8, 9) ·
     pipeline (13, 20) · hub-and-spoke (17). -->

## Recommended presentation order

Present strictly 1 → 20; each divider hands off cleanly to its section's content slide(s), and each
slide's vocabulary is used by the next. Open on slide 1 to set the crate framing, then move briskly
through 2 (the roadmap) into divider 3 and the motivating problem on slide 4 — the scattered-files
picture is intuitive, don't over-explain it. Divider 5 → slide 6 answers "why OCI, mechanically" in
one beat. **Divider 7's pair (slides 8–9) is the conceptual hinge**: once the learner sees the
ModelKit as a labelled crate with four named compartments (slide 8) and the CNCF stack underneath it
(slide 9), slide 11 (the Kitfile, after divider 10) is just filling in *how* that crate is actually
built — keep momentum across that run. Divider 12 → slide 13 (the full lifecycle) is the second
hinge — pause on the closing line that OCI ships the crate but a separate runtime opens it; this is
the single most commonly confused point in the module. Dividers 14 and 16 → slides 15 and 17 are the
fast payoff pair (selective pull, then multi-registry) — present them briskly back to back, they
reinforce the same "typed layers, one syntax" idea from two angles. Divider 18 → slide 19 is a quick
comparison beat before hand-off. Under time pressure, compress 15/17/19 to a single pass each — never
compress 8–9 or 13.

## Fragment map

This deck has no hop-by-hop build-ups — every content slide is a static anatomy, comparison,
fan-out, pipeline, or hub-and-spoke diagram that reads better whole; every divider is a static
title-only break. No fragments are used.

Static slides (all 20) show the full picture at once.

## Coverage check (HARD GATE — §0)

Every lesson section/concept maps to a slide, and every lesson `##` section has its own divider. No
orphans.

| Lesson section / concept | Slide(s) | Notes (analogy used, echoes/forward pointers) |
|---|---|---|
| Module roadmap ("what you'll learn") | 2 | Numbered rows, four objectives — no divider (not a lesson `##` section) |
| §1 — the problem with loose model files: scattered weights/prompts/config, version drift | 3 (divider), 4 | Fan-out: three dashed scattered sources feeding a confused Receiver box |
| §1 — the shipping-manifest + labelled-crate analogy; ModelKit as the sealed container for ML | 1, 3, 4 | Title scene sets the crate framing early; divider 1 + slide 4 anchor the section itself |
| §2 — an OCI artifact is a layered blob store with a manifest; why models fit | 5 (divider), 6 | Two-panel: container image layers vs ModelKit layers, "same spec" |
| §2 — layer dedup across versions (retrain prompt → only config layer pushed) | 6 | Folded into slide 6's takeaway |
| §3 — KitOps defines ModelKit + `kit` CLI; typed layers (model/code/datasets/docs) | 7 (divider), 8, 9 | Slide 8 shows the typed compartments (moved here from its old position after the §1 problem slide — see REORDER note above); slide 9 names the CNCF stack |
| §3 — ORAS underneath, same OCI distribution API every registry speaks | 9 | Big-box anatomy: kit CLI → ORAS → OCI distribution API |
| §3 — KitOps vs `docker model package` ecosystem-scope contrast | 19 | Two-panel comparison table, five rows — positioned under the §8 divider instead (see COMPARISON SLIDE NOTE above); still the literal source of these facts |
| §4 — the Kitfile: YAML manifest, fields map to typed OCI layers | 10 (divider), 11 | Two-panel: YAML fields → arrows → typed layer boxes |
| §5 — full flow: Kitfile → kit pack → registry → destination nodes | 12 (divider), 13 | Pipeline: workspace → push → registry hub → pull → serving node → runtime |
| §6 — selective pull: `--filter=model/code/datasets`, the book-warehouse-by-chapter analogy | 14 (divider), 15 | Fan-out: one ModelKit's layers filtered to three different consumers |
| §7 — multi-registry portability: same `kit push`/`unpack` syntax, `--plain-http` for local/air-gapped | 16 (divider), 17 | Hub-and-spoke: one ModelKit radiating to six registries |
| §8 — ModelKit vs a plain container image: no selective pull, no semantic layer types, images are meant to run | 18 (divider), 19 | Divider is dedicated and verbatim; slide 19 is the deck's closest existing comparison visual, not a literal match to §8's COPY-model.gguf facts — flagged explicitly, see COMPARISON SLIDE NOTE above (no new diagram invented; content parity preserved from the 12-slide baseline) |
| §8 — OCI is a distribution mechanism, not an execution mechanism; a runtime unpacks and loads it | 13 | Pipeline slide's closing caption |
| Lab hand-off — pack SmolLM2 + prompts, push, pull on clean dir, selective-pull weights | 20 | Pipeline: crate → registry → serving node |

**No orphans.** Every lesson section (§1–§8) has its own divider, in lesson order, with no gaps —
verified against `site/docs/m4-packaging/lesson.md`'s eight `##` headers, verbatim. The roadmap intro
(slide 2, no divider — not a lesson `##` section) and the closing lab hand-off (slide 20) are also
covered. The Summary table at the end of the lesson is a recap of concepts already covered by slides
1–19 and is not a separate slide anchor.

## Gate results (2026-08-05 divider regen)

- **Subtitle audit:** all 12 `p.s` subtitles ≤51 chars / ≤9 words. Zero WARN (60–80 chars), zero FAIL (>80 chars).
- **Divider-order check:** dividers appear in document order at pagenos 03, 05, 07, 10, 12, 14, 16, 18
  numbered 1–8 sequentially, no gaps, no out-of-order numerals.
- **Divider-verbatim check:** all 8 divider titles match `lesson.md`'s `##` headers character-for-character.
- **Em-dash check:** `grep -o '<h2 class="t"[^>]*>[^<]*—[^<]*</h2>'` and the equivalent for `<p class="s">`
  both return zero matches across the whole deck (dividers included — none of the 8 lesson headers
  contain an em dash either).
- **Zero external refs / tag balance:** both clean (`grep -nE 'src="http|href="http|url\(http|@import|<link|<img '`
  → empty; Python `HTMLParser` tag-balance walk → balanced).
- **Section count:** 20 HTML `<section>` elements == 20 spec table rows (12 original + 8 dividers).
- **Headless Chrome:** `--headless --disable-gpu --dump-dom` on the absolute `file://` path exits 0;
  all 20 `.pageno` values (`M4·01`–`M4·20`) present and sequential in the rendered DOM.
- **Kicker check:** `.kicker` present only on slide 1 (title) and slide 20 (closing); zero content or
  divider slides carry it.
