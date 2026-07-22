# M3B Fine-Tuning Deep Dive Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add "Deep Dive (Part 2)" to M3B — the participants' loudest ask: what every fine-tuning parameter we used actually does, why, and a hands-on parameter-variation experiment — plus a NEW deep-dive deck. Proves the deep-dive pattern for M3/M5/M7 clones.

**Architecture:** New `deep-dive.md` page (sidebar 4) + separate `labs/m3b/deep-dive.checks.json` + new `site/static/decks/03b-deepdive.html` deck (existing `03b-finetuning.html` byte-untouched). Authored via coursesmith skills, validated live (MLX on this Mac), QA'd on fork staging before origin merge.

**Tech Stack:** coursesmith skills (`deep-dive-author`, `deck-author`, `illustration-author`, `lab-validation`, `learner-qa`), MLX-LM (native, Apple Silicon), Docusaurus.

**Spec:** `planning/specs/2026-07-22-depth-retrofit-design.md` (§Phase 2, M3B content map)

## Global Constraints

- Existing deck `site/static/decks/03b-finetuning.html` MUST NOT change — verify byte-identical before final commit (`git diff --stat` must not list it).
- Existing `lesson.md`/`lab.md`/`quiz.mdx` unchanged except adding the deep-dive link/next-step pointer at the END of lab.md (one short section max).
- Memory: MLX training experiments ≤ ~6 GB peak → tiny model + `--iters 50`-scale runs, one at a time.
- Deep-dive bar (coursesmith deep-dive-author contract): NEVER re-teach lesson basics; ≥1 Mermaid; analogy for each NEW concept; every command block paired with real Expected output (fold-pairing: order + context); "Where you will use this" close; Teardown.
- Admonitions bracket form `:::type[Title]`; Quiz schema untouched (no quiz changes this plan).
- Deck: whiteboard style guide (reveal.js inlined, Patrick Hand data-URI, five-pastel palette, #rough filter, zero external refs, per-slide takeaway, spec-first sequence file, zero-orphan coverage).
- Commits authored `initcron <bean@initcron.org>`.
- After every task: update `planning/STATE.md`.

---

### Task 1: Author deep-dive.md + deep-dive.checks.json

**Files:**
- Create: `site/docs/m3b-finetuning/deep-dive.md` (frontmatter: `sidebar_position: 4`, `sidebar_label: 'Deep Dive (Part 2)'`, `title: 'Deep Dive: Fine-Tuning Parameters Under the Hood'`)
- Create: `labs/m3b/deep-dive.checks.json`

**Interfaces:**
- REQUIRED SUB-SKILL: `coursesmith:deep-dive-author` (it owns the page contract; give it the content map below as the module's deep-dive intent).
- Produces: page whose experiment section Task 2 validates live; checks file runnable via `node scripts/run-checks.mjs labs/m3b/deep-dive.checks.json`.

**Content map (from spec — the deep-dive intent):**

1. **LoRA math, felt not formal:** what rank `r` controls (adapter capacity — analogy: width of the notepad you're allowed to scribble corrections on), `alpha` and the `alpha/r` effective scale, why `target_modules` = attention projections (q,v first), dropout's role. Mermaid: base weights frozen + low-rank A·B path added.
2. **QLoRA:** NF4 4-bit quantization intuition (why 4 bits survive: weights are normally distributed — NF4 buckets match that), double quantization, compute dtype vs storage dtype; why frozen-4-bit-base + fp16 adapters trains stably.
3. **Training dynamics:** learning rate + schedule; epochs/iters vs overfitting — what the loss curve shows (memorization signature: train loss ↓ while outputs parrot training data); batch size vs gradient accumulation on a 16 GB machine.
4. **Data formats:** chat templates; why a format mismatch between train data and inference template silently ruins results.
5. **Evaluating the adapter:** before/after generation on held-out prompts; when to fine-tune vs RAG vs prompt (decision Mermaid).
6. **Experiment (the lab part):** re-run M3B's MLX LoRA training with parameter variants and COMPARE:
   - Baseline: the lab's own run (rank default, `--iters 50`).
   - Variant A: smaller adapter (rank 4-equivalent) — same data.
   - Variant B: higher learning rate (×10).
   - Compare: final train loss, loss trajectory, and generations on 2 fixed prompts, side by side in a table.
   - Exact flags: mlx-lm's rank/lr knobs vary by version (`--lora-rank`/config-file `lora_parameters` vs older flags). The AUTHOR pins exact flags during Task 2 live validation via `mlx_lm.lora --help` — same version-variance pattern the core lab already documents. Page ships only live-verified commands.
7. **Where you will use this:** picking r/lr for a real corpate-docs adapter; reading a loss curve before shipping; budgeting VRAM/URAM from r + quantization choice.
8. **Teardown:** remove `~/mlx-lora-lab` variant dirs; venv note same as core lab.

**deep-dive.checks.json shape** (final asserts pinned in Task 2 after live run):

```json
{
  "checks": [
    { "id": "venv-mlx", "describe": "mlx-lm importable (or lab not yet run on this machine)",
      "run": "[ -d ~/mlx-lora-env ] && . ~/mlx-lora-env/bin/activate && python -c 'import mlx_lm; print(\"mlx_lm OK\")' || echo SKIP-OK",
      "assert": { "matches": "mlx_lm OK|SKIP-OK" } },
    { "id": "variant-adapters", "describe": "both variant adapter dirs produced",
      "run": "ls ~/mlx-lora-lab/adapters-variant-a ~/mlx-lora-lab/adapters-variant-b 2>/dev/null | wc -l | tr -d ' '",
      "assert": { "matches": "^[1-9]" } },
    { "id": "comparison-table", "describe": "deep-dive page carries the live comparison table",
      "run": "grep -c 'Variant' site/docs/m3b-finetuning/deep-dive.md",
      "assert": { "exit": 0 } }
  ]
}
```

- [ ] **Step 1:** Dispatch `coursesmith:deep-dive-author` with the content map + constraints. It writes both files.
- [ ] **Step 2:** Review output against the deep-dive bar checklist (no basics re-taught; ≥1 Mermaid; analogies for NEW concepts only; fold-pairing placeholders marked for Task 2; teardown present).
- [ ] **Step 3:** `cd site && npm run build` — green (page compiles, sidebar shows position 4).
- [ ] **Step 4: Commit** (page marked draft-until-validated in STATE.md, not in page copy)

```bash
git add site/docs/m3b-finetuning/deep-dive.md labs/m3b/deep-dive.checks.json planning/STATE.md
git -c user.name=initcron -c user.email=bean@initcron.org commit -m "feat(m3b): deep-dive page draft + checks (pre-validation)"
```

---

### Task 2: Live-validate the experiment, fold real output

**Files:**
- Modify: `site/docs/m3b-finetuning/deep-dive.md` (fold real outputs, pin real flags)
- Modify: `labs/m3b/deep-dive.checks.json` (pin final asserts)
- Create: `planning/lab-tests/m3b-deep-dive.md` (evidence)

**Interfaces:**
- REQUIRED SUB-SKILL: `coursesmith:lab-validation` (probe → lab-runner agent executes the page verbatim → fold real output by order+context, not first-match).

- [ ] **Step 1: Probe** — `source ~/mlx-lora-env/bin/activate 2>/dev/null; mlx_lm.lora --help | head -40` → record the ACTUAL rank/lr flag names for this installed version; update the page's experiment commands accordingly BEFORE the run.
- [ ] **Step 2: Run the experiment end-to-end** via lab-runner: baseline + Variant A + Variant B sequentially (never parallel — memory). Capture loss lines + generations verbatim.
- [ ] **Step 3: Fold real output** into every Expected-output block (order + context pairing). Fill the comparison table with the REAL numbers.
- [ ] **Step 4: Checks green:** `node scripts/run-checks.mjs labs/m3b/deep-dive.checks.json` → all pass. Then run teardown section verbatim, and re-run checks expecting the guarded SKIP-OK path to still pass.
- [ ] **Step 5: Evidence** — write `planning/lab-tests/m3b-deep-dive.md` (real commands, outputs, check results, flags pinned + version).
- [ ] **Step 6: Commit**

```bash
git add site/docs/m3b-finetuning/deep-dive.md labs/m3b/deep-dive.checks.json planning/lab-tests/m3b-deep-dive.md
git -c user.name=initcron -c user.email=bean@initcron.org commit -m "feat(m3b): deep-dive validated live — real params, real loss curves"
```

---

### Task 3: New deep-dive deck (existing deck untouched)

**Files:**
- Create: `planning/decks/m3b-deepdive-sequence.md` (spec first)
- Create: `site/static/decks/03b-deepdive.html`
- Modify: `site/docs/m3b-finetuning/deep-dive.md` (embed only — add the Slides block near the top)

**Interfaces:**
- REQUIRED SUB-SKILLS: `coursesmith:deck-author` (sequence spec → deck) then `coursesmith:illustration-author` (SVG analogy scenes inside THIS deck only).
- Consumes: validated deep-dive.md (Task 2) as content source.
- Embed pattern (exactly as existing lessons):

```mdx
import Slides from '@site/src/components/Slides';

<Slides src="decks/03b-deepdive.html" title="Module 3B Deep Dive — Fine-Tuning Parameters" />
```

- [ ] **Step 1:** deck-author writes `planning/decks/m3b-deepdive-sequence.md` — slide table covering: LoRA rank/alpha, target modules, NF4/QLoRA, lr + loss curves, batch vs grad-accum, chat-template mismatch, fine-tune vs RAG decision, experiment results. Zero-orphan coverage gate against deep-dive.md sections.
- [ ] **Step 2:** deck-author generates `site/static/decks/03b-deepdive.html` from the coursesmith skeleton (self-contained; zero external refs).
- [ ] **Step 3:** illustration-author adds 1–2 hand-drawn SVG scenes (e.g. the "notepad of corrections clipped onto a frozen book" LoRA analogy) using the deck's exact palette.
- [ ] **Step 4: Zero-ref gate** — `grep -Ei 'https?://|src="http|href="http' site/static/decks/03b-deepdive.html | grep -v 'initcron\|schoolofdevops'` → expect NO external resource loads (reveal + font inlined).
- [ ] **Step 5:** Add the Slides embed to deep-dive.md; `cd site && npm run build` green; open deck locally, click through every slide + fragments.
- [ ] **Step 6: Existing-deck guard** — `git status --porcelain site/static/decks/` must show ONLY `?? site/static/decks/03b-deepdive.html` (nothing modified).
- [ ] **Step 7: Commit**

```bash
git add planning/decks/m3b-deepdive-sequence.md site/static/decks/03b-deepdive.html site/docs/m3b-finetuning/deep-dive.md
git -c user.name=initcron -c user.email=bean@initcron.org commit -m "feat(m3b): deep-dive whiteboard deck + illustrations (new deck, existing untouched)"
```

---

### Task 4: Link from core lab + stage on fork + learner-QA

**Files:**
- Modify: `site/docs/m3b-finetuning/lab.md` (append ONE short "Go deeper" section pointing to the deep dive — the only permitted edit)
- Create: `planning/learner-qa/m3b-deep-dive-report.md`

**Interfaces:**
- REQUIRED SUB-SKILL: `coursesmith:learner-qa` — fresh cold-learner agent, published fork pages only, executes every command verbatim, tests the lab.md → deep-dive.md seam. Record-don't-fix.

- [ ] **Step 1:** Append to `lab.md`:

```markdown
---

## Go deeper

You have a working adapter — but *why* rank 8? Why that learning rate? The
[Deep Dive (Part 2)](./deep-dive.md) opens the hood: what each parameter
controls, how to read a loss curve, and a side-by-side experiment you can run
in ~15 minutes.
```

- [ ] **Step 2:** `git push fork main`; watch fork deploy green; verify `curl -s -o /dev/null -w "%{http_code}" https://initcron.github.io/303-containerai/docs/m3b-finetuning/deep-dive` → 200.
- [ ] **Step 3:** Dispatch learner-QA on the m3b module (all 4 pages + seam from m3 lab) against staging. Report → `planning/learner-qa/m3b-deep-dive-report.md`.
- [ ] **Step 4:** Fix findings (author role, minimal); re-run `node scripts/run-checks.mjs labs/m3b/deep-dive.checks.json`; re-QA if any blocker; iterate to PASS.
- [ ] **Step 5: Commit**

```bash
git add site/docs/m3b-finetuning planning/learner-qa
git -c user.name=initcron -c user.email=bean@initcron.org commit -m "feat(m3b): deep-dive QA'd on staging — verdict PASS"
```

---

### Task 5: Ship to origin + pattern notes for M3/M5/M7

**Files:**
- Modify: `CHANGELOG.md` (`## [1.2.0]` — M3B deep dive), `planning/STATE.md`, `planning/ROADMAP.md`

- [ ] **Step 1:** Final gates: `cd site && npm run build` green; `scripts/test-course.sh m3b` green; `git diff origin/main --stat -- site/static/decks/` shows ONLY the new deck file.
- [ ] **Step 2:** CHANGELOG + STATE + ROADMAP updates (M3B deep dive DONE; next: clone this plan for M3 → M5 → M7 using their spec content maps).
- [ ] **Step 3:** `git push fork main` → staging green → `git push origin main` → live deploy green → spot-check live deep-dive page 200.
- [ ] **Step 4:** `git tag v1.2.0 && git push origin v1.2.0`.
- [ ] **Step 5:** Write the three follow-on plans (`2026-07-XX-m3-deep-dive.md`, `-m5-`, `-m7-`) by cloning THIS plan's task structure with the spec's per-module content maps — only after M3B verdict PASS confirms the pattern.
