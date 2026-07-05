# M1 Vertical Slice Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up the Docusaurus course site with a reusable `<Quiz>` component, author Module 1 fully (Lesson + Lab + Quiz), and validate the M1 lab live on Rancher Desktop — proving the whole content→build→runnable-lab pipeline before scaling to M2–M8.

**Architecture:** A Docusaurus (classic, TypeScript) site in `site/`, with a self-contained React `<Quiz>` MDX component in `site/src/components/Quiz/`. Course prose lives in `site/docs/` with modules flat at the top level, each a folder of [lesson, lab, quiz]. Runnable lab assets live separately in `labs/mN/`. Every lab command is executed on Rancher Desktop (arm64, 16 GB) with Ollama served natively; evidence is captured to `planning/lab-tests/`.

**Tech Stack:** Docusaurus 3 (classic preset, TypeScript), React 18, Node 22 / npm 10, Rancher Desktop (containerd+nerdctl / dockerd), Ollama (native, Metal), `qwen2.5:1.5b`.

## Global Constraints

- **ENV FACT (verified 2026-07-05):** `docker` is NOT on the default shell PATH. Rancher Desktop's docker CLI lives at `~/.rd/bin/docker` (server 29.5.2, dockerd/moby). Shell exports do NOT persist between separate Bash tool calls, so every command that uses docker MUST prefix `PATH="$HOME/.rd/bin:$PATH"` (e.g. `PATH="$HOME/.rd/bin:$PATH" docker run ...`). `nerdctl` is also under `~/.rd/bin/`. Rancher Desktop, Ollama (v0.17.4, serving on :11434), and `qwen2.5:1.5b` (986 MB) are all installed and running — Phase 0 installs are DONE; only verification + evidence remain.
- Runtime-agnostic content: Rancher Desktop is the **validation** runtime; content must note Colima/OrbStack/Podman equivalence. Commands use `docker` CLI (Rancher Desktop provides it) with `nerdctl` noted where relevant. In authored lab prose, use plain `docker` (learners will have it on PATH); the `~/.rd/bin` prefix is only a constraint for *our automated validation* on this machine.
- Target laptop: **arm64, 16 GB RAM**. Nothing in a lab may exceed ~4–6 GB peak.
- Model server runs **natively** on Mac (Ollama, Metal); containers reach it at `http://host.docker.internal:11434`. This is the M1 teaching point — do not containerize the model on Mac.
- Standard dev model: **`qwen2.5:1.5b`** (small, fast on 16 GB).
- Plans/specs/evidence are versioned in git. Commit after each task.
- Content voice: instructional, copy-runnable commands, expected-output blocks, troubleshooting callouts. Author/trainer: Gourav Shah.
- No backend, no persistence, no auth (YAGNI per spec §11).

---

## Phase 0 — Environment (prerequisite installs)

> These are **interactive installs the user runs** (GUI + `!` commands). The agent verifies via CLI once done and captures evidence. Do not attempt to auto-install GUI apps silently.

### Task 0.1: Install & verify Rancher Desktop

**Files:**
- Create: `planning/lab-tests/00-environment.md` (evidence log)

**Interfaces:**
- Produces: a working `docker` CLI backed by Rancher Desktop; `host.docker.internal` reachable from containers.

- [ ] **Step 1: User installs Rancher Desktop**

Hand the user these commands (they run via `!` or terminal):
```bash
brew install --cask rancher
```
Then: open Rancher Desktop → Preferences → Container Engine → choose **dockerd (moby)** for the simplest `docker` CLI experience (containerd/nerdctl also fine, note both in content) → apply. Disable Kubernetes (Preferences → Kubernetes → uncheck "Enable Kubernetes") to save RAM.

- [ ] **Step 2: Verify the runtime is up**

Run:
```bash
docker version --format 'client={{.Client.Version}} server={{.Server.Version}}'
docker run --rm hello-world
```
Expected: server version prints (Rancher Desktop's), and `hello-world` prints "Hello from Docker!".

- [ ] **Step 3: Verify host networking works**

Run:
```bash
docker run --rm alpine sh -c "getent hosts host.docker.internal || nslookup host.docker.internal"
```
Expected: resolves to an IP (the host). If it fails, note the Rancher Desktop version — `host.docker.internal` is supported; capture the actual behavior.

- [ ] **Step 4: Log evidence and commit**

Write the exact commands + real output into `planning/lab-tests/00-environment.md` under a "Rancher Desktop" heading.
```bash
git add planning/lab-tests/00-environment.md
git commit -m "test: verify Rancher Desktop runtime + host networking"
```

### Task 0.2: Install & verify Ollama + pull the dev model

**Files:**
- Modify: `planning/lab-tests/00-environment.md`

**Interfaces:**
- Consumes: nothing.
- Produces: Ollama serving on `http://localhost:11434` with `qwen2.5:1.5b` pulled; reachable from a container at `host.docker.internal:11434`.

- [ ] **Step 1: User installs Ollama**

```bash
brew install ollama
brew services start ollama    # or: ollama serve (foreground)
```

- [ ] **Step 2: Pull the dev model**

```bash
ollama pull qwen2.5:1.5b
ollama list
```
Expected: `qwen2.5:1.5b` appears in the list (~1 GB).

- [ ] **Step 3: Verify native API responds**

```bash
curl -s http://localhost:11434/api/generate -d '{"model":"qwen2.5:1.5b","prompt":"Say hello in 3 words.","stream":false}' | python3 -c "import sys,json;print(json.load(sys.stdin)['response'])"
```
Expected: a short 3-word-ish reply. Confirms Metal-accelerated native serving.

- [ ] **Step 4: Verify a CONTAINER can reach Ollama (the M1 core wiring)**

```bash
docker run --rm curlimages/curl:latest -s http://host.docker.internal:11434/api/tags
```
Expected: JSON listing models including `qwen2.5:1.5b`. **This is the proof the whole M1 lab hinges on.**

- [ ] **Step 5: Log evidence and commit**

Append commands + real output to `planning/lab-tests/00-environment.md` under "Ollama".
```bash
git add planning/lab-tests/00-environment.md
git commit -m "test: verify Ollama native serving + container->host wiring"
```

---

## Phase 1 — Scaffold + M1 complete

### Task 1: Scaffold the Docusaurus site

**Files:**
- Create: `site/` (Docusaurus classic TS scaffold)
- Modify: `.gitignore` (already has node_modules/, site/build/, site/.docusaurus/)

**Interfaces:**
- Produces: a buildable Docusaurus app in `site/`; `npm --prefix site run build` succeeds; `npm --prefix site start` serves on :3000.

- [ ] **Step 1: Scaffold**

Run from `course/`:
```bash
npx create-docusaurus@latest site classic --typescript
```
Expected: `site/` created with `docusaurus.config.ts`, `docs/`, `src/`, `package.json`.

- [ ] **Step 2: Install and build to verify the toolchain**

```bash
npm --prefix site install
npm --prefix site run build
```
Expected: "Success! Generated static files in build."

- [ ] **Step 3: Remove default tutorial content we won't use**

Delete the scaffold's sample docs/blog so our structure is clean:
```bash
rm -rf site/docs/* site/blog
```
(We keep `src/`, `static/`, config — we'll rewrite docs and sidebar next.)

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: scaffold Docusaurus site (classic, TypeScript)"
```

### Task 2: Configure branding, navbar, and course sidebar structure

**Files:**
- Modify: `site/docusaurus.config.ts`
- Create/Replace: `site/sidebars.ts`
- Create: `site/docs/intro.md`

**Interfaces:**
- Consumes: scaffold from Task 1.
- Produces: a sidebar with `intro`, a `Setup` category, then each module (M1–M8, Capstone) as its own **top-level category** (no Day grouping) containing lesson/lab/quiz; `blog` disabled.

- [ ] **Step 1: Update site metadata + disable blog + enable Mermaid**

Install the Mermaid theme:
```bash
npm --prefix site install @docusaurus/theme-mermaid
```
In `site/docusaurus.config.ts`: set `title: 'Containers for GenAI & Agentic AI'`, `tagline: 'The Open-Source Way'`, `url`/`baseUrl` placeholders, `organizationName: 'schoolofdevops'`, `projectName: 'containerai'`. In the classic preset options set `blog: false`. **Enable Mermaid:** add top-level `markdown: {mermaid: true}` and `themes: ['@docusaurus/theme-mermaid']`. In `themeConfig.navbar` set `title: 'Containers for GenAI & Agentic AI'`, keep a single "Course" doc link (`sidebarId: 'courseSidebar'`), remove the blog navbar item. Set `footer` to a minimal School of DevOps & AI credit. (Mermaid diagrams are then authored as ` ```mermaid ` fenced code blocks in any lesson.)

- [ ] **Step 2: Author the sidebar**

Replace `site/sidebars.ts` with an explicit sidebar named `courseSidebar`:
```ts
import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  courseSidebar: [
    'intro',
    {
      type: 'category',
      label: 'Setup',
      items: ['setup/prerequisites', 'setup/gpu-reality'],
    },
    {
      type: 'category',
      label: 'M1 · Container-Native GenAI',
      items: [
        'm1-container-native/lesson',
        'm1-container-native/lab',
        'm1-container-native/quiz',
      ],
    },
  ],
};

export default sidebars;
```
Modules are flat top-level categories (M1 … M8, Capstone) — no Day grouping. We add M2–M8 + Capstone categories as those modules are built. The Day-1/Day-2 mapping lives only in `intro.md`'s program table. Setup pages are stubbed in Step 3.

- [ ] **Step 3: Author intro + minimal setup stubs so the build resolves**

Create `site/docs/intro.md` (course overview: what you'll build, the two use cases, the build ladder table, the 16 GB budget, prerequisites — condensed from `containers_genai_agentic.md`). Create stubs `site/docs/setup/prerequisites.md` and `site/docs/setup/gpu-reality.md` with a heading + one-paragraph placeholder each and frontmatter `sidebar_position`. (Full Setup content is authored in a later module pass; stubs keep the sidebar valid now.)

- [ ] **Step 4: Build to verify no broken links**

```bash
npm --prefix site run build
```
Expected: build succeeds with no broken-link errors. (Docusaurus fails the build on broken doc links — that's our test.)

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: configure branding, navbar, course sidebar; add intro + setup stubs"
```

### Task 3: Build the reusable `<Quiz>` component

**Files:**
- Create: `site/src/components/Quiz/index.tsx`
- Create: `site/src/components/Quiz/styles.module.css`
- Create: `site/src/components/Quiz/Quiz.test-page.mdx` → actually a temp doc `site/docs/_quiz-demo.mdx` for manual verification (deleted after)

**Interfaces:**
- Produces: default-exported `Quiz` React component consumed by all `quiz.mdx` files.
  Props: `questions: QuizQuestion[]` where
  ```ts
  type QuizOption = { text: string; correct: boolean; explanation?: string };
  type QuizQuestion = { prompt: string; options: QuizOption[]; multiSelect?: boolean };
  ```
  Behavior: renders each question with selectable options; a "Check" action reveals correctness + per-option explanation; tracks a running score; a "Reset" clears state. Multi-select questions require all-correct-and-no-incorrect to score.

- [ ] **Step 1: Write the component**

Create `site/src/components/Quiz/index.tsx`:
```tsx
import React, {useState} from 'react';
import styles from './styles.module.css';

export type QuizOption = {text: string; correct: boolean; explanation?: string};
export type QuizQuestion = {prompt: string; options: QuizOption[]; multiSelect?: boolean};

type State = {selected: Set<number>; checked: boolean};

function isQuestionCorrect(q: QuizQuestion, selected: Set<number>): boolean {
  const correctIdx = q.options.map((o, i) => (o.correct ? i : -1)).filter((i) => i >= 0);
  if (!q.multiSelect) return selected.size === 1 && correctIdx.includes([...selected][0]);
  return (
    selected.size === correctIdx.length &&
    [...selected].every((i) => q.options[i].correct)
  );
}

function Question({q, state, onToggle}: {q: QuizQuestion; state: State; onToggle: (i: number) => void}) {
  return (
    <div className={styles.question}>
      <p className={styles.prompt}>{q.prompt}</p>
      {q.multiSelect && <p className={styles.hint}>(select all that apply)</p>}
      <ul className={styles.options}>
        {q.options.map((opt, i) => {
          const chosen = state.selected.has(i);
          let cls = styles.option;
          if (state.checked) {
            if (opt.correct) cls += ' ' + styles.correct;
            else if (chosen) cls += ' ' + styles.incorrect;
          } else if (chosen) cls += ' ' + styles.chosen;
          return (
            <li key={i}>
              <button type="button" className={cls} disabled={state.checked} onClick={() => onToggle(i)}>
                <span className={styles.marker}>{chosen ? '●' : '○'}</span> {opt.text}
              </button>
              {state.checked && (chosen || opt.correct) && opt.explanation && (
                <p className={styles.explanation}>{opt.explanation}</p>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default function Quiz({questions}: {questions: QuizQuestion[]}): JSX.Element {
  const [states, setStates] = useState<State[]>(
    questions.map(() => ({selected: new Set<number>(), checked: false})),
  );

  const toggle = (qi: number, oi: number) =>
    setStates((prev) =>
      prev.map((s, i) => {
        if (i !== qi) return s;
        const selected = new Set(s.selected);
        if (questions[qi].multiSelect) {
          selected.has(oi) ? selected.delete(oi) : selected.add(oi);
        } else {
          selected.clear();
          selected.add(oi);
        }
        return {...s, selected};
      }),
    );

  const check = () => setStates((prev) => prev.map((s) => ({...s, checked: true})));
  const reset = () =>
    setStates(questions.map(() => ({selected: new Set<number>(), checked: false})));

  const allChecked = states.every((s) => s.checked);
  const score = states.filter((s, i) => isQuestionCorrect(questions[i], s.selected)).length;

  return (
    <div className={styles.quiz}>
      {questions.map((q, i) => (
        <Question key={i} q={q} state={states[i]} onToggle={(oi) => toggle(i, oi)} />
      ))}
      <div className={styles.actions}>
        <button type="button" className={styles.check} onClick={check}>Check answers</button>
        <button type="button" className={styles.resetBtn} onClick={reset}>Reset</button>
        {allChecked && (
          <span className={styles.score}>Score: {score} / {questions.length}</span>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Write the styles**

Create `site/src/components/Quiz/styles.module.css`:
```css
.quiz { border: 1px solid var(--ifm-color-emphasis-300); border-radius: 8px; padding: 1rem 1.25rem; margin: 1rem 0; }
.question { margin-bottom: 1.25rem; }
.prompt { font-weight: 600; margin-bottom: .25rem; }
.hint { font-size: .85rem; color: var(--ifm-color-emphasis-600); margin: 0 0 .5rem; }
.options { list-style: none; padding: 0; margin: 0; }
.option { display: block; width: 100%; text-align: left; padding: .5rem .75rem; margin: .3rem 0; border: 1px solid var(--ifm-color-emphasis-300); border-radius: 6px; background: var(--ifm-background-surface-color); cursor: pointer; }
.option:hover:not(:disabled) { border-color: var(--ifm-color-primary); }
.marker { margin-right: .5rem; }
.chosen { border-color: var(--ifm-color-primary); }
.correct { border-color: #2e8b57; background: rgba(46,139,87,.12); }
.incorrect { border-color: #c0392b; background: rgba(192,57,43,.12); }
.explanation { font-size: .85rem; color: var(--ifm-color-emphasis-700); margin: .25rem 0 .5rem 1.75rem; }
.actions { display: flex; align-items: center; gap: .75rem; margin-top: .5rem; }
.check, .resetBtn { padding: .4rem .9rem; border-radius: 6px; border: none; cursor: pointer; }
.check { background: var(--ifm-color-primary); color: #fff; }
.resetBtn { background: var(--ifm-color-emphasis-200); }
.score { font-weight: 600; }
```

- [ ] **Step 3: Add a temporary demo doc to verify rendering**

Create `site/docs/_quiz-demo.mdx`:
```mdx
---
sidebar_position: 99
---
import Quiz from '@site/src/components/Quiz';

# Quiz Demo

<Quiz questions={[
  {prompt: 'On Apple Silicon, where should the model server run?', options: [
    {text: 'Natively (Ollama, Metal)', correct: true, explanation: 'macOS containers get no GPU; native Ollama uses Metal + unified memory.'},
    {text: 'Inside a container', correct: false, explanation: 'A containerized model falls back to CPU, 3–6x slower.'},
  ]},
  {prompt: 'Which are OCI container runtimes? (select all)', multiSelect: true, options: [
    {text: 'Colima', correct: true},
    {text: 'OrbStack', correct: true},
    {text: 'Microsoft Word', correct: false, explanation: 'Not a container runtime.'},
  ]},
]} />
```

- [ ] **Step 4: Run the site and verify the component works**

```bash
npm --prefix site run build
```
Expected: build succeeds (compiles the TSX + MDX). Then manually:
```bash
npm --prefix site start
```
Open http://localhost:3000/docs/_quiz-demo — verify: selecting options, "Check answers" reveals green/red + explanations, score shows `2 / 2` when correct, multi-select requires all correct, Reset clears. Stop the server (Ctrl-C).

- [ ] **Step 5: Remove the demo doc and commit**

```bash
rm site/docs/_quiz-demo.mdx
git add -A
git commit -m "feat: add reusable <Quiz> MDX component with scoring + explanations"
```

### Task 4: Author the M1 Lesson

**Files:**
- Create: `site/docs/m1-container-native/lesson.md`

**Interfaces:**
- Consumes: sidebar entry `m1-container-native/lesson` from Task 2's sidebar (add the M1 category to `sidebars.ts` if not already present).

- [ ] **Step 1: Write the lesson**

**Authoring conventions (per CLAUDE.md — REQUIRED):** open each major concept with a **relatable analogy** before the technical definition (e.g. OCI image = shipping container; OpenAI-compatible endpoint = wall socket you can swap the power station behind). Include **at least two Mermaid diagrams** as ` ```mermaid ` fenced blocks — mandatory: (a) the same `compose.yaml` runs on any OCI runtime, and (b) the Apple-Silicon native-model-server vs containerized-app wiring showing the `host.docker.internal:11434` boundary. Label the container boundary explicitly. An Excalidraw-style black-and-white illustration of the wiring is optional polish (do not block on it).

Create `lesson.md` with frontmatter (`sidebar_position: 1`, `title: 'Lesson: Container-Native GenAI'`) covering, as sections:
1. **Why "container-native", not "Docker-native"** — OCI + Compose Spec run identically on Colima/OrbStack/Rancher Desktop/Podman; Docker Desktop is now paid for larger orgs; the open standard is the through-line.
2. **Containers as the package / serve / isolate / ship layer for AI** — what containers buy an AI stack.
3. **The Apple Silicon GPU reality** (the course's most important practical lesson) — Hypervisor.framework exposes no virtual GPU; a model *inside* a container falls back to CPU (3–6x slower); the universal pattern = model server **native** on Mac, everything else containerized, connected via `host.docker.internal:11434`; on Windows+WSL2+NVIDIA the model *can* run in-container via NVIDIA Container Toolkit.
4. **The 2026 map: declarative agents vs orchestration frameworks** — one-paragraph teaser of AGENTS.md/SOUL.md + Skills + MCP vs LangGraph, so learners know what they'll build and when each fits.
5. **The Acme use case + the build ladder** — the step-per-module table (reuse the table from `containers_genai_agentic.md`), and the two connected use cases (Docs Assistant → Incident Crew).
6. **The OpenAI-compatible endpoint as the universal contract** — teaser that app code never changes when the backend swaps.

Keep it ~800–1200 words, with the build-ladder table and a small diagram-in-prose of the native-server/containerized-app wiring. End with "In the lab, you'll prove this wiring yourself."

- [ ] **Step 2: Verify build**

```bash
npm --prefix site run build
```
Expected: build succeeds, `Lesson` page in sidebar under M1.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "docs(m1): author Container-Native GenAI lesson"
```

### Task 5: Author the M1 Lab + runnable assets

**Files:**
- Create: `site/docs/m1-container-native/lab.md`
- Create: `labs/m1/README.md`
- Create: `labs/m1/call-ollama.sh` (throwaway-container client script)

**Interfaces:**
- Consumes: Ollama serving `qwen2.5:1.5b` (Task 0.2), working runtime (Task 0.1).
- Produces: a copy-runnable lab proving container→host model wiring. Every command here is executed for real in Task 6.

- [ ] **Step 1: Write the runnable client script**

Create `labs/m1/call-ollama.sh`:
```bash
#!/usr/bin/env sh
# Calls the natively-served Ollama model from *inside* a throwaway container,
# proving the host.docker.internal wiring that every later lab relies on.
set -eu
MODEL="${MODEL:-qwen2.5:1.5b}"
PROMPT="${1:-Explain what a container is in one sentence.}"
docker run --rm curlimages/curl:latest -s \
  http://host.docker.internal:11434/api/generate \
  -d "{\"model\":\"$MODEL\",\"prompt\":\"$PROMPT\",\"stream\":false}"
```

- [ ] **Step 2: Write the lab prose**

Create `lab.md` (frontmatter `sidebar_position: 2`, `title: 'Lab: Prove the Wiring'`) with these numbered, copy-runnable sections. Each command shows an **Expected output** block:

1. **Pick & start your runtime** — Rancher Desktop steps (primary), with a callout: "Colima: `colima start`; OrbStack: launch app; Podman: `podman machine start` — the rest is identical." Verify: `docker version`.
2. **Confirm the model server is native** — `ollama list` shows `qwen2.5:1.5b`; `curl http://localhost:11434/api/tags`. Callout explaining *why* native on Mac (link back to lesson §3).
3. **The core move: call the model from a container** —
   ```bash
   docker run --rm curlimages/curl:latest -s \
     http://host.docker.internal:11434/api/generate \
     -d '{"model":"qwen2.5:1.5b","prompt":"Say hi in 5 words.","stream":false}'
   ```
   Expected output: a JSON object with a `"response"` field. Explain each part (`host.docker.internal`, the OpenAI-ish API shape).
4. **Wrap it in a script** — download/run `labs/m1/call-ollama.sh`; `chmod +x`; `./call-ollama.sh "your prompt"`.
5. **Prove portability (concept)** — a short note: this exact command works unchanged on any runtime because it's just OCI + host networking.
6. **Troubleshooting callouts** — `host.docker.internal` not resolving (Rancher Desktop network mode); Ollama not running (`brew services start ollama`); connection refused (model server bound to localhost only — Ollama listens on all interfaces by default, note `OLLAMA_HOST`).
7. **What you built / what's next** — you proved the wiring; M2 turns this into a real OpenAI-compatible serving pattern with a containerized client app.

- [ ] **Step 3: Write labs/m1/README.md**

Brief: what's in `labs/m1/`, prerequisites (Rancher Desktop + Ollama + `qwen2.5:1.5b`), and `./call-ollama.sh` usage.

- [ ] **Step 4: Verify build**

```bash
chmod +x labs/m1/call-ollama.sh
npm --prefix site run build
```
Expected: build succeeds; Lab page renders under M1.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "docs(m1): author lab + runnable call-ollama client"
```

### Task 6: Validate the M1 lab live on Rancher Desktop

**Files:**
- Create: `planning/lab-tests/m1.md` (evidence log)
- Modify: `site/docs/m1-container-native/lab.md` (fix any command that didn't work as written)

**Interfaces:**
- Consumes: everything from Tasks 0.x and 5.
- Produces: proof (real command output) that every lab command works as written; corrections folded back into `lab.md`.

- [ ] **Step 1: Execute every lab command in order, for real**

Run each numbered command from `lab.md` §1–4 on this machine (Rancher Desktop up, Ollama serving). Capture actual stdout.

- [ ] **Step 2: Run the script path**

```bash
./labs/m1/call-ollama.sh "Explain containers in one sentence."
```
Expected: JSON with a coherent `response`.

- [ ] **Step 3: Record evidence**

Write `planning/lab-tests/m1.md`: for each step, the exact command and its **real** captured output, plus environment header (Rancher Desktop version, Ollama version, model, date). Note any deviation between what `lab.md` said and what actually happened.

- [ ] **Step 4: Fix the lab to match reality**

If any command differed (flag, output shape, resolution quirk), edit `lab.md`'s Expected-output blocks / commands to match the captured truth. Re-run the corrected command to confirm.

- [ ] **Step 5: Rebuild and commit**

```bash
npm --prefix site run build
git add -A
git commit -m "test(m1): validate lab live on Rancher Desktop; fold corrections into lab"
```

### Task 7: Author the M1 Quiz

**Files:**
- Create: `site/docs/m1-container-native/quiz.mdx`

**Interfaces:**
- Consumes: `<Quiz>` from Task 3; concepts from the M1 lesson/lab.

- [ ] **Step 1: Write the quiz**

Create `quiz.mdx` (frontmatter `sidebar_position: 3`, `title: 'Quiz: Module 1'`) importing `Quiz` and passing 5 questions covering: (a) why container-native vs Docker-native; (b) the Apple Silicon GPU limitation + native-server pattern; (c) what `host.docker.internal` is for; (d) which tools are OCI runtimes (multi-select); (e) the OpenAI-compatible-endpoint contract idea. Each option has an `explanation`. At least one `multiSelect: true`.

```mdx
---
sidebar_position: 3
title: 'Quiz: Module 1'
---
import Quiz from '@site/src/components/Quiz';

# Module 1 Quiz

<Quiz questions={[
  /* 5 questions per the spec above — full objects with explanations */
]} />
```

- [ ] **Step 2: Verify build + render**

```bash
npm --prefix site run build
```
Then `npm --prefix site start`, open the M1 Quiz page, confirm scoring/explanations work. Stop server.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "docs(m1): author Module 1 quiz"
```

### Task 8: Finalize the slice — ROADMAP + full build gate

**Files:**
- Create: `planning/ROADMAP.md`
- Modify: `README.md` (course root) — create if absent

**Interfaces:**
- Consumes: all prior tasks.
- Produces: a committed, building site with M1 complete + validated; a ROADMAP tracking M2–Capstone.

- [ ] **Step 1: Write ROADMAP.md**

Create `planning/ROADMAP.md`: a checklist of Phase 0 (done), Phase 1/M1 (done), then M2–M8 + Capstone as pending rows, each with its three deliverables (lesson/lab/quiz) + "lab validated" checkbox, and a link to the spec. This is the ongoing tracker.

- [ ] **Step 2: Write root README.md**

Brief: what this repo is, layout (`site/`, `labs/`, `planning/`), how to run the site (`npm --prefix site start`), how labs are validated, link to the spec and ROADMAP.

- [ ] **Step 3: Full build gate**

```bash
npm --prefix site run build
```
Expected: clean build, no broken links, M1 category (Lesson/Lab/Quiz) present in sidebar.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "docs: add ROADMAP + README; M1 vertical slice complete"
```

---

## Self-Review

**Spec coverage check (spec §):**
- §4 repo layout → Tasks 1, 5, 8 create `site/`, `labs/`, `planning/`. ✓
- §5 module content model (3 docs) → Tasks 4/5/7 (lesson/lab/quiz). ✓
- §6 `<Quiz>` component (single+multi-select, feedback, score, reset, inline data) → Task 3 (full code). ✓
- §7 Phase 0 (Rancher Desktop + Ollama + model) → Tasks 0.1, 0.2. ✓
- §7 Phase 1 (scaffold, quiz, M1, live validation, evidence) → Tasks 1–8. ✓
- §10 tracking (ROADMAP, plans, lab-tests) → Task 8 + evidence logs throughout. ✓
- §12 success criteria (site builds, M1 authored, lab validated live, repeatable loop) → Tasks 6, 8. ✓
- Cross-cutting defaults (§8) are M2+ concerns — correctly out of this slice.

**Placeholder scan:** Quiz component + styles + script are complete code. Prose tasks (lesson/lab/quiz) specify exact sections/questions to write — content authoring, not placeholders. Setup pages are explicitly stubbed-then-filled-later by design (noted in Task 2.3). No TODO/TBD left.

**Type consistency:** `QuizOption`/`QuizQuestion` types defined in Task 3 are used verbatim in the demo (Task 3.3) and M1 quiz (Task 7). `isQuestionCorrect`, `Quiz` default export, prop name `questions` consistent across Tasks 3/7. Model `qwen2.5:1.5b`, port `11434`, `host.docker.internal` consistent across Tasks 0.2/5/6.

**Gaps found & fixed:** Task 2's sidebar initially only listed M1 lesson/lab/quiz — Task 4 note reminds to ensure the M1 category exists before authoring. No missing spec requirement.
