# Module 2 — Serving Local Models

## Recommended video structure

| # | Video title | Format | Estimated duration | Central idea |
|---|-------------|--------|--------------------|--------------|
| 1 | Module 2 Introduction — Serving Local Models | Talking head | 2 min | Why the serving engine you pick should never touch your application code |
| 2 | Docker Model Runner vs Ollama, llama.cpp, LocalAI — Which Engine Fits Where | Slides + voiceover | 5 min | Four open engines, one job each, one shared interface |
| 3 | The OpenAI-Compatible Contract — One URL, Any Engine | Slides + voiceover | 5 min | Two endpoints are the entire contract every engine speaks |
| 4 | GGUF and Model Sizing — Picking a Model That Fits Your Laptop | Slides + voiceover | 4 min | Quantization and a simple RAM budgeting rule |
| 5 | Two Wiring Patterns — Native Model vs Model in a Container | Slides + voiceover | 5 min | Same app code, one environment variable, Mac vs GPU host |
| 6 | Reasoning Models — Why Thinking Eats Your Token Budget | Slides + voiceover | 2 min | Thinking tokens count against `max_tokens`; switch thinking off per API |
| 7 | Module 2 Summary — Into the Lab | Talking head / Slides | 2 min | What you now know, and what the lab proves |

---

## Video 1: Module 2 Introduction — Serving Local Models

**Format:** Talking head
**Estimated duration:** 2 minutes
**Learning objective:** By the end, learners understand why this module treats the model-serving engine as a swappable piece behind one fixed contract, and what they will be able to do once they finish it.

### Narration script

Hello and welcome back. In Module 1, you got your first container talking to a model that was running natively on your machine, and you saw that one detail matter more than anything else: the container and the model spoke to each other over a plain HTTP call, not through some special container-only trick.

Now here's the question this module answers. What happens when you want to change which engine is actually serving that model? Maybe today it's Ollama on your laptop, and tomorrow it's a different engine on a Linux server with a GPU. Does your application code need to change?

Well, the answer is no, and that's the whole point of this module. You're going to meet four open-source ways to serve a model, Docker Model Runner, Ollama, llama.cpp, and LocalAI, and you'll see that every single one of them, no matter how different on the inside, exposes the exact same interface to the outside. That is what we call the OpenAI-compatible contract, and it's the one idea that makes the rest of this course click. The Docs Assistant you build in Module 5, the Support Agent in Module 6, and the Incident Crew in Module 7 all talk to that same contract, never to a specific engine.

By the end of this module, you will know which engine to reach for and why, you will understand the two endpoints that make up that contract, and you will know how to size a model to your own laptop's memory. You will also learn how to switch off a reasoning model's thinking, so the token budget goes to the answer. Then in the lab, you'll containerize a client that speaks this contract for real. Let's get started.

### Suggested visuals / slide beats

1. Title slide: Ollama, llama.cpp, and LocalAI feed one `/v1` socket, and the app plugs in (slide 1)
2. What you'll learn: six numbered objectives, the last one is switching thinking off (slide 2)
3. The M1 recap and the M5/M6/M7 preview are spoken only

---

## Video 2: Docker Model Runner vs Ollama, llama.cpp, LocalAI — Which Engine Fits Where

**Format:** Slides + voiceover
**Estimated duration:** 5 minutes
**Learning objective:** By the end, learners can name each of the four engines covered in this course and state which situation each one is best suited for.

### Narration script

Let's say you want to serve a model with the least possible setup. If you already have Docker 4.40 or newer, there is a genuinely one-command way to do that. You would just run `docker model run`, followed by the model name, something like `ai/gpt-oss`, and Docker downloads the quantized weights, serves them, and exposes the standard `/v1` API. No Ollama, no separate process, nothing extra to install on the host. It's fully open source, and it runs on Docker Desktop and on Docker CE on Linux. Underneath, it uses llama.cpp by default, vLLM on NVIDIA GPUs, and a vllm-metal backend on Apple Silicon.

Now, one word of caution here. `ai/gpt-oss` is a twenty billion parameter model, so you would only want to run that particular one on a machine with plenty of RAM. On our sixteen gigabyte reference laptop, you'd stick with the smaller models we'll get to in a few minutes.

So if Docker Model Runner is this easy, why does this course spend the rest of its time on other engines? Here's the reason. This course is built to be runtime-agnostic, meaning the patterns you learn should work the same way whether you're on Docker, Rancher Desktop, Podman, bare Linux, or Windows with WSL2. Docker Model Runner is good to know and worth using if your team already lives inside Docker's toolchain. It is open source, but it runs only on Docker Desktop and Docker CE. The three engines we'll actually wire up in the labs don't have that limitation.

Let's now look at those three engines, and think of them as different brands of espresso machine. There's La Marzocco, there's Breville, there's DeLonghi. Each one is built completely differently on the inside, one uses a thermoblock, another uses a boiler, and each has its own pressure profile and its own control system. But they all pour into the same standard cup. And that cup, in our world, is the OpenAI API. You can swap the machine sitting under the counter, and no barista needs to be retrained.

The first one is Ollama, and this is the engine you already have running from Module 1. It's serving `qwen3.5:2b` on Metal, on port eleven four three four, and it's the de-facto standard for local development. On a Mac, since Ollama zero point forty, it runs the model on the MLX engine by default, and you can see that in the runner column of `ollama ps`. Everywhere else it uses llama.cpp. It runs in a container too, though on Mac there are some caveats we covered last module.

Second is llama.cpp, and here's an interesting thing about it: it's actually the inference engine that lives inside Ollama. It handles GGUF-format models, quantization, and hardware acceleration under the hood. You would reach for llama.cpp directly when you need something lighter than the full Ollama stack, and you can run it in its own container.

And the third is LocalAI. This is the right choice when you need one single container that looks like OpenAI to every caller, and routes requests to whatever backend or hardware happens to be available underneath, whether that's llama.cpp, Whisper, or Stable Diffusion. It's popular on Linux servers that run mixed hardware.

There's a fourth engine coming in Module 3, called vLLM, and that one is built for high-throughput batched inference on a GPU virtual machine. We'll get to it later. For now, for development, Ollama stays the standard, and that's what the rest of this course builds on.

### Suggested visuals / slide beats

1. Divider 1: a hand pressing one big button, a box sliding out of a slot (slide 3)
2. Docker Model Runner: `docker model run` with "ai/gpt-oss · 20B, too big for 16 GB", three result boxes: pulls weights, serves locally, same `/v1` API (slide 4)
3. Divider 2: three espresso machines pouring into identical cups (slide 5)
4. Espresso-machine analogy diagram: Ollama ("dev standard, MLX on Mac"), llama.cpp, LocalAI, one shared cup labeled "OpenAI API" (slide 6)
5. Engine table: Ollama / llama.cpp / LocalAI with best-fit job; Ollama row notes the MLX engine on Apple Silicon from 0.40 (slide 7)
6. llama.cpp inside Ollama, LocalAI's backends, and the vLLM preview are spoken only

---

## Video 3: The OpenAI-Compatible Contract — One URL, Any Engine

**Format:** Slides + voiceover
**Estimated duration:** 5 minutes
**Learning objective:** By the end, learners can state the two endpoints that make up the OpenAI-compatible contract and explain why an application never needs to know which engine sits behind it.

### Narration script

First, the problem. Without a shared contract, your app would have to know every engine. Engine A has its own SDK and its own URL. Engine B has another SDK and another URL. Engine C has yet another one. That is custom glue for each engine, and three different ways for your app to break.

So let's extend an analogy from Module 1. Different countries wire their power plants completely differently, some burn coal, some run on hydro, some on nuclear, but a standard wall socket always delivers power the same way. You plug in your charger, and the charger doesn't know or care what's generating the electricity behind that wall.

You already saw in Module 1 that Ollama exposes an endpoint called `/v1/chat/completions`. And here's what makes this genuinely useful: every single engine in that table we just walked through, Docker Model Runner, Ollama, llama.cpp, and LocalAI, exposes that exact same interface.

So what is this contract, actually? It comes down to just two endpoints, and that's the entire thing. First, there is `POST /v1/chat/completions`, which generates a response from a list of messages. And second, there is `GET /v1/models`, which lists whatever models are available. That's it. Two endpoints.

Now here's the part that matters most for how you build. Your application code calls one URL, and that URL lives in an environment variable, not in your code. So when you're developing, that variable might point at Ollama, running natively on your Mac, reached at `host.docker.internal` on port eleven four three four. When you move to staging, the same variable might point at a LocalAI service inside your Compose network. And in production, it might point at a vLLM service on a GPU VM. In every one of those cases, you change one variable. You do not touch a single line of application code.

Picture the diagram this way: your app, whether that's Python, curl, or LangChain, talks to the contract, and the contract is the only thing your app knows about. Behind that contract, Ollama, vLLM, LocalAI, and llama.cpp all sit as interchangeable options. Which one actually answers the call is a deployment decision, not a code decision.

And this is genuinely the one idea that makes the rest of this course click. The Acme Docs Assistant you'll build in Module 5, the Support Agent in Module 6, and the Incident Crew in Module 7 all speak this exact same contract. So when your team decides to move from a small two billion parameter model used for development to a much larger thirteen billion parameter model in production, the application code does not change at all. Not one line.

### Suggested visuals / slide beats

1. Divider 3: a coal plant, a dam, and wind turbines feeding one wall socket (slide 8)
2. The problem: your app wired by dashed custom glue to Engine A, B, and C, each with its own SDK and URL (slide 9)
3. Wall socket: Ollama, vLLM, LocalAI behind one `/v1` socket, labeled `POST /chat/completions` and `GET /models`, app code never changes (slide 10)
4. One variable: `OPENAI_BASE_URL` fans out to DEV (Ollama, native Mac), STAGING (LocalAI, Compose), PRODUCTION (vLLM, GPU VM) (slide 11)
5. The 2B to 13B payoff is spoken only

---

## Video 4: GGUF and Model Sizing — Picking a Model That Fits Your Laptop

**Format:** Slides + voiceover
**Estimated duration:** 4 minutes
**Learning objective:** By the end, learners can explain what GGUF and quantization are in plain terms and apply a simple rule to estimate whether a model fits their machine's RAM.

### Narration script

Let's think about quantization the way you'd think about compressing a photo. A camera's RAW file is huge, and mathematically it's about as perfect as it gets. A JPEG at eighty percent quality, on the other hand, is a fraction of that size. You can barely tell the difference for most everyday purposes, and it loads instantly. GGUF is, in a sense, the JPEG for a language model's weights, that is, a compact, quantized format that llama.cpp, and therefore Ollama too, can load and run well on a CPU or on Metal, without needing an NVIDIA GPU at all.

Most Ollama tags are GGUF files at roughly what's called Q4_K_M quantization, and that is not the original float16 weights, it's a compressed version of them. The "2b" part of a tag tells you the parameter count. The quantization level is a separate setting, and it's the one controlling the compression. Now, on Apple Silicon, `qwen3.5:2b` is the exception. When you ran `ollama pull qwen3.5:2b`, Ollama fetched an MLX build, safetensors format at mxfp8 quantization, and that is why it takes about three point one gigabytes on disk, more than the four billion parameter `qwen3:4b` GGUF at two point five.

Now, here's a practical rule that saves you a lot of guessing. For a Q4 GGUF model, take the parameter count and multiply it into zero point six, and that gives you roughly the RAM usage. The rule does not apply to MLX builds like `qwen3.5:2b`. So a seven billion parameter model would cost you roughly four gigabytes. If you're on sixteen gigabytes of unified memory, and you reserve about eight gigabytes for the OS and your app containers, you're left with somewhere around four to five gigabytes for the model itself.

So what actually fits in that budget? `qwen3.5:2b` costs about three gigabytes, and that's what we've already pulled for the labs, it keeps iteration fast and the machine responsive. `qwen3:4b` costs about two and a half gigabytes, and it is optional, not a drop-in swap. The build we tested ignores think false and prints its reasoning inline, and that breaks the labs that expect a short answer. Beyond the labs, Qwen3 in the four to eight billion range, Llama 3.2 at three billion, or Mistral 7B are all worth knowing, they're strong, general-purpose choices once you have the RAM to spare. And that twenty billion parameter `gpt-oss` model from the Docker Model Runner demo, that one is simply too big for sixteen gigabytes, it's really a demo-only model on this machine.

For every lab in this course, you'll stay with `qwen3.5:2b`. The model-selection decision gets a lot more interesting in Module 3, once you're serving a model with vLLM and actually have to weigh throughput against model size.

### Suggested visuals / slide beats

1. Divider 4: a huge print and a compact print of the same photo (slide 12)
2. GGUF pipeline: float16 RAW box, "quantize Q4_K_M" arrow, small GGUF box, and the sizing-rule box "params × 0.6 ≈ GB of RAM, 7B ≈ 4 GB at Q4"; footnote: `qwen3.5:2b` on a Mac is an MLX mxfp8 build, 3.1 GB, so the rule does not apply (slide 13)
3. Model table, six rows: `qwen3.5:2b` (green, labs default), `qwen3:4b` (optional, not a drop-in), Qwen3 4B-8B, Llama 3.2 3B, Mistral 7B, gpt-oss 20B (red, too big for 16 GB) (slide 14)
4. The 16 GB budget split (8 GB for the OS and containers, 4 to 5 GB for the model) is spoken only

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

1. Divider 5: one pipe splitting into a Y-fork, one branch to a laptop, the other to a server rack (slide 15)
2. Two panels on one slide: Pattern A · Mac (app container to native Ollama on the Metal GPU over `host.docker.internal:11434`) and Pattern B · GPU host (app container to an Ollama container on an NVIDIA GPU over `ollama:11434` on the Compose network) (slide 16)
3. The `OPENAI_BASE_URL` values and "build once" are spoken only

---

## Video 6: Reasoning Models — Why Thinking Eats Your Token Budget

**Format:** Slides + voiceover
**Estimated duration:** 2 minutes
**Learning objective:** By the end, learners can explain why a reasoning model can return an empty answer, and can switch its thinking off on each API the course uses.

### Narration script

Our model, `qwen3.5:2b`, is a reasoning model, so it writes hidden thinking tokens before it answers. Those tokens count against `max_tokens`, the limit on how long the reply can be. With a budget of four thousand ninety-six tokens, the model spent four thousand and eighty on thinking, and the content came back empty. With `reasoning_effort` set to none, the same question came back in just eleven tokens.

Think of a student who works the problem on scratch paper that is never handed in, but the answer sheet has only so many lines. If the scratch work fills every line, the answer box stays empty.

The switch depends on the API: `think` set to false on Ollama's native APIs, `reasoning_effort` set to none on the `/v1` endpoint, and `reasoning` set to False in langchain-ollama. Two other options look right but fail on this model: `/no_think` in the prompt, and `PARAMETER think` in a Modelfile.

Every lab in this course switches thinking off, so the token budget goes to the answer. For really hard tasks, like multi-step planning or debugging, leave thinking on and give it a generous `max_tokens`.

### Suggested visuals / slide beats

1. Thinking tokens: the same request with a 4,096-token budget; the default lane fills with "thinking: 4,080 tokens" and returns `content: ""`, the `"reasoning_effort": "none"` lane returns a short answer in 11 tokens (slide 17)
2. Analogy: two exam answer sheets; thinking on, scratch work fills every line and the answer box is empty; thinking off, the scratch paper stays on the desk and the answer is written (slide 18)
3. Switch per API: native `"think": false`, `/v1` `"reasoning_effort": "none"`, langchain-ollama `reasoning=False`, plus two crossed-out boxes that fail: `/no_think` and Modelfile `PARAMETER think` (slide 19)

---

## Video 7: Module 2 Summary — Into the Lab

**Format:** Talking head / Slides
**Estimated duration:** 2 minutes
**Learning objective:** By the end, learners can recap the module's core idea and know exactly what the lab will have them build and prove.

### Narration script

So let's bring this together. You now know four ways to serve a model, Docker Model Runner for the fastest possible demo, and Ollama, llama.cpp, and LocalAI as the runtime-agnostic engines this course actually builds on. You know that every one of them speaks the same two-endpoint contract, `/v1/chat/completions` and `/v1/models`, and that swapping engines is a one-variable change, never a code change. You know what GGUF and quantization actually are, and you have a simple rule, parameters into zero point six, for sizing a model to your own machine. And you know the two wiring patterns, native model on a Mac, containerized model on Windows or Linux, with `OPENAI_BASE_URL` as the one thing that ever changes between them. Finally, you know that `qwen3.5:2b` thinks by default, so every lab switches thinking off, with `reasoning_effort` set to none on the `/v1` endpoint.

In the lab that follows, you're going to containerize a client that speaks this exact contract, and you'll prove for yourself that the same client code works whether it's calling a native Ollama process or, later on, a fully containerized engine. That's the hands-on proof behind everything we just covered.

I'll see you in the lab.

### Suggested visuals / slide beats

1. Closing slide: "The engine is a deployment choice, not a code choice"; any engine and any hardware plug into the `/v1` contract, and the app is plugged in once, never rewired; credit line hands off to the Serving lab (slide 20)
2. The recap itself is spoken only; the deck has no recap grid

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
| Reasoning models: thinking tokens count against `max_tokens` (4,080 tokens, empty content) | Video 6 | Explained |
| Scratch-paper analogy | Video 6 | Explained |
| Switch-off per API: `think: false`, `reasoning_effort: "none"`, `reasoning=False` | Video 6 | Explained |
| What does not work: `/no_think`, Modelfile `PARAMETER think` | Video 6 | Explained |
| Ollama runs the MLX engine on Apple Silicon (0.40+) | Video 2 | Explained |
| The problem: one custom SDK per engine (deck slide 9) | Video 3 | Explained |
| Summary table (all seven rows) | Video 7 | Recapped |
| Lab bridge: containerize a client for the contract | Video 1, Video 7 | Explained |

## Verification flags

- Docker Model Runner's minimum version ("4.40+") and its exact feature set may change with newer Docker Desktop/CE releases — verify against the installed version before recording.
- `ai/gpt-oss` availability and its exact parameter count/quantization on Docker Hub's model catalog may change; re-check before citing it as a live demo.
- The 0.6× RAM-sizing rule is a practical approximation for Q4 quantization specifically — it does not hold at other quantization levels (Q8, fp16), which the script does not claim.
