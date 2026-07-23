# ROADMAP — Containers for GenAI & Agentic AI

Build tracker. Each module ships **Lesson + Lab + Quiz**; each lab is **validated live on Rancher
Desktop** (evidence in `planning/lab-tests/`). Spec: `planning/specs/2026-07-05-...-design.md`.
Publishing: `schoolofdevops/303-containerai` → GitHub Pages via `.github/workflows/deploy.yml`.

Legend: ✅ done · 🔄 in progress · ⬜ pending

## Phase 0 — Environment
- ✅ Rancher Desktop + Ollama + `qwen2.5:1.5b`; container→host wiring verified (`lab-tests/00-environment.md`)

## Phase 1 — Vertical slice ✅ COMPLETE + PUBLISHED
- ✅ Docusaurus scaffold + Mermaid + `<Quiz>` component (Wave A)
- ✅ GitHub Pages publishing LIVE — https://schoolofdevops.github.io/303-containerai/ (Actions deploy green)
- ✅ **M1 · Container-Native GenAI** — Lesson ✅ · Lab ✅ (validated `lab-tests/m1.md`) · Quiz ✅

## Phase 2+ — Remaining modules (per-module loop: clone/adapt reuse asset → lesson → lab → validate → quiz)

| Module | Lesson | Lab | Lab validated | Quiz | Reuse asset |
| --- | --- | --- | --- | --- | --- |
| M2 · Serving Local Models (Ollama/OpenAI-compat) | ✅ | ✅ | ✅ | ✅ | — |
| M3 · Production Serving with vLLM (CPU+GPU) | ✅ | ✅ | ✅ | ✅ | `vllm-cpu-example` |
| M3B · LoRA/QLoRA *(optional, GPU-gated)* | ⬜ | ⬜ | ⬜ | ⬜ | — |
| M4 · Packaging Models as OCI Artifacts (KitOps) | ✅ | ✅ | ✅ | ✅ | — |
| M5 · Docs Assistant — Naive RAG | ✅ | ✅ | ✅ | ✅ | `lightweight-genai-stack` |
| M6 · Declarative Agent (Agentic RAG + MCP) | ✅ | ✅ | ✅ | ✅ | — |
| M7 · Multi-Agent Crew (CrewAI + LangGraph) | ✅ | ✅ | ✅ | ✅ | `compose-for-agents/crew-ai` |
| M8 · Securing & Governing AI Workloads | ✅ | ✅ | ✅ | ✅ | — |
| Capstone · Ship the Acme AI Platform | ✅ | ✅ | ✅ | ✅ | — |
| Setup pages (prerequisites, gpu-reality) | ✅ | — | — | — | (authored in polish) |

## Post-M1 follow-ups
- ✅ Extract `course-authoring` + `docusaurus-scaffold` skills from the proven M1 pattern
- ⬜ Final whole-branch code review of the M1 slice
- ✅ Verify GitHub Pages deploy is live after first push

## Phase 1 — Depth retrofit (2026-07-22) ✅ COMPLETE

| Item | Status |
| --- | --- |
| Checks backbone — `labs/<module>/checks.json` all 10 modules + zero-dep `scripts/run-checks.mjs` runner | ✅ |
| Smoke test — `scripts/test-course.sh` (all modules, 10/10 green this session) | ✅ |
| `course.config.json` — schema-validated as-built course description | ✅ |
| Learner-QA sweep — 33 pages walked, 68 findings, 46 fixed, remainder deferred with reason | ✅ |
| Fork staging pipeline (`initcron.github.io/303-containerai`) for pre-promotion validation | ✅ |
| Shipped as v1.1.0 (`CHANGELOG.md`) | ✅ |

**Next:** `planning/plans/2026-07-22-m3b-deep-dive.md`.

## Phase 2 — Depth retrofit deep dives (2026-07-22)

| Item | Status |
| --- | --- |
| M3B · Fine-Tuning Deep Dive — page + `deep-dive.checks.json` + `03b-deepdive.html` deck (19 slides) + lab pointer, learner-QA all-PASS | ✅ (v1.2.0) |
| M3 · vLLM Internals Deep Dive — page + `deep-dive.checks.json` + `03-deepdive.html` deck (18 slides) + lab pointer, learner-QA PASS (F7 fixed) | ✅ (v1.3.0) |
| M5 · RAG Parameters Deep Dive — page + `deep-dive.checks.json` + `05-deepdive.html` deck (21 slides) + state-tolerant re-seed guard + lab pointer, learner-QA all-PASS (zero findings) | ✅ (v1.4.0) |
| M7 · Agent Knobs Deep Dive — page + `deep-dive.checks.json` + `07-deepdive.html` deck (18 slides) + lab pointer, learner-QA PASS | ✅ (v1.5.0) |

## Phase 3 — Depth retrofit enrichments (2026-07-23)

| Item | Status |
| --- | --- |
| LoRA Trade-off Playground sim (m3b deep-dive) — self-contained, harness-gated (44/44), grounded in real captured runs | ✅ (v1.6.0) |
| RAG Retrieval Playground sim (m5 deep-dive) — self-contained, harness-gated (49/49), real corpus byte-identical | ✅ (v1.6.0) |
| Container X-Ray live-tool (`labs/tools/container-xray`) — 3 lenses (wiring/stack/platform), 22/22 live assertions | ✅ (v1.6.0) |
| Embed component (coursesmith) | ✅ (v1.6.0) |
| Learner-QA — all PASS, zero findings (`planning/learner-qa/phase3-report.md`) | ✅ |
