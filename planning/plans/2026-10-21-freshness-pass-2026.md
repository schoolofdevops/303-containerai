# 2026 Freshness Pass Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bring every lab, lesson, quiz, deck and script of the course up to October-2026 facts (model, engines, MCP spec, tool versions) and re-validate all 10 labs live, shipped as v1.9.0.

**Architecture:** This is a cross-cutting edit of an existing, fully validated course. Nothing structural changes: same modules, same growing compose files, same checks backbone (`labs/<m>/checks.json` + `scripts/run-checks.mjs` + `scripts/test-course.sh`). The one new mechanism is "thinking off": the new default model reasons by default, so every model call in the course gains an explicit switch-off (native API `think: false`, OpenAI-compatible API `reasoning_effort: "none"`, langchain-ollama `reasoning=False`), and M2 teaches why.

**Tech Stack:** Docusaurus 3 (MDX, Mermaid, `<Quiz>`), Rancher Desktop (docker 29.x), native Ollama, ChromaDB, ToolHive, KitOps, Node 22 checks runner.

**Spec:** No separate design doc. Founder-approved scope (conversation of 2026-10-21): the "Fix (stale facts)" list below. The three "Add" items (sandboxing deep-dive, observability service, M1/M3/M4 extensions) are **separate later plans**, not this one. Hermes M9 is on hold.

## Decisions already made (verified live on this machine, 2026-10-21)

| Decision | Value | Evidence |
| --- | --- | --- |
| Default lab model | `qwen3.5:2b` (replaces `qwen2.5:1.5b`) | pulled, 2.7 GB on disk, 2.4 GB resident "100% GPU", 48 tok/s on Metal, `tools` capability, tool call returned correct JSON |
| "Bigger model" upgrade path | `qwen3:4b` (replaces `qwen2.5:3b`) | `qwen3.5` has no 3–4B tag; `qwen3:4b` exists |
| Embedding model | `nomic-embed-text` (unchanged) | — |
| Thinking default | ON for `qwen3.5:2b` (`/api/show` → `thinking: {values:[false,true], default:true}`) | without a switch-off, a `/v1/chat/completions` call burned 4,080 reasoning tokens and returned empty `content` |
| Switch-off, native API | `"think": false` on `/api/chat` and `/api/generate` | returned 1-sentence answer |
| Switch-off, OpenAI API | `"reasoning_effort": "none"` on `/v1/chat/completions` | returned 11-token answer; `/no_think` in the prompt does NOT work on qwen3.5 |
| Switch-off, Modelfile | not possible (`PARAMETER think` → "unknown parameter") | so every caller must pass it explicitly |
| Chroma | server image `chromadb/chroma:1.5.9` (replaces `0.5.20`), client `chromadb==1.5.9` | PyPI latest 1.5.9 |
| ToolHive | `v0.55.2` (replaces `v0.33.0`) | GitHub latest release |
| KitOps | keep `v1.15.0` (latest 1.16.0 is a minor bump; M4 validated as is) | — |
| Ollama on this machine | upgrade `0.34.4` → latest `0.40.x` before validating (Apple Silicon now defaults to the MLX engine) | installed as `/Applications/Ollama.app` + `/usr/local/bin/ollama` |

## Global Constraints

- 16 GB arm64 reference laptop; no lab may exceed ~4–6 GB peak. `qwen3.5:2b` resident = 2.4 GB.
- Model server stays NATIVE on Apple Silicon; containers reach it at `http://host.docker.internal:11434`.
- Authored lab prose uses plain `docker` / `docker compose`; automated validation on this machine prefixes `PATH="$HOME/.rd/bin:$PATH"`.
- Every command block in a lab is followed by an **Expected output** block with REAL captured output; evidence goes to `planning/lab-tests/mN.md` (overwrite the old evidence file for each re-validated module, keep the header format already used there).
- Admonitions use the bracket form `:::warning[Title]`.
- Quiz schema is exactly `{prompt, multiSelect?, options:[{text, correct, explanation}]}`.
- Lesson prose must pass the `gourav-voice` skill (written register) before commit; narration files pass the spoken register.
- Commit after each task, author `initcron <bean@initcron.org>`, trailer `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>`. Work on branch `freshness-2026`, PR to `main` at the end.
- Historical evidence/QA files under `planning/lab-tests/`, `planning/learner-qa/`, `planning/plans/` (other than this plan) are NOT bulk-edited; only the module evidence files rewritten by re-validation change.

## Review Focus

1. **A model call without the switch-off.** Any `/api/generate`, `/api/chat`, `/v1/chat/completions` or langchain call that omits the think-off burns the whole 4,096-token budget and returns empty text. Expected: every call in `labs/` and in lab prose carries the switch. Pinned by the `think-off-v1` check in Task 2 and the grep assertion in Task 9.
2. **Chroma 1.x removed the `/api/v1` HTTP paths.** `labs/m6/agent/agent.py` and `labs/m7/crew/crew.py` call `/api/v1/collections` raw. Expected: they work against `chromadb/chroma:1.5.9`. Pinned by M6/M7 checks in Tasks 6 and 7.
3. **ToolHive 0.55 may rename or drop the per-server helper containers** (`fetch-ingress`, `fetch-egress`, `fetch-dns`) that the M6 lesson, lab and quiz describe. Expected: prose matches what `docker ps` really shows. Pinned by the "Inspect the isolation stack" capture in Task 6.
4. **Learner on an older Ollama.** `reasoning_effort: "none"` is honoured on 0.34.4 (tested) but the MLX-engine claim is only true on ≥ 0.40. Expected: prerequisites state the floor and M2 says "0.40 or newer" when it talks about MLX. Pinned by Task 3 step 4 and Task 8.
5. **Expected-output drift from the MLX engine.** `ollama ps` columns, `/api/show` details and timings differ from the July captures. Expected: every re-captured block is pasted from the new run, never hand-edited. Pinned by the lab-validation step of every module task.

---

### Task 0: Branch + environment refresh

**Files:**
- Modify: `planning/lab-tests/00-environment.md`
- Modify: `CLAUDE.md:117-125` (Environment facts block) and `CLAUDE.md:145` (Dev models line)

- [ ] **Step 1: Create the working branch**

```bash
git checkout -b freshness-2026
```

- [ ] **Step 2: Upgrade Ollama** — open `/Applications/Ollama.app` → menu bar icon → "Check for Updates…" (or download the current macOS installer from https://ollama.com/download and replace the app). Then:

Run: `ollama --version`
Expected: `ollama version is 0.40.x` (any 0.40 or newer)

- [ ] **Step 3: Pull models and confirm the engine**

Run:
```bash
ollama pull qwen3.5:2b && ollama pull qwen3:4b && ollama pull nomic-embed-text
curl -s http://localhost:11434/api/chat -d '{"model":"qwen3.5:2b","stream":false,"think":false,"messages":[{"role":"user","content":"Say OK"}]}' | jq -r .message.content
ollama ps
```
Expected: a one-word answer; `ollama ps` shows `qwen3.5:2b` at `100% GPU`. Note the engine shown by `ollama show qwen3.5:2b` (MLX or llama.cpp) — M2's lesson text in Task 3 must state what you actually see.

- [ ] **Step 4: Upgrade ToolHive to v0.55.2**

```bash
curl -fsSL https://github.com/stacklok/toolhive/releases/download/v0.55.2/toolhive_0.55.2_darwin_arm64.tar.gz | tar -xz -C /tmp && sudo mv /tmp/thv /usr/local/bin/thv
thv version
```
Expected: `ToolHive v0.55.2`

- [ ] **Step 5: Re-capture `planning/lab-tests/00-environment.md`** — same sections as today (docker version, ollama version/list, `ollama ps`, container→host curl), fresh output pasted verbatim, date `2026-10-21`.

- [ ] **Step 6: Update `CLAUDE.md`** Environment facts: Ollama version, model line → `qwen3.5:2b` (2.7 GB) + `qwen3:4b` optional + `nomic-embed-text`; ToolHive `v0.55.2`; add one line: "`qwen3.5` thinks by default — every call passes `think:false` (native) or `reasoning_effort:"none"` (`/v1`)".

- [ ] **Step 7: Commit**

```bash
git add planning/lab-tests/00-environment.md CLAUDE.md
git commit -m "chore(env): Ollama 0.40, qwen3.5:2b default, ToolHive v0.55.2 — environment re-verified"
```

---

### Task 1: Global model rename (text only, no behaviour change)

**Files:**
- Modify: every file under `labs/`, `site/docs/`, `site/static/decks/`, `planning/decks/`, `planning/narration/`, plus `course.config.json`, `labs/tools/container-xray/index.html`, `containers_genai_agentic.md`, `AGENTS.md` that contains `qwen2.5:1.5b` or `qwen2.5:3b`.
- NOT modified: `planning/lab-tests/`, `planning/learner-qa/`, `planning/plans/` (except this file), `planning/specs/`, `site/static/sims/` (sims are grounded in captured runs and say so in their footnote).

**Interfaces:**
- Produces: the literal strings `qwen3.5:2b` (default) and `qwen3:4b` (upgrade) everywhere a learner reads or runs them. Later tasks assume these names.

- [ ] **Step 1: Write the assertion script** `scripts/assert-model-refs.sh`:

```bash
#!/usr/bin/env bash
# Fails if any learner-facing file still names the retired models.
set -euo pipefail
cd "$(dirname "$0")/.."
if rg -n "qwen2\.5:(1\.5b|3b)" labs site/docs site/static/decks planning/decks planning/narration course.config.json labs/tools CLAUDE.md; then
  echo "FAIL: retired model names found"; exit 1
fi
echo "OK: no retired model names"
```

- [ ] **Step 2: Run it to verify it fails**

Run: `bash scripts/assert-model-refs.sh`
Expected: prints matches, exits 1.

- [ ] **Step 3: Rename** with `sd` or `sed -i ''` across the file set above: `qwen2.5:1.5b` → `qwen3.5:2b`, `qwen2.5:3b` → `qwen3:4b`. Then fix prose that describes size or vintage next to those names (M2 lesson model table row sizes: `qwen3.5:2b` ≈ 2.7 GB on disk; `qwen3:4b` ≈ 2.5 GB). In `site/docs/m6-declarative-agent/lesson.md:133` the phrase "A small local model like `qwen3.5:2b`" stays valid.

- [ ] **Step 4: Run the assertion**

Run: `bash scripts/assert-model-refs.sh`
Expected: `OK: no retired model names`

- [ ] **Step 5: Site still builds**

Run: `cd site && npm run build 2>&1 | tail -3`
Expected: `[SUCCESS] Generated static files in "build".`

- [ ] **Step 6: Commit**

```bash
git add -A labs site/docs site/static/decks planning/decks planning/narration course.config.json scripts/assert-model-refs.sh containers_genai_agentic.md AGENTS.md
git commit -m "refactor: default model qwen2.5:1.5b -> qwen3.5:2b, upgrade path -> qwen3:4b (text rename)"
```

---

### Task 2: Thinking switch-off in every lab call + M1/M2 re-validation

**Files:**
- Modify: `labs/m1/call-ollama.sh`, `site/docs/m1-container-native/lab.md:93` (curl body), `labs/m1/checks.json:10`
- Modify: `labs/m2/` client (the Python/curl client the compose `client` service runs), `site/docs/m2-serving/lab.md:53-123` (both `/v1/chat/completions` curl bodies), `labs/m2/checks.json`
- Modify: `labs/m6/agent/agent.py:46` payload, `labs/m7/crew/crew.py:27` payload
- Modify: `labs/m5/app/app.py:73` (`OllamaLLM(...)` call)
- Modify: `labs/capstone/platform-check.sh` and `labs/capstone/up.sh` wherever they call the model

**Interfaces:**
- Produces: every Ollama call in the course carries exactly one of: JSON `"think": false` (native endpoints), JSON `"reasoning_effort": "none"` (`/v1`), kwarg `reasoning=False` (langchain-ollama).

- [ ] **Step 1: Add the failing check** to `labs/m2/checks.json`:

```json
{ "id": "think-off-v1",
  "describe": "/v1/chat/completions with reasoning_effort=none returns non-empty content in under 200 completion tokens",
  "run": "curl -s http://localhost:11434/v1/chat/completions -H 'Content-Type: application/json' -d '{\"model\":\"qwen3.5:2b\",\"reasoning_effort\":\"none\",\"messages\":[{\"role\":\"user\",\"content\":\"Say OK\"}]}' | jq -r 'if (.choices[0].message.content|length) > 0 and .usage.completion_tokens < 200 then \"THINK-OFF-OK\" else \"THINK-LEAK\" end'",
  "assert": { "contains": "THINK-OFF-OK" } }
```
and a sibling `think-off-native` check that posts `{"model":"qwen3.5:2b","prompt":"Say OK","stream":false,"think":false}` to `/api/generate` and asserts `.response|length > 0` and `.eval_count < 200` (print `THINK-OFF-OK` the same way).

- [ ] **Step 2: Run the M2 checks to see the new ones pass and the old model check fail**

Run: `node scripts/run-checks.mjs labs/m2/checks.json`
Expected: `ollama-v1-models` passes only after Task 1 (it now asserts `qwen3.5:2b`); `think-off-*` pass (they talk to Ollama directly, not to lab code yet).

- [ ] **Step 3: Add the switch-off to lab code** — M1 script and lab curl: add `"think": false` to the JSON body. M2 lab curls and client: add `"reasoning_effort": "none"`. M6 `agent.py` and M7 `crew.py`: add `"think": False` to the `/api/generate` payload dict. M5 `app.py`: `OllamaLLM(model=LLM_MODEL, base_url=..., reasoning=False, ...)` (requires `langchain-ollama>=0.3.0`; the pin bump happens in Task 5, so this line lands there too — leave M5 for Task 5). Capstone scripts: same as M1.

- [ ] **Step 4: Validate M1 and M2 live** — dispatch `coursesmith:lab-validation` for `m1` then `m2`: it runs the lab, pastes real Expected-output blocks back into `lab.md`, writes `planning/lab-tests/m1.md` and `m2.md`, and asserts `checks.json`.

Run: `node scripts/run-checks.mjs labs/m1/checks.json && node scripts/run-checks.mjs labs/m2/checks.json`
Expected: all checks `PASS`.

- [ ] **Step 5: Commit**

```bash
git add labs/m1 labs/m2 labs/m6/agent/agent.py labs/m7/crew/crew.py labs/capstone site/docs/m1-container-native/lab.md site/docs/m2-serving/lab.md planning/lab-tests/m1.md planning/lab-tests/m2.md
git commit -m "feat: explicit thinking switch-off on every model call; M1+M2 re-validated on qwen3.5:2b"
```

---

### Task 3: M2 lesson + quiz — engines, Docker Model Runner, reasoning models

**Files:**
- Modify: `site/docs/m2-serving/lesson.md` (§1 lines 20-32, §2 table lines 42-48 and line 106, §4 model table ~line 117, new §6 before Summary, Summary table ~line 163)
- Modify: `site/docs/m2-serving/quiz.mdx` (+1 question)
- Modify: `planning/narration/02-narration.md`, `planning/decks/02-serving-sequence.md`, `site/static/decks/02-serving.html` (one subtitle/caption if the engine line is on a slide)

- [ ] **Step 1: §1 Docker Model Runner** — rewrite the two factual sentences: DMR runs on Docker Desktop AND Docker CE on Linux; engines are llama.cpp by default, vLLM on NVIDIA (Linux/WSL2), and vllm-metal on Apple Silicon; `models:` is a Compose Spec top-level element (provider services), not a Desktop-only feature. Keep the course's stance sentence ("we lead with runtime-agnostic engines") unchanged.

- [ ] **Step 2: §2 engines** — Ollama row and line 46: on Apple Silicon Ollama 0.40+ runs supported models on the **MLX** engine by default and falls back to llama.cpp; everywhere else llama.cpp. Line 106 ("GGUF … llama.cpp (and therefore Ollama)") → add "or, on Apple Silicon, MLX-format weights". Write what Step 3 of Task 0 actually showed.

- [ ] **Step 3: New §6 "Reasoning models and the universal contract"** (~250 words, one analogy, one small Mermaid sequence: client → `/v1` → engine, with the `reasoning_effort` knob labelled). Must state: thinking models reason before answering; the reasoning tokens count against `max_tokens`; `/api/show` exposes `thinking.values` and `default`; the three switch-offs (`think:false`, `reasoning_effort:"none"`, `reasoning=False`); why the course labs always switch it off (small model, deterministic labs, token budget) and when you would leave it on.

- [ ] **Step 4: Prerequisite floor** — in §2 or §6 add one sentence: "Ollama 0.40 or newer" (MLX engine, Anthropic Messages API compatibility); the labs' switch-off itself works on older releases too.

- [ ] **Step 5: Quiz** — add one question: "You call `/v1/chat/completions` on `qwen3.5:2b` and get `content: ""` with `completion_tokens: 4080`. What happened and what fixes it?" Correct option: thinking consumed the budget; pass `reasoning_effort: "none"`. Distractors: raise `max_tokens` (wrong: just burns more), add `/no_think` to the prompt (wrong on qwen3.5), the model lacks `tools` (irrelevant).

- [ ] **Step 6: Voice pass** — run `gourav-voice` (written register) on the new/changed paragraphs; run `humanizer` tells check.

- [ ] **Step 7: Build + render check**

Run: `cd site && npm run build 2>&1 | tail -3`
Expected: `[SUCCESS]`; open `/303-containerai/m2-serving/lesson` in `npm run serve` and confirm §6 and the Mermaid block render.

- [ ] **Step 8: Commit**

```bash
git add site/docs/m2-serving planning/narration/02-narration.md planning/decks/02-serving-sequence.md site/static/decks/02-serving.html
git commit -m "docs(m2): MLX engine, DMR on CE + vLLM backends, new section on reasoning models and the /v1 contract"
```

---

### Task 4: M4 lesson — Docker Model Runner claims

**Files:**
- Modify: `site/docs/m4-packaging/lesson.md:63-70` (comparison table) and `:201` (Summary row)

- [ ] **Step 1: Fix the two wrong cells**: `docker model package` is available on Docker Desktop AND Docker CE (the `docker model` CLI plugin is OSS); the honest difference is scope (ModelKit = model + data + code + config + adapter layers, any OCI registry, CNCF; `docker model package` = GGUF-only artifact aimed at DMR). Keep the ModelKit recommendation.

- [ ] **Step 2: Voice pass on the changed rows' surrounding paragraph.**

- [ ] **Step 3: Build**

Run: `cd site && npm run build 2>&1 | tail -1`
Expected: `[SUCCESS]`

- [ ] **Step 4: Commit**

```bash
git add site/docs/m4-packaging/lesson.md
git commit -m "docs(m4): correct Docker Model Runner packaging claims (runs on CE; difference is scope, not licence)"
```

---

### Task 5: M5 — Chroma 1.x, langchain-ollama bump, re-validation (lab + deep-dive)

**Files:**
- Modify: `labs/m5/compose.yaml:11` (image), `labs/m5/app/requirements.txt`, `labs/m5/app/app.py:73-90`
- Modify: `site/docs/m5-naive-rag/lab.md:75,93` (pin + explanation), `site/docs/m5-naive-rag/quiz.mdx:60-70` (the pin question + explanations), `site/docs/m5-naive-rag/lesson.md` §5 if it names `0.5.x`
- Modify: `site/docs/m5-naive-rag/deep-dive.md` Expected-output blocks as re-captured
- Test: `labs/m5/checks.json`, `labs/m5/deep-dive.checks.json`

**Interfaces:**
- Produces: `chromadb/chroma:1.5.9` is the Chroma image for M5, M6, M7 and Capstone (Tasks 6–7 reuse the value).

- [ ] **Step 1: Run the M5 checks against the bumped image before changing code**, to see what breaks:

Set `image: chromadb/chroma:1.5.9` in `labs/m5/compose.yaml`, then
Run: `node scripts/run-checks.mjs labs/m5/checks.json`
Expected: FAIL on the app's Chroma handshake (client 0.5.20 vs server 1.5.9).

- [ ] **Step 2: Bump pins in `labs/m5/app/requirements.txt`**: `chromadb==1.5.9`, `langchain-chroma==0.2.x` (latest 0.2 line; 1.x requires langchain 1.0 and would break `ConversationalRetrievalChain`), `langchain-ollama==0.3.x` (latest 0.3 line; has `reasoning`), keep `langchain==0.3.x` / `langchain-community==0.3.x` at their latest 0.3 patch. Add `reasoning=False` to the `OllamaLLM(...)` call in `app.py`.

- [ ] **Step 3: Rebuild and re-run checks**

Run: `PATH="$HOME/.rd/bin:$PATH" docker compose -f labs/m5/compose.yaml build && node scripts/run-checks.mjs labs/m5/checks.json`
Expected: all PASS. If `langchain-chroma 0.2.x` refuses `chromadb 1.5.9`, step down the chromadb client to the newest 1.x that it accepts and pin the server image to the same minor; record the pair in `lab.md` line 93.

- [ ] **Step 4: Rewrite the pin explanation** (`lab.md:93`) and the quiz question's explanations: the pin now exists because client and server must share a major (1.x ↔ 1.x), and Chroma 1.0 replaced the `/api/v1` HTTP routes with `/api/v2`.

- [ ] **Step 5: Validate M5 lab and deep-dive live** via `coursesmith:lab-validation` for `m5` (both `checks.json` and `deep-dive.checks.json`); evidence to `planning/lab-tests/m5.md`.

Run: `node scripts/run-checks.mjs labs/m5/checks.json && node scripts/run-checks.mjs labs/m5/deep-dive.checks.json`
Expected: all PASS.

- [ ] **Step 6: Commit**

```bash
git add labs/m5 site/docs/m5-naive-rag planning/lab-tests/m5.md
git commit -m "feat(m5): Chroma 1.5.9 + langchain-ollama 0.3 with reasoning off; lab + deep-dive re-validated"
```

---

### Task 6: M6 — Chroma v2 API, ToolHive v0.55.2, MCP 2026-07-28, re-validation

**Files:**
- Modify: `labs/m6/compose.yaml:9` (image → `chromadb/chroma:1.5.9`), `labs/m6/agent/agent.py:51-70` (Chroma HTTP paths)
- Modify: `site/docs/m6-declarative-agent/lab.md:256-263` (ToolHive download + version), `:290-…` ("Inspect the isolation stack" Expected output), `:434` troubleshooting if wording changed
- Modify: `site/docs/m6-declarative-agent/lesson.md` §5 (lines 104-128): +1 paragraph, container-name sentence re-checked
- Modify: `site/docs/m6-declarative-agent/quiz.mdx` (+1 question; fix any option naming `fetch-ingress` if it no longer exists)
- Test: `labs/m6/checks.json`

**Interfaces:**
- Consumes: Chroma image value from Task 5.
- Produces: `chroma_v2_base(host) -> str` helper in `agent.py` returning `f"{CHROMA}/api/v2/tenants/default_tenant/databases/default_database"`; Task 7 copies the same three-call pattern into `crew.py`.

- [ ] **Step 1: Bump the image and run the checks to see the v1 route fail**

Run: `node scripts/run-checks.mjs labs/m6/checks.json`
Expected: the three agent checks FAIL with an HTTP 410/404 from `/api/v1/collections`.

- [ ] **Step 2: Migrate `agent.py` to Chroma v2 routes**: collections live under `/api/v2/tenants/default_tenant/databases/default_database/collections`; `add` and `query` are `POST .../collections/{id}/add` and `.../query` under that same base. Keep the `get_or_create` body. (`think: False` is already in the generate payload from Task 2.)

- [ ] **Step 3: Re-run the M6 checks**

Run: `PATH="$HOME/.rd/bin:$PATH" docker compose -f labs/m6/compose.yaml build && node scripts/run-checks.mjs labs/m6/checks.json`
Expected: PASS (runbook answer, 2+2, password refusal).

- [ ] **Step 4: ToolHive 0.55.2 in the lab**: update the download URL and the `thv version` Expected output; re-run `thv run fetch` and re-capture the "Inspect the isolation stack" `docker ps` block verbatim. If the helper containers are named differently (or gone), rewrite the matching sentence in `lesson.md` §5 and the quiz option that names them so prose equals reality.

- [ ] **Step 5: Lesson §5 paragraph "What changed in MCP in 2026"** (~120 words): the 2026-07-28 revision made the Streamable HTTP transport stateless (no `Mcp-Session-Id`, no `initialize` handshake; version and capabilities ride in `_meta` on each request); tasks moved to an extension; sampling and roots deprecated; governance under the Agentic AI Foundation. Container angle, stated explicitly: a stateless MCP server scales like any stateless microservice — replicas behind a plain load balancer, no sticky sessions — which is exactly how ToolHive's gateway now fronts them. One analogy (e.g., a ticket counter where every request carries its own ID, so any clerk can serve it).

- [ ] **Step 6: Quiz** — add one question on why statelessness matters for running MCP servers as containers (correct: any replica can serve any request; distractors: faster model inference, no auth needed, tools no longer need containers).

- [ ] **Step 7: Voice pass on the new paragraph; validate M6 live** via `coursesmith:lab-validation` for `m6`; evidence to `planning/lab-tests/m6.md` (header must say `thv v0.55.2`).

- [ ] **Step 8: Commit**

```bash
git add labs/m6 site/docs/m6-declarative-agent planning/lab-tests/m6.md
git commit -m "feat(m6): Chroma v2 routes, ToolHive v0.55.2, MCP 2026-07-28 stateless transport taught; lab re-validated"
```

---

### Task 7: M7 + Capstone — Chroma v2, re-validation (lab, deep-dive, platform)

**Files:**
- Modify: `labs/m7/compose.yaml:9`, `labs/m7/crew/crew.py:41-58` (same v2 migration as Task 6), `labs/capstone/compose.yaml:21`
- Modify: `site/docs/m7-multi-agent/lab.md`, `site/docs/m7-multi-agent/deep-dive.md`, `site/docs/capstone/index.md` Expected-output blocks as re-captured
- Test: `labs/m7/checks.json`, `labs/m7/deep-dive.checks.json`, `labs/capstone/checks.json`

- [ ] **Step 1: Run M7 checks with the bumped image → expect the v1 route failure** (same as Task 6 step 1).

- [ ] **Step 2: Migrate `crew.py` to the v2 routes** using the exact base path from Task 6's Interfaces.

- [ ] **Step 3: Checks pass**

Run: `PATH="$HOME/.rd/bin:$PATH" docker compose -f labs/m7/compose.yaml build && node scripts/run-checks.mjs labs/m7/checks.json && node scripts/run-checks.mjs labs/m7/deep-dive.checks.json`
Expected: all PASS. If the crew's outcome markers change with the new model, that is content, not a bug — re-capture; but if the Reviewer step never reaches its marker, bump `LLM_MODEL` to `qwen3:4b` in `labs/m7/compose.yaml` and say so in the lab's troubleshooting callout.

- [ ] **Step 4: Validate M7 and Capstone live** via `coursesmith:lab-validation` for `m7` then `capstone`; evidence to `planning/lab-tests/m7.md` and `capstone.md`.

Run: `node scripts/run-checks.mjs labs/capstone/checks.json`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add labs/m7 labs/capstone site/docs/m7-multi-agent site/docs/capstone planning/lab-tests/m7.md planning/lab-tests/capstone.md
git commit -m "feat(m7,capstone): Chroma v2 routes; crew + platform re-validated on qwen3.5:2b"
```

---

### Task 8: M3, M3B, M8, setup pages — re-validate the rest

**Files:**
- Modify: `site/docs/setup/prerequisites.md` (model pull line; add "Ollama 0.40 or newer"), `site/docs/m8-security/lab.md` (one model ref already renamed; Expected outputs re-captured), `site/docs/m3-vllm/deep-dive.md` (six renamed refs; re-capture any block that shows them)
- Test: `labs/m3/checks.json`, `labs/m3/deep-dive.checks.json`, `labs/m3b/deep-dive.checks.json`, `labs/m8/checks.json`

- [ ] **Step 1: Prerequisites page** — replace the pull command with `ollama pull qwen3.5:2b` and `ollama pull nomic-embed-text`; add the Ollama floor sentence; state the on-disk size (2.7 GB).

- [ ] **Step 2: Run the remaining module checks** (M3 is SmolLM2 on CPU-vLLM and should be untouched; M8 scans the M7 crew image, which was rebuilt in Task 7; M3B deep-dive checks hit native Ollama):

Run: `for m in m3 m3b m8; do for c in labs/$m/checks.json labs/$m/deep-dive.checks.json; do [ -f $c ] && node scripts/run-checks.mjs $c; done; done`
Expected: all PASS. Any FAIL → validate that module via `coursesmith:lab-validation` and re-capture.

- [ ] **Step 3: Commit**

```bash
git add site/docs/setup site/docs/m8-security site/docs/m3-vllm site/docs/m3b-finetuning planning/lab-tests
git commit -m "docs: prerequisites on qwen3.5:2b + Ollama 0.40 floor; M3/M3B/M8 checks green"
```

---

### Task 9: Whole-course gate, changelog, release v1.9.0

**Files:**
- Modify: `CHANGELOG.md` (new `## [1.9.0] - <date>` on top), `planning/STATE.md`, `planning/ROADMAP.md` (new "Phase 4 — 2026 freshness pass" table), `course.config.json` (already renamed; bump `version` if it carries one)

- [ ] **Step 1: Full smoke test**

Run: `bash scripts/test-course.sh 2>&1 | tail -15`
Expected: `10/10` modules green (same summary line the script printed in July).

- [ ] **Step 2: Grep gates**

Run: `bash scripts/assert-model-refs.sh && ! rg -n "api/v1/collections" labs && ! rg -n "v0\.33\.0" site/docs labs`
Expected: `OK: no retired model names` and both negative greps silent (exit 0 overall).

Then the think-off coverage grep — every generate/chat call site carries a switch:
Run: `rg -n "api/generate|api/chat|v1/chat/completions" labs site/docs --glob '*.py' --glob '*.sh' --glob '*.md' | rg -v "think|reasoning_effort|reasoning=False" | rg -v "^site/docs/.*lesson.md"`
Expected: no output (lesson prose may mention the endpoints without a switch; labs and scripts may not).

- [ ] **Step 3: Site build + link check**

Run: `cd site && npm run build 2>&1 | rg -i "success|broken|error" | head`
Expected: `[SUCCESS]`, no broken links.

- [ ] **Step 4: Changelog, state, roadmap** — `CHANGELOG.md` 1.9.0 with Changed (model, engine facts, Chroma 1.x, ToolHive 0.55.2, MCP 2026 text, DMR claims) and Added (M2 §6 reasoning-models section + quiz Q, M6 MCP-2026 paragraph + quiz Q, `scripts/assert-model-refs.sh`, think-off checks). `STATE.md` header → "v1.9.0 released; next: sandboxing deep-dive plan". `ROADMAP.md` → Phase 4 table, all ✅.

- [ ] **Step 5: PR, merge, tag, verify deploy**

```bash
git push -u origin freshness-2026
gh pr create --title "2026 freshness pass (v1.9.0)" --body "Model qwen3.5:2b, Ollama 0.40/MLX, Chroma 1.5.9, ToolHive v0.55.2, MCP 2026-07-28, DMR claims fixed. All 10 labs re-validated (planning/lab-tests/). 🤖 Generated with [Claude Code](https://claude.com/claude-code)"
gh pr merge --merge --delete-branch
git checkout main && git pull
git tag -a v1.9.0 -m "v1.9.0: 2026 freshness pass" && git push origin v1.9.0
gh release create v1.9.0 --title v1.9.0 --notes-from-tag
gh run watch "$(gh run list --branch main --limit 1 --json databaseId -q '.[0].databaseId')" --exit-status
```
Expected: run concludes `success`; `curl -s -o /dev/null -w '%{http_code}' https://schoolofdevops.github.io/303-containerai/m2-serving/lesson` → `200` and the page shows the new §6.
