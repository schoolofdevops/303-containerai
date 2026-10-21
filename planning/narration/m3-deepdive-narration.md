# Module 3 Deep Dive: vLLM Internals Under the Hood

## Recommended video structure

| # | Video title | Format | Estimated duration | Central idea |
|---|-------------|--------|--------------------|--------------|
| 1 | vLLM Deep Dive: What's Actually Under the Hood | Talking head | 2 min | Why the lab's four flags deserve a real explanation |
| 2 | PagedAttention — The KV Cache as Paged Memory | Slides + voiceover | 5 min | Blocks + block table replace one giant contiguous reservation |
| 3 | Continuous Batching — Why Requests Join and Leave Mid-Flight | Slides + voiceover | 5 min | Scheduling per step, not per batch, is what keeps slots busy |
| 4 | What Your vLLM Flags Actually Bought You | Slides + voiceover | 6 min | dtype, swap-space, max-model-len, max-num-seqs all feed one memory inequality |
| 5 | Reading /metrics — Which Lever to Pull | Slides + voiceover | 5 min | The three gauges tell you whether to raise concurrency or raise cache budget |
| 6 | When vLLM-Class Serving Matters — and When It's Overkill | Slides + voiceover | 4 min | Paging and batching only pay off under concurrent, competing requests |
| 7 | The Experiment — vLLM-CPU vs Native Ollama, Same Prompts | Slides + voiceover | 6 min | Ollama wins on raw speed here; vLLM wins on how it scales |
| 8 | Summary and Lab Bridge | Slides + voiceover | 2 min | What you now know, and what the experiment proves you can measure |

---

## Video 1: vLLM Deep Dive: What's Actually Under the Hood

**Format:** Talking head
**Estimated duration:** 2 minutes
**Learning objective:** By the end, learners understand why this deep dive exists and what they'll be able to explain by the time it's done.

### Narration script

In the last lab, you built a patched CPU image of vLLM, served a small model behind an OpenAI-compatible endpoint, and pointed your client at it with a two-variable swap. It worked. The contract held.

But you also typed four flags into that compose file without really knowing why they were set the way they were — `dtype`, `swap-space`, `max-model-len`, `max-num-seqs`. And the lesson told you vLLM pages its KV cache and batches requests continuously, without opening up what a page actually is, or what "continuous" really changes underneath.

That's what this deep dive is for. We're going to open the machinery. You'll see what PagedAttention is actually paging, why continuous batching changes throughput and not just latency, and exactly what each of those four flags is buying you against that machinery — because two of the four don't do what you'd assume from their names, and we'll prove that from the running server itself, not from the docs.

We'll close with a small experiment: your vLLM container against native Ollama, same prompts, sequential and concurrent. It won't be a benchmark. It'll be honest, and it'll show you the pattern of the difference this machinery makes, even on a laptop with a small model.

By the end, you'll be able to read a vLLM deployment's flags and know exactly what memory inequality they're solving — and you'll know when reaching for vLLM is the right call, and when it's more machinery than the job needs.

### Suggested visuals / slide beats

1. Slide 1, "The swap that made this worth doing": the lab's two-variable swap, with four labels as the preview, paged memory, continuous batching, the lab's flags, and why the swap paid off.

---

## Video 2: PagedAttention — The KV Cache as Paged Memory

**Format:** Slides + voiceover
**Estimated duration:** 5 minutes
**Learning objective:** By the end, learners can explain what a KV cache block is, what a block table does, and why paging removes the contiguity requirement that wastes memory.

### Narration script

Here's a question worth sitting with for a second. If a server reserves memory for the longest answer a model could possibly generate, but the actual answer is short, where does that unused memory go?

On a naive server, it just sits there. Reserved. Empty. Unavailable to anyone else, for as long as that one request is alive.

Let's use a hotel to think about this. A naive server runs the hotel by booking a guest onto a whole floor, sized for the longest possible stay anyone could ever have — even if that guest checks out after one night. That floor stays reserved and empty for everyone else on the waiting list, because the hotel already promised it away.

PagedAttention runs the hotel the way a busy one actually works. A guest gets one room at a time, checked in only as they need it. A front desk — that's the block table — keeps track of which guest is in which room. A short stay uses one room and frees it the moment they check out. A long stay just gets handed the next free room whenever it needs more space. Nobody is ever handed a whole floor up front, so nobody's unused rooms sit locked away from everyone else.

Now let's connect that back to the actual mechanism. vLLM divides its KV cache into fixed-size blocks — each block holds the key and value vectors for a fixed number of tokens, sixteen is common. As a sequence generates tokens, it's handed blocks on demand, not a contiguous span sized for the maximum context length up front. A block table, one per sequence, maps each token position to a physical block location — this is exactly the same idea as a page table mapping virtual memory to physical memory frames in an operating system, which is where the name PagedAttention actually comes from.

Here's why the naive, contiguous approach is so wasteful. Say a server reserves one thousand and twenty-four tokens' worth of contiguous KV cache for every request, because that's the maximum context length it supports. A twenty-token answer inside that reservation leaves roughly ninety-eight percent of it sitting unused — and because that block has to be contiguous, you can hit a strange kind of waste where forty percent of your total cache is technically free, but no single request can use it, because no single free span is large enough. Paging removes the contiguity requirement completely. Free blocks can sit anywhere in memory and still get handed out the moment a sequence needs one.

So when you hear "PagedAttention pages the KV cache," this is what that sentence is doing under the hood: fixed-size blocks, a block table per sequence, and a free pool that any waiting sequence can draw from immediately — the same discipline an operating system uses for virtual memory, applied to GPU or CPU cache instead of RAM.

### Suggested visuals / slide beats

1. Slide 3, "A naive server books the whole floor for a maybe": one guest, an entire floor reserved.
2. Slide 4, "PagedAttention runs the hotel by the room, not the floor": a front desk with a block table, rooms handed out one at a time.
3. Slide 5, "Block tables map logical tokens to scattered physical blocks": requests A and B mapped to scattered blocks, 16 tokens each, one free.
4. Slide 6, "98% reserved, unused, and still unavailable": a 1024-token reservation behind a 20-token answer.
5. Slide 7, "40% free in aggregate, but no single gap big enough": contiguity, not total free memory, is what runs out.

---

## Video 3: Continuous Batching — Why Requests Join and Leave Mid-Flight

**Format:** Slides + voiceover
**Estimated duration:** 5 minutes
**Learning objective:** By the end, learners can explain the difference between static and continuous batching, and why the throughput and tail-latency effects go in different directions.

### Narration script

Imagine a small restaurant that seats guests in fixed groups — say, ten people arrive together, and the rule is, nobody new gets a table until all ten of that group have paid and left. If one guest in that group is slow and lingers for an hour, the other nine empty chairs just sit there, unused, and a hungry customer standing at the door keeps waiting, even though nine seats are free right now. That's a static-batch server. It treats a set of requests as one fixed group, and the whole group has to close out together before the next group can start.

Now picture the same restaurant run differently: the second any single guest pays and gets up, that chair is wiped down and the next person in line sits down immediately — no group, no waiting for nine other people to finish. That's much closer to how vLLM actually runs its scheduler. A finished slot opens up on its own, and whoever's waiting gets pulled in right away.

Here's the mechanism behind that. vLLM's scheduler doesn't think in terms of a batch that starts together and ends together. It checks, on every single generation step, which sequences just produced their stop token. The moment one does, its slot and its cache blocks are freed right there, in that same step — and a new waiting request can be pulled in immediately, provided there's cache room for it. Nothing has to wait for some larger group to wrap up, because there is no larger group in the first place. The most a new request ever waits is a single step of the loop.

This changes throughput in a very specific way. A static batch is only as fast as its slowest member, because every finished slot in that batch just sits idle until the whole group is done — you're paying for empty seats the entire time. When a server refills a slot the instant it opens, none of that idle time exists. Every slot is doing real work almost continuously.

It also changes something you'd feel even more directly if you were the one waiting: how long a short answer takes to come back. Say your prompt only needs one token in reply, but it happened to get grouped with nine much longer generations. Under the fixed-group rule, your one-token answer sits finished and unreturned until all nine of the others are also done. Under the seat-reopens-immediately rule, your answer comes back the moment it's ready — the other nine finishing has nothing to do with when you get served.

And there's a dependency worth naming between this and the last video. Being able to refill a slot instantly only works if handing a new request its memory is cheap. If the server had to lay out one long contiguous block of memory every time it admitted someone, that admission would be slow enough that doing it every single step wouldn't be practical. Paging is what keeps that admission cheap — which is really the only reason this per-step scheduling is affordable to run continuously in the first place.

### Suggested visuals / slide beats

1. Slide 9, "A static-batch table waits for the slowest guest to leave": three tables finished, one lingering, the front door closed.
2. Slide 10, "vLLM reseats the moment a table clears": a cleared table, a new party seated, the door open.
3. Slide 11, "The scheduler checks every slot, every single step": one iteration, a stop token frees a slot and a waiting sequence is admitted.
4. Slide 12, "Continuous batching helps throughput; static batching hurts short jobs twice": a one-token job stuck behind a 500-token job, against a job that returns the instant it is done.
5. Slide 13, "Paging is what makes admitting a request every step affordable": paged memory makes admission cheap, so continuous batching can admit every step.

---

## Video 4: What Your vLLM Flags Actually Bought You

**Format:** Slides + voiceover
**Estimated duration:** 6 minutes
**Learning objective:** By the end, learners can explain what each of the lab's four flags controls, and can state — from the running container's own evidence — that swap-space does not add capacity on this CPU backend.

### Narration script

The lab's compose file set four flags without dwelling on why. Now that you understand paging and continuous batching, each one maps directly onto that story, and one of them is not what its name suggests.

Start with `dtype float32`. The lab used float32 because bf16 simply has no CPU compute kernel on this arm64 path. That is the crash you may have hit in the lab's troubleshooting section. There is a memory cost too. A float32 KV cache entry is twice the size of a bf16 one, for the exact same number of tokens. So the same cache-space budget holds half as many blocks on this CPU path as it would on a GPU running bf16. That is one reason the lab keeps max-model-len and max-num-seqs small.

Next, `max-model-len`. This is a direct cache budget line, not just a context-window limit for the user. Every block a sequence could need, at the worst case of max-model-len times max-num-seqs, has to fit inside the cache-space setting alone. The lab's default of one thousand and twenty-four tokens was chosen by working that arithmetic backward from the container's five gigabyte cap, not picked for a nicer context window. That default is the max-model-len value, not the cache setting. The cache setting is one gibibyte.

Then `max-num-seqs`. This is the continuous-batching concurrency cap from the last video, made concrete. It is the maximum number of sequences the scheduler admits into the running batch at once. Raise it, and more requests share the never-idle benefit. But every admitted sequence still needs its own blocks. So raising max-num-seqs without more cache budget just moves the queue from the batch slot to cache space.

Now, `swap-space`. On a GPU deployment, swap-space is host RAM used as an overflow tier. When the GPU's KV cache blocks run out, a sequence's blocks can be swapped out to RAM and back, instead of the request being rejected. On this CPU build, that overflow tier does not exist. This is not a guess. It is verified against the image's own source code. The CPU worker computes its block count from the cache-space setting alone, and then sets the number of swappable CPU blocks to zero. We confirmed it live on the running container's metrics too. With swap-space set to one, the engine reported zero CPU blocks. The flag is still accepted and still shows up in the config. But on this backend it is dead weight. The CPU worker reuses the GPU worker's scheduler code, and that code expects the flag to exist. The lab pins it to one gibibyte because the default of four trips a Too large swap space error against the five gigabyte cap.

The engine's own startup log did the arithmetic for us. With one gibibyte of cache space, it reported fourteen hundred and fifty-six blocks of sixteen tokens each. From that, the log printed a maximum concurrency of twenty-two point seven five for one thousand and twenty-four token requests. In plain words, about twenty-two maximum-length sequences fit before the cache is full.

So the real picture is three flags feeding one shared memory budget, and one flag, swap-space, that is accepted and validated at startup but contributes nothing on this backend. If you size a CPU or memory-constrained deployment, that is the arithmetic to work through. Do not assume swap-space buys you headroom the way it would on a GPU.

### Suggested visuals / slide beats

1. Slide 14, "Two flags spend the same memory two different ways": dtype, and max-model-len times max-num-seqs, feeding the one KV cache budget box, with the 1024 default and the "queue just moves to cache space" notes.
2. Slide 15, "--swap-space is accepted, validated, and does nothing here": a GPU panel with a real overflow tier, against this CPU build with zero blocks, the live metrics line and the 4 GiB startup error.
3. Slide 16, "The engine log already did the arithmetic for you": one gibibyte, 1456 blocks of 16 tokens, and "Maximum concurrency for 1024 tokens: 22.75x".

---

## Video 5: Reading /metrics — Which Lever to Pull

**Format:** Slides + voiceover
**Estimated duration:** 5 minutes
**Learning objective:** By the end, learners can read vLLM's three key Prometheus gauges and decide, from those readings alone, whether to raise concurrency or raise cache budget.

### Narration script

vLLM exposes a Prometheus-style metrics endpoint, and this is the layer the lab didn't need — one request at a time doesn't require watching gauges — but it matters the moment more than one request is in flight.

Three gauges matter most. The first is the number of requests currently running — sequences occupying a batch slot this exact iteration. Watch this during a burst of concurrent requests, and it should track admissions and completions in near real time, not jump in fixed-size chunks the way a static-batch server would.

The second is the number of requests waiting — sequences that have arrived but haven't been admitted yet, because either the concurrency cap or the cache budget is currently full. If this queue never drains under sustained load, that's your signal to raise max-num-seqs or the cache budget from the last video — not to blindly add more replicas.

The third gauge is named for its GPU heritage — it's called the GPU cache usage percentage — but on this CPU build it reflects the CPU KV cache pool instead, and we can confirm that directly: the same metrics endpoint's cache_config_info reports those blocks as coming from host RAM, not a GPU. This gauge tells you how full the paged block pool is. Near one hundred percent under load is expected and healthy — that's PagedAttention doing its job, using nearly all of the reserved memory instead of leaving it half-empty. Sitting near zero percent under real traffic usually means your budget is oversized for the load you're actually serving.

Here's the part that makes these three gauges genuinely useful together, not just informative on their own: reading them side by side tells you which lever from the last video to pull. Waiting-queue pressure combined with low cache usage means raise max-num-seqs — you have memory room, you just need a higher concurrency cap. Waiting-queue pressure combined with cache usage already pinned at a hundred percent means raise the cache-space budget itself, or lower max-model-len per sequence — and we already know from the last video that reaching for swap-space here won't help, because it contributes zero blocks on this backend. Same symptom on the surface — a growing queue — but two different root causes, and the gauges are what tell them apart.

One caution worth carrying forward: these are instant snapshots of scheduler state, not running counters. A single reading of zero only means nothing was in flight at that exact instant — it doesn't mean nothing happened. If you're debugging a real deployment, sample repeatedly during load, not once.

### Suggested visuals / slide beats

1. Slide 17, "Three gauges tell you which lever to pull": three dials, num_requests_running, num_requests_waiting and gpu_cache_usage_perc, with a note that the last one is a CPU pool despite its GPU name.
2. Slide 17, lower half: two diagnosis arrows. Waiting up with cache low means raise MAX_NUM_SEQS. Waiting up with cache near 100 percent means raise the KV cache budget.
3. Slide 17, left caption: "snapshots, not counters, idle 0.0 means nothing in flight".

---

## Video 6: When vLLM-Class Serving Matters — and When It's Overkill

**Format:** Slides + voiceover
**Estimated duration:** 4 minutes
**Learning objective:** By the end, learners can decide, for a given deployment, whether vLLM-class serving is worth its engineering cost.

### Narration script

Everything we've covered so far — paging, continuous batching, the flags, the gauges — exists to solve one specific problem: requests that overlap in time and compete for the same memory.

Think about a single developer sending one prompt, waiting for the answer, then sending the next. There's never more than one sequence alive at once. Nothing to page around. Nothing to batch continuously, because there's nothing to overlap with. In that situation, all of this machinery has no competition to resolve — it's solving a problem that isn't actually happening.

That's exactly why a server like Ollama, the one you used back in modules one and two, is a completely reasonable production choice for a single-user tool or a low-concurrency internal script. vLLM's machinery has a real engineering cost — extra memory bookkeeping, extra scheduler complexity — and that cost only pays for itself once you have enough simultaneous requests that idle slots and wasted contiguous memory actually start to bite.

So the question to ask, before reaching for vLLM, is simple: do my requests actually overlap in time? If you're fielding concurrent requests from more than a handful of callers at once, vLLM-class serving is built exactly for that regime, and the whole mechanism we've walked through starts paying for itself. If you're not — if it's one user, one request at a time — the simpler server is the right call, not the more advanced one.

### Suggested visuals / slide beats

1. Slide 18, "One developer at a time never creates the problem this machinery solves": one developer with one request, so an Ollama-class server is enough, against many concurrent users, where vLLM-class serving pays off.

---

## Video 7: The Experiment — vLLM-CPU vs Native Ollama, Same Prompts

**Format:** Slides + voiceover
**Estimated duration:** 6 minutes
**Learning objective:** By the end, learners can distinguish absolute throughput from scaling behavior, and explain why vLLM can lose on one and still win on the other.

### Narration script

This is not a benchmark. At CPU scale, with small models and no more than eight requests, the numbers are noisy and belong to one laptop. What is worth learning is the pattern. Do requests fired one after another behave differently from requests fired together? And does that differ between the two servers?

Here is the setup. On one side, vLLM-CPU serving SmolLM2, with one hundred and thirty-five million parameters. On the other, native Ollama serving qwen3.5 two B, about three point one gigabytes, with thinking turned off. Ollama's model has about fifteen times more parameters. Each server gets the same four prompts, one after another. Then three prompts at once. And then, to keep the comparison fair, the same three prompts one after another.

First, the four prompts in a row. vLLM-CPU took about eighteen seconds, around eight tokens per second. Ollama took about seven seconds, around sixteen tokens per second. Ollama's first request also paid a warm-up of nearly five seconds. So Ollama wins on raw speed here. A mature, optimized single-stream runtime beating an eager-mode, float32, CPU vLLM path is not a surprise at this scale.

Now the scaling. For vLLM-CPU, the three prompts one after another took about twenty-one seconds. Fired at once, they took about six seconds. That is about three point four times faster. vLLM batches the three requests, so the wall-clock barely grows. This is what continuous batching should do. The work overlaps instead of queuing.

For Ollama, the same three prompts took just under two seconds one after another. Together they took about one and two thirds of a second. That is about one point one seven times, only slightly faster. It is close to linear, as if requests were still handled one at a time.

One caution. The exact ratio moved with host load and generation length between runs. Read the direction of the effect, not the digit.

So here is the honest headline. Ollama is faster in absolute tokens per second here. But the pattern is what the theory predicts. vLLM's concurrent run scales about three and a half times better than its own sequential baseline. Ollama's barely scales at all. The mechanism is doing its job, even though it does not win the absolute scoreboard on a laptop. The three-times GPU story from the lesson is real. It needs GPU-scale concurrent load and a production-sized model to show up in the absolute numbers too.

### Suggested visuals / slide beats

1. Slide 19, "Matched test: one workload, two servers": vLLM-CPU with SmolLM2-135M, Ollama with qwen3.5:2b and thinking off, and three runs, four prompts in a row, three at once, and the same three in a row as the matched baseline.
2. Slide 20, left panel: absolute speed bars, about 7.9 tokens per second for vLLM-CPU against about 15.9 for Ollama.
3. Slide 20, right panel: the scaling arrows, 3.42x for vLLM-CPU against 1.17x for Ollama.

---

## Video 8: Summary and Lab Bridge

**Format:** Slides + voiceover
**Estimated duration:** 2 minutes
**Learning objective:** By the end, learners can state what they now understand about vLLM's internals and know exactly what to run to reproduce the experiment themselves.

### Narration script

Let's bring this together. Five things to carry with you.

First, size the KV cache budget as blocks per sequence times concurrent sequences, not as how long your prompt is. A KV cache block is a fixed-size piece of memory, and paging it, instead of reserving one long span per request, is what lets far more sequences share the same memory.

Second, continuous batching schedules at the level of a single step, not a whole batch. A short request never queues behind long ones, and every slot stays busy.

Third, read the metrics gauges first. A waiting queue with a full cache means more memory, not a higher concurrency cap.

Fourth, swap-space is a no-op on this CPU backend. You saw that confirmed from the container's own source and its own metrics, not just from documentation. Do not assume GPU-style headroom.

And fifth, ask whether your requests overlap in time before you reach for vLLM. If they do not, an Ollama-class server is the right call.

The lab page has the exact commands to reproduce the experiment yourself, sequential and concurrent, against both servers, on your own machine. Run it, watch the wall-clock numbers land, and you will see the same pattern we just walked through. Not necessarily faster in absolute terms on a small model, but real overlap under concurrent load, which is PagedAttention and continuous batching doing what they are built to do.

### Suggested visuals / slide beats

1. Slide 20 is the scoreboard from Video 7. Slide 21, "What to carry into a real deployment": five numbered takeaways, KV budget sizing, continuous batching, the metrics gauges, swap-space, and the overlap question.
2. Terminal card: the exact commands from the lab page, ready to copy.
3. Closing card: "Same pattern, your machine. Go measure it yourself."

---

## Coverage map

| Source idea | Video | Treatment |
|-------------|-------|-----------|
| Lab recap: patched image, served model, two-variable client swap | 1 | Explained |
| PagedAttention: fixed-size blocks, block table, hotel analogy | 2 | Explained |
| Why contiguous reservation wastes memory (98% example, fragmentation) | 2 | Explained |
| Block table = OS page table analogy | 2 | Explained |
| Continuous batching: restaurant analogy | 3 | Explained |
| Scheduler loop: per-step admission/eviction | 3 | Explained |
| Throughput effect (idle slots) vs tail-latency effect (queued short requests) | 3 | Explained |
| Paging enables cheap admission, which enables continuous batching | 3 | Explained |
| `--dtype float32`: no bf16 CPU kernel, 2x KV bytes/token | 4 | Explained |
| Engine log: 1456 blocks, maximum concurrency 22.75x | 4 | Explained |
| MAX_NUM_SEQS without more KV budget just moves the queue; swap-space pinned to 1 (default 4 GiB errors) | 4 | Explained |
| `--swap-space`: zero blocks on CPU backend, verified from source + /metrics | 4 | Explained |
| `--max-model-len`: direct cache budget line, arithmetic worked backward | 4 | Explained |
| `--max-num-seqs`: continuous-batching concurrency cap | 4 | Explained |
| `/metrics` endpoint: num_requests_running, num_requests_waiting, gpu_cache_usage_perc | 5 | Explained |
| Reading the three gauges together to decide which lever to pull | 5 | Explained |
| Gauges are instant snapshots, not counters | 5 | Explained (as a caution) |
| When vLLM-class serving matters vs single-user Ollama-class | 6 | Explained |
| Experiment setup: prompt set, matched baseline, both models named, thinking off | 7 | Explained (slide 19) |
| Machine budget (Ollama and the 5 GB vLLM container coexist) and Teardown | — | Page-only, not narrated |
| Sequential results: vLLM-CPU vs Ollama wall time | 7 | Explained |
| Concurrent results + matched-set sequential baseline + scaling factor | 7 | Explained |
| Honest headline: Ollama wins absolute, vLLM wins on scaling | 7 | Explained |
| Results file / comparison-results.txt content | 7 | Deferred — belongs in the lab itself, not narrated line by line |
| "Where you will use this" bullets (5 items) | 8 | Explained as five takeaways (slide 21) |
| Teardown commands | — | Deferred to the lab page; not a narration beat |

## Verification flags

- The 3.42x and 1.17x scaling factors, the wall times, and the absolute tokens/sec figures (7.9, 12.4, 15.9, 43.9) are this course's own captured measurements on one specific laptop (arm64, Rancher Desktop VM). The ratio moved between runs, so the narration tells learners to read the direction, not the digit. Re-verify if the lab's reference hardware or model versions change.
- The vLLM CPU backend's zero-swap-block behavior is confirmed against `vllm/worker/cpu_worker.py` in image `0.9.1-oe2403lts` specifically — flag for re-check if the course later bumps the vLLM image version, since this is a version-specific internal, not a documented public contract.
- Metrics gauge names (`vllm:num_requests_running`, `vllm:num_requests_waiting`, `vllm:gpu_cache_usage_perc`) are confirmed on the same image version; re-verify names if the vLLM version changes.
