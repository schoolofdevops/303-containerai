# STATE — current working context (read this first to resume)

> **Purpose:** single always-current snapshot of where this course build is. If the conversation was
> cleared, reading this + `CLAUDE.md` + `planning/ROADMAP.md` fully restores context. Keep it concise
> and update it after every task/decision.

**Last updated:** 2026-07-05
**Active phase:** Phase 1 — scaffold Docusaurus + build M1 (vertical slice)
**Active plan:** `planning/plans/2026-07-05-m1-vertical-slice.md`
**Execution mode:** Superpowers subagent-driven-development (fresh implementer per task + review)

## Where we are right now

- ✅ Brainstorm → spec approved & committed (`planning/specs/2026-07-05-...-design.md`).
- ✅ M1 vertical-slice plan written (`planning/plans/2026-07-05-m1-vertical-slice.md`).
- ✅ Environment ready: Rancher Desktop (docker 29.5.2 at `~/.rd/bin/docker`), Ollama serving,
  `qwen2.5:1.5b` pulled. Phase 0 installs DONE — only verification+evidence remain.
- ✅ CLAUDE.md authoring conventions written (analogies + Mermaid + optional Excalidraw).
- 🔜 **NEXT:** execute the M1 plan task-by-task (scaffold → Quiz component → M1 lesson/lab/quiz →
  live lab validation on Rancher Desktop → ROADMAP + README).

## Key decisions locked (don't re-litigate)

- **Deliverable:** Docusaurus site; per module = **Lesson + Lab + Quiz** (3 sub-pages). Modules **flat**
  at top level of `site/docs/` (no Day-1/Day-2 grouping; Day mapping lives only in intro table).
- **Harness:** Superpowers end-to-end. **Sequencing:** vertical slice (M1) first, then M2–M8 + Capstone.
- **Validation:** test **each lab live** on **Rancher Desktop** (primary runtime) on this Mac; log real
  output to `planning/lab-tests/mN.md`.
- **Quizzes:** custom React `<Quiz>` MDX component (no external plugin).
- **Lessons:** REQUIRE relatable analogies + Mermaid diagrams; Excalidraw-style B&W illustration optional.
- **Skills to build course faster:** deferred until AFTER M1 proves the pattern (then extract).

## Environment gotchas (this machine)

- `docker` NOT on default PATH → use `PATH="$HOME/.rd/bin:$PATH" docker ...` in automated commands.
- Apple Silicon: model server runs **native** (Ollama/Metal); containers reach it at
  `http://host.docker.internal:11434`. Never containerize the model on Mac.
- arm64, 16 GB RAM — keep every lab ≤ ~4–6 GB peak.

## Open items / parking lot

- Cross-cutting defaults to confirm when reached: vector DB (ChromaDB default), registry (GHCR),
  Acme corpus (synthetic runbooks), MCP gateway (ToolHive), multi-agent (CrewAI + LangGraph optional).
- After M1: extract `course-authoring` + `docusaurus-scaffold` skills.

## How to resume after a clear

1. Read `CLAUDE.md` (auto-loaded) → repo map + conventions + env facts.
2. Read this `planning/STATE.md` → current phase, next action, decisions.
3. Read `planning/ROADMAP.md` → module-by-module status checklist.
4. Check the SDD progress ledger: `cat .superpowers/sdd/progress.md` → tasks already complete (don't redo).
5. Skim latest `planning/lab-tests/*.md` → what's been validated on this machine.
6. Or invoke the **`/course-resume`** skill, which does all of the above and briefs you.
