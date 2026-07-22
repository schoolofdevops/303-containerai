# Phase 1 — Testing Backbone + Fork Staging Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the whole existing course automatically testable (per-lab checks + one smoke command + cold learner-QA) and stand up an independent staging deploy on the initcron fork — all before the upcoming workshop.

**Architecture:** Fork (`initcron/303-containerai`) = staging: push → its Actions deploy Pages → QA there → merge to origin. Per-lab `labs/<id>/checks.json` assertions run by a vendored zero-dep Node runner; `scripts/test-course.sh` orchestrates up → check → down per module sequentially (respects 16 GB budget).

**Tech Stack:** Node ≥18 (built-ins only), bash, Rancher Desktop docker, Ollama native, coursesmith skills (`lab-validation`, `learner-qa`).

**Spec:** `planning/specs/2026-07-22-depth-retrofit-design.md`

## Global Constraints

- `docker` NOT on default PATH → every automated command uses `PATH="$HOME/.rd/bin:$PATH"`.
- ToolHive needs `DOCKER_HOST=unix://$HOME/.rd/docker.sock`.
- Model server native; containers reach it at `http://host.docker.internal:11434`.
- Peak memory per module ≤ ~4–6 GB → smoke test runs modules SEQUENTIALLY with teardown between.
- Existing decks (`site/static/decks/*.html`), lessons, labs, quizzes: DO NOT modify except real defects found by QA.
- Commits authored `initcron <bean@initcron.org>` (`git -c user.name=initcron -c user.email=bean@initcron.org commit ...`).
- checks.json assert kinds: `exit` | `contains` | `matches` (regex, `m` flag) | `absent`. State-tolerant: prefer `contains` on stable strings over anchored regex; never assert on generative model wording — assert JSON shape/keys.
- After every task: update `planning/STATE.md` (and `planning/ROADMAP.md` when module status changes).

---

### Task 1: Fork staging live

**Files:**
- None created (infra + push only).

**Interfaces:**
- Produces: staging site `https://initcron.github.io/303-containerai/` auto-deploying from fork `main` — the QA target for every later task.

- [ ] **Step 1: Enable Pages on fork (workflow build)**

```bash
gh api -X POST repos/initcron/303-containerai/pages -f build_type=workflow
```

Expected: JSON response with `"build_type": "workflow"`. If 409 (already exists): `gh api -X PUT repos/initcron/303-containerai/pages -f build_type=workflow`.

- [ ] **Step 2: Push current main to fork**

```bash
git push fork main
```

Expected: fork main now at local HEAD. (No workflow-file changes in this push, so no `workflow`-scope issue.)

- [ ] **Step 3: Verify fork Actions deploy goes green**

```bash
gh run list --repo initcron/303-containerai --limit 3
gh run watch --repo initcron/303-containerai $(gh run list --repo initcron/303-containerai --limit 1 --json databaseId --jq '.[0].databaseId')
```

Expected: `Deploy Docusaurus to GitHub Pages` run → success. If Actions disabled on fork: `gh api -X PUT repos/initcron/303-containerai/actions/permissions -f enabled=true -f allowed_actions=all` and re-run.

- [ ] **Step 4: Verify staging pages return 200**

```bash
for p in "" "docs/intro" "docs/m1-container-native/lesson" "docs/m3b-finetuning/lab"; do
  curl -s -o /dev/null -w "%{http_code} $p\n" "https://initcron.github.io/303-containerai/$p"
done
```

Expected: four lines of `200`.

- [ ] **Step 5: Record in STATE.md + commit**

Add to `planning/STATE.md` under a new "Depth retrofit (2026-07-22)" section: fork staging live, URL, deploy flow. Commit:

```bash
git add planning/STATE.md
git -c user.name=initcron -c user.email=bean@initcron.org commit -m "chore(staging): fork Pages live at initcron.github.io/303-containerai"
```

---

### Task 2: Vendor checks runner + prove it

**Files:**
- Create: `scripts/run-checks.mjs` (copy from `/Users/gshah/work/apps/learning/coursesmith/scripts/run-checks.mjs`, verbatim)
- Create: `labs/m1/checks.json` (worked example + first real module)

**Interfaces:**
- Produces: `node scripts/run-checks.mjs labs/<id>/checks.json` → per-check ✅/❌ + `N/M checks · score S/W`, exit 0 iff all pass. All later checks tasks rely on this exact CLI.

- [ ] **Step 1: Copy the runner**

```bash
mkdir -p scripts
cp /Users/gshah/work/apps/learning/coursesmith/scripts/run-checks.mjs scripts/run-checks.mjs
```

- [ ] **Step 2: Write failing-first m1 checks** — `labs/m1/checks.json`:

```json
{
  "checks": [
    { "id": "runtime-up", "describe": "container runtime responds", 
      "run": "PATH=\"$HOME/.rd/bin:$PATH\" docker version", 
      "assert": { "exit": 0 } },
    { "id": "ollama-native", "describe": "native Ollama serving with qwen2.5:1.5b pulled", 
      "run": "curl -s http://localhost:11434/api/tags", 
      "assert": { "contains": "qwen2.5:1.5b" } },
    { "id": "container-to-host", "describe": "throwaway container reaches host Ollama and gets an inference response", 
      "run": "PATH=\"$HOME/.rd/bin:$PATH\" docker run --rm curlimages/curl:latest -s http://host.docker.internal:11434/api/generate -d '{\"model\":\"qwen2.5:1.5b\",\"prompt\":\"Say OK\",\"stream\":false}'", 
      "assert": { "contains": "\"response\"" } }
  ]
}
```

- [ ] **Step 3: Verify a failure fails correctly** (RED analog)

Stop nothing — instead run with Ollama check pointed at a wrong port to prove the runner catches failures:

```bash
node -e "
import('./scripts/run-checks.mjs').then(m => {
  const r = m.runChecks({checks:[{id:'x',run:'true',assert:{contains:'nope'}}]}, c => ({code:0, stdout:''}));
  if (r.passed !== 0) { console.error('runner did not fail a failing check'); process.exit(1); }
  console.log('runner correctly fails failing checks');
})"
```

Expected: `runner correctly fails failing checks`.

- [ ] **Step 4: Run m1 checks live (GREEN)**

```bash
node scripts/run-checks.mjs labs/m1/checks.json
```

Expected: `3/3 checks · score 3/3`, exit 0. (Rancher Desktop + Ollama must be running — probe first per `planning/lab-tests/00-environment.md`.)

- [ ] **Step 5: Commit**

```bash
git add scripts/run-checks.mjs labs/m1/checks.json
git -c user.name=initcron -c user.email=bean@initcron.org commit -m "feat(checks): vendor run-checks runner + m1 lab assertions"
```

---

### Task 3: checks.json for m2, m3, m3b, m4 (+ optional up/down helpers)

**Files:**
- Create: `labs/m2/checks.json`, `labs/m3/checks.json`, `labs/m3b/checks.json`, `labs/m4/checks.json`
- Create where the lab needs running services: `labs/<id>/up.sh`, `labs/<id>/down.sh` (see contract below)

**Interfaces:**
- Consumes: `node scripts/run-checks.mjs <file>` from Task 2.
- Produces: per-module checks green; **up/down contract** used by Task 5's smoke script: if `labs/<id>/up.sh` exists it must start everything the checks need and exit 0 when ready (poll, don't sleep blind); `down.sh` must tear down fully (containers, volumes where the lab says so) and be idempotent. Both `chmod +x`, both prefix `PATH="$HOME/.rd/bin:$PATH"`.

**Derivation procedure (same for every module — this IS the step content):**

1. Read `site/docs/<module>/lab.md` end-to-end + the module's evidence in `planning/lab-tests/<id>.md`.
2. Identify the lab's SUCCESS END-STATE (the final proof step of the lab, not intermediate steps). Write 3–6 checks that assert that end-state: services up, endpoint answering with expected JSON keys/model name, artifact produced (file/image/ModelKit), teardown-safe.
3. Assert stable strings only (image names, JSON keys, HTTP codes, filenames). Never model prose. For lists use `contains`; for formats use `matches` with `m` flag.
4. Write `up.sh`/`down.sh` if the checks need running services (m2: compose service; m3: vLLM container — up.sh must poll `/v1/models` until 200, timeout 180s, vLLM is slow to start; m3b: no services — checks assert on artifacts under `~/mlx-lora-lab` being ABSENT after teardown + `mlx_lm` importable in venv is NOT required post-teardown, so m3b checks assert the *pipeline tooling* instead: `python3 -c "import mlx_lm"` inside the venv if present, else assert lab assets exist in `labs/m3b/`; m4: local `registry:2` + kit CLI present).
5. Run live: `bash labs/<id>/up.sh && node scripts/run-checks.mjs labs/<id>/checks.json; bash labs/<id>/down.sh`. Iterate until green.
6. If live run exposes lab-prose drift (command no longer produces documented output), fix `lab.md` minimally and note it in `planning/lab-tests/<id>.md` with the real output.

**Module-specific end-states (from lab-tests evidence):**
- **m2:** containerized OpenAI-compatible client answers via `/v1` against native Ollama; `labs/m2/compose.yaml` service comes up; check `curl -s http://localhost:11434/v1/models` contains `qwen2.5:1.5b`.
- **m3:** vLLM CPU container (SmolLM2-135M, float32) serves `/v1/completions`; checks: container running, `/v1/models` contains `SmolLM2`, completion response has `"choices"`. Runtime VM must be ≥4 CPU/6 GB — up.sh should verify `docker info` memory and fail fast with a clear message otherwise.
- **m3b:** GPU/MLX-gated: checks assert the runnable scaffolding (venv creatable, `pip show mlx-lm` OR clear SKIP): use a `weight: 0`-style approach — NO. Runner has no skip; instead m3b checks assert only machine-independent facts: `labs/m3b/` assets exist, lab.md contains the version-variance admonition, and IF `~/mlx-lora-env` exists then `source ~/mlx-lora-env/bin/activate && python -c "import mlx_lm"` passes (guard inside the `run` command with `[ -d ~/mlx-lora-env ] || echo SKIP-OK`, assert `matches: "mlx_lm OK|SKIP-OK"`).
- **m4:** `kit version` exits 0; pack→push→pull round-trip against local `registry:2` (up.sh starts registry on :5000, down.sh removes it); check `kit list localhost:5000/...` contains the tag.

- [ ] **Step 1: m2 — derive, write, run live to green** (procedure above)
- [ ] **Step 2: m3 — derive, write, run live to green** (procedure above; 180s poll)
- [ ] **Step 3: m3b — derive, write, run live to green** (guarded checks as specified)
- [ ] **Step 4: m4 — derive, write, run live to green** (procedure above)
- [ ] **Step 5: Refresh evidence + commit**

Append real runner output per module to `planning/lab-tests/<id>.md` (dated section "checks.json validation 2026-07-XX").

```bash
git add labs/m2 labs/m3 labs/m3b labs/m4 planning/lab-tests
git -c user.name=initcron -c user.email=bean@initcron.org commit -m "feat(checks): lab assertions m2-m4 validated live"
```

---

### Task 4: checks.json for m5, m6, m7, m8, capstone

**Files:**
- Create: `labs/m5/checks.json` (+ `up.sh`/`down.sh`), `labs/m6/checks.json` (+ helpers), `labs/m7/checks.json` (+ helpers), `labs/m8/checks.json`, `labs/capstone/checks.json` (+ helpers)

**Interfaces:**
- Consumes: runner CLI (Task 2) + up/down contract (Task 3).
- Produces: all 10 modules have green checks — Task 5 smoke script iterates them.

Same derivation procedure as Task 3. Module-specific end-states:

- **m5:** ChromaDB container up + Streamlit app healthy + RAG round-trip: check `curl -s localhost:8000/api/v1/heartbeat` (Chroma 0.5.x) exits 0, app health endpoint 200, and a scripted question through the app's backend returns text containing a corpus-specific term (use the deterministic term from `planning/lab-tests/m5.md`, not model prose).
- **m6:** ToolHive: `DOCKER_HOST=unix://$HOME/.rd/docker.sock thv list` contains the fetch server after up.sh runs `thv run fetch`; agent script answers using retrieval; down.sh runs `thv rm` (per the fixed teardown in lab.md).
- **m7:** Incident Crew compose stack comes up; final crew run produces its output artifact (check the file/stdout marker recorded in `planning/lab-tests/m7.md`); down.sh = `docker compose down` in `labs/m7`.
- **m8:** deterministic, no services: syft SBOM of the lab image produces `.json` containing `"artifacts"`, trivy scan exits 0 with `--exit-code 0`, cosign present (`cosign version` exit 0), guardrail eval script passes (deterministic eval fixed in QA pass).
- **capstone:** `labs/capstone/compose.yaml` consolidated stack: `docker compose -f labs/capstone/compose.yaml up -d` then every service reaches healthy/running; each exposed endpoint returns its documented 200; down with volumes.

- [ ] **Step 1: m5 — derive, write, run live to green**
- [ ] **Step 2: m6 — derive, write, run live to green** (remember DOCKER_HOST)
- [ ] **Step 3: m7 — derive, write, run live to green**
- [ ] **Step 4: m8 — derive, write, run live to green**
- [ ] **Step 5: capstone — derive, write, run live to green**
- [ ] **Step 6: Refresh evidence + commit**

```bash
git add labs/m5 labs/m6 labs/m7 labs/m8 labs/capstone planning/lab-tests
git -c user.name=initcron -c user.email=bean@initcron.org commit -m "feat(checks): lab assertions m5-capstone validated live"
```

---

### Task 5: One-command smoke test

**Files:**
- Create: `scripts/test-course.sh`
- Modify: `README.md` (add "Pre-workshop smoke test" section, 5 lines)

**Interfaces:**
- Consumes: all `labs/*/checks.json` + optional `up.sh`/`down.sh` (Tasks 3–4 contract).
- Produces: `scripts/test-course.sh` → per-module PASS/FAIL + summary, exit 0 iff all pass. THE pre-workshop ritual.

- [ ] **Step 1: Write the script**

```bash
#!/usr/bin/env bash
# Pre-workshop smoke test: run every module's checks sequentially (memory budget!).
# Usage: scripts/test-course.sh [module ...]   e.g. scripts/test-course.sh m3 m5
set -u
export PATH="$HOME/.rd/bin:$PATH"
export DOCKER_HOST="${DOCKER_HOST:-unix://$HOME/.rd/docker.sock}"
cd "$(dirname "$0")/.."

mods=("$@")
if [ ${#mods[@]} -eq 0 ]; then
  mods=(m1 m2 m3 m3b m4 m5 m6 m7 m8 capstone)
fi

declare -a failed=()
for mod in "${mods[@]}"; do
  checks="labs/$mod/checks.json"
  [ -f "$checks" ] || { echo "SKIP $mod (no checks.json)"; continue; }
  echo ""
  echo "════════ $mod ════════"
  [ -x "labs/$mod/up.sh" ] && { "labs/$mod/up.sh" || { echo "FAIL $mod (up.sh)"; failed+=("$mod"); continue; }; }
  if node scripts/run-checks.mjs "$checks"; then
    echo "PASS $mod"
  else
    echo "FAIL $mod"
    failed+=("$mod")
  fi
  [ -x "labs/$mod/down.sh" ] && "labs/$mod/down.sh"
done

echo ""
echo "════════ SUMMARY ════════"
if [ ${#failed[@]} -eq 0 ]; then
  echo "ALL MODULES PASS"
  exit 0
else
  echo "FAILED: ${failed[*]}"
  exit 1
fi
```

```bash
chmod +x scripts/test-course.sh
```

- [ ] **Step 2: Prove failure path** — temporarily point at a bogus module: `scripts/test-course.sh m1 nosuch` → expect `SKIP nosuch`, exit 0; then break one m1 assert locally (edit `contains` to `zzz-never`), run `scripts/test-course.sh m1` → expect `FAILED: m1`, exit 1. Revert the edit.

- [ ] **Step 3: Full green run**

```bash
scripts/test-course.sh 2>&1 | tee planning/lab-tests/smoke-$(date +%Y%m%d).log
```

Expected: `ALL MODULES PASS`, exit 0. This is the longest step (~30–45 min with vLLM startup). Keep the log as evidence.

- [ ] **Step 4: README section + commit**

```bash
git add scripts/test-course.sh README.md planning/lab-tests
git -c user.name=initcron -c user.email=bean@initcron.org commit -m "feat(checks): one-command course smoke test (all modules green)"
```

---

### Task 6: course.config.json (as-built)

**Files:**
- Create: `course.config.json`
- Reference: `/Users/gshah/work/apps/learning/coursesmith/templates/course.config.schema.json`

**Interfaces:**
- Produces: valid config describing this course as-built (spine.mode `per-module`, modules m1–m8+m3b+capstone with slugs/titles, pages/repo/stack blocks) — future breadth modules run `/course-module` against it.

- [ ] **Step 1: Read the schema**, list required fields.
- [ ] **Step 2: Write `course.config.json`** matching the as-built course (module ids/slugs exactly as in `site/docs/`; repo `schoolofdevops/303-containerai`; pages URL the live site; lab.tools: docker, ollama, kit, thv, trivy, syft, cosign).
- [ ] **Step 3: Validate** — every `"required"` field of the schema present; module ids match `ls site/docs/`; JSON parses: `node -e "JSON.parse(require('fs').readFileSync('course.config.json','utf8')); console.log('valid JSON')"`.
- [ ] **Step 4: Commit**

```bash
git add course.config.json
git -c user.name=initcron -c user.email=bean@initcron.org commit -m "feat: course.config.json describing as-built course (coursesmith compat)"
```

---

### Task 7: Full learner-QA sweep on fork staging

**Files:**
- Create: `planning/learner-qa/full-sweep-2026-07.md` (report)
- Modify: any page/lab file where QA finds a REAL defect (minimal fixes only)

**Interfaces:**
- Consumes: staging site (Task 1), all checks green (Task 5).
- REQUIRED SUB-SKILL: `coursesmith:learner-qa` — one dispatch per module, in course order, each testing the seam with the previous module.

- [ ] **Step 1: Push current state to fork; wait for green deploy** (`git push fork main`, watch run).
- [ ] **Step 2: Dispatch learner-QA per module** against `https://initcron.github.io/303-containerai/` in order: setup → m1 → m2 → m3 → m3b → m4 → m5 → m6 → m7 → m8 → capstone. Strict learner role: published pages only, execute every command verbatim, record friction, fix NOTHING.
- [ ] **Step 3: Consolidate findings** into `planning/learner-qa/full-sweep-2026-07.md` (verdict per page + numbered findings).
- [ ] **Step 4: Fix real defects** (author role), smallest change that resolves each finding. Re-run affected module's checks.
- [ ] **Step 5: Re-QA any module that had blocker-level findings** until verdict PASS.
- [ ] **Step 6: Commit fixes + report**

```bash
git add site/docs labs planning/learner-qa planning/lab-tests
git -c user.name=initcron -c user.email=bean@initcron.org commit -m "fix(qa): full-course learner-QA sweep findings resolved"
```

---

### Task 8: Ship Phase 1 to origin

**Files:**
- Create: `CHANGELOG.md`
- Modify: `planning/STATE.md`, `planning/ROADMAP.md`

- [ ] **Step 1: CHANGELOG.md** — Keep-a-Changelog format; `## [1.1.0] - <date>` entry: checks backbone, smoke test, course.config.json, QA fixes, fork staging.
- [ ] **Step 2: Update STATE.md + ROADMAP.md** — Phase 1 complete; next = M3B deep dive plan.
- [ ] **Step 3: Final gate** — `cd site && npm run build` green AND `scripts/test-course.sh` green (may reuse Task 5 log if nothing changed since).
- [ ] **Step 4: Push fork, verify staging, then origin**

```bash
git push fork main
# verify staging deploy green, spot-check 3 pages
git push origin main
# verify live deploy green
```

- [ ] **Step 5: Tag**

```bash
git tag v1.1.0 && git push origin v1.1.0
```
