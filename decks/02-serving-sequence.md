# Module 2 — Serving Local Models · Explainer Deck Sequence

This deck teaches the *concepts* behind Module 2 (Day 1): the landscape of open model-serving engines, the OpenAI-compatible `/v1` API as the universal contract, GGUF quantization and laptop-scale model selection, and the two wiring patterns (model-native on Mac vs model-in-container on GPU hosts). It deliberately teaches the *why* and *when* — the lab covers the *how* (copy-runnable commands). It matches the `00-introduction.html` reveal.js template exactly: black-and-white hand-drawn style, `#rough` wobble filter on shape groups only, shared arrowhead markers, and the same head/defs/script. Twelve slides move from a motivating problem, through the Docker Model Runner demo, into the open engines and the endpoint contract, and close on the module's big idea.

## Slide table

| # | Slide | Concept | Source | Visual pattern |
|---|-------|---------|--------|----------------|
| 1 | Serving Local Models (Title) | Module framing: engines behind one endpoint | Module goal / §3 | Hub+spokes: 3 engines → socket → app (visual anchor) |
| 2 | What you'll learn | Five module objectives | §1–§5 | Numbered rows (circles 1–5) |
| 3 | The problem: every engine speaks differently? | Motivating problem — no shared contract means custom glue | §3 (framed as absence) | Two-panel "before": app tangled to 3 engines via dashed custom lines |
| 4 | The quick demo: Docker Model Runner | `docker model run` as slick on-ramp, then pivot away | §1 | Box → arrow → 3-outcome pipeline |
| 5 | Open engines: different machines, same cup | Espresso-machine analogy for Ollama / llama.cpp / LocalAI | §2 analogy | Hub+spokes: 3 machines → one standard cup (OpenAI API) |
| 6 | Which engine, when | Engine selection matrix | §2 table | File/table anatomy: 3 rows, best-for + notes |
| 7 | The universal contract: the /v1 endpoint | Wall-socket analogy; two-endpoint contract | §3 analogy | Hub+spokes: engines → socket → app plug |
| 8 | Swap engines by changing one variable | `OPENAI_BASE_URL` differs by env, not code | §3 env-var example | Hub+spokes: one variable → dev/staging/prod boxes |
| 9 | GGUF: the JPEG of model weights | Quantization analogy + sizing rule | §4 analogy | Pipeline: RAW → quantize → GGUF, plus rule box |
| 10 | Picking a model for a 16 GB laptop | Model selection at laptop budget | §4 table | File/table anatomy: model · size · course use |
| 11 | Two wiring patterns, one app | Pattern A (Mac native) vs Pattern B (container GPU) | §5 | Two-panel comparison, dashed host boundaries |
| 12 | The engine is a deployment choice, not a code choice | Closing big idea + lab lead-in | §5 / Summary | Big-idea closing: any engine → /v1 → app plugged in once |

## Recommended presentation order

Present in file order (1 → 12). The arc is deliberate: open on the visual anchor (title), set expectations (objectives), then create tension with the motivating problem (slide 3) before offering the Docker Model Runner demo as the obvious-but-limited first answer (slide 4). Slides 5–8 build the core resolution in two beats — the engines themselves via the espresso analogy (5–6), then the contract that unifies them via the wall-socket analogy (7–8). Slides 9–10 handle the practical laptop constraint (GGUF + model sizing) so learners can pick a model with confidence. Slide 11 lands the operational payoff (the two wiring patterns), and slide 12 compresses the whole module into one line before handing off to the lab. If time is short, slides 3, 6, and 10 can be summarized verbally without breaking the arc; slides 5, 7, and 11 carry the load-bearing analogies and should never be cut.

## Gemini image briefs

**Brief A — Espresso machines, one cup (supports slide 5).**
A clean black-and-white hand-drawn whiteboard illustration in a loose felt-tip sketch style on white paper. Three distinctly different espresso machines are lined up left to right — a tall boiler-style machine, a compact thermoblock machine, and a wide multi-group commercial machine — each drawn with slightly wobbly confident outlines and no color or shading fills. From each machine a thin arrow curves toward a single large standard coffee cup on the right, drawn in the same sketchy style with a small handle and a wisp of steam. Hand-letter tiny labels "Ollama," "llama.cpp," and "LocalAI" under the machines and "OpenAI API — the same cup" under the cup. Keep it minimal, generous white space, purely monochrome ink lines, no photorealism.

**Brief B — Wall socket with swappable power stations (supports slide 7).**
A minimalist black-and-white hand-drawn sketch on white paper. On the right, a single wall power socket drawn as a rounded square face with two round pin holes and a small ground slot below, outlined in a confident wobbly felt-tip line. A short cord and plug enter from the far right into a simple box labeled "your app — code never changes." On the left, three small labeled boxes — "Ollama," "vLLM," "LocalAI" — each connected by a thin sketchy wire that all converge behind the socket, suggesting the power source can be swapped without the socket changing. Add a tiny hand-lettered caption "/v1 endpoint" above the socket. Strictly monochrome, no fills, no color, lots of white space, whiteboard-marker aesthetic.

**Brief C — RAW-to-JPEG compression for model weights (supports slide 9).**
A black-and-white hand-drawn conceptual sketch on white paper illustrating compression. On the left, a large rectangle labeled "float16 RAW — perfect but huge," drawn densely with many tiny hatch marks to suggest heaviness. A bold arrow labeled "quantize · Q4" points right to a much smaller rectangle labeled "GGUF — compact + fast," drawn sparse and light. Beneath, hand-letter a small rule-of-thumb note: "params × 0.6 ≈ GB of RAM · 7B ≈ 4 GB." Keep everything in a single ink color on white, sketchy wobbly outlines, no shading beyond the hatch texture, no color, generous margins, clean whiteboard-explainer feel.

## Coverage check

Every Module 2 concept maps to at least one slide:

- **Docker Model Runner (§1)** → slide 4 (demo + pivot to runtime-agnostic).
- **Runtime-agnostic framing (§1)** → slides 4, 5, 12.
- **Open engines: Ollama / llama.cpp / LocalAI (§2)** → slides 5 (analogy) and 6 (selection matrix).
- **Espresso-machine analogy (§2)** → slide 5.
- **vLLM as the coming fourth engine (§2)** → mentioned on slide 6 takeaway and appears on slide 7 socket.
- **OpenAI-compatible `/v1` contract; two endpoints (§3)** → slide 7.
- **Wall-socket analogy (§3)** → slide 7 (and the title anchor, slide 1).
- **`OPENAI_BASE_URL` env-var swap; dev/staging/prod (§3)** → slide 8.
- **Motivating "why a contract at all" (§3, inverted)** → slide 3.
- **GGUF + quantization; JPEG analogy; sizing rule (§4)** → slide 9.
- **Model selection table for laptops (§4)** → slide 10 (with gpt-oss 20B flagged demo-only).
- **Two wiring patterns A/B; `host.docker.internal` vs Compose hostname (§5)** → slide 11.
- **Portability payoff / build-once-run-anywhere (§5, Summary)** → slides 8, 11, 12.
- **Lab lead-in ("containerize a client that speaks this contract")** → slide 12.

No source concept is unrepresented; slides 3 and 12 are the only additions beyond a strict 1:1 mapping, added for narrative tension and closure per the template's pattern.
