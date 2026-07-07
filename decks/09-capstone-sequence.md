# Capstone — Explainer Deck Sequence

Companion sequencing notes for `09-capstone.html`. This deck is the closing explainer for
the course capstone — the end-to-end integration that snaps all eight modules into one
deployable product, the **Acme AI Support Platform**, and proves it ships unchanged on any
OCI runtime. Walk learners through these slides before they run the live capstone lab so the
whole system is legible before their hands hit the keyboard.

Style matches `00-introduction.html` exactly: black-and-white hand-drawn (reveal.js + Kalam),
`#rough` wobble filter on shapes only, gray/ink arrowheads, one inline SVG per slide.

## Slide table

| # | Page | Title | Role | Centerpiece SVG |
|---|------|-------|------|-----------------|
| 1 | CAP·01 | Ship the Acme AI Support Platform | Title | Eight module blocks converging into one platform on wheels |
| 2 | CAP·02 | What you'll assemble — the whole platform | System overview / hub | Native brain + containerized teams + supply-chain lane |
| 3 | CAP·03 | How the modules connect | M1–M8 recap → capstone | Eight module rows feeding one platform box |
| 4 | CAP·04 | Move 1 — Serve the model | Serve | Ollama / vLLM behind one `/v1` socket |
| 5 | CAP·05 | Move 2 — Run the Incident Crew | Run the crew | Triage → Investigate → Fix → Review, ToolHive + ChromaDB below |
| 6 | CAP·06 | Move 3 — Package as a ModelKit | Package | Three inputs packed into a ModelKit, pushed to registry |
| 7 | CAP·07 | Move 4 — Secure the image | Secure | SBOM → Scan → Sign → Verify + sandboxed tools |
| 8 | CAP·08 | Move 5 — Ship via CI | Ship | push → build → scan → sign → GHCR pipeline |
| 9 | CAP·09 | Move 6 — The portability proof | Portability | Colima/Rancher/OrbStack → same platform → identical output |
| 10 | CAP·10 | The arc you shipped | Concept recap | Naive RAG → Agentic RAG → Crew progression |
| 11 | CAP·11 | You can now ship AI on any runtime | Closing big idea | Sealed container rolling toward any runtime |

**Total: 11 slides.**

## Recommended presentation order

Present in file order (1 → 11). The deck is built as a deliberate arc:

1. **Set the destination (1–3).** Open with the title, then the whole-system hub so learners see
   the finished shape before the parts. Slide 3 reassures them nothing is new — the capstone is
   just the eight rungs they already climbed, wired together.
2. **Walk the six moves (4–9).** One slide per move: Serve, Run the Crew, Package, Secure, Ship,
   Portability. Slides 7 and 8 share the pipeline/flow visual language on purpose — Secure is the
   gate, Ship is the automated pipeline that runs that gate. Portability (9) is the payoff move.
3. **Zoom back out (10–11).** Slide 10 recaps the intelligence arc as a concept (why the crew, not
   just how). Slide 11 lands the big idea and points at the take-home second use case.

If time is short, the load-bearing four are **2 (hub), 5 (crew), 8 (ship pipeline), 9 (portability)** —
the two centerpieces plus the two moves learners are least likely to have internalised.

## Gemini image-generation briefs

Optional photographic / illustrated alternatives for the hero concepts, if a richer visual is
wanted alongside the sketched SVGs. Keep them subordinate to the B&W sketch style — these are
enhancements, never replacements.

### Brief A — The dispatch centre (Slide 2, the hub)
A clean editorial illustration of an emergency-dispatch control room seen from behind the
dispatcher. One calm operator sits at a central desk (the native model — the shared brain),
wearing a headset, fielding several ringing phone lines at once. Three labelled team pods around
the room — a documentation desk, a single-agent booth, and a four-person response crew — each with
its own line back to the same dispatcher. A wall of orderly filing cabinets behind the desk
(semantic memory) and a locked key cabinet by the door (the tool gateway). Muted, professional,
slightly diagrammatic; thin confident linework, minimal palette, no clutter. Emphasise that the
dispatcher never leaves the desk while every team rings the same brain. ~16:9. (110 words)

### Brief B — The tamper-evident courier box (Slide 6, Package)
A single sealed shipping/courier box on a plain surface, photographed straight on, studio light.
The box is wrapped with a tamper-evident seal and stamped with a version tag (`v1.0`) and a small
inspection checkmark, conveying "sealed, versioned, verifiable." Inside — hinted through a cutaway
or ghosted overlay — three neatly stacked contents: a weights block, a rolled prompt scroll, and a
small config card. The mood is trustworthy logistics, not tech-flashy: think a courier package you
would sign for. Neutral tones, one accent at most, generous negative space so a caption sits
comfortably beside it. ~16:9. (100 words)

### Brief C — One box, many trucks (Slide 9 / 11, portability)
A single identical shipping container being lifted and set down interchangeably onto three
different carriers lined up in a row — a flatbed truck, a rail car, and a ship's deck — each clearly
a different vehicle, the container obviously the same box each time. Convey "the box doesn't change,
only the carrier under it." Clean industrial-logistics illustration, hand-drawn confidence, mostly
monochrome with restrained shading, wide framing with room for a headline above. Avoid brand marks.
~16:9. (85 words)

## Coverage check — capstone steps → slide

| Capstone source (index.md) | Covered by |
|---|---|
| §1 Platform at a glance (architecture, container boundary rule) | Slide 2 (hub), reinforced by 3 |
| §1 `host.docker.internal:11434` single address | Slide 2 wiring; named on Slide 9 |
| §2 Step 0 — readiness / `platform-check.sh` | Slide 9 (re-run to prove portability) |
| §2 Step 1 — Serve the model (M2/M3, Ollama native or vLLM) | Slide 4 (Move 1) |
| §2 Step 2 — Docs Assistant (M5, RAG) | Slide 2 team; arc on Slide 10 (Naive RAG) |
| §2 Step 3 — Support Agent (M6, agentic RAG, MCP) | Slide 2 team; arc on Slide 10 (Agentic RAG) |
| §2 Step 4 — Incident Crew (M7, 4 agents in sequence) | Slide 5 (Move 2), arc on Slide 10 (Crew) |
| §2 Step 5 — Package the model (M4, ModelKit, `kit push`) | Slide 6 (Move 3) |
| §2 Step 6 — Secure the image (M8, Syft/Trivy/Grype/Cosign) | Slide 7 (Move 4) |
| §2 Step 6 — sandboxed tool execution (ToolHive isolation) | Slide 7 (lower band) |
| §2 Step 7 — Ship via CI (build → scan → sign → push) | Slide 8 (Move 5) |
| §3 Portability proof (Colima/Rancher/OrbStack/Podman, OCI/Compose/Cosign) | Slide 9 (Move 6) |
| §4 The ladder (M1–M8 mapping) | Slide 3 (how modules connect) |
| §4 Arc of intelligence (Naive → Agentic → Crew) | Slide 10 |
| §4 Take-home second use case / big idea | Slide 11 (closing) |

Every capstone step maps to at least one slide; the six moves each get a dedicated slide, and the
two centerpieces (the whole-platform hub on Slide 2 and the CI ship pipeline on Slide 8) anchor the
deck.
