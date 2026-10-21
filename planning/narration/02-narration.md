# Module 2 — Serving Local Models

## Recommended video structure

| # | Video title | Format | Estimated duration | Central idea |
|---|-------------|--------|--------------------|--------------|
| 1 | Module 2 Introduction — Serving Local Models | Talking head | 2 min | Why the serving engine you pick should never touch your application code |
| 2 | Docker Model Runner vs Ollama, llama.cpp, LocalAI — Which Engine Fits Where | Slides + voiceover | 5 min | Four open engines, one job each, one shared interface |
| 3 | The OpenAI-Compatible Contract — One URL, Any Engine | Slides + voiceover | 5 min | Two endpoints are the entire contract every engine speaks |
| 4 | GGUF and Model Sizing — Picking a Model That Fits Your Laptop | Slides + voiceover | 4 min | Quantization and a simple RAM budgeting rule |
| 5 | Two Wiring Patterns — Native Model vs Model in a Container | Slides + voiceover | 5 min | Same app code, one environment variable, Mac vs GPU host |
| 6 | Module 2 Summary — Into the Lab | Talking head / Slides | 2 min | What you now know, and what the lab proves |

---

## Video 1: Module 2 Introduction — Serving Local Models

**Format:** Talking head
**Estimated duration:** 2 minutes
**Learning objective:** By the end, learners understand why this module treats the model-serving engine as a swappable piece behind one fixed contract, and what they will be able to do once they finish it.

### Narration script

Hello and welcome back. In Module 1, you got your first container talking to a model that was running natively on your machine, and you saw that one detail matter more than anything else: the container and the model spoke to each other over a plain HTTP call, not through some special container-only trick.

Now here's the question this module answers. What happens when you want to change which engine is actually serving that model? Maybe today it's Ollama on your laptop, and tomorrow it's a different engine on a Linux server with a GPU. Does your application code need to change?

Well, the answer is no, and that's the whole point of this module. You're going to meet four open-source ways to serve a model, Docker Model Runner, Ollama, llama.cpp, and LocalAI, and you'll see that every single one of them, no matter how different on the inside, exposes the exact same interface to the outside. That is what we call the OpenAI-compatible contract, and it's the one idea that makes the rest of this course click. The Docs Assistant you build in Module 5, the Support Agent in Module 6, and the Incident Crew in Module 7 all talk to that same contract, never to a specific engine.

By the end of this module, you will know which engine to reach for and why, you will understand the two endpoints that make up that contract, and you will know how to size a model to your own laptop's memory. Then in the lab, you'll containerize a client that speaks this contract for real. Let's get started.

### Suggested visuals / slide beats

1. Title slide: Module 2, "Serving Local Models"
2. Recap beat: M1's container talking to a native model over HTTP
3. The four-engine lineup (Docker Model Runner, Ollama, llama.cpp, LocalAI) as silhouettes behind one shared plug/socket icon
4. Preview of what M5/M6/M7 build on top of this contract
5. Closing: "What you'll be able to do" capability line

---

## Video 2: Docker Model Runner vs Ollama, llama.cpp, LocalAI — Which Engine Fits Where

**Format:** Slides + voiceover
**Estimated duration:** 5 minutes
**Learning objective:** By the end, learners can name each of the four engines covered in this course and state which situation each one is best suited for.

### Narration script

Let's say you want to serve a model with the least possible setup. If you already have Docker 4.40 or newer, there is a genuinely one-command way to do that. You would just run `docker model run`, followed by the model name, something like `ai/gpt-oss`, and Docker downloads the quantized weights, serves them, and exposes the standard `/v1` API. No Ollama, no separate process, nothing extra to install on the host. It's fully open source, and it runs on Docker Desktop and on Docker CE on Linux. Underneath, it uses llama.cpp by default, vLLM on NVIDIA GPUs, and a vllm-metal backend on Apple Silicon.

Now, one word of caution here. `ai/gpt-oss` is a twenty billion parameter model, so you would only want to run that particular one on a machine with plenty of RAM. On our sixteen gigabyte reference laptop, you'd stick with the smaller models we'll get to in a few minutes.

So if Docker Model Runner is this easy, why does this course spend the rest of its time on other engines? Here's the reason. This course is built to be runtime-agnostic, meaning the patterns you learn should work the same way whether you're on Docker, Rancher Desktop, Podman, bare Linux, or Windows with WSL2. Docker Model Runner is good to know and worth using if your team already lives inside Docker's toolchain, but it ties you to one specific tool. The three engines we'll actually wire up in the labs don't have that limitation.

Let's now look at those three engines, and think of them as different brands of espresso machine. There's La Marzocco, there's Breville, there's DeLonghi. Each one is built completely differently on the inside, one uses a thermoblock, another uses a boiler, and each has its own pressure profile and its own control system. But here's the thing, they all pour into the same standard cup. And that cup, in our world, is the OpenAI API. You can swap the machine sitting under the counter, and no barista needs to be retrained.

The first one is Ollama, and this is the engine you already have running from Module 1. It's serving `qwen3.5:2b` on Metal, on port eleven four three four, and it's the de-facto standard for local development. On a Mac, since Ollama zero point forty, it runs the model on the MLX engine by default, and you can see that in the runner column of `ollama ps`. Everywhere else it uses llama.cpp. It runs in a container too, though on Mac there are some caveats we covered last module.

Second is llama.cpp, and here's an interesting thing about it: it's actually the inference engine that lives inside Ollama. It handles GGUF-format models, quantization, and hardware acceleration under the hood. You would reach for llama.cpp directly when you need something lighter than the full Ollama stack, and you can run it in its own container.

And the third is LocalAI. This is the right choice when you need one single container that looks like OpenAI to every caller, and routes requests to whatever backend or hardware happens to be available underneath, whether that's llama.cpp, Whisper, or Stable Diffusion. It's popular on Linux servers that run mixed hardware.

There's a fourth engine coming in Module 3, called vLLM, and that one is built for high-throughput batched inference on a GPU virtual machine. We'll get to it later. For now, for development, Ollama stays the standard, and that's what the rest of this course builds on.

### Suggested visuals / slide beats

1. Divider: "Four ways to serve a model"
2. Docker Model Runner: one-command demo, `docker model run ai/gpt-oss`, RAM-size warning callout
3. Espresso-machine analogy diagram: three machines, one shared cup labeled "OpenAI API"
4. Engine comparison table: Ollama / llama.cpp / LocalAI — best-for, container-ready, notes
5. Ollama highlighted as "already running from M1", pointing at `:11434`
6. Fan-out diagram: llama.cpp as the engine inside Ollama
7. LocalAI as a hub routing to multiple backends
8. Preview strip: vLLM arriving in Module 3

---

## Video 3: The OpenAI-Compatible Contract — One URL, Any Engine

**Format:** Slides + voiceover
**Estimated duration:** 5 minutes
**Learning objective:** By the end, learners can state the two endpoints that make up the OpenAI-compatible contract and explain why an application never needs to know which engine sits behind it.

### Narration script

Let's extend an analogy from Module 1. Different countries wire their power plants completely differently, some burn coal, some run on hydro, some on nuclear, but a standard wall socket always delivers power the same way. You plug in your charger, and the charger doesn't know or care what's generating the electricity behind that wall.

You already saw in Module 1 that Ollama exposes an endpoint called `/v1/chat/completions`. And here's what makes this genuinely useful: every single engine in that table we just walked through, Docker Model Runner, Ollama, llama.cpp, and LocalAI, exposes that exact same interface.

So what is this contract, actually? It comes down to just two endpoints, and that's the entire thing. First, there is `POST /v1/chat/completions`, which generates a response from a list of messages. And second, there is `GET /v1/models`, which lists whatever models are available. That's it. Two endpoints.

Now here's the part that matters most for how you build. Your application code calls one URL, and that URL lives in an environment variable, not in your code. So when you're developing, that variable might point at Ollama, running natively on your Mac, reached at `host.docker.internal` on port eleven four three four. When you move to staging, the same variable might point at a LocalAI service inside your Compose network. And in production, it might point at a vLLM service on a GPU VM. In every one of those cases, you change one variable. You do not touch a single line of application code.

Picture the diagram this way: your app, whether that's Python, curl, or LangChain, talks to the contract, and the contract is the only thing your app knows about. Behind that contract, Ollama, vLLM, LocalAI, and llama.cpp all sit as interchangeable options. Which one actually answers the call is a deployment decision, not a code decision.

And this is genuinely the one idea that makes the rest of this course click. The Acme Docs Assistant you'll build in Module 5, the Support Agent in Module 6, and the Incident Crew in Module 7 all speak this exact same contract. So when your team decides to move from a small one-and-a-half billion parameter model used for development to a much larger thirteen billion parameter model in production, the application code does not change at all. Not one line.

### Suggested visuals / slide beats

1. Wall-socket analogy diagram: different power plants, one standard socket
2. Two-endpoint card: `POST /v1/chat/completions` and `GET /v1/models`
3. Environment-variable swap, three rows: dev (Ollama/host.docker.internal), staging (LocalAI/Compose), production (vLLM/GPU VM)
4. The mermaid-style fan diagram: App → Contract → {Ollama, vLLM, LocalAI, llama.cpp}
5. Payoff callout: "2B dev model → 13B prod model, zero code change"

---

## Video 4: GGUF and Model Sizing — Picking a Model That Fits Your Laptop

**Format:** Slides + voiceover
**Estimated duration:** 4 minutes
**Learning objective:** By the end, learners can explain what GGUF and quantization are in plain terms and apply a simple rule to estimate whether a model fits their machine's RAM.

### Narration script

Let's think about quantization the way you'd think about compressing a photo. A camera's RAW file is huge, and mathematically it's about as perfect as it gets. A JPEG at eighty percent quality, on the other hand, is a fraction of that size. You can barely tell the difference for most everyday purposes, and it loads instantly. GGUF is, in a sense, the JPEG for a language model's weights, that is, a compact, quantized format that llama.cpp, and therefore Ollama too, can load and run well on a CPU or on Metal, without needing an NVIDIA GPU at all.

Most Ollama tags are GGUF files at roughly what's called Q4_K_M quantization, and that is not the original float16 weights, it's a compressed version of them. The "2b" part of a tag tells you the parameter count. The quantization level is a separate setting, and it's the one controlling the compression. Now, on Apple Silicon, `qwen3.5:2b` is the exception. When you ran `ollama pull qwen3.5:2b`, Ollama fetched an MLX build, safetensors format at mxfp8 quantization, and that is why it takes about three point one gigabytes on disk, more than the four billion parameter `qwen3:4b` GGUF at two point five.

Now, here's a practical rule that saves you a lot of guessing. For a Q4 GGUF model, take the parameter count and multiply it into zero point six, and that gives you roughly the RAM usage. The rule does not apply to MLX builds like `qwen3.5:2b`. So a seven billion parameter model would cost you roughly four gigabytes. If you're on sixteen gigabytes of unified memory, and you reserve about eight gigabytes for the OS and your app containers, you're left with somewhere around four to five gigabytes for the model itself.

So what actually fits in that budget? `qwen3.5:2b` costs about three gigabytes, and that's what we've already pulled for the labs, it keeps iteration fast and the machine responsive. `qwen3:4b` costs about two and a half gigabytes and gives you better reasoning while still staying fast, that's a reasonable optional upgrade. Beyond the labs, Qwen3 in the four to eight billion range, Llama 3.2 at three billion, or Mistral 7B are all worth knowing, they're strong, general-purpose choices once you have the RAM to spare. And that twenty billion parameter `gpt-oss` model from the Docker Model Runner demo, that one is simply too big for sixteen gigabytes, it's really a demo-only model on this machine.

For every lab in this course, you'll stay with `qwen3.5:2b`. The model-selection decision gets a lot more interesting in Module 3, once you're serving a model with vLLM and actually have to weigh throughput against model size.

### Suggested visuals / slide beats

1. RAW vs JPEG compression analogy, side by side
2. GGUF definition card: compact, quantized format for llama.cpp/Ollama, no CUDA needed
3. Sizing formula: parameters × 0.6 ≈ RAM at Q4, worked example at 7B → ~4GB
4. 16GB laptop budget bar: 8GB OS/containers, 4-5GB model
5. Model options table: qwen3.5:2b, qwen3:4b, Qwen3, Llama 3.2, Mistral 7B, gpt-oss (too big, crossed out for this machine)
6. Callout: "qwen3.5:2b for every lab in this course"

---

## Video 5: Two Wiring Patterns — Native Model vs Model in a Container

**Format:** Slides + voiceover
**Estimated duration:** 5 minutes
**Learning objective:** By the end, learners can describe Pattern A (Mac, native model) and Pattern B (Windows/Linux GPU, containerized model), and explain why the application code is identical in both.

### Narration script

You already know the Apple Silicon constraint from Module 1: the hypervisor on a Mac exposes no virtual GPU to containers, so anything running inside a container falls back to CPU. That's why the model server has to run natively to actually get Metal acceleration. And that's exactly why Pattern A is what you use on a Mac.

So what does Pattern A look like? Ollama runs as a native process, right on your Mac, using the Metal GPU, and it's reachable at port eleven four three four. Your app runs inside a container, and it reaches that native Ollama process at a special address, `host.docker.internal`, on port eleven four three four. That address is the bridge that lets a containerized app talk out to something running natively on the host.

Now, Pattern B is what the exact same `compose.yaml` looks like on Windows with WSL2 and an NVIDIA GPU, or on a Linux GPU virtual machine. In that world, Ollama itself runs inside a container, with NVIDIA GPU passthrough, still on port eleven four three four. And your app container reaches it over the Compose network, using the hostname `ollama`, not `host.docker.internal`.

Here's the part worth sitting with. The application code in both patterns is genuinely identical. There's a single environment variable, `OPENAI_BASE_URL`, and it's the only thing that switches. On Mac, it's set to `http://host.docker.internal:11434/v1`. On a GPU host, it's set to `http://ollama:11434/v1`. Your `compose.yaml` handles that difference through an env file or a Compose override, and your Python client never even sees it happen. You build once, on your laptop, and the same image drops onto a Linux GPU VM with a single config change.

And that's really the payoff of this whole universal contract we've been building up to. Your app treats the model-serving engine as nothing more than an addressable service, something it reaches by URL. Whether that service happens to be a native process, a container on the same host, or a remote VM somewhere else entirely, the application does not need to know, and it does not need to care.

### Suggested visuals / slide beats

1. Pattern A diagram: Ollama (native, Metal) ← host.docker.internal ← App container, labeled "Mac"
2. Pattern B diagram: Ollama (container, NVIDIA passthrough) ← Compose network (`ollama`) ← App container, labeled "Windows/Linux"
3. Side-by-side: identical app code, one `OPENAI_BASE_URL` value swapped
4. "Build once, drop onto a GPU VM" closing visual

---

## Video 6: Module 2 Summary — Into the Lab

**Format:** Talking head / Slides
**Estimated duration:** 2 minutes
**Learning objective:** By the end, learners can recap the module's core idea and know exactly what the lab will have them build and prove.

### Narration script

So let's bring this together. You now know four ways to serve a model, Docker Model Runner for the fastest possible demo, and Ollama, llama.cpp, and LocalAI as the runtime-agnostic engines this course actually builds on. You know that every one of them speaks the same two-endpoint contract, `/v1/chat/completions` and `/v1/models`, and that swapping engines is a one-variable change, never a code change. You know what GGUF and quantization actually are, and you have a simple rule, parameters into zero point six, for sizing a model to your own machine. And you know the two wiring patterns, native model on a Mac, containerized model on Windows or Linux, with `OPENAI_BASE_URL` as the one thing that ever changes between them.

In the lab that follows, you're going to containerize a client that speaks this exact contract, and you'll prove for yourself that the same client code works whether it's calling a native Ollama process or, later on, a fully containerized engine. That's the hands-on proof behind everything we just covered.

I'll see you in the lab.

### Suggested visuals / slide beats

1. Recap grid: the four engines, the two-endpoint contract, the sizing rule, the two wiring patterns
2. "OPENAI_BASE_URL is the only thing that changes" closing callout
3. Lab bridge: "Next up — Lab: containerize a client for the /v1 contract"

---

## Coverage map

| Source idea | Video | Treatment |
|-------------|-------|-----------|
| Docker Model Runner one-command demo, `docker model run` | Video 2 | Explained |
| gpt-oss too big for 16GB reference laptop | Video 2 | Explained |
| Course is runtime-agnostic, not Docker-specific | Video 2 | Explained |
| Ollama / llama.cpp / LocalAI comparison table | Video 2 | Explained |
| Espresso-machine analogy | Video 2 | Explained |
| vLLM preview (arrives M3) | Video 2 | Explained (brief) |
| OpenAI-compatible endpoint, wall-socket analogy extension | Video 3 | Explained |
| Two endpoints: `/v1/chat/completions`, `/v1/models` | Video 3 | Explained |
| Env-var swap across dev/staging/production | Video 3 | Explained |
| Mermaid diagram: App → Contract → engines | Video 3 | Explained |
| Payoff: 2B → 13B model swap, zero code change | Video 3 | Explained |
| GGUF / quantization, JPEG analogy | Video 4 | Explained |
| Q4_K_M quantization on `ollama pull` | Video 4 | Explained |
| Sizing rule: params × 0.6 ≈ RAM at Q4 | Video 4 | Explained |
| Model options table (qwen3.5:2b / qwen3:4b, Qwen3, Llama 3.2, Mistral 7B, gpt-oss) | Video 4 | Explained |
| Two wiring patterns (Pattern A Mac, Pattern B GPU host) | Video 5 | Explained |
| `host.docker.internal` vs `ollama` Compose hostname | Video 5 | Explained |
| `OPENAI_BASE_URL` as the single switch | Video 5 | Explained |
| Build-once-deploy-anywhere payoff | Video 5 | Explained |
| Summary table (all six rows) | Video 6 | Recapped |
| Lab bridge: containerize a client for the contract | Video 1, Video 6 | Explained |

## Verification flags

- Docker Model Runner's minimum version ("4.40+") and its exact feature set may change with newer Docker Desktop/CE releases — verify against the installed version before recording.
- `ai/gpt-oss` availability and its exact parameter count/quantization on Docker Hub's model catalog may change; re-check before citing it as a live demo.
- The 0.6× RAM-sizing rule is a practical approximation for Q4 quantization specifically — it does not hold at other quantization levels (Q8, fp16), which the script does not claim.
