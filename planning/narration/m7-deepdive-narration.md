# Module 7 Deep Dive — Agent Knobs Under the Hood

## Recommended video structure

| # | Video title | Format | Estimated duration | Central idea |
|---|-------------|--------|--------------------|--------------|
| 1 | Deep Dive: What's Actually Inside crew.py | Talking head | 2 min | Why we're opening the source now, after the lab already worked |
| 2 | Temperature Per Agent, Not Per Crew | Slides + voiceover | 5 min | Each of the four agents gets its own temperature, chosen for its job |
| 3 | Why the Incident Crew Never Loops | Slides + voiceover | 5 min | A fixed, five-call pipeline trades self-correction for predictable cost and latency |
| 4 | What Actually Crosses Each Hop | Slides + voiceover | 6 min | Delegation between agents is a plain string, not a shared memory, and Triage's own output never reaches the Investigator |
| 5 | Code-Level Gates: Why a Python Check Beats a Second Prompt | Slides + voiceover | 5 min | Both gates are deterministic string checks, placed after the tool call and at final-answer time |
| 6 | The Experiment: What Breaks When You Remove the Gate | Slides + voiceover | 6 min | Raising temperature barely moves the outcome; removing the gate makes the crew approve the wrong fix every time |
| 7 | Summary and Lab Bridge | Slides + voiceover | 2 min | What you now know about tuning a small-model crew, and what's next |

## Video 1: Deep Dive: What's Actually Inside crew.py

**Format:** Talking head
**Estimated duration:** 2 minutes
**Learning objective:** By the end, learners understand why we're going back into the same lab they already ran, and what new question this deep dive is answering.

### Narration script

In the lab, you ran the Incident Crew, and it worked. You gave it an incident, four agents took turns on it, and you got back either APPROVED, with a runbook-backed fix, or REJECTED, because nothing in the runbook matched. That's a good result. But it also leaves a few questions completely unanswered.

Why does the Triage agent run at a different temperature than the Fixer? Why does this crew never retry anything, even when a result looks weak? When the Reviewer says APPROVED or REJECTED, is that coming from a careful check in the code, or is it just trusting whatever the model said? You can't answer any of that from the transcript alone. You have to open `crew.py` itself.

That's what this deep dive does. We're going to read the actual function calls in `crew.py`, line by line, and connect each one back to a decision I made when I wrote this crew. And near the end, we're going to run the same incident through the crew multiple times, with one knob changed each time, so you can see with your own eyes what stays stable and what doesn't.

By the end of this deep dive, you'll be able to look at any small multi-agent pipeline and ask the right questions about it: which calls are pinned at zero temperature and why, where the safety gates actually live in the code, and what happens the day one of those gates gets quietly switched off.

### Suggested visuals / slide beats

1. Title card: "Deep Dive — Agent Knobs Under the Hood"
2. The lab's own transcript, with `[TRIAGE]`, `[INVESTIGATOR]`, `[FIXER]`, `[REVIEWER]`, `OUTCOME:` highlighted
3. Three unanswered questions, listed one at a time: temperature per agent, no retry, where the gate lives
4. Closing: "Let's open crew.py"

---

## Video 2: Temperature Per Agent, Not Per Crew

**Format:** Slides + voiceover
**Estimated duration:** 5 minutes
**Learning objective:** By the end, learners can explain why three of the four agents are pinned at temperature zero, and why the fourth is not.

### Narration script

The lab treated `qwen3.5:2b` as one model wearing four different hats. That's true. But each of those four calls uses a different temperature, and that difference is not an accident — it was chosen on purpose, one agent at a time.

Think of temperature as how much a musician is allowed to improvise around a melody. At low temperature, the musician plays the melody exactly as written, every single time. Reliable, maybe a little boring, but correct. At high temperature, the musician takes liberties — sometimes brilliant, sometimes off-key. Now, in an incident-response crew, where do you want that improvisation? Almost nowhere. This crew is mostly the string section, reading sheet music. A wrong note here is expensive, so most of it should be exact and repeatable.

Let's go through the actual call sites in `crew.py`, one at a time. Triage calls the model with `temperature=0`. That's the classification step — for a given incident, there's really one correct `AREA` and `SEV` label, so there's no benefit to variety here. The Investigator's relevance gate also runs at `temperature=0`. That result feeds straight into an `if` statement in the code, and if that answer gets flaky, the gate itself becomes unreliable. So it's pinned too.

Then comes the Fixer, and here's the interesting one. If you look at its call site, there's no `temperature=` argument at all. It falls through to `llm()`'s own default, which is `0.2`. That's not something the author forgot to set — the function signature itself, `def llm(prompt, system, temperature=0.2)`, tells you `0.2` is the deliberate baseline for a call that generates prose around an already-known fact. The Fixer still has to quote the command from the runbook exactly, but it has a little room to phrase the recommendation naturally. And then the Reviewer goes back to `temperature=0`, because APPROVED or REJECTED is a binary safety decision the code branches on, and that cannot be allowed to drift.

So out of four agents, three are pinned at zero, and the one exception only goes as high as `0.2` — the lowest kind of "a little room" you could ask for. Nothing in this crew ever calls the model above that. And here's the important part: raising a classification or a gating agent's temperature doesn't make it "more creative" in any useful sense. It just makes its correctness less repeatable. We're not going to just assert that — later in this deep dive, we'll actually run the same incident three times with Triage's temperature raised, and measure exactly what moves and what doesn't.

### Suggested visuals / slide beats

1. Analogy: a musician at low temperature reading sheet music vs. a soloist improvising
2. Table: Agent, temperature, why — Triage=0, Investigator gate=0, Fixer=0.2 (default), Reviewer=0
3. Code close-up: the `llm()` function signature showing `temperature=0.2` as the default
4. Mermaid-style flow: Triage(0) → Investigator gate(0) → Fixer(0.2) → Reviewer(0)
5. Takeaway: "Temperature is a per-agent-role decision, not a per-crew setting"

---

## Video 3: Why the Incident Crew Never Loops

**Format:** Slides + voiceover
**Estimated duration:** 5 minutes
**Learning objective:** By the end, learners can explain the difference between a fixed sequential pipeline and a ReAct-style loop, and why the Incident Crew deliberately has no retry.

### Narration script

The lesson showed you a straight pipeline: Triage, then Investigator, then Fixer, then Reviewer. And if you read the `run()` function in `crew.py`, that's really all it is — four calls, one after another, with no `while` loop, no retry, and no "let me try a different approach" branch anywhere in the file. This video is about why that absence is a real design decision, not something the author simply didn't get around to building.

Let's say you don't find the right answer on your first web search, so you re-search the same question with slightly different words, and it still doesn't quite work, so you try again with another slight change. Nothing is stopping you — there's no rule that says you only get three tries. An agent that's given a tool and no iteration cap can end up doing exactly the same thing: call the tool, look at the result, decide it's not good enough, call it again with slightly different arguments, and keep going, burning time and cost with no guarantee the next attempt is actually any better.

That failure mode belongs to a different kind of agent altogether — what's usually called a ReAct-style loop, where a single agent reasons, calls a tool, observes what came back, and then decides whether to answer or try again, sometimes many times over for one task.

The Incident Crew has none of that. `retrieve()` — the call that searches ChromaDB — runs exactly once, from the Investigator. There's no "that result looked weak, let me search again with different phrasing" branch anywhere. If the nearest-neighbour search comes back with a bad match, the relevance gate we'll talk about in a later video catches it by saying NO to that one candidate. The code does not respond to a bad result by retrying the search.

And that's what makes the cost of this crew completely predictable. One incident report costs exactly five model calls, always: one for Triage, one for the retrieval embedding, one for the relevance gate, and then zero or one each for the Fixer and the Reviewer, depending on whether the gate said yes. Because there's no code path where it runs ten times instead of one, you can actually predict your p99 latency and your p99 cost ahead of time.

An unbounded ReAct loop trades that predictability for the ability to self-correct, and that's worth it when a task genuinely benefits from trying again, smarter. But it gets expensive fast when a bug, or just a bad prompt, sends the loop searching for an answer that was never going to be found — burning tokens and wall-clock time until something outside the loop finally kills it. Think about what an on-call responder actually wants at two in the morning: a crew that answers in a bounded, known time every single time, even if the answer is sometimes "REJECTED, escalate" — not a crew that might occasionally find a better answer after ten retries, but might just as easily spin for two minutes on an incident it was never going to solve.

### Suggested visuals / slide beats

1. Analogy: re-googling the same question with slightly different wording, no stopping rule
2. Diagram: ReAct loop — reason, call, observe, decide, cycle back — with no iteration cap
3. Contrast diagram: this crew's fixed five-call pipeline, no cycle
4. Cost line: "1 Triage + 1 retrieval-embedding + 1 gate + (0 or 1) Fixer + (0 or 1) Reviewer = predictable p99"
5. Takeaway: "A sequential pipeline trades self-correction for a predictable SLO"

---

## Video 4: What Actually Crosses Each Hop

**Format:** Slides + voiceover
**Estimated duration:** 6 minutes
**Learning objective:** By the end, learners can trace exactly what data each agent passes to the next, and explain why a fixed, plain-string handoff is safer here than dynamic delegation.

### Narration script

Everybody calls this a sequential pipeline, and fair enough, it is one. But "sequential" doesn't tell you the one thing that actually matters here, which is: when agent A finishes, what does agent B actually get to see? Let's trace it ourselves, one hop at a time, because that's really what decides whether small-model multi-agent work holds together or falls apart.

Let's say the incident text comes in. Triage looks at it and produces a label, and that label gets printed on your screen. Now here's a thing that would surprise you if you only read the transcript: that printed label never goes anywhere. The Investigator's own search against ChromaDB still uses the original incident text, not anything Triage decided. So what is Triage actually doing here? Mostly showing you something on screen, and maybe giving a human a chance to catch a garbled incident report early. It's not steering what gets searched for. Now, could you change that? Sure — you could make Triage's category filter the ChromaDB search. That would be a real, useful extension. It's just not what's built today.

Every other handoff in this pipeline is a plain Python string. One agent's output gets dropped into an f-string, and that f-string becomes the next agent's prompt. There's no shared object here, no schema, nothing the receiving agent could inspect beyond the words sitting inside that one prompt. You could call it "structured" only because everyone building this crew agreed, by convention, on what each string should look like — the Reviewer's prompt is written assuming the Fixer's output reads a certain way. But nothing in the code actually checks that assumption before using it.

Now, why build it this way, when a framework like CrewAI would let you route work dynamically — an agent deciding at runtime who should handle what, or a manager agent picking the path based on the request itself? Because a fixed order avoids two specific problems that dynamic routing runs straight into, and it's worth naming both.

The first, let's call it attention getting spread too thin. When one shared conversation keeps growing and every agent reads the whole thing, an agent ends up wading through stuff that has nothing to do with its own job before it can even start. A small model doesn't have much attention to spend, so that's expensive. Here, that never happens — the Fixer's prompt never contains the Triage output, the Reviewer's prompt never contains the retrieval candidate that got thrown out. Each agent only ever sees the exact fields its own job needs.

The second is what happens to a mistake once it's made. Say an early agent gets something a little wrong. In a framework where a manager agent summarizes or rewords a sub-agent's finding before passing it along, that early mistake can get smoothed over in the rewording, and by the time it reaches the next agent, it looks fine — nobody downstream ever sees the original evidence that would have let them catch it. Here, that can't happen, because every hop passes forward the previous agent's exact output. The Reviewer looks at the Fixer's literal words, not somebody's summary of them. And notice the line under both panels. Every hop is another LLM call, and every call costs time and, if you pay per token, money. This crew already pays five calls per run. Dynamic re-routing adds more hops on top, and each extra hop is one more chance to drift off the incident.

One last thing before we move on, since you'll want this for the next video too. `crew.py` has no debug flag, no verbose switch, nothing like that. And you don't actually need one. Between the print statements already sitting in the code and the agent's own profile file — say, `labs/m7/crew/profiles/investigator.md` — you can rebuild the exact prompt any agent saw on any run. The profile gives you the fixed part of the prompt, the f-string in `run()` gives you the part that changes per run, and together that's the whole thing.

### Suggested visuals / slide beats

1. Trace diagram: incident text flowing into Triage, Investigator, Fixer, Reviewer, with the Triage-to-Investigator arrow marked "NOT passed"
2. Side-by-side: this crew's plain-string handoff vs. a framework's shared conversation history
3. Two labeled boxes: "context dilution" and "error cascade," each with a one-line consequence
4. Screenshot-style slide: `profiles/investigator.md` next to the printed `[INVESTIGATOR]` output
5. Takeaway: "Check what's really being passed, not what the diagram implies"

---

## Video 5: Code-Level Gates: Why a Python Check Beats a Second Prompt

**Format:** Slides + voiceover
**Estimated duration:** 5 minutes
**Learning objective:** By the end, learners can explain where each of the crew's two gates physically sits in the code, and why a deterministic string check is more trustworthy than asking the model to double-check itself.

### Narration script

You already know from the lesson that the relevance gate matters, and that the Reviewer carries a lot of weight in this crew. What we haven't looked at yet is where, in the actual file, those two checks sit — and it turns out that placement is exactly what makes them trustworthy.

Notice this first: neither gate is a second model call asking the first model, "are you sure about that?" Both are plain Python, sitting right after the model returns its answer. `relevant = llm(...).upper().startswith("YES")` — that's the whole gate. And for the Reviewer, it's `verdict.upper().startswith('APPROVED')`. In both cases, the model's raw words get run through one deterministic check before the code lets that answer change anything.

Let's say the model answers "Yes, I believe this passage is relevant because..." — that still passes, since the string starts with YES, whatever comes after it. Now let's say a different run comes back hedging, something like "possibly, but I'm not certain" — that fails the same check, and it fails for a reason that has nothing to do with the code understanding English. It fails because the string doesn't start with YES. Well, that's really the whole argument for doing it this way. If instead you asked the model a follow-up question like "and are you sure that's safe?", you'd just be generating more probabilistic text, which can be wrong in exactly the same way the first answer could be wrong. A plain string check on a fixed output format doesn't have that problem. There's no way to argue it into a different answer. But it does depend on the model putting its answer first. Look at the line under the two boxes. A model that ignores think:false, like qwen3:4b on Ollama 0.40.7, prints its reasoning before the answer, so the reply no longer starts with YES and the gate breaks. Pick a model that honours that switch.

So where do the two checks actually live? Picture the pipeline as a line. Gate one sits right after the ChromaDB search returns something, and before the Fixer is allowed to act on it — so a bad retrieval gets caught before anyone builds a fix out of it. Gate two sits at the very end, right before a human would see the result — so a risky-looking fix gets caught before it reaches anyone who might actually run it. There's a third spot you might expect a gate, checking arguments before a tool call happens, and it's deliberately missing here. Why? Because this crew's one tool call always takes the same thing, the raw incident text — there's no case where the model gets to invent a search query or pick its own arguments, so there's nothing to validate going in. That third kind of check earns its place once an agent starts choosing what to call and how. This one never does. If you want to go further, the slide names the next two layers. One is input validation, which rejects an empty or broken incident string before Triage ever runs. The other is an explicit output schema for the Reviewer's verdict. Today, a Reviewer that opens with an explanation instead of the word APPROVED fails the check and reads as REJECTED. That is the safe direction to fail in, but you should know about it before you change the Reviewer's profile.

One more distinction worth keeping straight, because Module 8 leans on it heavily. Everything in this video is about behavior — does this one gate, on this one input, do the right thing, and you can verify that just by running it. Module 8 is a different question entirely: across every crew your org has deployed, can you prove, after the fact, that the gate is still there and nobody quietly removed it? This page checks one gate's correctness. Module 8 checks whether gates stay in place at all.

### Suggested visuals / slide beats

1. Code close-up: `.upper().startswith("YES")` and `.upper().startswith('APPROVED')` side by side
2. Contrast: "hedged answer still fails the gate" vs "confident-sounding YES still passes it"
3. Pipeline diagram: Gate 1 after retrieval, before Fixer; Gate 2 at final answer, before a human
4. A greyed-out third gate position, labeled "not needed here — no model-chosen tool arguments"
5. Takeaway: "A code-level gate can't be talked out of its answer"

---

## Video 6: The Experiment: What Breaks When You Remove the Gate

**Format:** Slides + voiceover (with demo transcript excerpts)
**Estimated duration:** 6 minutes
**Learning objective:** By the end, learners can state, with evidence from a real run, that raising temperature barely moves this crew's outcome, while removing the relevance gate makes the crew consistently approve the wrong fix.

### Narration script

Everything we've said so far about temperature and gates has been a claim. Now let's actually test it, one knob at a time, on the same incident, so you can see for yourself what moves and what doesn't.

First, the baseline. The lab's own run: "the checkout page is returning HTTP 503 errors for all users." Triage classifies it, the Investigator retrieves the checkout runbook, the Fixer proposes the scale command from that runbook, and the Reviewer says APPROVED. Nothing unusual — that's the result you already saw in the lab.

For Variant A, we raise only Triage's temperature, from zero up to 0.9, and run the exact same incident three times in a row. Investigator, Fixer, and Reviewer all stay exactly where they were. What happens? All three runs still land on OUTCOME: APPROVED. The structural decision held completely steady across that jump. But Triage's label did not hold steady. The format held. Every run printed one short AREA and SEV line, just as its profile asks. The content is what moved. The baseline called this incident SEV1. At 0.9, the three runs said SEV2, then SEV1, then SEV2. And run two invented a cause the incident never mentioned: a payment gateway outage, for what is really a checkout web-tier problem. So the label is not a stable fact at high temperature. But the crew's final decision never moved, because Triage's output is only printed, and the Investigator and the Reviewer, the two agents that actually gate the outcome, stayed at zero.

Now for Variant B, and this is the one that matters most. We leave every temperature exactly where it was, and instead patch out the relevance gate itself, so it always returns true no matter what the model actually said — simulating a very real production failure mode, where a feature flag gets left in a bypass state, or a refactor accidentally sets a flag to always-true. We run this against the Kafka incident, the one the baseline crew correctly escalates, because no runbook in this course actually covers Kafka.

With the gate bypassed, the Investigator still retrieves whatever ChromaDB's nearest-neighbour search happens to return for a Kafka query, which turns out to be the payments runbook — completely the wrong section — and prints it with total confidence, no hint that anything's off. The Fixer then works from that wrong runbook and quotes its payments restart command. The Reviewer is handed the runbook passage along with the fix, so it checks the command against that passage. And the command matches it. So the Reviewer approves.

We ran this exact image six times against the Kafka incident. Every run retrieved the payments chunk. Every Fixer proposed the payments restart. Every Reviewer answered APPROVED. Only the Fixer's opening sentence changed from run to run. The command never did.

So removing the gate did not make the crew flaky. It made the crew consistently, confidently wrong. The Reviewer did its job, and it still approved a payments restart for a Kafka outage, because the thing it compared against was the wrong runbook. A reviewer can only be as right as the evidence it is handed. With the gate in place, the Investigator's NO stops the pipeline before the Fixer or Reviewer get a say. Without it, the APPROVED marker certifies a mismatch.

So here's the real finding of this whole experiment. It wasn't the low temperatures that were pinning this crew's outcome steady. It was the gate. Variant A proved that by raising temperature and watching the outcome hold anyway. Variant B proved the other half, by leaving every temperature untouched and removing only the gate — and watching the crew approve the wrong fix six times out of six.

### Suggested visuals / slide beats

1. Table: Baseline vs Variant A (3 repeats) vs Variant B — knob changed, OUTCOME marker, stable or not
2. Transcript excerpt: Variant A run 2's Triage line, "SEV1 | Payment gateway outage impacting all checkout attempts", circled
3. Diagram: gate bypassed → wrong runbook retrieved with full confidence → Fixer quotes the wrong runbook's real payments restart command
4. Big callout: "The gate, not the agents' temperatures, was what made the outcome reproducible"
5. Takeaway: "Don't credit low temperature for a stable outcome until you've confirmed there's still a code-level gate in the loop"

---

## Video 7: Summary and Lab Bridge

**Format:** Slides + voiceover
**Estimated duration:** 2 minutes
**Learning objective:** By the end, learners can summarize the four lessons from this deep dive and know what to carry into their own multi-agent work.

### Narration script

Let's bring this together. You now know that temperature is a per-agent-role decision, not a per-crew setting — pin your classification and safety-gate calls at zero, and only leave a little room, something like 0.2 to 0.4, on the one or two calls that generate prose around a fact that's already been decided. You know that a sequential, single-pass pipeline like this one trades self-correction for predictable cost and latency, and that's a deliberate choice you'd make whenever you're bounding an agent's SLO — an unbounded ReAct loop needs an explicit iteration cap before it's safe to put in front of that same SLO.

You also know that delegation between agents is only as safe as what actually crosses each hop, and that you have to check that directly in the code, because a diagram can quietly lie to you — this crew's own diagram implied Triage's classification mattered downstream, and it doesn't. And you've seen, with real transcripts, that a code-level gate, not low temperature by itself, is what decides the outcome. Variant A raised Triage's temperature and the outcome held, because the gate was still there. Variant B left every temperature alone and removed only the gate, and the crew approved the wrong runbook's command six times out of six.

That last point is really the one to carry forward. The next time you're evaluating whether a crew's output is reliable enough to trust, don't give credit to "low temperature" for a stable-looking result until you've actually confirmed there's still a code-level gate sitting between the model's opinion and that marker. A stable-looking pipeline with no gate is just one bad retrieval away from a coin flip.

This deep dive closes out Module 7. From here, the course moves into Module 8, where the question shifts from "does this one gate work right now" to "can I prove every deployed crew still has one" — governance, not just behavior. Go ahead and run the teardown for this page, and I'll see you in Module 8.

### Suggested visuals / slide beats

1. Four-line recap, one bullet revealing at a time: temperature per role, fixed pipeline for SLOs, check what really crosses each hop, the gate pins the outcome
2. Split-screen callback: Variant A (right runbook, APPROVED) vs Variant B (wrong runbook, still APPROVED, six of six)
3. Closing card: "Next: Module 8 — governance across a fleet of crews"

---

## Coverage map

| Source idea | Video | Treatment |
|---|---|---|
| Why open crew.py after the lab already worked | 1 | Explained |
| §1 Temperature per agent, all four call sites and their values | 2 | Explained |
| §1 `llm()` default parameter as the deliberate Fixer baseline | 2 | Explained |
| §2 No iteration cap / no retry loop in `run()` | 3 | Explained |
| §2 ReAct-style loop as the contrasting pattern | 3 | Explained |
| §2 Fixed 5-call cost, predictable p99 latency/cost | 3 | Explained |
| §3 Triage's output never reaches the Investigator's query | 4 | Explained |
| §3 Plain-string handoff vs. CrewAI dynamic delegation | 4 | Explained |
| §3 Context dilution and error cascade failure modes | 4 | Explained |
| §3 Every hop is another LLM call (delegation depth cost) | 4 | Explained |
| §5 No debug flag; reconstructing a prompt from profile + f-string | 4 | Explained (folded in as a coda, same "what agents receive" theme) |
| §4 Both gates are deterministic Python string checks, not a second LLM call | 5 | Explained |
| §4 Gate 1 position (post-tool-call) and Gate 2 position (final-answer) | 5 | Explained |
| §4 Why no pre-tool-call gate is needed here; where that gate type would earn its keep | 5 | Explained |
| §4 Behavior vs. governance distinction, bridge to Module 8 | 5 | Explained |
| §4 Next layers: input validation and a Reviewer output schema; the safe failure direction | 5 | Explained |
| §6 note: a model that ignores think:false breaks the YES/NO gate | 5 | Explained |
| §6 Baseline run | 6 | Explained |
| §6 Variant A — temperature raised, 3 repeats, outcome stable, format held, severity and cause drifted | 6 | Explained |
| §6 Variant B — gate bypassed, wrong runbook, APPROVED in six of six runs | 6 | Explained |
| §6 Comparison table takeaway: the gate, not temperature, pins the outcome | 6 | Explained |
| Four "Where you will use this" takeaways | 7 | Explained |
| Exact bash/docker commands, sed/python patch scripts, teardown steps | — | Deferred to the written deep-dive page itself — narration points learners there rather than narrating shell syntax aloud, per skill guidance not to narrate every character of a command |

## Verification flags

- All temperature values (0, 0.2, 0.9), the five-call cost count, and the Variant A/B outcomes are taken directly from the source deep-dive page's own captured transcripts and code excerpts — no new claims were introduced.
- Variant B's payments restart command and the "approved in six of six runs" claim are both stated in the source as an actual observed run on this image with `qwen3.5:2b` — narrated as such, not generalized into "this always happens."
- The source explicitly flags that `qwen3.5:2b`-scale variance is illustrative of the mechanism, not a universal temperature recipe — this caveat is preserved in Video 6 rather than dropped.
