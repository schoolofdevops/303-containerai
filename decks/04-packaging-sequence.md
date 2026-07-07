# Module 4 · Explainer Deck Sequence — Packaging Models as OCI Artifacts

**Deck:** `decks/04-packaging.html` (reveal.js, self-contained, B&W hand-drawn style)
**Module:** M4 · Day 1 · *Containers for GenAI & Agentic AI — The Open-Source Way* · Gourav Shah
**Source:** `site/docs/m4-packaging/lesson.md` (+ `lab.md`)

This deck walks a learner through *why* a model belongs in an OCI registry and *how* KitOps ModelKit
packs, ships, and selectively pulls it — before they touch the hands-on lab. It leans on the lesson's
two anchor analogies (the **sealed labelled crate + shipping manifest** and the **warehouse shelved by
chapter**) and turns them into visuals.

## Slide table

| # | Title | Concept | Analogy / visual device |
|---|---|---|---|
| 1 | Packaging Models as OCI Artifacts | Title / framing | Labelled crate with 4 inner sections + manifest tag |
| 2 | What you'll learn | Objectives | Four numbered objective rows |
| 3 | The problem with loose model files | Motivating problem | Scattered sources → confused receiver → version drift |
| 4 | A ModelKit is a sealed, labelled crate | ModelKit anatomy | Crate with Kitfile tag + model/code/config/prompts sections |
| 5 | An OCI artifact is a layered blob store | OCI = layers + manifest | Container-image stack beside a ModelKit stack, same spec |
| 6 | KitOps, ModelKit & ORAS | The CNCF stack | Three-layer stack (kit → ORAS → OCI API) feeding registries |
| 7 | The Kitfile — your shipping manifest | Kitfile → typed layers | YAML fields mapping by arrows to OCI layers |
| 8 | The lifecycle: pack → push → pull → run | End-to-end flow | Workspace → registry drum → serving node → runtime |
| 9 | Selective pull — grab only what you need | `--filter` payoff | Warehouse-by-chapter: 3 consumers pull different layers |
| 10 | One artifact, every registry | Multi-registry portability | ModelKit radiating to 6 registries, same syntax |
| 11 | ModelKit / ORAS vs docker model package | Comparison | Two-column table across 5 rows |
| 12 | Ship your model like an image | Closing + lab lead-in | Crate → registry drum → serving node |

**Total: 12 slides.**

## Recommended presentation order

Present in file order (1 → 12) — the narrative is deliberately linear:

1. **Frame the destination** (1–2): show the sealed crate up front so the mental model is set, then
   state the four things they'll be able to do.
2. **Earn the solution** (3): dwell on the pain of loose files. Do NOT rush this — the crate metaphor
   only lands if the mess is felt first. End on "logistics teams solved this decades ago."
3. **Reveal the crate, then its machinery** (4–7): ModelKit as the crate (4) → why OCI layers make it
   possible (5) → the tool stack that does it (6) → the Kitfile that drives it (7). This is the
   conceptual core; slow down on 4 and 5.
4. **Show it move** (8–10): the pack→push→pull→run lifecycle (8), the selective-pull payoff that plain
   images can't match (9), and portability across registries (10).
5. **Position the choice** (11): KitOps vs `docker model package` — the "why CNCF" moment.
6. **Launch the lab** (12): reiterate the concrete lab task so hands hit keyboards with intent.

If short on time, slides 5 and 10 are the safest to summarize verbally; 3, 4, 8, 9 are the load-bearing
concept slides and should not be cut.

## Gemini image-generation briefs

Optional photoreal / illustrated alternatives for hero concepts, if a richer visual is wanted beside the
SVG sketches. Keep any generated art black-and-white to match the deck.

**Brief A — the sealed labelled crate (Slide 4).**
A black-and-white, hand-drawn ink-sketch illustration in the style of a technical whiteboard drawing:
a single sturdy shipping crate viewed from the front, its lid sealed, with a paper shipping-manifest tag
tied to the top by string. The crate's interior is shown cutaway into four labelled compartments —
"weights", "adapter", "config", "prompts" — each holding a small distinct object (a heavy block, a
folded card, a dial, a scroll). Clean thin black strokes on pure white, no shading fills, no colour,
uncluttered, plenty of white space. Evokes "one sealed bundle where the contents match the manifest."

**Brief B — the warehouse shelved by chapter (Slide 9).**
A black-and-white hand-drawn line illustration: the interior of a tidy warehouse where shelving bays are
labelled not by whole books but by individual chapters ("ch.1", "ch.2", "ch.3"). A single courier stands
at a service window handing over just one small box labelled "chapter 3", while the rest of the volume
stays untouched on the shelves. A catalogue card sits on the counter. Thin confident black ink lines on
white, sketchy whiteboard feel, no colour, no heavy fills, airy composition. Evokes selective pull —
requesting exactly one layer, not the whole artifact.

**Brief C — pack → push → pull lifecycle (Slide 8).**
A black-and-white hand-drawn diagram-illustration: on the left a workbench where a crate is being nailed
shut (labelled "pack"); an arrow to a central cylindrical registry drum stencilled with a version tag; a
further arrow to a remote serving rack on the right where the same crate is being pried open and its
weights slotted into a running machine (labelled "run"). Simple, sketchy black outlines on white, no
colour, generous spacing, four clear stages left to right. Evokes a model moving from workspace to
registry to serving node.

## Coverage check — every lesson concept mapped to a slide

| Lesson section / concept | Slide(s) |
|---|---|
| §1 Problem with loose model files (drift, manual re-assembly) | 3 |
| §1 Shipping manifest + labelled crate analogy | 3 (setup), 4 (payoff) |
| ModelKit = sealed, signed, versioned bundle | 4 |
| Bundle contents: weights + adapter (M3B) + config + prompts | 1, 4 |
| §2 OCI artifact = layered blob store with a manifest | 5 |
| §2 Container-image layers ↔ ModelKit equivalents table | 5 |
| §2 Registry dedup — only changed layer pushed | 5 |
| §3 KitOps / ModelKit / `kit` CLI | 6 |
| §3 ORAS = OCI Registry As Storage | 6 |
| §3 Works on GHCR / Docker Hub / Quay / Harbor / registry:2 | 6, 10 |
| §4 Kitfile YAML; fields → typed layers; `kit pack` → local cache | 7 |
| §5 Full flow Kitfile → registry → serving/training node | 8 |
| §8 OCI as distribution, not execution (never "run") | 8 |
| §6 Selective pull `--filter=model/code/datasets`; warehouse-by-chapter | 9 |
| §6 Use cases: serving node / notebook / CI pipeline | 9 |
| §7 Multi-registry portability; same push/unpack syntax; `--plain-http` | 10 |
| §3 + §8 KitOps vs `docker model package` comparison; vs plain image | 11 |
| Lab lead-in: pack SmolLM2 + prompts, push, pull clean, selective-pull | 2, 12 |

All lesson sections are represented. §8 (ModelKit vs plain container image) is folded into slides 5
(layer mechanism) and 11 (comparison framing) rather than given a standalone slide, keeping the deck at a
tight 12.
