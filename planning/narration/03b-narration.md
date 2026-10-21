# Module 3B — Customizing Models with LoRA/QLoRA

## Recommended video structure

| # | Video title | Format | Estimated duration | Central idea |
|---|-------------|--------|--------------------|--------------|
| 1 | Module 3B Introduction — Why Fine-Tune at All | Talking head | 2 min | Why this module exists, where it sits in the course, what you'll be able to do |
| 2 | Fine-Tuning vs Prompting vs RAG — When Each One Wins | Slides + voiceover | 4 min | The three-question decision tree, and the four cases where fine-tuning is the right call |
| 3 | LoRA and QLoRA Explained — How Fine-Tuning Actually Changes a Model | Slides + voiceover | 5 min | The sticky-notes-on-a-textbook analogy, then the real mechanism: frozen weights, low-rank matrices, 4-bit quantization |
| 4 | Axolotl, Unsloth, and MLX-LM — Picking Your Fine-Tuning Toolchain | Slides + voiceover | 5 min | The three stacks, the container-vs-native split, and why Apple Silicon can't accelerate training in a container |
| 5 | Reproducible Fine-Tuning — From Adapter to Container Image | Slides + voiceover | 4 min | Why scripts rot but image tags don't, and what you do with the adapter once you have it |
| 6 | Module 3B Summary and Lab Bridge | Slides + voiceover | 2 min | Recap, and the two tracks waiting in the lab |

## Video 1: Module 3B Introduction — Why Fine-Tune at All

**Format:** Talking head
**Estimated duration:** 2 minutes
**Learning objective:** By the end, learners understand why fine-tuning belongs in this course, what it produces, and which of the two lab tracks applies to their machine.

### Narration script

Hello and welcome back. In the last module you served a production model with vLLM, and you got very good at asking a model questions the right way. But there is a question prompting can never fully answer, and that is, what if the model needs to behave differently, not just answer differently?

Let's say your support team writes in a very specific tone, and every reply follows a fixed structure. You could keep writing a longer and longer system prompt to describe that tone. Or you could actually change the model's habits, permanently, with a small, cheap training run. That second path is fine-tuning, and this module, 3B, is where you learn it.

This one is optional, and it's also gated by your hardware. If you're on Apple Silicon, you will run Track A, using Apple's own MLX-LM, natively on your Mac. If you have access to an NVIDIA GPU, through WSL2, a cloud VM, or bare metal Linux, you'll run Track B with Axolotl and QLoRA. Neither track runs inside a container on a Mac, and you'll learn exactly why in a few minutes.

By the end of this module, you'll know when fine-tuning actually beats prompting or RAG, you'll understand what LoRA and QLoRA do to a model's weights, and you'll know which toolchain to reach for. And here's the part that ties it back to everything else in this course. The container isn't just where you run the training, in this case it mostly isn't. The container is what you reproduce. Let's get into it.

### Suggested visuals / slide beats

1. Slide 1, title: a frozen base model with a small clip-on adapter.
2. Slide 2, "What you'll learn": four objectives, when to fine-tune, what LoRA does, which toolchain, why the frozen container matters.
3. Closing line on screen: "The container is what you reproduce."

---

## Video 2: Fine-Tuning vs Prompting vs RAG — When Each One Wins

**Format:** Slides + voiceover
**Estimated duration:** 4 minutes
**Learning objective:** By the end, learners can decide, for a real problem, whether prompting, RAG, or fine-tuning is the right tool.

### Narration script

Picture the problem first. A generalist model with a good prompt is usually right. Sometimes it breaks the format, or misses your dialect. A specialist gets it right every time. That is a behavior gap, not a knowledge gap.

Now, before you start a fine-tune, there are three questions worth asking, in order. Let's walk through them.

The first question is, can you solve this with a better system prompt? If yes, that's your answer, and it's almost always cheaper than training anything. The second question is, does the model need to reason over your own private documents, things it was never trained on? If yes, that's a knowledge problem, and you already know the fix for that, it's RAG, which you covered back in Module 5. And the third question is the interesting one for this module. Does the model need to behave differently, a new style, some domain vocabulary, a consistent output format, in a way that no prompt reliably gets you? If that's a yes, now you're looking at fine-tuning.

So when does fine-tuning actually make sense? There are four situations, and let's go through each one.

One, you have somewhere between fifty and five thousand high-quality examples of the exact behavior you want. Or maybe, two, you need reliable output structure, always valid JSON, always a specific schema, and few-shot prompting keeps breaking on the edge cases. Or maybe, three, you're deploying to edge hardware, and you need a smaller specialist model instead of one big generalist that does everything. Or maybe, four, you want to teach the model a domain dialect, your internal product names, an acronym set, a particular writing style, that simply isn't in its training data anywhere.

Now here's the important part, and it's easy to get wrong. Fine-tuning does not help when your problem is really a knowledge problem. If the model doesn't know your runbooks, that is a RAG problem, and no amount of fine-tuning fixes it, because you'd be trying to bake fast-changing facts into slow-changing weights. And it won't help with an inference problem either, that is, when the model reasons incorrectly on a task it should already understand. For that, you would improve your prompt, or you would reach for a smarter base model.

So the short version is, prompting first, RAG for a knowledge gap, and fine-tuning only for a genuine behavior gap. Keep that decision in mind, because in the next video we look at what fine-tuning actually does to the model to close that gap.

### Suggested visuals / slide beats

1. Slide 4, "The problem: a behaviour gap": a generalist that occasionally breaks format, against a specialist that always emits valid JSON.
2. Slide 5, "Prompt vs RAG vs fine-tune": three columns, an instruction gap, a knowledge gap, a behaviour gap.
3. Slide 6, "Four cases where fine-tuning fits": 50 to 5000 examples, reliable structure, a smaller specialist, a domain dialect, with the "does not fix" strip for knowledge gaps and reasoning errors.

---

## Video 3: LoRA and QLoRA Explained — How Fine-Tuning Actually Changes a Model

**Format:** Slides + voiceover
**Estimated duration:** 5 minutes
**Learning objective:** By the end, learners can explain what LoRA freezes, what it trains, and why QLoRA lets you fine-tune a large model on a single consumer GPU.

### Narration script

Let's say you have a thick, expensive textbook, and you want to annotate it for a specialist audience, medical readers, say. You can't rewrite the book itself, that would be too expensive, and you would lose all the general knowledge that was already in it. So instead, you stick Post-it notes in the margins. Small, targeted additions that change how a specialist reader understands a section, without touching a single printed page underneath. And when you hand that same book to a general reader, you just peel the notes off. The textbook is unchanged.

That is exactly what LoRA does, and LoRA stands for Low-Rank Adaptation. A language model's behavior lives inside billions of numbers, arranged into weight matrices. Full fine-tuning would update every single one of those numbers, in every matrix, and that is enormously expensive, in GPU memory and in compute time. LoRA instead freezes the original weight matrices, that's your textbook, and it trains two small matrices alongside each layer, and those are your sticky notes. At inference time, those two small matrices get multiplied together, and the result gets added on top of the frozen weights. That's a cheap operation, and the trained adapter that comes out of it is typically only one to three percent the size of the original model. You can hot-swap it in and out without ever reloading the base weights.

Now QLoRA takes this one step further. QLoRA also quantizes the frozen base model down to 4-bit, during training, and that would halve the GPU memory footprint again. The adapter itself stays in higher precision, so the gradient quality doesn't suffer. And this is exactly what lets you fine-tune a 7 billion or 13 billion parameter model on a single consumer GPU, something that would be completely out of reach with a full fine-tune.

So to summarize the mechanism. The base model, frozen, possibly 4-bit in QLoRA's case, feeds into a merge step, alongside two small trainable matrices. That merge produces the effective weight the model actually uses at serving time. And the adapter itself, the two small matrices together, usually comes out under 100 megabytes.

In the next video, we'll look at the toolchain you'd actually use to run this, on NVIDIA hardware and on Apple Silicon, and why one of those two paths cannot run inside a container.

### Suggested visuals / slide beats

1. Slide 7, divider: "2 · LoRA — sticky notes on a textbook".
2. Slide 8, "LoRA, sticky notes on a textbook": frozen base weights W, two small matrices A and B, and W + A×B at inference.
3. Slide 9, "QLoRA, squeeze the base to 4-bit": a 16-bit base too big for one GPU, quantized to 4-bit, with the adapter in higher precision, so a 7B fits in about 24 GB.
4. The adapter size, one to three percent of the base and under 100 MB, is shown later on slide 17.

---

## Video 4: Axolotl, Unsloth, and MLX-LM — Picking Your Fine-Tuning Toolchain

**Format:** Slides + voiceover
**Estimated duration:** 5 minutes
**Learning objective:** By the end, learners know which of the three toolchains fits their hardware, and can explain why containerized training cannot use the GPU on a Mac.

### Narration script

There are three toolchains that between them cover nearly every fine-tuning job you'll run into, and let's look at each one.

The first is Axolotl, and it's the one you'd reach for on NVIDIA hardware, especially for production work. Axolotl wraps Hugging Face's TRL and PEFT libraries behind a single YAML config file. You describe the run, the dataset, the model, the training settings, all in that one file, and Axolotl handles the rest, including dataset preprocessing, multi-GPU support, and checkpointing. It ships as a Docker image, winglian slash axolotl, and that image already has the right versions of bitsandbytes, CUDA, and PEFT pinned together. And that pinning is actually the real payoff here, because the image itself becomes your experiment record, not just a runtime.

Or maybe you want more speed. That's where Unsloth comes in. Unsloth rewrites the key training kernels in Triton, and it achieves twice the speed and sixty percent less VRAM, compared to a standard PEFT run. It also ships as a Docker image, so it drops straight into the same container-based workflow as Axolotl.

Or, if you're on Apple Silicon, neither of those two apply, and you'd reach for MLX-LM instead. Apple's MLX framework runs directly on the Neural Engine and the GPU cores of an M-series chip, using what's called unified memory, that is, the same physical RAM gets shared between the CPU, the GPU, and the Neural Engine, without copying anything back and forth. And that's what lets you fine-tune a 3 billion or 7 billion parameter model, on a MacBook Pro, with just 16 to 32 gigabytes of RAM.

Now here's the key constraint, and it's the reason this module has two tracks instead of one. bitsandbytes and CUDA simply don't exist on macOS. There is no Mac container that speeds up fine-tuning, none, because a Docker container on a Mac has no path to the Metal GPU or the Neural Engine. So MLX-LM has to run natively, you'd install it directly with pip install mlx-lm, exactly the way Ollama runs natively back in Module 1.

On an NVIDIA machine though, whether that's WSL2, a cloud VM, or bare-metal Linux, the Axolotl and Unsloth containers genuinely do speed things up, through the dash-dash-gpus-all flag and the NVIDIA Container Toolkit, exactly the pattern you already saw on the GPU track back in Module 3.

So the short version is, Axolotl or Unsloth in a container on NVIDIA, MLX-LM natively on a Mac, and no in-between. In the next video we look at what you do once the training run finishes, and why the container you trained inside matters more than the training script itself.

### Suggested visuals / slide beats

1. Slide 11, "The open-source toolchain": two panels. NVIDIA (containerized) lists Axolotl, Unsloth and the pinned Axolotl image. Apple Silicon (native) lists MLX-LM and unified memory.
2. Slide 13, "The same GPU reality, again": the Mac with MLX-LM native and a container that is CPU only, against NVIDIA with the Axolotl container and `--gpus all`.
3. Same slide, callout: "bitsandbytes and CUDA won't install on macOS."

---

## Video 5: Reproducible Fine-Tuning — From Adapter to Container Image

**Format:** Slides + voiceover
**Estimated duration:** 4 minutes
**Learning objective:** By the end, learners understand why the container image, not the training script, is the reproducible artifact, and what you can do with a finished adapter.

### Narration script

Let's say your fine-tuning run finishes, and the adapter you get out of it is genuinely good. Six months from now, you need to reproduce that exact result. And here's the problem, scripts rot. Python versions drift, PEFT releases quietly change their default behavior, bitsandbytes updates change how quantization works under the hood. None of that shows up as an error, it just shows up as a slightly different adapter the next time you run the same script.

An OCI image doesn't rot the same way. The winglian slash axolotl image, at a specific version tag, has every one of those dependencies pinned down, permanently. So the workflow looks like this. You run the training, you tag the git commit for your YAML config, and you tag the Docker image you trained inside, and you push both to your registry. Now you have an immutable experiment record, that is, a record that can't quietly change under you, ever. And that is exactly why we said earlier that the container is what you reproduce, not the script.

Now, what do you actually get out of a LoRA fine-tune? You get a small adapter directory, typically tens of megabytes, well under one hundred, with two files inside it, adapter underscore model dot safetensors, and adapter underscore config dot json. From there, you have three options. You could merge it directly into the base model weights, using mlx underscore lm dot fuse or peft merge, and that gives you one single portable file. Or you could load it hot, straight into Ollama with ollama create, or into vLLM with the dash dash lora-modules flag, and that keeps the base model shared in memory, and only swaps the small adapter per request. Or, and this is where the course connects forward, you could package it as a ModelKit artifact, with the base model reference and the adapter bundled together, and that's exactly what you'll do in Module 4, where a single modelkit push ships both at once.

So the full pipeline, end to end, looks like this. Fine-tune, produces an adapter. Adapter, gets served, either hot-swapped or merged. Then it gets packaged. Then it ships. In the next video, we'll bring this whole module together before you head into the lab.

### Suggested visuals / slide beats

1. Slide 15, "The frozen container is the experiment": a bare script whose dependencies drift, frozen into a pinned image plus YAML, with config in git and the tag in GHCR.
2. Slide 17, "What you produce: a tiny adapter": two files, adapter_model.safetensors and adapter_config.json, under 100 MB, and three destinations, merge, hot-load and package.
3. Slide 18, "The pipeline, end to end": fine-tune, adapter, serve, package, ship.

---

## Video 6: Module 3B Summary and Lab Bridge

**Format:** Slides + voiceover
**Estimated duration:** 2 minutes
**Learning objective:** By the end, learners can recap the module's decision points and know exactly which lab track to start.

### Narration script

Let's bring this together. You now know the three-question test for deciding between prompting, RAG, and fine-tuning, and you know that fine-tuning is for a behavior gap, never a knowledge gap. You've seen how LoRA freezes the base model and trains two small matrices instead, like sticky notes on a textbook, and how QLoRA adds 4-bit quantization on top of that, so a 7 billion or 13 billion parameter model fits on a single consumer GPU. You know the three toolchains, Axolotl and Unsloth in containers on NVIDIA, MLX-LM natively on Apple Silicon, and why that split exists, because there is simply no path from a Mac container to the Metal GPU. And you know that once you have an adapter, the image you trained it inside is the thing worth tagging and pushing, not the script.

Now it's your turn to run one yourself. In the lab, you have two tracks. If you're on Apple Silicon, you'll run Track A, an MLX-LM native fine-tune, right there on your own Mac. If you have access to an NVIDIA GPU, you'll follow Track B instead, a containerized QLoRA run with Axolotl. Two different paths, but they lead to the exact same destination, a working LoRA adapter that you trained yourself, and that you could hand off to Module 4 to package and ship. Let's go get your hands dirty.

### Suggested visuals / slide beats

1. Slide 18, the pipeline, as the recap: fine-tune, adapter, serve, package, ship.
2. Slide 19, "Two tracks, one destination": Track A (MLX-LM, Apple Silicon) and Track B (Axolotl, NVIDIA), both ending in a working LoRA adapter.
3. Closing line on screen: "→ Lab: Fine-tune Your First Adapter".

---

## Coverage map

| Source idea | Video | Treatment |
|-------------|-------|-----------|
| When to fine-tune vs prompt vs RAG (§1) | Video 2 | Explained |
| Four cases where fine-tuning wins (§1) | Video 2 | Explained |
| Fine-tuning does NOT fix a knowledge or inference gap (§1) | Video 2 | Explained (slide 6) |
| LoRA mechanism + sticky-notes analogy (§2) | Video 3 | Explained |
| QLoRA 4-bit quantization (§2) | Video 3 | Explained |
| Adapter size (1–3% of base) (§2) | Video 3 | Explained |
| Axolotl (§3) | Video 4 | Explained |
| Unsloth (§3) | Video 4 | Explained |
| MLX-LM (§3) | Video 4 | Explained |
| bitsandbytes/CUDA don't exist on macOS (§4) | Video 4 | Explained |
| Containerized QLoRA won't accelerate on Mac (§4) | Video 4 | Explained |
| NVIDIA container path with --gpus all (§4) | Video 4 | Explained |
| Reproducibility — image tag as experiment record (§5) | Video 5 | Explained |
| Adapter contents (safetensors + config json) (§6) | Video 5 | Explained |
| Merge / hot-load / package options (§6) | Video 5 | Explained |
| Pipeline: fine-tune → adapter → serve → package → ship (§6) | Video 5 | Explained |
| Summary table (all rows) | Video 6 | Recapped (narration-only, no summary slide) |
| Module objectives (slide 2) | Video 1 | Explained |
| Track A / Track B lab bridge | Video 6 | Explained |

## Verification flags

- Adapter size is stated as under 100 MB (lab: typically 20 to 80 MB) in the deck and narration. Lesson section 6 still says 50 to 200 MB, so the lesson needs the same fix. Speed/memory claims for Unsloth ("twice the speed and 60% less VRAM") are cited from the lesson as-is — these are version-dependent and should be reverified against current Unsloth benchmarks before publishing.
- "16–32 GB of RAM" for 3B/7B MLX-LM fine-tuning is hardware-dependent and worth reconfirming against the current MLX-LM docs.
