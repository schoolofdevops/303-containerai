# Module 1 — Container-Native GenAI · Explainer Deck Sequence

This companion doc maps the 13-slide explainer deck (`01-container-native.html`) to the Module 1 lesson (`site/docs/m1-container-native/lesson.md`). The deck teaches **concepts**, not commands — it turns each of the lesson's analogies into a hand-drawn black-and-white visual that a learner can walk through before opening the lab. The visual language exactly matches the course intro deck (`00-introduction.html`): Kalam font, `#1e1e1e` primary / `#757575` secondary strokes, the `#rough` wobble filter on shapes only, and the shared arrowhead markers. Slides move vocabulary forward — motivating problem → the open standard → what containers buy → the Apple-Silicon constraint and its fix → the universal endpoint → the 2026 agent map → the Acme ladder → a lead-in to the lab.

## Slide table

| # | Slide | Concept | Source in lesson | Visual pattern |
|---|-------|---------|------------------|----------------|
| 1 | Container-Native GenAI (title) | Module framing; OCI box loads onto any carrier | §1 shipping-container analogy | Title: labelled "AI" container fanning out to four runtime carriers |
| 2 | What you'll learn | The five module ideas | Whole lesson / Summary table | Numbered rows (circles 1–5) |
| 3 | The assumption that just broke | Docker Desktop pricing broke "container = Docker" | §1 (pricing paragraph) | Old equation crossed out → new equation box |
| 4 | Container-native, not Docker-native | One `compose.yaml`, four runtimes, identical result | §1 + its Mermaid graph | Central source box → spokes to 4 runtimes → converge to "same app" |
| 5 | What containers buy an AI stack | Package · Serve · Isolate · Ship | §2 (table + "sealed shipment") | Four sealed-box panels with lidded tops |
| 6 | The Apple-Silicon GPU reality | Metal GPU not wired into containers; CPU fallback 3–6× slower | §3 (office-building analogy + tech reality) | Building anatomy: mains vs unwired guest rooms → consequence box |
| 7 | The fix: native server, containerized rest | Native model + containerized app/agent/DB via `host.docker.internal:11434` | §3 (universal Mac pattern + Mermaid) | Host boundary: native server box ← arrow ← container cluster |
| 8 | One universal contract | OpenAI-compatible endpoint = wall socket, swappable engines | §6 (wall-socket analogy) | Three engines → socket → app plug (box→arrow→box) |
| 9 | The 2026 map: declarative vs orchestration | Declarative agents vs orchestration frameworks; start light | §4 | Two side-by-side panels + "add only when needed" bridge |
| 10 | Anatomy of a declarative agent | AGENTS.md/SOUL.md + Skills + MCP + guardrails | §4 (declarative definition) + module hint | Big outlined box with four labelled inner sections (file anatomy) |
| 11 | Meet Acme — two connected tools | Docs Assistant (A) used as a tool by the Incident Crew (B) | §5 (Acme use case) | runbooks → Docs Assistant → (used as a tool) → Incident Crew |
| 12 | The build ladder | One step per module, one growing compose file | §2 + §5 (build ladder table) | Staircase of rungs M1→M7 + capstone riser |
| 13 | Build it once. Run it anywhere. (closing) | The lab: throwaway container calls native model, gets an answer | §3 + closing line of lesson | Sparse big-idea: container ⇄ Ollama request/response |

## Recommended presentation order

Present strictly 1 → 13; the deck is built so each slide's vocabulary is used by the next. Open on the title (1) and the roadmap (2), then justify the module with the pricing shock (3) before introducing the shipping-container analogy (4) — problem before solution. Slides 5–8 are the technical spine: what containers give AI (5), the Apple-Silicon limit (6) and its fix (7), then the endpoint contract (8) that makes every serving swap invisible. Slides 9–10 are a forward signpost to M6/M7 — keep them brisk, they preview rather than teach. Land on Acme (11) and the ladder (12) to set the through-line, and close on 13 as the direct hand-off into the lab. If time is short, slides 9 and 10 are the safest to compress, since M6/M7 revisit them in depth.

## Gemini image briefs

These are optional photographic/painterly plates for concepts that benefit from a richer image than a sketch. Generate at 16:9 unless noted; no text, labels, or logos in the image.

**Brief A — Shipping container on interchangeable carriers (insert as an optional full-bleed backdrop behind or before Slide 1/4).**
A single weathered steel shipping container, photographed in soft overcast daylight, resting at the exact center of a wide industrial yard. Around it, faint and slightly out of focus, sit four different means of transport — a flatbed truck, a rail car, a harbor crane, and a cargo ship's deck — arranged so the container could plausibly be lifted onto any one of them. Muted, near-monochrome palette: greys, faint blues, worn metal. The mood is calm and deliberate, emphasizing that the box is identical regardless of which carrier takes it. Shallow depth of field keeps the container crisp and the carriers softly suggested. 16:9, no text, no brand marks, no visible container numbers or logos.

**Brief B — Office building with unwired guest rooms (insert alongside Slide 6, the Apple-Silicon reality).**
A painterly cutaway illustration of a modern multi-story office building shown in cross-section, in a restrained black-and-white ink-wash style. The building's basement glows faintly with a warm electrical hum suggesting a powerful mains supply, and thick power lines run up the central spine. But the individual guest rooms on the upper floors have visibly no outlets on their walls — a few small battery lanterns sit on desks instead, dimmer than the mains. The contrast reads instantly: abundant power in the structure, none delivered to the rooms. Uncluttered, architectural, contemplative. 4:3, no text, no signage, no logos.

**Brief C — A wall socket with interchangeable power stations behind the wall (insert alongside Slide 8, the endpoint contract).**
A clean close-up photograph of a single standard electrical wall socket on a smooth plaster wall, sharply lit and centered. Behind the wall — rendered as a soft double-exposure or ghosted overlay — three different power sources are faintly visible feeding the same socket: a small hydro turbine, a solar array, and a compact generator, all converging into one cable that reaches the outlet. The appliance side is implied by a plug hovering just in front, unbothered by which source is active. Neutral, near-monochrome tones with a single subtle warm accent at the socket. 16:9, no text, no brand marks.

## Coverage check

Every concept in the lesson maps to at least one slide:

- **§1 Container-native, not Docker-native** — shipping-container analogy → Slides 1, 4; Docker Desktop pricing → Slide 3; OCI + Compose Spec across four runtimes → Slide 4.
- **§2 What containers buy an AI stack** — Package/Serve/Isolate/Ship → Slide 5; growing `compose.yaml` one service per module → Slides 5 (framing) & 12.
- **§3 The Apple-Silicon GPU reality** — office-building analogy + Hypervisor.framework / no virtual GPU / CPU 3–6× → Slide 6; native-server + containerized-everything-else + `host.docker.internal:11434` + Windows/NVIDIA exception → Slide 7; also echoed in the closing Slide 13.
- **§4 Declarative agents vs orchestration** — the two-way map and "start declarative, add orchestration only for hard sequencing" → Slide 9; the anatomy (AGENTS.md/SOUL.md + Skills + MCP + guardrails) → Slide 10.
- **§5 The Acme use case + build ladder** — Acme runbooks, Docs Assistant (A) used as a tool by the Incident Crew (B) → Slide 11; step-per-module ladder / one growing compose file → Slide 12.
- **§6 The OpenAI-compatible endpoint** — wall-socket analogy, swappable engines, code never changes → Slide 8.
- **Summary table** — condensed across Slide 2 (objectives) and reinforced throughout.
- **Lab lead-in** (final lesson line: throwaway container calls native Ollama) → Slide 13.
