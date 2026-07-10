# Design: `coursesmith` — a Course-Generation Harness (Claude Code plugin)

**Date:** 2026-07-10
**Author:** Gourav Shah (with Claude Code / Superpowers)
**Status:** Approved (design) — pending spec review → writing-plans
**Source of truth:** the process used to build `303-containerai` (this repo) — reverse-engineered.

---

## 1. Purpose

Make the course we just built **repeatable**. Package the proven outline→published-course process as an
opinionated **Claude Code plugin** so any course outline can become a fully-built, **lab-validated**,
learner-QA-hardened, published Docusaurus course — lessons (with analogies + Mermaid), runnable labs
tested on a real container runtime, quizzes, slide decks, a coherent project/use-case spine, and a
capstone.

The value is the **opinions**, harvested from this repo:
- Every lesson opens each concept with a **relatable analogy**, then formalizes; **Mermaid** for anything spatial.
- Every lab is **executed live on a real runtime** and its real output folded back in — never "should work".
- **Learner-QA**: fresh subagents follow the *published* lab as a beginner and flag breakage/clarity/teardown gaps.
- **One growing `compose.yaml`**, hand-authored service by service, culminating in a consolidated capstone.
- **Slide decks** generated and embedded per lesson.
- **Durable continuity** (STATE + SessionStart hook + resume skill + memory) so a build survives `/clear`.

## 2. Decisions locked (brainstorming)

- **Form factor:** a **Claude Code plugin** — skills + `/course-*` slash commands + subagents + packaged
  templates, marketplace-publishable and versioned.
- **Control model:** **checkpoint-gated phases, autonomous within each.** Human gates at design spec,
  roadmap, each module review, and final publish. The per-module build (author→validate→QA→commit) and
  the QA pass run autonomously.
- **Opinionation:** **opinionated to our proven stack** (Docusaurus + container-validated labs +
  Quiz/Mermaid/decks + Pages), with a small `course.config` for the parts that legitimately vary per
  course (domain/project spine, models, vector DB, registry, runtime, audience, module list).

## 3. The 8-phase pipeline (what the harness automates)

1. **Design** — outline → clarifying Q&A → a **design spec** (module ladder, the project/use-case spine,
   stack config, resource budget, standardized defaults). *Gate: human approves the spec.*
2. **Scaffold** — Docusaurus site from the packaged starter (Quiz component, Mermaid, deck `<Slides>`
   component, Pages CI workflow, SessionStart continuity hook) + `planning/` state + `CLAUDE.md` conventions.
3. **Roadmap** — the module ladder + one `plan` per module + the coherent project spine. *Gate: human approves roadmap.*
4. **Vertical slice** — build **Module 1** fully + validate live, to prove the whole pipeline before scaling.
5. **Per-module loop** (repeat, autonomous) — plan → **lesson** (analogies + ≥1 Mermaid) → **lab** +
   runnable assets → **validate lab live on the runtime** (capture real evidence to `planning/lab-tests/`) →
   **quiz** (exact `<Quiz>` schema) → **deck** → build gate → commit → deploy. *Gate: human reviews each module.*
6. **Learner QA** — per module, a fresh learner-simulating subagent runs the published `lab.md` as a
   beginner and reports BLOCKER/CLARITY/POLISH + teardown coverage; findings are fixed and re-verified.
7. **Integration** — a **consolidated capstone** (one compose runs the whole platform) + a course-wide
   coherence pass (naming, the project spine, cross-links, the growing-compose story).
8. **Publish** — deploy to GitHub Pages, verify every page is live. *Gate: human approves publish.*

Cross-cutting the whole run: continuity (STATE/resume/memory), the growing compose, decks, and the
"build up → tear down" resource discipline.

## 4. Architecture

### 4.1 Skills (✅ = already exists in this repo and will be extracted/generalized)

| Skill | Responsibility | Inputs → Outputs | Status |
|---|---|---|---|
| `course-design` | Phase 1 intake. Wraps brainstorming *for courses*: outline → questions → design spec. | outline text → `planning/specs/*-design.md` + `course.config` | new |
| `docusaurus-scaffold` | Phase 2. Stand up the site from the packaged starter; wire Quiz/Mermaid/decks/Pages/continuity. | design spec → working `site/` + `planning/` + CI | ✅ extend |
| `course-roadmap` | Phase 3. Module ladder + per-module `plan` files + the project spine. (May fold into `course-design`.) | design spec → `ROADMAP.md` + `planning/plans/*` | new |
| `course-authoring` | Phase 4–5. Build ONE module end-to-end: lesson→lab→validate→quiz→deck. The core loop. | a module plan + `course.config` → the 3 docs + `labs/mN/` + deck + lab-test evidence | ✅ extend |
| `lab-validation` | The live-validation sub-loop: run the lab on the runtime, capture output, fold corrections into `lab.md`. | `labs/mN/` + `lab.md` → validated lab + `planning/lab-tests/mN.md` | new (partly in authoring) |
| `learner-qa` | Phase 6. Dispatch learner-simulating subagents; produce findings; drive fixes. | a module (or all) → findings report + fixes | new |
| `capstone-integration` | Phase 7. Consolidated compose + coherence pass. | all modules → `labs/capstone/compose.yaml` + capstone doc | new |
| `whiteboard-deck-builder` | Generate + embed a slide deck for a lesson. | lesson → `static/decks/*.html` + `<Slides>` embed | ✅ (user's) |
| `course-resume` | Continuity: restore full working state after a clear. | on demand → situational briefing | ✅ |

Skill boundary rule: each skill does one phase-sized job with a file-based interface, so it's testable
in isolation and composable by the orchestrator. `whiteboard-deck-builder` stays **standalone** (it's
independently useful); `course-authoring` **calls** it as its deck step.

### 4.2 Slash commands (the orchestrator + phase entrypoints)

- `/course-new <outline-file>` — Phases 1–3: design → scaffold → roadmap, with the two gates.
- `/course-module <N>` — Phase 5: build one module autonomously (author→validate→qa-self-check→commit→deploy).
- `/course-build` — loop `/course-module` over the remaining modules (autonomous, still commits/deploys each).
- `/course-qa [N|all]` — Phase 6: learner-QA a module or the whole course; apply fixes.
- `/course-ship` — Phases 7–8: capstone integration + publish + live verification.
- `/course-status` / `/course-resume` — continuity: where are we, restore context.

### 4.3 Subagents the plugin ships

- `module-author` — writes a module's lesson/lab/quiz/deck to the conventions (Sonnet-class).
- `lab-runner` — executes a lab on the real runtime, captures evidence (needs machine/runtime access).
- `learner-qa-tester` — follows the *published* lab as a beginner; reports findings (the QA agent).
- `module-reviewer` — spec-compliance + quality gate on a built module.

### 4.4 Packaged templates (extracted from this repo)

A `templates/docusaurus-starter/` in the plugin containing: the `<Quiz>` React component + its exact
prop schema, `docusaurus.config` with Mermaid enabled, the `<Slides>` deck-embed component, the Pages
deploy workflow, the SessionStart continuity hook + `settings.json`, and doc/state templates
(`CLAUDE.md`, `STATE.md`, spec/plan/lab-test skeletons). Scaffolding becomes copy-and-configure, not
regenerate-from-scratch.

### 4.5 State & continuity model

Per course: `planning/` = `specs/` + `plans/` + `ROADMAP.md` + `STATE.md` + `lab-tests/`. A SessionStart
hook auto-injects `STATE.md`; `course-resume` reconstructs full context; memory holds durable facts. A
course is **resumable at any phase** — this is non-negotiable and shipped by the scaffold.

### 4.6 `course.config` (the knobs)

The only per-course variation the machinery reads: `domain`/project-spine, `audience`, `module_list`,
`models`, `vector_db`, `registry`, `container_runtime`, `repo`/Pages target. Everything else (conventions,
validation loop, QA, publish) is fixed.

## 5. Build strategy for the harness itself — decompose + **dogfood**

The plugin is large; build it in slices, and prove each slice by **using it**:

- **Slice 1 — Skeleton + intake + scaffold.** Plugin manifest; extract `templates/docusaurus-starter/`;
  `course-design`; generalize `docusaurus-scaffold`; ship continuity. *Acceptance: `/course-new` takes an
  outline to a scaffolded, deployable site + approved spec + roadmap.*
- **Slice 2 — Module build loop.** Generalize `course-authoring`; extract `lab-validation`; ship
  `module-author` + `lab-runner`; `/course-module`. *Acceptance: build one real module end-to-end,
  lab validated live.*
- **Slice 3 — Learner QA.** `learner-qa` + `learner-qa-tester`; `/course-qa`. *Acceptance: QA a module,
  produce findings, apply fixes.*
- **Slice 4 — Integration + ship.** `capstone-integration`; deck wiring in `course-authoring`;
  `/course-ship`. *Acceptance: capstone + publish.*
- **Final acceptance (the real test of repeatability):** generate a **second, small course** (e.g. a
  3-module mini-course in a different domain) end-to-end with the harness, human only at the gates.

Most work is **extraction/generalization** of proven assets from this repo, not new invention.

## 6. Extraction map (harvest from `303-containerai`)

- `<Quiz>` component + schema, Mermaid config, `<Slides>` embed, Pages workflow, SessionStart hook →
  `templates/docusaurus-starter/`.
- `CLAUDE.md` conventions, `STATE.md`, spec/plan/lab-test skeletons → `templates/`.
- `.claude/skills/course-authoring`, `docusaurus-scaffold`, `course-resume` → plugin skills (generalized).
- The learner-QA prompt pattern (from this session's `labtest-*` runs) → `learner-qa` + its subagent.
- The per-module plan structure and the live-validation loop → `course-authoring` / `lab-validation`.

## 7. Out of scope (YAGNI)

- Non-Docusaurus site targets; non-container lab runtimes (config knobs only, no new backends).
- LMS/SCORM export, auth, quiz-score persistence, analytics.
- Auto-generating the *outline* itself (the human brings an outline; `course-design` refines it).
- A GUI. The interface is slash commands + the Docusaurus site.

## 8. Success criteria

- The plugin installs; `/course-new <outline>` → scaffolded, deployable site + approved spec + roadmap.
- `/course-module N` builds a module with its **lab validated live** and evidence captured.
- `/course-qa` finds real issues by following the published lab as a learner, and fixes them.
- `/course-ship` produces a consolidated capstone and a live, verified Pages site.
- **Repeatability proof:** a second, small course is generated end-to-end with humans only at the gates.
