# Module 4 — Packaging Models as OCI Artifacts

## Recommended video structure

| # | Video title | Format | Estimated duration | Central idea |
|---|-------------|--------|--------------------|--------------|
| 1 | Module 4 Introduction — Why Your Model Needs a Shipping Manifest | Talking head | 2 min | Why loose model files break down, and what this module fixes |
| 2 | OCI Artifacts — Why a Container Registry Can Also Store Your Model | Slides + voiceover | 5 min | OCI is a layered blob store with a manifest; a model fits that shape |
| 3 | KitOps, ModelKit, and the Kitfile — Your Model's Shipping Manifest | Slides + voiceover | 6 min | KitOps/CNCF/ORAS, the Kitfile format, and what `kit pack` produces |
| 4 | Selective Pull and Multi-Registry Portability | Slides + voiceover | 5 min | `--filter` pulls only the layer you need; the same command works on any registry |
| 5 | ModelKit vs a Plain Container Image | Slides + voiceover | 4 min | Why `COPY model.gguf /app/` breaks down at scale |
| 6 | Module 4 Summary and Lab Bridge | Talking head | 2 min | Recap plus what you're about to pack, push, and pull in the lab |

## Video 1: Module 4 Introduction — Why Your Model Needs a Shipping Manifest

**Format:** Talking head
**Estimated duration:** 2 minutes
**Learning objective:** By the end, learners can explain why raw model files are hard to hand off, and what a ModelKit fixes.

### Narration script

Hello and welcome back. In the last module, you got a model actually serving requests. Now you have a working model, and you would want to hand it to someone else, a teammate, a CI pipeline, or a Kubernetes job running on a completely different machine. And here's a question worth asking. How do you actually do that, without everyone reassembling the same files by hand, over and over again?

Let's say you've trained or downloaded a model, you have a system prompt that goes with it, maybe a quantization config too. The old way of sharing this is a shared drive, or a Slack message with a link, or an `scp` to some GPU box, along with a README that says "don't forget to also grab the prompts file." Every single person who receives it has to put the right pieces back together by hand. And versions drift. Weights from one experiment can quietly end up paired with a prompt from a completely different one.

That is exactly the problem this module solves. You're going to learn about the ModelKit, which is nothing but a signed, versioned bundle that packs your model weights, your config, and your prompts into one artifact that any container registry already knows how to store and move around. By the end of this module, you'll be able to pack a model into a ModelKit, push it to a registry, and pull back only the piece you actually need, without touching a multi-gigabyte file you don't.

### Suggested visuals / slide beats

1. Title card: "Packaging Models as OCI Artifacts"
2. Split visual: scattered files (weights, prompt, config) with arrows going to different destinations, labeled "the old way"
3. Same files converging into one sealed, labeled box — the ModelKit
4. Closing card previewing the lab: pack → push → pull → selective pull

---

## Video 2: OCI Artifacts — Why a Container Registry Can Also Store Your Model

**Format:** Slides + voiceover
**Estimated duration:** 5 minutes
**Learning objective:** By the end, learners can describe an OCI artifact as a layered blob store with a manifest, and explain why a model fits that format.

### Narration script

Let's start with a question. Why would you even use a container registry, the same kind of registry that stores your application images, to store a machine learning model? The model isn't a container. It doesn't run by itself. So why does it belong there at all?

Well, the answer comes down to what a container image actually is under the hood. OCI, which is the Open Container Initiative, originally standardized container images. But if you strip away the word "container" for a moment, what OCI really defines is much simpler. It's a layered blob store with a manifest. That is, a stack of byte blobs, plus one document that lists every one of them. A layer, in this sense, is nothing but any stream of bytes plus a SHA-256 digest, which is just a fingerprint for those bytes. And the manifest declares what layers exist, what type each one is, and it signs the whole thing. Every registry, GHCR, Docker Hub, Quay, Harbor, already understands this format natively.

Now, a container image happens to use this layering for the operating system, the application code, and the config. But an OCI artifact can use that exact same mechanism for any kind of content at all. A Helm chart, a WASM module, a software bill of materials, or, and this is the part that matters to us, a model checkpoint.

So why is a model such a natural fit for this? Let's line it up side by side with a normal container image. Where a container image has a base OS layer, a ModelKit has the model weights, which is the heavy base. Where a container image has an app layer, a ModelKit has the code, that is, the inference scripts. And where a container image has a config layer, a ModelKit has the Kitfile, the manifest, along with the prompts and any dataset references.

And here's why that layering actually pays off in practice. Because each of these is a separate layer, registries can deduplicate across versions. Let's say you retrain a model, but you only change the prompt config. The weights layer is already sitting in the registry from before, so only the small config layer gets pushed again. And pulling works the same way in reverse. You only grab what actually changed.

### Suggested visuals / slide beats

1. Divider: "OCI Artifacts"
2. Diagram: layered blob store — stack of labeled blobs with a manifest document pointing at each one
3. Side-by-side comparison table: container image layers vs ModelKit layers (base OS / weights, app / code, config / Kitfile+prompts+datasets)
4. Diagram: two versions of a ModelKit sharing an identical weights layer, only the config layer differs

---

## Video 3: KitOps, ModelKit, and the Kitfile — Your Model's Shipping Manifest

**Format:** Slides + voiceover
**Estimated duration:** 6 minutes
**Learning objective:** By the end, learners can describe what KitOps and ORAS do, name the four ModelKit layer types, and read a Kitfile.

### Narration script

So we know models can live as OCI artifacts. Now let's look at the actual project that makes this real, which is KitOps.

KitOps is a CNCF project, that is, it's hosted by the Cloud Native Computing Foundation, the same group that hosts Kubernetes. And KitOps defines two things. It defines the ModelKit format, and it defines the `kit` command line tool that packs and pushes that format. A ModelKit, once you pack one, is an OCI artifact whose layers each carry a type. There are four of them. First is the model layer, which holds the actual weight files, your `.gguf` or your `.safetensors` file. Second is the code layer, which holds inference scripts, prompt files, and adapters. Third, optionally, is a datasets layer, for training or evaluation data. And fourth, also optional, is a docs layer, for a README, model cards, or licenses.

Now, how does `kit` know which local file goes into which layer? That's the job of the Kitfile. Think of the Kitfile as your shipping manifest. It's a small YAML file that sits at the root of your model workspace, and it describes the package: its name, its version, its authors, and which local files map to which layer type. Here's the one you're going to write yourself in the lab.

[Slide: Kitfile YAML — `manifestVersion`, `package`, `model`, `code`]

You'd set `manifestVersion` to "1.0.0", which is just the schema version for KitOps. Under `package`, you'd give it a name, a version, and its authors, and that becomes the metadata you'd actually see in the registry UI. Under `model`, you'd point to the path of your weights file, and that becomes the model-typed layer. And under `code`, you'd list your source files, like a prompts file, and each one becomes a code-typed layer.

Once that Kitfile is in place, you would run `kit pack . -t` followed by a reference. And here's what happens when you do. `kit` reads the Kitfile, it hashes each file into a layer blob, it writes a manifest, and it stores everything in a local kit store, which behaves a lot like Docker's local image cache.

And under the hood, `kit` isn't reinventing the registry protocol. It uses something called ORAS, or also called as OCI Registry as Storage, which is a CNCF library that lets any language push and pull typed OCI artifacts to any compliant registry. And that is exactly why a ModelKit works the same way whether you're pushing to Docker Hub, GHCR, Quay, Harbor, or even a bare `registry:2` container. They all speak the same OCI distribution API underneath.

Now, you might be wondering, doesn't Docker already have something like this? And you'd be right to wonder, because Docker Desktop, from version 4.40 onward, does have a `docker model package` command that also packs a GGUF file into an OCI artifact. So what's actually different? The real difference is ecosystem scope. `docker model package` requires Docker Desktop and targets Docker Hub primarily, and it packs everything into a single model blob, with no selective pull. KitOps, on the other hand, works with `kit`, which runs anywhere, targets any OCI registry, keeps model, code, datasets, and docs as separate typed layers, and supports selective pull. And it integrates with the wider CNCF ecosystem, tools like Flux, Harbor, and Argo. So if you want portability across registries and runtimes, say, pulling into Kubernetes with Flux, or distributing into an air-gapped Harbor deployment, the CNCF path is the one you'd pick.

### Suggested visuals / slide beats

1. Divider: "KitOps and the Kitfile"
2. Diagram: ModelKit split into its four typed layers (model, code, datasets, docs)
3. Kitfile YAML on screen, annotated field by field as narrated
4. `kit pack` flow: workspace files → hashed layers → manifest → local kit store
5. Comparison table: KitOps ModelKit vs `docker model package`

---

## Video 4: Selective Pull and Multi-Registry Portability

**Format:** Slides + voiceover
**Estimated duration:** 5 minutes
**Learning objective:** By the end, learners can explain what selective pull does, when to use `--filter`, and how the same `kit` commands target different registries.

### Narration script

Now here's the part where all this layering actually pays off for you, and it's called selective pull.

Let's say a warehouse stores books by chapter instead of by whole volume. And let's say you only need chapter three. You'd ask for just that chapter, and you wouldn't have to wait for the rest of the book to be couriered over from the shelf, because the catalogue, which is nothing but the manifest, tells the warehouse exactly which box holds chapter three. That's selective pull, and in KitOps, the `--filter` flag is what does it.

[Slide: `kit unpack <ref> --filter=model -d ./weights-only`]

Run that command, and you'd pull only the model weights layer, skipping the code and the datasets entirely. And the filter types available are model, code, docs, datasets, and prompts.

So when would you actually reach for this? Three situations come up a lot. First is a serving node. A serving node only needs the model layer. It has no use for training datasets or eval scripts, so it would pull `--filter=model` and nothing else. Second is a data science notebook. Or maybe it just needs the datasets layer, for analysis, without downloading the weights at all. And third are CI pipelines, which would pull only the code layer, just to lint and test the inference scripts. And when your ModelKit includes a multi-gigabyte model sitting alongside separate dataset layers, this can save you gigabytes on every single pull.

Now let's talk about the second payoff, which is portability. Because a ModelKit is a standard OCI artifact, `kit push` targets any OCI-compliant registry using exactly the same command syntax. GitHub Container Registry, Docker Hub, Quay.io, a private Harbor deployment, or even a local `registry:2` container for development, they all take the same `kit push` and `kit unpack` commands, you'd just change the reference string. The one exception is `--plain-http`, which you'd add for HTTP-only registries, like your local dev setup or an air-gapped environment. Every other target uses TLS by default.

### Suggested visuals / slide beats

1. Divider: "Selective Pull"
2. Illustration: warehouse shelving books by chapter, one chapter being pulled out while the rest stay on the shelf
3. Three-row diagram: serving node → model only, notebook → datasets only, CI pipeline → code only
4. Divider: "Multi-Registry Portability"
5. Table: registry targets (GHCR, Docker Hub, Quay, Harbor, local registry) with the same `kit push`/`unpack` command pattern

---

## Video 5: ModelKit vs a Plain Container Image

**Format:** Slides + voiceover
**Estimated duration:** 4 minutes
**Learning objective:** By the end, learners can list the structural problems with `COPY model.gguf /app/` and explain why a ModelKit is a distribution mechanism, not an execution mechanism.

### Narration script

Here's a question you might already be asking. A plain container image can technically hold a model file too, right? You've probably seen a team do `COPY model.gguf /app/` and call it done. So why go through all of this?

Well, that approach runs into real structural problems. Let's walk through four of them. First, you can't skip layers. Docker pulls the entire image, every single time, and there's no `--filter` for an individual `COPY` layer. Second, there are no layer types. A registry treats every layer as plain bytes with no meaning attached to it, so a CI tool can't ask for "just the model" without someone writing custom logic to find it. Third, images are meant to run. An OCI image carries a container config, an entrypoint, environment variables, a user, and so on. A plain image that holds only a GGUF file wastes space on all of that metadata, and it would confuse any tooling that expects a runnable image. And fourth, deduplication happens by accident, not by design. If your model file sits in one layer and gets shared across tags, Docker would deduplicate it, sure, but only if you've arranged your Dockerfile carefully, and you're hoping nothing else changes that layer later. A ModelKit makes this explicit instead of accidental.

So here's the key part to remember. A ModelKit uses OCI to move files around, not to run them. That is, it's a distribution mechanism, not an execution mechanism. The weights themselves are never "run" as a container. They get unpacked to a directory, and then a separate runtime, `llama.cpp`, or vLLM, or Ollama, loads them from there. And that runtime is the piece that gets containerized on its own.

### Suggested visuals / slide beats

1. Divider: "ModelKit vs a Plain Image"
2. Four-row checklist: skip layers (no), layer types (no), runnable metadata (wasted), deduplication (accidental) — each crossed out for a plain image
3. Diagram: ModelKit unpacked to a directory, a separate runtime container loading the weights from that directory

---

## Video 6: Module 4 Summary and Lab Bridge

**Format:** Talking head
**Estimated duration:** 2 minutes
**Learning objective:** By the end, learners can recap what a ModelKit is for and know exactly what they're about to do in the lab.

### Narration script

So let's bring this all together. You've learned why models belong in OCI registries, using the same layered blob-plus-manifest format that already runs every container image. You've learned what a ModelKit is, a signed bundle with typed layers for model, code, datasets, and docs. You've learned how the Kitfile describes that bundle, and how `kit pack` turns it into real layers. You've learned how `--filter` gives you selective pull, so a serving node never has to download a training dataset it doesn't need. And you've learned why the same `kit push` and `kit unpack` commands work identically across GHCR, Docker Hub, Quay, Harbor, or a local registry.

Now it's time to prove all of that yourself. In the lab, you're going to pack SmolLM2-135M-Instruct, in GGUF format, along with a prompts file, into a ModelKit. You'll push it to a registry, pull it into a clean directory to prove it's actually portable, and then you'll run a selective pull, grabbing just the model layer, and see for yourself how much it saves. Let's go.

### Suggested visuals / slide beats

1. Recap slide: the six-row summary table (Why OCI, ModelKit, Kitfile, KitOps/CNCF, Selective pull, Multi-registry)
2. Closing card: "Lab: pack → push → pull → selective pull" with the SmolLM2-135M-Instruct filename

---

## Coverage map

| Source idea | Video | Treatment |
|-------------|-------|-----------|
| Problem with loose model files, shipping-manifest analogy | 1 | Explained |
| ModelKit definition | 1, 2 | Explained |
| OCI = layered blob store + manifest | 2 | Explained |
| Container image layer vs ModelKit layer comparison | 2 | Explained |
| Deduplication across versions | 2 | Explained |
| KitOps / CNCF, `kit` CLI | 3 | Explained |
| Four ModelKit layer types (model/code/datasets/docs) | 3 | Explained |
| Kitfile fields (manifestVersion, package, model, code) | 3 | Explained |
| `kit pack` mechanics | 3 | Explained |
| ORAS | 3 | Explained |
| KitOps ModelKit vs `docker model package` comparison | 3 | Explained |
| Selective pull, warehouse-by-chapter analogy | 4 | Explained |
| `--filter` flag and filter types | 4 | Explained |
| Selective-pull use cases (serving, notebooks, CI) | 4 | Explained |
| Multi-registry table (GHCR, Docker Hub, Quay, Harbor, local) | 4 | Explained |
| `--plain-http` | 4 | Explained |
| ModelKit vs plain container image (4 problems) | 5 | Explained |
| Distribution mechanism vs execution mechanism | 5 | Explained |
| Summary table | 6 | Explained |
| Lab bridge (pack/push/pull/selective-pull SmolLM2-135M) | 6 | Explained |

## Verification flags

- "Docker Desktop 4.40 and later" for `docker model package` — version-dependent, confirm still accurate against current Docker Desktop release notes before recording.
- Registry command syntax examples (`ghcr.io/<org>/<repo>:<tag>` etc.) — confirm unchanged against each registry's current docs.
