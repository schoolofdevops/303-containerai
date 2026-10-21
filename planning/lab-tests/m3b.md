# Lab-test evidence — M3B: LoRA Fine-Tuning (Apple Silicon & NVIDIA Tracks)

**Machine:** Apple Silicon (arm64), 16 GB RAM
**Date:** 2026-07-22
**Status:** Optional, GPU/MLX-gated module. Track A requires Apple Silicon + Python 3.10+ natively
(no Docker); Track B requires an NVIDIA GPU on Linux/WSL2 and cannot run on this Mac at all.

No `up.sh`/`down.sh` — this module runs no services (Track A is native host Python; Track B is
documented but not executable here).

## Re-validation 2026-10-21 (freshness pass)

No model references or Ollama calls on the M3B pages that needed changing (the only Ollama use is the optional
`ollama create` for a TinyLlama adapter). Checks re-run on this machine; `~/mlx-lora-env` is absent so the
venv checks take their documented SKIP-OK path.

```
$ node scripts/run-checks.mjs labs/m3b/checks.json
3/3 checks · score 3/3

$ node scripts/run-checks.mjs labs/m3b/deep-dive.checks.json
✅ venv-mlx ✅ variant-adapters ✅ comparison-table ✅ flags-pinned-admonition
4/4 checks · score 4/4
```


---

## checks.json validation 2026-07-22

Per the task brief, M3B checks assert only **machine-independent facts** — they do not attempt to
run the MLX-LM fine-tune itself (that needs a native Python env the checks runner shouldn't assume
is provisioned), and they do not fail on a machine without a pre-built `~/mlx-lora-env` venv.

**Command:** `node scripts/run-checks.mjs labs/m3b/checks.json`

**Real runner output:**
```
✅ lab-assets-exist — labs/m3b/ reference assets exist (README + Track B config)
✅ version-variance-admonition — lab.md documents the mlx-lm flag-name version variance (machine-independent, GPU-agnostic)
✅ mlx-lm-importable-if-venv-present — if ~/mlx-lora-env exists, mlx_lm imports inside it; else SKIP-OK (no GPU/venv assumed on this runner)

3/3 checks · score 3/3
```

On this validation machine `~/mlx-lora-env` did not exist (the lab's venv is created fresh by each
learner during Step A-1 and torn down in Step A-6's cleanup), so the third check's guarded `run`
command took the `SKIP-OK` branch — matching the brief's specified guard pattern
(`[ -d ~/mlx-lora-env ] || echo SKIP-OK`, `assert.matches: "mlx_lm OK|SKIP-OK"`). This is expected
and correct: the check is a pass either way — `mlx_lm OK` on a machine with the venv already
provisioned, `SKIP-OK` on one without — never a failure driven by GPU/MLX availability.

**Iterations needed:** 0 — green on first run. No lab.md drift found; the "Flag name varies by
mlx-lm version" admonition (Step A-3, covering `--num-layers` vs. the older `--lora-layers`) is
present and unchanged.

## Verdict

✅ M3B's checks correctly assert the module's optional/gated nature without requiring GPU hardware,
an MLX-only Mac, or a pre-existing fine-tuning venv — they pass identically whether or not a learner
has run Track A locally.

## 2026-07-22 — post-review fix: check made honest; re-validated

`lab-assets-exist`'s `describe` claimed "README + Track B config" and its `run` globbed
`labs/m3b/*.yaml`, but no yaml file exists in `labs/m3b/` — the assertion (`contains: "README.md"`)
actually only ever keyed off the `ls labs/m3b/README.md` half of the command, so the yaml glob and
the "Track B config" claim in the describe text were dead/misleading. Fixed: `run` now asserts
exactly what exists (`ls labs/m3b/README.md`), and `describe` now reads "labs/m3b/README.md
reference asset exists" — no more claim about a Track B yaml config that isn't shipped.

**Command:** `node scripts/run-checks.mjs labs/m3b/checks.json`

**Real runner output:**
```
✅ lab-assets-exist — labs/m3b/README.md reference asset exists
✅ version-variance-admonition — lab.md documents the mlx-lm flag-name version variance (machine-independent, GPU-agnostic)
✅ mlx-lm-importable-if-venv-present — if ~/mlx-lora-env exists, mlx_lm imports inside it; else SKIP-OK (no GPU/venv assumed on this runner)

3/3 checks · score 3/3
```

Stayed 3/3 green after the fix.
