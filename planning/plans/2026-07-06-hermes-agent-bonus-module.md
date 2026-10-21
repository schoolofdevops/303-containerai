# Plan — Bonus Module: Build a Real Agent with Hermes (agent that operates the stack)

**Created:** 2026-07-06 · **Author:** Gourav Shah · **Status:** proposed (awaiting go-ahead)

## Decisions locked (from brainstorm)

- **Skill kind:** Hermes Agent skills (`agentskills.io` open-standard `SKILL.md` playbooks a running
  agent executes). Portable — same format works in Cowork/Claude too.
- **Purpose:** a **new bonus module** for `303-containerai` (teaching artifact), not just a private toolkit.
- **Build shape:** **deep vertical slice** — 2–3 flagship skills + ONE runnable Hermes agent, validated
  live on this machine (mirrors the M1-first discipline), before scaling to a full skill pack.
- **Model:** course default **`qwen2.5:1.5b`** on native Ollama. Risk: tiny model = shaky multi-step
  tool-calling. Mitigation: design skills as *simple, deterministic, few-tool* procedures; easy bump to
  `qwen2.5:3b` if live validation shows unreliability.

## The idea in one line

Turn each rung of the course ladder into a reusable skill, then load them into **Hermes Agent** (Nous
Research, MIT, local-first: `SOUL.md` + `skills/` + memory + profiles, any OpenAI-compatible endpoint) so
learners **build an agent that autonomously operates the very stack they just built** — the capstone of
the capstone.

## What Hermes gives us (verified)

- Install: `curl -fsSL https://hermes-agent.nousresearch.com/install.sh | bash` → `hermes setup`.
- State under `~/.hermes/`: `config.yaml`, `.env`, `SOUL.md`, `memories/`, `skills/`, `cron/`, `state.db`.
- Skill = Markdown w/ frontmatter (`name`, `description`, `version`) + `## Procedure` / `## Pitfalls` /
  `## Verification`. Installed via `hermes skills install` or a private **tap** (`hermes skills tap add
  <user>/<repo>`).
- Connects to **Ollama / vLLM / any OpenAI endpoint** → reuses the course's native Ollama at `:11434`.
- Built-in cron + gateways + MCP support + subagents. Security model: command approval / container isolation.

## Vertical slice — the 3 flagship skills (cross-section of the whole course)

| Skill (tap: `acme-ops`) | Encodes | What the agent does | Tool-call load |
| --- | --- | --- | --- |
| `serving-doctor` | M1–M3 | Verify/diagnose the model endpoint: `/v1` health, GPU-vs-CPU, `host.docker.internal` wiring | low (curl + read) |
| `docs-assistant-query` | M5 | Query the Acme Docs Assistant (ChromaDB RAG) as a knowledge tool → **Agentic RAG**: agent decides to retrieve | low–med |
| `secure-ai-image` | M8 | Syft SBOM → Grype/Trivy scan → Cosign verify on an image; emit a findings note | low (deterministic shell) |

Must-haves for first runnable pass: `serving-doctor` + `docs-assistant-query`. `secure-ai-image` is the
third (all its tools already installed on this machine).

## The agent & demo scenario

- **Persona (SOUL.md):** *Acme AI-Platform Operator* — a careful SRE-style operator. **Read-only by
  default; asks approval before any state change** (ties to M8 guardrails + Hermes security model).
- **Demo (mirrors M6/M7 "resolve a ticket with a safe action"):** a ticket says "Docs Assistant is
  flaky." The agent (1) runs `serving-doctor` → confirms endpoint healthy + correctly wired; (2) uses
  `docs-assistant-query` → retrieves the relevant runbook; (3) optionally `secure-ai-image` on its own
  image before "shipping"; (4) writes a short incident note. One profile, one shared model — no crew
  needed to make the point.

## Distribution / repo layout

- `agent/acme-ops/skills/<skill>/SKILL.md` — the tap (a git dir the learner adds).
- `agent/acme-ops/SOUL.md`, `config.example.yaml`, `.env.example` — the agent definition.
- `site/docs/m9-hermes-agent/` — `lesson.md` + `lab.md` + `quiz.mdx` (existing module conventions:
  analogies + Mermaid; copy-runnable lab w/ Expected-output blocks; `<Quiz>` schema).
- `planning/lab-tests/m9.md` — captured live evidence (required before "done").

## Phases

- **Phase 0 — de-risk (live):** install Hermes on this Mac, point `hermes setup` at native Ollama
  `qwen2.5:1.5b`, run one trivial task to confirm the loop. Capture evidence. *(Gate: if tool-calling is
  unusable at 1.5b even for trivial tasks, flag + propose 3b before proceeding.)*
- **Phase 1 — author skills + agent:** write the 3 `SKILL.md` playbooks + `SOUL.md` + config templates.
- **Phase 2 — wire & validate end-to-end:** install the tap into a profile, run the demo scenario,
  capture the real transcript → `lab-tests/m9.md`. Bump to 3b only if needed.
- **Phase 3 — author the module:** `lesson.md` (why declarative agents / when Hermes vs framework, +
  Mermaid of Hermes→skills→Ollama wiring), `lab.md` (copy-runnable install→configure→run→observe), `quiz.mdx`.
  Optional B&W Excalidraw hero: "Hermes loads skills, calls one shared model, operates the stack."
- **Phase 4 — integrate + verify:** update `STATE.md` + `ROADMAP.md`; learner-sim QA pass + link check;
  commit as `initcron`. (Docusaurus nav: decide whether M9 is "Bonus" vs part of Capstone.)

## Cross-agent portability (confirmed)

`SKILL.md` is the open **Agent Skills** standard (agentskills.io) — one skill folder runs across **Hermes,
Claude Code, Codex CLI, Gemini CLI, OpenCode, Cursor, Copilot, Cline, Windsurf**. Design rule: keep the
`SKILL.md` body **agent-agnostic** (universal CLIs — `docker`/`kit`/`thv`/`trivy`/`syft`/`cosign`/`curl`),
push any runtime-specific glue into optional side files. Distribute as ONE git **tap/repo** the learner
adds to whichever agent they run. This makes the toolkit a standalone asset *and* course content.

## Broadened vision — an Agentic LLMOps toolkit (DevOps principles → AI, run by agents)

Organizing mental model: **bring the DevOps loop to AI and let agents run each stage.** Every skill below
encodes a DevOps principle as an AI-native, container-backed procedure any agent can execute.

| DevOps principle | AI-native practice | Skill | Container tech | Module |
| --- | --- | --- | --- | --- |
| Reliability / SRE | Model-serving health & wiring | `serving-doctor` ★ | OpenAI endpoint, `host.docker.internal` | M1–M3 |
| Capacity / perf | Throughput & quantization tuning | `serving-scale` | vLLM batching, KV cache | M3 |
| Version everything / GitOps | ModelOps artifacts | `package-modelkit` | OCI / ModelKit / ORAS | M4 |
| DataOps | RAGOps (index + retrieval quality) | `build-rag-index` ★ · `rag-eval` | ChromaDB in a container | M5 |
| Shift-left testing | Evals as quality gates | `llm-eval-gate` | containerized eval run | M8 |
| DevSecOps | AI supply chain | `secure-ai-image` ★ | Syft/Grype/Trivy/Cosign, gVisor/ToolHive | M8 |
| CI/CD | Continuous delivery for models+agents | `ai-pipeline-gen` | GH Actions build→scan→sign→ship | M8/Capstone |
| Measurement / monitoring | LLM observability | `trace-and-observe` (cost/latency/drift) | tracing sidecar | M8 |
| Config parity / 12-factor | Portable declarative stack | `compose-grow` · `runtime-portability-check` | Compose Spec; Colima/Rancher/OrbStack | through-line |
| Governance | Agent policy & audit | `ai-governance-audit` | ToolHive Cedar policy, per-tool access | M6/M8 |
| Incident response / runbooks | Agentic runbook (composes the rest) | `incident-triage` (flagship demo) | all of the above | M9 |

★ = the three flagship skills in the vertical slice. They are exactly **one lap around the loop**
(serve → data → secure), which is why they're the right first slice; the rest is the scale-out.

## Decisions confirmed (2026-07-06)

- **Packaging:** a **standalone cross-agent skill-pack repo** (working name `acme-ai-ops`) that is a public
  `SKILL.md` tap installable into Hermes / Claude Code / Codex / OpenCode, AND doubles as the **M9** course
  module (assets referenced from `303-containerai`).
- **First build:** the **3-skill vertical slice** (`serving-doctor` + `build-rag-index` + `secure-ai-image`)
  wired into ONE runnable Hermes agent, validated live. Full ~11-skill catalog is the scale-out after.

## Still-open (defaults, decide at build)

- Module slot/label: standalone **M9 "Bonus"** vs Capstone appendix (default: standalone bonus).
- Demo single-agent vs a stretch "second profile" preview of multi-agent (default: single-agent; mention
  profiles as the multi-agent on-ramp).
- Public tap repo name + where it's hosted (default: `github.com/schoolofdevops/acme-ai-ops`, initcron).
