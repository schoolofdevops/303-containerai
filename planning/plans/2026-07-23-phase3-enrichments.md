# Phase 3 — Enrichments (Sims + Container X-Ray) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Two hero interactive simulators (LoRA trade-off, RAG retrieval) + the Container X-Ray live-tool, per spec §Phase 3 — shipping as v1.6.0.

**Architecture:** Sims are single self-contained HTML files in `site/static/sims/`, embedded fullscreen via the coursesmith `<Embed>` component (copied into this site in Task 1), each gated on the sim-author contract's headless-Chrome assertion harness. The live-tool is a locally-served visualizer of the learner's REAL docker state at `labs/tools/container-xray/`, per the live-tool skill's contract, with three lenses matching this course's spine.

**Tech Stack:** coursesmith skills (`sim-author`, `live-tool`), React/MDX (Embed component), vanilla HTML/JS sims, docker CLI (live-tool adapter).

**Spec:** `planning/specs/2026-07-22-depth-retrofit-design.md` §Phase 3

## Global Constraints

- Sims: ZERO external refs, inline CSS/JS, affordance rule, fluid clamp() scaling, reduced-motion + Reset, 3-step TRY-THIS challenge with auto-detected success, domain event log, honest-model footnote, headless assertion harness green BEFORE ship — all per `coursesmith/skills/sim-author/SKILL.md` (the contract governs; read it fully per task).
- Live-tool per `coursesmith/skills/live-tool/SKILL.md` contract: `labs/tools/container-xray/{index.html, serve.sh, README.md}`, reads REAL local state, zero external refs.
- Existing decks/lessons/labs/quizzes untouched except the minimal embed additions named per task.
- Sim numbers/behaviors must be HONEST to the validated deep-dive evidence (loss values from `planning/lab-tests/m3b-deep-dive.md`, chunk/distance behavior from `planning/lab-tests/m5-deep-dive.md`) — the sim teaches the model, footnote states simplifications.
- Every Expected-block/LLM-output fence rule, bracket admonitions, initcron commits, fork-first staging (push ONLY fork until controller ships), STATE.md updates after each task — all as established in Phases 1–2.
- Machine: rtk hook mangles pipes → subagents use plain sh scripts; headless Chrome at "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome".

---

### Task 1: Embed component + sims scaffolding

**Files:**
- Create: `site/src/components/Embed/` (copy from `/Users/gshah/work/apps/learning/coursesmith/templates/course-scaffold/site/src/components/Embed/` — verbatim, then adjust only if this site's TS config demands)
- Create: `site/static/sims/.gitkeep` (or first sim lands in T2)

**Steps:** copy component → `cd site && npm run build` GREEN → a scratch MDX smoke-test embedding any static HTML renders (verify in built HTML, then remove scratch) → commit `feat(site): Embed component for fullscreen sims (coursesmith)`.

---

### Task 2: LoRA trade-off simulator

**Files:**
- Create: `site/static/sims/m3b-lora-tradeoff.html` + its assertion harness per sim-author contract (harness location per contract)
- Modify: `site/docs/m3b-finetuning/deep-dive.md` (Embed after the §6 experiment intro — the sim lets learners FEEL what the experiment then proves live)

**Content (grounded in m3b evidence):** dials for rank (4/8/16), learning rate (1e-5/1e-4), iters; outputs: simulated loss curve (shaped by the real captured trajectories: baseline 0.200/val 0.148, rank4 0.449/0.374, lr×10 0.054/0.028), adapter-size gauge (params scale linearly with r), quality/overfit indicator (val-vs-train divergence at high iters). TRY-THIS: (1) reproduce the rank-4 capacity gap, (2) find the lr that overshoots, (3) spot the overfit signature. Honest-model footnote: curves are shaped interpolations of real single runs, not a trained model.

**Steps:** read sim-author SKILL fully → author → harness green (headless Chrome) → embed → build green → commit.

---

### Task 3: RAG retrieval simulator

**Files:**
- Create: `site/static/sims/m5-rag-retrieval.html` + harness
- Modify: `site/docs/m5-naive-rag/deep-dive.md` (Embed before §7 experiment)

**Content (grounded in m5 evidence):** the real ~800-char Acme corpus (4 sections) visualized; dials: chunk size (150/500/1200), overlap, top-k (1/3/5); output: live re-chunking of the corpus, which chunks retrieval returns for the 4 real questions (distances shaped by captured values: 0.6956 baseline, 0.5146/0.3700 small-chunk, 0.75–1.08 big-chunk), context-budget bar showing tokens consumed vs 4096. TRY-THIS: (1) make the payments answer arrive as a heading-only orphan chunk, (2) blow the context budget, (3) find the sweet spot. Honest footnote: distances are captured-run interpolations, not a live embedder.

**Steps:** same loop as Task 2.

---

### Task 4: Container X-Ray live-tool

**Files:**
- Create: `labs/tools/container-xray/{index.html, serve.sh, README.md}`

**Contract (live-tool SKILL governs):** self-contained local page served by `serve.sh` that shows the learner's REAL docker state via a small local adapter (the skill defines the pattern — likely a shell adapter emitting JSON the page polls). Three lenses for this course:
1. **Wiring lens (m1/m2):** running course containers + port maps + the `host.docker.internal:11434` reachability check (is native Ollama up, which models).
2. **Stack lens (m5/m6/m7):** compose projects, services, volumes, networks for the RAG/agent stacks.
3. **Platform lens (capstone):** whole-course view — images cached per module, disk usage, what's running.

**Steps:** read live-tool SKILL fully → instantiate → validate LIVE against real states (nothing running; m5 stack up; capstone up — bring up/down via existing up.sh/down.sh) with captured evidence to `planning/lab-tests/container-xray.md` → README documents usage + one "Try the X-Ray" pointer added to `site/docs/m1-container-native/lab.md` AND `site/docs/capstone/index.md` (2-3 lines each, the only page edits) → build green → commit.

---

### Task 5: QA + ship v1.6.0

**Steps:**
1. Learner-QA (fresh walker): the three touched pages (m3b deep-dive, m5 deep-dive, m1 lab + capstone pointers) on staging — sims load fullscreen, TRY-THIS achievable, no render breaks (RENDER check mandatory); X-Ray followed from README against a live stack.
2. Fix findings → re-QA blockers.
3. CHANGELOG `## [1.6.0]`, STATE/ROADMAP, gates (build green, sim harnesses green, `scripts/test-course.sh m1 m3b m5` spot-run).
4. Final whole-branch review (most capable model) → fixes → push fork → staging verify → origin + tag v1.6.0.
