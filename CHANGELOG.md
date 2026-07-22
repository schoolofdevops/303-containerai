# Changelog

All notable changes to this course build are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project uses [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
