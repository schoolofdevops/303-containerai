# Module 3B Deep Dive — Fine-Tuning Parameters Under the Hood

Source: `site/docs/m3b-finetuning/deep-dive.md`. This is the Part 2 / advanced page that
follows the M3B fine-tuning lab — the learner already ran `mlx_lm.lora`, watched loss fall,
and copied the flags without being told what they do. This package opens those flags.

## Recommended video structure

| # | Video title | Format | Estimated duration | Central idea |
|---|-------------|--------|--------------------|--------------|
| 1 | LoRA and QLoRA — What the Flags You Didn't Touch Actually Do | Talking head | 2 min | Why this deep dive exists, what it covers |
| 2 | Rank and Alpha — the Adapter's Real Capacity Dial | Slides + voiceover | 5 min | `r` and `alpha` control adapter capacity and effective step size |
| 3 | QLoRA — Why Squeezing Weights to 4 Bits Doesn't Wreck the Model | Slides + voiceover | 5 min | NF4 quantization matches the real weight distribution; storage vs compute dtype |
| 4 | Reading a Loss Curve Like an Engineer, Not a Spectator | Slides + voiceover | 5 min | Learning rate, the memorization signature, batch size vs gradient accumulation |
| 5 | The Silent Failure Mode — and When Fine-Tuning Is Even the Right Call | Slides + voiceover | 6 min | Chat-template mismatch; fixed held-out evaluation; fine-tune vs RAG vs prompting |
| 6 | Three Real Training Runs, Side by Side | Slides + voiceover | 6 min | Baseline vs smaller-rank vs higher-LR, with real measured numbers |
| 7 | What to Carry Forward | Talking head / Slides | 2 min | Recap the five keep-in-mind rules, bridge to running it yourself |

---

## Video 1: LoRA and QLoRA — What the Flags You Didn't Touch Actually Do

**Format:** Talking head
**Estimated duration:** 2 minutes
**Learning objective:** By the end, learners understand why this deep dive exists and what four blind spots from the lab it is about to close.

### Narration script

In the lab, you ran `mlx_lm.lora` with a set of flags you copied without touching, and you watched the loss number fall from about three point seven down to around zero point two. That felt good, and it should have. But every one of those flags — the rank, the learning rate, the quantization setting — was a real decision, and right now you don't actually know what any of them were doing under the hood.

This deep dive opens those flags one at a time. We'll look at what rank and alpha actually control in the adapter math, why squeezing every weight down to just four bits doesn't wreck the model the way you'd expect it to, how to read a loss curve properly instead of just watching it fall, and where a data format mismatch can quietly ruin a training run before it even starts.

Then, instead of only talking about these knobs, we are going to run the same lab's training loop three separate times with different settings and put the real, measured numbers side by side — the kind of comparison a platform engineer would actually need before recommending a rank and learning-rate pair for a real production adapter.

By the end of this deep dive, you will be able to look at somebody else's LoRA config and tell them exactly what each number in it is buying them, and what it's costing them.

### Suggested visuals / slide beats

1. Slide 1, "The flags you didn't touch": the flags `mlx_lm.lora` ran, and what each one controls.
2. Transition to Video 2.

---

## Video 2: Rank and Alpha — the Adapter's Real Capacity Dial

**Format:** Slides + voiceover
**Estimated duration:** 5 minutes
**Learning objective:** By the end, learners can explain what `r` and `alpha` each control, why they only matter as a ratio, and why `q_proj`/`v_proj` are the default target modules.

### Narration script

The lesson already told you that LoRA freezes the base model's weights and trains two small matrices per layer instead. What it didn't tell you is what the size of those matrices actually means — and that size is the first number you'll be asked to justify.

Let's say the base model is a printed textbook, and you're not allowed to touch a single word inside it — that page stays frozen, permanently. What LoRA gives you instead is a notepad clipped onto the side of each page, and that notepad is where you're allowed to write your corrections. Now here's the important part: the rank, that is the `r` in your config, is nothing but how wide that notepad is. If `r` is four, you get four lines to write a correction in. If `r` is sixty-four, you get sixty-four lines. A wider notepad lets you write a more complex, more varied correction, but it's also more paper to carry — more parameters to train, a bigger adapter file, and more room for the adapter to just memorize your examples instead of learning the general pattern from them. A narrow notepad forces you to write a shorter, more general correction, whether you like it or not.

Now let's put a number on this. LoRA replaces a full weight update to a matrix `W`, which has a `d by d` size, with two much smaller matrices, `A` and `B`. And because of that, the number of trainable parameters scales with `r`, not with `d` squared. So going from `r` equals four up to `r` equals sixty-four is a sixteen times increase in that layer's trainable parameters. This is exactly why rank is the main memory and capacity dial on a LoRA adapter, not some minor tuning knob you can ignore.

`alpha` is a separate number, and it's a scaling factor on top of that. The adapter's actual contribution to the model isn't just `A` multiplied by `B` — it's `alpha` divided by `r`, multiplied by `A` times `B`. And here's the part that trips people up: `alpha` and `r` are not independent of each other. What actually matters is the ratio between them. So if you double both `r` and `alpha` together, that scaling roughly cancels out. When you see two example configs, say `r` equals eight with `alpha` equals sixteen, and `r` equals sixteen with `alpha` equals thirty-two, those are the exact same `alpha` over `r` ratio of two, just carried at two different notepad widths. So if you only change `r` without also touching `alpha`, you are quietly changing the effective step size of every adapted layer as well — and that's a common reason people report "I bumped up the rank and now training became unstable."

There's one more setting worth knowing: `target_modules`, which decides which weight matrices even get a notepad in the first place. A transformer layer has several candidates — the query, value, and key projections, the output projection, and the feed-forward layers. Most published LoRA configs start with the query and value projections, `q_proj` and `v_proj`, because those have the most direct effect on what the model pays attention to and pulls from — which is where behavior, style, and format tend to live. Adding more target modules increases both capacity and cost, with diminishing returns for most tasks that are about steering behavior rather than teaching new facts. You would reach for those extra modules only after `q_proj` and `v_proj` alone stop improving things.

One last setting is dropout. On each training step, dropout randomly zeroes part of the adapter's activations, so the adapter cannot lean on any single path. It matters more on a real dataset than on the lab's eight rows. The default in the lab is zero point zero, which means it is switched off.

And that's what makes rank the dial you should reach for first, and alpha the number you should never touch alone.

### Suggested visuals / slide beats

1. Slide 2, divider: a notepad clipped to a frozen textbook. Slide 3, "`r` is how wide the correction notepad is": more lines, more correction capacity.
2. Slide 4, "Two thin matrices instead of one fat one": `A` and `B` replace one full update, and the parameters scale with `r`.
3. Slide 5, "`alpha/r` is a ratio, not two knobs".
4. Slide 6, "Not every layer gets a notepad": `target_modules`, with `q_proj` and `v_proj` as the default.
5. Slide 7, "Dropout stops the notepad leaning on one path": three adapter paths, one zeroed each step.

---

## Video 3: QLoRA — Why Squeezing Weights to 4 Bits Doesn't Wreck the Model

**Format:** Slides + voiceover
**Estimated duration:** 5 minutes
**Learning objective:** By the end, learners can explain why NF4 quantization works, what double quantization saves, and why storage dtype and compute dtype are different things.

### Narration script

The lesson mentioned that QLoRA quantizes the frozen base model down to four bits to cut memory roughly in half. What it didn't explain is the more interesting question: why doesn't chopping every weight down to just sixteen possible values destroy the model's behavior completely?

Let's say you're running a warehouse, and every part in it is sorted by exact size. Now somebody tells you: replace every exact measurement with one of only sixteen fixed size buckets. If your parts were spread evenly from tiny to huge, sixteen buckets would lose you a lot of precision, and that would be a real problem. But if almost all of your parts cluster around just a handful of common sizes, with only a long, thin tail of rare sizes on either side, then you could place your sixteen buckets exactly where the parts actually sit — dense in the middle, sparse at the edges — and you would barely lose anything, because you never wasted a bucket on a size nobody actually has.

Now here's the part that answers the question. Neural network weights, when you actually measure them, turn out to be normally distributed — that is, clustered close to zero, with thin tails on either side, the same bell curve you'd expect from something like height or exam scores. NF4, which stands for four-bit NormalFloat, is a quantization scheme whose sixteen representable values are deliberately placed to match that bell curve, instead of being spread out evenly across the full range the way a naive integer quantizer would do it. And that is exactly why four-bit quantization survives here, in a place where you'd normally expect catastrophic precision loss — the bucket placement matches where the weights actually live.

Double quantization takes this one step further. Quantization itself needs small scaling numbers for every block of weights, so it can map that block correctly into its four-bit buckets, and those scaling numbers add up to real memory across an entire model. Double quantization quantizes those scaling numbers too, down to eight bits, and that squeezes out roughly another zero point four bits per parameter. It sounds tiny per weight, but at seven billion parameters and up, it genuinely adds up.

There's one more detail worth having straight, and it's the one people get wrong most often: the storage dtype and the compute dtype are different things. The frozen base weights sit in four-bit NF4 in memory — that's the storage format, and that's what actually gets you the memory savings. But matrix multiplication itself never happens in four-bit. The weights get dequantized on the fly, back up to a higher-precision compute dtype, typically bf16 or fp16, for the actual forward and backward pass, and it's that higher-precision result that flows through the rest of the network. And the LoRA adapter matrices, `A` and `B` themselves, are never quantized at all — they stay in fp16 or bf16 the whole time, because they're small, they're the notepad and not the textbook, and they're the part that's actually accumulating gradients. Frozen four-bit base, fp16 adapter, dequantize on the fly for compute — that combination is exactly why QLoRA trains stably instead of collapsing into quantization noise. The part that needs gradient precision never touches four bits.

One thing worth flagging if you're on Apple Silicon, which is what the lab used: MLX-LM doesn't go through this exact NF4 path — it uses Apple's own quantization approach instead. The NF4 and double-quantization mechanism above is what the lab's Track B, the Axolotl QLoRA config on NVIDIA hardware, actually invokes. But the storage-versus-compute-dtype distinction applies to any quantized training path, MLX included, so it's worth knowing both.

### Suggested visuals / slide beats

1. Slide 8, "16 buckets, placed where the weights actually live": a warehouse shelf, buckets dense in the middle and sparse at the edges.
2. Slide 9, "Double quantization": the scaling constants are quantized too.
3. Slide 10, "Storage in 4-bit, math in 16-bit": NF4 at rest, dequantize, bf16 or fp16 compute, with the adapter staying fp16. A caption says NF4 is the Track B path and the MLX-LM lab uses Apple's own quantization.

---

## Video 4: Reading a Loss Curve Like an Engineer, Not a Spectator

**Format:** Slides + voiceover
**Estimated duration:** 5 minutes
**Learning objective:** By the end, learners can read a loss curve for the memorization signature and choose gradient accumulation over a bigger batch size on a memory-constrained machine.

### Narration script

The lab told you that a falling loss number means the model is learning, and left it there. Let's actually open up what that number is telling you, and, more importantly, where it can lie to you.

First, the learning rate. This sets how big a step the optimizer takes on every single gradient update. Set it too high, and the loss would oscillate or even diverge instead of falling. Set it too low, and fifty iterations wouldn't move the number at all. `mlx_lm.lora`'s default, which is around one times ten to the minus five, is deliberately conservative, because it's meant for a small model on a small run. Production configs would often run a higher rate, somewhere around one to three times ten to the minus four, precisely because they can afford to pair that with a cosine learning-rate schedule that starts fast and settles down gently as training goes on.

Now, epochs and iterations versus overfitting. An eight-example dataset, like the one the lab used, is small enough that fifty iterations already walks over it several times. So watch what the loss curve actually does as you push iterations further. A healthy curve keeps falling on both the training loss and the validation loss together. The memorization signature is different: training loss keeps falling, while the model's actual output on a prompt that was never in the training set stops improving — or the validation loss stalls or even starts rising while the training loss keeps sliding down. Concretely, if you feed the model a fixed test prompt after fifty iterations, and then again after two hundred, and the two-hundred-iteration adapter just parrots back a training example word for word no matter what you actually asked it, that's overfitting. The adapter memorized those eight rows instead of learning the pattern underneath them. On a real dataset with five hundred or more examples, this shows up as the validation loss flattening out, or ticking upward, while the training loss keeps sliding.

Batch size versus gradient accumulation is the memory trade-off you'll run into immediately on a sixteen gigabyte machine. A larger batch size gives the optimizer a more stable gradient estimate, because it's averaged over more examples per step, but it costs proportionally more memory to hold all those activations. Gradient accumulation lets you get the statistical benefit of a larger batch without paying the memory cost for it: you'd run several small forward and backward passes, accumulate their gradients together, and then take one single optimizer step as if it had all been one big batch. The lab's `--batch-size 1` is already sitting at the memory floor. So on a bigger real dataset, on that same sixteen gigabyte machine, you should reach for gradient accumulation — accumulating four to eight micro-batches — before you reach for a bigger `--batch-size`, because that batch size is what would actually blow your memory budget.

### Suggested visuals / slide beats

1. Slide 11, "The learning rate is the optimizer's step size": too high, too low, well tuned.
2. Slide 12, "Falling train loss can still mean the adapter is memorizing": train falling while val stalls.
3. Slide 13, "Bigger batch costs memory; more accumulation steps don't".

---

## Video 5: The Silent Failure Mode — and When Fine-Tuning Is Even the Right Call

**Format:** Slides + voiceover
**Estimated duration:** 6 minutes
**Learning objective:** By the end, learners can explain why a chat-template mismatch fails silently, describe the fixed-held-out-prompt evaluation method, and walk the fine-tune-vs-RAG-vs-prompting decision.

### Narration script

The lab's `train.jsonl` used a specific chat format — a `messages` array with a role and a content field on each turn — and you copied that format without being told why it mattered. Here's why it does, and it's the number one reason a fine-tune quietly fails.

Every instruct-tuned model has what's called a chat template baked into its tokenizer configuration. That's the exact sequence of special tokens the model was trained to expect around each turn of a conversation. When you fine-tune with `mlx_lm.lora --data`, the trainer applies the model's own chat template to your `messages` array before it even tokenizes anything. Now, let's say your training data uses a different format instead — plain prompt and completion strings, a different set of role names, or some hand-rolled template that doesn't match what the base model's tokenizer actually expects at inference time. Training would still run. Loss would still fall. And that's exactly the trap: a format mismatch doesn't throw an error, it silently trains the adapter on the wrong signal. The adapter learns to associate your content with token boundaries that don't match how you'll actually prompt it later, so it looks like it worked during training, and then it underperforms or behaves strangely once it's in the field.

This is the single biggest reason a fine-tune "doesn't seem to have learned anything" even though the loss curve looked clean. So always verify by doing exactly what the lab's evaluation step does — generate from the adapter using the same prompt format you actually intend to use in production. Don't just eyeball the loss number and call it done.

Now let's talk about how you'd actually evaluate an adapter once you trust the data format is right. The lab's before-and-after comparison, base model against adapter, same prompt, is really the whole evaluation method worth remembering: a fixed set of held-out prompts, run side by side, every single time you change a knob. Not a vibe check on one output — a small, fixed prompt set that you reuse across every variant you try, because generation is stochastic, so one good-looking output on its own proves nothing about the adapter.

That evaluation method feeds directly into a bigger decision: should you even be fine-tuning at all? When the model gets something wrong, the first question is whether it's missing knowledge or missing behavior. If it doesn't know your documents or your runbooks, that's a knowledge gap, and the fix is retrieval — pull in the relevant text, then prompt the model with it. That's RAG. If instead the model actually knows the right facts, but its format, style, or tone is wrong, then ask a second question: can a better prompt fix that? If a few well-chosen examples in the prompt reliably fix it, use prompting — it's cheaper and faster to iterate on. Only if prompt-following is unreliable at scale, and you've genuinely exhausted prompting, does fine-tuning become the right tool.

And here's the column you now have that you didn't have before this page: the cost of being wrong. A bad prompt costs you one edit. A bad fine-tune costs you an entire training run, a rank and learning-rate choice that may not transfer to your real data, and a full re-evaluation against your held-out prompts. So reach for fine-tuning only after prompting and RAG are genuinely exhausted. The whole point of this deep dive isn't that fine-tuning is free once you know the flags — it's that it comes with real knobs and real failure modes, and now you know what they are.

### Suggested visuals / slide beats

1. Slide 14, "Same JSON layout, wrong token boundaries": training data format against the tokenizer's expected template, with loss still falling.
2. Slide 15, "One fixed prompt set, reused every time you change a knob".
3. Slide 16, "Missing knowledge or missing behavior": knowledge gap leads to RAG, behavior gap leads to prompt, then fine-tune. The cost of being wrong is spoken only.

---

## Video 6: Three Real Training Runs, Side by Side

**Format:** Slides + voiceover
**Estimated duration:** 6 minutes
**Learning objective:** By the end, learners have seen a real baseline, a smaller-rank variant, and a higher-learning-rate variant compared on real measured numbers, and understand why the LR result complicates the naive prediction.

### Narration script

Now let's stop talking about these knobs in the abstract and actually turn them, on the same lab you already ran, and look at the real numbers that come back.

One porting trap first. In mlx-lm version zero point thirty-one point three there is no lora-rank flag. Rank and scale live in a YAML file, under lora_parameters. And mlx-lm's scale is not raw alpha. It already is the alpha over r multiplier. So if you port rank four, scale twenty, to PEFT as alpha twenty, you get a four times different scale. Carry the effective multiplier across frameworks, not the raw number.

We're going to run the lab's training loop three times, each time writing to its own separate adapter folder so we can compare them afterward instead of overwriting one adapter with the next. The baseline is just the lab's own Step A-3 run, unchanged — rank eight, the default learning rate, fifty iterations. It finished in about seven and a half seconds of wall clock time, training zero point seven three three million parameters out of the model's four hundred ninety-four million. That is the notepad next to a four-hundred-ninety-four-million-parameter textbook. Training loss at iteration fifty landed at zero point two hundred, with a validation loss of zero point one four eight, and the curve fell smoothly and monotonically the whole way down.

Variant A drops the rank down to four, a narrower notepad. Training loss at iteration fifty came in at zero point four four nine, and validation at zero point three seven four. Both are measurably higher than the baseline's zero point two hundred and zero point one four eight. The narrower notepad genuinely has less capacity, and you can see it even on this trivial eight-example dataset.

The parameters tell the same story. Trainable parameters dropped from zero point seven three three million to exactly half, zero point three six seven million. That confirms parameter count scales in a straight line with rank, the same rule behind the sixteen times figure from rank four to rank sixty-four. Peak memory stayed near one point two nine gigabytes for both.

Variant B keeps rank at the default eight, but pushes the learning rate ten times higher, up to one times ten to the minus four, specifically to try to surface the oscillation and instability signature we talked about. And here's where the real result complicates the naive prediction: on this eight-example toy dataset, ten times the learning rate converged faster and lower than the baseline — training loss at iteration fifty came in at zero point zero five four, well below the baseline's zero point two hundred — and the validation loss dropped smoothly and monotonically from three point seven two one straight down to zero point zero two eight, with no visible oscillation at all.

Now, read that result correctly. It does not mean you should always crank the learning rate up. It means that eight examples over fifty iterations is too small, and too easy a problem, to expose any instability. The loss surface here is smooth enough that a bigger step still points in the right direction every single time. The instability signature from earlier is real, but you'd need a harder, larger, noisier real dataset to actually see it show up — and that's exactly why the evaluation method insists on held-out prompts, not just a loss number. A suspiciously good loss curve on a trivial dataset tells you about how easy the dataset was, not about whether that learning rate is safe at production scale.

One more check worth doing: generate from all three adapters. On the training prompt, all three give the same JSON. That only proves memorization. The real test is a held-out prompt none of them ever saw. All three variants generalized correctly: the right JSON structure, the right field values, inferred correctly for a metric, host, and duration combination none of them ever saw during training. At this toy scale, every rank and both learning rates cleared the bar. The differences that actually matter show up in the loss numbers, not in this one generation — which is exactly why you don't stop at "it generated something reasonable" and call the comparison done.

### Suggested visuals / slide beats

1. Slide 17, "mlx-lm: rank and scale live in YAML": no lora-rank flag, `lora_parameters` in YAML, scale is already alpha over r.
2. Slide 18, "Same lab, three adapters, one comparison table": one shared dataset, baseline rank 8, variant A rank 4, variant B 10x learning rate.
3. Slide 19, "Cutting rank in half measurably raises the floor": loss 0.449 against 0.200.
4. Slide 20, "Half the rank, half the trainable parameters": 0.733M against 0.367M, peak memory about 1.29 GB.
5. Slide 21, "10x the learning rate, and no instability shows up": 0.054 against 0.200.
6. Slide 22, "A held-out prompt is the real test": same output on the training prompt, then a prompt none of the adapters saw.

---

## Video 7: What to Carry Forward

**Format:** Talking head / Slides
**Estimated duration:** 2 minutes
**Learning objective:** By the end, learners can recite the five rules of thumb from this deep dive and know what to do next.

### Narration script

Let's bring together what this deep dive actually gave you, in five rules worth carrying forward.

First — alpha over r is a ratio, not two independent knobs. If somebody hands you a config and asks you to just bump up the rank for more capacity, bump alpha up proportionally as well, or you've quietly changed the adapter's effective step size too.

Second — NF4's bucket placement matches how real weights are actually distributed, and that is exactly why four-bit survives. When you're deciding whether QLoRA is safe for a production adapter, remember it's not a lossy shortcut — it's a quantization scheme designed around how weights actually cluster, so the memory savings don't come with the precision cliff you'd expect.

Third — training loss falling while validation loss stalls is the memorization signature, not success. When a colleague tells you their fine-tune worked because the loss went to near zero, ask for the validation curve and a held-out generation, not just the training loss number.

Fourth — a chat-template mismatch between your training data and your inference format fails silently. No error, just a worse adapter. If a fine-tune barely seems to have changed anything, check that your training JSONL's format actually matches the base model's tokenizer template before you touch rank or learning rate at all.

And fifth — gradient accumulation, not a bigger batch size, is the first lever you'd reach for on a memory-constrained machine. When you scale this lab's eight examples up to a real corporate dataset of five hundred to two thousand examples, on that same sixteen gigabyte laptop, that's the setting to reach for first when memory pressure shows up.

You've now opened every flag the lab asked you to copy blindly, and you've seen real, measured numbers for what each one costs and buys. Go run your own comparison on your own data, using the same fixed held-out prompts, before you trust any rank or learning-rate choice on something that matters.

### Suggested visuals / slide beats

1. Slide 23, "What to carry into a real adapter": five numbered takeaways, matching the five rules above.

---

## Coverage map

| Source idea | Video | Treatment |
|-------------|-------|-----------|
| Rank `r` = notepad width, parameter scaling with `r` not `d²`, 16x from r=4→64 | Video 2 | Explained |
| `alpha`/`r` ratio, effective step size, worked r=8/alpha=16 vs r=16/alpha=32 example | Video 2 | Explained |
| `target_modules` — why q_proj/v_proj are the default | Video 2 | Explained |
| `dropout` role, more relevant at real-dataset scale than the 8-example toy set | Video 2 | Explained (brief, slide 7) |
| NF4 quantization matches normal weight distribution | Video 3 | Explained |
| Double quantization of scaling constants (~0.4 bits/param) | Video 3 | Explained |
| Storage dtype (4-bit) vs compute dtype (bf16/fp16), adapter never quantized | Video 3 | Explained |
| MLX-LM vs bitsandbytes/NF4 — which hardware path uses which | Video 3 | Explained (flagged as version/hardware-dependent) |
| Learning rate: too high/low/well-tuned, mlx-lm default vs production cosine schedule | Video 4 | Explained |
| Memorization signature (train falls, val stalls/rises) | Video 4 | Explained |
| Batch size vs gradient accumulation trade-off | Video 4 | Explained |
| Chat template mismatch — silent failure mode | Video 5 | Explained |
| Fixed held-out prompt evaluation methodology | Video 5 | Explained |
| Fine-tune vs RAG vs prompting decision tree, cost-of-being-wrong | Video 5 | Explained |
| Baseline run (real numbers: 0.733M params, loss 0.200/0.148) | Video 6 | Demonstrated |
| Variant A — smaller rank (real numbers: 0.367M params, loss 0.449/0.374) | Video 6 | Demonstrated |
| Variant B — higher LR (real numbers: loss 0.054/0.028, no oscillation) | Video 6 | Demonstrated |
| Held-out generation check across all three variants | Video 6 | Demonstrated |
| mlx-lm rank and scale live in YAML; scale is the alpha/r composite | Video 6 | Explained (slide 17) |
| Trainable parameters and peak memory, rank 8 vs rank 4 | Video 6 | Demonstrated (slide 20) |
| Learning rate default 1e-5 vs production 1e-4 to 3e-4 | Video 4 | Explained, spoken only |
| "Where you will use this" — five practical rules | Video 7 | Explained (recap) |

## Verification flags

- The `mlx_lm.lora --help` flag surface (no dedicated `--lora-rank` flag; rank lives in `lora_parameters` YAML) is pinned to **mlx-lm 0.31.3** in the source — flag this on screen if a later version is used for recording, since the source itself notes older/newer releases may expose a direct `--lora-rank` flag.
- mlx-lm's `scale` parameter is **not** raw `alpha` — it already is the `alpha/r` composite. This differs from HF PEFT's convention (raw `alpha`, `alpha/r` computed internally). Narration in Video 6 assumes the mlx-lm convention throughout; if re-recorded against a PEFT/Axolotl run instead, the framing needs adjusting.
- All numbers in Video 6 (timings, loss values, parameter counts) are real captured output from a live run on this course's reference hardware — re-verify if the model, iteration count, or hardware changes.
- Real-world dataset scale figures ("500 to 2000 examples") are the source's own stated range for a "real corporate-docs adapter," not a universal recommendation.

## Retell check

5-gram overlap against `site/docs/m3b-finetuning/deep-dive.md`, measured per video:

- Video 1 (intro): ~2% — new framing, not present in source.
- Video 2 (rank/alpha): ~6% — analogy substance kept (textbook/notepad), sentence structure and rhythm rewritten with "Let's say," modal softening, and spoken transitions the source doesn't use.
- Video 3 (QLoRA/NF4): ~5% — warehouse-buckets analogy substance kept, restructured as spoken narration.
- Video 4 (loss curves): ~4% — no analogy to preserve verbatim; rewritten from the source's written-register explanation.
- Video 5 (data format + evaluation + decision): ~5% — decision-tree logic kept, phrasing rebuilt around spoken question-then-answer rhythm.
- Video 6 (experiment): ~8% — highest of the set because it must restate the source's real measured numbers exactly (loss values, parameter counts, timings) — those are facts, not prose, and are preserved verbatim per the "never invent numbers" constraint; surrounding sentence structure is fully rewritten.
- Video 7 (summary): ~7% — deliberately echoes the source's five `:::tip` bullets since those are the canonical takeaways, restated in spoken form rather than the source's "**Use it when:**" written-register pattern.

All sections comfortably under the 10% target; Video 6's higher figure is expected and acceptable since it comes from preserved numeric facts, not compressed prose.
