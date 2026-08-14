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
| 7 | The Experiment — vLLM-CPU vs Native Ollama, Same Prompts | Slides + voiceover | 6 min | Ollama wins on raw speed here; vLLM wins on scaling shape |
| 8 | Summary and Lab Bridge | Slides + voiceover | 2 min | What you now know, and what the experiment proves you can measure |

---

## Video 1: vLLM Deep Dive: What's Actually Under the Hood

**Format:** Talking head
**Estimated duration:** 2 minutes
**Learning objective:** By the end, learners understand why this deep dive exists and what they'll be able to explain by the time it's done.

### Narration script

In the last lab, you built a patched CPU image of vLLM, served a small model behind an OpenAI-compatible endpoint, and pointed your client at it with a two-line change. It worked. The contract held.

But you also typed four flags into that compose file without really knowing why they were set the way they were — `dtype`, `swap-space`, `max-model-len`, `max-num-seqs`. And the lesson told you vLLM pages its KV cache and batches requests continuously, without opening up what a page actually is, or what "continuous" really changes underneath.

That's what this deep dive is for. We're going to open the machinery. You'll see what PagedAttention is actually paging, why continuous batching changes throughput and not just latency, and exactly what each of those four flags is buying you against that machinery — because two of the four don't do what you'd assume from their names, and we'll prove that from the running server itself, not from the docs.

We'll close with a small experiment: your vLLM container against native Ollama, same prompts, sequential and concurrent. It won't be a benchmark. It'll be honest, and it'll show you the shape of the difference this machinery makes, even on a laptop with a toy model.

By the end, you'll be able to read a vLLM deployment's flags and know exactly what memory inequality they're solving — and you'll know when reaching for vLLM is the right call, and when it's more machinery than the job needs.

### Suggested visuals / slide beats

1. Title card: vLLM Deep Dive — What's Actually Under the Hood
2. Quick recap strip: lab built image → served model → two-variable client swap → contract held
3. The four flags, shown as a compose.yaml snippet, greyed out with a question mark
4. Preview row: PagedAttention, continuous batching, the flags, the experiment
5. Closing line as text: "You'll know exactly what memory inequality each flag is solving."

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

1. Hotel analogy diagram: naive server reserves a whole floor vs PagedAttention hands out one room at a time
2. Block diagram: fixed-size KV cache blocks, a block table mapping logical positions to physical blocks
3. Two-sequence diagram (from the lesson's Mermaid): requests A and B mapped through block tables to scattered physical blocks, with one free block
4. Callout: "98% of a 1024-token reservation sits unused behind a 20-token answer" — waste visualized as a mostly-empty bar
5. Takeaway card: "Blocks + block table = an OS page table, applied to the KV cache."

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

1. Restaurant analogy: fixed-group seating (nine empty chairs, one slow guest, door locked) vs continuous-batch seating (a chair reopens and refills the instant a guest leaves) — matches this deck's existing "static-batch table" / "vLLM reseats the moment a table clears" slides
2. Scheduler loop diagram: check finished sequences → free slot and blocks → admit next waiting request, one iteration
3. Two-track timeline: static batching (all ten wait for the slowest) vs continuous batching (each finishes and returns independently)
4. Callout: "A one-token answer queued behind nine 500-token generations — static batching makes it wait anyway."
5. Takeaway card: "Paging makes admission cheap; cheap admission is what makes continuous batching possible."

---

## Video 4: What Your vLLM Flags Actually Bought You

**Format:** Slides + voiceover
**Estimated duration:** 6 minutes
**Learning objective:** By the end, learners can explain what each of the lab's four flags controls, and can state — from the running container's own evidence — that swap-space does not add capacity on this CPU backend.

### Narration script

The lab's compose file set four flags without dwelling on why. Now that you understand paging and continuous batching, each one maps directly onto that story, and one of them is not what its name suggests.

Start with `dtype float32`. The lab used float32 because bf16 simply has no CPU compute kernel on this arm64 path — that's the crash you may have hit in the lab's troubleshooting section. But there's a memory cost worth naming here too: a float32 KV cache entry is twice the size of a bf16 one, for the exact same number of tokens. So the same cache-space budget holds half as many blocks on this CPU path as it would on a GPU running bf16. That's one reason the lab keeps max-model-len and max-num-seqs deliberately small.

Now, `swap-space`. On a GPU deployment, swap-space is host RAM used as an overflow tier — when the GPU's KV cache blocks run out, a sequence's blocks can be swapped out to RAM and back, instead of the request being rejected outright. On this CPU build, that overflow tier does not exist at all, and this isn't a guess — it's verified against the image's own source code. The CPU worker computes its block count entirely from the CPU cache-space setting, and then explicitly sets the number of swappable CPU blocks to zero. We confirmed this live on the running container's own metrics too: with one gigabyte set for both the cache space and the swap space, the engine reported fourteen hundred and fifty-six cache blocks — and every single one of them came from the cache-space setting. The swap-space gigabyte contributed exactly zero blocks. It's still accepted, it still shows up in the config, but on this backend it's dead weight — the CPU worker reuses the GPU worker's scheduler code, and that code expects the flag to exist even though it can't use it here.

`max-model-len` is a direct cache budget line, not just a context-window limit for the user. Every block that a sequence could need, at its worst case of max-model-len times max-num-seqs, has to fit inside that cache-space setting alone — because, as we just showed, swap-space adds nothing on this backend. The lab's default of one thousand and twenty-four tokens was chosen by working that arithmetic backward from the container's memory cap, not picked for a nicer context window.

And `max-num-seqs` is the continuous-batching concurrency cap from the last video, made concrete. It's the maximum number of sequences the scheduler will admit into the running batch at once, no matter how many more are waiting. Raise it, and more requests get to share continuous batching's never-idle benefit at the same time — but every admitted sequence still needs its own blocks, so raising max-num-seqs without raising the cache budget just means requests get admitted and then immediately stall on cache space instead of on a batch slot.

So the real picture is three flags feeding one shared memory inequality — dtype, max-model-len, and max-num-seqs all draw against the cache-space budget — and one flag, swap-space, that's accepted and validated at startup but contributes nothing on this backend. If you're sizing a CPU or memory-constrained deployment, that's the arithmetic to work through, not an assumption that swap-space buys you headroom the way it would on a GPU.

### Suggested visuals / slide beats

1. Compose.yaml snippet with the four flags highlighted one at a time as each is discussed
2. dtype comparison: float32 block vs bf16 block, same token count, twice the bytes
3. Code excerpt from cpu_worker.py showing num_cpu_blocks explicitly set to zero — framed as "verified from source, not assumed"
4. Live /metrics screenshot: cache_config_info showing num_gpu_blocks=1456, num_cpu_blocks=0
5. Diagram (from the lesson's Mermaid): dtype, max-model-len, max-num-seqs feeding into the cache budget; swap-space dashed off to the side, "accepted, 0 blocks"
6. Takeaway card: "Three flags share one memory budget. Swap-space isn't a fourth line — verified from source and from /metrics."

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

1. /metrics endpoint output, three gauges highlighted: num_requests_running, num_requests_waiting, gpu_cache_usage_perc
2. Live curl output card showing all three at 0.0 (idle snapshot) with a caption: "instant snapshot, not a counter"
3. Decision diagram: waiting queue + low cache usage → raise max-num-seqs; waiting queue + cache pinned at 100% → raise cache budget
4. Callout connecting back to Video 4: "swap-space won't help here — confirmed zero blocks on this backend"
5. Takeaway card: "Same symptom, two causes. Read the gauges before you reach for a lever."

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

1. Decision diagram (from the lesson's Mermaid): single-user, one-at-a-time → Ollama-class server is enough; concurrent, competing requests → vLLM-class serving matters
2. Side-by-side cost card: vLLM's bookkeeping and scheduler cost vs the payoff it needs concurrent load to unlock
3. Takeaway card: "Ask first: do my requests actually overlap? That answer picks the server."

---

## Video 7: The Experiment — vLLM-CPU vs Native Ollama, Same Prompts

**Format:** Slides + voiceover
**Estimated duration:** 6 minutes
**Learning objective:** By the end, learners can distinguish absolute throughput from scaling shape, and explain why vLLM can lose on one and still win on the other.

### Narration script

This isn't a benchmark. At CPU scale, with a tiny model and no more than eight requests, the numbers you'd get are noisy and specific to one laptop. What's actually worth learning here is the shape — whether requests fired one after another behave differently from requests fired with real overlap, and whether that difference looks different between the two servers.

First, the same four prompts, sent one after another, to each server. On this laptop, vLLM-CPU took just under twenty seconds for all four. Native Ollama took under four seconds for the same four. That's Ollama clearly winning in absolute wall time, and that's a real, expected result at this scale — a mature, heavily optimized single-stream runtime beating an eager-mode, float32, CPU vLLM path on a tiny model is not a failure of anything. Keep that number in mind, but don't stop here — the interesting part is next.

Now the same idea, but fired concurrently — three prompts sent without waiting for each to finish, compared against a sequential run of those exact same three prompts, so the comparison is fair. For vLLM-CPU, the sequential baseline for those three prompts took about twelve and a half seconds. Fired concurrently, the same three took about four seconds. That's roughly three times faster than sequential — a strongly sub-linear scaling curve, which is exactly the signature continuous batching should produce, because work is overlapping instead of queuing.

For Ollama, the same comparison: sequential took about one and a half seconds, concurrent took about one and three tenths of a second. That's barely faster than sequential — close to flat, which is consistent with requests still being handled essentially one at a time under the hood, even when you fire them together.

So here's the honest headline. Ollama is faster in absolute tokens per second at this toy scale — a mature runtime serving a small model is going to beat an eager-mode CPU path on a different, tiny model, and that's not a surprise. But the shape is exactly what the theory from the earlier videos predicts: vLLM's concurrent run scales about three times better than its own sequential baseline, while Ollama's concurrent run barely scales at all versus its own baseline. The mechanism is doing its job, even though it doesn't win the absolute scoreboard on a 135-million-parameter toy model on a laptop. The three-times GPU story from the lesson is real — it just needs GPU-scale concurrent load and a production-sized model to show up in the absolute numbers too. Here, on this laptop, you can already see the shape of it, even though the scoreboard isn't reversed yet.

### Suggested visuals / slide beats

1. Two-row comparison card: sequential wall time, vLLM-CPU vs Ollama, with Ollama's bar clearly shorter
2. Scaling diagram: matched-set sequential baseline vs concurrent run, for each server, showing the ratio (vLLM ~3.1x, Ollama ~1.1x)
3. Results table from the lesson (wall time, approx tokens/sec) as an on-screen reference card
4. Callout: "Same scoreboard, different question — absolute speed vs scaling shape"
5. Takeaway card: "Ollama wins on raw speed here. vLLM wins on how it scales under overlap — and that's the mechanism doing its job."

---

## Video 8: Summary and Lab Bridge

**Format:** Slides + voiceover
**Estimated duration:** 2 minutes
**Learning objective:** By the end, learners can state what they now understand about vLLM's internals and know exactly what to run to reproduce the experiment themselves.

### Narration script

Let's bring this together. You now know what a KV cache block actually is, and why paging it — instead of reserving one long contiguous span per request — is what lets far more sequences share the same memory. You know why continuous batching schedules at the level of a single step, not a whole batch, and why that keeps every slot busy instead of waiting on the slowest request in the room. You know what each of your lab's four flags is really doing — and specifically, that swap-space is not a second memory budget on this CPU backend, because you saw that confirmed from the running container's own source and its own metrics, not just from documentation. And you know how to read the three key gauges to decide which lever to pull when a queue starts building.

The lab page has the exact commands to reproduce the experiment yourself — sequential and concurrent, against both servers, on your own machine. Run it, watch the wall-clock numbers land, and you'll see the same shape we just walked through: not necessarily faster in absolute terms on a toy model, but sub-linear scaling under overlap, which is PagedAttention and continuous batching doing exactly what they're built to do.

### Suggested visuals / slide beats

1. Four-item recap row: paged KV cache, continuous batching, the flags (with swap-space crossed out), the three gauges
2. Terminal card: the exact commands from the lab page, ready to copy
3. Closing card: "Same shape, your machine — go measure it yourself."

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
| `--swap-space`: zero blocks on CPU backend, verified from source + /metrics | 4 | Explained |
| `--max-model-len`: direct cache budget line, arithmetic worked backward | 4 | Explained |
| `--max-num-seqs`: continuous-batching concurrency cap | 4 | Explained |
| `/metrics` endpoint: num_requests_running, num_requests_waiting, gpu_cache_usage_perc | 5 | Explained |
| Reading the three gauges together to decide which lever to pull | 5 | Explained |
| Gauges are instant snapshots, not counters | 5 | Explained (as a caution) |
| When vLLM-class serving matters vs single-user Ollama-class | 6 | Explained |
| Experiment setup: prompt set, machine budget, both servers coexisting | 7 | Explained (folded into results, not narrated as setup mechanics) |
| Sequential results: vLLM-CPU vs Ollama wall time | 7 | Explained |
| Concurrent results + matched-set sequential baseline + scaling factor | 7 | Explained |
| Honest headline: Ollama wins absolute, vLLM wins scaling shape | 7 | Explained |
| Results file / comparison-results.txt content | 7 | Deferred — belongs in the lab itself, not narrated line by line |
| "Where you will use this" bullets (4 items) | 8 | Summarized, not read as a list |
| Teardown commands | — | Deferred to the lab page; not a narration beat |

## Verification flags

- The 3.13x and 1.10x scaling factors, and the absolute tokens/sec figures, are this course's own captured measurements on one specific laptop (arm64, Rancher Desktop VM) — re-verify if the lab's reference hardware or model versions change.
- The vLLM CPU backend's zero-swap-block behavior is confirmed against `vllm/worker/cpu_worker.py` in image `0.9.1-oe2403lts` specifically — flag for re-check if the course later bumps the vLLM image version, since this is a version-specific internal, not a documented public contract.
- Metrics gauge names (`vllm:num_requests_running`, `vllm:num_requests_waiting`, `vllm:gpu_cache_usage_perc`) are confirmed on the same image version; re-verify names if the vLLM version changes.
