---
sidebar_position: 2
title: 'Lab: Multi-Agent Incident Crew'
---

# Lab: Multi-Agent Incident Crew

> **What you build:** A four-agent crew (Triage → Investigator → Fixer → Reviewer) running in a single container, sharing one Ollama model endpoint and the ChromaDB knowledge base from M6. You will run two incidents — one that gets APPROVED, one that gets REJECTED/escalated — and understand the relevance gate that makes the difference.

**Prerequisites:** `qwen2.5:1.5b` and `nomic-embed-text` pulled in Ollama; the M6 ChromaDB data (or the crew will ingest the runbooks fresh).

```bash
ollama pull qwen2.5:1.5b
ollama pull nomic-embed-text
```

---

## Step 1 — Read the agent profiles

The crew lives in `labs/m7/crew/profiles/`. Each agent is a single Markdown file — its entire system prompt.

```bash
cat labs/m7/crew/profiles/triage.md
```

```
# Triage

**Role:** Incident triager. You read an incoming incident report and classify it in one line:
which Acme subsystem it concerns (payments, database, web/checkout, on-call) and its severity
(SEV1 critical / SEV2 major / SEV3 minor). Output exactly: `AREA: <area> | SEV: <n> | <one-line summary>`.
Be terse. Do not propose fixes — that's the Investigator's and Fixer's job.
```

```bash
cat labs/m7/crew/profiles/investigator.md
```

```
# Investigator

**Role:** Incident investigator. Given a triaged incident, you use the **Acme runbook knowledge base**
(agentic RAG) to find the relevant runbook. Report the single most relevant runbook passage verbatim.
If no runbook covers it, say `NO RUNBOOK FOUND`. Do not invent procedures. Do not run commands — you
only gather the relevant runbook for the Fixer.
```

```bash
cat labs/m7/crew/profiles/fixer.md
```

```
# Fixer

**Role:** Remediation engineer. Given the incident and the runbook passage the Investigator found,
propose the **single exact command** to run, quoted from the runbook. Output: one short sentence of
intent, then the command in a fenced block. If the Investigator found no runbook, say you cannot
propose a fix. Never invent commands not in the runbook.
```

```bash
cat labs/m7/crew/profiles/reviewer.md
```

```
# Reviewer

**Role:** Change reviewer and safety gate. Given the incident and the Fixer's proposed command, decide
whether it is safe and matches the runbook. Output exactly one of:
- `APPROVED: <one-line reason>` — if the command is a non-destructive, runbook-backed remediation.
- `REJECTED: <one-line reason>` — if it is destructive (delete/drop/wipe), not backed by a runbook, or
  touches secrets/security.
You are the human-in-the-loop's proxy: when in doubt, REJECT.
```

Notice the shape: each profile is a tight, single-purpose role description. The Triage agent knows nothing about runbooks; the Investigator knows nothing about approvals; the Reviewer knows nothing about retrieval. Narrow profiles produce reliable outputs on a small model.

---

## Step 2 — Skim crew.py

The glue script is the whole crew in ~100 lines. Three things to look for:

```bash
cat labs/m7/crew/crew.py
```

**Shared model endpoint.** Every `llm()` call goes to the same `OLLAMA_BASE_URL`. There is no per-agent model — all four agents share one `qwen2.5:1.5b` instance.

**Sequential pipeline.** `run()` calls Triage, then Investigator (with RAG), then Fixer, then Reviewer. Each function's output is a Python string passed to the next call. No framework, no state machine — just four Python calls in order.

**Relevance gate.** This is the key pattern. After the Investigator retrieves the nearest chunk from ChromaDB, the script asks the model a separate yes/no question:

```python
relevant = llm(f"Incident: {incident}\n\nCandidate runbook passage:\n{candidate}\n\n"
               f"Does this passage directly address THIS incident? Answer ONLY YES or NO.",
               profile("investigator"), temperature=0).upper().startswith("YES")
```

If the model answers NO, `runbook` is set to an empty string. The Fixer gets no runbook and declines to act. The Reviewer auto-rejects. This single check is what prevents the crew from proposing the payments runbook for a Kafka outage.

---

## Step 3 — Start ChromaDB

The Investigator uses ChromaDB as its knowledge base. Start it before running the crew.

```bash
cd labs/m7
docker compose up -d chromadb
```

**Expected output:**

```
[+] Running 2/2
 ✔ Network m7_default  Created
 ✔ Container chromadb  Started
```

:::note[Re-running this lab reuses the old data]

`docker compose up` silently attaches to an existing `m7_chroma_data` volume if one is already present
from a previous run — you will not get a fresh ingest. For a clean slate, run `docker compose down -v`
first, then bring it back up.

:::

---

## Step 4 — Run the approve path (503 incident)

Submit a checkout incident that has a runbook in the knowledge base.

```bash
docker compose run --rm crew "The checkout page is returning HTTP 503 errors for all users."
```

**Expected output:**

```
[crew] Acme Incident Crew: Triage -> Investigator -> Fixer -> Reviewer (4 profiles, one shared model: qwen2.5:1.5b)

======================================================================
INCIDENT: The checkout page is returning HTTP 503 errors for all users.
======================================================================

[TRIAGE]      AREA: web/checkout | SEV: SEV3 | Checkout service is down or misconfigured.

[INVESTIGATOR] ## Checkout 503 errors  (retrieved the exact runbook via RAG)

[FIXER]       kubectl scale deploy/web --replicas=5 -n prod   (quoted from the runbook)

[REVIEWER]    APPROVED: non-destructive, runbook-backed remediation ...

======================================================================
OUTCOME: APPROVED — ready for a human to apply
```

On a small model like `qwen2.5:1.5b`, exact wording varies run to run — the `AREA:`/`SEV:` labels may
drop or the retrieved runbook excerpt may run longer than shown above. Judge the run by the stage
markers and the final `OUTCOME:` line, not the exact prose.

Walk through what happened:

1. **Triage** classified the incident as `web/checkout | SEV3` in one line, at temperature 0.
2. **Investigator** embedded the incident text, queried ChromaDB, and retrieved the checkout runbook chunk. The relevance gate confirmed the passage addresses this incident.
3. **Fixer** quoted the exact `kubectl scale` command from the runbook. It did not invent anything.
4. **Reviewer** checked the command: non-destructive (a scale, not a delete), verbatim from the runbook. APPROVED.

The output is a vetted recommendation, not an executed action. A human engineer sees APPROVED and decides whether to run the command.

---

## Step 5 — Run the escalate path (Kafka incident)

Now submit an incident that has no runbook in the knowledge base.

```bash
docker compose run --rm crew "The Kafka event streaming cluster has stopped processing messages."
```

**Expected output:**

```
[crew] Acme Incident Crew: Triage -> Investigator -> Fixer -> Reviewer (4 profiles, one shared model: qwen2.5:1.5b)

======================================================================
INCIDENT: The Kafka event streaming cluster has stopped processing messages.
======================================================================

[TRIAGE]      AREA: Kafka | SEV: 3 | Event streaming cluster stalled.

[INVESTIGATOR] NO RUNBOOK FOUND — the knowledge base has no runbook for this incident. Escalate.

[FIXER]       I cannot propose a fix: no runbook covers this incident.

[REVIEWER]    REJECTED: no runbook-backed fix exists; escalate to a human on-call engineer.

======================================================================
OUTCOME: REJECTED — escalate
```

As with Step 4, the exact labels and wording (`AREA:`/`SEV:`, the summary sentence) can vary or drop
on a small model — judge by the stage markers and final `OUTCOME:` line.

The relevance gate is why this works correctly. ChromaDB's nearest-neighbour retrieval returned *some* chunk — it always does. The gate asked the model: *does this passage address a Kafka message-processing failure?* The answer was NO. The runbook variable was set to empty. The Fixer declined. The Reviewer rejected.

Without the gate, the crew would have proposed the payments runbook for a Kafka outage — a real failure mode caught during validation. The Reviewer alone is not sufficient: it checks the Fixer's command against the runbook, but if the Fixer received a wrong runbook and quoted from it faithfully, the Reviewer would have seen a command that matched the (wrong) runbook and approved it. The gate catches the mismatch before the Fixer ever acts.

---

## Step 6 — Containerised run

The compose service builds the crew as a single image: four profiles + `crew.py`, ~50 MB. The `Dockerfile` is just a handful of lines (`FROM`, `WORKDIR`, two `COPY`s, `ENTRYPOINT`):

```dockerfile
FROM python:3.12-slim
WORKDIR /app
COPY crew/ ./crew/
COPY docs/ ./docs/
ENTRYPOINT ["python", "crew/crew.py"]
```

All four agents run inside that one container. Agents are cheap — they are Python functions. The model runs natively on the host; the container connects over `host.docker.internal:11434`.

You can also run the payments scenario to see a second APPROVED path:

```bash
docker compose run --rm crew "The payments service is throwing connection errors."
```

**Expected output:**

```
[TRIAGE] AREA: Payments | SEV: 3 ...  ->  [FIXER] kubectl rollout restart deploy/payments -n prod
[REVIEWER] APPROVED ...   OUTCOME: APPROVED
```

---

## CrewAI framework variant

The declarative crew above is the default: no dependencies, works on a 1.5B model, fits any laptop. When you need role-based orchestration, dynamic task delegation, or the structure that a framework provides, **CrewAI** is the go-to choice.

The reference repository [`gouravshah/compose-for-agents`](https://github.com/gouravshah/compose-for-agents) — specifically its `crew-ai/` directory — shows a CrewAI crew defined in `agents.yaml` and `tasks.yaml`. This is optional external reading; nothing in this lab requires cloning it. To run it anywhere — not just on Docker Desktop with Docker Model Runner — two ports are needed.

### Port 1: Docker Model Runner → native Ollama

The reference repo uses Docker Model Runner (DMR) via the Compose `models:` block:

```yaml
models:
  gemma3:
    model: ai/gemma3:4B-Q4_0
    context_size: 8192
```

DMR is Docker Desktop-only. To run on any machine with Ollama, delete the `models:` block entirely and set the agents' environment variables to point at native Ollama:

```yaml
services:
  agents:
    environment:
      - OPENAI_BASE_URL=http://host.docker.internal:11434/v1
      - OPENAI_MODEL_NAME=qwen2.5
```

Ollama's `/v1` endpoint is OpenAI-compatible, so CrewAI's `openai` client talks to it without modification.

### Port 2: supergateway → ToolHive

The reference repo uses `supergateway` to wrap the DuckDuckGo MCP server with an SSE transport. ToolHive is the portable alternative — it manages MCP servers as isolated containers on any machine:

```bash
thv run duckduckgo
```

ToolHive starts the DuckDuckGo MCP server, wraps it with network isolation, and exposes it at a local endpoint. Point the agents' `MCP_SERVER_URL` environment variable at the ToolHive endpoint instead of the `supergateway` service. Remove the `mcp-gateway` service block from the compose file.

:::note[Why CrewAI wants a bigger model]

CrewAI's role-based orchestration involves more complex message routing and delegation logic than the four-call sequential pipeline above. A 1.5B model can struggle with the internal coordination prompts. The reference repo defaults to `gemma3:4B` (~4 GB). Use the declarative crew for laptop demos; use CrewAI when the structure is worth the larger model requirement.

:::

---

## Troubleshooting

:::warning[Small-model determinism]

If Triage or Reviewer outputs vary between runs, set `temperature=0` explicitly for those calls. The declarative crew already does this; if you extend it, keep classification and safety-gate calls at temperature 0. For generation tasks (Fixer, Investigator summary), `temperature=0.2` works well.

If the 1.5B model produces garbled output for a particular incident, bump to `qwen2.5:3b` by setting `LLM_MODEL=qwen2.5:3b` in the compose environment or exporting it before running.

:::

:::warning[Relevance gate tuning]

The gate prompt — "Does this passage directly address THIS incident? Answer ONLY YES or NO." — is calibrated for `qwen2.5:1.5b`. If you switch models and find the gate is too strict (rejecting valid runbooks) or too loose (passing irrelevant ones), adjust the prompt to be more specific about what "directly addresses" means for your knowledge base.

:::

---

## Step 7 — Tear down

The crew ran with `--rm`, but `chromadb` is still up (it has `restart: unless-stopped`). Stop it and
remove the network from `labs/m7/`:

```bash
docker compose down
```

**Expected output:**
```
[+] Running 2/2
 ✔ Container chromadb   Removed
 ✔ Network m7_default   Removed
```

Your native Ollama keeps running — it's shared by every module. This keeps your 16 GB laptop's
footprint flat.

---

## What's next

Module 8 hardens and ships the crew: adding structured output schemas, retry logic, and a production-grade review workflow. The four profiles and one shared model stay the same; the infrastructure around them gets production-ready.

---

## Go deeper

Your Incident Crew works — but *why* temperature 0 for Triage? What actually
stops an agent from looping forever? The [Deep Dive (Part 2)](./deep-dive.md)
opens the hood: every knob this crew sets, where its guardrails live in code,
and two live experiments — one that shows what higher temperature does, and one
that shows exactly what breaks when you remove a gate.
