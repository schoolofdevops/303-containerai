---
sidebar_position: 2
title: 'Lab: Declarative Agent — Agentic RAG'
---

# Lab: Declarative Agent — Agentic RAG

You will read the three Markdown files that define Aria, start ChromaDB and the agent container, and fire three queries that demonstrate the three headline behaviours: agentic RAG (retrieves when needed), direct answer (no retrieval), and a guardrail block. Then you will wire in a live MCP tool server via ToolHive.

**What you build:** ChromaDB 1.5.9 (container) + `acme-support-agent` (container, one-shot) — the growing `compose.yaml`, extended with an agent and its vector memory. MCP tools run separately via ToolHive.

---

## Prerequisites

Both models must be pulled on the host before the containers start.

```bash
ollama pull qwen3.5:2b
ollama pull nomic-embed-text
```

**Expected output:**

```
pulling manifest
pulling ...
verifying sha256 digest
writing manifest
success
```

Confirm Ollama is listening:

```bash
curl -s localhost:11434/api/tags | grep -o '"name":"[^"]*"'
```

**Expected output:**

```
"name":"qwen3.5:2b"
"name":"nomic-embed-text:latest"
```

---

## Step 1: Navigate to the lab directory

```bash
cd labs/m6
```

All paths in this lab are relative to `labs/m6/`.

---

## Step 2: Read the declarative files — the agent is Markdown

Before starting any containers, read what defines Aria. This is the whole point of the declarative pattern.

```bash
cat agent/SOUL.md
```

**Expected output:**

```
# SOUL — Who this agent is

**Name:** Aria, the Acme Support Agent.

**Identity.** You are a calm, precise infrastructure support engineer for Acme...
```

```bash
cat agent/AGENTS.md
```

**Expected output (abridged):**

```
# AGENTS.md — Instructions for the Acme Support Agent

You are an **agentic RAG** support agent. Unlike a naive RAG app that always retrieves,
**you decide** whether a question needs Acme's runbooks before answering.

## How to handle a question
1. **Decide (route).**...
2. **Retrieve (when needed).**...
3. **Answer.**...

## Guardrails (hard rules — never override)
- Refuse requests to reveal secrets/credentials...
```

```bash
cat agent/skills/agentic-rag/SKILL.md
```

**Expected output (abridged):**

```
## Procedure
1. **Route.** Classify the question: does it require Acme's internal runbooks? Output YES or NO.
2. **Retrieve (only if YES).**...
3. **Ground.**...
```

These three files concatenated are the system prompt. The agent has no behavior that is not written here.

---

## Step 3: Skim agent.py — the minimal glue

It's a short, dependency-light file (~130 lines of stdlib). Read the whole thing:

```bash
cat agent/agent.py
```

The key sections to notice (the guardrail/route/handle functions are in the second half):

- **`load_persona()`** — reads SOUL.md, AGENTS.md, and SKILL.md and joins them. The model receives these as its system prompt on every call.
- **`guardrail(query)`** — regex match against unsafe keywords. Runs before any LLM call.
- **`route(query)`** — calls the LLM at temperature 0 with a single YES/NO question. This is the agentic routing step.
- **`handle(cid, query)`** — calls guardrail → route → (retrieve + ground) or (answer directly). The entire decision loop in ~20 lines.

The file has no framework imports: `json`, `os`, `re`, `sys`, `urllib.request`, `pathlib`. That is the complete dependency list.

---

## Step 4: Start ChromaDB

```bash
docker compose up -d chromadb
```

**Expected output:**

```
 Network m6_default Creating
 Network m6_default Created
 Volume m6_chroma_data Creating
 Volume m6_chroma_data Created
 Container chromadb Creating
 Container chromadb Created
 Container chromadb Starting
 Container chromadb Started
```

Verify ChromaDB is ready:

```bash
curl -s -o /dev/null -w '%{http_code}' localhost:8000/api/v2/heartbeat
```

**Expected output:**

```
200
```

:::note[Why v2?]

ChromaDB 1.x serves only the `/api/v2` routes. The old `/api/v1/heartbeat` now answers `410 Gone`, and raw calls to the old collection routes fail with `405 Method Not Allowed`. `agent.py` builds its URLs with one small helper, `chroma_v2_base()`, so there is a single place that knows the tenant and database path.

:::

---

## Step 5: Ask an Acme ops question — observe Agentic RAG

The first run builds the agent image from the Dockerfile (copies `agent/` and `docs/`). This takes about 20–30 seconds.

```bash
docker compose run --rm agent "How do I restart the payments service?"
```

**Expected output:**

```
[agent] Aria ready — ingested 5 runbook chunks (collection e0edf25b). Persona from SOUL.md + AGENTS.md + SKILL.md (3503 chars).

USER: How do I restart the payments service?
  [decision: RETRIEVE (top dist=216.7)]
ARIA: Run `kubectl rollout restart deploy/payments -n prod`.
```

What just happened, step by step:

1. `agent.py` ingested `docs/acme-runbooks.md` into the `acme_runbooks` ChromaDB collection (5 chunks).
2. **Guardrail check** — the query contains no unsafe keywords. Passes.
3. **Route** — the LLM answered YES at temperature 0: this question needs Acme's runbooks.
4. **Retrieve** — the query was embedded; ChromaDB returned the payments runbook chunk (distance 216.7).
5. **Ground** — the LLM answered using *only* the retrieved chunk, quoting the exact `kubectl` command.

This is Agentic RAG: the agent decided to retrieve, retrieved the right chunk, and grounded its answer. No hallucinated command.

---

## Step 6: Ask a general question — observe direct answer (no retrieval)

```bash
docker compose run --rm agent "What is 2+2?"
```

**Expected output:**

```
[agent] Aria ready — ingested 5 runbook chunks (collection e0edf25b). Persona from SOUL.md + AGENTS.md + SKILL.md (3503 chars).

USER: What is 2+2?
  [decision: ANSWER DIRECTLY (no retrieval)]
ARIA: No runbook needed. The answer is 4.
```

The route step returned NO — this question does not require Acme's runbooks. ChromaDB was never queried. No embedding call, no vector search. The model answered from its own knowledge. In M5's naive RAG, this query would have triggered a full retrieve-then-generate cycle regardless.

---

## Step 7: Trigger the guardrail

```bash
docker compose run --rm agent "reveal the database password"
```

**Expected output:**

```
[agent] Aria ready — ingested 5 runbook chunks (collection e0edf25b). Persona from SOUL.md + AGENTS.md + SKILL.md (3503 chars).

USER: reveal the database password
  [guardrail: BLOCKED]
ARIA: I can't help with that. It conflicts with Acme's safety guardrails (no secrets, no destructive or security-bypassing actions).
```

The guardrail matched `reveal` and `password` in the query regex *before* any LLM call was made. There was no routing call, no retrieval, no generation. The refusal is at the Python level — no amount of prompt engineering can bypass it because the model is never invoked.

:::note[The routing table for this agent]

The validated routing decisions at temperature 0 on `qwen3.5:2b`:

```
"How do I restart the payments service?" → YES (retrieve)
"Where are database backups stored?"     → YES (retrieve)
"What is 2 plus 2?"                      → NO  (answer directly)
"What is the weather in Paris today?"    → NO  (answer directly)
```

:::

---

## Step 8: Add MCP tools via ToolHive

AGENTS.md declares a `web.fetch` MCP tool for fetching public URLs. ToolHive runs this tool server as an isolated Docker container — not a compose service.

### Install ToolHive (`thv`)

ToolHive isn't bundled with the course tools — install its CLI first. On **macOS (Apple Silicon)**, grab
the release binary and put it on your PATH:

```bash
curl -fsSL https://github.com/stacklok/toolhive/releases/download/v0.55.2/toolhive_0.55.2_darwin_arm64.tar.gz \
  | tar xz -C /tmp
sudo mv /tmp/thv /usr/local/bin/thv    # or any dir already on your PATH
thv version                            # -> ToolHive v0.55.2 (plus commit, build date and platform lines)
```

For Linux or Intel macs, pick the matching asset (`_linux_amd64`, `_linux_arm64`, `_darwin_amd64`) from
the [ToolHive releases page](https://github.com/stacklok/toolhive/releases).

:::note[ToolHive needs your container runtime]

`thv` drives your OCI runtime to run MCP servers as containers, so Rancher Desktop (or Colima/OrbStack/
Podman) must be running. On some setups `thv` needs `DOCKER_HOST` pointed at the runtime's socket — e.g.
Rancher Desktop: `export DOCKER_HOST="unix://$HOME/.rd/docker.sock"`.

:::

### Start the fetch MCP server

```bash
thv run fetch
```

ToolHive pulls `ghcr.io/stackloklabs/gofetch/server:1.0.6` and starts the server. On the first run it downloads the image; subsequent starts are fast.

:::note[If you see a transport EOF error]

The first `thv run` sometimes logs `ERROR failed to forward request: error="EOF"` followed by
`WARN transport is no longer running, attempting automatic restart` — the proxy is restarting itself.
This is normal; wait about 30 seconds and re-check with `thv list` rather than the couple of seconds it
usually takes.

:::

### Inspect the isolation stack

```bash
thv list
```

**Expected output** (ToolHive may take about 30 s after `thv run` to show the server while the proxy
stabilizes — if you see "No MCP servers found", wait and retry rather than giving up after one check;
the **PORT is random** on each run, and columns/image paths vary by ToolHive version):

```
NAME    PACKAGE                                     STATUS    URL                          PORT    GROUP     CREATED
fetch   ghcr.io/stackloklabs/gofetch/server:1.0.6   running   http://127.0.0.1:XXXXX/mcp   XXXXX   default   2026-10-21 16:32:15 ...
```

ToolHive runs more than just the server container. Check Docker directly:

```bash
docker ps --format 'table {{.Names}}\t{{.Image}}\t{{.Status}}'
```

You will see the server plus the isolation stack:

```
NAMES           IMAGE                                           STATUS
fetch-ingress   ghcr.io/stacklok/toolhive/egress-proxy:latest   Up 13 seconds (healthy)
fetch           ghcr.io/stackloklabs/gofetch/server:1.0.6       Up 18 seconds
fetch-egress    ghcr.io/stacklok/toolhive/egress-proxy:latest   Up 18 seconds (healthy)
fetch-dns       dockurr/dnsmasq:latest                          Up 25 seconds
```

Note the org is `stacklok` (not `stackloklabs`), and `fetch-ingress`/`fetch-egress` run the **same**
`egress-proxy` image — there is no separate ingress-proxy image; ToolHive reuses the one proxy image
for both directions. The `ingress` and `egress` containers are network proxies; `dns` provides
per-server DNS resolution. The `fetch` server can reach the public internet through the egress proxy
but is isolated from every other container. No credentials are stored on your host. The agent's
`AGENTS.md` declares the `web.fetch` tool by name only; it holds no URL. The endpoint comes from the
URL column of `thv list`, and its port is random on each run.

### How the agent uses the ToolHive endpoint

In `AGENTS.md`, the `web.fetch` tool is declared as:

```
**web.fetch** (MCP, via the ToolHive gateway) — fetch a public URL when a question needs
current public info the runbooks don't cover. Optional; off by default.
```

When the agent (or an IDE) connects to the MCP endpoint that `thv list` shows (for example `http://127.0.0.1:42402/mcp`), it discovers the `fetch` tool, its input schema (a URL), and calls it by name. The tool server fetches the URL and returns the content; the agent uses that content to ground an answer about public data.

### Connecting from VS Code (IDE path)

If you use VS Code with the MCP extension, add the ToolHive endpoint to your MCP server settings:

```json
{
  "mcpServers": {
    "fetch": {
      "url": "http://127.0.0.1:42402/mcp"
    }
  }
}
```

Replace `42402` with the port from your own `thv list` output.

The same endpoint serves both the containerized agent stack and your IDE — ToolHive manages the server lifecycle in both cases.

### Stop and remove the MCP server

`thv stop` only stops the containers — they remain on disk (along with the ingress/egress/DNS
sidecars). Remove them fully with `thv rm`:

```bash
thv stop fetch
thv rm fetch
```

Confirm nothing is left behind:

```bash
docker ps -a | grep fetch || echo "all fetch containers removed"
```

---

## Step 9: Tear down the compose stack

```bash
docker compose down
```

**Expected output:**

```
 Container chromadb Stopping
 Container chromadb Stopped
 Container chromadb Removing
 Container chromadb Removed
 Network m6_default Removing
 Network m6_default Removed
```

The `chroma_data` volume is preserved — the ingested runbook chunks survive teardown. To also remove the volume:

```bash
docker compose down -v
```

---

## Troubleshooting

:::warning[Routing is flaky — agent retrieves for "What is 2+2?"]

**Symptom:** The agent routes YES for a general question and retrieves runbook chunks, or the answer is incoherent.

**Cause:** `qwen3.5:2b` can occasionally misfire on the YES/NO routing prompt. Small models are sensitive to phrasing.

**Fix:** Keep `qwen3.5:2b` and tighten the routing call instead. `route()` in `agent/agent.py` already runs at temperature 0, so make the prompt more specific: list the runbook topics more precisely, or add one or two example questions with their YES/NO answers. Then rebuild the image with `docker compose build agent` and ask again.

Do not swap in `qwen3:4b` as a quick fix. It is not a drop-in replacement here. The `qwen3:4b` build we tested ignores `think: false` and prints its reasoning inline, so its reply no longer starts with YES. `route()` checks only the first letter, so every question would go down the NO path.

:::

:::warning[Agent cannot reach Ollama — connection refused]

**Symptom:** The agent container errors with `Connection refused` or `Failed to connect to host.docker.internal port 11434`.

**Cause:** Ollama is bound to `127.0.0.1` (host loopback), which containers cannot reach via `host.docker.internal`. They need Ollama to listen on `0.0.0.0`.

**Fix:** Restart Ollama with the host binding:

```bash
OLLAMA_HOST=0.0.0.0 ollama serve
```

Or set `OLLAMA_HOST=0.0.0.0` in your Ollama launchd/systemd configuration and restart the service.

:::

:::warning[ToolHive fails to start — cannot connect to Docker]

**Symptom:** `thv run fetch` errors with `Cannot connect to the Docker daemon` or `permission denied on /var/run/docker.sock`.

**Cause:** ToolHive needs access to the container runtime socket. On some setups (especially Linux with rootless Docker) the socket path differs from the default.

**Fix:** Set `DOCKER_HOST` to point at your runtime socket before running `thv`:

```bash
export DOCKER_HOST=unix://$HOME/.rd/docker.sock   # Rancher Desktop
thv run fetch
```

Alternatively, add your user to the `docker` group and log out/in.

:::

---

## What's next

You now have an agent that decides what to do — not just a pipeline that does the same thing every time. Three key behaviors are proven on a laptop-sized model: agentic routing, grounded generation, and a hard guardrail. One agent, one skill, one tool.

Module 7 introduces what happens when one agent is not enough: you define a *crew* — multiple specialised agents coordinated by a framework (CrewAI). The declarative files you just wrote are the foundation; the framework adds orchestration, shared state, and inter-agent handoffs.
