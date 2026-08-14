# Module 8 — Securing & Governing AI Workloads

## Recommended video structure

| # | Video title | Format | Estimated duration | Central idea |
|---|-------------|--------|--------------------|--------------|
| 1 | Module 8 Introduction — Why Your Agent Image Needs a Supply Chain | Talking head | 2 min | Shipping an agent image with no checks is shipping a black box; this module closes that gap |
| 2 | SBOM and Vulnerability Scanning — The Ingredients Label and the Health Inspection | Slides + voiceover | 6 min | Syft catalogs every package, two scanners triage by fix-availability and severity |
| 3 | Signing With Cosign — The Tamper-Evident Seal | Slides + voiceover | 5 min | Key-based vs keyless signing, and why the scan gate has to run before the sign |
| 4 | Sandboxing and Hardening — Locking Down the Container Itself | Slides + voiceover | 6 min | Ephemeral no-network sandboxes for generated code, plus a hardening checklist for the agent image |
| 5 | Guardrails, Evaluation, and Governance Without a Vendor | Slides + voiceover | 5 min | Input/output guardrails, a lightweight CI eval, and governance as four documented questions |
| 6 | Module 8 Summary and Lab Bridge | Talking head | 2 min | Recap plus what you're about to run: Syft, Trivy, Grype, and Cosign against the M6 image |

## Video 1: Module 8 Introduction — Why Your Agent Image Needs a Supply Chain

**Format:** Talking head
**Estimated duration:** 2 minutes
**Learning objective:** By the end, learners can explain what an agent image is missing without SBOM, scanning, and signing, and what this module adds.

### Narration script

Hello and welcome back. In the last module, you built a crew of agents that plan, act, and review each other's work. Now think about what happens when you actually ship that crew as a container image, out to a registry, and then down to a production host. What do you actually know about what's inside that image?

Let's say you're a food manufacturer, and you're shipping a ready meal out to thousands of supermarkets. Before it ever leaves your factory, three things happen, and they happen because the law and the customer both demand it. An ingredients label goes on every pack, so anyone can check what's inside. A health inspector checks a sample batch for contaminants, and rejects anything over the threshold. And a tamper-evident seal goes on the lid, so a broken seal tells you the product was touched after it left the factory.

Now compare that to shipping an agent image with none of those three checks. Nobody knows what packages are actually inside it. Nobody has checked whether any of those packages carry a known vulnerability. And nobody can tell, once that image has travelled through a registry and landed on a production host, whether it's even the same image that was built and tested.

That is exactly the gap this module closes. You're going to learn how an SBOM works as the ingredients label, how a vulnerability scan works as the health inspection, and how a cryptographic signature works as the tamper-evident seal. And beyond the image itself, you'll also learn how to sandbox any code your agent generates, harden the container it runs in, and put guardrails around what goes in and out of the model. By the end, you'll be able to look at any agent pipeline and know exactly what's checked, what's signed, and what's still exposed.

### Suggested visuals / slide beats

1. Title card: "Securing & Governing AI Workloads"
2. Three-panel illustration: ingredients label, health inspector's clipboard, tamper-evident seal — each labeled with its AI-supply-chain counterpart (SBOM, scan, signature)
3. Closing card previewing the lab: Syft, Trivy, Grype, Cosign against the M6 crew image

---

## Video 2: SBOM and Vulnerability Scanning — The Ingredients Label and the Health Inspection

**Format:** Slides + voiceover
**Estimated duration:** 6 minutes
**Learning objective:** By the end, learners can explain what an SBOM captures, why two scanners disagree, and how to triage a finding by fix-availability and severity.

### Narration script

Let's start with the ingredients label, which is nothing but the SBOM, or software bill of materials.

A tool called Syft, from Anchore, looks inside your container image and catalogs every single package it finds. Debian debs, Python wheels, Go binaries, npm modules, all of it, into one standard format. The format you'd actually want here is SPDX-JSON, which is an open standard that any security tool downstream already knows how to read. Run it against an image and you'd get back something like ninety-six packages, listed out in SPDX 2.3 format, covering Debian debs, Python packages, and binaries all together.

Now, why bother generating this as its own separate step? A couple of reasons. One, your scanners can actually read it directly, instead of building their own catalog from scratch every time. Technically you could skip this and let each scanner regenerate that catalog internally, but pulling it out on its own means you get to park it right next to the image, in the registry, as a permanent record. And two, it becomes your audit trail, the one document that answers a question a regulator or your own security lead is bound to ask sooner or later: what is actually running inside this thing?

Now here's something that trips people up the first time they see it happen. Point two different vulnerability scanners at the identical image, and you'll walk away with two different lists of findings. That's not a bug in either tool. Each scanner maintains its own advisory feed, pulled from its own vendor, and those feeds get built and matched a little differently. Trivy comes from Aqua Security, Grype comes from Anchore, and it's completely normal for one to flag a package version the other waves through clean.

So here's the working rule, learnt directly from running this against a real image, not from a textbook. You'd run more than one scanner, and then you'd sort findings by two questions: is a fix actually available, and how bad is the finding. Say a Critical shows up and the base image's own repository already carries a patched version — that's an easy call, you'd fix it immediately. Say a High shows up with nothing upstream to patch it yet — that goes on your tracking list, but it doesn't have to freeze your deployment forever, especially once you've got other controls reducing the actual risk.

Let's spell out that full decision path. Critical or High, and a fix exists: rebuild against the patched base, bump that one package, and scan again. Critical or High, and nothing to patch yet: you'd reduce the exposure some other way, say a network policy or a sandbox, and you'd write down that the risk was accepted on purpose. Medium and lower: note it in your SBOM, revisit it on a schedule, and let CI keep moving.

And that decision path is exactly what the scan gate automates for you. Inside the GitHub Actions pipeline, one config line, `exit-code: '1'`, tells the build to stop dead the moment a Critical or High finding shows up. Get your base image down to zero fixable highs, and that same pipeline just sails through.

### Suggested visuals / slide beats

1. Divider: "SBOM and Vulnerability Scanning"
2. Diagram: container image → Syft → SPDX-JSON package list (Debian/Python/Go/npm icons feeding into one document)
3. Two-scanner diagram: same image, Trivy and Grype running in parallel, producing overlapping-but-different finding sets
4. Triage flowchart: Critical/High+fix → rebuild; Critical/High+no-fix → mitigate+document; Medium/below → log+reschedule
5. Scan-gate slide: pipeline stage failing red on a Critical finding, passing green once clean

---

## Video 3: Signing With Cosign — The Tamper-Evident Seal

**Format:** Slides + voiceover
**Estimated duration:** 5 minutes
**Learning objective:** By the end, learners can explain what Cosign signs, when to use key-based vs keyless signing, and why the scan must run before the sign.

### Narration script

Now let's put the tamper-evident seal on the package, which is exactly what Cosign does.

Cosign, from the Sigstore project, attaches a cryptographic signature to a container image sitting in a registry. And once that signature is there, anyone downstream, be it a Kubernetes admission controller, a deploy script, or an actual human reviewer, can verify that the image they're about to run is the exact same artifact that passed through your supply chain, signed by the key you'd expect.

There are two ways to sign, and you'd pick between them based on where you are. The first is key-based signing. You'd generate a key pair yourself, and then sign with `cosign sign --key cosign.key`. This is the right choice for local development, for an air-gapped environment, or for the lab you're about to run, because you can actually see the key files and understand the mechanics before any automation hides them from you. The second is keyless signing, using OIDC, which is the right default inside GitHub Actions or any CI system that supports it. You'd just run `cosign sign --yes`, and the identity gets pulled from the workflow's own OIDC token. Sigstore's Fulcio certificate authority binds that identity to the signature. And the payoff is real: you don't manage a key, you don't rotate anything, and there's no private key sitting in your repo waiting to leak.

And there's one more piece that closes the whole loop: verification. Run `cosign verify --key cosign.pub`, point it at your image reference, and if the check passes, Cosign will tell you plainly that it confirmed those signatures against that exact public key. Now push this to deploy time. A policy engine sitting in front of your cluster, be that OPA Gatekeeper, Kyverno, or a plain pre-deploy script you wrote yourself, can run that identical verify check automatically, and simply refuse to pull anything that isn't signed by the key it's expecting.

Now, here's the one rule that matters more than any of the mechanics. Signing always comes after a clean scan, never before it, and never instead of it. Skip that ordering, and a pipeline that builds, signs, and pushes an image is really just handing out an official stamp of approval on top of whatever vulnerabilities happen to be sitting inside. A signature only proves the image wasn't touched after it left the build. It tells you nothing about whether that image was safe to build in the first place. Catching that is the scanner's job, and it has to go first, every time.

### Suggested visuals / slide beats

1. Divider: "Signing With Cosign"
2. Diagram: signed image in a registry, with an admission controller, a deploy script, and a human reviewer all independently verifying it
3. Two-column comparison: key-based signing (local/lab) vs keyless OIDC signing (CI), each with its command
4. Pipeline diagram from the lesson's mermaid flow, highlighting the scan-then-sign order with the "blocked" branch shown in red

---

## Video 4: Sandboxing and Hardening — Locking Down the Container Itself

**Format:** Slides + voiceover
**Estimated duration:** 6 minutes
**Learning objective:** By the end, learners can describe an ephemeral locked-down sandbox, name the deeper-isolation tools, and list the hardening controls for the agent's own image.

### Narration script

So far, everything we've covered protects the image before it ships. Now let's talk about what protects you while the agent is actually running, starting with sandboxing.

Take the Fixer from your M7 crew as an example. All it does is propose a command for something else to run. Now push that idea further: imagine an agent that writes its own Python on the spot, say to dig through logs or reshape some data. Handing either of those straight to the host, running with the same privileges the agent itself has, is exactly how a small mistake turns into a big one.

The pattern you'd reach for here is a throwaway container that you build for one job and then delete. No network access, a filesystem it can't write to, every single Linux capability stripped away, a hard cap on how many processes it can spawn, and a memory limit sitting on top of all of that. You'd run it with flags like `--network none`, `--read-only`, `--cap-drop ALL`, `--security-opt no-new-privileges`, a `--pids-limit`, and a `--memory` cap. And you can actually verify this isolation yourself, not just take it on faith. A network request from inside that sandbox would fail immediately, with an error saying the network is unreachable. Any attempt to escalate privileges would fail silently. And because you throw the container away after one use, it can never build up state, and it can never carry a compromise forward into the next run.

Now, for deeper isolation than that, two more tools build on top of this same pattern. gVisor swaps out the Linux kernel's own syscall surface for a user-space layer that intercepts every call. So even if the sandboxed code somehow finds and exploits a real kernel vulnerability, it hits gVisor's interceptor first, never the host kernel underneath. And ToolHive takes the same idea and applies it to your MCP tools. Say you're offering web search, a code interpreter, and file access. ToolHive gives each one its own separate container, with its own network rules and its own filesystem boundary. The agent doesn't ever execute a tool inside its own process. It hands the request to ToolHive, ToolHive runs that one tool off in isolation, and only the result comes back.

Now, the sandbox takes care of code you can't fully trust. But your agent's own image needs the same kind of attention too, because that's the piece calling the LLM, holding your credentials, and deciding which tool gets called next. So carry this checklist with you. Give it a non-root user with `USER appuser`. Make its own root filesystem read-only, using `--read-only` or, on Kubernetes, `ReadOnlyRootFilesystem: true`. Strip every capability by default and add back only the couple you genuinely need. Stop privilege escalation with `--security-opt no-new-privileges`. Put a ceiling on memory, process count, and CPU. Keep every secret out of the image entirely, and mount it instead, through Docker secrets, a secret manager's environment injection, or a Kubernetes secret. And wire up health checks too, a `HEALTHCHECK` line in the Dockerfile, plus liveness and readiness probes if you're running on Kubernetes. None of these controls is dramatic on its own, but stack them together and you'd shrink the attack surface enormously, even against a vulnerability someone later finds in one of your Python dependencies.

### Suggested visuals / slide beats

1. Divider: "Sandboxing and Hardening"
2. Illustration: a locked, windowless shipping crate on a factory floor, used once, then discarded — the ephemeral sandbox
3. Layered isolation diagram: sandbox flags → gVisor (kernel interception) → ToolHive (per-tool container isolation)
4. Seven-row hardening checklist table (least privilege, read-only rootfs, drop caps, no-new-privileges, resource caps, secrets, health checks)

---

## Video 5: Guardrails, Evaluation, and Governance Without a Vendor

**Format:** Slides + voiceover
**Estimated duration:** 5 minutes
**Learning objective:** By the end, learners can distinguish input and output guardrails, describe a lightweight eval, and list the four questions that make up governance.

### Narration script

Everything up to now protects the infrastructure, the image and the container it runs in. Guardrails protect a different boundary: the model itself, meaning what goes in, and what comes back out.

Input guardrails screen a user's query before it ever reaches the model, checking for prompt injection, jailbreak attempts, and questions that are simply out of scope. The pattern you already saw back in Module 6 is the right default here too: a small classification call, right at the start of the pipeline. It adds one extra inference call, which is cheap on a small model, and it stops the most common abuse attempts before they ever get near your main model.

Output guardrails work the other way around. They screen the model's response before it ever reaches the user, or before it's allowed to trigger some downstream action. In your incident crew, the Reviewer is already acting as an output guardrail. Remember, it blocks destructive commands before they run. For a customer-facing agent, you'd want an output guardrail doing more than that too, checking for leaked personal information, hallucinated URLs, and anything off-brand.

Now, how do you actually know your guardrails and your agent are working? That's what evaluation is for. A lightweight eval runs a small set of labeled test cases through your full pipeline, and checks three things. Does the agent refuse prompt-injection attempts? That's safety. Does it answer in-scope questions correctly? That's quality. And does it decline out-of-scope questions gracefully, instead of either answering wrongly or failing badly? That's scope control. And here's the part worth remembering: just three cases per dimension, run in CI on every single push, is enough to catch a regression before it ever reaches production.

Let's close with governance, because the word itself sounds like it needs a vendor product behind it. It doesn't. Governance for an agent workload is just the documented, enforced answer to four questions. What may the agent reach? That's your network egress rules, whether that's a Kubernetes NetworkPolicy, a container `--network` flag, or a sandbox with no network at all. What credentials may it use? That's scoped service accounts and a secrets manager, never anything baked into the image. Which MCP tools are enabled? That's ToolHive's per-server isolation policy, alongside an explicit tool allowlist. And who approved this deployment? That's the signed image, the CI pipeline that ran the scan gate, and the Git commit that triggered the whole thing. Put your answers to those four questions in a YAML policy file, enforce them with open tools like OPA, Kyverno, or ToolHive, and you've built governance without buying anything. And notice what you already have sitting around from earlier in this module — the SBOM, the scan results, the signature — that's precisely the paper trail an auditor would need to answer that fourth question, without you having to build a single new record for it.

### Suggested visuals / slide beats

1. Divider: "Guardrails, Evaluation, and Governance"
2. Diagram: query flow with an input guardrail before the model and an output guardrail after it, each with example catches
3. Three-check eval diagram: safety, quality, scope control, each with a small labeled test-case icon
4. Four-question governance diagram: reach / credentials / tools / approval, each mapped to its enforcing mechanism

---

## Video 6: Module 8 Summary and Lab Bridge

**Format:** Talking head
**Estimated duration:** 2 minutes
**Learning objective:** By the end, learners can recap the full supply chain and know exactly what they're about to run in the lab.

### Narration script

So let's bring this all together. You've learned how Syft builds an SBOM, the ingredients label that catalogs every package in your image. You've learned why running two scanners, Trivy and Grype, is a feature and not a bug, and how to triage a finding by whether it's fixable and how severe it is. You've learned how Cosign seals the image with a signature, key-based for the lab, keyless OIDC in CI, and why the scan always has to run before the sign. You've learned how to sandbox any code you don't fully trust, with no network, a read-only filesystem, and every capability dropped, and how gVisor and ToolHive push that isolation even further. You've learned the hardening checklist for the agent's own image. And you've learned how guardrails, a lightweight eval, and four honest governance questions round out the whole picture.

Now it's time to run all of this yourself. In the lab, you're going to run Syft, Trivy, Grype, and Cosign against the M6 agent image. You'll prove network isolation with your own hands, using the sandbox. You'll wire up a guardrail and an eval. And you'll inspect the GitHub Actions pipeline that automates every single piece of this, end to end. Let's go.

### Suggested visuals / slide beats

1. Recap slide: the ten-row summary table (SBOM, scan, signing, scan gate, sandbox, gVisor/ToolHive, hardening, guardrails, eval, governance)
2. Closing card: "Lab: SBOM → scan → sign → sandbox → guardrail → eval" with the M6 agent image name

---

## Coverage map

| Source idea | Video | Treatment |
|-------------|-------|-----------|
| Ingredients-label / health-inspection / tamper-seal analogy | 1, 2, 3 | Explained |
| SBOM via Syft, SPDX-JSON output | 2 | Explained |
| Why two scanners disagree (Trivy vs Grype) | 2 | Explained |
| Triage heuristic (fix-available × severity) | 2 | Explained |
| Scan gate (`exit-code: '1'`) | 2, 3 | Explained |
| Cosign key-based vs keyless (OIDC/Fulcio) signing | 3 | Explained |
| `cosign verify` and policy-engine verification at deploy | 3 | Explained |
| Scan-before-sign rule | 3 | Explained |
| Ephemeral locked-down sandbox (flags + verified isolation) | 4 | Explained |
| gVisor (kernel-level isolation) | 4 | Explained |
| ToolHive (per-MCP-tool isolation) | 4 | Explained |
| Image hardening checklist (7 controls) | 4 | Explained |
| Input guardrails (M6 classification-call pattern) | 5 | Explained |
| Output guardrails (Reviewer as example) | 5 | Explained |
| Lightweight eval (safety/quality/scope, 3 cases each) | 5 | Explained |
| Governance as four documented questions | 5 | Explained |
| Summary table | 6 | Explained |
| Lab bridge (Syft/Trivy/Grype/Cosign against M6 image) | 6 | Explained |

## Verification flags

- `exit-code: '1'` scan-gate syntax — confirm still matches the current GitHub Actions workflow step before recording.
- Cosign keyless/Fulcio OIDC flow details — confirm unchanged against current Sigstore/Cosign docs (this stack moves fast).
- gVisor and ToolHive availability/behavior on this course's target runtime (Rancher Desktop, arm64) — confirm against the lab evidence before claiming parity with the lesson's description.
