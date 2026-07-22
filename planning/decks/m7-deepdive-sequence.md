# Module 7 Deep Dive — Agent Knobs Under the Hood · Explainer Deck Sequence

<!-- CourseSmith sequence spec — authored and approved BEFORE the deck HTML is built.
     Convention: whiteboard-style-guide.md §5. One row per slide; every slide needs
     purpose + visual + takeaway. NO slide-count cap (§0): one idea per slide, every
     deep-dive.md section gets a slide — the coverage table below is a hard gate.
     Style/structure mirror: site/static/decks/05-deepdive.html (the shipped M5
     deep-dive deck) — same page-number prefix pattern (M7-DD·NN), same shared
     #rough/#ah/#ahg defs declared once in a hidden svg, same full-concept-deck
     treatment (not a 5-6 slide framing deck) because this deep-dive's material is
     a real crew.py read-through + a real 3-variant sequential experiment the
     learner reasons with directly (a temperature table, a bounded-vs-ReAct
     contrast, two real code gates, and captured transcripts from Variant A/B). -->

This companion doc maps the 18-slide explainer deck (`site/static/decks/07-deepdive.html`) to the
Module 7 deep-dive page (`site/docs/m7-multi-agent/deep-dive.md`). Like M5's deep-dive deck, this
page opens a working file (`crew.py`) the lab already ran and asks *why* it's built the way it is —
so the deck follows the **full concept-deck treatment** (coverage over economy, §0): every
deep-dive section gets its own claim-titled slide, not a compressed highlight reel. The visual
language follows the CourseSmith whiteboard style contract (`templates/deck/whiteboard-style-guide.md`):
Patrick Hand cursive, `#1e1e1e` primary / `#757575` secondary strokes on white paper with the five
semantic pastel fills (§1: green good · red bad/full · blue data · orange caution · purple meta),
the `#rough` wobble filter on shapes only, and the shared `#ah`/`#ahg` arrowhead markers. The arc
moves — **why each agent runs at a different temperature, and why three of four pin to zero
(musician-improvisation analogy) → why this crew has no iteration cap because it was never built
to loop, contrasted with an unbounded ReAct search (re-googling analogy) → what actually crosses
each hop as a plain string, including the finding that Triage's classification is never fed to
retrieval (relay-baton analogy) → where the two real code-level gates sit in the pipeline, and why
a Python string check beats a follow-up prompt → how to observe exactly what an agent received
with no debug flag, just prints and profile files → the real sequential experiment: Variant A's
temperature-driven prose instability across 3 repeats, Variant B's guardrail bypass producing a
fabricated, wrongly-approved command → the honest small-model-variance caveat that governs how to
read all of it.**

Page numbers are `M7-DD·NN` to distinguish this deck from the lesson concept deck's `M7·NN`
(`07-multi-agent.html`, untouched by this work).

## Slide table

| # | Slide | Purpose | Visual | Takeaway |
|---|-------|---------|--------|----------|
| 1 | The four knobs nobody explained (title) | Frame the page: the lab ran Triage → Investigator → Fixer → Reviewer without ever asking why each agent's temperature, loop shape, handoff, or gate placement is what it is | Title sketch: four theme boxes (temperature · iteration · delegation · gates) converging on one "what crew.py actually does" box | credit line: Gourav Shah · School of DevOps & AI · Deep Dive (Part 2) |
| 2 | Low temperature plays the melody exactly as written, every time | The temperature analogy: a musician at low temperature reproduces the score reliably; at high temperature they improvise — sometimes brilliant, sometimes off-key | **Scene** — a musician at a music stand playing from sheet music (ink, steady), a second musician nearby improvising off-score with notes scattering (gray, wavy); illustration-author scene | An incident-response crew is almost entirely string section — the moments a wrong note is expensive far outnumber the moments creativity helps |
| 3 | Three of four agents pin `temperature=0` on purpose | The real per-agent table from `crew.py`'s four `llm()` call sites: Triage 0, Investigator gate 0, Fixer 0.2 (default, unset), Reviewer 0 | Numbered rows: 4 rows (Triage · Investigator · Fixer · Reviewer), each with its call-site temperature value and one-line "why", Fixer's row flagged orange as the one exception | The Fixer's `0.2` isn't a missed `temperature=0` — it's `llm()`'s own default, the one call that phrases prose around an already-decided fact rather than deciding one |
| 4 | Raising a classifier's temperature doesn't add creativity — it removes repeatability | Why turning up temperature on a classification or gating call is not "more capable," it's "less reliable"; sets up the experiment in §6 | Pipeline: Triage(0) → Investigator gate(0) → Fixer(0.2) → Reviewer(0), all boxes ink/blue except Fixer in orange, with a dashed side note "raise Triage's temp → §6 measures it directly" | Nothing in this crew calls `llm()` above 0.2 — every agent's job is to be right, not interesting |
| 5 | Someone who never stops re-googling the same question | The no-iteration-cap risk: without a rule saying "you get three tries," a loop that decides "not good enough, try again" can keep going indefinitely | **Scene** — a person at a laptop re-typing a search box with slightly different wording each time, a small stack of discarded search attempts piling up beside them; illustration-author scene | An agent given a tool and no iteration cap can call it, look, decide it's not good enough, and call it again — burning time and cost with no built-in stopping point |
| 6 | A ReAct loop can cycle back to "reason" again — until something outside it says stop | The ReAct-loop shape this crew deliberately isn't: reason → call → observe → decide, with a path back to reason on "no" | Diagram: reason → call tool → observe → decide diamond, "no — try again" arrow curving back to reason, "yes" arrow to final answer, a dashed "iteration cap (if none: runs until timeout)" box floating beside the decide diamond | Without an explicit iteration cap, the cycle only stops when something outside the loop — a timeout, an API error — forces it to |
| 7 | This crew costs exactly 5 model calls, always | The bounded-pipeline design: `retrieve()` runs exactly once, `run()` has no `while` and no retry branch — 1 Triage + 1 retrieval-embedding + 1 relevance-gate + up to 1 Fixer + up to 1 Reviewer | Pipeline with a fixed count: Triage → Investigator(retrieve+gate) → Fixer → Reviewer, each box numbered 1–5, a green box at the end reading "predictable p99 cost & latency" | A bounded pipeline trades the ability to self-correct for a call count you can predict exactly — worth it when an on-call responder needs a bounded answer time every time |
| 8 | A relay race passes the baton, not the runner's whole race so far | The delegation-as-string-handoff analogy: each runner only receives the baton (the plain string handed forward), not the previous runner's memory of the whole race | **Scene** — three runners in a relay, the baton passing hand to hand along the track, each runner drawn only holding what's directly in front of them, not looking back; illustration-author scene | Every handoff in this crew is one plain string passed forward — no shared history, no structured object, just the baton |
| 9 | Triage's classification is printed for you — and thrown away by the code | The traced handoff: `retrieve()` queries ChromaDB with the raw `incident` string, not with Triage's `AREA/SEV` output; Triage's line never reaches the Investigator's prompt | Trace diagram: `incident` box fans to Triage (dead-end arrow, dashed, labeled "printed only") and to Investigator's `retrieve()` (solid arrow, labeled "the actual query") | Triage's job in this pipeline is display and an early sanity check — it does not narrow what the Investigator searches for, unless you extend the crew to make it |
| 10 | Fixed order sidesteps two failure modes a dynamic router doesn't | Why a human-authored, hard-coded `run()` order beats runtime delegation for this task: it avoids context dilution (irrelevant history spent on attention) and error cascade (a re-summarized mistake hides from the next agent) | Two-panel comparison: "context dilution" (red, a bloated shared-history box feeding an agent that didn't need most of it) vs "error cascade" (red, a re-phrased summary hiding an original mistake) — both crossed against this crew's clean baton-per-hop | Each hop here passes forward only what the previous stage decided to output — a mistake at one stage stays visible and inspectable at the next, never smoothed over in a re-summary |
| 11 | Two gates, two Python string checks, zero follow-up prompts | The exact code: `.upper().startswith("YES")` gates the relevance decision, `.upper().startswith("APPROVED")` gates the final verdict — both are deterministic checks on a model's output, not a second LLM call policing the first | Anatomy: two boxes side by side, each showing its literal `.startswith(...)` check in code-styled text, ink stroke-width 3, both stamped "deterministic — not a second model call" | A model that hedges — "possibly, but I'm not certain" — fails the gate correctly, because the code isn't parsing intent, it's checking a prefix that can't be talked out of its answer |
| 12 | Gate 1 sits after the tool call, Gate 2 sits at final-answer time | Where the two gates physically live in the pipeline: the relevance gate validates a retrieval result before the Fixer trusts it; the Reviewer gate validates the Fixer's proposed action before a human sees it | Pipeline: Retrieval → Gate 1 (relevance, diamond) → Fixer → Gate 2 (Reviewer, diamond) → OUTCOME, with a dashed ghost box off to the side labeled "gate 3: before a tool call — this crew doesn't need one, its query is never LLM-chosen" | Neither gate trusts the model's raw output as-is — each one runs it through an unambiguous check before that answer is allowed to change what happens next |
| 13 | No debug flag — read the profile file and the f-string instead | The observation method: `crew.py` has no `DEBUG`/`--verbose`; the four `[STAGE]` prints show outputs, not the full prompt — reconstruct any agent's exact prompt from its profile file plus `run()`'s f-string | Numbered rows: 1) `docker compose run` prints `[TRIAGE]`/`[INVESTIGATOR]`/`[FIXER]`/`[REVIEWER]`/`OUTCOME:` (outputs only) → 2) `cat crew/profiles/investigator.md` (the system prompt) → 3) profile + f-string = the complete prompt, no hidden step | Between the profile file and `run()`'s f-strings you can reconstruct the exact prompt any agent saw for any run, without a debug flag the code doesn't have |
| 14 | Same incident, three knob variants, always run one at a time | The experiment's ground rules: sequential only (never parallel — this machine's 2 GB budget and, more importantly, small-model run-to-run noise would make it impossible to tell a knob change from ordinary variance) | Numbered rows: 1) baseline (unmodified) → 2) Variant A (Triage temp 0→0.9, ×3 repeats) → 3) Variant B (relevance gate bypassed) — each row captioned "sequential, never parallel" | Overlapping variants would make it impossible to tell whether a difference in output came from the knob you changed or from ordinary small-model noise |
| 15 | The outcome held at 0.9 — the prose didn't | Variant A's real 3-repeat result: all three runs land on `OUTCOME: APPROVED`, but Triage's prose drifts from terse (run 1) to a run-on sentence (run 2) to an unrequested multi-section writeup (run 3) | Three-column comparison: run 1 (blue, "terse — on profile") · run 2 (orange, "run-on sentence") · run 3 (red, "unrequested ### sections") — all three share one green banner underneath reading "OUTCOME: APPROVED, all 3" | Raising just the Triage temperature made Triage noisier without making the crew's final decision any less reliable — temperature is a per-role knob, not a per-crew one |
| 16 | Bypass one gate and the crew launders a fabricated command through two agents | Variant B's real result: with the relevance gate patched to always pass, the Kafka incident retrieves the wrong (payments) runbook, the Fixer invents a command that appears nowhere in `acme-runbooks.md`, and the Reviewer approves it as "backed by a runbook" | **Scene** — a rubber stamp coming down marked "APPROVED" over a torn, mismatched runbook page held together with the wrong staple, red ink bleeding from the stamp; illustration-author scene | Not a destructive command — a fabricated one, laundered through two agents and rubber-stamped APPROVED; this is exactly the unsafe output the gate exists to stop |
| 17 | The gate pins the marker — remove it and the marker stops being pinned | The comparison table's honest-reading rule, applied across baseline/A/B: `OUTCOME:` and which stages ran are exact reproducible facts *while the gate is intact*; wording is small-model noise; Variant B removes the gate and the marker itself stops being pinned | Numbered rows: baseline (blue, APPROVED, 5 calls) → Variant A (orange, APPROVED ×3, prose drifted) → Variant B (red, gate removed, wrong runbook every run, "but OUTCOME itself flips run to run — not stable") | Variant B is structural AND unstable: wrong runbook every run, but no gate left to pin the verdict — that unpredictability is the finding; the gate, not temperature, was the determinism |
| 18 | Pin the gates, bound the loop, check what really crosses each hop (closing) | Takeaways + hand-off: temperature is per-role not per-crew; a bounded pipeline trades self-correction for a predictable SLO; check what a diagram implies is passed vs what the code actually passes; a code-level gate beats a follow-up prompt | numbered rows (circles 1–5, including the honest small-model-variance caveat as row 1) — the course's takeaway idiom | The marker (`OUTCOME:`, which branch ran) is the thing downstream code and humans actually act on — check it before worrying about exact wording |

<!-- Visual pattern vocabulary used: title theme-boxes · scene (2, 5, 8, 16) · numbered rows
     (3, 7 partially, 13, 14, 17, 18) · pipeline/diagram (4, 6, 7, 9, 12) · two-panel comparison
     (10) · anatomy (11) · three-column comparison (15). -->

## Recommended presentation order

Present strictly 1 → 18; the deck is one continuous build from "why each agent's temperature
differs" through the real experiment's honest reading. Open on slide 1 to name the four themes.
**Slides 2–4 are the temperature arc and slide 2's musician scene is the conceptual hinge** — land
"low temperature plays the melody exactly as written" before slide 3's table, so the table reads as
evidence for an intuition already planted, not a cold list of numbers; do not rush past the scene.
Slides 5–7 are the iteration-control arc — slide 5's re-googling scene and slide 6's ReAct diagram
are a matched pair (the failure mode, then its named shape); slide 7's "exactly 5 calls, always" is
the payoff and deserves its own beat, it is the page's most concrete design claim before the
experiment proves it indirectly in §6. Slides 8–10 are the delegation arc — **slide 9 (Triage
printed but not fed to retrieval) is the single most load-bearing slide in this deck**, it is the
one finding a learner will not intuit from the lesson's pipeline diagram alone; do not compress it.
Slides 11–12 are the gates arc, presented back to back — the code snippet slide (11) then its
placement in the pipeline (12); keep the literal `.startswith(...)` text on screen, it's the exact
line from `crew.py`. Slide 13 is a short connective beat on the observation method — quick, then
move. Slides 14–17 are the experiment and are the deck's other must-not-compress stretch: 14 sets
the sequential-only rule (skip only if the audience already ran the lab's own sequential steps),
15 and 16 are the two variants' real captured results and need their own beat each — 15 for the
"outcome stable, prose drifts" reading, 16 for "wrong runbook retrieved every run — structural, not
noise" (in this captured run, laundered through to an APPROVED verdict), and 17 for the fuller
picture: that structural wrong-runbook retrieval is repeatable, but the OUTCOME marker itself is
NOT — it flips run to run once the gate is gone, because the gate (not temperature) was what pinned
it. Conflating "structural" with "the marker is stable" is the exact honesty mistake the module's
`:::note` warns against — and 17 closes the loop with the comparison table's judging rule. Under time
pressure, compress 3–4 and 11–12 into single passes each — never compress 2, 9, 15, or 16; those
carry the deep dive's analogies and its real measured evidence.

## Fragment map

No slide in this deck uses fragments. Every slide here is a comparison, scene, anatomy box,
pipeline/trace diagram, or numbered-row sequence — all patterns that read better whole per
style-guide §6 (the ReAct diagram on slide 6 shows a *possible* cycle as a static picture with a
curved return arrow, not a staged reveal of an actual run — this crew never takes that path, so
there is no real hop-by-hop event to build up fragment by fragment).

Static slides (1–18, all): scenes, pipelines, anatomy boxes, comparisons, and numbered rows all
show the full picture at once.

## Coverage check (HARD GATE — §0)

Every deep-dive.md section maps to at least one slide.

| Deep-dive section / concept | Slide(s) | Notes (analogy used, echoes/forward pointers) |
|---|---|---|
| Opening framing — the lab ran the crew without asking why each knob is set the way it is | 1 | Title theme boxes name the four arcs (temperature, iteration, delegation, gates) |
| §1 — temperature-as-musician-improvisation analogy | 2 | Scene: sheet-music musician vs improvising musician, illustration-author scene |
| §1 — the real per-agent temperature table (Triage 0, Investigator 0, Fixer 0.2 default, Reviewer 0) | 3 | Numbered rows with the page's exact call-site values and reasons |
| §1 — three of four calls pin `temperature=0`; nothing in this crew calls `llm()` above 0.2 | 4 | Pipeline of all four agents with their temperatures, forward-pointer to §6's measurement |
| §2 — the no-iteration-cap risk, re-googling-the-same-question analogy | 5 | Scene: person re-typing search queries, discarded attempts piling up, illustration-author scene |
| §2 — the ReAct-style loop shape this crew deliberately isn't (reason→call→observe→decide→cycle) | 6 | Diagram: reason/call/observe/decide with the "try again" cycle-back arrow and iteration-cap note |
| §2 — this crew's bounded design: `retrieve()` called exactly once, no `while`, exactly 5 model calls always | 7 | Pipeline with fixed call count, "predictable p99 cost & latency" payoff box |
| §3 — delegation as a plain-string baton pass, relay-race analogy | 8 | Scene: relay runners passing a baton, each only holding what's in front of them, illustration-author scene |
| §3 — the traced handoff: `retrieve()` uses the raw `incident`, not Triage's output; Triage is printed only | 9 | Trace diagram: incident fans to a dead-end Triage print and to the real Investigator query |
| §3 — fixed order sidesteps context dilution and error cascade vs. dynamic delegation | 10 | Two-panel comparison: both failure modes crossed out against this crew's clean per-hop baton |
| §4 — the two real code gates: `.startswith("YES")` and `.startswith("APPROVED")`, deterministic string checks | 11 | Anatomy: two boxes with the literal code, both stamped "not a second model call" |
| §4 — gate placement in the pipeline: after-tool-call (Gate 1) vs final-answer-time (Gate 2), and the third gate type this crew doesn't need | 12 | Pipeline with two gate diamonds plus a dashed ghost box for the unneeded before-tool-call gate |
| §5 — observing agent prompts with no debug flag: stage-marker prints plus reading the profile file directly | 13 | Numbered rows: prints show outputs → profile file shows the system prompt → profile + f-string = complete prompt |
| §6 — experiment ground rules: sequential only, never parallel, because of both machine budget and small-model noise | 14 | Numbered rows: baseline → Variant A → Variant B, each captioned "sequential, never parallel" |
| §6 — Variant A: Triage temp 0→0.9, 3 repeats, `OUTCOME: APPROVED` stable, prose drifts terse→run-on→unrequested sections | 15 | Three-column comparison with the page's real 3-run prose descriptions, shared green OUTCOME banner |
| §6 — Variant B: relevance gate bypassed, wrong runbook retrieved, Fixer fabricates a command, Reviewer approves it | 16 | Scene: rubber stamp APPROVED over a mismatched runbook page, illustration-author scene |
| §6 — comparison table's judging rule: marker is exact and reproducible only while the gate is intact; prose is shape-only; Variant B's wrong-runbook retrieval is structural but its OUTCOME marker is unstable once the gate is gone | 17 | Numbered rows: baseline/A/B summarized, B flagged "gate removed, wrong runbook every run — but OUTCOME itself flips run to run" |
| §6 — small-model-variance honest framing (the `:::note` guidance) | 15, 17 | Embedded directly in how 15 and 17 are captioned, not a separate disclaimer slide |
| "Where you will use this" — 4 real-work triggers | 18 | Closing numbered rows, one per trigger, honest-variance caveat folded in as row 1 |

**No orphans.** Every deep-dive.md section (§1–§7 — note §7 in the page's own numbering is the
"Experiment" section covering both the baseline run and the two variants, mapped here as its own
subsections above — the opening framing, and the closing "Where you will use this") has at least
one slide anchor. The `bash up.sh` opening command block, the `docker build`/`docker run` mechanics
throughout §6, and the teardown sections are deliberately not slides — they are terminal-output/console
detail that belongs in the lab prose, not a concept slide (the concept deck teaches concepts, never
terminal output, per the style guide); the underlying concepts those commands demonstrate (running a
patched image, capturing a transcript, tearing down cleanly) are still covered by slides 14–17.
