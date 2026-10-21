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

This companion doc maps the 22-slide explainer deck (`site/static/decks/04-packaging.html`) to the
Module 4 lesson (`site/docs/m4-packaging/lesson.md`). The deck teaches **concepts**, not commands —
it turns the lesson's shipping-manifest and book-warehouse analogies into hand-drawn whiteboard
visuals a learner walks through before opening the lab. The visual language follows the CourseSmith
whiteboard style contract (`templates/deck/whiteboard-style-guide.md`): Patrick Hand cursive,
`#1e1e1e` primary / `#757575` secondary strokes on white paper with the five semantic pastel fills
(§1: green good · red bad/full · blue data · orange caution · purple meta — this deck uses the
neutral ink/gray palette throughout, no pastel fills in the original slides), the `#rough` wobble
filter on boxes and curves only, and the shared `#ah`/`#ahg` arrowhead markers. The arc moves — **the chaos of
loose model files (Slack links, README hints, drifting versions) → why OCI's layered-blob-store
mechanism is the right fix → the CNCF stack that implements it (KitOps + kit CLI + ORAS) and the
ModelKit's sealed, typed-layer crate → the Kitfile manifest that drives it → the full
pack→push→pull→run lifecycle → the selective-pull payoff → multi-registry portability → how it
compares to a simpler/alternative packaging approach → hand-off to the lab.**

## Slide table

| # | Slide | Purpose | Visual | Takeaway |
|---|-------|---------|--------|----------|
| 1 | Packaging Models as OCI Artifacts (title) | Module framing: a model ships the way a container image ships — versioned, layered, sealed into one artifact | Title sketch: a labelled crate (Kitfile manifest tag on top) holding four typed compartments — model, code, datasets, docs | credit line: Gourav Shah · School of DevOps & AI · KitOps · ModelKit · ORAS |
| 2 | What you'll learn | Set the four learning objectives: why OCI fits models, packing a Kitfile/ModelKit, multi-registry push/pull, selective pull + KitOps-vs-docker contrast | numbered rows (circles 1–4) | By the end you'll treat a model the way you treat an image: tagged, stored, and shipped |
| 3 | **Divider 1 · The problem with loose model files** | Opens lesson §1 | — (divider) | — |
| 4 | The problem with loose model files | The motivating problem: weights on a shared drive, prompt in Slack, config in a README note — every receiver re-assembles by hand and versions drift | fan-out: three scattered dashed source boxes feeding a confused "Receiver" box that re-assembles manually, arrow out to consequences | Logistics teams solved this decades ago with a shipping manifest and a sealed, labelled crate |
| 5 | **Divider 2 · What is an OCI artifact (and why models fit perfectly)** | Opens lesson §2 | — (divider) | — |
| 6 | An OCI artifact is a layered blob store | Why models fit OCI: the same mechanism that stores container image layers stores any typed byte stream, including model checkpoints | two-panel comparison: container image layer stack vs ModelKit layer stack, "same spec" arrow between them | A layer is just bytes + a digest — registries dedupe, so retraining only the prompt pushes just the config layer |
| 7 | Unchanged layers are stored once | Lesson §2 dedup: two versions of a ModelKit share identical layers, so retraining only the config pushes only the config layer | two stacks (my-model:v1, my-model:v2) of three layers; grey lines between identical layers labelled "same digest, stored once"; a dashed ink line on the changed config layer labelled "new digest" | Registries store a layer once; only the changed layer is pushed again |
| 8 | **Divider 3 · KitOps and ModelKit (CNCF + ORAS)** | Opens lesson §3 | — (divider) | — |
| 9 | A ModelKit is a sealed, labelled crate | The typed-layer anatomy: one signed bundle with four layer types (model, code, datasets, docs) — open it and the contents are exactly what the manifest says | big-box anatomy: outer crate + Kitfile manifest tag on top + four typed layers (model, code, datasets, docs) | Model, code, datasets and docs, versioned together — the manifest names every item |
| 10 | KitOps, ModelKit & ORAS | Name the CNCF stack: the `kit` CLI on top, ORAS underneath, the OCI distribution API at the base that every registry speaks | big-box anatomy: three stacked layer boxes (kit CLI → ORAS → OCI distribution API) fanning out to registry names (GHCR, Docker Hub, Quay, Harbor, registry:2, any OCI registry) | Because it's plain OCI underneath, the same commands work on every compliant registry |
| 11 | **Divider 4 · The Kitfile: your shipping manifest** | Opens lesson §4 | — (divider) | — |
| 12 | The Kitfile is your shipping manifest | Show the manifest mechanics: a tiny YAML file whose fields each map to one typed OCI layer | two-panel: Kitfile YAML fields on the left, arrows mapping each field to a typed OCI layer box on the right | `kit pack` reads the Kitfile, hashes each file into a layer, and stores it in the local kit cache |
| 13 | **Divider 5 · The full flow: Kitfile → registry → serving node** | Opens lesson §5 | — (divider) | — |
| 14 | The lifecycle: pack → push → pull → run | Walk the full path from a workspace to a serving node, with the registry as the hub in the middle, and clarify OCI ships the crate but doesn't run it | pipeline: workspace → (push) → registry hub (drum) → (pull) → serving node → runtime, left to right | OCI is the distribution mechanism here, not the execution mechanism — the crate ships; a separate runtime opens it |
| 15 | **Divider 6 · Selective pull: the KitOps payoff** | Opens lesson §6 | — (divider) | — |
| 16 | Selective pull grabs only what you need | The KitOps payoff: typed layers let a consumer pull just the layer it needs instead of the whole bundle | fan-out: one ModelKit's three layers (model/code/datasets) filtered out to three different consumers (serving node, CI pipeline, notebook) | The typed-layer manifest is the catalogue — each consumer pulls its box, not the whole book |
| 17 | **Divider 7 · Multi-registry portability** | Opens lesson §7 | — (divider) | — |
| 18 | One artifact, every registry | Multi-registry portability: the same `kit push`/`unpack` syntax targets any OCI-compliant registry, only the reference changes | hub-and-spoke: one ModelKit in the centre radiating out to six registries (GHCR, Docker Hub, Quay, Harbor, any other OCI registry, local registry:2) | TLS by default; add `--plain-http` for local or air-gapped HTTP-only registries |
| 19 | **Divider 8 · ModelKit vs a plain container image** | Opens lesson §8 | — (divider) | — |
| 20 | COPY model.gguf: four problems | Lesson §8 body: why a plain image is a poor container for a model | 2x2 grid of four boxes each with an X mark: cannot skip layers, no layer types, built to run not to ship, dedup by accident | A plain image holds bytes with no meaning attached; a ModelKit makes layers typed and explicit |
| 21 | ModelKit / ORAS vs docker model package | Compare the two OCI-model-packing paths side by side. Both run on Desktop and CE, so the contrast is scope and governance, not licence or platform: CNCF-governed ModelPack spec vs Docker-defined media types | two-panel comparison table: KitOps ModelKit vs docker model package across five rows | Want portability across registries and runtimes — including Flux into Kubernetes or air-gapped Harbor? Take the CNCF path |
| 22 | Ship your model like an image (closing) | Hand off to the lab: pack SmolLM2 + prompts, push to a registry, pull on a clean dir, then selective-pull the weights | pipeline: sealed ModelKit crate → registry (drum) → serving node | credit + lab hand-off: Next — Lab: Pack & Push a ModelKit with KitOps · Gourav Shah · School of DevOps & AI |

<!-- Visual pattern vocabulary used: title scene (1) · numbered rows (2) · divider (3,5,8,11,13,15,17,19) ·
     fan-out (4, 16) · two-panel comparison (6, 7, 12, 21) · big-box anatomy (9, 10) · 2x2 grid (20) ·
     pipeline (14, 22) · hub-and-spoke (18). -->

## Recommended presentation order

Present strictly 1 → 22; each divider hands off cleanly to its section's content slide(s), and each
slide's vocabulary is used by the next. Open on slide 1 to set the crate framing, then move briskly
through 2 (the roadmap) into divider 3 and the motivating problem on slide 4 — the scattered-files
picture is intuitive, don't over-explain it. Divider 5 → slides 6 and 7 answer "why OCI, mechanically"
and "why versions are cheap" in two beats. **Divider 8's pair (slides 9–10) is the conceptual hinge**:
once the learner sees the ModelKit as a labelled crate with four typed layers (slide 9) and the CNCF
stack underneath it (slide 10), slide 12 (the Kitfile, after divider 11) is just filling in *how* that
crate is actually built — keep momentum across that run. Divider 13 → slide 14 (the full lifecycle) is
the second hinge — pause on the closing line that OCI ships the crate but a separate runtime opens it;
this is the single most commonly confused point in the module. Dividers 15 and 17 → slides 16 and 18
are the fast payoff pair (selective pull, then multi-registry) — present them briskly back to back.
Divider 19 → slides 20 and 21 are the plain-image problems and then the `docker model package`
comparison, before hand-off. Under time pressure, compress 16/18/21 to a single pass each — never
compress 9–10 or 14.

## Fragment map

This deck has no hop-by-hop build-ups — every content slide is a static anatomy, comparison,
fan-out, pipeline, or hub-and-spoke diagram that reads better whole; every divider is a static
title-only break. No fragments are used.

Static slides (all 22) show the full picture at once.

## Coverage check (HARD GATE — §0)

Every lesson section/concept maps to a slide, and every lesson `##` section has its own divider.
Updated 2026-10-21 (deck pass): the deck grew 20 → 22 slides, adding the §2 dedup slide (7) and the
§8 plain-image slide (20). Slide numbers below are the 22-slide numbering.

| Lesson section / concept | Slide(s) | Notes (analogy used, echoes/forward pointers) |
|---|---|---|
| Module roadmap ("what you'll learn") | 2 | Numbered rows, four objectives — no divider (not a lesson `##` section) |
| §1 — the problem with loose model files: scattered weights/prompts/config, version drift | 3 (divider), 4 | Fan-out: three dashed scattered sources feeding a confused Receiver box |
| §1 — the shipping-manifest + labelled-crate analogy | 1, 3, 4 | Title scene sets the crate framing early |
| §2 — an OCI artifact is a layered blob store with a manifest; why models fit | 5 (divider), 6 | Two-panel: container image layers vs ModelKit layers, "same spec" |
| §2 — layer dedup across versions (retrain config, only the config layer pushed) | 7 | Two version stacks sharing identical layers; only the config layer has a new digest |
| §3 — KitOps defines ModelKit + `kit` CLI; typed layers (model/code/datasets/docs) | 8 (divider), 9, 10 | Slide 9 shows the four typed layers; slide 10 names the CNCF stack |
| §3 — ORAS underneath, same OCI distribution API every registry speaks | 10 | Big-box anatomy: kit CLI → ORAS → OCI distribution API |
| §3 — KitOps vs `docker model package`: scope and governance (ModelPack spec vs Docker-defined media types; `kit` on any OS vs `docker model` on Desktop and CE) | 21 | Two-panel comparison, five rows; positioned under the §8 divider, after the plain-image slide |
| §4 — the Kitfile: YAML manifest, fields map to typed OCI layers | 11 (divider), 12 | Two-panel: YAML fields → arrows → typed layer boxes |
| §5 — full flow: Kitfile → kit pack → registry → destination nodes | 13 (divider), 14 | Pipeline: workspace → push → registry hub → pull → serving node → runtime |
| §6 — selective pull: `--filter=model/code/datasets`, the book-warehouse-by-chapter analogy | 15 (divider), 16 | Fan-out: one ModelKit's layers filtered to three different consumers |
| §7 — multi-registry portability: same `kit push`/`unpack` syntax, `--plain-http` for local/air-gapped | 17 (divider), 18 | Hub-and-spoke: one ModelKit radiating to six registry boxes (the sixth reads "any OCI registry") |
| §8 — ModelKit vs a plain container image: the four `COPY model.gguf` problems | 19 (divider), 20 | 2x2 grid with an X on each: cannot skip layers, no layer types, built to run, dedup by accident |
| §8 — OCI is a distribution mechanism, not an execution mechanism; a runtime unpacks and loads it | 14 | Pipeline slide's closing caption |
| Lab hand-off — pack SmolLM2 + prompts, push, pull on clean dir, selective-pull weights | 22 | Pipeline: crate → registry → serving node |

**No orphans.** Every lesson section (§1–§8) has its own divider, in lesson order. The Summary table
at the end of the lesson is a recap of concepts already covered by slides 1–21 and is not a separate
slide anchor; the narration recaps it by voice in Video 6.

## Gate results (2026-08-05 divider regen)

- **Subtitle audit:** all 12 `p.s` subtitles ≤51 chars / ≤9 words. Zero WARN (60–80 chars), zero FAIL (>80 chars).
- **Divider-order check (20-slide numbering; now 03, 05, 08, 11, 13, 15, 17, 19):** dividers appear in document order at pagenos 03, 05, 07, 10, 12, 14, 16, 18
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

<!-- 2026-08-14 narration + rough-filter fix + Magnific illustration pass (this pass):

     NARRATION: `planning/narration/04-narration.md` authored via the `lesson-to-video-narration`
     skill (new file — no narration existed for any module before this pass). 6 videos: talking-head
     intro, 4 explainers walking lesson §1–8 (grouped OCI-fit / KitOps+Kitfile / selective-pull+
     portability / ModelKit-vs-plain-image), talking-head summary+lab-bridge. Measured 5-gram
     retell-overlap against the lesson: 10.0% overall (N=2792 5-grams, 279 overlapping) — at the
     skill's ~10%-per-section target; the overlap is concentrated in verbatim commands, YAML field
     names, and registry-table rows that must stay identical by design (`kit unpack --filter=model`,
     `manifestVersion`/`package`/`model`/`code`, GHCR/Docker Hub/Quay/Harbor targets), not compressed
     prose.

     ROUGH-FILTER BUG FIX: the single `<filter id="rough">` definition used the old default
     `x="-5%" y="-5%" width="110%" height="110%"` (objectBoundingBox region) — under this mode, any
     perfectly horizontal/vertical line or rect has a zero-height or zero-width bounding box, which
     collapses the filter region to nothing and makes the wobble (and the stroke itself) invisible.
     Fixed to `filterUnits="userSpaceOnUse" x="-80" y="-80" width="1300" height="600"`, a fixed
     region in the SVG's own coordinate space that covers every diagram's viewBox in this deck
     regardless of individual figures' bounding boxes.

     MAGNIFIC ILLUSTRATION PASS: 3 pencil-sketch scene images generated (`mcp__magnific__images_generate`,
     style-locked B&W hand-drawn prompt, verified by content before use, white-level corrected via
     `magick -colorspace Gray -level 0%,88%`, saved external at `site/static/img/decks/04-packaging/`,
     zero base64-inlining) and added to 3 of the 8 divider slides — the ones with a genuine narrative/
     analogy beat, not a procedure walkthrough:
       - Divider 1 (M4·03, "The problem with loose model files") — `loose-files-vs-sealed-crate.jpg`,
         a split scene: scattered files/drive on a table vs. the same items sealed in one tagged crate.
       - Divider 4 (M4·10, "The Kitfile: your shipping manifest") — `title-sealing-package.jpg`, two
         hands wrapping and wax-sealing a parcel — the shipping-manifest/signing analogy in one frame.
       - Divider 6 (M4·14, "Selective pull: the KitOps payoff") — `selective-pull-one-book.jpg`, a hand
         pulling one book from a long warehouse shelf row, the rest undisturbed — the lesson's own
         "warehouse stores books by chapter" analogy, drawn literally.
     Dividers 2, 3, 5, 7, 8 were left text-only: §2 (OCI-artifact-mechanism), §3 (KitOps/ORAS naming),
     §5 (Kitfile→registry→node pipeline), §7 (multi-registry table), and §8 (ModelKit vs plain image
     checklist) are procedure/definition/comparison beats, not narrative scenes — no image generated
     for them, consistent with deck-author §5a's "not an AI-photo target" guidance.
     New CSS: `.reveal .slides section.divider.has-image h2.t{ order:2; font-size:1.1em; max-width:76%; }`
     / `section.divider.has-image svg{ order:1; }` (image-on-top, title-below, scoped to `.has-image`
     so the other 5 text-only dividers keep their original large centered title untouched). Autofit
     ceiling bumped for illustrated dividers only: `var mh = sec.classList.contains('has-image') ? 80 : 58;`.
     Title slide (M4·01) and its existing hand-drawn ModelKit-crate SVG diagram were left as-is — that
     diagram already carries real informational content (labelled weights/adapter/config/prompts
     compartments) that a generic photo illustration would have downgraded, not upgraded.

     VERIFY GATE (this pass): zero external refs, 20/20 section tags balanced, DOCTYPE at byte 0,
     `display: 'flex'` present, 3 `has-image` sections rendered headless (title-below layout, wobble
     visible on the surrounding SVG chrome, images load from the local `../img/decks/04-packaging/`
     path with no network request). Not re-run: full `npm run build` (other module forks were
     concurrently editing sibling files under `site/` during this pass; a shared build would not be
     attributable to this deck alone). -->
