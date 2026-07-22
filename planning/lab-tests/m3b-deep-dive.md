# Lab-test evidence — M3B Deep Dive: Fine-Tuning Parameters Under the Hood

**Machine:** Apple Silicon (arm64), 16 GB RAM
**Runtime:** Native MLX (no Docker) — `~/mlx-lora-env` venv, `~/mlx-lora-lab` working dir
**Date:** 2026-07-22
**Model:** `Qwen/Qwen2.5-0.5B-Instruct` (already cached locally from the core M3B lab)
**mlx-lm version:** **0.31.3** (`pip show mlx-lm`)

## Step 1 — Probe: real flags for this version

```
$ source ~/mlx-lora-env/bin/activate
$ mlx_lm.lora --help
```

Key finding: **`--lora-rank` does not exist as a CLI flag in mlx-lm 0.31.3.** Full flag list
includes `--fine-tune-type`, `--optimizer`, `--num-layers`, `--batch-size`, `--iters`,
`--learning-rate`, `--save-every`, `--adapter-path`, `-c/--config`, etc. — no rank flag.

Inspected `mlx_lm.lora.CONFIG_DEFAULTS` directly (`python -c "import mlx_lm.lora as m; print(m.CONFIG_DEFAULTS)"`)
and confirmed rank lives only inside a nested dict:

```python
"lora_parameters": {"rank": 8, "dropout": 0.0, "scale": 20.0},
```

— settable only via a YAML file passed with `-c/--config`. `--learning-rate` **is** a working
top-level CLI flag (confirmed in `--help` output and in `CONFIG_DEFAULTS["learning_rate"] = 1e-5`).
`--num-layers` is also a direct CLI flag (default 16; both lab and deep-dive override to 4).

**Page fix applied before running anything:** Variant A's command now writes a 4-line
`rank4.yaml` (`lora_parameters: {rank: 4, dropout: 0.0, scale: 20.0}`) and passes it via `-c
rank4.yaml` alongside the same CLI flags as the baseline. The `:::note[Flags pinned during
validation]` admonition was rewritten to state mlx-lm 0.31.3, the absence of `--lora-rank`, and
where rank/scale actually live (`lora_parameters` in a YAML config).

## Step 2 — Seed: idempotent, and it was already self-sufficient

`~/mlx-lora-lab` did **not** exist on this machine before this run (prior lab/deep-dive runs had
been torn down). Ran the page's `:::info[Where this picks up]` seed block exactly as printed —
`mkdir -p`, the `[ -f train.jsonl ] || cat > train.jsonl << 'EOF' ... EOF` idempotent heredoc,
`cp -n train.jsonl valid.jsonl`, `source ~/mlx-lora-env/bin/activate`. It successfully recreated
both `train.jsonl` and `valid.jsonl` from scratch with no dependency on the core lab having run
first — **no defect found here**; the seed step as written is already self-sufficient (it embeds
the same data-creation heredoc as the core lab's Step A-2, not a reference to it).

## Step 3 — Experiment, run sequentially (one at a time, 16 GB budget)

All three runs used the already-cached `Qwen/Qwen2.5-0.5B-Instruct` (downloaded by a prior lab
run on this machine), so each run completed in ~7 seconds wall-clock. A cold download would add
several minutes per the page's own caveat.

### Baseline (`--num-layers 4`, default rank 8, default LR 1e-5)

```
Trainable parameters: 0.148% (0.733M/494.033M)
Iter 1:  Val loss 3.721
Iter 10: Train loss 2.670
Iter 20: Train loss 1.056
Iter 30: Train loss 0.568
Iter 40: Train loss 0.305
Iter 50: Val loss 0.148, Train loss 0.200
```

Wall-clock: 7.563s total (`time` builtin).

### Variant A — rank 4 via `-c rank4.yaml` (default LR 1e-5)

```
Trainable parameters: 0.074% (0.367M/494.033M)   ← exactly half of baseline's 0.733M
Iter 1:  Val loss 3.721
Iter 10: Train loss 3.107
Iter 20: Train loss 1.670
Iter 30: Train loss 0.977
Iter 40: Train loss 0.607
Iter 50: Val loss 0.374, Train loss 0.449
```

Wall-clock: 7.371s total.

### Variant B — `--learning-rate 1e-4` (default rank 8)

```
Trainable parameters: 0.148% (0.733M/494.033M)
Iter 1:  Val loss 3.721
Iter 10: Train loss 1.353
Iter 20: Train loss 0.226
Iter 30: Train loss 0.134
Iter 40: Train loss 0.069
Iter 50: Val loss 0.028, Train loss 0.054
```

Wall-clock: 7.103s total.

### Generation — training-distribution prompt (all 3 adapters)

Prompt is one of the 8 training rows verbatim. All three adapters reproduced the exact training
target: `{"severity": "high", "host": "web-01", "metric": "cpu", "threshold": "90%", "duration":
"5m", "action": "page-oncall"}`. This only demonstrates memorization, not generalization — noted
explicitly on the page.

### Generation — held-out prompt (all 3 adapters, novel scenario never in training data)

Prompt: `"Summarise this alert: GPU temperature above 85C on ml-worker-07 for 2 minutes."`

All three adapters generalized correctly to the JSON schema with plausible inferred field values
(`gpu`/`85`/`2m`/`page-oncall`), confirming the adapter learned the underlying pattern rather
than just memorizing rows, even at rank 4 and at a 10x learning rate.

## Real-data surprise vs. the page's prior prediction

The page originally speculated Variant B (10x LR) would show the loss-oscillation/instability
signature from §3. The real run showed the **opposite** — faster, lower, smoother convergence
than the baseline, with no oscillation. This is a legitimate result, not a validation failure:
eight examples over 50 iterations is too small/easy a loss surface to expose LR instability. The
page was rewritten to report the real result honestly and explain why (toy-scale limitation),
rather than force the original prediction. This is itself a useful teaching point the page now
makes explicit.

## Comparison table (folded into the page)

| Variant | Rank | LR | Final train loss | Held-out generation |
|---|---|---|---|---|
| Baseline | 8 | 1e-05 | 0.200 (val 0.148) | correct |
| Variant A (rank 4) | 4 | 1e-05 | 0.449 (val 0.374) | correct |
| Variant B (LR 1e-4) | 8 | 1e-04 | 0.054 (val 0.028) | correct |

## Step 4 — Checks

`node scripts/run-checks.mjs labs/m3b/deep-dive.checks.json`

**Pre-teardown** (adapter dirs present):

```
✅ venv-mlx
✅ variant-adapters   (FOUND branch)
✅ comparison-table
✅ flags-pinned-admonition
4/4 checks · score 4/4
```

Ran the page's printed teardown verbatim:

```bash
rm -rf ~/mlx-lora-lab/adapters-baseline ~/mlx-lora-lab/adapters-variant-a ~/mlx-lora-lab/adapters-variant-b ~/mlx-lora-lab/rank4.yaml
```

**Post-teardown** (adapter dirs gone, `train.jsonl`/`valid.jsonl` and venv kept per the page's
teardown note):

```
✅ venv-mlx
✅ variant-adapters   (SKIP-OK branch — guard correctly falls through)
✅ comparison-table
✅ flags-pinned-admonition
4/4 checks · score 4/4
```

`labs/m3b/deep-dive.checks.json` did not need edits — its checks were already guard-based
(`FOUND|SKIP-OK`) and correctly pass in both the run and torn-down states; this is the intended
"pin to the real end-state" shape for a page whose whole point is throwaway comparison adapters.

## Fixes applied to the page

1. `:::note[Flags pinned during validation]` rewritten with the real mlx-lm 0.31.3 finding (no
   `--lora-rank` flag; rank/scale live in `lora_parameters` inside a `-c` YAML config).
2. Variant A's command block rewritten to generate and pass `rank4.yaml` via `-c`.
3. All three `<expected output — folded in during live lab validation>` placeholders replaced
   with real captured training logs (trimmed to first/last iters where the page's own baseline
   convention already did that — here all 6 report lines fit, so nothing was trimmed).
4. Both generation blocks (training-distribution prompt + new held-out-prompt block) folded with
   real output; a held-out generation block was added since the page's own methodology (§5)
   requires testing a prompt not in the training set, and the original draft only had the
   in-distribution prompt.
5. Comparison table filled with real final losses and a corrected narrative — Variant B's
   instability prediction did not materialize at this toy scale, reported honestly.
6. Typo fix: "corpate-docs" → "corporate-docs" (2 occurrences, §1 and the closing tip block).
7. Both teardown blocks (section-scoped + page-level) updated to also remove `rank4.yaml`.

## Verdict

✅ All real flags confirmed against the installed mlx-lm 0.31.3. All three experiment variants
ran sequentially end-to-end with real captured output folded into the page in command order.
Checks pass 4/4 both pre- and post-teardown. No defect found in the seed step (already
self-sufficient). One real defect found and fixed: the page assumed a `--lora-rank` CLI flag
that does not exist in this version.
