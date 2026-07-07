# Module 8 — Securing & Governing AI Workloads · Explainer Deck Sequence

A 13-slide black-and-white reveal.js explainer deck (`08-security.html`) that walks a learner
through securing and shipping a containerized agent before the hands-on lab. It matches the course
template (`00-introduction.html`) verbatim in head, SVG defs, and Reveal init — only the `<section>`
slides are authored here. Style is hand-drawn Kalam, ink `#1e1e1e` / gray `#757575`, no color.

Course: *Containers for GenAI & Agentic AI — The Open-Source Way* · Gourav Shah · School of DevOps & AI.

---

## Slide table

| # | Page tag | Title | Concept | Visual |
|---|----------|-------|---------|--------|
| 1 | M8·01 | Securing & Governing AI Workloads | Title / module framing | Sealed shipping container with a check-mark seal badge |
| 2 | M8·02 | What you'll learn | Six module outcomes | Six numbered rows |
| 3 | M8·03 | An agent is a security surface | Motivating problem | Agent at center, four unguarded exposures fanning out |
| 4 | M8·04 | Three things every shipped product needs | Core analogy | Ingredients label · health inspection · tamper seal → SBOM · scan · sign |
| 5 | M8·05 | The supply-chain pipeline | Centerpiece flow | Source→Build→SBOM→Scan→Gate→Sign→Registry→Verify, with blocked branch |
| 6 | M8·06 | Two scanners disagree — that's the feature | Trivy + Grype triage | Image splits to two scanners, merges into a triage box |
| 7 | M8·07 | Cosign: the tamper-evident seal | Signing & verify | Sign→Registry→Verify with policy-gate on deploy |
| 8 | M8·08 | Sandbox: a box with no blast radius | Sandboxing / gVisor / ToolHive | Isolated box inside host, barred exits, resource caps |
| 9 | M8·09 | Hardening the agent image | Hardening checklist | Six checked rows |
| 10 | M8·10 | Guardrails at the model boundary | Input/output guardrails + HITL | Input→Model→Output→Human pipeline |
| 11 | M8·11 | Lightweight eval — smoke test for behavior | Evals + tracing | Three dimensions (safety/quality/scope) all PASS |
| 12 | M8·12 | Governance without a vendor | Governance as policy gate | Four questions → policy gate → permit / deny |
| 13 | M8·13 | Trust is a pipeline, not a promise | Closing + lab lead-in | Build→Scan→Sign→Serve CI pipeline, sealed output |

---

## Recommended presentation order

Present in file order (1 → 13). The deck follows the lesson's own arc:

1. **Frame & motivate (1–3):** title, outcomes, then *why* — an agent that runs tools and generated
   code is an exposed surface. Land the problem before any tool names.
2. **The analogy, then the pipeline (4–5):** slide 4 is the conceptual spine (label / inspection /
   seal). Slide 5 is the centerpiece — spend the most time here; the whole module hangs off this flow.
   Return to slide 5 mentally after every later slide.
3. **Zoom into three pipeline stages (6–7):** scanning (why two scanners) and signing (why key vs
   keyless). These expand two boxes from slide 5.
4. **Runtime hardening (8–9):** sandbox for untrusted code, then hardening the agent image itself.
   Stress the distinction: sandbox = throwaway box for code you don't trust; hardening = the image you do.
5. **Model boundary & measurement (10–11):** guardrails + human-in-the-loop, then evals + tracing.
6. **Govern & close (12–13):** governance as four enforced answers, then the CI pipeline that ties it
   all together and leads into the lab.

Tip: on slide 5, walk the arrows physically — pause at the Gate diamond to make the "scan before sign"
rule concrete, then trace both the clean branch (down) and the blocked branch (dashed, right).

---

## Gemini image-generation briefs

A few hero concepts read better as a photographed or richly illustrated scene than as a sketch. These
are optional enhancements; the Mermaid/SVG sketches already carry the baseline.

### Brief 1 — The food-factory analogy (slide 4)
> A clean, editorial black-and-white illustration of a single supermarket ready-meal package on a
> conveyor belt, shown at three stations left to right: at the first a printed ingredients label is
> being applied, at the second a white-coated inspector holds a clipboard and magnifier over it, at
> the third a wax tamper seal is pressed onto the lid. Minimal, high-contrast line-art style, generous
> white space, no text. The three stations should feel like one continuous assembly line. Purpose:
> visually cement SBOM = label, scan = inspection, signature = seal.

### Brief 2 — Sandbox with no blast radius (slide 8)
> A minimalist black-and-white technical illustration of a small sealed glass box sitting inside a
> larger workshop, with a stick of dynamite or a small controlled spark going off *inside* the box —
> the blast fully contained by the glass walls, the surrounding workshop untouched. Thin cut/blocked
> cables lead out of the box to a network jack and a hard drive, each severed. Sketchy, hand-drawn feel,
> only black strokes on white, no color, no text. Purpose: convey ephemeral, network-cut, capability-
> dropped code execution with zero blast radius.

### Brief 3 — Trust is a pipeline (slide 13)
> A wide black-and-white line drawing of a four-station factory pipeline — build, scan, sign, serve —
> with a container image traveling along a belt through each station and emerging at the end stamped
> with a bold wax seal and a check mark. A small gatekeeper figure stands between "scan" and "sign",
> refusing a defective image and waving the clean one through. Hand-drawn, whiteboard aesthetic, black
> ink on white, no color, no text. Purpose: the closing image — security is a gated pipeline, not a
> promise bolted on at the end.

---

## Coverage check — every lesson concept maps to a slide

| Lesson concept (lesson.md section) | Slide(s) |
|---|---|
| Analogy: ingredients label / health inspection / tamper seal (§1) | 4 |
| Supply-chain pipeline: build→SBOM→scan→gate→sign→registry→verify (§2) | 5, 13 |
| SBOM with Syft — SPDX-JSON, audit artifact (§3) | 4, 5 |
| Vulnerability scanning: Trivy + Grype disagree, triage by fixable+severity (§4) | 6 |
| Scan gate — scan before sign, sign not if scan fails (§2, §4) | 5 |
| Signing with Cosign: key-based vs keyless OIDC, verify closes the loop (§5) | 7 |
| Policy engine refuses unsigned images on deploy (§5) | 7, 12 |
| Sandboxing agent/tool/generated code — ephemeral locked-down container (§6) | 8 |
| gVisor (user-space syscall interception) + ToolHive (per-MCP isolation) (§6) | 8 |
| Image hardening checklist: non-root, read-only, cap-drop, no-new-privs, caps, secrets, health (§7) | 9 |
| Input & output guardrails at the model boundary (§8) | 10 |
| Human-in-the-loop / reviewer blocks destructive commands (§8) | 10 |
| Lightweight eval: safety / quality / scope, 3 cases each, in CI (§8) | 11 |
| Tracing / observability (§8, lab) | 11 |
| Governance without a vendor — four enforced answers (§9) | 12 |
| CI pipeline build→scan→sign→serve in GitHub Actions (§2, lab §8) | 5, 13 |
| Motivating framing: agent as security surface (implicit, §6 intro) | 3 |

All nine lesson sections plus the lab's CI-pipeline emphasis are covered. No concept is orphaned; the
supply-chain pipeline (the module's spine) is reinforced on three slides (4, 5, 13).
