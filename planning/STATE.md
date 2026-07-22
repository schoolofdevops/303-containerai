# STATE — current working context (read this first to resume)

> **Purpose:** single always-current snapshot of where this course build is. If the conversation was
> cleared, reading this + `CLAUDE.md` + `planning/ROADMAP.md` fully restores context. Keep it concise
> and update it after every task/decision.

**Last updated:** 2026-07-22
**Active phase:** ✅ **COURSE COMPLETE** — M1–M8 + Capstone all live + lab-validated. Working on `main`.
**Live site:** https://schoolofdevops.github.io/303-containerai/ (every page 200)
**Execution mode:** subagent-driven, grouped into waves; controller reviews + live validation

## Depth retrofit (2026-07-22)

**Fork staging live** at https://initcron.github.io/303-containerai/. Deploy flow: push local `main` to
`fork` remote → fork Actions auto-deploys → QA on staging → merge/push to `origin` only after green gates.
Enables safe iteration and validation before promoting to the production schoolofdevops site.

**Phase 1 COMPLETE.** Checks backbone (`labs/<module>/checks.json` all 10 modules + zero-dep
`scripts/run-checks.mjs` runner) + `scripts/test-course.sh` smoke test (10/10 green) +
`course.config.json` (schema-validated) + full learner-QA sweep (33 pages, 68 findings, 46 fixed,
remainder deferred with documented reason — see `.superpowers/sdd/progress.md`) all done. Staging
verified on the fork. Shipping as **v1.1.0** (see `CHANGELOG.md`).
**NEXT:** after v1.1.0 ships, the M3B deep dive plan at `planning/plans/2026-07-22-m3b-deep-dive.md`.

## Post-completion work (2026-07-05, later)

- ✅ **Phase A — full learner-QA pass (M1→Capstone).** A learner-simulating subagent followed each
  published `lab.md`; fixed all findings. Notable blockers caught & fixed: M3 (client-container step +
  `.env` DTYPE=auto→float32), M5 (**app ignored the ChromaDB container** — now uses HttpClient; chunk
  count 3→2), M6 (`cat` not `head`, stale `thv list`, `thv rm` teardown), M7 (missing teardown), M8
  (deterministic guardrail eval). Teardown steps added where missing. All pushed & deployed.
- ✅ **Phase B tasks:** M3B fine-tuning module (LoRA/QLoRA, MLX native + Axolotl NVIDIA) LIVE; extracted
  `course-authoring` + `docusaurus-scaffold` skills (`.claude/skills/`); bumped CI actions to v5.
- ⏳ **Task 2 (GHCR real push) — BLOCKED on user:** needs `gh auth refresh -h github.com -s write:packages`
  (interactive). Then: push ModelKit to `ghcr.io/initcron/acme-docs-model:1.0.0`, keyless cosign
  sign+verify, make package public, fold real GHCR evidence into M4/M8 labs. Validated locally already.
- Note: pushing `.github/workflows/*` needs a token with `workflow` scope — initcron lacks it; use
  `gh auth switch --user gouravjshah` for workflow-file pushes, then switch back.

## Course status: DONE (+ QA-hardened; M3B added)

All 8 modules + Setup + Capstone published and validated live on this machine:
M1 container-native · M2 serving (OpenAI /v1) · M3 vLLM CPU (5 arm64 fixes) · M4 KitOps packaging ·
M5 naive RAG · M6 declarative agentic-RAG agent + ToolHive · M7 Incident Crew · M8 SBOM/scan/sign/sandbox
· Capstone platform-check. Evidence in `planning/lab-tests/*.md`. Site-wide sweep clean (quiz schema,
admonitions, mermaid). Possible next work: M3B (LoRA/QLoRA, GPU-gated), extract authoring skills,
enable GHCR `write:packages` for a real ModelKit/cosign push, deeper per-module review.

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

## Polish follow-ups

- ✅ **Homepage rebranded** — course title/tagline, "Start the Course →" CTA, 3 value props (📦🪜💻). Live.
- ✅ **Setup pages authored** — `setup/prerequisites` (install quickstart, fixed `--cask rancher`) +
  `setup/gpu-reality` (analogy + Mermaid). Live.
- ⬜ (CI, cosmetic) Actions warns Node 20 actions forced to Node 24 — bump action versions someday.
- Note: GitHub Pages "Deploy" step can intermittently fail with "try again later" (transient) — just
  `gh run rerun <id> --failed`.

## Modules complete

- ✅ **M1 · Container-Native GenAI** — live, lab-validated.
- ✅ **M2 · Serving Local Models** — lesson (analogies + 2 Mermaid), lab (OpenAI-compatible `/v1`
  client, containerized, first hand-authored `labs/m2/compose.yaml`), quiz. Lab validated live →
  `lab-tests/m2.md`. Admonitions in bracket form.
- Fixed a site-wide bug: Docusaurus admonition titles need bracket form `:::type[Title]` (space form
  renders literally). Convention now in CLAUDE.md.

- ✅ **M3 · Production Serving with vLLM** — lesson (analogies + Mermaid), lab, quiz, `labs/m3` assets.
  CPU vLLM (SmolLM2-135M, float32) validated live end-to-end → `lab-tests/m3.md`. Live validation found
  & fixed **5 arm64/Rancher incompatibilities** vs the Docker-Desktop reuse repo (CPU cap, swap-space,
  numa/SYS_NICE+seccomp, bf16→float32, 360M→135M). **Requires runtime VM at 4 CPU / 6 GB.**

- ✅ **M4 · Packaging (KitOps)** — lesson/lab/quiz + `labs/m4` Kitfile assets. Packaging validated live
  (pack→push→pull→unpack of a 100 MB ModelKit against local `registry:2`) → `lab-tests/m4.md`.
  `kit` v1.15.0 installed at `/opt/homebrew/bin/kit`. **GHCR push needs a `write:packages` token**
  (gh token lacks it — user can `gh auth refresh -s write:packages` to enable a real GHCR push).

- ✅ **M5 · Docs Assistant (Naive RAG)** — lesson/lab/quiz + `labs/m5` (native Ollama + ChromaDB 0.5.20 +
  Streamlit). Full RAG round-trip + app health validated live → `lab-tests/m5.md`. Use Case A started.

## Next: M6 · Declarative Agent (Agentic RAG + MCP tools via ToolHive)

**De-risked:** `thv` v0.33.0 installed; ran the `fetch` MCP server as an isolated container (server +
ingress/egress proxies + DNS) — evidence in `/tmp/toolhive-evidence.txt` (fold into lab-tests/m6.md).
Still to design: the declarative agent runtime (AGENTS.md/SOUL.md + skills + MCP + guardrails) — pick a
concrete runnable approach (likely a small Python agent over native Ollama that reads AGENTS.md/SOUL.md
and calls ToolHive MCP tools + the M5 Docs Assistant as a retrieval tool). Agentic RAG = agent decides
whether/what to retrieve. Starts Use Case B.

## Tooling installed (this machine)
- Rancher Desktop (VM 4 CPU/6 GB), Ollama (qwen2.5:1.5b, nomic-embed-text), vLLM CPU image, `kit` v1.15.0,
  `thv` v0.33.0 (ToolHive), trivy/syft/grype/cosign (for M8). `kit` + `thv` at `/opt/homebrew/bin`.
- ToolHive needs `DOCKER_HOST=unix://$HOME/.rd/docker.sock` set for automated `thv` calls.

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
