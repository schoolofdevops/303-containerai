# Module 0 — Introduction · Explainer Deck Sequence

<!-- CourseSmith sequence spec — authored and approved BEFORE the deck HTML is built.
     Convention: whiteboard-style-guide.md §5. One row per slide; every slide needs
     purpose + visual + takeaway. NO slide-count cap (§0): one idea per slide, every
     lesson concept gets a slide — the coverage table below is a hard gate. -->

<!-- ADDENDUM for ORIGINAL decks (deck-regen-contract.md, round-3, 2026-07-25): this deck
     predates CourseSmith and had no sequence spec. It is authored here for the FIRST time,
     using the shipped `site/static/decks/00-introduction.html` (15 slides, reveal.js 4.6.1 +
     Patrick Hand loaded from CDNs, `p.takeaway` on 11 of 15 slides) as the approved coverage
     baseline. Slide order, count (15), and every fact/number/SVG scene are carried over 1:1 —
     no splits were needed; every old slide already taught exactly one idea. The deck is
     rebuilt on the turnkey skeleton (`templates/deck/deck-skeleton.html.tmpl`) for: the
     anchored layout (title TOP / visual centered in its band / subtitle as bottom caption),
     `Reveal.initialize({display:'flex'})` + `svg{order:2}`, and zero external requests
     (reveal.js 5.2 runtime + Patrick Hand woff2 now inlined, killing the three CDN loads).
     Every `p.takeaway` is REMOVED from the rendered HTML; each one's exit line is captured
     verbatim in this spec's Takeaway column below — nothing was deleted as content. 5 of the
     15 old subtitles measured OVER 80 chars (slides 2/81, 3/85, 6/81, 8/92, 9/97) — each was
     cut to one line ≤80 chars; no fact/number was lost since these were framing sentences, not
     data (the actual facts — model names, the `/v1` socket, `host.docker.internal:11434`, the
     "≈4–6 GB" figure — already lived in-SVG in the original and still do). Two SVGs also picked
     up one small in-SVG label each to carry a fact that previously lived ONLY in the removed
     takeaway line (slide 7's M3B-optional-step note; slide 13's M3B-extends-to-2.5-days note).
     Old pageno numbering (`01`–`15`, no module-prefix — this is the intro deck, not a numbered
     module) is kept as-is per "match precedent." -->

This companion doc maps the 15-slide explainer deck (`site/static/decks/00-introduction.html`) to
the course introduction page (`site/docs/intro.md`). The deck teaches **concepts**, not commands —
it turns the intro page's framing (what you'll build, why container-native not Docker-native, the
GPU constraint, the budget, the program layout) into a hand-drawn whiteboard visual a learner walks
through before opening Module 1. The visual language follows the CourseSmith whiteboard style
contract (`templates/deck/whiteboard-style-guide.md`): Patrick Hand cursive, `#1e1e1e` primary /
`#757575` secondary strokes on white paper with the five semantic pastel fills (§1: green good ·
red bad/full · blue data · orange caution · purple meta — this deck stays mostly neutral ink/gray,
consistent with the original's black-and-white palette; no pastel fills were introduced since none
were part of the founder-approved baseline), the `#rough` wobble filter on drawn outlines only, and the
shared `#ah`/`#ahg` arrowhead markers. The arc moves — **what you'll build (one growing system, two
connected use cases) → the one design pivot (container-native, not Docker-native) → what you'll be
able to do → the intelligence progression and the module-by-module build ladder → the constraints
behind every lab (Apple-Silicon GPU wiring, the OpenAI-compatible socket, the 16 GB budget) →
the open-source tool map → how the labs are authored → the two-day program layout and prerequisites
→ a closing call to start.**

Page numbers stay the old deck's own bare `NN` prefix (`01`–`15`) — this is the course-level intro
deck, not a numbered module deck (those use `M<N>·NN`), so there is no `module.code` prefix to carry.

## Slide table

| # | Slide | Purpose | Visual | Takeaway |
|---|-------|---------|--------|----------|
| 1 | Containers for GenAI & Agentic AI (title) | Course framing: what the course is, who it's for, how long | Title scene: a shipping container labeled AI rolling on wheels, "runs identically on any OCI runtime" | credit line: Gourav Shah · 2 Full Days · Intermediate → Advanced · Hands-on |
| 2 | One real system — built one step per module | You don't learn tools in isolation; you ship one growing system, one block at a time | Staircase of 7 rising modules (model → serve → package → RAG → agent → crew → Platform) | From a bare model call to a shipped multi-agent platform — nothing thrown away along the way |
| 3 | Container-native, not Docker-native | Docker Desktop is now paid for larger orgs — the course builds on the open OCI/Compose standard instead | Two-panel comparison: dashed gray "Docker-specific (2025)" box vs solid ink "Open-source & universal" box, arrow "swap for" | OCI + the Compose Spec run identically on every runtime. Docker becomes one option, never a requirement |
| 4 | What you'll be able to do | The five concrete outcomes by the end of two days | Numbered rows (circles 1–5), one outcome per row | Everything containerized, portable, and reproducible — using only open-source tooling |
| 5 | Two connected use cases | The course builds two systems that connect at the tool boundary, not in isolation | Two-panel: Day 1 "Docs Assistant" box → arrow "used as a tool" → Day 2 "Support Agent → Incident Crew" box | Use Case B *uses* Use Case A as one of its tools — so skills compound instead of forming one giant tangle |
| 6 | The intelligence progression | AI patterns are introduced the way teams actually adopt them, each earning its keep | Pipeline, 4 stages: Naive RAG → Agentic RAG → Tool-using agent → Multi-agent crew, "simple → complex" caption | You learn not just *how* each pattern works, but *when* it's the right one to reach for |
| 7 | The build ladder — one step per module | Every module (M1–M8 + capstone) maps to one step, Day 1 serve/package, Day 2 RAG/agentic/ship | Two-column ladder of 8 module rows + a capstone bar spanning both, "← DAY 1" / "DAY 2 →" captions | M3B (LoRA/QLoRA fine-tuning) is an optional bonus step for cohorts that want model customization |
| 8 | The one constraint behind every lab | Apple Silicon can't expose its Metal GPU to a container, so the course wires around it instead of fighting it | Big-box anatomy: host boundary containing a native "Model Server" box + a dashed container boundary with 4 inner service boxes, arrow "host.docker.internal:11434" | On Mac: serve the model natively, containerize everything else. On Windows + NVIDIA the server *can* live in a container |
| 9 | One contract: the OpenAI-compatible endpoint | The wall-socket analogy — swap the serving engine behind the endpoint and the app code never notices | Fan-out: 3 engines (Ollama, vLLM, llama.cpp) converge into one socket labeled "/v1 (OpenAI API)", arrow to "Your app / agent" | Every serving lab ships behind the same endpoint — so application and agent code stay untouched when the backend swaps |
| 10 | It all runs on a 16 GB laptop | The memory budget is a non-negotiable design rule, engineered lean on purpose | Budget bar (≈4–6 GB peak marked on a full-width bar) + 3-panel row of the tactics that keep it small | Target per lab: ≈4–6 GB RAM and 2–3 containers. Heavy GPU work stays opt-in with CPU/cloud fallbacks |
| 11 | The open-source tool map — one tool per job | A tidy stack: for each job, the exact open-source tool used in the labs | Two-column table (8 rows: runtime, serving, packaging, vector store / MCP tools, agents, orchestration, supply chain) | Open standards throughout — swap any tool for its peer and the pattern still holds |
| 12 | Write the stack — don't paste it | The compose.yaml grows service by service, hand-authored across modules, never pasted whole | Anatomy: a `compose.yaml` box with 5 service blocks stacked inside, gray arrows labeled "one block per module" feeding in | By the end, one file tells the whole story — and you understand every line because you wrote it |
| 13 | Program at a glance | The two-day layout: Day 1 serve & package, Day 2 RAG → agentic → ship | Two-panel: DAY 1 box (M1–M4) / DAY 2 box (M5–M8 + Capstone) | Optional M3B (LoRA/QLoRA) can extend the program toward 2.5 days for customization-focused cohorts |
| 14 | What to bring | Prerequisites split into knowledge needed vs. system needed, all free/open source | Two-panel: "Knowledge" box (5 rows) / "System" box (5 rows) | Windows + NVIDIA enables the full local vLLM-GPU lab; without it, the CPU track covers the learning |
| 15 | Build it once. Run it anywhere. (closing) | Closing call to action and hand-off to Setup → Module 1 | Closing scene: a container labeled AI rolling forward on wheels toward a "Shipped" box, captioned with the four open runtimes | Container-native, not Docker-native — built on open standards. Start with Setup → Prerequisites, then Module 1 |

<!-- Visual pattern vocabulary (reuse before inventing):
     fan-out · two-panel comparison · big-box anatomy · numbered rows ·
     pipeline with hop-by-hop fragments · hub-and-spoke · staircase/ladder ·
     crossed-out-old → boxed-new -->

## Recommended presentation order

Present strictly 1 → 15; each slide's vocabulary is used by the next. Open on slide 1 (the shipping
container) — it's the image the whole course circles back to. Slide 3 (container-native, not
Docker-native) is the conceptual hinge: linger here, since it is the one design decision that
explains every subsequent tooling choice in the course. Slides 6–7 (the intelligence progression
and the build ladder) form one continuous conceptual pair — present them back to back without a
break, since the ladder is a direct elaboration of the progression. Slides 8–9 (the GPU constraint,
the OpenAI-compatible socket) are the two "why does the lab look like this" answers — do not skip
or compress these even under time pressure, since every lab from M1 onward assumes the learner
has this wiring in their head. Under time pressure, compress slides 11–12 (tool map, write-the-stack)
to a single pass-through — they are reference material the learner will re-encounter in the labs
themselves. Close on slide 15 and hand off directly to Setup → Prerequisites.

## Fragment map

No slide in this deck uses fragments — every slide is a single static picture. This matches the
old deck exactly (it shipped with zero fragments) and is appropriate here: this is a framing/
overview deck of comparison, anatomy, and table-style slides (two-panel comparisons, numbered rows,
big-box anatomy, a ladder, a table) — the style guide (§6) calls these out as slide types that read
better whole, not built up hop by hop. There is no hop-by-hop causal sequence in this deck's content
that would warrant a fragment build.

Static slides (all of 1–15): every slide shows its full picture at once.

## Coverage check (HARD GATE — §0)

Every `site/docs/intro.md` section maps to a slide. No slide teaches more than one idea.

| Lesson section / concept | Slide(s) | Notes (analogy used, echoes/forward pointers) |
|---|---|---|
| Course framing (title, author, duration, level) | 1 | Shipping-container hero visual, reused again as the closing image (slide 15) |
| "What You'll Build" — one real system, one step per module | 2 | Staircase idiom: model → serve → package → RAG → agent → crew → Platform |
| "What You'll Build" — Use Case A (Docs Assistant) & Use Case B (Support Agent → Incident Crew) | 5 | Two-panel, "used as a tool" arrow — the tool-boundary connection is the point |
| "What You'll Build" — the intelligence progression (Naive RAG → Agentic RAG → tool agent → crew) | 6 | Pipeline idiom, "simple & predictable → capable & complex" caption |
| The one design principle: container-native, not Docker-native | 3 | Two-panel crossed-out-old (dashed) → boxed-new (solid) idiom |
| What you'll be able to do (5 learning objectives) | 4 | Numbered-rows idiom (circles 1–5), matches the lesson's implicit objective list |
| "The Build Ladder" table (M1–M8, M3B optional, Capstone) | 7 | Ladder idiom across two columns + a capstone bar; M3B called out as the optional bonus step |
| The Apple-Silicon / GPU wiring constraint (native model server vs. containerized app) | 8 | Big-box anatomy: host boundary, native Model Server box, dashed container boundary with 4 service boxes |
| The OpenAI-compatible endpoint (engine-swap wall-socket analogy) | 9 | Fan-out idiom: 3 engines converge on one socket, app plugs in unchanged |
| "The 16 GB Budget" (peak footprint, the tactics that keep it small) | 10 | Budget-bar + 3-panel tactics idiom |
| Open-source tool map (implied across the lesson's tool names — Ollama, vLLM, ToolHive, Trivy, etc.) | 11 | Table idiom, 8 rows across 2 columns, one job → one tool |
| Labs author one growing `compose.yaml` service by service (course convention, echoed from CLAUDE.md authoring conventions) | 12 | Anatomy idiom: one compose.yaml box, 5 stacked service blocks, "one block per module" |
| "Program at a Glance" (Day 1 / Day 2 table) | 13 | Two-panel Day 1 / Day 2 idiom |
| "Prerequisites" (Knowledge / System) | 14 | Two-panel Knowledge / System idiom |
| Closing call to action + hand-off to Setup → Module 1 | 15 | Closing scene reprising the slide-1 container, now rolling toward "Shipped" |

**No orphans.** Every section of `site/docs/intro.md` (course framing, What You'll Build, the Build
Ladder, the 16 GB Budget, Prerequisites, Program at a Glance, the one design principle) maps to at
least one slide above, and every slide in the deck maps back to a section or a direct implication of
one (the tool map and the compose-authoring-convention slides elaborate points the lesson makes only
in passing — kept because the old deck already covered them and the founder-approved baseline is the
coverage floor, not a ceiling to trim). No slide teaches two ideas; none required a split.

## 2026-08-14 pass — narration, rough-filter fix, illustrations

**Narration:** `planning/narration/00-narration.md` (new). 4 videos via `lesson-to-video-narration`
+ `gourav-voice` (Spoken register): talking-head intro (slide 1), "The Build Ladder" explainer
(slides 5–7), "The 16 GB Budget" explainer (slides 10, 14), and a closing bridge (slide 3, 15).
Measured 5-gram retell overlap against `site/docs/intro.md`: **3.2%** overall (hard gate is <10%).

**Rough-filter bug — present, fixed.** The deck's single shared `<filter id="rough">` used the
default `objectBoundingBox` region (`x="-5%" y="-5%" width="110%" height="110%"`), which makes any
perfectly horizontal/vertical line invisible. Fixed to `filterUnits="userSpaceOnUse" x="-80" y="-80"
width="1300" height="600"` (covers this deck's largest viewBox, 1100×430, with margin).

**Illustrations — 2 added (Magnific, pencil-sketch style-lock prompt).** This deck is mostly
factual/comparison content (build-ladder table, tool map, budget bar) that reads better as a diagram
than a photo per the style contract's "comparison slides stay static" rule — so illustration was
scoped to the two narrative bookends rather than forced onto every slide:

| Slide | File | Replaces | Scene |
|---|---|---|---|
| 1 (title) | `site/static/img/decks/00-introduction/title-workbench-build.jpg` | the shipping-container SVG diagram | Two hands assembling a plain wooden crate on a workbench, one panel at a time — echoes "one real system, built one step at a time" |
| 15 (closing) | `site/static/img/decks/00-introduction/closing-crate-shipped.jpg` | the "shipped" SVG diagram | A sealed crate lifted by a dockside crane, a truck and a cargo ship both waiting — the "build it once, run it anywhere" payoff |

Both images: 16:9, white-level corrected (`magick -colorspace Gray -level 0%,88%`), saved as external
files (not base64-inlined), verified by content against their prompts before insertion. Slides 1 and
15 are not `.divider` slides, so no order-flip CSS was needed — the image simply replaces the previous
`<svg>` diagram in place, title/subtitle layout unchanged. Verify gate: zero external refs, tags
balanced, file size 216 KB (well under the 800 KB cap), `#rough` filter fixed, both slides rendered
headless and confirmed correct.

**Closed 2026-10-21 (deck audit pass):** slide 15's subtitle no longer uses the banned word; it now
reads "Container-native, not Docker-native — built on open standards.

## Update 2026-10-21 — deck audit fixes (g1)

- Slide 3: the left column is now "Docker-specific (2025)", not "Docker-proprietary". Docker Model
  Runner is open source but runs only on Docker Desktop and Docker CE (M2 §1).
- Slide 7: subtitle "Each module adds one step to the same growing system."; M3B note "a bonus step".
- Slide 8: title "The one constraint behind every lab".
- Slide 10: first card reads "1B–4B, quantized"; the default `qwen3.5:2b` is an MLX mxfp8 build of
  3.1 GB, not Q4. `site/docs/intro.md` was fixed to match.
- Narration: Video 3 now carries beats for slides 8, 9, 11 and 12; Video 1 covers slides 2 and 4.
