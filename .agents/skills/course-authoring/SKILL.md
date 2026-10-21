---
name: course-authoring
description: Use when authoring a new module (lesson + lab + quiz) for the Containers for GenAI & Agentic AI Docusaurus course at /Users/bean/work/courses/containerai/course. Covers the full proven loop: write → validate live → fold real output back in → QA.
---

# Course Authoring — One Module (Lesson + Lab + Quiz)

Reference course: `/Users/bean/work/courses/containerai/course`

---

## 3-File Structure (per module)

Every module lives at `site/docs/mN-<slug>/` containing exactly:

| File | Purpose |
|---|---|
| `lesson.md` | Concepts, why/when, analogies, Mermaid diagrams. `sidebar_position: 1` |
| `lab.md` | Copy-runnable steps + Expected output + Teardown. `sidebar_position: 2` |
| `quiz.mdx` | `<Quiz>` component with 4–6 questions. `sidebar_position: 3` |

Runnable lab assets (compose.yaml, app code) live in `labs/mN/` — referenced by prose, not inlined.

---

## Lesson Conventions

**Voice:** Gourav Shah. Instructional, second person ("you"), confident. Keep the container angle central.

**Analogy REQUIRED for every major concept** — before the technical definition:
- One strong, vivid analogy per concept beats several weak ones.
- Explicitly bridge the analogy back to the technical reality.
- Examples of the target style: "A declarative agent is a job description and a rulebook, not a hand-coded robot." / "An OCI image is a shipping container — same box, any runtime."

**Mermaid REQUIRED** wherever the topic has boxes, arrows, or flow (architecture, pipeline, sequence):
- Every lesson needs at least one diagram.
- Keep diagrams small (≤8 nodes); split complex ones.
- In architecture diagrams, label the container boundary explicitly.
- Mermaid is native to the site (no extra config needed).

**Word count:** ~1100–1400 words per lesson.

---

## Admonitions — THE #1 RECURRING BUG

Use the **bracket form** — always:

```
:::warning[My title]

Content here.

:::
```

**NEVER use the space form** `:::warning My title` — it does NOT render in Docusaurus 3; it prints literally as text. This is the single most common authoring mistake.

Types: `note`, `tip`, `info`, `warning`, `danger`.

Rule: opening marker on its own line, blank line, content, blank line, closing `:::`.

---

## Quiz — EXACT Schema

File is `quiz.mdx`. Import and use:

```mdx
---
sidebar_position: 3
title: 'Quiz: Module N'
---

import Quiz from '@site/src/components/Quiz';

# Module N Quiz

<Quiz questions={[
  {
    prompt: 'Question text?',
    multiSelect: true,
    options: [
      { text: 'Option A', correct: true, explanation: 'Why this is correct.' },
      { text: 'Option B', correct: false, explanation: 'Why this is wrong.' },
    ],
  },
  {
    prompt: 'Single-select question?',
    options: [
      { text: 'Right', correct: true, explanation: '...' },
      { text: 'Wrong', correct: false, explanation: '...' },
    ],
  },
]} />
```

**Prop contract (from the component source):**
- `QuizQuestion`: `{ prompt: string; options: QuizOption[]; multiSelect?: boolean }`
- `QuizOption`: `{ text: string; correct: boolean; explanation?: string }`

**NEVER use** `type`, `correctAnswers`, `id`, or `text` at the question level — the component reads `prompt`/`options[].correct` only. Wrong keys silently render blank at runtime (build won't catch it).

Requirements per module: 4–6 questions, at least one `multiSelect`, every option has an `explanation`, questions test lesson concepts AND lab decisions (not trivia).

---

## Lab Conventions

- Every command must be **copy-runnable as written**.
- Every command block is followed by an **Expected output** block with real terminal output.
- The `compose.yaml` grows service by service across modules — learners hand-author each new service block.
- In lab prose use plain `docker`/`docker compose` (learners have it on PATH). The `~/.rd/bin/` prefix is only for automated validation on this machine.
- Include a **Troubleshooting** admonition covering failure modes actually hit during validation.
- Every lab ends with a **Teardown / Cleanup** section — stop containers, remove volumes if needed.

---

## Live-Validation Loop (NON-OPTIONAL)

A module is not done until its lab is run and logged. The loop:

1. Write the lab draft.
2. Execute every step on Rancher Desktop (`PATH="$HOME/.rd/bin:$PATH"` prefix for automated docker calls).
3. Capture real terminal output into `planning/lab-tests/mN.md`.
4. Fold actual output back into the lab's Expected output blocks. Replace any fabricated output.
5. Note any steps that behaved differently and update the lab prose accordingly.

Never mark a module done or claim a lab works without evidence in `planning/lab-tests/mN.md`.

---

## QA Pass (Learner Simulation)

After authoring, run a subagent in "learner mode":
- Follows `lab.md` literally, step by step, on a clean state.
- Flags: commands that fail, unclear steps, missing Expected output blocks, missing Teardown.
- Flags any admonition rendered literally (space-form bug).
- Flags any quiz that renders blank (wrong prop shape).

Fix all flags before marking the module done.

---

## Checklist

- [ ] `lesson.md` has at least one analogy per major concept
- [ ] `lesson.md` has at least one Mermaid diagram
- [ ] All admonitions use bracket form `:::type[Title]` — grep to verify
- [ ] `quiz.mdx` uses only `prompt`/`options`/`multiSelect` — grep to verify
- [ ] Every quiz option has `text`, `correct`, `explanation`
- [ ] Every lab command has an Expected output block with real output
- [ ] Lab has a Teardown/Cleanup section
- [ ] Lab validated live; evidence in `planning/lab-tests/mN.md`
- [ ] QA learner-simulation pass done
- [ ] `site/sidebars.ts` updated to include the new module category
- [ ] Build is green

---

## Verify Commands

```bash
# Build gate (run from repo root)
npm --prefix site run build

# Admonition bug check — must return zero matches
grep -r ':::note \|:::tip \|:::info \|:::warning \|:::danger ' site/docs/

# Quiz schema check — must return zero matches (wrong keys)
grep -r 'correctAnswers\|"type":\|"id":' site/docs/

# Confirm bracket admonitions exist (sanity check)
grep -r ':::[a-z]*\[' site/docs/ | head -5
```

---

## State Management

After each task, update:
- `planning/STATE.md` — current active phase, next action, any blockers
- `planning/ROADMAP.md` — per-module status checkbox

This is the only way the continuity system works across sessions.
