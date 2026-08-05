# Module 1 — Container-Native GenAI · Explainer Deck Sequence

<!-- CourseSmith sequence spec — authored and approved BEFORE the deck HTML is built.
     Convention: whiteboard-style-guide.md §5. One row per slide; every slide needs
     purpose + visual + takeaway. NO slide-count cap (§0): one idea per slide, every
     lesson concept gets a slide — the coverage table below is a hard gate.

     Round-3 regen note: this is an ORIGINAL deck (pre-coursesmith, no prior spec).
     The old deck (`site/static/decks/01-container-native.html`, CDN-loaded reveal.js
     4.6.1 + Google Fonts) is the approved coverage baseline for this spec — every old
     slide's concept appears below, 13 slides kept 1:1, same order, same pagenos.

     2026-08-05 divider/voice-pass regen note: this pass added ONE divider slide per
     lesson `##` section (style-guide §3a), renumbered every .pageno, rewrote every
     subtitle to the new ≤10-word/≤60-char anchoring-phrase target (style-guide §0,
     deck-author SKILL.md §4), and ran every on-slide text node (titles, subtitles,
     SVG labels) through the gourav-voice skill (SKILL.md §8) — mainly: dropped
     decorative em-dashes in favour of commas/periods, swapped "no pollution" → "no
     clutter" and "sealed box" → "tightly sealed box" to match the lesson's current
     wording, and shortened the "power station" wall-socket subtitle to reuse the
     lesson's own word "engine". The 13 original content slides keep their diagrams,
     facts, and coverage untouched — only text and slide numbering changed.

     2026-08-05 reorder fix (same-day follow-up): the first divider/voice pass placed
     dividers in the DECK's own pre-existing narrative order, which visited lesson §6
     (the OpenAI-compatible endpoint) immediately after §3, before §4/§5 — invisible
     when slides had no section numbers, but a real defect once numbered divider
     slides make that order visible to the learner (divider sequence read 1,2,3,6,4,5).
     Fixed by moving the two §6 slides (divider + content) to after §5's slides, so
     dividers now run 1→2→3→4→5→6 in step with the lesson. No content, facts, or
     wording changed in this follow-up — pure slide reordering + pageno renumbering.
     Net: 13 slides → 19 slides (13 original + 6 dividers), now in lesson order. -->

This companion doc maps the 19-slide explainer deck (`site/static/decks/01-container-native.html`) to the Module 1 lesson (`site/docs/m1-container-native/lesson.md`). The deck teaches **concepts**, not commands — it turns each of the lesson's analogies into a hand-drawn whiteboard visual a learner walks through before opening the lab. The visual language follows the CourseSmith whiteboard style contract (`coursesmith/templates/deck/whiteboard-style-guide.md`): Patrick Hand cursive, `#1e1e1e` primary / `#757575` secondary strokes on white paper with the five semantic pastel fills (§1), the `#rough` wobble filter on shapes only, and the shared `#ah`/`#ahg` arrowhead markers. The arc moves vocabulary forward, in lesson order — the Docker-pricing shock → container-native as the open standard → what containers buy an AI stack → the Apple-Silicon GPU constraint and its fix → the 2026 declarative-vs-orchestration map → the Acme use case and the build ladder → the OpenAI-compatible endpoint as the universal contract that ties it together → hand-off to the lab. A divider slide marks the deck's entry into each lesson `##` section, **in the lesson's own 1→6 order** — the deck and the lesson now walk the same sequence, so the numbered dividers work as a real map a learner can use to jump to a section.

## Slide table

| # | Slide | Purpose | Visual | Takeaway |
|---|-------|---------|--------|----------|
| 1 | Container-Native GenAI (title) | Module framing: the open standard, not Docker, is the through-line | title sketch: one AI-labelled shipping container fans out to four runtime carriers (Colima, Rancher, OrbStack, Podman) | credit line: Gourav Shah · School of DevOps & AI |
| 2 | Five ideas carry the rest of the course | Preview the five concepts this module locks in before every later lab | numbered rows (circles 1–5) | concepts first — the lab then proves the container-to-native-model wiring with your own hands |
| 3 | **1 · Container-Native, Not Docker-Native** | — (divider) | — (divider) | opens lesson §1 — the Docker-pricing shock and the shipping-container analogy |
| 4 | The assumption that just broke | Docker Desktop's licensing change (250 staff / $10M revenue) broke "container = Docker", not the standard underneath | crossed-out-old ("container = Docker Desktop") → boxed-new ("container = the open OCI standard"), pricing fact as a label on the arrow | the standard under Docker was always open — this module builds on that standard, not on any one vendor |
| 5 | Container-native, not Docker-native | The shipping-container analogy: one `compose.yaml` runs unmodified on four different runtimes | fan-out: `compose.yaml` box → 4 runtime boxes → converge to "same app, identical containers" | one file, four runtimes, same result — the carrier you pick is your business, not the course's |
| 6 | **2 · What Containers Buy an AI Stack** | — (divider) | — (divider) | opens lesson §2 — the four jobs a container does for every AI component |
| 7 | What containers buy an AI stack | Four concrete jobs a container does for every AI component: package, serve, isolate, ship | big-box anatomy: 4 side-by-side sealed boxes, each titled and with 3 detail lines | package, serve, isolate, ship — the four jobs a container does for every piece of your AI stack |
| 8 | **3 · The Apple Silicon GPU Reality** | — (divider) | — (divider) | opens lesson §3 — the GPU-passthrough constraint and its fix |
| 9 | Guest rooms with no power outlets | The Apple-Silicon GPU reality: Hypervisor.framework exposes no virtual GPU, so containerized models fall back to CPU (3–6× slower) | two-panel scene: "the building" (mains = Metal GPU) vs dashed "guest rooms" (containers, no outlet) → CPU-fallback box with the 3–6× fact as a label | the single most important practical lesson: get this wrong and every lab crawls — so don't fight it, wire around it |
| 10 | Native server, containerized everything else | The universal Mac pattern: Ollama runs natively on Metal; app, agent, and vector DB run in containers, bridged via `host.docker.internal:11434` | dashed host boundary containing a native Ollama box + a container-runtime boundary with 3 inner service boxes, arrow labelled with the bridge hostname | on Windows + WSL2 + NVIDIA the toolkit passes the GPU in, so the server *can* be containerized there |
| 11 | **4 · The 2026 Map: Declarative Agents vs Orchestration Frameworks** | — (divider) | — (divider) | opens lesson §4 — the declarative-vs-orchestration signpost for M6/M7 |
| 12 | The 2026 map: declarative vs orchestration | Two ways to build an agent; start with the light one, add the heavy one only when the task demands hard sequencing | two-panel comparison: declarative-agents box vs orchestration box, arrow between labelled "add only when needed" | the rule: start declarative; add orchestration only when the task has hard sequencing you can't express in tools |
| 13 | Anatomy of a declarative agent | Four plain-file parts fully define an agent, no framework code required | big-box anatomy: outer "declarative agent" box with 4 inner boxes (identity files, SKILL.md, MCP tools, guardrails) | identity, skills, tools, guardrails — all in files you can read, diff, and version like any other code |
| 14 | **5 · The Acme Use Case + The Build Ladder** | — (divider) | — (divider) | opens lesson §5 — the running case study and the whole-course roadmap |
| 15 | Meet Acme, two connected tools | Introduce the running case study: Day-1 Docs Assistant feeds Day-2 Support Agent → Incident Crew | pipeline: runbooks box → Day-1 Docs Assistant box → "used as a tool" → Day-2 Support Agent/Incident Crew box | Use Case B *uses* Use Case A as one of its tools — skills compound instead of tangling |
| 16 | The build ladder, one step per module | Every module adds exactly one rung to the same growing `compose.yaml`, from M1's bare model call to the Capstone | staircase/ladder: 7 rising steps (M1–M7) + a tall M8/Capstone column, day-1/day-2 span labels beneath | Module 1 is step 0: a runtime and a model responding to a call — you hand-author every block from here |
| 17 | **6 · The OpenAI-Compatible Endpoint: the Universal Contract** | — (divider) | — (divider) | opens lesson §6 — the endpoint pattern that ties every earlier idea together |
| 18 | One universal contract: the OpenAI-compatible endpoint | The wall-socket analogy: Ollama, vLLM, and llama.cpp all expose `/v1/chat/completions`; the app code never changes | fan-out: 3 engine boxes → one socket box labelled with the endpoint path → "your app/agent, code never changes" | the same request runs against Ollama on a laptop, vLLM on a GPU VM, or OpenAI — every lab speaks this language |
| 19 | Build it once. Run it anywhere. (closing) | Hand off to the lab: the learner will prove the container→native-model wiring themselves | scene: dashed "throwaway container" box ↔ solid "Ollama, native · Metal GPU" box, bidirectional arrows labelled with the bridge host and "a real response back" | in the lab you'll prove this wiring yourself — container calls native model, and it answers; credit + lab hand-off |

<!-- Visual pattern vocabulary used above (reuse before inventing):
     fan-out (5, 18) · two-panel comparison (9, 12) · big-box anatomy (7, 13) ·
     numbered rows (2) · pipeline (15) · staircase/ladder (16) ·
     crossed-out-old → boxed-new (4) · scene/hand-off (19) · title-only divider (3, 6, 8, 11, 14, 17) -->

## Divider placement — decision + rationale (2026-08-05, reorder-fixed)

Six dividers, one per numbered lesson `##` section, each placed immediately before that
section's first content slide, **in the lesson's own 1→6 order**:

- **§1** (divider, slide 3) before slide 4 — "Container-Native, Not Docker-Native".
- **§2** (divider, slide 6) before slide 7 — "What Containers Buy an AI Stack".
- **§3** (divider, slide 8) before slide 9 — "The Apple Silicon GPU Reality".
- **§4** (divider, slide 11) before slide 12 — "The 2026 Map: Declarative Agents vs
  Orchestration Frameworks".
- **§5** (divider, slide 14) before slide 15 — "The Acme Use Case + The Build Ladder".
- **§6** (divider, slide 17) before slide 18 — "The OpenAI-Compatible Endpoint: the
  Universal Contract". (An earlier pass placed this divider right after §3, matching the
  deck's pre-existing narrative order rather than the lesson's numeric order — out-of-sequence
  divider numbers, invisible before dividers existed, became a real defect once they were
  numbered. Fixed same-day: the endpoint content now closes out the section walk, right
  before the hand-off to the lab, matching the lesson exactly.)

**No divider for "Summary."** The lesson's closing `## Summary` section is a recap table with
no new concept of its own — every fact in it is already covered by the six sections above and
their divider+content slides. The deck's own closing slide (19, "Build it once. Run it
anywhere.", kicker "TO THE LAB") already performs the hand-off role a Summary divider would
announce — the documented skip exception in style-guide §3a. This is a deliberate, documented
skip, not a silent omission.

**No divider for the module-goal lead-in either.** The lesson's opening blockquote ("Module
goal: …") is not a numbered `##` section. Slide 2 ("Five ideas carry the rest of the course")
already serves as the deck's own preview/overview slide for that lead-in without needing a
matching divider.

## Recommended presentation order

Present strictly 1 → 19; each slide's vocabulary is used by the next, and the deck now walks
the lesson's own arc start to finish. Open on the title sketch (1) and the five-idea preview
(2) to set expectations. Divider 3 ("1 · Container-Native, Not Docker-Native") announces the
motivating shock: slide 4 (the Docker pricing change) is the conceptual hinge that makes
"container-native" a *claim worth making* rather than a rebrand — linger on it and be explicit
that this is a pricing change, not a technical one. Slides 4–5 are one continuous build-up on
the open-standard idea. Divider 6 ("2 · What Containers Buy an AI Stack") opens the four-jobs
anatomy slide (7). Divider 8 ("3 · The Apple Silicon GPU Reality") opens the second and
arguably most consequential hinge in the whole module: slide 9's guest-room analogy is the one
fact that, if missed, makes every later lab feel broken — slow down, use the analogy fully,
and don't rush to slide 10's fix. Slides 9–10 are a matched pair (problem → fix); present them
back to back. Dividers 11/14 and slides 12–13 (declarative vs orchestration) and 15–16 (Acme,
build ladder) are signpost pairs for M6/M7 and the whole-course roadmap — lighter touch,
compress under time pressure if needed, but never compress 4, 9, or 10. Divider 17 ("6 · The
OpenAI-Compatible Endpoint") closes the section walk by generalizing the native-server fix
(slide 10) into the contract that recurs all course long — call forward explicitly ("every lab
from here speaks this language") before landing on slide 18. Slide 19 hands off to the lab —
say the closing line and stop talking; let the lab do the proving.

## Fragment map

This deck carries no build-ups from the original 303 authoring — every slide (including the
multi-box slides: 4, 5, 7, 9, 10, 12, 13, 15, 16, 18) is presented as a single static,
already-complete picture, and the six divider slides (3, 6, 8, 11, 14, 17) are title-only with
nothing to fragment. This matches the old deck's own construction (no `fragment` classes
existed in the CDN-era HTML) and suits the content: slides 4–5 and 9–10 are comparison/contract
pairs that read better whole, and 7/12/13/15/16/18 are anatomy/comparison/pipeline layouts
intended to be read at a glance rather than revealed hop-by-hop. No fragments were added in
this pass — a future revision could fragment slide 10 (native box → bridge arrow → container
box) or slide 16 (ladder rising one step at a time) if a presenter wants a build, but the
current spec keeps parity with the approved baseline.

Static slides (all of 1–19): read in full on entry — no reveal-in-steps behavior in this deck.

## Coverage check (HARD GATE — §0)

Every lesson section/concept maps to a slide, plus its own divider. Baseline = the prior 13-slide
deck; confirming no orphans against both the lesson and the prior deck.

| Lesson section / concept | Slide(s) | Notes (analogy used, echoes/forward pointers) |
|---|---|---|
| Module framing / five things you'll learn | 1, 2 | title scene (shipping container → 4 runtimes) + numbered-rows preview of all five ideas |
| §1 Container-Native, Not Docker-Native — the Docker Desktop pricing change | 3 (divider), 4 | crossed-out-old → boxed-new; the $10M/250-staff fact is a label ON the diagram |
| §1 The shipping-container analogy; OCI + Compose Spec run on 4 runtimes | 5 | fan-out: one `compose.yaml` → Colima/OrbStack/Rancher/Podman → identical containers |
| §2 What Containers Buy an AI Stack — package / serve / isolate / ship | 6 (divider), 7 | big-box anatomy, 4 sealed boxes; subtitle now the short phrase "package, serve, isolate, ship" (voice-pass dropped "hermetically sealed" — lesson now says "tightly sealed"; the SVG's "sealed box" label was strengthened to "tightly sealed box" to match) |
| §3 The Apple Silicon GPU Reality — Hypervisor.framework, no virtual GPU, 3–6× CPU slowdown | 8 (divider), 9 | guest-rooms-with-no-outlets analogy; the 3–6× fact lives in the SVG label |
| §3 The universal Mac pattern — native Ollama + containerized app/agent/vectorDB, `host.docker.internal:11434` | 10 | host-boundary + container-boundary two-region diagram; bridge hostname as an SVG label |
| §3 Windows + WSL2 + NVIDIA exception (GPU passthrough) | 10 | carried as the slide's Takeaway (presenter narration), not re-diagrammed |
| §4 The 2026 map: declarative agents (M6) vs orchestration frameworks (M7) | 11 (divider), 12 | two-panel comparison with "add only when needed" rule between |
| §4 Anatomy of a declarative agent — AGENTS.md/SOUL.md, SKILL.md, MCP tools, guardrails | 13 | big-box anatomy, 4 inner boxes |
| §5 The Acme use case — Docs Assistant (Day 1) used as a tool by the Support Agent → Incident Crew (Day 2) | 14 (divider), 15 | pipeline: runbooks → Docs Assistant → "used as a tool" → Support Agent/Incident Crew |
| §5 The build ladder — one `compose.yaml` service per module, M1 → Capstone | 16 | staircase/ladder, 7 steps + tall Capstone column, Day 1 / Day 2 span labels |
| §6 The OpenAI-compatible endpoint — wall-socket analogy, `/v1/chat/completions` | 17 (divider), 18 | fan-out: 3 engines → 1 socket → unchanging app code; subtitle now reuses the lesson's own word "engine" ("same socket, swap the engine behind it") instead of "power station" |
| Summary (no new concept beyond §1–§6, above) | — | no divider — see "Divider placement" note; the closing slide (19) already carries the hand-off role |
| Closing hand-off — the lab proves container ↔ native-model wiring | 19 | scene: dashed throwaway container ↔ solid native Ollama box, bidirectional bridge arrows |

**No orphans.** All 13 prior content slides, all six lesson `##` sections (each now with its own
divider, in lesson order), and the closing hand-off are covered above with an explicit slide
mapping. Slide count grew from 13 to 19 (13 original content/title/closing slides + 6 new
dividers, per style-guide §3a — a divider is a real slide, numbered into the same `.pageno`
sequence). No concept was dropped, re-taught, or re-diagrammed; only text (titles kept,
subtitles rewritten to the ≤10-word/≤60-char anchoring-phrase target, on-slide labels
voice-passed) and slide numbering/order changed.

## Subtitle audit (before → after, voice pass)

| # | Slide | Old subtitle (chars/words) | New subtitle (chars/words) |
|---|-------|------------------------------|-------------------------------|
| 1 | Container-Native GenAI (title) | "Why the open standard — not Docker — is the through-line for AI" (63/13) | "The open standard, not Docker" (29/5) |
| 2 | Five ideas carry the rest of the course | "Five ideas that shape every lab in the rest of the course." (58/12) | "Five ideas that carry the course" (32/6) |
| 4 | The assumption that just broke | "Docker Desktop is now paid for orgs over 250 staff or $10M revenue." (67/13) | "A pricing change, not a technical one" (37/7) |
| 5 | Container-native, not Docker-native | "An OCI image is a shipping container — the carrier is your business." (68/13) | "One compose.yaml, four runtimes, same result" (44/6) |
| 7 | What containers buy an AI stack | "Think of each component as a hermetically sealed shipment." (58/9) | "Package, serve, isolate, ship" (29/4) |
| 9 | Guest rooms with no power outlets | "macOS containers are like guest rooms with no power outlets." (60/10) | "No virtual GPU on macOS" (23/5) |
| 10 | Native server, containerized everything else | "Serve the model natively; containerize the app, agent, and vector DB." (69/11) | "Bridged via host.docker.internal" (32/3) |
| 12 | The 2026 map: declarative vs orchestration | "Two ways to build an agent — start light, add weight only when needed." (70/14) | "Start declarative, add orchestration when needed" (48/6) |
| 13 | Anatomy of a declarative agent | "Four plain parts define an agent — no framework code required." (62/11) | "Identity, skills, tools, guardrails" (35/4) |
| 15 | Meet Acme, two connected tools | "One fictional company, runbooks nobody reads, two connected AI tools." (69/10) | "Runbooks nobody reads, two connected tools" (42/6) |
| 16 | The build ladder, one step per module | "Every module adds exactly one rung to the same growing compose.yaml." (68/11) | "One module, one rung, one compose.yaml" (38/6) |
| 18 | One universal contract: the OpenAI-compatible endpoint | "The API is a wall socket: swap the power station, appliance never notices." (74/13) | "Same socket, swap the engine behind it" (38/7) |
| 19 | Build it once. Run it anywhere. (closing) | "In the lab you'll prove this wiring yourself, hands on." (55/10) | "Prove the wiring yourself, hands on" (35/6) |

Every old subtitle was over the new 60-char / 10-word target (all were legal under the prior
≤80-char rule, which is exactly why this pass was needed — they squeaked under the old ceiling
instead of being written as short phrases); every new subtitle is a short anchoring phrase, not
a sentence, and every one lands well under the 60/10 target (max 48 chars / 7 words on this
deck). Titles 4 and 18 also picked up two small title-adjacent fixes for voice/lesson-consistency
during this pass: two-word titles ("Meet Acme — two connected tools" and "The build ladder — one
step per module") had their em dashes swapped for commas per the gourav-voice pass (em-dash
drama is a flagged AI-tell); the wall-socket subtitle switched from "power station" to "engine"
to match the lesson's own repeated word for the swappable inference backend.
