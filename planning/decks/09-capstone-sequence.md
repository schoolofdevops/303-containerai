# Capstone — Ship the Acme AI Platform · Explainer Deck Sequence

<!-- CourseSmith sequence spec — regenerated 2026-08-05 against the newest coursesmith
     contract (whiteboard-style-guide.md §0/§3a, deck-author SKILL.md §8 voice pipeline).
     This revision adds one divider slide per lesson `##` section (§3a), tightens every
     subtitle to the ≤10-word/≤60-char anchoring-phrase rule (§0), and voice-passes every
     on-slide h2.t/p.s/SVG label through gourav-voice, stripping em dashes everywhere except
     divider 4 (kept verbatim — the lesson header itself carries an em dash by design).
     Slide count: 11 → 15 (4 dividers added, zero content slides added/removed/reordered —
     the original 9 content slides + title + closing were already in lesson order 1→4). -->

This companion doc maps the 15-slide explainer deck (`site/static/decks/09-capstone.html`) to the
Capstone page (`site/docs/capstone/index.md`). The deck teaches **concepts**, not commands — it turns
the capstone's "eight modules snap into one platform" narrative into a hand-drawn whiteboard walk a
learner takes before opening the lab. Visual language follows the CourseSmith whiteboard style
contract (`whiteboard-style-guide.md`): Patrick Hand cursive, `#1e1e1e` primary / `#757575` secondary
strokes on white paper, five semantic pastel fills (green good · red bad · blue data · orange caution ·
purple meta), the `#rough` wobble filter on shapes only, shared `#ah`/`#ahg` arrowhead markers. The arc:
**eight modules → one wired platform → six shipped moves (serve, run, package, secure, ship, prove
portable) → the arc of intelligence the course taught (naive RAG → agentic RAG → crew).**

## Slide table

| # | Slide | Purpose | Visual | Takeaway |
|---|-------|---------|--------|----------|
| 1 | Ship the Acme AI Support Platform (title) | Frame the capstone: every module becomes one deployable product | Title scene: four module-group boxes fanning into one wheeled platform box | credit line: Gourav Shah · School of DevOps & AI · Capstone · Day 2 |
| 2 | 1 · The Platform at a Glance (divider) | Open §1 — the platform's big-picture shape | — (divider) | n/a |
| 3 | You're about to assemble the whole platform | See the three zones before touching a command: native host, containers, supply chain | Big-box anatomy: host boundary (Ollama) + containers boundary (3 apps + ChromaDB + ToolHive) + supply-chain lane (ModelKit, SBOM/sign, CI) | The container boundary is the rule: the model stays native, everything else is a container |
| 4 | How the modules connect | Each of the eight modules maps to exactly one capability of the shipped platform | Two-column list (M1–M4 left, M5–M8 right) converging into one "Acme AI Support Platform" box | Nothing was thrown away — the capstone is the sum of eight modules, wired together |
| 5 | 2 · Run It End-to-End (divider) | Open §2 — the seven runnable steps | — (divider) | n/a |
| 6 | Move 1 serves the model | The model has two interchangeable homes behind one stable API | Two-panel comparison (Ollama native / vLLM container) fanning into a shared `/v1` endpoint box, then into "every consumer" | Swap the engine behind the wall socket — no downstream container changes a single line |
| 7 | Move 2 runs the Incident Crew | Four specialised agents run in sequence, sharing one model and two shared services | Pipeline (Triage → Investigate → Fix → Review) with ToolHive + ChromaDB feeding in from below | Specialisation with an approval gate — a traceable, auditable incident-response report |
| 8 | Move 3 packages the ModelKit | Weights, prompt, and config seal into one versioned, pushable artifact | Fan-out: three inputs → ModelKit box → Registry box | One command pulls exactly that version — no shared drives, no stray prompt files |
| 9 | Move 4 secures the image | Every image is inventoried, scanned, and signed before it ships; every tool call is sandboxed | Pipeline (SBOM → Scan → Sign → Verify) with a reject branch, plus a sandboxed-execution box below | An image that fails the scan never reaches the registry; a passing one is signed and attested |
| 10 | Move 5 ships it through CI | A push to `main` is the only trigger a release needs | Pipeline (push → build → scan → sign) into a signed GHCR box, with a reject branch back down | A passing build produces a signed, attested image any host can pull and verify |
| 11 | 3 · Portability Proof (divider) | Open §3 — nothing above depends on the runtime | — (divider) | n/a |
| 12 | Move 6 proves it's portable | Nothing above depends on which container runtime you run | Fan-out: three runtimes (Colima/Rancher/OrbStack) converging on one "same platform" box → "identical output" | The spec, not the vendor, defines the contract — steps 1–7 run unchanged on every runtime |
| 13 | 4 · What You Built — and Where to Go Next (divider) | Open §4 — the ladder, the arc, and the next steps | — (divider) | n/a |
| 14 | The arc you shipped | The three modules (M5/M6/M7) are one progression, not three unrelated demos | Staircase/ladder: Naive RAG → Agentic RAG → Crew, "simple & predictable → capable & auditable" | You learned not just how each pattern works, but when it is the right one to reach for |
| 15 | You can now ship AI on any runtime (closing) | Send the learner into the lab with the whole arc in one image | Closing scene: sealed "Acme AI" platform box rolling toward "Any runtime" | Now open the Capstone lab. · Gourav Shah · School of DevOps & AI |

<!-- Visual pattern vocabulary used above (reuse before inventing):
     fan-out (slides 1, 8, 12) · two-panel comparison (slide 6) · big-box anatomy (slide 3) ·
     pipeline with hop-by-hop fragments (slides 7, 9, 10) · staircase/ladder (slide 14) ·
     two-column list → converge (slide 4) -->

## Recommended presentation order

Present strictly 1 → 15. Open on slide 1 to set the "everything snaps together" frame, then divider 2
opens §1 and slide 3 is the conceptual hinge — linger here, it is the map the rest of the deck walks.
After divider 5 (§2), slides 6–10 are one continuous build ("the six moves you actually run") — keep
momentum, each move is one lab step. Slide 7 is the busiest single diagram (four agents + two shared
services): if short on time, name the four stages fast and spend the saved seconds on slide 14, which
is the course's real payoff — the naive → agentic → crew progression is the idea learners should leave
remembering. Never compress slide 3 (the container-boundary rule) or slide 14 (the arc). The four
dividers are also the deck's navigation map: a learner can jump straight to any of the four lesson
sections from the deck without scrubbing through slides.

## Fragment map

This deck is a "tour of what you already built" — every slide's diagram is a completed, static picture
the presenter narrates whole, not a suspenseful reveal. No slide uses fragments.

Static slides (all of 1–15): every slide shows its full picture at once — this is a review/synthesis
deck (comparison, anatomy, and pipeline-as-summary read better whole than built up hop by hop).
Divider slides (2, 5, 11, 13) carry no visual at all — title only, per style guide §3a.

## Coverage check (HARD GATE — §0)

Every section of the capstone page maps to a slide below, in lesson order 1 → 4. No orphans.

| Capstone page section / concept | Slide(s) | Notes (analogy used, echoes/forward pointers) |
|---|---|---|
| Capstone framing — 8 modules → 1 platform | 1, 4 | Title scene fans 4 module-groups into the platform box; slide 4 lists all 8 by number |
| §1 The Platform at a Glance (divider) | 2 | Divider: `1 · The Platform at a Glance` — verbatim lesson header |
| §1 dispatch-centre analogy: native brain, containerized teams, sealed supply chain | 3 | Big-box anatomy mirrors the lesson's own Mermaid diagram (Host / Containers / Supply chain) |
| The container boundary rule (model native, everything else containerized) | 3 | Carried as the slide's takeaway, echoed again in the closing scene (slide 15) |
| §2 Run It End-to-End (divider) | 5 | Divider: `2 · Run It End-to-End` — verbatim lesson header |
| Step 1 — Serve the model (M2/M3, OpenAI-compatible `/v1`, wall-socket abstraction) | 6 | "Wall socket" analogy realized as the shared `/v1` box between the two engines and every consumer |
| Step 2 — Start the platform / Step 3 — Support Agent / Step 4 — Incident Crew (M5/M6/M7) | 7 | One pipeline slide covers the crew's four-stage run; Docs Assistant + Support Agent's shared ChromaDB shown as the "shared knowledge" box |
| Step 5 — Package the model (M4, ModelKit) | 8 | Fan-out of the three sealed inputs (weights, prompt, quant config) into one OCI artifact |
| Step 6 — Secure the crew image (M8, SBOM/scan/sign) + ToolHive sandboxing (M6/M7) | 9 | Pipeline with an explicit reject branch; sandboxed tool execution called out as its own box |
| Step 7 — Ship via CI (M8, GitHub Actions pipeline) | 10 | Push-to-build-to-scan-to-sign pipeline into signed GHCR, reject branch shown |
| §3 Portability Proof (divider) | 11 | Divider: `3 · Portability Proof` — verbatim lesson header |
| §3 Portability Proof body (OCI, Compose Spec, `host.docker.internal`, ModelKit, Cosign referrers all runtime-agnostic) | 12 | Three named runtimes fan into one "same platform" box; "identical output" is the payoff label |
| §4 What You Built — and Where to Go Next (divider) | 13 | Divider: `4 · What You Built — and Where to Go Next` — verbatim lesson header, em dash kept by design (the one expected exception in this module's em-dash check) |
| §4 The arc of intelligence (Naive RAG → Agentic RAG → Crew) | 14 | Staircase idiom carries the course's central progression claim |
| §4 What You Built (the ladder table, M1–M8) | 4 | Same slide as the module-map; each module's contribution is a labeled row |
| §4 Take-home (second use case) / Extension (LoRA/QLoRA, M3B) | 15 | Closing scene's "ships on any runtime" claim generalizes to the take-home framing; kept off-slide as narration since it is a forward-pointer, not new deck vocabulary |
| Course sign-off — "you can now ship AI on any runtime" | 15 | Closing title + scene + credit hand-off |

**No orphans.** Every capstone-page section above has a slide; every slide above has a page anchor.
The Take-home/Extension material (§4 tail) is intentionally carried as presenter narration off slide 15
rather than a 16th slide — it is a forward pointer to material outside this module's own concepts, not
an uncovered capstone concept.

## Divider slides (style guide §3a)

One divider per lesson `##` section, inserted immediately before that section's first content slide,
numbered by deck presentation order (which matches lesson order here — no reordering was needed, see
the header note above):

| Divider # | Slide | Title (verbatim to lesson header) | Inserted before |
|---|---|---|---|
| 1 | 2 | `1 · The Platform at a Glance` | Slide 3 (You're about to assemble the whole platform) |
| 2 | 5 | `2 · Run It End-to-End` | Slide 6 (Move 1 serves the model) |
| 3 | 11 | `3 · Portability Proof` | Slide 12 (Move 6 proves it's portable) |
| 4 | 13 | `4 · What You Built — and Where to Go Next` | Slide 14 (The arc you shipped) — **em dash kept verbatim by design**, the one expected exception in this module's em-dash check |

## Subtitle audit (2026-08-05 regen — all ≤10 words / ≤60 chars, hard fail >80)

| Slide | Subtitle | Chars | Words |
|---|---|---|---|
| 1 | Eight modules, one deployable product, end to end. | 50 | 8 |
| 3 | One native brain, containerized teams, sealed supply chain. | 59 | 8 |
| 4 | Every module maps to one platform capability. | 45 | 7 |
| 6 | One model, two homes, one shared API. | 37 | 7 |
| 7 | Four specialists, one shared model and memory. | 46 | 7 |
| 8 | Weights, prompt, and config sealed into one artifact. | 53 | 8 |
| 9 | Inventory it, scan it, sign it, sandbox every tool. | 51 | 9 |
| 10 | Push to main, the pipeline builds, scans, and ships. | 52 | 9 |
| 12 | Swap the runtime, the output stays identical. | 45 | 7 |
| 14 | Naive RAG, then Agentic RAG, then Crew. | 39 | 7 |
| 15 | Same architecture, new domain, swap the runbooks. | 49 | 7 |

All pass. No orphan slides (dividers 2/5/11/13 carry no subtitle per §3a).
