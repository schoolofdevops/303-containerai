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
| M2 · Serving Local Models (Ollama/OpenAI-compat) | ⬜ | ⬜ | ⬜ | ⬜ | — |
| M3 · Production Serving with vLLM (CPU+GPU) | ⬜ | ⬜ | ⬜ | ⬜ | `vllm-cpu-example` |
| M3B · LoRA/QLoRA *(optional, GPU-gated)* | ⬜ | ⬜ | ⬜ | ⬜ | — |
| M4 · Packaging Models as OCI Artifacts (KitOps) | ⬜ | ⬜ | ⬜ | ⬜ | — |
| M5 · Docs Assistant — Naive RAG | ⬜ | ⬜ | ⬜ | ⬜ | `lightweight-genai-stack` |
| M6 · Declarative Agent (Agentic RAG + MCP) | ⬜ | ⬜ | ⬜ | ⬜ | — |
| M7 · Multi-Agent Crew (CrewAI + LangGraph) | ⬜ | ⬜ | ⬜ | ⬜ | `compose-for-agents/crew-ai` |
| M8 · Securing & Governing AI Workloads | ⬜ | ⬜ | ⬜ | ⬜ | — |
| Capstone · Ship the Acme AI Platform | ⬜ | ⬜ | ⬜ | ⬜ | — |
| Setup pages (prerequisites, gpu-reality) | ⬜ full | — | — | — | (stubs exist) |

## Post-M1 follow-ups
- ⬜ Extract `course-authoring` + `docusaurus-scaffold` skills from the proven M1 pattern
- ⬜ Final whole-branch code review of the M1 slice
- ⬜ Verify GitHub Pages deploy is live after first push
