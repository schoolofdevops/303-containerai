# Module 2 — Serving Local Models · Explainer Deck Sequence

<!-- CourseSmith sequence spec — authored and approved BEFORE the deck HTML is built.
     Convention: whiteboard-style-guide.md §5. One row per slide; every slide needs
     purpose + visual + takeaway. NO slide-count cap (§0): one idea per slide, every
     lesson concept gets a slide — the coverage table below is a hard gate.

     UPDATED 2026-08-05 (round-3 divider regen, coursesmith deck-author contract):
     regenerated against the current whiteboard-style-guide.md §0/§3a and the
     VOICE-PASSED site/docs/m2-serving/lesson.md. Added one section-divider slide
     per lesson `##` header (12 → 17 slides), tightened every p.s subtitle to the
     new ≤10-word/≤60-char short-phrase rule, and reordered ONE content slide to
     keep divider numbering lesson-order-clean (see "Divider ordering decision"
     below). All facts/diagrams kept 1:1 with the prior deck — no re-teaching, no
     dropped coverage. -->

This companion doc maps the 17-slide explainer deck (`site/static/decks/02-serving.html`) to the
Module 2 lesson (`site/docs/m2-serving/lesson.md`). The deck teaches **concepts**, not commands — it
turns the lesson's espresso-machine and wall-socket analogies, plus the JPEG/GGUF analogy, into
hand-drawn whiteboard visuals a learner walks through before opening the lab. The visual language
follows the CourseSmith whiteboard style contract (`templates/deck/whiteboard-style-guide.md`):
Patrick Hand cursive, `#1e1e1e` primary / `#757575` secondary strokes on white paper with the five
semantic pastel fills (§1: green good · red bad/full · blue data · orange caution · purple meta), the
`#rough` wobble filter on shapes only, and the shared `#ah`/`#ahg` arrowhead markers. The arc moves
vocabulary forward — **many engines, one contract → pick an engine → size a model → wire the app two
ways**, now walked section-by-section behind five numbered dividers that mirror the lesson's `##`
headers verbatim.

## Divider ordering decision (read this before the slide table)

The lesson's five `##` sections, in lesson.md order, are:

1. Demo First: Docker Model Runner
2. The Open Engines: Ollama, llama.cpp, LocalAI
3. The OpenAI-Compatible Endpoint: The Universal Contract
4. GGUF and Model Selection for Laptops
5. Two Wiring Patterns, One App

Mapping the OLD 12-slide deck's content slides onto these sections (in the old deck's own
presentation order) showed one out-of-order slide: old slide 3, **"The problem: every engine
speaks differently?"**, sat *before* old slide 4 (§1 Docker Model Runner demo) — but slide 3's
content (the pain of one custom SDK per engine) is actually the motivator for **§3** (the
OpenAI-compatible contract), not for §1. Left in place, a strict "insert divider immediately
before its section's first content slide, dividers numbered 1→5 in lesson order" pass would have
put "the problem" content between the title/framing slides and Divider 1, disconnected from the
§3 payoff it sets up 6 slides later — exactly the kind of drift the divider-order check exists to
catch.

**Decision: reordered.** This was a clean single-slide move (option (i) in the regen brief — no
matched problem→fix pair or build-up depended on slide 3's old position; nothing else referenced
it), so "The problem…" now sits as the *first* content slide inside **Divider 3** (§3, The
OpenAI-Compatible Endpoint), immediately before "The universal contract: the /v1 endpoint" — problem,
then the fix, back to back, which reads better than before. No other content slide needed
reordering. Dividers are numbered 1–5 in strict lesson order and appear in that exact order in the
final HTML (verified — see gates below). No out-of-order dividers shipped.

## Slide table

| # | Slide | Purpose | Visual | Takeaway |
|---|-------|---------|--------|----------|
| 1 | Serving Local Models (title) | Module framing: several engines, one socket, one app plugs in | Title sketch: fan-out (3 engine boxes → `/v1` socket → app box) | credit line: Gourav Shah · School of DevOps & AI · Hands-on |
| 2 | What you'll learn | Module framing: the five things this deck + lab lock in | Numbered rows (5 circles) | One app, many backends — the serving engine becomes a deployment choice, never a code change |
| 3 | **DIVIDER 1 · Demo First: Docker Model Runner** | Opens lesson §1 | — (divider) | Presenter: "First, the one-command path." |
| 4 | The quick demo: Docker Model Runner | Docker's built-in one-command server, and why the course goes further | Pipeline: command box → arrow → 3-step result stack | Slickest on-ramp inside Docker — but this course goes runtime-agnostic so patterns run anywhere |
| 5 | **DIVIDER 2 · The Open Engines: Ollama, llama.cpp, LocalAI** | Opens lesson §2 | — (divider) | Presenter: "Now the real engines you'll actually wire up." |
| 6 | Open engines: different machines, same cup | The espresso analogy — engines differ inside, all pour into one API | Scene: 3 machines fan into one cup | Swap the machine under the counter — no barista, and no app, needs retraining |
| 7 | Which engine, when | Match Ollama / llama.cpp / LocalAI to their best-fit job | Big-box anatomy: 3-row comparison table | For development, Ollama is the standard; M3 adds vLLM for high-throughput GPU serving |
| 8 | **DIVIDER 3 · The OpenAI-Compatible Endpoint: The Universal Contract** | Opens lesson §3 | — (divider) | Presenter: "Here's the idea that makes the rest of the course click." |
| 9 | The problem: every engine speaks differently? *(moved from old #3 — see ordering decision above)* | Motivate the contract by showing the pain it removes | Fan-out, dashed/tangled: app → 3 engines, each with its own SDK/URL | Three custom integrations is three ways to break — the fix is one shared contract |
| 10 | The universal contract: the /v1 endpoint | The wall-socket analogy — the contract itself, made concrete | Fan-out: 3 engines → socket → app plug | Two endpoints — chat/completions and models. The app talks to the contract, not the engine |
| 11 | Swap engines by changing one variable | `OPENAI_BASE_URL` is the single switch across dev/staging/prod | Fan-out: one variable box → 3 environment boxes | Move a 2B dev model to a 13B production model — the application does not notice |
| 12 | **DIVIDER 4 · GGUF and Model Selection for Laptops** | Opens lesson §4 | — (divider) | Presenter: "Now let's size a model to your machine." |
| 13 | GGUF: the JPEG of model weights | The quantization analogy — compact format that fits laptop RAM | Pipeline: big RAW box → quantize arrow → small GGUF box → rule box | Ollama pulls GGUF, not float16 — so laptop CPU and Metal run it without CUDA |
| 14 | Picking a model for a 16 GB laptop | Concrete model-size table sized to the reference laptop | Big-box anatomy: 5-row model/size/use table | Stay on qwen3.5:2b for every lab; gpt-oss 20B is demo-only |
| 15 | **DIVIDER 5 · Two Wiring Patterns, One App** | Opens lesson §5 | — (divider) | Presenter: "Last idea: how the app actually reaches the model." |
| 16 | Two wiring patterns, one app | Mac-native vs GPU-host-container wiring, same app code | Two-panel comparison: Pattern A (dashed boundary) vs Pattern B (dashed boundary) | Build once on your laptop; the same image drops onto a Linux GPU VM with one config change |
| 17 | The engine is a deployment choice, not a code choice (closing) | Big-idea recap + hand-off to the lab | Closing sketch: fan-out (engine/hardware → contract socket → app, "plugged in once") | credit + lab hand-off: continue to the Serving lab |

<!-- Visual pattern vocabulary (reuse before inventing):
     fan-out · two-panel comparison · big-box anatomy · numbered rows ·
     pipeline with hop-by-hop fragments · hub-and-spoke · staircase/ladder ·
     crossed-out-old → boxed-new -->

## Subtitle table (rewritten to ≤10 words / ≤60 chars, per style-guide §0)

| # | Slide | Subtitle | Chars | Words |
|---|-------|----------|-------|-------|
| 1 | Serving Local Models (title) | Open engines behind one universal endpoint | 42 | 6 |
| 2 | What you'll learn | Five ideas that make model serving portable and boring. | 55 | 9 |
| 4 | The quick demo: Docker Model Runner | One command, but locked to Docker's toolchain. | 46 | 7 |
| 6 | Open engines: different machines, same cup | Different machines, same standard cup. | 38 | 5 |
| 7 | Which engine, when | Match the engine to the job. | 28 | 6 |
| 9 | The problem: every engine speaks differently? | Three engines, three ways to break. | 35 | 6 |
| 10 | The universal contract: the /v1 endpoint | Swap what's behind the socket, not the plug. | 44 | 8 |
| 11 | Swap engines by changing one variable | One variable, not a code change. | 32 | 6 |
| 13 | GGUF: the JPEG of model weights | RAW is huge, JPEG loads instantly. | 34 | 6 |
| 14 | Picking a model for a 16 GB laptop | Small models for the labs, big ones for later. | 46 | 9 |
| 16 | Two wiring patterns, one app | Same app code, one variable changes. | 36 | 6 |
| 17 | The engine is a deployment choice, not a code choice (closing) | Next: containerize a client that speaks this contract. | 54 | 8 |

Divider slides (3, 5, 8, 12, 15) carry no subtitle by contract (§3a).

## Recommended presentation order

Present strictly 1 → 17; each slide's vocabulary is used by the next. Open on slide 1 as pure
orientation — don't linger. Slide 2 is a fast warm-up: state the five objectives, then step into
**Divider 1**, which tells the learner exactly which lesson section they're entering. Slide 4
(Docker Model Runner) is a one-breath aside — it exists so learners who already know Docker aren't
surprised it's not the course's path; do not let it become the main event. **Divider 2 → slides 6–7
→ Divider 3 → slides 9–11 are the conceptual spine and deserve the most air**: slide 6 (espresso
analogy) is the hinge worth lingering on — once the cup lands, slide 7 (engine picker) moves
quickly because the mental model is already installed. Divider 3 hands off cleanly into slide 9
(the pain point, freshly relevant since it now sits right before the fix) and slide 10 (the wall
socket) — read those two back to back, they are a matched problem→solution pair. Slide 11 (one
variable) closes that arc. **Divider 4 → slide 13** (GGUF/JPEG) is a second hinge — a fresh analogy,
give it its own breath before sliding into slide 14 (model table, read quickly, it's reference
material learners will revisit from the page). **Divider 5 → slide 16–17** close the loop: 16 is
the payoff made concrete (two patterns, one app), 17 is the big-idea restatement — say the title
line aloud, then hand off to the lab. Under time pressure, compress slides 4 and 14 (they're
reference, not conceptual); never compress 6, 10, or 13 — those are the three analogies the rest of
the course depends on. Dividers themselves take seconds each — they are navigation, not content.

## Fragment map

This deck ships with **no fragments** — every slide is a single static picture, and each slide
teaches one coherent idea in one view (fan-outs, tables, and two-panel comparisons read better
whole per style-guide §6). Divider slides are title-only by contract and carry no fragments either.
All 17 slides are static.

## Coverage check (HARD GATE — §0)

Every lesson section/concept maps to a slide, including its divider. Close the table with an
explicit "no orphans" statement.

| Lesson section / concept | Slide(s) | Notes (analogy used, echoes/forward pointers) |
|---|---|---|
| Module framing / objectives (unnumbered lead-in — no dedicated `##` section beyond the module-goal blockquote) | 1, 2 | Title fan-out previews the whole arc; slide 2 is the five-objective numbered list from the lesson's module goal. No divider needed — this is not a numbered lesson `##` section, per style-guide §3a's intro-divider rule (which only applies when the lesson HAS an unnumbered lead-in section; M2's is a blockquote, not a section) |
| §1 Demo First: Docker Model Runner | 3 (divider), 4 | Divider opens the section; slide 4 is the one-command demo, positions the course's runtime-agnostic choice against it |
| §2 The Open Engines: Ollama, llama.cpp, LocalAI (table + espresso analogy) | 5 (divider), 6, 7 | 6 = espresso-machine analogy scene; 7 = the engine-fit table, same three engines |
| §3 The OpenAI-Compatible Endpoint: The Universal Contract (wall-socket analogy, two endpoints, motivating "problem" slide, `OPENAI_BASE_URL` swap) | 8 (divider), 9, 10, 11 | 9 = the problem/motivation (moved here from old position — see ordering decision); 10 = wall-socket scene carrying the `/v1` socket image + "two endpoints" fact as SVG labels; 11 = fan-out from one variable to three named environments, each environment's hostname kept as an SVG label |
| §4 GGUF and Model Selection for Laptops (quantization, JPEG analogy, sizing rule, model table) | 12 (divider), 13, 14 | 13 = pipeline RAW → quantize → GGUF, sizing rule boxed alongside; 14 = big-box table ported verbatim (model / size / course use) |
| §5 Two Wiring Patterns, One App (Mac native vs GPU-host container) | 15 (divider), 16 | Two-panel comparison, each pattern's env var + hostname kept as SVG labels |
| Big idea / summary / hand-off to lab | 17 | Closing fan-out restates "deployment choice, not code choice"; credit line hands off to the Serving lab |

**No orphans.** Every numbered `##` section of `site/docs/m2-serving/lesson.md` (Docker Model
Runner, the three open engines + espresso analogy, the OpenAI-compatible universal-contract
wall-socket analogy plus its two endpoints and the `OPENAI_BASE_URL` swap, GGUF/quantization plus
the JPEG analogy and sizing rule and the model-selection table, and the two wiring patterns) has
both a divider and a content slide. No slide lacks a lesson anchor. The 12 content-bearing slides
of the prior deck map 1:1 onto this deck (one moved position, none dropped, none re-taught); 5
divider slides were added, for 17 slides total (12 original + 5 dividers).

## Update 2026-08-14 — narration, rough-filter fix, illustration pass

- **Narration:** `planning/narration/02-narration.md` (new) — 6 videos via `lesson-to-video-narration`
  + `gourav-voice`, 5-gram retell overlap vs the lesson measured at 7.8% overall (hard gate <10%).
  Video-to-slide mapping: Video 1 (intro) → slides 1-2, Video 2 (engines) → slides 3-7 (dividers
  1-2 + content), Video 3 (contract) → slides 8-11 (divider 3 + content), Video 4 (GGUF/sizing) →
  slides 12-14 (divider 4 + content), Video 5 (wiring patterns) → slides 15-16 (divider 5 + content),
  Video 6 (summary) → slide 17 (closing).
- **Rough-filter bug fixed:** the deck's single `<filter id="rough">` used the default
  `objectBoundingBox` region (`x="-5%" y="-5%" width="110%" height="110%"`), which makes any
  perfectly axis-aligned line/rect in that filter group invisible. Changed to
  `filterUnits="userSpaceOnUse" x="-80" y="-80" width="1300" height="600"` (covers this deck's
  largest viewBox, 1100×400, with margin).
- **Illustration pass:** added a Magnific pencil-sketch scene image to all 5 divider slides only
  (M2·03, M2·05, M2·08, M2·12, M2·15) — scoped decision: the title slide and the three
  "analogy" content slides (M2·06 open-engines/cup, M2·10 universal-contract/socket, M2·13
  GGUF/JPEG) already carry hand-drawn diagrams with load-bearing text labels (engine names,
  endpoint paths, the sizing formula); an AI photo illustration cannot carry readable text, so
  replacing those would drop facts. Dividers carry only a title and had no such content to lose.
  Added `.reveal .slides section.divider svg{ order:1 }` / `h2.t{ order:2; font-size:1.1em;
  max-width:76% }` CSS (didn't exist before — dividers were title-only) and bumped the autofit
  ceiling to 80% for dividers. Images live at `site/static/img/decks/02-serving/*.jpg`
  (white-level corrected, external file refs, no base64). Verify gate: zero external refs, tags
  balanced (17 open/17 close), `display:'flex'` present, DOCTYPE at position 0. Rendered divider 1
  via headless Chrome to confirm layout.
