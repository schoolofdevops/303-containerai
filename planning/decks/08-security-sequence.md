# Module 8 — Securing & Governing AI Workloads · Explainer Deck Sequence

<!-- CourseSmith sequence spec — authored and approved BEFORE the deck HTML is built.
     Convention: whiteboard-style-guide.md §5. One row per slide; every slide needs
     purpose + visual + takeaway. NO slide-count cap (§0): one idea per slide, every
     lesson concept gets a slide — the coverage table below is a hard gate.

     Round-3 regen note (2026-07-26): this is an ORIGINAL deck (pre-coursesmith, no prior
     spec). The old deck (`site/static/decks/08-security.html`, CDN-loaded reveal.js 4.6.1 +
     Google Fonts, on-slide `p.takeaway` lines) is the approved coverage baseline for
     this spec — every old slide's concept appears below, 13 slides kept 1:1, same
     order, same pagenos. Every old slide already carried its own SVG scene, so no
     slide triggers the round-3 "text-only slide is a defect" rule. -->

<!-- 2026-08-05 divider regen (this pass, coursesmith deck-author contract): the deck grew
     from 13 → 22 slides — 9 numbered section-divider slides were inserted, one per lesson
     `##` header (§1–§9), immediately before that section's first content slide, per
     style-guide §3a. Numbering: dividers are numbered by their position IN THE DECK
     (deck presentation order), which in this module equals lesson document order — every
     content slide already sat in strict §1→§9 order in the pre-divider baseline, so NO
     content-slide reorder was required (unlike 04-packaging and 06-declarative-agent,
     which each needed one reorder to restore strict lesson order).

     ONE EDITORIAL CALL, flagged explicitly per style-guide §3a's rule that any such call
     must be a visible spec row, not a silent decision: lesson §3 ("The SBOM: ingredients
     label for your image") has no dedicated content slide of its own — this gap already
     existed in the pre-divider 13-slide baseline, which folded §3's facts (Syft, SPDX-JSON,
     "feeds the scanners + is the audit artifact") into the §1 analogy slide's "= SBOM
     (Syft)" panel label and, more directly, into the §2 pipeline slide's explicit "SBOM /
     Syft" stage box. Rather than invent a new diagram (content parity only — no new facts,
     diagrams, or scenes), divider 3 is placed immediately after divider 2, both directly
     ahead of the one pipeline slide that visually carries both sections' content (§2 as the
     pipeline overview, §3 as that pipeline's explicit SBOM-stage box). This mirrors the
     04-packaging precedent (a slide's content that only partially matches its divider's
     section, reused rather than duplicated, and logged here rather than hidden).

     SUBTITLES: every `p.s` was rewritten to a ≤10-word / ≤60-char anchoring phrase (old
     subtitles ran 38–86 chars, several full sentences with an em dash). Longest subtitle
     now is 55 chars / 9 words (slide "Different feeds, different CVEs: triage, don't
     average."); none exceed 60 chars or 10 words.

     VOICE + EM DASH: every `h2.t`, `p.s`, and on-slide SVG `<text>` label was run through
     the `gourav-voice` pipeline. Em dashes were stripped from every non-divider
     title/subtitle/label (2 titles: title-slide subtitle, "Two scanners disagree" title,
     "Lightweight eval" title; 5 subtitles; 11 SVG labels — mostly checklist/table-row
     separators switched from " — " to ": "). Divider 4's title is the SOLE exception —
     it keeps its em dash verbatim because the lesson header itself
     ("Vulnerability scanning: two scanners disagree — that is a feature") carries one by
     design. No other divider header contains a dash. Zero unexpected em dashes remain
     anywhere in `h2.t`/`p.s` after this pass (verified by script, see gates).

     Pagenos renumbered M8·01–22 sequentially; verified in a headless-Chrome DOM dump
     (the 23rd "M8·01" hit in a raw dump is reveal.js's own `aria-status` accessibility
     echo of the first slide, outside `<div class="slides">` — not a duplicate pageno). -->

This companion doc maps the 25-slide explainer deck (`site/static/decks/08-security.html`) to
the Module 8 lesson (`site/docs/m8-security/lesson.md`). The deck teaches **concepts**, not
commands — it turns each of the lesson's analogies into a hand-drawn whiteboard visual a
learner walks through before opening the lab, now with a divider slide marking each of the
lesson's nine `##` sections so the deck doubles as a navigable map. The visual language
follows the CourseSmith whiteboard style contract
(`coursesmith/templates/deck/whiteboard-style-guide.md`): Patrick Hand cursive, `#1e1e1e`
primary / `#757575` secondary strokes on white paper with the five semantic pastel fills (§1: green
good · red bad/full · blue data · orange caution · purple meta), the `#rough` wobble filter on
boxes only, and the shared `#ah`/`#ahg` arrowhead markers. The arc moves from exposure to
evidence — an agent is a security surface with four unguarded exposures → the food-factory
analogy (label, inspection, seal) → the supply-chain pipeline that turns those three ideas into
an enforced gate, with the SBOM's own ingredients-label role called out explicitly → the
two-scanners-disagree reality and the triage heuristic → Cosign's tamper-evident seal and its
verify-on-deploy check → sandboxing untrusted/generated code down to zero blast radius →
hardening the agent image itself → guardrails and human review at the model boundary →
lightweight CI evals that prove the guardrails still work → governance as four documented,
enforced answers rather than a vendor product → hand-off to the lab.

## Slide table

| # | Slide | Purpose | Visual | Takeaway |
|---|-------|---------|--------|----------|
| 1 | Securing & Governing AI Workloads (title) | Module framing: harden and ship the crew, the open-source way | title scene: a sealed shipping container carrying the agent, with a tamper-evident seal badge and a caption row (signed · scanned · sandboxed · governed) | credit line: Gourav Shah · School of DevOps & AI |
| 2 | What you'll learn | Preview the six controls this module locks in before the lab | numbered rows (circles 1–6) | by the end, the M7 crew ships through a pipeline that gates on security before it signs |
| 3 | An agent is a security surface | The motivating problem: tools, generated code, credentials, and network are all untrusted by default | fan-out: "Agent / M7 crew" box at center, four unguarded exposures fanning out (runs MCP tools, executes code, reads secrets, calls the network) | every exposure is untrusted by default — one compromised tool call becomes host access if left unguarded |
| 4 | **Divider — "1 · The analogy: ingredients label, health inspection, tamper seal"** | Opens §1 | — (divider) | — |
| 5 | Three things every shipped product needs | The analogy: ship an AI image like a food manufacturer ships a ready-meal | triptych: ingredients label / health inspection / tamper seal, each glossed to SBOM / vuln scan / signature | together they make the image trustworthy, auditable, and verifiable at every hop — laptop to registry to host |
| 6 | **Divider — "2 · The supply chain pipeline"** | Opens §2 | — (divider) | — |
| 7 | The supply-chain pipeline (centerpiece) | Turn the analogy into one enforced pipeline every image passes through, with the SBOM stage called out by name | pipeline with a gate diamond: Source → Build → SBOM → Scan → Gate, clean branch to Sign → Registry → Verify, blocked branch to fix & rebuild | the scan must run before the sign, and the sign must not run if the scan fails |
| 8 | **Divider — "3 · The SBOM: ingredients label for your image"** | Opens §3, now followed by its own SBOM slide | — (divider) | — |
| 9 | SBOM: Syft lists every package | The SBOM stage as its own concept: what it is, what it feeds | agent image → Syft → one SPDX-JSON file (95 packages), fanning out to "feeds the scanners" and "audit artifact" | the SBOM is the ingredients label: it feeds the scanners and is the audit trail |
| 10 | **Divider — "4 · Vulnerability scanning: two scanners disagree — that is a feature"** (em dash verbatim, lesson header) | Opens §4 | — (divider) | — |
| 11 | Two scanners disagree, that's the point | Trivy and Grype catch different CVEs from the same image; triage, don't average | fan-out/converge: one "Agent image" box scanned by two boxes (Trivy, Grype) with different counts (0 Critical / 44 High and 0 Critical / 55 High), converging into a "Triage: fixable + severity" box | fixable Critical/High → rebuild on a patched base; no fix → mitigate & log; Medium → track, don't block CI |
| 12 | Triage: fixable first, then severity | The three-tier triage heuristic, so counts from two scanners turn into actions | finding fanning into three tiers, each with its outcome: rebuild / mitigate and document / log and do not block | fix available → rebuild; no fix → mitigate and document; Medium and below → log, never block CI |
| 13 | **Divider — "5 · Signing: the tamper-evident seal"** | Opens §5 | — (divider) | — |
| 14 | Cosign: the tamper-evident seal | Signing closes the loop: sign in CI, verify before anything runs | pipeline: Cosign sign → Registry (image + signature) → Verify on deploy, with a dashed policy-gate branch down to "valid seal → run · else refuse" | a policy engine (Kyverno, OPA, or a pre-deploy script) refuses any image without a valid signature |
| 15 | **Divider — "6 · Sandboxing agent, tool, and generated code"** | Opens §6 | — (divider) | — |
| 16 | Sandbox: a box with no blast radius | Untrusted/generated code runs in an ephemeral, locked-down container, then is discarded | big-box anatomy: dashed "Host" boundary containing a solid "Sandbox" box with barred exits labelled `--network none`, `--read-only`, `--cap-drop ALL`, `--pids-limit` etc. | deeper isolation: gVisor intercepts syscalls in user space; ToolHive runs each MCP tool in its own box |
| 17 | Deeper isolation: gVisor and ToolHive | The two deeper-isolation tools the sandbox slide only points at | two panels: sandboxed code → gVisor user-space layer → host kernel; agent → ToolHive → three tools each in its own dashed container | gVisor intercepts syscalls before the kernel; ToolHive gives each MCP tool its own container and policy |
| 18 | **Divider — "7 · Hardening the container image"** | Opens §7 | — (divider) | — |
| 19 | Hardening the agent image | The sandbox protects untrusted code; the agent image itself still needs a small attack surface | numbered rows (six checked rows): least privilege, read-only rootfs, drop capabilities, no privilege escalation, resource caps, secrets out + health checks | these controls are additive — even an exploited dependency finds almost nothing to work with |
| 20 | **Divider — "8 · Guardrails and evaluation"** | Opens §8 | — (divider) | — |
| 21 | Guardrails at the model boundary | Supply chain protects the infra; guardrails protect what goes in and comes out | pipeline: Input screen → Model/agent → Output screen → Human approves, each stage glossed with what it catches (injection, PII/off-brand/bad URLs, destructive commands) | reuse M6's guardrail: a cheap classification call in front, and a reviewer that blocks destructive actions |
| 22 | A lightweight eval proves the guardrails work | A handful of labeled cases, run in CI on every push, catches regressions before production | three-panel dimensions (Safety / Quality / Scope) each with a passing check-mark badge, captioned with the CI wiring | you don't ship what you can't measure — a CI eval tells you the guardrails still work |
| 23 | **Divider — "9 · Governance without a vendor"** | Opens §9 | — (divider) | — |
| 24 | Governance without a vendor | Governance is four documented, enforced answers, written in YAML, enforced by open tools | fan-in: four question rows (reach, credentials, tools, approval) feeding a "Policy gate" box with permit/deny outcomes | the SBOM → scan → sign pipeline is the evidence trail that makes "who approved it?" auditable |
| 25 | Trust is a pipeline, not a promise (closing) | Hand off to the lab: run the tools, prove isolation, wire a guardrail + eval, read the CI pipeline | pipeline scene: Build → Scan → Sign → Serve, ending in a checked seal badge, captioned with the GitHub Actions gate | in the lab: run Syft/Trivy/Grype/Cosign, prove sandbox isolation, wire a guardrail + eval; credit + lab hand-off |

<!-- Visual pattern vocabulary used above (reuse before inventing):
     fan-out (2 as numbered rows, 3, 10, 18, 21) · triptych comparison (5) ·
     big-box anatomy (14) · numbered rows (2, 16) · pipeline (8, 12, 18, 22) ·
     three-panel dimensions (19) · fan-in to a gate (21) · dividers (4, 6, 7, 9, 11, 13, 15, 17, 20) -->

## Recommended presentation order

Present strictly 1 → 22; each divider is a scene break for the presenter as much as a map
marker for the learner. Open on the title scene (1) and the six-control preview (2) to set
expectations for the whole module. Slide 3 is the motivating problem — linger on it, because
"every exposure is untrusted by default" is the gap every later slide closes; make sure the
four exposures (tools, code, secrets, network) land before moving on. Divider 4 opens the
food-factory analogy: slide 5 lands it (label, inspection, seal). Dividers 6 and 7 run back to
back — §2 (the pipeline) and §3 (the SBOM stage inside it) both open onto the single pipeline
slide (8); be explicit here that the SBOM box on slide 8 is what §3 is about, and that the
scan-before-sign ordering is the entire point of the pipeline, not an implementation detail.
Divider 9 opens the two-scanners slide (10) and divider 11 opens signing (12) — independent
single-concept sections, normal pace, no special lingering required. Divider 13 opens
sandboxing (14) — a second hinge slide, slow down on the barred-exits list, since it is the
concrete proof learners will reproduce in the lab. Divider 15 opens the hardening checklist
(16) — compressible under time pressure, since it restates the sandbox's controls applied to
the agent image itself; a fast read is fine if slide 14 already landed. Dividers 17 and 20
open the module's second half — guardrails/eval (18–19), then governance (21) — present at
normal pace as independent single-concept sections. Slide 22 hands off to the lab; say the
closing line and stop talking, let the lab do the proving.

## Fragment map

This deck carries no build-ups. Every content slide (2, 3, 5, 8, 10, 12, 14, 16, 18, 19, 21,
22) is presented as a single static, already-complete picture, matching the pre-divider
baseline's construction (no `fragment` classes existed in the original CDN-era HTML). Dividers
are inherently static (title-only, no build-up applicable). This suits the content: slide 8 is
a pipeline diagram meant to be read at a glance with both the clean and blocked branches
visible at once, slide 10 is a converge-then-triage picture that reads better whole, and
14/16/21 are anatomy/checklist/fan-in layouts intended to be read as one complete picture
rather than revealed hop-by-hop. A future revision could fragment slide 8 (Source → Build →
SBOM → Scan → Gate, then the clean/blocked branches) or slide 18 (Input → Model → Output →
Human, one stage at a time) if a presenter wants a build; the current spec keeps parity with
the approved content baseline.

Static slides (all of 1–22): read in full on entry — no reveal-in-steps behavior in this deck.

## Coverage check (HARD GATE — §0)

Every lesson section/concept maps to a slide, and every lesson `##` section (§1–§9) now also
gets its own divider slide (style-guide §3a). Baseline = the pre-divider 13-slide deck (all
content preserved, only structure/wording changed); confirming no orphans against both the
lesson and the prior deck.

| Lesson section / concept | Slide(s) | Notes (analogy used, echoes/forward pointers, divider) |
|---|---|---|
| Module framing / what you'll learn | 1, 2 | title scene (sealed container, signed·scanned·sandboxed·governed caption) + numbered-rows preview of all six learning outcomes — no divider (not a numbered lesson `##` section) |
| Motivating problem — an agent runs tools, may execute generated code, reads credentials, reaches the network, all untrusted by default | 3 | fan-out: Agent/M7-crew box at center, four unguarded exposures fanning out — no divider (not a numbered lesson `##` section) |
| §1 The analogy: ingredients label, health inspection, tamper seal → SBOM, vulnerability scan, image signature | **divider 4** (opens §1), 5 | divider title "1 · The analogy: ingredients label, health inspection, tamper seal" verbatim; slide 5 = triptych: three labelled boxes (ingredients label / health inspection / tamper seal) glossed to Syft / Grype·Trivy / Cosign |
| §2 The supply-chain pipeline — Source → Build → SBOM → Scan → Gate → Sign → Registry → Verify; scan before sign, sign refused if scan fails | **divider 6** (opens §2), 8 | divider title "2 · The supply chain pipeline" verbatim; slide 8 = pipeline with gate diamond; clean branch down to Sign/Registry/Verify, blocked branch to fix & rebuild |
| §3 The SBOM — Syft catalogs every package into SPDX-JSON; feeds the scanners and is the audit artifact | **divider 7** (opens §3), 8 | divider title "3 · The SBOM: ingredients label for your image" verbatim; **no dedicated slide** — carried by slide 8's explicit "SBOM / Syft" stage box (and slide 5's "= SBOM (Syft)" panel gloss); divider 7 sits immediately after divider 6, both directly ahead of slide 8, so the learner sees "this pipeline slide covers §2 and §3" rather than an empty section break — this editorial call is the one place in this deck where a divider does not introduce a slide unique to its own section (flagged explicitly, not silent, per style-guide §3a) |
| §4 Vulnerability scanning — two scanners disagree, that's a feature; triage by fixable + severity | **divider 9** (opens §4, em dash verbatim), 10 | divider title "4 · Vulnerability scanning: two scanners disagree — that is a feature" verbatim including its em dash (the one designed exception to this deck's em-dash-free rule); slide 10 = fan-out/converge: Trivy vs Grype producing different counts (0 Critical / 44 High and 0 Critical / 55 High), converging into a "Triage: fixable + severity" box |
| §5 Signing — Cosign, key-based vs keyless OIDC, verify on deploy, policy engine refuses unsigned images | **divider 11** (opens §5), 12 | divider title "5 · Signing: the tamper-evident seal" verbatim; slide 12 = pipeline: Cosign sign → Registry (image + signature) → Verify on deploy, dashed policy-gate branch |
| §6 Sandboxing agent, tool, and generated code — ephemeral locked-down container, gVisor, ToolHive per-tool isolation | **divider 13** (opens §6), 14 | divider title "6 · Sandboxing agent, tool, and generated code" verbatim; slide 14 = big-box anatomy: dashed Host boundary, solid Sandbox box with barred exits (`--network none`, `--read-only`, `--cap-drop ALL`, `--pids-limit`) |
| §7 Hardening the container image — non-root, read-only rootfs, drop caps, no-new-privileges, resource caps, secrets out, health checks | **divider 15** (opens §7), 16 | divider title "7 · Hardening the container image" verbatim; slide 16 = numbered rows (six checked controls) |
| §8 Guardrails — input screen (injection/out-of-scope), output screen (PII/off-brand/bad URLs), human-in-the-loop on destructive actions | **divider 17** (opens §8), 18 | divider title "8 · Guardrails and evaluation" verbatim; slide 18 = pipeline: Input screen → Model/agent → Output screen → Human approves |
| §8 Evaluation — lightweight eval, three cases per dimension (safety, quality, scope), run in CI, tracing | 19 | same divider 17 (§8 covers both guardrails and evaluation per the lesson's own header); slide 19 = three-panel dimensions (Safety / Quality / Scope), each with a PASS badge, captioned with the CI wiring |
| §9 Governance without a vendor — four documented, enforced answers (reach, credentials, tools, approval), enforced via OPA/Kyverno/ToolHive | **divider 20** (opens §9), 21 | divider title "9 · Governance without a vendor" verbatim; slide 21 = fan-in: four question rows feeding a Policy-gate box with permit/deny outcomes |
| Summary table — all ten concepts restated | 1–21 (collectively) | the summary table has no dedicated slide; every row it lists already has a slide above, so nothing is orphaned |
| Closing hand-off — run Syft/Trivy/Grype/Cosign, prove sandbox isolation, wire a guardrail + eval, read the CI pipeline | 22 | pipeline scene: Build → Scan → Sign → Serve, ending in a checked seal; credit + lab hand-off |

**No orphans.** All 13 pre-divider-baseline content slides and all lesson §1–§9 concepts (the
agent-as-security-surface motivating problem, the food-factory analogy, the SBOM/scan/sign
supply-chain pipeline with its scan-before-sign gate and its own SBOM-stage callout, the
two-scanners-disagree triage heuristic, Cosign signing and deploy-time verification, sandboxing
with gVisor/ToolHive as deeper-isolation forward pointers, agent-image hardening, input/output
guardrails with human-in-the-loop, lightweight CI evaluation, and vendor-free governance as four
enforced answers) are covered above with an explicit slide mapping, and every lesson `##`
section additionally has its own divider slide (§1–§9, dividers at slides 4, 6, 7, 9, 11, 13,
15, 17, 20 — numbered in strict presentation order, which equals lesson order here since no
content slide needed to move). Slide count: 13 content slides + 9 dividers = **22**, pagenos
`M8·01`–`M8·22`, sequential with no gaps (verified in a headless-Chrome DOM dump).

**No structural reorder was required** (unlike 04-packaging and 06-declarative-agent, each of
which needed one content-slide swap) — every content slide already sat in strict lesson order
1→9 in the pre-divider baseline; the only structural change was divider insertion plus the
divider-6/divider-7 pairing documented above for §3's folded-in coverage. All
facts/diagrams/scenes are otherwise unchanged from the pre-divider baseline; only structure
(9 dividers), subtitle length (rewritten to ≤10 words / ≤60 chars, longest now 55 chars), and
on-slide wording (em dashes stripped from every non-divider title/subtitle/label, run through
`gourav-voice`) were touched.

## 2026-08-14 — narration, rough-filter fix, illustrations

**Narration:** `planning/narration/08-narration.md` (new) — 6 videos via `lesson-to-video-narration`
+ `gourav-voice` (talking-head intro, SBOM/scan explainer, Cosign signing explainer, sandbox+hardening
explainer, guardrails/eval/governance explainer, summary/lab-bridge). Measured 5-gram retell-overlap
against `site/docs/m8-security/lesson.md`: 5.6% (gate is <10%; first draft measured 11.7% and was
rewritten in the flagged sections to bring it under gate).

**Rough-filter bug:** the deck's single shared `<filter id="rough">` was on the buggy default
(`x="-5%" y="-5%" width="110%" height="110%"`, objectBoundingBox — invisible on any perfectly
axis-aligned line). Fixed to `filterUnits="userSpaceOnUse" x="-80" y="-80" width="1300" height="600"`,
matching the fix already shipped in the other migrated decks course-wide.

**Illustrations:** 4 Magnific pencil-sketch images added to 4 of the 9 divider slides — the ones with
a genuine narrative/analogy beat; the other 5 dividers (pipeline mechanics, SBOM mechanics, scanning
triage, hardening checklist, guardrails/eval) stayed diagram-only per the "skip pure procedure slides"
guidance. Added the divider image-on-top/text-below CSS (`section.divider svg{order:1}` /
`section.divider h2.t{order:2; font-size:1.1em; max-width:76%}`, scoped with `:not(:has(svg))` so the
5 non-illustrated dividers keep their original large-centered-title layout unchanged) and bumped the
`fit()` autofit ceiling to 80% for `.divider` sections. Existing title-slide and closing-slide SVG
diagrams were left as-is (already strong, illustration would have been redundant).

| Divider | Slide | Image |
|---|---|---|
| §1 — the food-factory analogy | 4 | `title-supply-chain-checks.jpg` — sealed box on a conveyor passing under checklist / magnifying-glass / wax-stamp checkpoints |
| §5 — signing, the tamper-evident seal | 11 | `signing-wax-seal-crate.jpg` — hand pressing a wax seal onto a ribboned crate |
| §6 — sandboxing | 13 | `sandbox-locked-crate.jpg` — small windowless padlocked crate, isolated on a factory floor |
| §9 — governance without a vendor | 20 | `governance-four-locks-ledger.jpg` — four padlocks on a gate with an open ledger book, no branding |

All 4 verified by content (Read tool) against their prompts before insertion, white-level corrected
(`magick -colorspace Gray -level 0%,88% -resize 1600x900 -quality 78`), saved external at
`site/static/img/decks/08-security/` (never base64-inlined). No gendered pronouns appear in any of
the 4 slides' text, so no gender-consistency check was needed. Verify gate: 0 external refs, 22/22
section tags balanced, DOCTYPE at position 0, 4 `<image>` tags present, headless-Chrome render of
divider 1 confirmed correct layout (image on top, title below, pastel-free pencil sketch reads clean
on white). Not committed.

## 2026-10-21 deck-pass edits

- **Order:** divider 3 (SBOM) now follows the pipeline slide, so the deck runs pipeline (7), divider 3 (8), SBOM slide (9). Three new slides: SBOM (9), triage tiers (12), gVisor and ToolHive (17). The deck is now 25 slides, `M8·01` to `M8·25`. In the older sections above, slide numbers are the pre-pass numbers.
- **Facts:** slide 11 (two scanners) now shows 95 packages, Trivy 0 Critical / 44 High, Grype 0 Critical / 55 High, matching lab Steps 3 and 4. Tracing is gone from slides 2 and 22 because the lesson only teaches a 3-case CI eval. Slide 2 names Trivy as well as Grype.
- **Not added:** a key-based versus keyless comparison slide (slide 14 names both in its subtitle, cap of three new slides) and a summary-table slide (the lesson summary is a recap, not a concept).
- **Narration map:** Video 1 covers slides 1-5. Video 2 covers slides 6-12 and narrates the pipeline slide (7) first. Video 3 covers 13-14. Video 4 covers 15-19. Video 5 covers 20-24. Video 6 covers slide 25.
