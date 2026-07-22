# Containers for GenAI & Agentic AI — The Open-Source Way

Course content for a 2-day corporate workshop / self-paced course under **School of DevOps & AI**
(MLOps/LLMOps catalogue), by **Gourav Shah**. Built as a Docusaurus site: each module ships a
**Lesson + Lab + Quiz**, and every lab is validated live on a real container runtime.

**Live site:** https://schoolofdevops.github.io/303-containerai/ (published via GitHub Pages)

## Repo layout

```
site/       Docusaurus app (React, MDX, TypeScript). Modules flat at the top level of site/docs/.
labs/       Runnable lab assets per module (scripts, compose files) referenced by the lab pages.
planning/   specs/ · plans/ · lab-tests/ (real validation evidence) · STATE.md · ROADMAP.md
.github/    GitHub Actions workflow that builds site/ and deploys to Pages.
```

## Run the site locally

```bash
npm --prefix site install
npm --prefix site start      # dev server at http://localhost:3000
npm --prefix site run build  # production build (fails on broken links)
```

## How labs are built

Labs are authored to run on any OCI runtime (Rancher Desktop, Colima, OrbStack, Podman) and are
**executed step-by-step on an Apple-Silicon Mac before shipping** — real command output is captured to
`planning/lab-tests/`. On Apple Silicon the model server runs natively (Ollama/Metal) and containers
reach it at `http://host.docker.internal:11434`.

## Pre-workshop smoke test

Run every module's live checks sequentially (memory-safe on a 16 GB laptop) before delivering:

```bash
scripts/test-course.sh              # all modules
scripts/test-course.sh m3 m5        # or just specific modules
```

Exits 0 iff all modules pass; prints a per-module PASS/FAIL and a final summary.

## Status & continuity

- **Current state:** `planning/STATE.md` · **Build tracker:** `planning/ROADMAP.md` · **Design:** `planning/specs/`.
- This build is phased and durable: a context clear loses nothing — see the continuity section in `CLAUDE.md`.
