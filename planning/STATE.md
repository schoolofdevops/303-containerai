# STATE — current working context (read this first to resume)

> **Purpose:** single always-current snapshot of where this course build is. If the conversation was
> cleared, reading this + `CLAUDE.md` + `planning/ROADMAP.md` fully restores context. Keep it concise
> and update it after every task/decision.

**Last updated:** 2026-07-05
**Active phase:** M1 vertical slice COMPLETE + PUBLISHED. Ready to start M2. Working on `main`.
**Active plan:** `planning/plans/2026-07-05-m1-vertical-slice.md` (done)
**Execution mode:** subagent-driven, grouped into waves; controller reviews + live validation

## Where we are right now

- ✅ Brainstorm → spec; M1 plan; continuity system.
- ✅ **Phase 0 verified** — Rancher Desktop + Ollama + `qwen2.5:1.5b` + container→host wiring. Evidence `lab-tests/00-environment.md`.
- ✅ **Wave A** — Docusaurus scaffold + Mermaid + `<Quiz>` component.
- ✅ **Wave B** — M1 lesson (analogies + 2 Mermaid diagrams), lab + `labs/m1/call-ollama.sh`, quiz.
  Lab validated live on Rancher Desktop → `lab-tests/m1.md`.
- ✅ **Wave C** — ROADMAP + README + build gate.
- ✅ **PUBLISHED LIVE:** https://schoolofdevops.github.io/303-containerai/ — Actions deploy green,
  all M1 pages return 200. (Fixed a stale package-lock.json that broke CI `npm ci`.)
- 🔜 **NEXT:** either (a) M2 (Serving Local Models), or (b) polish follow-ups below, or (c) optional
  final whole-branch review. Ask the user which.

## Publishing (working)

- Remote `schoolofdevops/303-containerai`, public. Pages via `.github/workflows/deploy.yml` from `main`.
- gh active account: **initcron** (admin on repo). Commits authored as `initcron <bean@initcron.org>`.
- `old/` + `references.txt` purged from history and gitignored — keep private.

## Polish follow-ups (not blocking)

- ⬜ **Homepage still shows the Docusaurus scaffold** (`<title>Easy to Use</title>`, template banner in
  `site/src/pages/index.tsx`). Replace with a course-branded landing page.
- ⬜ Fill the two `setup/` stub pages (prerequisites, gpu-reality) with real content.
- ⬜ (CI) Actions warns Node 20 actions forced to Node 24 — cosmetic; bump action versions later.

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
