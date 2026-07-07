# Introduction Deck — Slide Sequence

Companion to `decks/00-introduction.html` — the course-overview explainer deck for
**Containers for GenAI & Agentic AI — The Open-Source Way** (Gourav Shah · School of DevOps & AI).

The deck is a self-contained reveal.js HTML file. Each slide is a hand-drawn black-and-white
whiteboard diagram (SVG) with a title and a one-line takeaway. It walks a learner from *why this
course exists* → *what they'll build* → *the constraints that shape it* → *how to start* — before
Module 1.

**How to use it:** open the `.html` in any browser. Arrow keys / space to advance, `F` for
fullscreen, `S` for speaker notes, `E` then browser Print to export a PDF. Fully editable — text and
diagrams are plain HTML/SVG in the file.

## Slide-by-slide sequence

| # | Slide | Concept covered | Source | Visual pattern |
|---|-------|-----------------|--------|----------------|
| 1 | **Title** | Course identity, trainer, format | outline header | Definition + shipping-container icon |
| 2 | **One real system** | Build one step per module | "One use case, decomposed" | Staircase rising to a platform |
| 3 | **Container-native, not Docker-native** | The big pivot off paid Docker Desktop | "The Big Pivot" | Comparison: dashed (old) → solid (open) |
| 4 | **What you'll be able to do** | 5 learning objectives | Objectives | Numbered rows |
| 5 | **Two connected use cases** | Docs Assistant + Support Agent/Crew | "Two Connected Use Cases" | Two panels, arrow "used as a tool" |
| 6 | **Intelligence progression** | Naive RAG → Agentic RAG → agent → crew | build ladder / patterns | Linear flow |
| 7 | **The build ladder** | M1–M8 + Capstone, one rung each | "The build ladder" table | Two-column rung stack |
| 8 | **The one constraint** | Apple-Silicon GPU / native-server pattern | "The One Constraint" | Host boundary: native server vs container |
| 9 | **The OpenAI-compatible endpoint** | One contract, swappable engines | M2 concept | Wall-socket analogy |
| 10 | **Runs on a 16 GB laptop** | Resource budget & tactics | "Resource Budget" | Budget bar + 3 tactic boxes |
| 11 | **Open-source tool map** | One tool per job | "Open-Source Tool Map" | Two-column reference table |
| 12 | **Write the stack, don't paste it** | One growing compose.yaml | design principle #4 | File anatomy, block per module |
| 13 | **Program at a glance** | Day 1 / Day 2 split | "Program at a Glance" | Two panels |
| 14 | **What to bring** | Knowledge + system prerequisites | Prerequisites | Two-column checklist |
| 15 | **Build it once, run it anywhere** | Closing big idea + start CTA | intro.md close | Big-idea + container-to-shipped |

## Recommended presentation order

The order is deliberate. Slides 1–3 establish *why* (identity, the step-by-step promise, and the
open-source pivot that names the whole edition). Slide 4 states outcomes. Slides 5–7 are the *what* —
the two use cases, the intelligence progression they follow, and the module ladder that delivers them.
Slides 8–9 are the two hard technical truths every later lab depends on (the GPU constraint and the
single endpoint contract) — teach these before any lab. Slides 10–12 are the *how it stays sane*
(budget, tooling, the hand-authored compose file). Slides 13–14 are logistics. Slide 15 lands the one
sentence to remember. If you're tight on time, 8 and 9 are the two slides you cannot skip.

## Optional Gemini image briefs

Three concepts where a photographic/painterly image would land harder than a sketch. Drop them in as
full-bleed backgrounds or lead-ins; do not overwrite the diagram — pair them.

**Image A — Opening hero (insert before slide 1 as a background).**
A wide cinematic photograph of a single weathered steel shipping container sitting alone on a clean
concrete dock at soft dawn light, one side catching warm sun, faint morning haze behind it. The
container is unbranded — no logos, no text. Shallow depth of field, the horizon slightly blurred. Mood:
calm, purposeful, "ready to ship anywhere." Photorealistic, muted cool-warm palette, 16:9. No text
overlays, no people, no brand names.

**Image B — The GPU constraint made physical (insert alongside slide 8).**
An isometric illustration, clean flat-shaded style like a modern children's science textbook: a laptop
drawn in cutaway, with a glowing engine block labelled only by shape sitting *outside and beside* the
machine on the desk (the "native model server"), connected by a single tidy cable to a stack of small
labelled crates *inside* a dashed boundary (the "containers"). Warm desk lamp lighting, soft shadows.
The point of the image is spatial separation: the powerful engine sits next to the machine, not inside
the crates. 4:3. No dense text, no brand logos.

**Image C — One growing file (insert alongside slide 12).**
A warm overhead photograph of a wooden workshop bench where a single long blueprint scroll is being
extended block by block — five neat stacked paper cards laid in a vertical column on the scroll, a hand
just placing the fifth card, pencil and ruler beside it. Natural window light, shallow focus on the
newest card. Metaphor: the compose file authored by hand, one service at a time. Photorealistic, 16:9.
No readable text on the cards, no faces, no brand names.

Generate these separately if wanted — this doc only specifies them.

## Coverage check vs course intro content

Every concept from `containers_genai_agentic.md` (header → Objectives → Prerequisites → Program) and
`site/docs/intro.md` maps to at least one slide:

- The Big Pivot / Docker Desktop paid → **3**
- Container-native (OCI + Compose Spec) → **3, 11, 15**
- One use case decomposed / one step per module → **2, 7, 12**
- Two connected use cases (Docs Assistant, Support Agent → Incident Crew) → **5**
- Intelligence progression (naive RAG → Agentic RAG → agent → crew) → **6**
- The build ladder (steps 0–8, M1–M8 + Capstone) → **7**
- M3B optional (LoRA/QLoRA) → **7, 13**
- Apple-Silicon GPU constraint / native-server pattern / host.docker.internal → **8**
- OpenAI-compatible endpoint as the universal contract → **9**
- Resource budget / 16 GB / 4–6 GB peak / shared endpoint → **10**
- Open-source tool map (runtime, serving, packaging, vector, MCP, agents, security) → **11**
- Write-the-stack / one growing compose.yaml → **12**
- Program at a glance (Day 1 / Day 2) → **13**
- Objectives → **4**
- Prerequisites (knowledge + system) → **14**
- Closing philosophy + start CTA → **15**

Nothing from the intro material is orphaned.
