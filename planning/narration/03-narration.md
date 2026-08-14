# Module 3: Production Serving with vLLM — Video Narration Package

## Recommended video structure

| # | Video title | Format | Estimated duration | Central idea |
|---|---|---|---|---|
| 1 | Why Production Model Serving Needs a Different Engine | Talking head | 2 min | Why vLLM matters now, bridging from M1/M2 |
| 2 | vLLM vs Simple Servers — Continuous Batching and PagedAttention Explained | Slides + voiceover | 6 min | The two ideas behind 3x throughput |
| 3 | Same /v1 Contract, Bigger Engine — Swapping Ollama for vLLM | Slides + voiceover | 4 min | Contract portability, one-line engine swap |
| 4 | The CPU Track — Why Containers Report Zero NUMA Nodes | Slides + voiceover | 6 min | The NUMA crash and its one-line patch, CPU tuning |
| 5 | The GPU Track and Quantization — AWQ, GPTQ, FP8 | Slides + voiceover | 5 min | GPU throughput payoff, quantization formats |
| 6 | Summary and Lab Bridge | Slides + voiceover | 2 min | Recap, operational gotchas, lab handoff |

---

## Video 1: Why Production Model Serving Needs a Different Engine

**Format:** Talking head
**Estimated duration:** 2 minutes
**Learning objective:** By the end, learners can explain why a production model server behaves differently from Ollama, and what this module will teach them.

### Narration script

Let's say you built a small chatbot in Module One, and you tested it with Ollama, and it worked fine. One question, one answer, no problem at all. Now imagine that same chatbot goes live, and fifty people ask questions at the same time. Well, that is where everything changes.

Ollama is built like a home espresso machine. It pulls one shot at a time, and if you ask for a second shot while the first one is still brewing, you wait your turn. That is completely fine for one developer working alone at a laptop. But it does not work for a live product carrying real traffic.

In this module, we move from that home machine to the big commercial machine behind the counter at a busy café, which is vLLM. You will learn why it can serve far more requests per hour on the same hardware, through two ideas called continuous batching and PagedAttention. You will also see that this bigger engine sits behind the exact same OpenAI-compatible /v1 contract you already used in Module Two, so your client code does not even notice the change underneath it.

By the end of this module, you will understand why vLLM is the production workhorse for serving models, and you will run it yourself, on CPU, right here on your own laptop, to see the machinery at work.

### Suggested visuals / slide beats

1. Title slide — module name, "café vs home espresso machine" motif.
2. Split scene: one espresso machine with one queue vs a busy café counter with several heads running.
3. Closing line on screen: "Same /v1 contract. A different engine underneath."

---

## Video 2: vLLM vs Simple Servers — Continuous Batching and PagedAttention Explained

**Format:** Slides + voiceover
**Estimated duration:** 6 minutes
**Learning objective:** By the end, learners can explain continuous batching and PagedAttention, and why together they give roughly 3x throughput.

### Narration script

Well, let's start with the problem that older model servers had, and it is easier to see with a picture than with an equation.

Let's say a server groups requests into one batch, waits for absolutely everyone in that group to finish, and only then picks up the next group. Now, one person in that group is always going to be slower than the rest — maybe their answer is just longer — and everyone else has to sit and wait for them, even though their own answer was ready minutes ago. Under light traffic you would barely notice. Under real, heavy traffic, all that waiting turns into wasted machine time, and it adds up fast.

vLLM's answer to this is continuous batching, and the trick is to stop thinking in batches at all. Instead, vLLM would look at every single token, one at a time, across every conversation it's handling. So, the very instant one conversation finishes and steps away, whichever request has been waiting longest simply steps into that freed-up spot, mid-stride, without anyone announcing a new batch. Picture that busy café counter again — a barista never lets a group head sit there doing nothing. The second one cup is poured, the next order goes straight in.

Now, that scheduling trick on its own would not get you very far, because it still needs somewhere to actually put all this extra work in memory. And that's the second half of the story: PagedAttention.

Every single conversation running through the model keeps what's called a KV cache — key-value cache — and think of it as the model's short-term memory for that one conversation, growing token by token as the reply gets longer. Now, older serving engines had a rather wasteful habit: for every request, they would grab one continuous chunk of memory, sized for the absolute longest reply the model could ever produce, whether the reply actually needed that much space or not. Let's say the real answer only needed twenty tokens' worth of memory, but the engine had already blocked out room for over two thousand. Almost all of that reserved space just sits there, empty. Now multiply that waste across every single user hitting your server at once, and you can see why so much GPU memory ends up locked away doing nothing.

PagedAttention borrows a much older idea — the same paging trick your laptop's operating system already uses for RAM — and applies it here instead. Your OS never insists on one giant, continuous slab of memory for a program; it hands out small fixed-size chunks and places them anywhere there's room, then keeps a lookup table so it always knows which chunk belongs to which program. vLLM does exactly this for the KV cache: small pages, handed out only as they're actually needed, tracked through a lookup table instead of pre-reserved in one giant block.

And here's the payoff, in one number: this cuts memory waste from something like sixty to eighty percent, all the way down to under four percent. Suddenly a lot more conversations fit into the same amount of memory at the same time — which is exactly the fuel that continuous batching needs to keep every single slot busy.

And that's really the whole three-times story in two sentences. Continuous batching refuses to let a slot sit idle. PagedAttention makes sure enough requests can physically fit in memory for that to even be possible in the first place. Neither one works nearly as well without the other.

### Suggested visuals / slide beats

1. Batch-serving diagram: fixed batch, one slow request holding up idle slots.
2. Continuous batching diagram: token-level scheduling, a finished slot refilled mid-flight.
3. Reserved-block-vs-paged-memory diagram (mirrors the deck's Mermaid NAIVE/PAGED comparison).
4. On-screen stat: "~60-80% waste → under 4% waste."
5. Closing takeaway card: "Continuous batching + PagedAttention ≈ 3x throughput."

---

## Video 3: Same /v1 Contract, Bigger Engine — Swapping Ollama for vLLM

**Format:** Slides + voiceover
**Estimated duration:** 4 minutes
**Learning objective:** By the end, learners can explain why moving from Ollama to vLLM requires no client code changes.

### Narration script

Now here's a question worth asking. If vLLM is such a different engine underneath, does your client code need to change to use it?

Well, the answer is no, and that is the real payoff of the shared-contract idea from Module Two. vLLM exposes the exact same OpenAI-compatible /v1 API that Ollama does. Same GET /v1/models endpoint, same POST /v1/chat/completions endpoint, and the same response shape, where the answer comes back inside choices zero message content.

So swapping Ollama for vLLM is a one-line change. You would just point your OPENAI_BASE_URL environment variable at the new address, and that's it. No code changes, no SDK changes, no changes to your container image.

Let's say you think of this the same way we talked about a wall socket back in Module Two. Your client speaks to the socket, which is the /v1 contract. Which power station sits behind that socket, whether it is Ollama on your dev laptop or vLLM in production, is a deployment decision. It is not a code decision.

Let's walk through what actually happens when you make that swap. Right now, your client sends a request to your local Ollama address, and Ollama answers it. After the swap, that same client would send the exact same JSON body, with the exact same fields, to your vLLM address instead, and vLLM answers it. The request format does not change. The response format does not change. Only the address changes.

This also means the two servers can sit side by side while you are developing. You could run Ollama on your laptop for quick iteration, and later point the same client at vLLM once you are ready for something closer to production load. And going forward in this module, we will look at two ways to run vLLM itself: a CPU track, which is what you will actually run yourself, and a GPU track, which we will only look at as documentation, because Apple Silicon does not expose a virtual GPU to containers.

### Suggested visuals / slide beats

1. Wall-socket callback diagram: client → /v1 contract → Ollama or vLLM (mirrors the deck's Mermaid).
2. Side-by-side request diagram: same JSON body, two different addresses.
3. Bridge card: "Next: the CPU track you'll actually run."

---

## Video 4: The CPU Track — Why Containers Report Zero NUMA Nodes

**Format:** Slides + voiceover
**Estimated duration:** 6 minutes
**Learning objective:** By the end, learners can explain why the containerized CPU vLLM image crashes without a patch, and how to tune it for a laptop.

### Narration script

Let's talk about the track you will actually run with your own hands in the lab, and, well, it comes with a genuine bug baked in — one you need to understand, not just paste over.

You already know, from Setup and from Module One, that Apple Silicon does not give containers a real GPU to work with. So the moment you put vLLM inside a container on this Mac, it has no choice but to fall back to the CPU. And honestly, that suits our purpose perfectly, because this particular image exists so you can study the OpenAI-style server, the batcher, and quantization on whatever laptop you happen to own, GPU or not. Speed is not what we are chasing here. The engine underneath is identical to the one that would give you three times the throughput on a GPU — you are simply watching it move at walking pace instead of running.

The picture we would use here comes from a project called openeuler, and their vllm-cpu build. It ships as a multi-architecture image, so an arm64 version exists, and it runs natively on your Mac without any translation layer. There is just one catch: straight out of the box, it will not survive being started inside a container, and fixing that turns out to be the one moment in this whole module where you really see what "building your own image" is for.

Here's the actual problem. NUMA stands for Non-Uniform Memory Access, and think of it as a map of which memory sits electrically closer to which group of cores on a real, physical machine — the operating system reads that map so it can keep a program's data next to the cores actually doing the work. Now, a running container never gets to see that map. It behaves a bit like a guest checking into one room of a large hotel — the guest has no idea how the rest of the building is wired, and neither does the container know how the host machine's memory is laid out. So when vLLM's own code asks the kernel how many of these memory regions exist, a container would almost always get back the answer zero.

And that answer of zero turns out to be dangerous, because deep inside vLLM's CPU code, there is a line that divides your total CPU count by that very number, to work out how many threads belong to each region. Divide anything by zero, and Python does not shrug it off — it crashes the whole worker process, right there at startup, before a single request has even been answered.

So the patch is almost comically small. It adds one condition: when that count comes back as zero, just use the full CPU count as-is, instead of dividing by nothing. That one guarded line is the entire fix, and it is a nice reminder of why this course has you build small, purpose-made images rather than just running whatever ships upstream — sometimes the whole gap between "crashes on boot" and "works" really is a single line.

Once the image itself boots cleanly, two settings do almost all of the remaining tuning. First, there's a variable that limits how many parallel compute threads vLLM is allowed to spin up. Point it at only some of your CPU cores — two to four is a reasonable starting number — rather than every core you own, and your laptop stays usable for everything else you're running alongside it, without the fans spinning up and the chip throttling itself down. And specifically on Apple Silicon, aiming for somewhere between half and three-quarters of just your performance cores keeps the job off the slower efficiency cores entirely, which would otherwise drag the whole thing down.

Second, there's a variable that reserves a fixed amount of RAM for the KV cache we talked about earlier in this module. On a laptop, you would want to keep this modest — something around a single gigabyte is plenty to start with — and only push it up if you find yourself actually needing longer conversations or more requests running side by side.

And one small but easy-to-miss habit: make sure the BLAS math library sticks to a single thread too. If both that library and your compute threads are each trying to run in parallel at the same time, they end up competing for the same processor cache, and the result is often slower, not faster, than either one running alone.

### Suggested visuals / slide beats

1. Hotel-room illustration: a guest (container) sees its own room, not the building's (host's) NUMA memory map.
2. Code callout: the one-line `sed` patch, with `numa_size > 0` highlighted.
3. Two-knob diagram, on-screen text: `OMP_NUM_THREADS` (2-4 cores, 50-75% of performance cores on Apple Silicon) and `VLLM_CPU_KVCACHE_SPACE` (~1GB default).
4. Small note card, on-screen text: `OPENBLAS_NUM_THREADS=1`, `MKL_NUM_THREADS=1` — "keep BLAS single-threaded so it doesn't fight OpenMP."

---

## Video 5: The GPU Track and Quantization — AWQ, GPTQ, FP8

**Format:** Slides + voiceover
**Estimated duration:** 5 minutes
**Learning objective:** By the end, learners can describe how vLLM runs on GPU and how quantization trades a little accuracy for a lot less memory.

### Narration script

Now let's look at the other side of this, the GPU track, which we will only look at as documentation in this module, but which is where the real payoff of vLLM shows up.

On an NVIDIA box, the three-times throughput story becomes the whole point. There, you would use the official CUDA image, vllm slash vllm-openai, and you would pass the GPU through to the container using the NVIDIA Container Toolkit, along with a flag called dash-dash-gpus all. Without that toolkit, the container would just fall back to CPU, silently.

There is one more flag worth knowing: dash-dash-ipc equals host. This shares the host's shared memory with the container. vLLM uses shared memory for multi-process attention, and the tiny default size would otherwise cause confusing crashes once you are under real load.

Now, sizing matters here too. At sixteen-bit precision, a seven billion parameter model needs roughly fourteen gigabytes just for the weights, plus more headroom for the KV cache on top of that. So you would either plan for a twenty-four gigabyte card, or you would quantize the model to fit a smaller one.

And that brings us to quantization, which is really the same idea as JPEG compression, something you already met back in Module Two. Quantization compresses the model's weights from sixteen-bit floats down to four-bit or eight-bit integers. You lose a little precision, but the file shrinks a lot, and it loads and runs faster. On a GPU, this is often the difference between a model fitting on the card, or not fitting at all.

There are three formats worth knowing. AWQ is four-bit, and it is activation-aware, which means it pays attention to which weights matter most during inference, and it keeps strong quality even at four bits. GPTQ is also commonly four-bit, though eight-bit and three-bit versions exist too, and it has the advantage of a huge number of pre-quantized checkpoints already available on the Hub, at a slightly higher accuracy cost than AWQ on some models. And FP8, which is an eight-bit float format, works on newer GPUs like Hopper or Ada, and it is close to lossless, but only if your hardware actually supports FP8.

As a rule of thumb, four-bit AWQ roughly cuts your VRAM need down to a quarter of what FP16 would need, for a small cost in accuracy. That is often exactly how a seven billion parameter model ends up fitting on a consumer card with only eight gigabytes. You would just pass in a pre-quantized checkpoint, and vLLM detects the method on its own, automatically.

### Suggested visuals / slide beats

1. GPU launch command on screen: `docker run --gpus all --ipc=host ...`
2. Sizing math card: "7B model, FP16 ≈ 14GB weights + KV cache headroom."
3. Three-format comparison table: AWQ / GPTQ / FP8 — bits, best-for, trade-off.
4. Closing card: "4-bit AWQ ≈ 1/4 the VRAM of FP16."

---

## Video 6: Summary and Lab Bridge

**Format:** Slides + voiceover
**Estimated duration:** 2 minutes
**Learning objective:** By the end, learners can recap the module's core ideas and know exactly what they'll do in the lab.

### Narration script

Let's bring this together, and then look at what is coming next.

You now understand why vLLM outperforms a simple server. Continuous batching keeps every slot working at the token level, and PagedAttention manages memory in small pages, so that enough requests can fit in at once to keep those slots full. You have seen that vLLM sits behind the exact same /v1 contract as Ollama, so swapping engines is a one-line change, not a rewrite. And you have seen the CPU track you are about to run yourself, along with the NUMA patch that makes it survive inside a container.

Before you head into the lab, a few habits worth carrying with you. The dash-dash-max-model-len flag caps your context window, and therefore your per-request KV cache too. Lower it to fit your memory, and only raise it when you genuinely need a longer context. The dash-dash-max-num-seqs flag controls how many sequences the batcher packs in at once. Push it higher for more throughput, but it costs more memory, and the right number depends on what you actually have available. And on CPU specifically, an over-large max-model-len combined with a high max-num-seqs is the usual reason you would see an out-of-memory kill — if that happens, just bring one of the two back down.

One last thing: the first run will be slow. The image itself is several gigabytes, the model downloads on first launch too, and both get cached after that, and CPU inference is simply slow by nature. That is the machine working, not a hang.

In the lab, you will serve SmolLM2 on CPU vLLM yourself, and you will hit the exact same /v1 endpoint that your Module Two client already speaks.

### Suggested visuals / slide beats

1. Recap card: three bullets — continuous batching, PagedAttention, same /v1 contract.
2. Gotchas checklist: max-model-len, max-num-seqs, "first run is slow."
3. Lab bridge card: "Next: serve SmolLM2 on CPU vLLM."

---

## Coverage map

| Source idea | Video | Treatment |
|---|---|---|
| Ollama = home espresso machine, one request at a time | 1 | Explained |
| vLLM = busy café, never idle | 1, 2 | Explained |
| Continuous batching (token-level scheduling) | 2 | Explained |
| PagedAttention (KV cache paging, OS-memory analogy) | 2 | Explained |
| ~60-80% → <4% memory waste stat | 2 | Explained |
| ~3x throughput claim | 1, 2 | Explained |
| Same OpenAI-compatible /v1 contract (models, chat/completions, response shape) | 3 | Explained |
| One-line OPENAI_BASE_URL swap | 3 | Explained |
| Wall-socket analogy callback to M2 | 3 | Explained |
| Apple Silicon has no container GPU passthrough | 1, 4 | Explained |
| `openeuler/vllm-cpu` image, multi-arch/arm64 | 4 | Explained |
| NUMA analogy (building floor plan / furnished apartment) | 4 | Explained |
| NUMA division-by-zero crash + one-line sed patch | 4 | Explained |
| OMP_NUM_THREADS tuning | 4 | Explained |
| VLLM_CPU_KVCACHE_SPACE tuning | 4 | Explained |
| BLAS single-threading (OPENBLAS_NUM_THREADS, MKL_NUM_THREADS) | 4 | Explained |
| GPU track: `vllm/vllm-openai`, NVIDIA Container Toolkit, `--gpus all` | 5 | Explained |
| `--ipc=host` shared memory requirement | 5 | Explained |
| VRAM sizing math (7B @ FP16 ≈ 14GB) | 5 | Explained |
| Quantization = JPEG-compression analogy (callback to M2) | 5 | Explained |
| AWQ / GPTQ / FP8 comparison table | 5 | Explained |
| 4-bit AWQ ≈ 1/4 VRAM rule of thumb | 5 | Explained |
| `--max-model-len` / `--max-num-seqs` operational gotchas | 6 | Explained |
| OOM-kill cause on CPU | 6 | Explained |
| First-run slowness (image + model download, caching) | 6 | Explained |
| Lab bridge: serve SmolLM2 on CPU vLLM | 6 | Explained |

No source section was dropped. The CPU-vs-GPU comparison table (lesson §4) is split across Videos 4 and 5 rather than narrated as a table read-aloud — each column becomes its own explained track, per the "don't narrate every character of a table" rule.

## Verification flags

- The "roughly three times the throughput" figure and the "~60-80% → <4%" memory-waste figures are stated in the source lesson as given facts; narration preserves them as-is without independent verification. Flag if vLLM's own benchmarks are later revised.
- "openeuler/vllm-cpu:0.9.1-oe2403lts" and the exact NUMA patch line are version-specific; if the course's tested image tag changes, the narration's description of the bug and patch should be re-checked against the new version's source.
- GPU sizing numbers (7B @ FP16 ≈ 14GB, 4-bit AWQ ≈ 1/4 VRAM) are rules of thumb from the source lesson, not independently re-derived here — flag if model architectures with different KV-cache overhead ratios are added to the course later.
