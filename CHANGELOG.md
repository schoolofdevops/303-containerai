# Changelog

All notable changes to this course build are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project uses [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.9.0] - 2026-10-21

### Added

- Module 2 section 6, "Reasoning Models and the Universal Contract", plus a matching quiz question.
- Module 6 paragraph on the MCP 2026-07-28 stateless transport, plus a matching quiz question.
- `scripts/assert-model-refs.sh`, a gate that fails when a retired model name creeps back into the course.
- Think-off checks in the M1 and M2 labs, so a call that forgets to switch thinking off now fails. The M1 container-to-host check now requires a non-empty `response` value.

### Changed

- Default model is now `qwen3.5:2b` (3.1 GB), replacing `qwen2.5:1.5b`. The optional larger model is `qwen3:4b`, replacing `qwen2.5:3b`. It is not a drop-in swap: the build we tested ignores `think:false` and prints its reasoning inline, and the M1, M2, M6 and M7 pages now say so.
- Ollama 0.40 is the new floor. On Apple Silicon the model runs on the MLX runner.
- Thinking is switched off on every model call: `think:false` on the native API, `reasoning_effort:"none"` on `/v1`, and `reasoning=False` in LangChain.
- Chroma moves to 1.5.9 with the `/api/v2` routes in M5, M6, M7 and the capstone.
- The Chroma volume now mounts at `/data`, where Chroma 1.x keeps its database, in M5, M6, M7 and the capstone. Persistence across `docker compose down` and `up` was re-checked on M6.
- M5 Python pins: `langchain` 0.3.30, `langchain-chroma` 0.2.6, `langchain-ollama` 0.3.10, `langchain-community` 0.3.31 and `requests` 2.32.5.
- ToolHive moves to v0.55.2.
- M4 claims about Docker Model Runner versus ModelPack are corrected: it runs on Docker CE, and the difference is scope and governance, not licence.
- M7 Reviewer agent now receives the runbook passage, and deep-dive Variant B is rewritten to match.
- Memory figures re-measured on the new model; M7 now needs about 4 GB in total.
- Capstone Chroma healthcheck is now a bash `/dev/tcp` probe, because the 1.5.9 image has no Python.
- The prerequisites page now uses `qwen3.5:2b` and states the Ollama floor.
- Labs re-validated on Ollama 0.40.7, with evidence in `planning/lab-tests/`. M4 ran its checks only, and its evidence file is unchanged. Capstone Steps 5 (kit push to GHCR) and 7 (CI) were not run, because they need credentials and publish externally.

### Fixed

- Prerequisites bridge check now passes `think:false`, so the reply is not empty on a reasoning model.
- Concept deck 05 and its sequence spec now show the Chroma pin as 1.5.9.
- M7 no longer says Docker Model Runner is Docker Desktop-only. It is not available on Rancher Desktop, Colima or Podman, and the course standard is native Ollama.
- M7 deep-dive close now matches its Variant B result: without the gate the marker is stable but certifies the wrong runbook.
- M2 section 4 now explains that `qwen3.5:2b` on Apple Silicon is an MLX `mxfp8` safetensors build, which is why it is 3.1 GB on disk.

### Known gaps

- The concept decks and narration were not updated for the new M2 section 6 or the M6 MCP-2026 paragraph. A later deck-author pass will cover them.
- The Hermes bonus module is on hold.
- The M5 deep-dive deck (slide 14) shows the prompt-truncation case without naming the model; the page and narration scope it to the llama.cpp-served qwen3:4b.

## [1.8.0] - 2026-10-21

### Added

- Voiceover narration scripts (planning/narration/) for every module lesson and the four
  deep-dives, written in the spoken register with the retell-overlap gate enforced.
- One title-only divider slide per lesson section in all 10 module decks, so the deck follows
  the lesson's section order exactly (M1 pilot caught and fixed an out-of-order narrative).
- 49 hand-drawn pencil-sketch illustrations on title, divider and analogy slides across all
  15 decks (modules + deep-dives).

### Changed

- Every lesson paragraph passed through the course voice pass (simple English, analogy-first,
  jargon explained inline) across M1-M8, Capstone and the deep-dives.
- Deck subtitles tightened to one-line anchoring phrases (max 10 words / 60 chars).
- Per-deck sequence specs (planning/decks/) updated with narration mapping and illustration logs.
- Fork staging remote retired; origin is the only remote.

### Fixed

- Course-wide deck SVG "rough" filter bug: axis-aligned lines and rectangles were invisible
  under the default filter region. All decks now use an explicit user-space filter region.
- M5 divider heading size made consistent with the other decks.
- M7 lesson: one wrong "orchestrator" to "coordinator" substitution reverted.

## [1.7.0] - 2026-07-30

### Changed

- All 15 slide decks regenerated on the CourseSmith round-3 skeleton: anchored layout (title top,
  visual centered, one-line caption bottom), no on-slide takeaway band (exit lines moved to the
  per-deck sequence specs for narration), subtitles capped at one line, diagrams dominate.
- Every deck is now fully self-contained — the 11 original decks no longer load reveal.js or
  fonts from CDNs, so all decks work offline (classroom/locked-network safe).
- Per-deck sequence specs authored for all 11 original decks (planning/decks/).

### Fixed

- 03-deepdive: duplicate wrapper closers; 05-naive-rag: entity-inflated subtitle;
  08-security: restored a subtitle fact dropped during regeneration ("runs in CI on every push").

## [1.6.1] - 2026-07-25

### Changed

- All four deep-dive decks (03b, 03, 05, 07) rebalanced to visual-first per founder feedback:
  subtitles cut to a single line (worst case 257 chars -> under 90), diagrams grown to dominate
  the slide, every load-bearing fact relocated into SVG labels or takeaways (none deleted).
  Slide counts, order, palette, and self-containment unchanged.

### Fixed

- 05 deck: stale "~1,000-char corpus" figure corrected to ~800 chars (matches the page).

## [1.6.0] - 2026-07-23

### Added

- Interactive simulators: LoRA Trade-off Playground (m3b) + RAG Retrieval Playground (m5), both
  self-contained, harness-gated, grounded in the deep dives' real captured runs.
- Container X-Ray live-tool (`labs/tools/container-xray`) — 3 lenses (wiring/stack/platform) over
  the learner's real docker state, validated live.
- Embed component (coursesmith).

## [1.5.0] - 2026-07-23

### Added

- M7 Deep Dive (Part 2): agent knobs under the hood (per-agent temperature strategy, bounded pipeline
  vs agentic loops, delegation handoff incl. the triage-not-fed-to-retrieval design observation,
  code-level guardrails vs prompt asks, live experiments: temperature instability + gate-bypass
  showing the gate is what pins the outcome), new self-contained 18-slide deck — existing decks
  unchanged, `deep-dive.checks.json` stage, lab "Go deeper" pointer.

## [1.4.0] - 2026-07-22

### Added

- M5 Deep Dive (Part 2): RAG parameters under the hood (chunk size/overlap trade-offs, top-k vs
  noise, L2-vs-cosine with measured norm evidence, context-budget arithmetic incl. proven
  front-truncation mechanism, retrieval-miss vs generation-miss diagnosis, direct-ChromaDB
  observation, live 3-variant chunking experiment), a state-tolerant collection re-seed guard,
  new self-contained 21-slide deck — existing decks unchanged, `deep-dive.checks.json` stage,
  lab "Go deeper" pointer.

## [1.3.0] - 2026-07-22

### Added

- M3 Deep Dive (Part 2): vLLM internals (PagedAttention block tables, continuous batching, lab flags
  decoded incl. the source-verified swap-space-is-inert-on-CPU finding, `/metrics` reading, honest
  vLLM-vs-Ollama throughput-shape experiment), new self-contained 18-slide deck — existing decks
  unchanged, `deep-dive.checks.json` stage, lab "Go deeper" pointer.

### Fixed

- Matched-set baseline made runnable (QA).

## [1.2.0] - 2026-07-22

### Added

- M3B Deep Dive (Part 2): fine-tuning parameters under the hood (LoRA rank/alpha, NF4, loss-curve
  reading, chat-template pitfalls, live 3-variant experiment with real losses on mlx-lm 0.31.3), new
  self-contained whiteboard deck (19 slides) — existing decks unchanged, `deep-dive.checks.json`
  validation stage, lab "Go deeper" pointer.

### Fixed

- BSD `cp` idempotence in the seed, deck slide-18 val loss.

## [1.1.0] - 2026-07-22

### Added

- Per-lab machine-checkable assertions: `labs/<module>/checks.json` for all 10 modules
  (m1–m8, m3b, capstone), each verifying the lab actually reaches its success end-state
  (containers up, endpoints responding, artifacts on disk) rather than trusting captured
  prose alone.
- A zero-dependency checks runner (`scripts/run-checks.mjs`) that executes a module's
  `checks.json` against the live environment with no npm install required.
- `scripts/test-course.sh` — a one-command smoke test that brings up, checks, and tears
  down every module in sequence; validated 10/10 green in this session.
- `course.config.json` — a schema-validated description of the course as actually built
  (modules, tools, lab spine, requirements), for CourseSmith-plugin compatibility.
- Fork staging pipeline: pushes to the `fork` remote auto-deploy to
  `https://initcron.github.io/303-containerai/`, giving a place to verify gates and spot-check
  pages before promoting to the production `schoolofdevops` site.
- A full learner-QA sweep: a fresh agent walked every published page (Setup through
  Capstone, 33 pages) as a first-time learner, executing every command as written, and
  filed 68 findings; reports live under `planning/learner-qa/`.

### Fixed

46 of the 68 learner-QA findings, spanning Setup through Capstone (the remainder were
false positives or deferred with a documented reason — see `.superpowers/sdd/progress.md`
and the fix-batch reports for the full disposition):

- **Setup/M1 seam** — added the missing "clone the repo" step before the install steps,
  so M1's "from the root of the course repo" instruction has somewhere to point.
- **Stale captured output** — refreshed several `Expected output` blocks that had drifted
  from what the commands actually print (M2 `client.py` listing, M3 vLLM readiness/stats,
  M4 `kit pack`/`kit list`/`kit unpack` digests and columns, M3B mlx-lm training log shape,
  M5 Streamlit log grep, M8 trivy/grype table shapes) — several of these were fabricated or
  paraphrased rather than real captures; all replaced with live-verified output plus
  run-to-run variance notes where the numbers genuinely differ each run.
- **M3 `.env.example` contradiction** — `MAX_MODEL_LEN`/`MAX_NUM_SEQS` in `labs/m3/.env.example`
  didn't match the compose defaults, so copying the example silently changed the documented
  behavior; example now matches the defaults it's supposed to mirror.
- **M6 socket-path contradiction** — the Troubleshooting block told learners to export a
  Docker socket path that didn't match the one set two steps earlier; unified on the real
  socket (`unix://$HOME/.rd/docker.sock`).
- **M8 cosign/Rekor path** — this network intercepts `rekor.sigstore.dev` via TLS proxy,
  which broke the documented signing flow outright. Found and live-validated a working
  offline-signing-config path, documented it as a new Troubleshooting admonition, and made
  `secure-image.sh` fail soft on signing (scan stages still gate the pipeline; a blocked
  transparency-log call no longer aborts the whole script).
- **Capstone shell-unsafe placeholders** — `<your-github-user>`-style placeholders in the
  `kit pack`/`kit push`/cosign commands aren't valid shell syntax; replaced with an
  `export GITHUB_USER=...` pattern used consistently across the page.
- **Capstone retrieval-trigger question** — the sample question in Step 3 caused the agent
  to answer directly instead of retrieving from the runbook (a hallucinated command).
  Replaced with M6's own proven wording, live-verified 3/3 reliable, and added a note on
  why phrasing matters for a small model's routing decision.
- Assorted smaller fixes: impossible/fabricated digest strings, an incorrect image-size
  claim, missing teardown steps (leftover `local-registry` container, `capstone_chroma_data`
  volume), a dead link to an unlisted reference repo, and several tolerance notes added
  where a small model's wording legitimately varies run to run.

## [1.0.0] - 2026-07-05

Initial course release: Setup + M1–M8 + Capstone, each with Lesson + Lab + Quiz, every lab
validated live on Rancher Desktop, published to GitHub Pages.
