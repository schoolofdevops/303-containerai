# CLAUDE.md — Containers for GenAI & Agentic AI (course build)

Project-specific instructions for building this Docusaurus course. These apply to all work in this repo.

## What this repo is

Course content for **"Containers for GenAI & Agentic AI — The Open-Source Way"** — a 2-day corporate
workshop / self-paced course under School of DevOps & AI (MLOps/LLMOps catalogue). Delivered as a
Docusaurus site: per-module **Lesson + Lab + Quiz**, with every lab validated live on this machine.

- **Source outline:** `containers_genai_agentic.md` (the canonical curriculum).
- **Design spec:** `planning/specs/2026-07-05-containers-genai-agentic-course-design.md`.
- **Build tracker:** `planning/ROADMAP.md`. **Plans:** `planning/plans/`. **Lab evidence:** `planning/lab-tests/`.

## ⛑ Continuity — resuming after a context clear (READ FIRST)

This build is **phased and durable**: all important state lives on disk, so a `/clear` or new session
loses nothing. The recovery layers:

1. **`CLAUDE.md`** (this file, always auto-loaded) — the master index + conventions + env facts.
2. **`planning/STATE.md`** — the single always-current snapshot: active phase, the NEXT action, locked
   decisions, gotchas. **A SessionStart hook (`.claude/settings.json`) auto-injects this file's contents
   at the start of every session**, so context returns automatically.
3. **`planning/ROADMAP.md`** — per-module status checklist.
4. **SDD progress ledger** `.superpowers/sdd/progress.md` — which tasks are already done (never redo them).
5. **`planning/lab-tests/*.md`** — captured real evidence of what's validated on this machine.
6. **Memory** (`~/.claude/projects/.../memory/`) — durable facts auto-surface on relevant sessions.
7. **`/course-resume` skill** — invoke it to run the full restore + brief in one step.

**Discipline that keeps this working:** after every task or decision, UPDATE `planning/STATE.md` and
`planning/ROADMAP.md`. Stale state is the only way this system fails.

## Repo layout

```
site/      Docusaurus app (React, MDX, TS). Modules FLAT at top level of site/docs/ (no Day grouping).
labs/      Runnable lab assets per module (compose.yaml, app code, scripts). Referenced by lab.md prose.
planning/  specs/, plans/, lab-tests/ (evidence), ROADMAP.md
reference-repos/  cloned reuse assets (gitignored)
```

Each module folder (`site/docs/mN-*/`) contains `lesson.md`, `lab.md`, `quiz.mdx`.

## Environment facts (this machine — verified 2026-07-05)

- **arm64, 16 GB RAM** — the course's reference laptop. Nothing in a lab may exceed ~4–6 GB peak.
- **Rancher Desktop** running (docker server 29.5.2, dockerd/moby). **`docker` is NOT on the default
  PATH** — it's at `~/.rd/bin/docker`. Shell exports don't persist between separate Bash tool calls,
  so prefix automated docker commands with `PATH="$HOME/.rd/bin:$PATH"`. `nerdctl` is in the same dir.
- **Ollama** v0.17.4 serving natively on `:11434` (Metal). Model `qwen2.5:1.5b` (986 MB) pulled.
- **Node v22 / npm 10** present.
- **On Apple Silicon the model server runs NATIVE, never containerized** — containers reach it at
  `http://host.docker.internal:11434`. This is the course's defining constraint; teach it, don't fight it.

## Authoring conventions

### Voice & structure
- Author/trainer: **Gourav Shah**. Instructional, direct, confident. Second person ("you").
- Lessons teach the *why* and *when* (concepts, trade-offs, when each pattern fits); labs are the *how*
  (copy-runnable). Never blur the two.
- Keep the container angle central: everything is about how containers **package / serve / isolate / ship** AI.

### Analogies (REQUIRED in every lesson)
- Explain each new/abstract concept with a **concrete, relatable analogy** before the technical
  definition. Learners should be able to *relate* first, then formalize.
- Examples of the target style: "An OCI image is a shipping container — the same box loads onto any
  truck, ship, or crane (runtime)." "The OpenAI-compatible endpoint is a wall socket: swap the power
  station behind it and your appliance never notices." "A vector DB is a librarian who shelves books by
  meaning, not title."
- One strong analogy per major concept beats many weak ones. Make it vivid, then connect it explicitly
  back to the technical reality.

### Diagrams — Mermaid is the workhorse (REQUIRED where a concept is spatial/flow/architecture)
- Use **Mermaid** for architecture, data flow, sequence, and decision diagrams. It's native to
  Docusaurus (enabled via `@docusaurus/theme-mermaid` + `markdown.mermaid: true`), renders in light &
  dark, and is git-diffable. Prefer it over prose for anything with boxes, arrows, or steps.
- Every lesson should have **at least one** diagram where the topic is spatial (wiring, pipeline,
  architecture, sequence). Keep diagrams small and legible (≤ ~8 nodes); split complex ones.
- Label the container boundary explicitly in architecture diagrams (what's in a container vs native/host).

### Excalidraw-style illustrations (OPTIONAL enhancement)
- For a few **hero concepts** where a hand-drawn, black-and-white feel aids intuition (e.g., the
  Apple-Silicon native-server-vs-containerized-app wiring), an **Excalidraw-style illustration** may be
  added as an SVG/PNG in the module's `static`/assets and embedded. Keep it black & white, sketchy,
  uncluttered. This is optional polish — never block a lesson on it; Mermaid covers the baseline.

### Labs
- Every command must be **copy-runnable** and **actually executed** on Rancher Desktop before the module
  is marked done. Each command block is followed by an **Expected output** block showing real output.
- Labs feature the **one growing `compose.yaml`**, authored **service by service** across modules — the
  learner hand-authors each block and understands it (never paste a finished file).
- Include a **Troubleshooting** callout for the failure modes we actually hit during validation.
- In authored lab prose use plain `docker`/`docker compose` (learners have it on PATH); the `~/.rd/bin`
  prefix is only for our automated validation on this machine.

### Quizzes
- Use the custom `<Quiz>` MDX component (`@site/src/components/Quiz`). 4–6 questions per module,
  each option with an `explanation`, at least one `multiSelect` where it fits. Questions test the
  lesson's *concepts* and the lab's *decisions*, not trivia.

## Workflow

- **Superpowers** end-to-end: brainstorm → writing-plans → subagent-driven-development. Markdown plans
  in `planning/plans/`, one per module.
- **Vertical slice first:** M1 fully (lesson + lab + quiz) + live-validated before scaling to M2–M8.
- **Validate each lab live** on Rancher Desktop as it's built; log real command output to
  `planning/lab-tests/mN.md`. Never claim a lab works without captured evidence.
- Commit after each task. Keep `planning/ROADMAP.md` current.
- After M1 proves the pattern, extract reusable **skills** (course lesson/lab authoring, Docusaurus
  scaffolding) so M2–M8 go faster.

## Cross-cutting defaults (confirm per module when reached)

- Dev models: `qwen2.5:1.5b` / `qwen2.5:3b` + `nomic-embed-text`. CPU-vLLM: `SmolLM2` (M3).
- Vector DB: **ChromaDB** (fits ≤8 GB). Registry: **GHCR**. MCP gateway: **ToolHive** (M6/M7).
- Multi-agent: **CrewAI** concrete + **LangGraph** optional (M7). Acme corpus: small synthetic runbooks.

## Reuse assets (clone from GitHub into reference-repos/)

- `schoolofdevops/vllm-cpu-example` → M3 · `schoolofdevops/lightweight-genai-stack` → M5
- `gouravshah/compose-for-agents` (crew-ai) → M7 · `realopsreactor/tech-stack-advisor` → optional
